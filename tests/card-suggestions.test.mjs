import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from '../server.mjs';
import { initializeResults, resultRoute } from '../results.mjs';

test('Supabase-vurdering er bundet til Nils-kontoen', () => {
  const migration = readFileSync(new URL('../supabase-card-suggestions.sql', import.meta.url), 'utf8');
  assert.match(migration, /lower\(auth\.users\.email\) = 'nils@tidslinjen\.local'/);
  assert.match(migration, /for select to authenticated\s+using \(public\.is_card_suggestion_admin\(\)\)/);
  assert.match(migration, /for update to authenticated\s+using \(public\.is_card_suggestion_admin\(\)\)/);
  assert.match(migration, /for delete to authenticated\s+using \(public\.is_card_suggestion_admin\(\)\)/);
  assert.match(migration, /drop constraint if exists card_suggestions_image_data_check/);
  assert.match(migration, /add constraint card_suggestions_image_data_signature_check check/);
  assert.match(migration, /grant insert \(user_id, title, year, description, image_data\)/);
  assert.match(migration, /year is not null and year <> 0 and year between -1000000 and 1000000/);
  assert.match(migration, /image\/\(png;base64,iVBORw0KGgo\|jpeg;base64,\/9j\/\|webp;base64,UklGR\)/);
});

