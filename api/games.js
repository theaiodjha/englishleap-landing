// /api/games — Practice Arcade.
//   GET /api/games                      → catalogue the member can access
//   GET /api/games?type=clue-room&ep=ep232 → the gated content for one game
// Reuses the exact membership logic from lib/session.js (same live re-check as
// /api/list), so access tracks paying status identically to the archive.
import {
  readSession, sessionCookie, clearCookie,
  checkMembership, refreshToken, RECHECK_HOURS,
} from "../lib/session.js";
import { ARCADE, findGame } from "../lib/arcade-data.js";

// Same 24h live re-check used by /api/list. Returns the (possibly updated)
// session, or null if membership is now inactive (cookie cleared).
async function revalidate(req, res, s) {
  if (!(s.access && s.rt && Date.now() > (s.recheck || 0))) return s;
  const doRefresh = async (rt) => {
    const t = await refreshToken(rt);
    return { at: t.access_token, rt: t.refresh_token || rt, atexp: Date.now() + (t.expires_in ? t.expires_in * 1000 : 30 * 864e5) };
  };
  try {
    let { at, rt, atexp } = s;
    if (!atexp || Date.now() > atexp - 60000) ({ at, rt, atexp } = await doRefresh(rt));
    let mem;
    try { mem = await checkMembership(at); }
    catch { ({ at, rt, atexp } = await doRefresh(rt)); mem = await checkMembership(at); }
    if (mem.status === "none") { res.setHeader("Set-Cookie", clearCookie); return null; }
    const next = { ...s, at, rt, atexp, access: mem.status, tier: mem.status === "paid" ? "fluency" : "trial", recheck: Date.now() + RECHECK_HOURS * 3600e3 };
    res.setHeader("Set-Cookie", sessionCookie(next));
    return next;
  } catch {
    return s; // Patreon unreachable → honour cached status (outage-safe)
  }
}

export default async function handler(req, res) {
  let s = readSession(req);
  if (!s) return res.status(401).json({ ok: false, error: "Not signed in." });

  s = await revalidate(req, res, s);
  if (!s) return res.status(403).json({ ok: false, error: "Your membership looks inactive now." });

  const paid = s.access === "paid";
  const { type, ep } = req.query;

  // --- catalogue ---
  if (!type || !ep) {
    const arcade = ARCADE.map((gt) => ({
      type: gt.type, name: gt.name, icon: gt.icon, accent: gt.accent, tagline: gt.tagline,
      episodes: gt.episodes
        .filter((e) => paid || e.current)
        .map((e) => ({ id: e.id, ep: e.ep, title: e.title, current: !!e.current, cover: e.cover || null })),
    }));
    return res.json({ ok: true, name: s.name, access: s.access, arcade });
  }

  // --- one game's content (gated) ---
  const { gt, e } = findGame(type, ep);
  if (!gt || !e) return res.status(404).json({ ok: false, error: "Game not found." });
  if (!paid && !e.current) {
    return res.status(403).json({ ok: false, error: "This episode is part of the full Fluency Club." });
  }
  return res.json({ ok: true, ep: e.ep, title: e.title, type: gt.type, name: gt.name, content: e.content });
}
