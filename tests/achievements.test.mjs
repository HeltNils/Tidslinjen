import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const A = createRequire(import.meta.url)("../achievements.js");

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test("medal thresholds: 50 % bronse, 75 % sølv, 100 % gull", () => {
  assert.equal(A.tierFor(49, 100), null);
  assert.equal(A.tierFor(50, 100), "bronze");
  assert.equal(A.tierFor(74, 100), "bronze");
  assert.equal(A.tierFor(75, 100), "silver");
  assert.equal(A.tierFor(99, 100), "silver");
  assert.equal(A.tierFor(100, 100), "gold");
  assert.equal(A.tierFor(0, 0), null);
  assert.equal(A.tierFor(5, 4), null);
});

test("99,6 % rundes ikke opp til gull", () => {
  assert.equal(A.tierFor(249, 250), "silver");
});

test("evaluate oppgraderer bare og beholder beste prosent", () => {
  let entries = {};
  const bronze = A.evaluate(entries, "grade9", 21, 41);
  assert.equal(bronze.upgraded, true);
  entries = { grade9: bronze.entry };
  const worse = A.evaluate(entries, "grade9", 10, 41);
  assert.equal(worse.tier, null);
  assert.equal(worse.entry, null);
  const same = A.evaluate(entries, "grade9", 22, 41);
  assert.equal(same.upgraded, false);
  assert.equal(same.entry.tier, "bronze");
  const silver = A.evaluate(entries, "grade9", 32, 41);
  assert.equal(silver.previous, "bronze");
  assert.equal(silver.entry.tier, "silver");
  const lower = A.evaluate({ grade9: silver.entry }, "grade9", 21, 41);
  assert.equal(lower.entry.tier, "silver");
  assert.equal(lower.entry.bestPercent, silver.entry.bestPercent);
  assert.equal(A.evaluate({}, "ukjent", 10, 10), null);
});

test("lokal kontolagring er per bruker og ikke tilgjengelig uten bruker", () => {
  const storage = memoryStorage();
  assert.equal(A.record("Elev", "junior", 10, 10, storage).tier, "gold");
  assert.equal(A.read("elev", storage).junior.tier, "gold");
  assert.deepEqual(A.read("Annen", storage), {});
  assert.equal(A.record("Elev", "all", 1, 10, storage).entry, null);
  assert.equal(A.read("Elev", storage).all, undefined);
});
