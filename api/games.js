// /api/games — Practice Arcade.
//   GET /api/games                      → catalogue the member can access
//   GET /api/games?type=clue-room&ep=ep232 → the gated content for one game
// Reuses the exact membership logic from lib/session.js (same live re-check as
// /api/list), so access tracks paying status identically to the archive.
import {
  readSession, sessionCookie, clearCookie,
  checkMembership, refreshToken, RECHECK_HOURS,
} from "../lib/session.js";
import { ARCADE } from "../lib/arcade-data.js";

// Same 24h live re-check used by /api/list. Returns the (possibly updated)
// session, or null if membership is now inactive (cookie cleared).
async function revalidate(req, res, s) {
  const needTier = s.cents === undefined && !!s.rt; // session issued before tiering existed
  if (!(s.access && s.rt && (needTier || Date.now() > (s.recheck || 0)))) return s;
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
    const next = { ...s, at, rt, atexp, access: mem.status, cents: mem.cents, tier: mem.status === "paid" ? "fluency" : "trial", recheck: Date.now() + RECHECK_HOURS * 3600e3 };
    res.setHeader("Set-Cookie", sessionCookie(next));
    return next;
  } catch {
    return s; // Patreon unreachable → honour cached status (outage-safe)
  }
}

export default async function handler(req, res) {
  // Logged-in members get a live re-check; anonymous visitors are still allowed a taster.
  let s = readSession(req);
  if (s) s = await revalidate(req, res, s); // becomes null if membership went inactive

  const paid = !!(s && s.access === "paid");
  const FLUENCY_MIN_CENTS = 200; // Transcript = 100¢, Fluency Club = 299¢; unknown fails open
  const level = !s
    ? "none"
    : (((s.cents === undefined) ? true : (Number(s.cents) || 0) >= FLUENCY_MIN_CENTS) ? "fluency" : "transcript");

  // Which episodes of a game type this level may play:
  //   none       → the first game of the FIRST type only (public taster)
  //   transcript → the first game of EVERY type ($1 subscribers)
  //   fluency    → all episodes (paid) or the current one (trial)
  // "first" = first listed in lib/arcade-data.js, so reorder there to pick the taster.
  const epsFor = (gt, gi) => {
    if (level === "fluency") return paid ? gt.episodes : gt.episodes.filter((e) => e.current);
    if (level === "transcript") return gt.episodes.slice(0, 1);
    return gi === 0 ? gt.episodes.slice(0, 1) : [];
  };

  const { type, ep } = req.query;

  // --- catalogue ---
  if (!type || !ep) {
    const arcade = ARCADE
      .map((gt, gi) => ({
        type: gt.type, name: gt.name, icon: gt.icon, accent: gt.accent, tagline: gt.tagline,
        episodes: epsFor(gt, gi).map((e) => ({ id: e.id, ep: e.ep, title: e.title, current: !!e.current, cover: e.cover || null })),
      }))
      .filter((gt) => gt.episodes.length);
    return res.json({ ok: true, name: s ? s.name : null, access: s ? s.access : "none", level, arcade });
  }

  // --- one game's content ---
  const gi = ARCADE.findIndex((g) => g.type === type);
  const gt = gi >= 0 ? ARCADE[gi] : null;
  const e = gt ? gt.episodes.find((x) => x.id === ep) : null;
  if (!gt || !e) return res.status(404).json({ ok: false, error: "Game not found." });

  const allowed = epsFor(gt, gi).some((x) => x.id === e.id);
  if (!allowed) {
    if (!s) return res.status(401).json({ ok: false, login: true, error: "Sign in to play this game." });
    if (level !== "fluency") return res.status(403).json({ ok: false, upgrade: true, error: "This game is part of Fluency Club ($2.99)." });
    return res.status(403).json({ ok: false, error: "This episode is part of the full Fluency Club." });
  }
  return res.json({ ok: true, ep: e.ep, title: e.title, type: gt.type, name: gt.name, content: e.content });
}
