import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from '../server.mjs';

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
  let cookie = '';
  let database;
  try {
    assert.equal((await fetch(origin + '/card-suggestion.html')).status, 200);

    const guest = await post({ title: 'Hendelse', description: 'Beskrivelse' });
    assert.equal(guest.status, 401);

    const registered = await fetch(origin + '/api/register', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Korttester', password: 'test passord' })
    });
    assert.equal(registered.status, 201);
    cookie = registered.headers.get('set-cookie').split(';')[0];

    assert.equal((await post({ title: '', description: 'Beskrivelse' }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', description: ' ' }, cookie)).status, 400);
    assert.equal((await post({
      title: 'Hendelse',
      description: 'Beskrivelse',
      imageDataUrl: 'data:image/svg+xml;base64,PHN2Zy8+'
    }, cookie)).status, 400);
    assert.equal((await post({
      title: 'Hendelse',
      description: 'Beskrivelse',
      imageDataUrl: 'data:image/png;base64,SGVsbG8='
    }, cookie)).status, 400);
    assert.equal((await post({ title: 'Hendelse', description: 'Beskrivelse' }, cookie, 'https://example.org')).status, 403);

    const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j+S8AAAAASUVORK5CYII=';
    const submitted = await post({
      title: '  Første månelanding  ',
      description: '  Mennesker landet på månen.  ',
      imageDataUrl
    }, cookie);
    assert.equal(submitted.status, 200);
    assert.deepEqual(await submitted.json(), { submitted: true });

    database = new DatabaseSync(databasePath);
    const saved = database.prepare('SELECT title, description, image_mime, image_data, status FROM card_suggestions').get();
    assert.equal(saved.title, 'Første månelanding');
    assert.equal(saved.description, 'Mennesker landet på månen.');
    assert.equal(saved.image_mime, 'image/png');
    assert.ok(saved.image_data instanceof Uint8Array);
    assert.equal(Buffer.from(saved.image_data).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(saved.status, 'pending');
    database.close();
    database = null;

    for (let index = 2; index <= 5; index++) {
      assert.equal((await post({
        title: `Forslag ${index}`,
        description: 'En kort historisk beskrivelse.'
      }, cookie)).status, 200);
    }
    assert.equal((await post({
      title: 'For mange forslag',
      description: 'En kort historisk beskrivelse.'
    }, cookie)).status, 429);
    assert.equal((await fetch(origin + '/api/card-suggestions', { headers: { Cookie: cookie } })).status, 405);
  } finally {
    database?.close();
    const closed = new Promise(resolveClose => server.close(resolveClose));
    server.closeAllConnections();
    await closed;
    rmSync(folder, { recursive: true, force: true });
  }
});
