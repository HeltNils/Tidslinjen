import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('events.js', root), 'utf8');
const context = { window: {} };
runInNewContext(source, context, { filename: 'events.js' });

const cards = context.window.TIMELINE_EVENTS.filter(card => !card.specialChance && !card.fixedVariant);
if (!cards.length) throw new Error('The duel card bank is empty.');

const ids = new Set();
for (const card of cards) {
  if (typeof card.bankId !== 'string' || !card.bankId.trim() || ids.has(card.bankId) ||
      typeof card.title !== 'string' || !card.title.trim() ||
      !Number.isInteger(card.year) || card.year === 0 || Math.abs(card.year) > 1_000_000 ||
      ![1, 2, 3].includes(card.difficulty)) {
    throw new Error(`Invalid duel card: ${card.bankId || card.title || 'unknown'}`);
  }
  if (card.timelineDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(card.timelineDate) ||
        Number(card.timelineDate.slice(0, 4)) !== card.year ||
        !Number.isFinite(Date.parse(`${card.timelineDate}T00:00:00Z`)) ||
        new Date(`${card.timelineDate}T00:00:00Z`).toISOString().slice(0, 10) !== card.timelineDate)) {
    throw new Error(`Invalid timelineDate for ${card.bankId}`);
  }
  ids.add(card.bankId);
}

const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const values = cards.map(card =>
  `  (${quote(card.bankId)}, ${quote(card.title)}, ${card.year}, ${card.difficulty}, ${card.timelineDate ? quote(card.timelineDate) : 'null'})`
).join(',\n');
const generated = `-- BEGIN GENERATED DUEL CARD CATALOG
insert into public.duel_cards (card_id, title, year, difficulty, timeline_date)
values
${values}
on conflict (card_id) do update set
  title = excluded.title,
  year = excluded.year,
  difficulty = excluded.difficulty,
  timeline_date = excluded.timeline_date;

delete from public.duel_cards
where card_id not in (${cards.map(card => quote(card.bankId)).join(', ')});
-- END GENERATED DUEL CARD CATALOG`;

const migrationUrl = new URL('supabase-matchmaking.sql', root);
const migration = readFileSync(migrationUrl, 'utf8').replaceAll('\r\n', '\n');
const marker = /-- BEGIN GENERATED DUEL CARD CATALOG[\s\S]*?-- END GENERATED DUEL CARD CATALOG/;
if (!marker.test(migration)) throw new Error('Missing generated card catalogue markers in supabase-matchmaking.sql.');
const updated = migration.replace(marker, generated);

if (process.argv.includes('--check')) {
  if (updated !== migration) throw new Error('The duel card catalogue is out of date; run node scripts/sync-duel-card-bank.mjs.');
} else {
  writeFileSync(migrationUrl, updated);
}

console.log(`${cards.length} duel cards: event bank and Supabase SQL catalogue synchronized.`);
