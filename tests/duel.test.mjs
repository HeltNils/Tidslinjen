import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDuelTimeline,
  calculateEloChanges,
  compareDuelCards,
  isValidDuelPlacement,
  scoreDuelPlacement
} from '../duel-rules.mjs';

test('shared duel timeline starts with a visible card and a placement gap on each side', () => {
  assert.deepEqual(buildDuelTimeline(['START']), [
    { type: 'slot', position: 0 },
    { type: 'card', cardId: 'START' },
    { type: 'slot', position: 1 }
  ]);
  assert.deepEqual(buildDuelTimeline([]), [{ type: 'slot', position: 0 }]);
});

test('duel placements reuse chronological ordering, including precise dates', () => {
  const before = { year: 1940 };
  const first = { year: 1945, timelineDate: '1945-05-08' };
  const second = { year: 1945, timelineDate: '1945-09-02' };
  const after = { year: 1946 };
  const timeline = [before, first, second, after];

  assert.equal(compareDuelCards(first, second), -1);
  assert.equal(isValidDuelPlacement(timeline, { year: 1944 }, 1), true);
  assert.equal(isValidDuelPlacement(timeline, { year: 1945, timelineDate: '1945-06-01' }, 2), true);
  assert.equal(isValidDuelPlacement(timeline, { year: 1945, timelineDate: '1945-06-01' }, 1), false);
  assert.equal(isValidDuelPlacement(timeline, { year: 1947 }, -1), false);
});

test('duel scoring keeps the game difficulty and proximity points', () => {
  assert.deepEqual(scoreDuelPlacement({ year: 1905, difficulty: 2 }, [{ year: 1900 }]),
    { base: 200, bonus: 200, total: 400, distance: 5 });
  assert.deepEqual(scoreDuelPlacement({ year: 2000, difficulty: 3 }, [{ year: 1940 }]),
    { base: 300, bonus: 75, total: 375, distance: 60 });
  assert.equal(scoreDuelPlacement({ year: 1, difficulty: 1 }).total, 100);
});

test('Elo changes are zero-sum and account for opponent strength', () => {
  assert.deepEqual(calculateEloChanges(1000, 1000, 1), { one: 16, two: -16 });
  assert.deepEqual(calculateEloChanges(1000, 1000, 0.5), { one: 0, two: 0 });
  const upset = calculateEloChanges(800, 1400, 1);
  const expectedWin = calculateEloChanges(1400, 800, 0);
  assert.ok(upset.one > 30);
  assert.deepEqual(upset, { one: expectedWin.two, two: expectedWin.one });
});

test('Elo rejects invalid results and non-finite ratings', () => {
  assert.throws(() => calculateEloChanges(NaN, 1000, 1), RangeError);
  assert.throws(() => calculateEloChanges(1000, 1000, 2), RangeError);
});
