import { buildPopular, parseField, MIN_TOP, MIN_ITEM } from '../lib/popular.js';

const episodes = [
  { id: 'ep280', n: 280, title: 'Listen & Speak Like a Native' },
  { id: 'ep279', n: 279, title: 'Daily Life English Conversation' },
  { id: 'ep232', n: 232, title: 'Stop Losing Time' },
];
const types = [
  { type: 'phrase-pairs', name: 'Phrase Pairs' },
  { type: 'clue-room', name: 'Clue Room' },
  { type: 'listening-gap', name: 'Listening Gap' },
];

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

// ---- the floor: a leader below MIN_TOP must report enough:false ----
const thin = buildPopular({
  counts: { 'phrase-pairs:ep280': 4, 'clue-room:ep279': 3 }, episodes, types,
});
ok('a handful of plays -> enough:false', thin.enough === false, `top was ${thin.episodes[0] && thin.episodes[0].plays}`);

// ---- real traffic ----
const counts = {
  'phrase-pairs:ep280': 30,
  'clue-room:ep280': 12,
  'listening-gap:ep280': 2,      // below MIN_ITEM: must not be listed as a pair
  'phrase-pairs:ep279': 9,
  'clue-room:ep232': 25,
  'phrase-pairs:ep999': 99,      // episode no longer in the catalogue
  'made-up-game:ep280': 80,      // unknown game type
  'malformed-no-colon': 50,
};
const p = buildPopular({ counts, episodes, types });

ok('enough:true once the leader clears the floor', p.enough === true);
ok('episodes ranked by total across game types',
  p.episodes.map((e) => e.id).join(',') === 'ep280,ep232,ep279',
  p.episodes.map((e) => `${e.id}:${e.plays}`).join(' '));
ok('ep280 sums its three games (30+12+2)', p.episodes[0].plays === 44);
ok('episode carries its number and title', p.episodes[0].n === 280 && /Listen/.test(p.episodes[0].title));
ok('games ranked across episodes', p.types[0].type === 'phrase-pairs' && p.types[0].plays === 39,
  p.types.map((t) => `${t.type}:${t.plays}`).join(' '));
ok('game name resolved from the catalogue', p.types[0].name === 'Phrase Pairs');
ok('cross-section leads with the real pair',
  p.pairs[0].type === 'phrase-pairs' && p.pairs[0].id === 'ep280' && p.pairs[0].plays === 30);
ok('a pair below MIN_ITEM is not listed',
  !p.pairs.some((x) => x.type === 'listening-gap'), `MIN_ITEM=${MIN_ITEM}`);

// ---- things that must never reach a card ----
ok('retired episode dropped', !p.episodes.some((e) => e.id === 'ep999') && !JSON.stringify(p).includes('ep999'));
ok('unknown game type dropped', !JSON.stringify(p).includes('made-up-game'));
ok('malformed field dropped', !JSON.stringify(p).includes('malformed'));
ok('total counts only what survived (30+12+2+9+25)', p.total === 78, `got ${p.total}`);

// ---- shape / edges ----
ok('parseField splits on the first colon only',
  JSON.stringify(parseField('phrase-pairs:ep280')) === '{"type":"phrase-pairs","ep":"ep280"}');
ok('parseField rejects a bare word', parseField('nope') === null && parseField(':x') === null);
const empty = buildPopular({});
ok('no data at all is safe', empty.enough === false && empty.episodes.length === 0 && empty.total === 0);
ok('limit is honoured', buildPopular({ counts, episodes, types, limit: 1 }).episodes.length === 1);
ok('ties break deterministically',
  JSON.stringify(buildPopular({ counts: { 'clue-room:ep280': 20, 'phrase-pairs:ep279': 20 }, episodes, types }).episodes)
  === JSON.stringify(buildPopular({ counts: { 'phrase-pairs:ep279': 20, 'clue-room:ep280': 20 }, episodes, types }).episodes));

console.log(bad ? `\n${bad} FAILED` : `\nall assertions passed (MIN_TOP=${MIN_TOP})`);
process.exit(bad ? 1 : 0);
