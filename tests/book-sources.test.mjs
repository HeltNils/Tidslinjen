import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../events.js', import.meta.url), 'utf8'), context);
vm.runInNewContext(readFileSync(new URL('../learning.js', import.meta.url), 'utf8'), context);
const events = context.window.TIMELINE_EVENTS;
const books = JSON.parse(readFileSync(new URL('../books/catalog.json', import.meta.url), 'utf8'));

test('Book references point to known books and valid PDF pages', () => {
  for (const event of events) {
    const seen = new Set();
    for (const source of event.bookSources || []) {
      const book = books.find(book => book.id === source.bookId);
      assert.ok(book, event.bankId);
      assert.ok(!seen.has(source.bookId), `Repeated book on ${event.bankId}`);
      seen.add(source.bookId);
      assert.ok(source.pages.length && source.pdfPages.length);
      assert.ok(source.pages.every(page => Number.isInteger(page) && page > 0));
      assert.ok(source.pdfPages.every(page => Number.isInteger(page) && page > 0 && page <= book.pdfPages));
    }
  }
});

test('Existing agriculture card is reused and new cards have unique identities', () => {
  assert.equal(new Set(events.map(event => event.bankId)).size, events.length);
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
  assert.equal(events.filter(event => event.bankId === 'G1').length, 1);
  assert.equal(events.find(event => event.bankId === 'G1').bookSources[0].bookId, books[0].id);
  assert.equal(events.filter(event => event.bookSources?.some(source => source.bookId === books[0].id)).length, 19);
  for (const id of ['G2', 'N2']) {
    assert.equal(events.filter(event => event.bankId === id).length, 1);
    assert.equal(events.find(event => event.bankId === id).bookSources[0].bookId, books[0].id);
  }
  assert.equal(context.window.TimelineLearning.validateEvents(events).length, 0);
});
