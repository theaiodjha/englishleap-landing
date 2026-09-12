import "../lib/quiet-deprecations.js";
// /api/progress — records arcade progress against the member's ACCOUNT.
//   POST { action:'complete', type, ep }        → one finished game
//   POST { action:'backfill', items:[{type,ep,ts}] } → migrate a device's localStorage
//   POST { action:'get' }                       → everything the dashboard needs
//   POST { action:'popular', window }           → site-wide play counts, ranked
//
// progress.js keeps playing to localStorage regardless: anonymous visitors can finish
// the free Clue Room without an account, and a signed-in member's device history still
// works offline. This endpoint is the durable, cross-device copy.
//
// Anything gated stays gated elsewhere — this route only ever records or returns a
// member's OWN progress, keyed to the verified session cookie.
import { readSession, planOf } from '../lib/session.js';
import { logGame, logGamesBulk, getGames, getSessions, getAggregates,
         getRecapSeen, setRecapSeen, getPopularity } from '../lib/history.js';
import { buildPopular } from '../lib/popular.js';
import { buildRecap, prevMonth, thisMonth, needsDeep, headline } from '../lib/recap.js';
import { getUsage, limitFor } from '../lib/quota.js';
import { getEpisodes, getGameTypes } from '../lib/arcade-store.js';
import { nextAction, focusFor, ownership } from '../lib/coach.js';
import { buildDashboard } from '../lib/dashboard.js';

const ID = /^[a-z0-9-]{1,40}$/i; // game types and episode ids are simple slugs

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  // No session → nothing to record against. Not an error the player should ever see:
  // the client treats this as "stay local" and retries after they sign in.
  const s = readSession(req);
  if (!s || !s.uid) return res.status(401).json({ ok: false, login: true });

  const { action } = body;

  if (action === 'complete') {
    const type = String(body.type || ''), ep = String(body.ep || '');
    if (!ID.test(type) || !ID.test(ep)) return res.status(400).json({ ok: false, error: 'Bad game or episode.' });
    const saved = await logGame(s.uid, type, ep);
    return res.json({ ok: true, saved });
  }

  if (action === 'backfill') {
    const items = (Array.isArray(body.items) ? body.items : [])
      .filter((it) => it && ID.test(String(it.type || '')) && ID.test(String(it.ep || '')));
    const saved = await logGamesBulk(s.uid, items);
    return res.json({ ok: true, saved });
  }

  if (action === 'get') {
    const [games, sessions, agg, usage] = await Promise.all([
      getGames(s.uid), getSessions(s.uid), getAggregates(s.uid), getUsage(s.uid),
    ]);
    return res.json({
      ok: true, name: s.name, plan: planOf(s), games, sessions,
      months: agg.months, words: agg.words,
      usedMin: usage.usedMin, limitMin: usage.limitMin, remainingMin: usage.remainingMin,
    });
  }

  // The single next best thing to do, with the reason in one sentence.
  if (action === 'next') {
    const [episodes, types, agg, games, sessions] = await Promise.all([
      getEpisodes(), getGameTypes(), getAggregates(s.uid), getGames(s.uid), getSessions(s.uid, 40),
    ]);
    const next = nextAction({ episodes, counts: agg.words, games, sessions, types });
    return res.json({
      ok: true, name: s.name, plan: planOf(s), next,
      // enough context for the card to show progress without a second round trip
      current: episodes[0] ? {
        id: episodes[0].id, n: episodes[0].n, title: episodes[0].title,
        focus: focusFor(episodes[0].words, agg.words),
        owned: Math.round(ownership(episodes[0].words, agg.words) * 100),
      } : null,
      sessions: sessions.length,
    });
  }

  // Everything the progress page draws. Pure arithmetic over the member's own history.
  if (action === 'dashboard') {
    const [agg, sessions, games, episodes, types, usage] = await Promise.all([
      getAggregates(s.uid), getSessions(s.uid), getGames(s.uid),
      getEpisodes(), getGameTypes(), getUsage(s.uid, limitFor(s.cents)),
    ]);
    const d = buildDashboard({ months: agg.months, words: agg.words, games, sessions, episodes });
    return res.json({
      ok: true, name: s.name, plan: planOf(s), ...d,
      types: types.map((t) => ({ type: t.type, name: t.name })),
      episodesTotal: episodes.length,
      usedMin: usage.usedMin, limitMin: usage.limitMin, remainingMin: usage.remainingMin,
      next: nextAction({ episodes, counts: agg.words, games, sessions, types }),
    });
  }

  // Last month, read back. Assembled from the member's own aggregates — no model call,
  // so it costs nothing. Only ever computed when they actually come back and look.
  if (action === 'recap') {
    const ym = prevMonth(thisMonth());
    const [agg, sessions, episodes, seen] = await Promise.all([
      getAggregates(s.uid), getSessions(s.uid), getEpisodes(), getRecapSeen(s.uid),
    ]);
    const r = buildRecap(ym, { months: agg.months, words: agg.words, sessions, episodes });
    return res.json({
      ok: true, name: s.name, plan: planOf(s), ...r,
      headline: headline(r),
      seen: seen === ym,
      // Interpretation — the rubric read back as a sentence, and a goal for next month —
      // is the upgrade. The facts above are every Fluency member's own data.
      canDeep: needsDeep(limitFor(s.cents)),   // entitled to the coaching layer
      deep: null,                              // not built yet; lights up for canDeep members
    });
  }

  /* What everyone is practising. The only action here that is not about the caller's own
     data — it is an aggregate over all members, with nothing identifying in it. Default
     window is the rolling week: an all-time list is a ratchet that buries every episode
     outside the first few to get plays.

     `enough:false` means the leader has not cleared the floor yet. The caller must render
     NOTHING in that case — the lists are still returned so this route stays inspectable
     while the numbers build up, but a card drawn from four plays is noise. */
  if (action === 'popular') {
    const window = body.window === 'all' ? 'all' : 'week';
    const [counts, episodes, types] = await Promise.all([
      getPopularity(window), getEpisodes(), getGameTypes(),
    ]);
    const limit = Math.min(10, Math.max(1, Number(body.limit) || 5));
    return res.json({
      ok: true, window,
      ...buildPopular({ counts, episodes, types, limit }),
    });
  }

  // Dismiss this month's card. Stored per member so it does not reappear on another device.
  if (action === 'recap-seen') {
    await setRecapSeen(s.uid, prevMonth(thisMonth()));
    return res.json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: 'Unknown action.' });
}
