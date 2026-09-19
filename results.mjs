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
    CREATE INDEX IF NOT EXISTS round_results_leaderboard
      ON round_results(points DESC, correct DESC, wrong ASC, created_at ASC);
  `);
}

function validateRound(input) {
  const integers = ["points", "correct", "wrong", "total"];
  if (!input || typeof input !== "object" ||
      integers.some(key => !Number.isInteger(input[key]) || input[key] < 0) ||
      input.points > MAX_SCORE || input.total !== input.correct + input.wrong ||
      typeof input.mode !== "string" || !["timeline", "exact", "ten", "century", "millennium"].some(mode => input.mode === `${mode}:lives`)) {
    throw Object.assign(new Error("Ugyldig rundesultat."), { status: 400 });
  }
}

function leaderboard(db) {
  return db.prepare(`SELECT users.username, round_results.points, round_results.correct,
      round_results.wrong, round_results.total, round_results.mode
    FROM round_results JOIN users ON users.id = round_results.user_id
    WHERE round_results.mode LIKE '%:lives'
    ORDER BY points DESC, correct DESC, wrong ASC, round_results.created_at ASC LIMIT 5`).all();
}

export async function resultRoute({ db, pathname, method, user, now, body }) {
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