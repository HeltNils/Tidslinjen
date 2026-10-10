import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../events.js', import.meta.url), 'utf8'), context);
vm.runInNewContext(readFileSync(new URL('../learning.js', import.meta.url), 'utf8'), context);
const { TimelineLearning } = context.window;
const events = context.window.TIMELINE_EVENTS;
const event = bankId => events.find(card => card.bankId === bankId);

test('WWII-hendelser med presis dato sorteres innenfor samme år', () => {
  assert.ok(TimelineLearning.compareTimelineEvents(event('UT17'), event('UT18')) < 0);
  assert.ok(TimelineLearning.compareTimelineEvents(event('UT30'), event('UT31')) < 0);
  assert.ok(TimelineLearning.compareTimelineEvents(event('UT28'), event('UT29')) < 0);
  assert.ok(TimelineLearning.compareTimelineEvents(event('UT33'), event('N56')) < 0);
});

test('Hendelser på samme dato kan plasseres i begge rekkefølger', () => {
  const poland = event('UT17');
  const warBegins = event('N55');
  assert.equal(TimelineLearning.compareTimelineEvents(poland, warBegins), 0);
  assert.equal(TimelineLearning.isValidTimelinePlacement([poland], warBegins, 0), true);
  assert.equal(TimelineLearning.isValidTimelinePlacement([poland], warBegins, 1), true);
});

test('Plassering kontrolleres mot alle kort, også forbi udaterte årskort', () => {
  const later = { year: 1945, timelineDate: '1945-08-09' };
  const earlier = { year: 1945, timelineDate: '1945-08-06' };
  const undated = { year: 1945 };
  assert.equal(TimelineLearning.isValidTimelinePlacement([later, undated], earlier, 1), false);
  assert.equal(TimelineLearning.findTimelineInsertionIndex([later, undated], earlier), 0);
});

test('Automatisk sortering bevarer rekkefølgen for samme dato', () => {
  const sorted = TimelineLearning.sortTimelineEvents([
    event('UT18'),
    event('UT17'),
    event('N55'),
    event('UT32')
  ]);
  assert.deepEqual(Array.from(sorted, card => card.bankId), ['UT17', 'N55', 'UT18', 'UT32']);
});

test('Presise datoer valideres mot kalenderen og kortets årstall', () => {
  assert.equal(TimelineLearning.validateEvents(events).length, 0);
  const invalid = [
    { bankId: 'X', year: 1945, timelineDate: '1945-02-30', title: 'Ugyldig dato', difficulty: 1 },
    { bankId: 'Y', year: 1944, timelineDate: '1945-02-04', title: 'Feil år', difficulty: 1 }
  ];
  assert.deepEqual(
    Array.from(TimelineLearning.validateEvents(invalid)),
    ['X: ugyldig timelineDate', 'Y: ugyldig timelineDate']
  );
});
