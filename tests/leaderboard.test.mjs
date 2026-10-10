import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../leaderboard.js', import.meta.url), 'utf8');

function leaderboardContext({ client = null, fetchImpl = async () => { throw new Error('unexpected fetch'); } } = {}) {
  const context = vm.createContext({
    window: { tidslinjenSupabase: client },
    UsernamePolicy: { isBlocked: username => username === 'Blocked' },
    location: { protocol: 'https:', hostname: 'example.com', port: '' },
    fetch: fetchImpl
  });
  vm.runInContext(source, context);
  return context.window.TimelineLeaderboard;
}

test('shared leaderboard deduplicates users, excludes blocked names, and ranks only five', async () => {
  const entries = [
    { username: 'Ada', total: 10, wrong: 3, correct: 7 },
    { username: 'Ada', total: 10, wrong: 1, correct: 8 },
    { username: 'Bo', total: 9, wrong: 2, correct: 7 },
    { username: 'Cy', total: 9, wrong: 1, correct: 8 },
    { username: 'Dee', total: 8, wrong: 1, correct: 7 },
    { username: 'Eli', total: 7, wrong: 1, correct: 6 },
    { username: 'Fox', total: 6, wrong: 0, correct: 6 },
    { username: 'Blocked', total: 100, wrong: 0, correct: 100 }
  ];
  const orders = [];
  const query = {
    select() { return this; },
    like(column, pattern) { assert.equal(column, 'mode'); assert.equal(pattern, '%:lives:all'); return this; },
    order(column, options) {
      orders.push([column, options.ascending]);
      return orders.length === 3 ? Promise.resolve({ data: entries, error: null }) : this;
    }
  };
  const client = { from: table => { assert.equal(table, 'round_results'); return query; } };
  const leaderboard = leaderboardContext({ client });
  const result = await leaderboard.load();

  assert.deepEqual(Array.from(result.entries, entry => entry.username), ['Ada', 'Cy', 'Bo', 'Dee', 'Eli']);
  assert.equal(result.message, 'Felles toppliste for alle spillere.');
  assert.deepEqual(orders, [['total', false], ['wrong', true], ['correct', false]]);
});

test('shared leaderboard reports API failures instead of showing an empty success state', async () => {
  const leaderboard = leaderboardContext({ fetchImpl: async () => ({ ok: false }) });
  const result = await leaderboard.load();

  assert.equal(result.entries, null);
  assert.equal(result.message, 'Topplisten er ikke tilgjengelig akkurat nå.');
});
