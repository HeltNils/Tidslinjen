import http from 'node:http';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeResults, resultRoute } from './results.mjs';
import './username-policy.js';

const root = dirname(fileURLToPath(import.meta.url));
const deriveKey = promisify(scrypt);
const digest = value => createHash('sha256').update(value).digest('hex');
const SESSION_SECONDS = 8 * 60 * 60;
const BLOCKED_USERNAME_TERMS = globalThis.UsernamePolicy.blockedTerms;
const usernameKeyFor = globalThis.UsernamePolicy.keyFor;
const publicFiles = new Set([
  'index.html', 'styles.css', 'height-backgrounds.css', 'archive-theme.css', 'events.js', 'journey.js', 'journey.css',
  'assets/journey/earth.png', 'assets/journey/land.png', 'assets/journey/ocean.png',
  'assets/journey/space.png', 'assets/journey/civilization.png', 'assets/journey/rustic.png',
  'learning.js', 'background.js', 'game.js', 'account.js', 'account.css', 'dog-car.jpg',
  'pwa.js', 'service-worker.js', 'manifest.webmanifest', 'app-icon.svg', 'username-policy.js', 'nils-hybrid.png'
]);
const types = {
  html: 'text/html', js: 'text/javascript', css: 'text/css', jpg: 'image/jpeg', png: 'image/png',
  svg: 'image/svg+xml', webmanifest: 'application/manifest+json'
};
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function createApp({ databasePath = join(root, 'data', 'accounts.sqlite'), publicOrigin,
  production = false, now = Date.now } = {}) {
  if (publicOrigin) {
    const parsed = new URL(publicOrigin);
    if (parsed.origin !== publicOrigin) throw new Error('PUBLIC_ORIGIN må være en origin uten sti eller avsluttende /.');
    if (production && parsed.protocol !== 'https:') throw new Error('Produksjon krever HTTPS.');
  } else if (production) throw new Error('PUBLIC_ORIGIN må angis i produksjon.');
  if (databasePath !== ':memory:') mkdirSync(dirname(resolve(databasePath)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, username TEXT NOT NULL, username_key TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at INTEGER NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS attempts (
      key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
    ) STRICT;
  `);
  initializeResults(db);
  let hashesInFlight = 0;
  const secure = publicOrigin?.startsWith('https:') || false;
  const cookieName = secure ? '__Host-tidslinjen_session' : 'tidslinjen_session';
  const cookie = (token, age = SESSION_SECONDS) =>
    `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure ? '; Secure' : ''}`;

  function tokenFrom(req) {
    const value = (req.headers.cookie || '').split(';').map(part => part.trim())
      .find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
    return /^[a-f0-9]{64}$/.test(value || '') ? digest(value) : '';
  }
  function rateLimit(key, max, duration) {
    db.prepare('DELETE FROM attempts WHERE expires_at <= ?').run(now());
    const hashedKey = digest(key);
    const record = db.prepare('SELECT count FROM attempts WHERE key = ?').get(hashedKey);
    if (record?.count >= max) throw new HttpError(429, 'For mange forsøk. Vent litt og prøv igjen.');
    db.prepare(`INSERT INTO attempts VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = count + 1`).run(hashedKey, now() + duration);
  }
  async function hashPassword(password, salt) {
    if (hashesInFlight >= 2) throw new HttpError(503, 'Serveren er opptatt. Prøv igjen om litt.');
    hashesInFlight++;
    try {
      return await deriveKey(password, Buffer.from(salt, 'hex'), 64,
        { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 });
    } finally { hashesInFlight--; }
  }
  function issueSession(req, res, user) {
    db.prepare('DELETE FROM sessions WHERE expires_at <= ? OR token_hash = ?').run(now(), tokenFrom(req));
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(digest(token), user.id, now() + SESSION_SECONDS * 1000);
    res.setHeader('Set-Cookie', cookie(token));
    return { user: { username: user.username } };
  }
  function json(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  }
  async function body(req) {
    if (req.headers['content-type']?.split(';')[0] !== 'application/json') {
      throw new HttpError(415, 'Forespørselen må være JSON.');
    }
    const data = await new Promise((resolveBody, reject) => {
      let bytes = 0;
      const chunks = [];
      req.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > 4096) { req.pause(); reject(new HttpError(413, 'Forespørselen er for stor.')); }
        else chunks.push(chunk);
      });
      req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
    try {
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      return parsed;
    } catch { throw new HttpError(400, 'Ugyldig forespørsel.'); }
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    if (production) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000');
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
    }
    const requestOrigin = req.headers.origin;
    const localDevOrigin = !production &&
      ['http://localhost:8080', 'null'].includes(requestOrigin);
    if (localDevOrigin) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname.startsWith('/api/')) {
        if (req.method === 'OPTIONS' && localDevOrigin) {
          res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
          return res.end();
        }
        if (pathname === '/api/leaderboard' || pathname === '/api/stats' || pathname === '/api/rounds' || pathname.startsWith('/api/rounds/')) {
          const expected = publicOrigin || `http://127.0.0.1:${server.address().port}`;
          if (req.method !== 'GET' && requestOrigin !== expected && !localDevOrigin) throw new HttpError(403, 'Forespørselen kommer fra feil side.');
          const user = db.prepare(`SELECT users.id FROM sessions JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.expires_at > ?`).get(tokenFrom(req), now());
          const result = await resultRoute({ db, pathname, method: req.method, user, now, body: () => body(req), rateLimit });
          return json(res, 200, result);
        }
        if (pathname === '/api/session' && req.method === 'GET') {
          const user = db.prepare(`SELECT users.username FROM sessions JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.expires_at > ?`).get(tokenFrom(req), now());
          return json(res, 200, { user: user || null });
        }
        if (!['/api/register', '/api/login', '/api/logout'].includes(pathname)) throw new HttpError(404, 'Ikke funnet.');
        if (req.method !== 'POST') throw new HttpError(405, 'Metoden støttes ikke.');
        const expected = publicOrigin || `http://127.0.0.1:${server.address().port}`;
        if (requestOrigin !== expected && !localDevOrigin) throw new HttpError(403, 'Forespørselen kommer fra feil side.');
        if (pathname === '/api/logout') {
          db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenFrom(req));
          res.setHeader('Set-Cookie', cookie('', 0));
          return json(res, 200, { user: null });
        }
        rateLimit('ip:' + req.socket.remoteAddress, 120, 15 * 60 * 1000);
        const input = await body(req);
        const username = typeof input.username === 'string' ? input.username.normalize('NFKC').trim() : '';
        const key = usernameKeyFor(username);
        const password = input.password;
        const validUsername = pathname === '/api/register'
          ? /^\p{Lu}\p{L}{2,23}$/u.test(username)
          : /^\p{L}{3,24}$/u.test(username);
        if (!validUsername) {
          throw new HttpError(400, 'Brukernavn må ha 3–24 bokstaver og starte med stor bokstav.');
        }
        if (BLOCKED_USERNAME_TERMS.some(term => key.includes(usernameKeyFor(term)))) {
          throw new HttpError(400, 'Dette brukernavnet kan ikke brukes. Velg et nøytralt navn.');
        }
        if (typeof password !== 'string' || [...password].length > 128 || [...password].length < 4) {
          throw new HttpError(400, 'Passordet må ha 4–128 tegn.');
        }
        if (pathname === '/api/register') {
          rateLimit('register:' + req.socket.remoteAddress, 40, 60 * 60 * 1000);
          const salt = randomBytes(16).toString('hex');
          const hash = await hashPassword(password, salt);
          let result;
          try {
            result = db.prepare('INSERT INTO users (username, username_key, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)')
              .run(username, key, hash.toString('hex'), salt, now());
          } catch (error) {
            if (error.errcode === 2067 || error.message.includes('UNIQUE constraint')) {
              throw new HttpError(409, 'Brukernavnet er opptatt. Velg et annet.');
            }
            throw error;
          }
          return json(res, 201, issueSession(req, res, { id: Number(result.lastInsertRowid), username }));
        }
        rateLimit('login:' + key, 10, 15 * 60 * 1000);
        const user = db.prepare('SELECT * FROM users WHERE username_key = ?').get(key);
        const hash = await hashPassword(password, user?.salt || '00'.repeat(16));
        const expectedHash = user ? Buffer.from(user.password_hash, 'hex') : Buffer.alloc(64);
        if (!timingSafeEqual(hash, expectedHash) || !user) throw new HttpError(401, 'Feil brukernavn eller passord.');
        db.prepare('DELETE FROM attempts WHERE key = ?').run(digest('login:' + key));
        return json(res, 200, issueSession(req, res, user));
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw new HttpError(405, 'Metoden støttes ikke.');
      const file = pathname === '/' ? 'index.html' : pathname.slice(1);
      const testFile = !production && ['tests/browser.html', 'tests/account-browser.html'].includes(file);
      if (!publicFiles.has(file) && !testFile) throw new HttpError(404, 'Ikke funnet.');
      const contents = await readFile(join(root, file));
      res.writeHead(200, { 'Content-Type': `${types[file.split('.').pop()]}; charset=utf-8`, 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : contents);
    } catch (error) {
      if (error.status === 413) res.setHeader('Connection', 'close');
      if (error.status === 429 || error.status === 503) res.setHeader('Retry-After', error.status === 429 ? '900' : '5');
      if (!error.status) console.error('Serverfeil:', error.code || 'internal');
      json(res, error.status || 500, { error: error.status ? error.message : 'Serverfeil. Prøv igjen senere.' });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.on('close', () => db.close());
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const production = process.env.NODE_ENV === 'production';
  const server = createApp({ production, publicOrigin: process.env.PUBLIC_ORIGIN,
    databasePath: process.env.DATABASE_PATH || join(root, 'data', 'accounts.sqlite') });
  const port = Number(process.env.PORT || 3000);
  server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Tidslinjen: ${process.env.PUBLIC_ORIGIN || `http://127.0.0.1:${port}`}`));
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}
