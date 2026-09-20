import { readFileSync, writeFileSync } from 'node:fs';

// One editable source; generated copies also work offline and in Supabase.
const root = new URL('../', import.meta.url);
const bank = JSON.parse(readFileSync(new URL('username-bank.json', root), 'utf8'));
if (bank.version !== 1 || !Array.isArray(bank.blockedTerms) || !bank.blockedTerms.length) {
  throw new Error('Invalid username bank');
}
const normalized = new Set();
for (const term of bank.blockedTerms) {
  if (typeof term !== 'string' || !/^[\p{L}\p{N}]+$/u.test(term) || term !== term.toLowerCase()) {
    throw new Error(`Invalid blocked term: ${term}`);
  }
  const key = term.normalize('NFKD').replace(/\p{M}/gu, '');
  if (normalized.has(key)) throw new Error(`Duplicate blocked term: ${term}`);
  normalized.add(key);
}
const quoted = bank.blockedTerms.map(term => `'${term}'`);
const files = [
  ['username-policy.js', /const blockedTerms = Object\.freeze\(\[[\s\S]*?\]\);/,
    `const blockedTerms = Object.freeze([\n${quoted.map(term => `    ${term}`).join(',\n')}\n  ]);`],
  ['supabase-username-policy.sql', /unnest\(array\[[\s\S]*?\]\)/,
    `unnest(array[\n${quoted.map(term => `        ${term}`).join(',\n')}\n      ])`]
];
for (const [file, pattern, replacement] of files) {
  const path = new URL(file, root);
  const source = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  if (!pattern.test(source)) throw new Error(`Missing blocklist in ${file}`);
  const updated = source.replace(pattern, replacement);
  if (process.argv.includes('--check')) {
    if (updated !== source) throw new Error(`Run node scripts/sync-username-bank.mjs: ${file} is out of date`);
  } else writeFileSync(path, updated);
}
console.log(`${bank.blockedTerms.length} blocked terms: browser, server and SQL lists synchronized.`);
