import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildDuelTimeline,
  calculateEloChanges,
  compareDuelCards,
  isValidDuelPlacement,
  scoreDuelPlacement
} from '../duel-rules.mjs';

const duelMigration = readFileSync(new URL('../supabase-matchmaking.sql', import.meta.url), 'utf8')
  .replaceAll('\r\n', '\n');
const duelClient = readFileSync(new URL('../matchmaking.js', import.meta.url), 'utf8')
  .replaceAll('\r\n', '\n');
const duelStyles = readFileSync(new URL('../matchmaking.css', import.meta.url), 'utf8')
  .replaceAll('\r\n', '\n');

test('shared duel timeline starts with a visible card and a placement gap on each side', () => {
  assert.deepEqual(buildDuelTimeline(['START']), [
    { type: 'slot', position: 0 },
    { type: 'card', cardId: 'START' },
    { type: 'slot', position: 1 }
  ]);
  assert.deepEqual(buildDuelTimeline([]), [{ type: 'slot', position: 0 }]);
});

test('database seeds new duels and repairs active rooms with no starter card', () => {
  assert.match(duelMigration, /starter_card_id text/);
  assert.match(duelMigration, /starter_card_id = coalesce\(rooms\.timeline_cards\[1\], missing\.fallback_starter_card_id\)/);
  assert.match(duelMigration, /then array\[missing\.fallback_starter_card_id\] else rooms\.timeline_cards/);
  assert.match(duelMigration, /v_deck\[2\], v_deck\[1\],\s+v_deck\[3:/);
  assert.match(duelMigration, /Kampen mangler et startkort/);
});

test('losing the last life ends the duel and awards the win to the opponent', () => {
  const finalLifeLossOne = duelMigration.indexOf('v_lives_one := greatest(0, v_lives_one - 1)');
  const finalLifeLossTwo = duelMigration.indexOf('v_lives_two := greatest(0, v_lives_two - 1)');
  const finishCondition = duelMigration.indexOf('v_finished := v_lives_one <= 0 or v_lives_two <= 0');
  const persistLives = duelMigration.indexOf('player_one_lives = v_lives_one, player_two_lives = v_lives_two');
  const finishRoom = duelMigration.indexOf('perform public._duel_finish_room(p_room_id, v_winner)', persistLives);
  assert.ok(finalLifeLossOne >= 0 && finalLifeLossTwo > finalLifeLossOne && finishCondition > finalLifeLossTwo);
  assert.match(duelMigration, /if v_lives_one <= 0 then\s+v_winner := v_room\.player_two_id;\s+elsif v_lives_two <= 0 then\s+v_winner := v_room\.player_one_id;/);
  assert.ok(persistLives > finishCondition && finishRoom > persistLives);
});

test('duel results distinguish wins and losses and report Elo changes', () => {
  assert.match(duelClient, /DU VANT! ARENAENS MESTER!/);
  assert.match(duelClient, /DU TAPTE DUELLEN/);
  assert.match(duelClient, /formatEloChange\('Din Elo'/);
  assert.match(duelClient, /formatEloChange\(room\.player_one_name/);
  assert.match(duelClient, /showVictoryFireworks\(\)/);
  assert.match(duelClient, /Uformell kamp – ingen Elo-endring/);
});

test('duel timeline scrolls sideways and Elo leaderboard exposes only the top ten', () => {
  assert.match(duelStyles, /\.duel-timeline-scroll\{[^}]*overflow-x:auto/);
  assert.match(duelClient, /timelineScroller\.scrollLeft \+= event\.deltaY/);
  assert.match(duelMigration, /create or replace function public\.duel_top_ratings\(\)[\s\S]*?where ratings\.matches > 0[\s\S]*?limit 10;/);
  assert.match(duelMigration, /grant execute on function public\.duel_top_ratings\(\) to anon, authenticated;/);
  assert.match(duelClient, /rpc\('duel_top_ratings'\)/);
  assert.match(duelClient, /rows\.slice\(0, 10\)/);
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
