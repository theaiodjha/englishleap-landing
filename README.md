# English Leap Club — Member Archive (Patreon OAuth)

"Continue with Patreon" login + a **live** membership check, so access ties directly to current
paying status. Cancel = the archive closes itself. Trial = current episode only. No code emailing.
A member-code box is kept as a fallback (for gifts/comps).

## What your subscriber experiences

1. Visit `englishleap.app/archive` → click **Continue with Patreon**.
2. Patreon shows a one-time "Allow English Leap Club to see your membership?" screen → Allow.
3. They land back on the archive, unlocked. A 30-day cookie remembers them, so repeat visits skip
   straight to the archive with **no Patreon round-trip**.
4. They use everything on your site — no switching back to Patreon to "get" content.

So: one consent click the first time, seamless after that. The only ongoing Patreon contact is a
**silent** background re-check (at most once every 24h) to confirm they still pay — invisible to them.

- **Paid member** (has been charged) → full archive.
- **Trial member** (active, not yet charged) → current episode only + a friendly banner.
- **Cancelled** → next re-check fails and the archive closes automatically.

## Files

```
archive.html            the page (Continue with Patreon + code fallback)
package.json            marks the project as ES modules for Vercel
lib/session.js          signed sessions, signed links, Patreon API helpers
api/auth/login.js       starts OAuth (redirects to Patreon)
api/auth/callback.js    Patreon returns here → checks membership → sets session
api/auth/signout.js     clears the session
api/list.js             archive list + 24h live re-check + trial/paid gating
api/download.js         validates expiring links, serves private files
api/unlock.js           fallback: redeem a member code (gifts/comps)
tools/issue-code.js     create/revoke fallback codes
```

## One-time setup (~25 min)

**1. Register a Patreon OAuth client.** patreon.com → log in as the creator → Account settings →
**Developers / Clients** → *Create Client*. Set the **Redirect URI** to:
```
https://englishleap.app/api/auth/callback
```
Copy the **Client ID** and **Client Secret**.

**2. Vercel env vars** (Project → Settings → Environment Variables):
```
SESSION_SECRET          a long random string  (openssl rand -hex 32)
PATREON_CLIENT_ID       from step 1
PATREON_CLIENT_SECRET   from step 1
PATREON_REDIRECT_URI    https://englishleap.app/api/auth/callback
BLOB_MAP                {"ep232/transcript.pdf":"<private-url>", ...}   (see below)
# only if you use the code fallback:
KV_REST_API_URL         from a Vercel KV store
KV_REST_API_TOKEN       from a Vercel KV store
```

**3. Put the packs in private storage.** Upload PDFs/EPUBs/audio to **Vercel Blob (private)** (or
S3/R2). Map each `id` from `api/list.js` to its URL in `BLOB_MAP`. The page only ever shows
10-minute signed links to `/api/download`, which checks the signature before serving — copied links
die in minutes.

**4. Deploy.** Drop the files in your repo (Vercel auto-detects `api/`), deploy, open `/archive.html`.

## Adding a new episode each week

In `api/list.js`: add a block to `ARCHIVE`, mark the newest one `current: true`, and remove
`current` from last week's. Upload its files to Blob and add them to `BLOB_MAP`. (Want zero
redeploys? Move `ARCHIVE` + `BLOB_MAP` into KV and read them at request time.)

## How trial-vs-paid is decided

In `lib/session.js` → `checkMembership()`, Patreon returns each membership's `patron_status`,
`last_charge_status`, and `last_charge_date`. We treat **active + last_charge_status === "Paid" +
a real charge date** as `paid`; an active member with no successful charge yet is `trial`. That's the
"current episode during the trial, full archive after the first payment" rule, enforced server-side.

## Notes & honest limits

- **Outage-safe:** if Patreon's API is briefly unreachable during a re-check, the last known status
  is kept so real members aren't locked out; it retries next visit.
- **Refresh tokens:** handled automatically. `api/list.js` refreshes the Patreon access token (via the
  stored refresh token) before each 24h re-check, and retries once if a token has gone stale — so
  members never have to re-consent. New tokens are written back into the session cookie.
- **Not piracy-proof:** anything a member opens can be saved. This design makes *re-sharing* and
  *trial-grab-cancel* pointless, which is the achievable goal. The durable moat stays the weekly
  stream + community + the upcoming Oriva app.
- This login is a clean foundation for the **Oriva app's** member auth later.

## Setup test checklist

Work through these in order after deploying. Each has a clear pass signal.

1. **Env vars present** — in Vercel, confirm all six (SESSION_SECRET, PATREON_CLIENT_ID,
   PATREON_CLIENT_SECRET, PATREON_REDIRECT_URI, BLOB_MAP, + KV_* if using codes) are set for
   Production. Redeploy after adding them.
2. **Redirect URI matches exactly** — the value in the Patreon client and `PATREON_REDIRECT_URI`
   must be character-identical, including `https://` and no trailing slash. A mismatch is the #1
   cause of "auth did not complete".
3. **Login round-trip** — open `/archive.html`, click *Continue with Patreon*. You should land on
   Patreon's consent screen, click Allow, and return to the archive. PASS = you see your name and tiles.
4. **Trial vs paid** — test with two accounts if you can: a trial member should see only the episode
   marked `current` plus the trial banner; a charged member should see the full list. (No second
   account? Temporarily flip `current` and confirm the banner logic.)
5. **Non-member rejected** — log in with a Patreon account that doesn't support you. PASS = bounced
   back with "could not find an active membership".
6. **Download links expire** — open the archive, copy a file link, wait >10 minutes, paste it in a new
   tab. PASS = "link expired"; reopening the archive gives a fresh working link.
7. **Files are private** — paste a raw Blob URL from `BLOB_MAP` only if you *don't* want it reachable;
   confirm your storage is set to private so the bytes are only served through `/api/download`.
8. **Auto-revoke** — cancel the test membership on Patreon, then (to skip the 24h wait) lower
   `RECHECK_HOURS` to a tiny value in `lib/session.js`, redeploy, reload the archive. PASS = it closes
   with "membership looks inactive". Restore `RECHECK_HOURS` to 24 afterwards.
9. **Stays signed in** — reload the page and revisit next day. PASS = lands straight on the archive,
   no Patreon screen (cookie + silent refresh working).
10. **Code fallback** (optional) — issue a code with `tools/issue-code.js`, redeem it via "Have a
    member code?". PASS = full archive unlocks without Patreon.

## Which version to run

- **This (OAuth):** lowest ongoing effort, auto-revokes, best anti-abuse. Needs the one-time Patreon
  client setup.
- **Code-only version** (the other starter): no Patreon API, but you issue/revoke codes yourself.
Run OAuth as the main door and keep codes for gifts/comps — exactly how this project is wired.
