import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from '../server.mjs';

test('Kontoer, innlogging og sikkerhetsgrenser', async t => {
  const prefix = join(tmpdir(), 'tidslinjen-auth-test-');
  const folder = mkdtempSync(prefix);
  const databasePath = join(folder, 'accounts.sqlite');
  let clock = Date.now();
  let server;
  let origin;
  const start = async () => {
    server = createApp({ databasePath, now: () => clock });
    await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
    origin = `http://127.0.0.1:${server.address().port}`;
  };
  const stop = async () => {
    const closed = new Promise(resolveClose => server.close(resolveClose));
    server.closeAllConnections();
    await closed;
  };
  await start();
  const password = 'to grønne trær i skogen';
  const post = (path, data, cookie = '', extraHeaders = {}) => fetch(origin + path, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie, ...extraHeaders },
    body: JSON.stringify(data)
  });
  const session = cookie => fetch(origin + '/api/session', { headers: { Cookie: cookie || '' } }).then(response => response.json());
  const cookieFrom = response => response.headers.get('set-cookie').split(';')[0];
  let cookie;
  try {
    await t.test('Gjest kan åpne spillet, uten konto', async () => {
      assert.equal((await fetch(origin)).status, 200);
      assert.deepEqual(await session(), { user: null });
    });
    await t.test('Registrering krever bare brukernavn og passord', async () => {
      const response = await post('/api/register', { username: 'ElevÆØÅ', password });
      assert.equal(response.status, 201);
      assert.deepEqual(await response.json(), { user: { username: 'ElevÆØÅ' } });
      assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      cookie = cookieFrom(response);
      assert.deepEqual(await session(cookie), { user: { username: 'ElevÆØÅ' } });
    });
    await t.test('Ingen dubletter med andre store/små bokstaver', async () => {
      assert.equal((await post('/api/register', { username: 'ElevÆØÅ', password })).status, 409);
    });
    await t.test('Innloggede runder lagres og topplisten viser topp fem', async () => {
      const result = await post('/api/rounds', {
        points: 1234, correct: 8, wrong: 2, total: 10, mode: 'timeline'
      }, cookie);
      const savedBody = await result.json();
      assert.equal(result.status, 200);
      assert.deepEqual(savedBody.saved, true);
      const leaderboard = await fetch(origin + '/api/leaderboard');
      assert.equal(leaderboard.status, 200);
      const entries = (await leaderboard.json()).entries;
      assert.equal(entries.length, 1);
      assert.deepEqual(entries[0], {
        username: 'ElevÆØÅ', points: 1234, correct: 8, wrong: 2, total: 10, mode: 'timeline'
      });
    });
    await t.test('Passord er saltede hasher og sesjoner er hashet', async () => {
      await post('/api/register', { username: 'ElevTo', password });
      const db = new DatabaseSync(databasePath);
      const users = db.prepare('SELECT * FROM users').all();
      assert.equal(users.length, 2);
      assert.ok(users.every(user => user.password_hash.length === 128 && user.password_hash !== password));
      assert.notEqual(users[0].salt, users[1].salt);
      assert.notEqual(users[0].password_hash, users[1].password_hash);
      assert.ok(db.prepare('SELECT token_hash FROM sessions').all().every(row => !cookie.includes(row.token_hash)));
      db.close();
    });
    await t.test('Avviser feil passord og ukjent bruker likt', async () => {
      const wrong = await post('/api/login', { username: 'ElevÆØÅ', password: 'et helt annet passord' });
      const missing = await post('/api/login', { username: 'IngenElev', password: 'et helt annet passord' });
      assert.equal(wrong.status, 401);
      assert.equal(missing.status, 401);
      assert.deepEqual(await wrong.json(), await missing.json());
    });
    await t.test('Innlogging roterer sesjonen', async () => {
      const old = cookie;
      const response = await post('/api/login', { username: 'elevæøå', password }, old);
      assert.equal(response.status, 200);
      cookie = cookieFrom(response);
      assert.notEqual(cookie, old);
      assert.deepEqual(await session(old), { user: null });
    });
    await t.test('Konto og sesjon overlever omstart', async () => {
      await stop();
      await start();
      assert.deepEqual(await session(cookie), { user: { username: 'ElevÆØÅ' } });
    });
    await t.test('Utlogging ugyldiggjør sesjonen', async () => {
      const response = await post('/api/logout', {}, cookie);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
      assert.deepEqual(await session(cookie), { user: null });
    });
    await t.test('Falske og utløpte sesjoner avvises', async () => {
      assert.deepEqual(await session('tidslinjen_session=' + 'a'.repeat(64)), { user: null });
      const response = await post('/api/login', { username: 'ElevTo', password });
      clock += 8 * 60 * 60 * 1000 + 1;
      assert.deepEqual(await session(cookieFrom(response)), { user: null });
    });
    await t.test('CSRF og uønskede metoder avvises', async () => {
      assert.equal((await post('/api/register', { username: 'Angriper', password }, '', { Origin: 'https://example.org' })).status, 403);
      assert.equal((await fetch(origin + '/api/logout', { method: 'POST' })).status, 403);
      assert.equal((await fetch(origin + '/api/register')).status, 405);
      assert.equal((await post('/api/register', {}, '', { 'Content-Type': 'text/plain' })).status, 415);
    });
    await t.test('Validerer felter og JSON', async () => {
      for (const data of [{ username: 'ab', password }, { username: '<script>', password },
        { username: 'test', password }, { username: 'Test Navn', password }, { username: 'Test_Navn', password },
        { username: 'Rasisme', password }, { username: 'Homofobi', password }, { username: 'Charlie', password },
        { username: 'Epstein', password },
        { username: 'Test', password: 'abc' }, { username: 'Test', password: 'a'.repeat(129) }, { username: {}, password }]) {
        assert.equal((await post('/api/register', data)).status, 400);
      }
      assert.equal((await post('/api/register', { username: 'Test', password: 'a'.repeat(5000) })).status, 413);
      assert.equal((await fetch(origin + '/api/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    });
    await t.test('Databasen, serverkode og Git kan ikke lastes ned', async () => {
      for (const path of ['/data/accounts.sqlite', '/server.mjs', '/.git/config', '/package.json', '/%2e%2e/server.mjs']) {
        assert.equal((await fetch(origin + path)).status, 404);
      }
    });
    await t.test('Gjentatte passordforsøk begrenses', async () => {
      for (let i = 0; i < 10; i++) assert.equal((await post('/api/login', { username: 'BruteTest', password })).status, 401);
      assert.equal((await post('/api/login', { username: 'BruteTest', password })).status, 429);
      clock += 15 * 60 * 1000 + 1;
      assert.equal((await post('/api/login', { username: 'BruteTest', password })).status, 401);
    });
    await t.test('Produksjon krever eksplisitt HTTPS-origin', () => {
      assert.throws(() => createApp({ production: true, databasePath: ':memory:' }), /PUBLIC_ORIGIN/);
      assert.throws(() => createApp({ production: true, publicOrigin: 'http://example.org', databasePath: ':memory:' }), /HTTPS/);
    });
    await t.test('Produksjonscookie, sikkerhetsheadere og skjulte tester', async () => {
      const production = createApp({ production: true, publicOrigin: 'https://tidslinjen.example', databasePath: ':memory:' });
      await new Promise(done => production.listen(0, '127.0.0.1', done));
      const url = `http://127.0.0.1:${production.address().port}`;
      try {
        const response = await fetch(url + '/api/register', { method: 'POST',
          headers: { Origin: 'https://tidslinjen.example', 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'ProductionTest', password }) });
        assert.equal(response.status, 201);
        assert.match(response.headers.get('set-cookie'), /^__Host-tidslinjen_session=/);
        assert.match(response.headers.get('set-cookie'), /; Secure$/);
        assert.ok(response.headers.get('strict-transport-security'));
        assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
        assert.equal((await fetch(url + '/tests/browser.html')).status, 404);
      } finally {
        const closed = new Promise(done => production.close(done));
        production.closeAllConnections();
        await closed;
      }
    });
  } finally {
    await stop();
    assert.ok(resolve(folder).startsWith(resolve(prefix)));
    rmSync(folder, { recursive: true, force: true });
  }
});
