import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../events.js',import.meta.url),'utf8'),context);
const cards=context.window.TIMELINE_EVENTS;
const review=JSON.parse(readFileSync(new URL('../reviews/user-suggestions-2026-09-20.json',import.meta.url),'utf8'));
test('All reviewed additions and existing references resolve to one card',()=>{
  assert.equal(review.decisions.length,121);
  assert.equal(review.decisions.filter(row=>row.status==='Lagt til').length,14);
  for(const row of review.decisions.filter(row=>row.bankId)) {
    assert.equal(cards.filter(card=>card.bankId===row.bankId).length,1,row.title);
  }
  for(const card of cards.filter(card=>card.suggestionSources?.includes(review.id))) {
    assert.ok(card.sourceLabel && new URL(card.sourceUrl).protocol==='https:');
    assert.equal(card.bookSources,undefined);
  }
  assert.equal(cards.find(card=>card.bankId==='U2').year,1274);
  assert.equal(cards.find(card=>card.bankId==='U5').year,1901);
});
