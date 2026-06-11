// Server-side store for Practice Arcade data.
//
// Reads the arcade catalogue (game types + episodes + gated content) from a
// Vercel KV / Upstash Redis store when configured, and falls back to the
// bundled static seed (lib/arcade-data.js) otherwise — so nothing breaks
// before you seed, and local/dev keeps working with no env vars.
//
// Seed or update the store any time with:  node tools/seed-arcade.js
// (after editing lib/arcade-data.js, or push your own JSON to key
//  `arcade:catalog`). Content is never shipped to the browser; it is served
// per-request by /api/games only after the Patreon tier check passes.

import { ARCADE as STATIC } from "./arcade-data.js";

const URL = process.env.KV_REST_API_URL;
const TOK = process.env.KV_REST_API_TOKEN;
const KEY = "arcade:catalog";
const TTL = 60 * 1000; // in-memory cache so we don't hit KV on every request

let cache = null;
let cacheAt = 0;

export async function getArcade() {
  const now = Date.now();
  if (cache && now - cacheAt < TTL) return cache;

  if (URL && TOK) {
    try {
      const r = await fetch(`${URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${TOK}` },
      });
      if (r.ok) {
        const j = await r.json();
        if (j && typeof j.result === "string" && j.result) {
          const data = JSON.parse(j.result);
          if (Array.isArray(data) && data.length) {
            cache = data;
            cacheAt = now;
            return data;
          }
        }
      }
    } catch {
      /* KV unreachable → fall through to static seed (resilient) */
    }
  }

  cache = STATIC;
  cacheAt = now;
  return STATIC;
}

// Optional: clear the in-memory cache (e.g. right after a re-seed in the same
// warm function instance). KV is the source of truth; this just forces a refetch.
export function invalidateArcadeCache() {
  cache = null;
  cacheAt = 0;
}
