# English Leap Club — project guide for Claude Code

Read this first. It captures how this repo works, the house rules, and the current
state of in-flight work so any session starts oriented.

## What this is

**English Leap Club (ELC)** — a B1–B2 English-learning brand built around the
"Speak English With Class" podcast (hosts **Anna** & **Jake**). Members practise on
**englishleap.app**; membership + billing is **Patreon** (two tiers: Transcript
Library $1, Fluency Club $2.99). The Fluency tier includes the interactive Practice
Arcade; the free trial is currently framed on the Transcript Library.

Four-pillar framework — **Read it · Hear it · Practise it · Use it** — colours:
Read `#f6479a` (pink) · Hear `#ff8a63` (coral) · Practise `#8b6cff` (violet) ·
Use `#1fc4b6` (teal). Mascot: **Oriva** (teal bird).

## Stack & deploy

- **Buildless static HTML + Vercel serverless functions** (`api/*.js`). No bundler,
  no framework. Keep it that way unless asked.
- **Upstash KV** via REST (`KV_REST_API_URL` / `KV_REST_API_TOKEN`) — idiom in
  `lib/arcade-store.js` and `lib/quota.js` (`fetch(`${URL}/get|set|incrby|expire/…`,
  Bearer token, read `.result`). Fail open on KV hiccups; never hard-block a paying member.
- **Patreon OAuth** for identity; **Anthropic** and **Gemini** APIs for AI features.
- Serverless files use ESM (`import`/`export`); `package.json` has no `"type":"module"`
  but Vercel handles it. `node --check` may warn about module type — harmless.
- Deploy = `git add -A && commit && push`. Hosting/env changes happen in the Vercel
  and Patreon dashboards (Claude Code can't do those).

## House rules (do these every time)

- **Validate before packaging:** `node --check` every changed JS; extract and
  `node --check` inline `<script>` blocks in changed HTML; then run `python3 tools/audit.py`
  (wired into the pre-push hook). Fix HIGH/MED; LOW at discretion.
- **Floating bottom-right buttons measure, they don't re-parent.** `window.ELCToggleClearance()`
  (in `theme.js`, on every page) returns the offset needed to clear the theme toggle; the tour
  launcher and the game "How to play" pill each set their own `bottom` from it. Do **not** test
  `offsetParent` to decide whether the toggle is floating — CSSOM returns null for every
  `position:fixed` element, so the check silently always fails. A shared dock that re-parented
  these was tried and reverted: it broke clicks site-wide. **On member pages the account
  card owns both instead** — it renders its own Auto/Light/Dark segment and a "Take the
  tour" row, then calls `ELCTheme.hide()` (a class on `<html>`) and
  `ELCTour.hideLauncher()` (removes the pill). Still no re-parenting. Signed-out visitors
  have no card, so the floating toggle stays for them.
- **`--gold` / `--amber` are dark-ground colours.** As TEXT on light they measure ~1.2:1
  (a pale label on a gold pill was 1.09:1). Fills may stay gold; the ink must become
  **`#7a5100`** — `theme.css` carries the light overrides. Same for teal text: `#0f9b90`
  is 3.0:1, use **`#0b6f68`**. Check any new accent against the composited background.
- **Game surfaces were built dark-only.** Anything filled with a tint of the word's
  `--accent` (`.chip`, `.hint b`, `.slot.filled`, `.gap.filled`) carries `color:#fff`,
  which measures ~1.2:1 once the page ground is light — `theme.css` swaps the ink to
  `#241f3a` and leaves the accent to do the identifying. `#stagebg` is hidden on light
  for the same reason as the aurora.
- **`color-scheme` drives native controls.** `elc.css` sets `dark`, `theme.css` sets
  `light` — without it a `<select>` renders in the OS's scheme, so voice pickers appeared
  dark navy on a light page. Applies to scrollbars too.
- **Never pin a scrolling page's body to `height:100%`.** Four games had
  `html,body{height:100%}`, which fixes the body box at one viewport height however long
  the page is — so `#stagebg` (absolute, `inset:0`) could only paint one screen and left a
  hard horizontal seam at the fold. Use `html{height:100%}` + `body{min-height:100%}`.
  clue-room is the exception: it is a non-scrolling 3D scene with `overflow:hidden`.
- **Light theme is daylight, not an inverted night.** The aurora is `display:none` on
  `html[data-theme="light"]` — by day the page is paper. Do not reintroduce blobs there.
- **The five games share a layout.** One 1100px column; "How to play" is a `.howbtn`
  styled exactly like the counter `.pill` and sits on the tracker row (never its own row);
  the phrase bank spans the full column so six long phrases stay on one line; primary
  buttons are 44px tall at `--fs-md`.
- **The six card colours are a validated categorical palette**, identical in every
  episode: `#f6479a #ff8a63 #ffcd46 #1fc4b6 #1f86c9 #8b6cff`. They previously held THREE
  teals (`#1fc4b6 #1ca8a2 #57e6c4`) — two of them ΔE 8.0 apart for normal vision, i.e.
  indistinguishable. If you change one, re-run the dataviz skill's
  `validate_palette.js "<hexes>" --mode dark --pairs all`: all-pairs, because every card
  is on screen at once. Keep the normal-vision floor at ΔE >= 15.
- **A board whose cards use `aspect-ratio` is sized by its WIDTH**, so a fixed
  `max-width` decides the height and can overflow short screens (phrase-pairs cut its last
  row in half). Cap such a grid with `width:min(<design>, 100%, <width implied by the
  height left below the header>)` using `svh`.
- **One member header, defined once** in `elc-nav.js` (Arcade · Progress, each with an
  icon; Use It Live appears when `SHOW_UIL` is flipped at launch). The brand is the real
  logo — `/assets/brand/elc-icon-64.png` + "English Leap" — matching `index.html`. Member pages
  carry `<div id="elcnav"></div><script src="/elc-nav.js"></script>` at the top of `.wrap`
  (it is `position:sticky` and frosts once scrolled, matching `index.html`; never put
  `overflow-x:hidden` on an ancestor — use `clip`, or sticky stops working)
  and nothing else — the script renders synchronously so page scripts still find `#acct`.
  Six pages previously had five different headers with drifting labels, and Progress and
  Use It Live did not link to each other.
- **The account control is `window.ELCAccount(user, {next})`**, also in `elc-nav.js`: an
  initials avatar that opens a card with the member's name, plan and sign-out, replacing
  six copies of "Signed in as … [Sign out]" (which ate the header on phones). Pass
  `{name, plan}` where plan is `fluency|transcript|trial|none`; pass `null` for the
  signed-out Member Login link. The card also carries the theme choice and, where the page
  has a tour (`ELCTour.pageTour()`), a "Take the tour" row. The plan comes from **`planOf(s)` in `lib/session.js`** —
  derived from `cents`, not `s.tier`, which is `'fluency'` for ANY paid pledge and so
  labels a $1 Transcript backer a Fluency member. `api/games.js` ships it as `level`;
  `api/list.js`, `api/progress.js` and `api/use-it-live.js` ship it as `plan`.
- **There is no global back button** — the tabs are the way around, and **the games keep
  their minimal back-only bar** (a game is a focus task) while `index.html` keeps its
  marketing nav. The two pages a level below the Arcade (`arcade-browse.html`,
  `arcade-type.html`) carry a `.elcback` link naming their PARENT ("Practice Arcade",
  "Browse all games"): a breadcrumb step, so it lands in the same place however the
  member arrived — not browser history. **`progress.html` is the exception**: it is a
  top-level tab reachable from every page and from the account card, so a fixed parent is
  wrong more often than right. Its link carries `data-smart`, and `smartBack()` in
  `elc-nav.js` rewrites it from `document.referrer` — but only for a same-origin page it
  can NAME (see the PAGE map; `arcade-type.html` is named by its `?type=`), so the label
  is never a bare URL. Reload, off-site, no referrer, unnamed page → the markup's own href
  stands, which is why it is a real `<a>` and not built in JS.
- **The Member Archive is hidden from the whole site** until it actually works: no nav
  tab, and every link commented with "Member Archive hidden until it is a working
  feature" (`index.html` x2, `games/clue-room`). `archive.html` still exists at its URL.
- **Never redraw Oriva.** Only use the six real PNG poses from the kit
  (celebrate, exercise, happy, point, read, think). If a PNG is absent, hide it gracefully.
- **Conventional one-line git commits** (e.g. `fix(auth): …`, `feat(uil): …`).
- **Two design systems, never mixed:** the marketing/member site uses **Clash Display +
  General Sans** (Fontshare) with the dark "aurora" aesthetic (see `practice-arcade.html`
  / `use-it-live.html`); the premium PDF/print pipeline uses **Poppins**.
- **Tokens live in `elc.css`, not in the page.** Every page links it before its own
  `<style>`, so a page can still override a token it genuinely needs. It also carries the
  **type scale** (`--fs-xs`…`--fs-2xl`, six steps replacing 22 ad-hoc px values) and the
  **4pt spacing scale** (`--sp-1`…`--sp-10`) — migrate rules onto them as you touch them.
  **All 11 pages are migrated**: every text `font-size` is a `--fs-*` token (`clamp()` heroes
  excepted). The off-grid spacings (7, 9, 10, 11, 13, 14, 15, 18, 22, 26, 28, 30, 34) are
  still literals — rounding them to the 4pt grid changes layout, so it needs a design call.
  **The type scale governs text, not icons** — emoji/chevron glyphs sized by `font-size`
  keep px literals on purpose: `.scard .ico`, `.jdot`, `.shelf-arrow`, `.gi`, `.gicon`,
  clue-room's `.emoji`/`.audio`/`.menubtn` + its 🎉 PNG fallback, phrase-pairs' `.face.back`.
  **Do not flatten the games' `:root` overrides:** listening-gap (warm), sentence-builder
  (teal) and story-unlock (violet) deliberately re-tint `--space`/`--ink`/`--soft`.
- **Every page loads the theme** — `<script src="/theme.js">` + `<link href="/theme.css">`
  in the head, before the webfont link (copy `index.html`). `theme.js` resolves Auto from
  the visitor's local sunrise/sunset and stamps `html[data-theme]`; `theme.css` carries the
  light overrides at specificity `0,1,1` so it outranks each page's `:root`. **Any new
  component with a hardcoded dark fill, a black shadow or a neon text colour needs a light
  rule in `theme.css`** — check contrast against the composited tint, not the page ground.
- **Render-review is mandatory** for any generated visual/asset — check overflow and
  layout before shipping.
- **Zip from inside the project dir** (`cd <root> && zip -rq ../out.zip .`).
- Footer disclaimer on all member-facing content:
  *"A practice community - not a replacement for formal English education."*
- Fahad makes all product/design calls; execute conventions without hand-holding but
  flag anything ambiguous.

## Repo map

```
index.html                 marketing home (ecosystem, watch, club, tiers, free, cta)
practice-arcade.html       the Arcade (Patreon-gated mini-games) + "Browse games" links
arcade-browse.html         browse the whole game catalogue by episode
arcade-type.html           per-game-type page
archive.html               Member Archive (gated content library)
use-it-live.html           Use It Live — record & get AI feedback (FLAGGED OFF, see below)
elc-tour.js                guided Oriva tour (home + arcade); auto-runs first visit
api/auth/{login,callback,signout}.js   Patreon OAuth flow
api/{games,list,download,unlock}.js    arcade data, archive list/download, code redemption
api/progress.js            records game completions + returns practice history / recap / dashboard
progress.html              the member progress page (KPI row, monthly chart, phrase mastery)
api/use-it-live.js         Use It Live: usage + audio analysis (Gemini), flag-gated
lib/session.js             session cookie (HMAC), readSession(), checkMembership() → tier/uid/email,
                           revalidateSession() → shared 24h live Patreon re-check
lib/quota.js               monthly audio quota (Upstash), keyed to session.uid; tier-aware
lib/history.js             practice history (sessions, aggregates, game completions)
lib/coach.js               pure logic: due words, ownership, next-best-action, speech metrics
lib/recap.js               monthly "how your month went" facts (no model call)
lib/dashboard.js           shapes history for progress.html (streaks, mastery, monthly bars)
elc.css                    design tokens: colour, type scale, spacing scale, radii
lib/arcade-store.js        KV read/write for arcade data (static fallback)
lib/arcade-data.js         static arcade catalogue (short cover titles)
lib/episode-titles.js      long/searchable episode titles for the arcade browser
lib/quiet-deprecations.js  silences DEP0169 (Vercel adapter's url.parse); imported by api routes
tools/audit.py             cross-renderer/consistency audit (pre-push hook)
tools/{seed-arcade,issue-code}.js      seed arcade to KV; issue member codes
games/*                    5 game types (clue-room, phrase-pairs, listening-gap,
                           sentence-builder, story-unlock)
```

## Auth & entitlement

- Login: `/api/auth/login?next=…` → Patreon → `/api/auth/callback` sets a signed
  session cookie (`SameSite=Lax`). Cookie carries `name`, `tier` (`fluency`|`trial`),
  `access` (`paid`|`trial`), `cents`, and **`uid`** (`p:<patreonId>` or `c:<code>`).
- **Membership is resolved to OUR campaign** via `PATREON_CAMPAIGN_ID`
  (`lib/session.js`). This is important: a user may back several creators, and taking
  `members[0]` blindly can grab a *different* creator's membership and wrongly report
  "not a member" — that was the free-trial login bug. **`PATREON_CAMPAIGN_ID` is now
  set in Vercel, so this fix is live.** If it is ever missing, the code falls back to
  `members[0]` and logs a `console.warn` (which also reveals your campaign id in Vercel
  logs the first time) — keep the env var set.
- **Fluency entitlement** = `cents >= 200` (Transcript = 100¢, Fluency = 299¢); a legacy
  session with `cents === undefined` counts as full. Mirror this anywhere you gate
  Fluency-only features (see `api/games.js` and `api/use-it-live.js`).
- **Re-check membership on every gated route** with `revalidateSession(res, s)` — it
  refreshes the token, re-confirms with Patreon at most every `RECHECK_HOURS`, backfills
  `cents` on legacy sessions, and returns `null` (clearing the cookie) once a membership
  goes inactive. Without it a cancelled member keeps their access for the cookie's 30 days.
  `api/games.js` and `api/use-it-live.js` use it; **`api/list.js` still has its own inline
  copy** — fold it in when you next touch that file.
- **Wrong-account UX:** callback requests `identity[email]`, masks it (`ja***@gmail.com`),
  and passes `&who=` on `e=notmember`; the arcade names the account and offers a
  "log out of Patreon to switch account" link (Patreon has no account picker / `prompt`).

### Canonical host (hygiene, dashboard-only)
Patreon's registered redirect URI is the **apex**: `https://englishleap.app/api/auth/callback`,
and `PATREON_REDIRECT_URI` must equal it. Vercel currently redirects apex→www; for the
OAuth state cookie to always share the callback origin, make **apex the primary domain**
(Vercel → Domains) so www redirects to apex. Do NOT add a www→apex `vercel.json` while
the dashboard still does apex→www (it loops). The core "not a member" failures are now
fixed in code (campaign id); this remains good hygiene for state-cookie robustness.

## Use It Live — CURRENT STATE: hidden behind a flag

Record-and-review speaking practice: the learner records audio, **Gemini** analyses it
(Claude can't take audio) and returns warm feedback (2 wins + 1 gentle tweak,
confidence-focused, never grammar-policing). Metered at **100 audio-minutes/month** per
member (`lib/quota.js`), Fluency-gated.

**The task is derived from the Arcade**, not a second list: `episodeFor()` reads the
clue-room block of the catalogue (`getArcade()`), takes the episode flagged `current`
(or the requested `episodeId`) and uses its six clue words. Long titles come from
`lib/episode-titles.js`. Per-episode hand-written prompts live in `PROMPTS` in
`api/use-it-live.js` — **all 30 episodes now have one**; `promptFor()` still falls back to a
title-built prompt for any episode added later. Write the real one when you add an episode:
the generic version is useless for a format title like "40 Minutes of Real English", and a
concrete task ("talk about a night you could not switch off") is what a nervous B1 learner
can actually start answering.
Members switch episodes with the picker in the task card (`episodeChoices()` ships the
list with the usage response); `?ep=ep277` deep-links straight to one, and the picker
keeps the URL in step. Switching clears any recorded takes — they would otherwise be
scored against the wrong six words.

**The minute allowance is per tier** (`ALLOWANCE` / `limitFor(cents)` in `lib/quota.js`):
Fluency (200c+) = 100 min, a 600c+ tier = 400 min. The 600c rung is **plumbing only —
nothing sells it yet**. Thresholds sit BELOW the intended price so a $6.99 tier (699c)
cannot miss by a cent, and a legacy session (`cents === undefined`) gets the BASE
allowance, never the top one. Minutes cost ~$0.29 per 100, so be generous: the cap is a
safety rail against runaway spend, not a paywall. The meter reads `limitMin` from the
server, so the UI needs no change when a tier is added.

**Recorder is multi-take:** each take is decoded to an `AudioBuffer` and held client-side;
on submit every take is concatenated, downmixed to mono and encoded as a single 16-bit PCM
WAV, sent as **one** analyze request (`mimeType:'audio/wav'`). **60s minimum / 180s maximum**
total. Sample rate steps down (16k → 12k → 8k) so even a 3-min session stays under Vercel's
~4.5MB body limit — 16-bit mono at 16kHz is 32KB/s, so 180s would be ~7.7MB once base64'd.

**Bursts degrade into a wait, not an error.** Gemini 429/503 is classified as transient
(`transientWait()`), retried once server-side with jitter so the member never re-uploads,
then surfaced as `429 {busy:true, retryAfter}` — deliberately distinct from the quota
`429 {quota:true}`, so a rate limit never renders as "you've used your 100 minutes".
The page counts down and retries twice, reusing the already-encoded WAV. Tier-1 limits are
RPM 1000 / TPM 2M / RPD 10000, and **TPM binds first**: audio is 32 tokens/sec, so a 3-min
clip is ~6.7k tokens → roughly 300 requests/min, not 1000. `maxDuration: 60` is set on the
route because a long clip plus a retry easily outruns the platform default.

**Intentionally OFF for the audience** until tested:
- `api/use-it-live.js` returns a `coming_soon` 503 unless `UIL_ENABLED=true`.
- `use-it-live.html` shows a clean "coming soon" card in that state.
- Nav links are **commented out** — search `Use It Live hidden until verified` across
  `index.html`, `archive.html`, `practice-arcade.html` (and the tour step in `elc-tour.js`).

**Owner preview while hidden** (either):
- open `/use-it-live.html?preview=TOKEN` where `TOKEN === UIL_PREVIEW_TOKEN`, or
- add your uid (e.g. `p:12345`) to `UIL_PREVIEW_UIDS` (comma-separated).

Preview bypasses the flag only — the Fluency gate still applies, and the creator account
is usually not a patron of its own campaign. Easiest owner login: mint a member code
(`node tools/issue-code.js new fluency "preview"`, which prints the `c:<CODE>` uid to
paste into `UIL_PREVIEW_UIDS`), redeem it on the arcade, then `revoke` it after testing.

**To launch:** set `UIL_ENABLED=true` and uncomment the nav links + tour step.

## Environment variables (Vercel)

```
# identity / billing
PATREON_CLIENT_ID, PATREON_CLIENT_SECRET
PATREON_REDIRECT_URI     must equal the apex callback registered in Patreon
PATREON_CAMPAIGN_ID      SET (live) — resolves membership to your campaign (fixed trial logins)
# data
KV_REST_API_URL, KV_REST_API_TOKEN     Upstash (arcade + quota)
# Use It Live
GEMINI_API_KEY           required for audio analysis (Google AI Studio key)
GEMINI_MODEL             optional, default gemini-3.6-flash (2.5-flash is retired for new keys)
UIL_ENABLED              'true' to open the feature to everyone (default: off)
UIL_PREVIEW_TOKEN        secret for owner ?preview= access while off
UIL_PREVIEW_UIDS         comma-separated uids that bypass the flag
```

## Next up / launch checklist

0. ~~Set `PATREON_CAMPAIGN_ID`~~ — **done**: set in Vercel, campaign-membership
   resolution is live and the fallback warning is gone.
1. **Confirm apex-canonical** in Vercel Domains + `PATREON_REDIRECT_URI` = apex callback.
2. **Set `GEMINI_API_KEY`** (Use It Live is inert without it).
3. **Test Use It Live privately** via preview; verify an **iPhone/Safari** recording
   (MP4/AAC) analyses end-to-end, and desktop mics work once OS/browser permission is
   granted (the page shows step-by-step OS guidance on failure).
4. **Launch:** `UIL_ENABLED=true` + uncomment nav/tour.

## Practice history (feeds the future progress dashboard)

`lib/history.js` keeps a bounded record per member, so the free Upstash tier (256MB,
500K commands/month) can't run away:

```
uil:log:{uid}    list  last 100 sessions, newest first (~110-250B each, hard cap)
uil:agg:{uid}    hash  NEVER trimmed: {YYYY-MM}:sec, {YYYY-MM}:n, w:{word} counts
elc:games:{uid}  hash  `{type}:{ep}` → ts, bounded by the catalogue (5 types x episodes)
```

The aggregates are the point: trimming old detail never destroys the long-term growth
story. Ceiling is **~40KB per member, forever**; measured cost is ~9 KV commands per
practice session. **Metadata only — no transcript is stored** (5x the size, and it means
holding members' speech); revisit only as an explicit opt-in.

Writes **fail open and never throw** — history must never break a practice session.
Failures `console.warn` into the Vercel log.

`markComplete()` in `progress.js` is the single choke point all 5 games call, so the
account copy is hooked there; `localStorage` stays the device source of truth (anonymous
players need no account) and a one-time `backfill` migrates it on first signed-in visit.

**The dashboard is `progress.html`** (`action:'dashboard'`). Pure arithmetic over the
member's own history — no model call. Forms follow the data's job: a KPI row for headline
numbers, ONE column chart for minutes per month (a single series, so one colour — height
carries the magnitude), and shaped dots for phrase mastery so state is never colour-alone.
Values wear ink tokens, never brand colour, and **the rubric never appears as a number**.
The chart only renders once there are 2+ months of data; below that it says so.
**Layout is two columns** (`.pgrid` + two `.pcol` stacks, one column under 900px) inside a
1100px wrap — real columns rather than grid auto-placement, so a card that is absent for a
member never reshuffles the other side. **Each card folds** from its heading: the state is
remembered per device in `elc-progress-shut`, and the body animates on `max-height`, which
is released to `none` once open or the "See the numbers" table would be clipped inside it.
The KPI row and "What next" do not fold — one is the headline, the other is a single button.
The KPI row is a tile per stat: an emoji chip carrying a pillar colour, and the **numeral in
an ink token** — a coloured number loses contrast on light and reads as a status. A zero
dims instead of shouting. Entrance animation (cards stagger in, chart columns grow from the
baseline, game tracks fill, KPI numbers count up) runs once via `animateIn()` and is off
under `prefers-reduced-motion`. A game track floors at `max(6px, N%)` so 1/30 is visible.

### The rubric (what makes growth chartable)

Every analysis returns TWO things: the warm prose the member reads, and a **fixed rubric**
scored the same way every time — `[fluency, clarity, vocabulary, task]`, each 1-5. Prose
can't be trended; the rubric can. Plus two deterministic measures computed from the
transcript server-side (`speechMetrics`), not asked of the model, so the same input always
gives the same number: **wpm** and **ttr** (type-token ratio, vocabulary spread).

**The rubric is never shown to the member** — `delete feedback.rubric` before responding.
It lives in the data, not on screen. That is deliberate: the brand promise is a practice
community, not a scoreboard.

### Spaced repetition

A word is **owned** after `OWNED_AT` (3) natural uses; below that it is *due*. **Nothing is
singled out until there is a signal**: if a member has used none of an episode's words,
`focusFor()` returns `[]` and `allNew()` is true — six identical zeroes make any pair
arbitrary, so the page says "all N phrases are new" instead of inventing a recommendation. `focusFor()`
ranks an episode's unowned words least-used-first, and the two due words are: injected into
the Gemini prompt (so a natural use gets celebrated by name), marked as amber chips on the
task card, and named in the "Today's focus" card. No schedule table needed — the `w:{word}`
counters already carry the signal.

### Next-best-action

`nextAction()` returns ONE recommendation in a fixed priority order, so the reason is always
one sentence: unused words in the current episode → **speak**; else an unplayed game for it
→ **play**; else the oldest practised episode still holding due words → **revise**; else a
free-choice nudge. Surfaced as the "Today's focus" card at the top of `practice-arcade.html`
— it is **added above** the menu, not a replacement, and is invisible to logged-out visitors.

Cost of all this: a practice session is now ~12 KV commands (was 9); `usage` gained one read.

### Monthly recap

`/api/progress` `action:'recap'` returns last month assembled from the member's own
aggregates — minutes, sessions, episodes, phrases used/owned, pace. **Pure arithmetic,
no model call**, so it costs nothing and cannot fail. Shown once on `practice-arcade.html`;
`action:'recap-seen'` stores `uil:recapseen:{uid}` so it does not reappear on another device.

**Generated on view, never on a schedule.** That is deliberate: a cron job would need a
member registry, stored Patreon tokens and an email provider, and would have to work out
who is still active. On view, the session gate and `revalidateSession()` have already
answered that — and nothing is generated for someone who never comes back.

Facts go to every Fluency member; **interpretation is the upgrade** (`canDeep`, true at
the 600c+ allowance). The rubric never surfaces as a number — the higher tier reads it
back as a sentence. That is also where the cost boundary falls: facts are free, the
coaching layer is the model call.

## Open decisions

- Quota: meter by wall-clock vs. words; fail-open vs. fail-closed on KV.
- iOS audio-format fallback (add a server-side conversion step only if Safari fails).
- Free-vs-$1 CTA on transcript-only Patreon posts (long-standing).
- Offered, not built: post-login arcade game-ladder tour; "manage subscription"
  deep-link; unified app shell; word-chip "pop" when Gemini confirms a target word.

## Known gotchas

- Inlining a script that contains the literal `</script>` (e.g. in a comment) breaks
  the page — keep `elc-tour.js` external.
- Gemini audio accepts ogg/mp3/aac/wav/flac (WebM worked in testing, but is undocumented).
  `use-it-live.html` no longer relies on the `MediaRecorder` container at all — it decodes
  each take and re-encodes one WAV, so Chrome/Safari differences stop at decode time.
- Gemini model ids retire: `gemini-2.5-flash` is refused for new API keys with a **404**
  naming its replacement. Default is `gemini-3.6-flash`; override with `GEMINI_MODEL`.
- KV keys: no whitespace/slashes/quotes; `encodeURIComponent` them.
- DEP0169 in logs is harmless (Vercel adapter) — already silenced via
  `lib/quiet-deprecations.js`; import it in any new api route if the warning reappears.
