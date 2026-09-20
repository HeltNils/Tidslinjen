import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import '../username-policy.js';

test('Blocked names, capitalization, accents and embedded terms', () => {
  for (const name of ['Hitler', 'HITLER', 'hitler', 'Hítler', 'SuperHitler', 'Ｈｉｔｌｅｒ', 'Nazist',
    'Nigger', 'NIGGER', 'Níggér', 'SuperNigger', 'Faggot', 'Fággot', 'NeGer']) {
    assert.equal(UsernamePolicy.isBlocked(name), true, name);
  }
  for (const name of ['Nils', 'Åse', 'Bjørn', 'Ingrid', 'Kristian', 'HomoSapiens', 'Gay', 'TransElev']) {
    assert.equal(UsernamePolicy.errorFor(name), '', name);
  }
  assert.ok(UsernamePolicy.errorFor('Elev123'));
  assert.ok(UsernamePolicy.errorFor('nils'));
  assert.equal(UsernamePolicy.errorFor('nils', false), '');
});

test('Every blocked term is rejected, including inside a longer name', () => {
  for (const term of UsernamePolicy.blockedTerms) {
    for (const name of [term.toUpperCase(), `Elev${term}`]) {
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
  for (const username of ['Hitler', 'Hítler', 'SuperHitler', 'Nigger', 'Níggér', 'SuperNigger', 'Faggot']) {
    element('accountUsername').value = username;
    element('accountPassword').value = 'abcdef';
    await element('accountForm').listeners.submit({ preventDefault() {} });
    assert.match(element('accountMessage').textContent, /ikke tillatt/);
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
