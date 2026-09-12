// api/me.js — who is signed in, and on which plan. Nothing else.
//
// The marketing home needs this to draw the account avatar, and it is the one page where
// /api/games would be wasteful: that route ships the whole arcade catalogue to answer a
// question about one cookie. This reads the signed cookie and returns, with no KV read,
// no Patreon call and no revalidation — it decides what a header says, never what a
// member may open. Every gated route still calls revalidateSession() for that.
import '../lib/quiet-deprecations.js';
import { readSession, planOf } from '../lib/session.js';

export default function handler(req, res) {
  const s = readSession(req);
  // A stale label is harmless; a cached one across members would not be.
  res.setHeader('Cache-Control', 'private, no-store');
  if (!s) return res.json({ ok: true, name: null });
  return res.json({ ok: true, name: s.name || null, plan: planOf(s) });
}
