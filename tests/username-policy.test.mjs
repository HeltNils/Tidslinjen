import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import '../username-policy.js';

test('The editable bank is the exact source of the runtime list', () => {
  const bank = JSON.parse(readFileSync(new URL('../username-bank.json', import.meta.url), 'utf8'));
  assert.deepEqual(UsernamePolicy.blockedTerms, bank.blockedTerms);
  assert.equal(new Set(bank.blockedTerms.map(UsernamePolicy.keyFor)).size, bank.blockedTerms.length);
});

test('Blocked names, capitalization, accents and embedded terms', () => {
  for (const name of ['Hitler', 'HITLER', 'hitler', 'Hítler', 'SuperHitler', 'Ｈｉｔｌｅｒ', 'Nazist',
    'Nigger', 'NIGGER', 'Níggér', 'SuperNigger', 'Faggot', 'Fággot', 'NeGer']) {
    assert.equal(UsernamePolicy.isBlocked(name), true, name);
  }
  for (const name of ['Nils', 'Åse', 'Bjørn', 'Ingrid', 'Kristian', 'Homosapiens', 'Gay', 'Transelev']) {
    assert.equal(UsernamePolicy.errorFor(name), '', name);
  }
  assert.ok(UsernamePolicy.errorFor('Elev123'));
  assert.ok(UsernamePolicy.errorFor('nils'));
  assert.equal(UsernamePolicy.errorFor('nils', false), '');
});

test('Registration requires exactly one initial capital and letters only', () => {
  for (const name of ['nils', 'NILS', 'NiLs', 'Nils Kristian', ' Nils', 'Nils ', 'Nils\n', 'Nils123',
    'Nils_K', 'Nils-K', 'Nils!', 'Nils😀', 'Nils\u200b', 'ÆØÅ', '']) {
    assert.ok(UsernamePolicy.errorFor(name), name);
  }
  for (const name of ['Ægir', 'Øyvind', 'Åse', 'Émile', 'Nils']) {
    assert.equal(UsernamePolicy.errorFor(name), '', name);
  }
  // Existing mixed-case accounts can still log in.
  assert.equal(UsernamePolicy.errorFor('NilsKristian', false), '');
});

test('Three consecutive identical letters are rejected, including the initial capital', () => {
  for (const name of ['Haaakon', 'Aaa', 'Åååse', 'Æææ', 'Øøø', 'Ééé', 'Nillls', 'Nilllls']) {
    assert.match(UsernamePolicy.errorFor(name), /tre eller flere like bokstaver/, name);
  }
  for (const name of ['Haakon', 'Aase', 'Anne', 'Lille', 'Aal']) {
    assert.equal(UsernamePolicy.errorFor(name), '', name);
  }
  assert.equal(UsernamePolicy.errorFor('Haaakon', false), '');
});

test('Registration allows 12 letters but rejects 13; existing accounts can log in', () => {
  assert.equal(UsernamePolicy.errorFor('Abcdefghijkl'), '');
  assert.match(UsernamePolicy.errorFor('Abcdefghijklm'), /3–12/);
  assert.equal(UsernamePolicy.errorFor('Abcdefghijklm', false), '');
});

test('Every blocked term is rejected, including inside a longer name', () => {
  for (const term of UsernamePolicy.blockedTerms) {
    for (const name of [term.toUpperCase(), term[0].toUpperCase() + term.slice(1), `Elev${term}`]) {
      assert.equal(UsernamePolicy.isBlocked(name), true, name);
      assert.ok(UsernamePolicy.errorFor(name), name);
    }
  }
});

test('Supabase registration is never called for a prohibited username', async () => {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', classList: { toggle() {} }, listeners: {}, focus() {},
      showModal() { this.open = true; }, close() { this.open = false; },
      addEventListener(name, fn) { this.listeners[name] = fn; }
    });
    return elements.get(id);
  };
  const calls = [];
  const context = {
    UsernamePolicy, document: { getElementById: element },
    location: { protocol: 'https:', hostname: 'heltnils.github.io' },
    CustomEvent: class {},
    window: {
      dispatchEvent() {}, SUPABASE_CONFIG: { url: 'https://example.invalid', publishableKey: 'test' },
      supabase: { createClient: () => ({ auth: {
        getSession: async () => ({ data: { session: null } }),
        signUp: async args => {
          calls.push(args);
          return { data: { user: { id: 'test', user_metadata: args.options.data }, session: {} } };
        }
      } }) }
    }
  };
  vm.runInNewContext(readFileSync(new URL('../account.js', import.meta.url), 'utf8'), context);
  element('registerOpen').listeners.click();
  for (const username of ['Hitler', 'Hítler', 'SuperHitler', 'Nigger', 'Níggér', 'SuperNigger', 'Faggot',
    'Pedobear', 'Childlover', 'Extremistking', 'Animallover69', 'NiLs', ' Nils', 'Nils ']) {
    element('accountUsername').value = username;
    element('accountPassword').value = 'abcdef';
    await element('accountForm').listeners.submit({ preventDefault() {} });
    assert.match(element('accountMessage').textContent, /ikke tillatt|stor forbokstav/);
  }
  assert.equal(calls.length, 0);
  element('accountUsername').value = 'Nils';
  element('accountPassword').value = 'abcdef';
  await element('accountForm').listeners.submit({ preventDefault() {} });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.data.username, 'Nils');
});

test('SQL migration includes the entire shared blocklist', () => {
  const sql = readFileSync(new URL('../supabase-username-policy.sql', import.meta.url), 'utf8');
  for (const term of UsernamePolicy.blockedTerms) assert.ok(sql.includes(`'${term}'`), term);
});
