// lib/popular.js — turns the site-wide `{type}:{ep}` play counts into the three lists a
// "what others are practising" card could show. Pure functions over the hash that
// lib/history.js keeps, so no I/O and no model call.
//
// The floor is the important part. With a small member base the top entry can be three
// plays, and "most played this week" built on three plays is not social proof — it is
// noise wearing the costume of a recommendation, and members can tell. Below the floor
// these functions report `enough: false` and the caller shows nothing at all rather than
// something technically true and practically meaningless.

export const MIN_TOP = 20;   // plays the leader needs before a list is worth showing
export const MIN_ITEM = 3;   // plays an entry needs before it is listed at all

const num = (v) => Number(v) || 0;

// "phrase-pairs:ep280" -> { type, ep }. Episode ids have no colon, types have no colon,
// so one split is safe; anything malformed is dropped rather than guessed at.
export function parseField(field) {
  const i = String(field || '').indexOf(':');
  if (i < 1) return null;
  const type = field.slice(0, i), ep = field.slice(i + 1);
  return type && ep ? { type, ep } : null;
}

function rank(map, limit) {
  return Object.entries(map)
    .filter(([, n]) => n >= MIN_ITEM)
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([key, plays]) => ({ key, plays }));
}

/* counts: { "phrase-pairs:ep280": 12, ... } as stored by lib/history.js.
   episodes/types are the catalogue, used only to attach titles and drop anything that
   has since left it (a retired episode should not headline a popularity card).

   Returns all three views plus `enough`, which is false until the leader clears MIN_TOP.
   Read it as: "did enough people do this for the ordering to mean anything?" */
export function buildPopular({ counts = {}, episodes = [], types = [], limit = 5 } = {}) {
  const epById = new Map((episodes || []).map((e) => [e.id, e]));
  const typeByKey = new Map((types || []).map((t) => [t.type, t]));

  const byEpisode = {};
  const byType = {};
  const byPair = {};
  let total = 0;

  for (const [field, raw] of Object.entries(counts || {})) {
    const p = parseField(field);
    if (!p) continue;
    // only what is still in the catalogue, and only known game types
    if (!epById.has(p.ep) || !typeByKey.has(p.type)) continue;
    const n = num(raw);
    if (n <= 0) continue;
    byEpisode[p.ep] = (byEpisode[p.ep] || 0) + n;
    byType[p.type] = (byType[p.type] || 0) + n;
    byPair[field] = n;
    total += n;
  }

  const episodesRanked = rank(byEpisode, limit).map(({ key, plays }) => {
    const e = epById.get(key);
    return { id: key, n: e.n, title: e.title, plays };
  });
  const typesRanked = rank(byType, limit).map(({ key, plays }) => ({
    type: key, name: (typeByKey.get(key) || {}).name || key, plays,
  }));
  // the cross-section: which game an episode's words land best in
  const pairsRanked = rank(byPair, limit).map(({ key, plays }) => {
    const p = parseField(key);
    const e = epById.get(p.ep);
    return {
      type: p.type, name: (typeByKey.get(p.type) || {}).name || p.type,
      id: p.ep, n: e.n, title: e.title, plays,
    };
  });

  const top = Math.max(0, ...episodesRanked.map((x) => x.plays), 0);
  return {
    episodes: episodesRanked,
    types: typesRanked,
    pairs: pairsRanked,
    total,
    enough: top >= MIN_TOP,
    minTop: MIN_TOP,
  };
}
