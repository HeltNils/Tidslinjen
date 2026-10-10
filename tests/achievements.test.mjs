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
});

test("99,6 % rundes ikke opp til gull", () => {
  assert.equal(A.tierFor(249, 250), "silver");
});

test("medaljer lagres og kan bare oppgraderes", () => {
  const storage = memoryStorage();
  assert.equal(A.record("grade9", 20, 41, storage).tier, null);
  assert.deepEqual(A.read(storage), {});
  assert.equal(A.record("grade9", 21, 41, storage).upgraded, true);
  const worse = A.record("grade9", 20, 41, storage);
  assert.equal(worse.tier, null);
  assert.equal(A.read(storage).grade9.tier, "bronze");
  const silver = A.record("grade9", 32, 41, storage);
  assert.equal(silver.previous, "bronze");
  assert.equal(silver.tier, "silver");
  const lower = A.record("grade9", 21, 41, storage);
  assert.equal(lower.upgraded, false);
  assert.equal(A.read(storage).grade9.tier, "silver");
  assert.equal(A.record("grade9", 41, 41, storage).tier, "gold");
  assert.equal(A.read(storage).grade9.bestPercent, 100);
});

test("ukjent trinn registreres ikke, og trinnene er uavhengige", () => {
  const storage = memoryStorage();
  assert.equal(A.record("unknown", 10, 10, storage), null);
  A.record("junior", 10, 10, storage);
  assert.equal(A.read(storage).junior.tier, "gold");
  assert.equal(A.read(storage).grade8, undefined);
});
