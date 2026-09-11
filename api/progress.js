import "../lib/quiet-deprecations.js";
// /api/progress — records arcade progress against the member's ACCOUNT.
//   POST { action:'complete', type, ep }        → one finished game
//   POST { action:'backfill', items:[{type,ep,ts}] } → migrate a device's localStorage
//   POST { action:'get' }                       → everything the dashboard needs
//
// progress.js keeps playing to localStorage regardless: anonymous visitors can finish
// the free Clue Room without an account, and a signed-in member's device history still
// works offline. This endpoint is the durable, cross-device copy.
//
// Anything gated stays gated elsewhere — this route only ever records or returns a
// member's OWN progress, keyed to the verified session cookie.
import { readSession } from '../lib/session.js';
import { logGame, logGamesBulk, getGames, getSessions, getAggregates } from '../lib/history.js';
import { getUsage } from '../lib/quota.js';

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
      ok: true, name: s.name, games, sessions,
      months: agg.months, words: agg.words,
      usedMin: usage.usedMin, limitMin: usage.limitMin, remainingMin: usage.remainingMin,
    });
  }

  return res.status(400).json({ ok: false, error: 'Unknown action.' });
}
