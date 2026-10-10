import { createRequire } from "node:module";

const Achievements = createRequire(import.meta.url)("./achievements.js");
const MAX_SCORE = 1000000;

export function initializeResults(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS round_results (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      points INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      wrong INTEGER NOT NULL,
      total INTEGER NOT NULL,
      mode TEXT NOT NULL,
      created_at INTEGER NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS achievements (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scope TEXT NOT NULL,
      tier TEXT NOT NULL,
      best_percent INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, scope)
    ) STRICT;
    CREATE INDEX IF NOT EXISTS round_results_leaderboard
      ON round_results(points DESC, correct DESC, wrong ASC, created_at ASC);
  `);
}

function validateRound(input) {
  const integers = ["points", "correct", "wrong", "total"];
  const isTimelineMode = typeof input?.mode === "string" && input.mode.startsWith("timeline:");
  if (!input || typeof input !== "object" ||
      integers.some(key => !Number.isInteger(input[key]) || input[key] < 0) ||
      input.points > MAX_SCORE ||
      (isTimelineMode ? input.total < input.correct : input.total !== input.correct + input.wrong) ||
      typeof input.mode !== "string" || !["timeline", "exact", "ten", "century", "millennium"].some(mode => input.mode === `${mode}:lives:all`)) {
    throw Object.assign(new Error("Ugyldig rundesultat."), { status: 400 });
  }
}

function leaderboard(db) {
  return db.prepare(`SELECT users.username, round_results.points, round_results.correct,
      round_results.wrong, round_results.total, round_results.mode
    FROM round_results JOIN users ON users.id = round_results.user_id
    WHERE round_results.mode LIKE '%:lives:all'
      AND round_results.id = (
        SELECT best.id FROM round_results AS best
        WHERE best.user_id = round_results.user_id
          AND best.mode LIKE '%:lives:all'
        ORDER BY best.total DESC, best.wrong ASC, best.correct DESC, best.created_at ASC
        LIMIT 1
      )
    ORDER BY total DESC, wrong ASC, correct DESC, round_results.created_at ASC LIMIT 5`).all();
}

function achievementsFor(db, userId) {
  const rows = db.prepare("SELECT scope, tier, best_percent FROM achievements WHERE user_id = ?").all(userId);
  return Object.fromEntries(rows.map(row => [row.scope, { tier: row.tier, bestPercent: row.best_percent }]));
}

export async function resultRoute({ db, pathname, method, user, now, body }) {
  if (pathname === "/api/achievements") {
    if (!user) throw Object.assign(new Error("Du må være logget inn."), { status: 401 });
    if (method === "GET") return { achievements: achievementsFor(db, user.id) };
    if (method !== "POST") throw Object.assign(new Error("Metoden støttes ikke."), { status: 405 });
    const input = await body();
    const valid = Achievements.isScope(input.scope) && Number.isInteger(input.correct) &&
      Number.isInteger(input.total) && input.total >= 1 && input.total <= 1000 &&
      input.correct >= 0 && input.correct <= input.total;
    if (!valid) throw Object.assign(new Error("Ugyldig achievement."), { status: 400 });
    // The medal is derived on the server; only upgrades are stored.
    const result = Achievements.evaluate(achievementsFor(db, user.id), input.scope, input.correct, input.total);
    if (result.entry) {
      db.prepare(`INSERT INTO achievements (user_id, scope, tier, best_percent, updated_at) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, scope) DO UPDATE SET tier = excluded.tier,
        best_percent = excluded.best_percent, updated_at = excluded.updated_at`)
        .run(user.id, input.scope, result.entry.tier, result.entry.bestPercent, now());
    }
    return { tier: result.tier, previous: result.previous, upgraded: result.upgraded, percent: result.percent,
      achievements: achievementsFor(db, user.id) };
  }
  if (pathname === "/api/leaderboard") {
    if (method !== "GET") throw Object.assign(new Error("Metoden støttes ikke."), { status: 405 });
    return { entries: leaderboard(db) };
  }
  if (pathname === "/api/stats") {
    if (method !== "GET") throw Object.assign(new Error("Metoden støttes ikke."), { status: 405 });
    if (!user) throw Object.assign(new Error("Du må være logget inn."), { status: 401 });
    return db.prepare(`SELECT COUNT(*) AS rounds, COALESCE(SUM(correct), 0) AS correct,
      COALESCE(SUM(wrong), 0) AS wrong, COALESCE(MAX(points), 0) AS bestPoints
      FROM round_results WHERE user_id = ?`).get(user.id);
  }
  if (pathname !== "/api/rounds") {
    throw Object.assign(new Error("Ikke funnet."), { status: 404 });
  }
  if (method !== "POST") throw Object.assign(new Error("Metoden støttes ikke."), { status: 405 });
  if (!user) throw Object.assign(new Error("Du må være logget inn for å lagre resultatet."), { status: 401 });
  const input = await body();
  validateRound(input);
  db.prepare(`INSERT INTO round_results (user_id, points, correct, wrong, total, mode, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(user.id, input.points, input.correct, input.wrong,
    input.total, input.mode, now());
  return { saved: true, entries: leaderboard(db) };
}