test('Vurderingskort viser hele bildet uten å beskjære det', () => {
  const styles = readFileSync(new URL('../card-suggestions-review.css', import.meta.url), 'utf8');
  assert.match(styles, /\.review-card \.review-image img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(styles, /\.review-card \.review-image img\s*\{[^}]*max-width:\s*100%/s);
  assert.match(styles, /\.review-card \.review-image img\s*\{[^}]*max-height:/s);
});

test('Eksisterende SQLite-køer bevarer forslag uten år, men lar dem ikke godkjennes', async () => {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY);
    INSERT INTO users (id) VALUES (1);
    CREATE TABLE card_suggestions (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_mime TEXT,
      image_data BLOB,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );
  `);
  initializeResults(database);
  const columns = database.prepare('PRAGMA table_info(card_suggestions)').all();
  assert.ok(columns.some(column => column.name === 'year'));
  const legacy = database.prepare(`INSERT INTO card_suggestions
    (user_id, title, description, created_at) VALUES (1, 'Gammelt forslag', 'Beskrivelse', 1)`).run();
  await assert.rejects(resultRoute({
    db: database,
    pathname: `/api/card-suggestions/${legacy.lastInsertRowid}/approve`,
    method: 'POST',
    user: { id: 1, username_key: 'nils' },
    now: () => 1,
    body: async () => ({}),
    rateLimit: () => {}
  }), error => error.status === 400 && error.message.includes('mangler årstall'));
  assert.equal(database.prepare('SELECT status FROM card_suggestions WHERE id = ?').get(legacy.lastInsertRowid).status, 'pending');
  database.close();
});

test('Kortforslag krever innlogging, valideres og lagres til vurdering', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'tidslinjen-card-suggestions-'));
  const databasePath = join(folder, 'accounts.sqlite');
  const server = createApp({ databasePath });
  await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const post = (data, cookie = '', requestOrigin = origin) => fetch(origin + '/api/card-suggestions', {
    method: 'POST',
    headers: {
      Origin: requestOrigin,
      'Content-Type': 'application/json',
      Cookie: cookie
    },
    body: JSON.stringify(data)
  });
  const register = async username => {
    const response = await fetch(origin + '/api/register', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'test passord' })
    });
    assert.equal(response.status, 201);
    return response.headers.get('set-cookie').split(';')[0];
  };
  const reviewPost = (path, cookie) => fetch(origin + path, {
    method: 'POST',
    headers: { Origin: origin, Cookie: cookie }
  });
  let cookie = '';
  let adminCookie = '';
  let database;
  try {
    assert.equal((await fetch(origin + '/card-suggestion.html')).status, 200);

    const guest = await post({ title: 'Hendelse', description: 'Beskrivelse' });
    assert.equal(guest.status, 401);

    cookie = await register('Korttester');

    assert.equal((await post({ title: 'Hendelse', description: 'Beskrivelse' }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', year: 0, description: 'Beskrivelse' }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', year: 1945.5, description: 'Beskrivelse' }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', year: 1000001, description: 'Beskrivelse' }, cookie)).status, 400);
    assert.equal((await post({ title: '', year: 1945, description: 'Beskrivelse' }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', year: 1945, description: ' ' }, cookie)).status, 400);
    assert.equal((await post({
      title: 'Hendelse',
      year: 1945,
      description: 'Beskrivelse',
      imageDataUrl: 'data:image/svg+xml;base64,PHN2Zy8+'
    }, cookie)).status, 400);
    assert.equal((await post({
      title: 'Hendelse',
      year: 1945,
      description: 'Beskrivelse',
      imageDataUrl: 'data:image/png;base64,SGVsbG8='
    }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', year: 1945, description: 'Beskrivelse' }, cookie, 'https://example.org')).status, 403);

    const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j+S8AAAAASUVORK5CYII=';
    const submitted = await post({
      title: '  Første månelanding  ',
      year: 1969,
      description: '  Mennesker landet på månen.  ',
      imageDataUrl
    }, cookie);
    assert.equal(submitted.status, 200);
    assert.deepEqual(await submitted.json(), { submitted: true });

    database = new DatabaseSync(databasePath);
    const saved = database.prepare('SELECT id, title, year, description, image_mime, image_data, status FROM card_suggestions').get();
    assert.equal(saved.title, 'Første månelanding');
    assert.equal(saved.year, 1969);
    assert.equal(saved.description, 'Mennesker landet på månen.');
    assert.equal(saved.image_mime, 'image/png');
    assert.ok(saved.image_data instanceof Uint8Array);
    assert.equal(Buffer.from(saved.image_data).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(saved.status, 'pending');
    database.close();
    database = null;

    assert.equal((await fetch(origin + '/api/card-suggestions', { headers: { Cookie: cookie } })).status, 403);
    assert.equal((await reviewPost(`/api/card-suggestions/${saved.id}/approve`, cookie)).status, 403);
    assert.equal((await reviewPost(`/api/card-suggestions/${saved.id}/remove`, cookie)).status, 403);

    adminCookie = await register('Nils');
    const queue = await fetch(origin + '/api/card-suggestions', { headers: { Cookie: adminCookie } });
    assert.equal(queue.status, 200);
    const queued = await queue.json();
    assert.equal(queued.suggestions.length, 1);
    assert.equal(queued.suggestions[0].id, saved.id);
    assert.equal(queued.suggestions[0].year, 1969);
    assert.equal(queued.suggestions[0].imageDataUrl, imageDataUrl);
    const approved = await reviewPost(`/api/card-suggestions/${saved.id}/approve`, adminCookie);
    assert.equal(approved.status, 200);
    assert.deepEqual(await approved.json(), { approved: true });

    for (let index = 2; index <= 5; index++) {
      assert.equal((await post({
        title: `Forslag ${index}`,
        year: -753,
        description: 'En kort historisk beskrivelse.'
      }, cookie)).status, 200);
    }
    const pending = await (await fetch(origin + '/api/card-suggestions', {
      headers: { Cookie: adminCookie }
    })).json();
    assert.equal(pending.suggestions.length, 4);
    const removed = await reviewPost(`/api/card-suggestions/${pending.suggestions[0].id}/remove`, adminCookie);
    assert.equal(removed.status, 200);
    assert.deepEqual(await removed.json(), { removed: true });

    assert.equal((await post({
      title: 'For mange forslag',
      year: 2020,
      description: 'En kort historisk beskrivelse.'
    }, cookie)).status, 429);
    assert.equal((await fetch(origin + `/api/card-suggestions/${saved.id}/approve`, {
      headers: { Cookie: adminCookie }
    })).status, 405);
    const databaseAfterReview = new DatabaseSync(databasePath);
    assert.equal(databaseAfterReview.prepare('SELECT status FROM card_suggestions WHERE id = ?').get(saved.id).status, 'accepted');
    assert.equal(databaseAfterReview.prepare('SELECT COUNT(*) AS count FROM card_suggestions WHERE status = ?').get('pending').count, 3);
    databaseAfterReview.close();
  } finally {
    database?.close();
    const closed = new Promise(resolveClose => server.close(resolveClose));
    server.closeAllConnections();
    await closed;
    rmSync(folder, { recursive: true, force: true });
  }
});
