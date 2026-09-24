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
  `node --check` inline `<script>` blocks in changed HTML; then run `python3 tools/audit.py`.
  Fix HIGH/MED; LOW at discretion.
- **Install the hooks once per clone: `node tools/install-hooks.js`.** `.git/hooks` is not
  tracked, so a hook committed to the repo does NOT arrive with a clone or a fetch — this
  project spent months believing the audit ran on push when no hook existed, which is how
  the EP282 `linger` fix shipped broken twice with the test that catches it sitting right
  there. The hook source lives in `tools/hooks/` so it is reviewed like any other file; it
  runs `tools/audit.py` (blocking on HIGH/MED) and `tools/test-episode-data.mjs`.
  `git push --no-verify` skips it.
- **The theme choice and the tour live ONLY in the account card — for everyone.** The
  floating theme toggle and the floating "Take the tour" pill are retired site-wide:
  `theme.js` no longer builds `#elc-theme-toggle` (the `ELCTheme` API is unchanged and
  `ELCToggleClearance()` reports 0), `elc-tour.js` defaults `showLauncher:false` (first-visit
  auto-run still works), and `index.html`'s mobile-menu "Appearance" slot is gone. Signed-out
  visitors get the same avatar in the same place — a person glyph (`.elcnav-av.anon`) whose
  card leads with **Sign in** (`/api/auth/login?next=…`) and carries the tour and theme rows;
  "Member Login" no longer exists. Clue Room, which has no account card, keeps the theme in
  its HUD menu. The `elc-nofloat-theme`/`elc-nolaunch` classes are still set on every load as
  a guard against a cached old script. The history below describes how the floating controls
  used to be handled and is kept for context.
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
- **Small letterspaced caps need MORE contrast, not less.** `.eyebrow` exists in two
  forms: `index.html`'s **pill** (`.pill-eyebrow`, neutral `#3a3560` ink on light, its
  `.dot` carrying the colour at `#0b6f68` with the glow dropped — a box-shadow halo reads
  as light at night and as a smudge on paper) and the plain **teal label** on
  `practice-arcade.html`/`out-loud.html` (`var(--teal)` = 1.9:1 on light, now `#0b6f68`).
  Neither had a rule in `theme.css` until now.
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
- **A puzzle must not hand over its own answer.** Sentence Builder rendered tokens
  verbatim, so the only capitalised word was obviously first and the only one with a full
  stop obviously last — two of seven positions free before reading anything. Tiles now show
  a `label()`: trailing sentence punctuation dropped, a leading Capital-then-lowercase word
  folded down. `I`, `I've`, acronyms and mid-sentence capitals are untouched, because that
  case carries meaning. **The token behind the label is unchanged** — `check()` still
  compares against the real sentence, and a correct answer is re-rendered in its proper form
  so the capital and full stop come back at the moment they cost nothing.
- **In a build-it game the accent belongs to the WORK, not the material.** Every bank chip
  used to be accent-filled while the tray sat empty and grey, so the loudest thing on screen
  was the pieces. The bank is now neutral and a word takes the colour when it lands in the
  tray: the sentence lights up as it is built, which is hierarchy and feedback at once.
  `theme.css` needs the light half of this — the blanket 56% white wash on `.chip` would
  otherwise flatten both halves to the same tint.
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
  icon; Out Loud appears when `SHOW_UIL` is flipped at launch). The brand is the real
  logo — `/assets/brand/elc-icon-64.png` + "English Leap" — matching `index.html`. Member pages
  carry `<div id="elcnav"></div><script src="/elc-nav.js"></script>` at the top of `.wrap`
  (it is `position:sticky` and frosts once scrolled, matching `index.html`; never put
  `overflow-x:hidden` on an ancestor — use `clip`, or sticky stops working)
  and nothing else — the script renders synchronously so page scripts still find `#acct`.
  Six pages previously had five different headers with drifting labels, and Progress and
  Out Loud did not link to each other.
- **Nothing waits on a round trip to decide what to paint.** Being signed in is an
  HttpOnly cookie, so a page cannot know it without asking — which is why the theme toggle
  and tour pill used to appear on every navigation and then vanish, and why the header
  flashed "Member Login" before the avatar. `elc-nav.js` caches the last answer in
  **`elc-acct`** (localStorage) and applies it on the FIRST frame; the page's fetch then
  confirms or corrects it. Suppression is **classes on `<html>`**
  (`elc-nofloat-theme`, `elc-nolaunch`), never touching the elements, so an element created
  later by another script is simply born hidden and script order stops mattering. The
  signed-out case no longer waits either: with no hint, `bootAccount()` draws the signed-out
  card on the first frame (it is the same circle as a member's avatar, so a later correction
  is a glyph change, not a layout jump) — the old 600ms and then 2500ms "Member Login"
  fallbacks are gone. `bootAccount()` runs OUTSIDE `render()`: `index.html` has
  `#acct` but no `#elcnav`, and `render()` returns early without that slot.
  **A page must not call `ELCAccount(null)` speculatively** — that clears the hint and
  un-hides the floating controls, recreating the very flash the hint prevents. Let the
  hint paint, and call ELCAccount only with a real answer.
- **Two minute counters exist and they are NOT redundant.** `uil:min:{uid}:{YYYY-MM}` is
  the quota: incremented the instant an analysis succeeds, and the thing that decides
  whether the next recording is allowed. `uil:agg:{uid}` `{YYYY-MM}:sec` is the practice
  history, written by `logSession()` which **fails open** — so anything analysed while
  that write failed, or before history existed, is metered but never logged, and the
  meter runs ahead. The allowance row on `progress.html` must therefore show the
  **meter** (`usedMin`/`limitMin`), the same figure Out Loud shows: pointing it at the
  history aggregate to match the all-time KPI was tried and traded a cosmetic mismatch
  for a real one — the page disagreed with the recorder about a limit the member is
  subject to. The KPI above is all-time practice, a different question; the caption under
  the bar says which is which.
- **Watch for class collisions in these long single-file pages.** `.ep.go` picked up
  `.go`, the gradient CTA button, and rendered an episode row as an orange button with
  unreadable text — the same shape of bug as the `.oriva` collision. Two-letter utility
  class names are a landmine; scope or rename rather than reuse.
- **A foldable card's body has `overflow:hidden`** so its height can animate, which clips
  anything bleeding past the padding. Row highlights are INSET (no negative margins);
  cards built with `fold:false` get `.nofold`, which restores `overflow:visible`.
- **A card that arrives late should ARRIVE, not appear.** `window.ELCReveal(el, 'cls')`
  (elc-nav.js) animates height from 0 with a short fade and a 6px rise, then **releases**
  the height to auto — a card pinned to a measured pixel height is wrong the moment its
  text rewraps. Flipping `display:none`→`block` puts the appearance and a full-height
  layout shove in the same frame, which reads as a blast; the Arcade's recap, focus and
  "practising this week" cards all used to do that. Under `prefers-reduced-motion` it just
  shows — the point of that setting is stillness.
- **There are no banner slots, and there should not be.** A banner is a place that must be
  filled; `window.ELCNotice(el, {key, tone, icon, html})` (elc-nav.js) is a strip that
  appears only while something is true about THIS member and vanishes when it stops being.
  A top bar would fight the sticky nav for the same 60px, and a side rail has nowhere to
  live in a one-column layout. **A recurring notice must carry its period in the key**
  (`uil-quota-2026-09`, not `uil-quota`) — a notice that can be switched off permanently
  will be, and then the once it mattered it is gone. **A notice about the CURRENT state is
  not dismissible** (the at-zero quota message is rendered directly, with no close button):
  you cannot dismiss a fact. Four exist: the Out Loud **quota warning** (at whichever is
  kinder of a fifth of the allowance or 15 minutes; at zero it becomes a non-dismissible
  statement), and three on the Arcade via `arcadeNotices()` — the **Out Loud launch**
  (`uil-launch`, fired by `window.ELC_SHOW_UIL`, the same switch as the nav tab), the
  **trial** state (`trial-open`, ends by itself), and the **away three weeks** nudge
  (`away-{year}-{week}`, so it can return). **Only ONE ever shows**, in that order — news,
  then state, then nudge: three strips above the games is a wall nobody reads.
  `action:'next'` already loaded the sessions and games, so `lastAt` costs no extra read.
- **Every fetch has a deadline.** `window.ELCFetch(url, opts, ms)` (elc-nav.js) aborts at
  12s by default; `window.ELCBusy(el, html, ms)` shows a placeholder only if the wait passes
  ~450ms, because below that a spinner just flashes and makes a fast page feel slower.
  `progress.html` shows card-shaped skeletons and tells an AbortError apart from a real
  failure — "try again" is good advice for a timeout and poor advice for an outage.
  These live in `elc-nav.js`, so it is a hard dependency of every member page.
- **The account control is `window.ELCAccount(user, {next})`**, also in `elc-nav.js`: an
  initials avatar that opens a card with the member's name, plan and sign-out, replacing
  six copies of "Signed in as … [Sign out]" (which ate the header on phones). Pass
  `{name, plan}` where plan is `fluency|transcript|trial|none`; pass `null` for the
  signed-out card (person avatar, Sign in, tour, theme — no progress or sign-out rows). The card also carries the theme choice and, where the page
  has a tour (`ELCTour.pageTour()`), a "Take the tour" row — **on every page**: where the
  tour can run in place it is a button, everywhere else a link to
  `/practice-arcade.html?elctour=arcade` (elc-tour.js honours that param), so the menu never
  changes shape from page to page and pages need not carry the tour script. Each row sets its own `--rc`
  (violet for progress, teal for the tour, red for sign out): the icon wears it and the
  hover is a 16% wash of it, never grey. `theme.css` re-points `--rc` to a darker step for
  light and changes nothing else. The plan under the name is a raised **tier badge**
  (`.elcnav-card-plan.plan-{fluency|transcript|trial}`): a downward gradient plus three
  shadows implying one light source — inset top highlight, inset bottom shade, outer drop.
  It carries its own ink on its own fill, so only the shadow changes by theme (black reads
  as dirt on paper). Each tier ink is checked against the **dark end** of its gradient, the
  worst case — that is why the violet is `#9a7ff5` and not `--purple`, which failed 4.5:1. **Never write `.elcnav-acct a`** — the card lives inside
  that element, so a descendant selector boxes every row in the old header pill. The card
  hangs off a FIXED/STICKY header, so page scroll cannot bring its bottom into view: at
  ~290px it overran a landscape phone and Sign out became unreachable. It is capped at
  `calc(100dvh - 96px)` and scrolls itself — **check that cap before adding a row**. **`index.html` uses it too** —
  it loads `elc-nav.js` for the control alone (no `#elcnav` slot, so no header is rendered)
  and asks **`/api/me`**, which reads the cookie and nothing else; /api/games would ship the
  whole catalogue to answer a question about one cookie. It is a label, never a gate: every
  gated route still calls `revalidateSession()`. Signed out there, Member Login points at the
  Arcade, not back at the home page. The plan comes from **`planOf(s)` in `lib/session.js`** —
  derived from `cents`, not `s.tier`, which is `'fluency'` for ANY paid pledge and so
  labels a $1 Transcript backer a Fluency member. `api/games.js` ships it as `level`;
  `api/list.js`, `api/progress.js` and `api/out-loud.js` ship it as `plan`.
- **There is no global back button** — the tabs are the way around, and **the games keep
  their minimal bar** — back, brand, account, no tabs (a game is a focus task) — while
  `index.html` keeps its marketing nav. The four standard games DO use the shared account
  control: they load `elc-nav.js` for `ELCAccount` alone (no `#elcnav` slot, so no header is
  rendered). **The game bar carries no brand**: the way out on the left, the account on the
  right, nothing else. A logo inside a game names something the member already knows, and
  the vertical space belongs to the puzzle. **Each game pages between EPISODES of itself** —
  that is the list a member arrives from ("All episodes"). `api/games` returns `prev`/`next`
  with the content, computed from the ordered episode array it already holds, so this costs
  no extra request. The catalogue is newest-first, so `prev` is the NEWER episode, and the
  neighbours **WRAP** — past the oldest is the newest — so no episode is a dead end and
  nothing is ever rendered disabled. A game with a single episode gets `null` both ways
  rather than a link back to itself, and shows no arrows at all. They are carousel arrows measured
  against the **board**, not the window: each game names its play area in `BOARD_SEL`
  (`#grid`, `#game`, `#storyCard` — the five differ and there is no honest way to guess),
  and `placeArrows()` puts each arrow level with that box's middle and just outside its
  edge. It re-runs on resize AND scroll, because two of the boards are rendered after the
  fetch and change height as a round is played. **Below 720px there is no gutter at any board
  size** — the board reaches both screen edges — so the pager stops being an overlay and
  becomes a **footer pager under the board**: two full-width 48px targets that NAME the
  episode they lead to. The fixed arrow could not: it had shed its label to fit, and it sat
  30-36px INSIDE the board at z-index 30, over a card in Phrase Pairs and the tray in
  Sentence Builder, taking the tap with it. Side arrows over content are a desktop
  affordance; a footer pager is what sequential content uses on a phone. `placeArrows()`
  returns early below 720px after clearing every inline `top/left/right` and the `.compact`
  class — rotation crosses that line in both directions, and a stale `.compact` would hide
  the label that is the whole point. The `<nav>` therefore sits at the END of `.wrap`, above
  the footer line: irrelevant while it is fixed, correct once it is in the flow.
  Above 720px, **an arrow never overlaps the board**: `placeArrows()` measures
  the gutter on each side and drops the pill to its icon (`.compact`) when the label will not
  fit, rather than clamping into the board — the old `Math.max(10, …)` pinned it to the
  window edge, which is INSIDE a board that reaches the full column. Even the icon needs
  ~60px, so the four games also widen `.wrap` padding to 64px between 721px and 1240px, where
  the 1100px column would otherwise fill the window and leave no gutter at all. `node
  tools/test-episode-arrows.mjs` runs the real function over that whole range, and asserts
  the phone pager keeps no overlay geometry. `tools/test-episode-pager.js` asserts each `BOARD_SEL`
  actually matches an id in its page — rename one and the arrows silently stop positioning
  without erroring. Clue Room puts its neighbours in the HUD
  menu, having no room for arrows. **Clue Room is the
  exception**: a 3D scene with a kebab HUD rather than a page with a header, and its menu
  reaches the Arcade, sign-out and — since it has no account card to hold it — **the
  theme**, in a segment mirroring `.elcnav-card-theme`. So no page on the site shows the
  floating toggle to someone who has a better place to change it: wherever a card or menu
  owns the theme, that surface calls `ELCTheme.hide()`, which suppresses the element by a
  class on `<html>` and never re-parents it. **Clue Room declares that class in its HEAD**,
  not from its boot block: hiding the toggle after the 3D scene is built means it is
  created, painted and only then removed — a blink on every load.
- **`ELCAccount` adds `.elcnav-acct` to the slot itself.** The card is absolutely
  positioned against that class; a slot without it anchors to whatever ancestor happens
  to be positioned, and the card hangs off the right edge of the screen. The game bars
  did exactly that with a bare `<div id="acct">`. For the same reason `bootAccount()`
  calls **`setFloating()` before it touches the DOM**: whether the floating controls belong
  on a page does not depend on markup, and ELCAccount returns early when `#acct` has not
  been parsed yet — the case on the game pages, where the script sits above the bar. That
  early return was what made the toggle paint and then vanish there.
  Removing each game's `.out` pill rule was part of
  this — the card's Sign out ROW is also `.out`, so leaving it would have painted the old
  pill around it, the same collision as `.ep.go` and `.elcnav-acct a`.
  The four standard games use the shared `.elcback` chevron ("All episodes" — their parent
  is that game's episode list); **Clue Room keeps the pill**, because its back sits over a
  3D scene where a bare text link has nothing to hold contrast against. `tools/audit.py`
  accepts either form. **No game uses
  `history.back()`**: the href already names the parent, and history sends a member arriving
  from a shared link somewhere unrelated. The two pages a level below the Arcade (`arcade-browse.html`,
  `arcade-type.html`) carry a `.elcback` link naming their PARENT ("Practice Arcade",
  "Browse all games"): a breadcrumb step, so it lands in the same place however the
  member arrived — not browser history. **`progress.html` is the exception**: it is a
  top-level tab reachable from every page and from the account card, so a fixed parent is
  wrong more often than right. Its link carries `data-smart`, and `smartBack()` in
  `elc-nav.js` rewrites it from `document.referrer` — but only for a same-origin page it
  can NAME (see the PAGE map; `arcade-type.html` is named by its `?type=`), so the label
  is never a bare URL. Reload, off-site, no referrer, unnamed page → the markup's own href
  stands, which is why it is a real `<a>` and not built in JS. It runs on DOMContentLoaded,
  not inline: `elc-nav.js` is deliberately synchronous (so page scripts find `#acct`), which
  means anything BELOW it in the markup — the back link included — does not exist yet.
- **The Member Archive is hidden from the whole site** until it actually works: no nav
  tab, and every link commented with "Member Archive hidden until it is a working
  feature" (`index.html` x2, `games/clue-room`). `archive.html` still exists at its URL.
- **A new episode is five hand-written blocks that must agree, and the failures are
  silent.** `node tools/test-episode-data.mjs` checks all of it (or one id): same word SET
  in every game (ORDER is free — story-unlock's bank order is display only), a word keeping
  its colour wherever it appears, distinct palette colours, unique clue ids (the 3D scene
  keys its solved set on `id`), a geometry `geom()` actually knows (`ico box sphere torus
  octa dodeca cone cyl` — anything else silently becomes an icosahedron), puzzle answers as
  a permutation of the words with one more segment than answers, covers that exist, a long
  title, and the current episode having a real Out Loud prompt.
  **The phrase must appear as a WHOLE WORD in its Listening Gap and Sentence Builder
  sentences.** That game cuts its blank with `indexOf(phrase)`, so an inflected form strands
  the ending: EP282's "We lingered over coffee" with phrase `linger` rendered as
  "We ___ed over coffee" — a typo-looking artifact AND a giveaway, since only one of six
  options takes *-ed*. Write the sentence around the base form.
- **A game type has ONE icon and accent, in `lib/arcade-data.js`.** `api/games` returns them
  with a game's content, and every surface reads from there: the Arcade shelf, the browse
  tiles, `arcade-type.html`, the progress "Games finished" rows, and the game's own page
  (`#gameIcon`, inline at the START of its h1 — the same `icon + space + name` the Arcade shelf prints). Do not hardcode a glyph on a page — Sentence Builder ended up
  with two identities that way, one of them on a "COMING SOON" card for a game that had
  already shipped. **When a game ships, remove its card from "More on the way" and move
  its emoji into the catalogue** — those cards hardcode a glyph because an unbuilt game
  has no catalogue entry to hold one (`&#127917;` for Role-Play Roulette, `&#9889;` for
  Fast Word Challenge, in `practice-arcade.html`). Editing an icon in `lib/arcade-data.js`
  is NOT enough on its own: `getArcade()` reads KV first and falls back to the file, so
  re-run `node tools/seed-arcade.js` or production keeps the old glyph.
- **`lib/arcade-data.js` is REGENERATED wholesale when an episode is added**, from a source
  outside this repo. Any fix made to that file by hand is therefore temporary: the EP282
  `linger` base form and the "Feels So Good" casing were both restored, then reverted by the
  next episode, then restored again. **Fix the generator's source as well, or it comes back.**
  The pre-push hook now blocks the `linger` shape specifically, but it cannot know about a
  correction it has never been told to look for.
- **A missing clue tile is silent.** `buildIcon()` keeps its canvas placeholder and swallows
  the 404, so the clue renders in the DEVICE's emoji font while its siblings use the baked,
  colour-matched tile — visible only as one clue that looks slightly wrong. Six phrases carry
  hand-drawn artwork instead and are exempt; that list is `slugFor()` in
  `games/clue-room/index.html`, which `tools/test-episode-data.mjs` reads rather than
  duplicating. **Known backlog: 55 tiles are missing across 28 older episodes**, every one of
  them `#ffcd46` or `#1f86c9` — the two colours the palette fix introduced, whose tiles were
  never re-baked. The test fails only for the CURRENT episode and notes the rest.
- **Never redraw Oriva.** Only use the six real PNG poses from the kit
  (celebrate, exercise, happy, point, read, think). If a PNG is absent, hide it gracefully.
- **Conventional one-line git commits** (e.g. `fix(auth): …`, `feat(uil): …`).
- **Two design systems, never mixed:** the marketing/member site uses **Clash Display +
  General Sans** (Fontshare) with the dark "aurora" aesthetic (see `practice-arcade.html`
  / `out-loud.html`); the premium PDF/print pipeline uses **Poppins**.
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
out-loud.html           Out Loud — record & get AI feedback (FLAGGED OFF, see below)
elc-tour.js                guided Oriva tour (home + arcade); auto-runs first visit
api/auth/{login,callback,signout}.js   Patreon OAuth flow
api/{games,list,download,unlock}.js    arcade data, archive list/download, code redemption
api/me.js                  who is signed in + their plan, from the cookie alone (header labels)
api/support.js             help form -> email via Resend; the mailbox never reaches the page
help.html                  quick answers + a message form with screenshots (linked from the account card)
api/progress.js            records game completions + returns practice history / recap / dashboard
progress.html              the member progress page (KPI row, monthly chart, phrase mastery)
api/out-loud.js         Out Loud: usage + audio analysis (Gemini), flag-gated
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
tools/install-hooks.js     node tools/install-hooks.js — installs tools/hooks/* into .git/hooks
tools/hooks/pre-push       the gate: audit.py + test-episode-data.mjs
tools/test-popular.mjs     node tools/test-popular.mjs — asserts the popularity ranking rules
tools/test-stats.mjs       node tools/test-stats.mjs — asserts the public stats floor + rounding
tools/test-progress-kpi.js node tools/test-progress-kpi.js — asserts where each KPI tile leads
tools/test-progress-drawer.js  node … — drives the KPI drawer open/close state machine
tools/test-notice.js       node tools/test-notice.js — notice dismissal + quota thresholds
tools/test-back-link.js    node tools/test-back-link.js — every arrival route for the back link
tools/test-episode-pager.js node … — episode neighbours and the ends of the run
tools/test-sentence-builder.js node … — the tile label: no giveaway, meaningful case kept
tools/test-nav-hint.js     node tools/test-nav-hint.js — asserts the first-frame account hint
tools/test-support.mjs     node tools/test-support.mjs — mailbox never leaks, escaping, abuse limits
tools/test-club-cap.mjs    node … — the club-wide spend ceiling, and that it fails open
tools/test-episode-data.mjs node … [epId] — the catalogue against what the 5 games assume
tools/test-episode-arrows.mjs node … — arrows never sit on the board; the phone pager stays in flow
tools/shadow-align.html    LOCAL page (file://): mp3 + script -> shadowing timings JSON
tools/shadow-build.mjs     node … <script.txt> <aligner.json> -o out.json — joins structure + timings
tools/test-shadow-parse.mjs node … — the shadowing script's structure, parsed out of the aligner
api/stats.js               public club totals for the home page strip (edge-cached)
lib/popular.js             ranks the site-wide play counts (popular episodes / games / pairs)
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
  Fluency-only features (see `api/games.js` and `api/out-loud.js`).
- **Re-check membership on every gated route** with `revalidateSession(res, s)` — it
  refreshes the token, re-confirms with Patreon at most every `RECHECK_HOURS`, backfills
  `cents` on legacy sessions, and returns `null` (clearing the cookie) once a membership
  goes inactive. Without it a cancelled member keeps their access for the cookie's 30 days.
  `api/games.js` and `api/out-loud.js` use it; **`api/list.js` still has its own inline
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

## Out Loud — CURRENT STATE: hidden behind a flag

**The name is "Out Loud", the tagline is "Find your voice."** It was "Use It Live" until the
rename, which happened while the feature was still hidden — no inbound links, no bookmarks,
nothing indexed, so the page and the route were renamed outright with no redirect. "Live"
was a promise the feature does not keep: you record, you wait, the model answers. **The
INTERNALS keep the old name on purpose** — the `uil:` KV prefixes (`uil:min`, `uil:agg`,
`uil:log`, `uil:recapseen`) hold live member data that is not worth migrating, and
`UIL_ENABLED` / `UIL_PREVIEW_TOKEN` / `UIL_PREVIEW_UIDS` are set in the Vercel dashboard,
where a renamed variable silently turns the feature off if one is missed. `SHOW_UIL` and the
`uil:` nav-item flag stay for the same reason. A shipped name and an identifier do not have
to agree.

**Oriva gives the feedback, and the page says so.** The lede used to read "Anna & Jake will
tell you what you did well" — but the feedback is Gemini's, and the only disclosure was in a
`<meta name="description">` no member ever sees. Crediting AI output to two named real
people is the kind of claim that costs trust the moment someone works it out. Oriva is
openly a character and is ALREADY the voice members practise with ("match Oriva's rhythm" in
the shadowing audio), so making Oriva the listener is honest and still warm. The prompt in
`api/out-loud.js` does tell the model to write as Anna & Jake, which is why the page can say
Oriva "answers the way Anna & Jake teach" — note "answers the way", not "trained on": it is
prompted, not fine-tuned, and the copy should not imply otherwise.

Record-and-review speaking practice: the learner records audio, **Gemini** analyses it
(Claude can't take audio) and returns warm feedback (2 wins + 1 gentle tweak,
confidence-focused, never grammar-policing). Metered at **100 audio-minutes/month** per
member (`lib/quota.js`), Fluency-gated.

**The task is derived from the Arcade**, not a second list: `episodeFor()` reads the
clue-room block of the catalogue (`getArcade()`), takes the episode flagged `current`
(or the requested `episodeId`) and uses its six clue words. Long titles come from
`lib/episode-titles.js`. Per-episode hand-written prompts live in `PROMPTS` in
`api/out-loud.js` — **every episode has one**, and `tools/test-episode-data.mjs` fails the CURRENT episode if it does not; `promptFor()` still falls back to a
title-built prompt for any episode added later. Write the real one when you add an episode:
the generic version is useless for a format title like "40 Minutes of Real English", and a
concrete task ("talk about a night you could not switch off") is what a nervous B1 learner
can actually start answering.
Members switch episodes with the picker in the task card (`episodeChoices()` ships the
list with the usage response); `?ep=ep277` deep-links straight to one, and the picker
keeps the URL in step. Switching clears any recorded takes — they would otherwise be
scored against the wrong six words.

**There is a club-wide ceiling as well as a per-member one.** Per-member quota caps ONE
member; total exposure is members x allowance, and nothing watched the sum. `uil:club:{YYYY-MM}`
(seconds) is incremented in the SAME pipeline call as the personal meter — so it costs no extra
round trip, and it cannot drift below the truth and start refusing early. `getClubUsage()` is
checked after the member's own quota and before the model call; over the cap the route returns
`429 {resting:true}` and logs a `console.warn` into the Vercel log. **`resting` is deliberately
its own state**, distinct from `quota` and `busy`: a member with 80 minutes left must never be
told they are out, so the page says the feature is resting and their minutes are safe, and their
recording stays on the page. Like everything else here it **FAILS OPEN** — a spend cap that
locks every paying member out during an Upstash blip is a worse failure than the overspend it
guards against; `UIL_ENABLED=false` is the real stop button. Tune it with `UIL_CLUB_CAP_MIN`
(minutes, default 3000) from the dashboard without a deploy; `node tools/test-club-cap.mjs`
covers the ceiling, the fail-open and the two-meters-one-trip property.

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
- `api/out-loud.js` returns a `coming_soon` 503 unless `UIL_ENABLED=true`.
- `out-loud.html` shows a clean "coming soon" card in that state.
- Nav links are **commented out** — search `Out Loud hidden until verified` across
  `index.html`, `archive.html`, `practice-arcade.html` (and the tour step in `elc-tour.js`).

**Owner preview while hidden** (either):
- open `/out-loud.html?preview=TOKEN` where `TOKEN === UIL_PREVIEW_TOKEN`, or
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
# Out Loud
GEMINI_API_KEY           required for audio analysis (Google AI Studio key)
GEMINI_MODEL             optional, default gemini-3.6-flash (2.5-flash is retired for new keys)
UIL_ENABLED              'true' to open the feature to everyone (default: off)
UIL_PREVIEW_TOKEN        secret for owner ?preview= access while off
UIL_PREVIEW_UIDS         comma-separated uids that bypass the flag
UIL_CLUB_CAP_MIN         club-wide audio minutes per month (default 3000 ~ $8.70); 0 disables
# Help form
RESEND_API_KEY           resend.com API key (the form says "not switched on yet" without it)
SUPPORT_TO               where messages go; comma-separated allowed. NEVER sent to the page
SUPPORT_FROM             sender on the Resend-VERIFIED domain, which is the SUBDOMAIN
                         help.englishleap.app — e.g. English Leap <noreply@help.englishleap.app>.
                         The domain after @ must match it exactly: using @englishleap.app gave
                         Resend 403 "This API key is not authorized to send emails from ..."
```

## Next up / launch checklist

0. ~~Set `PATREON_CAMPAIGN_ID`~~ — **done**: set in Vercel, campaign-membership
   resolution is live and the fallback warning is gone.
1. **Confirm apex-canonical** in Vercel Domains + `PATREON_REDIRECT_URI` = apex callback.
2. **Set `GEMINI_API_KEY`** (Out Loud is inert without it).
3. **Test Out Loud privately** via preview; verify an **iPhone/Safari** recording
   (MP4/AAC) analyses end-to-end, and desktop mics work once OS/browser permission is
   granted (the page shows step-by-step OS guidance on failure).
4. **Launch:** `UIL_ENABLED=true` + uncomment nav/tour.

## Practice history (feeds the future progress dashboard)

`lib/history.js` keeps a bounded record per member, so the free Upstash tier (256MB,
500K commands/month) can't run away:

```
uil:log:{uid}    list  last 100 sessions, newest first (~580B each, hard cap)
                       metadata + the coach's TWO WINS and one tweak, so a member can
                       read their feedback back on the progress page. Never a transcript.
uil:agg:{uid}    hash  NEVER trimmed: {YYYY-MM}:sec, {YYYY-MM}:n, w:{word} counts
elc:games:{uid}  hash  `{type}:{ep}` → ts, bounded by the catalogue (5 types x episodes)
```

**Site-wide play counts** (no uid — these belong to nobody):

```
elc:pop             hash  `{type}:{ep}` -> all-time plays (150 fields at 5 x 30)
elc:pop:{YYYY-Www}  hash  the same, this ISO week, EXPIREd after POP_WEEKS (8)
```

Both ride the pipeline `logGame()` already opens, so a completion is still ONE round trip.
The member's own entry stays idempotent (a replay only moves the timestamp); the counters
take every finish, which is what makes them a frequency. **`logGamesBulk` does not count** —
those completions are historical, and a member signing in on a second device would backfill
twice. **The rolling week is the one to display**: an all-time list is a ratchet that buries
every episode outside the first few to get plays, which is wrong for a product whose value
is the breadth of its vocabulary. **The Arcade shows it, the progress page does not.** "Practising this week"
(`#popWeek` on `practice-arcade.html`, below the member's own focus card — their business
first) is served from **`/api/stats`**, not from the per-member `action:'popular'`: the
progress route is uncached, so every Arcade load would cost a KV read for data identical
for everyone, while `/api/stats` is already edge-cached for ten minutes. It is NOT on
`progress.html` on purpose — that page promises "everything here comes from your own
practice", and social proof belongs where a member CHOOSES, not where they reflect. Tiles
deep-link to `arcade-browse.html?q=EP<n>`, which now pre-fills its search from `?q=`.
`/api/progress` `action:'popular'` returns the three views
(episodes, game types, and the cross-section) plus **`enough`** — false until the leader
clears `MIN_TOP` (20). **Render nothing when `enough` is false**: a "most played" list built
on four plays is noise wearing the costume of a recommendation. Known property: it counts
finishes, so one member replaying hard can skew a quiet week — add a per-member-per-day
dedupe key with a TTL if that ever shows up.

The aggregates are the point: trimming old detail never destroys the long-term growth
story. Ceiling is **~65KB per member, forever**; measured cost is ~9 KV commands per
practice session. **No transcript is stored** (5x the size, and it means holding members' speech); the
wins and tweak that ARE stored are the coach's prose about the session, not the member's
words. Wins were once kept as a COUNT — recordings from before that show only their tweak,
under a neutral heading rather than an empty "what went well". **Metadata only** (5x the size, and it means
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
**The KPI tiles lead somewhere.** Minutes and phrases open+scroll to the card that already
tells their story (no second copy of it); recordings and streak open a drawer under the row,
drawn from `recent` and `weeks` in the dashboard payload — `getSessions()` was already being
called and discarded, so a click costs **no extra request**. The drawer is tied to the tile that opened it three ways — a **connector line** under
that tile (`--cx`, measured from the button rect; opaque on purpose, since a translucent
caret must match whatever the panel composites to over the card, which differs by theme),
the tile's **hue** carried in via `--kc` (colour identifying, not decorating), and a
**header** naming the number in words for anyone who can use neither. The panel closes three ways — a close button in its header, Escape, or the same tile again
— because a toggle nobody can see is not a control. `wireKpi` tracks WHICH panel is up and
never the month filter with it: storing `'recent:2026-08'` there left the Recordings tile
comparing unequal and re-opening instead of closing. A tile whose target
does not exist for that member renders as a plain `<div>`, not a button: an affordance that opens an
empty card is worse than none. `node tools/test-progress-kpi.js` guards exactly that.
**Both of the drawer's numbers are measured once, when it opens** — `max-height` from
`scrollHeight`, `--cx` from the tile's rect — so a rotation invalidates both: the panel
rewraps taller inside the old cap, and the KPI grid reflows 4 -> 2 columns at 760px, moving
the tile the connector points at. `wireKpi` re-measures on resize, as the fold cards already did.
A chart column with sessions is a **way in**: clicking it opens the Recordings drawer
filtered to that month (`recent` ships 24 sessions so the filter has something to find; an
older month whose detail has been trimmed says so rather than showing an empty list).
Phrase episodes sort **closest to owning first** — newest-first buried the one row a member
could finish today. "What next" shows the phrases it means, and the blank first visit names
what will appear instead of showing four zeros.
Each card below it does one more thing than it used to: **Speaking practice** opens with
this month's **allowance meter** (`usedMin`/`limitMin` were in the payload and unused —
"how much have I got left?" is the question members ask unprompted, and it works from the
first session, chart or no chart); **Phrases** rows open to NAME the phrases rather than
only counting them in dots; **Games finished** rows are links into that game wearing its
catalogue `accent`/`icon`. A card built with `fold:false` gets `.nofold`, which restores
`overflow:visible` — `.cardbody`'s `overflow:hidden` is only there to animate a fold, and
on the KPI card it clipped the selected tile.
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

**The tweak must be ANCHORED, or it is always the same tweak.** The schema asked the wins to
be specific and point at real moments, and asked the tweak only to be *about a topic*
("confidence or flow, not a grammar nitpick") — which leaves breathe / slow down / pause, so
every member got "take a slow, deep breath before you record", every session. The prompt now
requires the tweak to name a moment from THIS recording, rules out those default answers
unless the audio genuinely shows rushing or panic, and gives a specific fallback for a fluent
take (name a target word they did not reach for). It also gets a MEMORY: `recentTweaksFor()`
reads the last 6 tweaks out of `uil:log:{uid}` — they are already stored so the progress page
can read feedback back — and tells the model not to repeat itself. One extra KV read per
analysis. `node tools/test-tweak-prompt.mjs` asserts what reaches Gemini; model output cannot
be tested, but the prompt is where the bug was.

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
task card, and named in the "Today's focus" card.
**A focus word is not necessarily an UNUSED one**, and the copy must not say it is. Unowned
means used fewer than `OWNED_AT` times, so `focusFor()` routinely returns a word spoken once
alongside one never spoken — and both were described as "you have not used … out loud yet",
which a member who had just used it could check and did. `focusWhy()` in `lib/coach.js` now
composes the sentence from the counts, and `api/out-loud.js` ships **`focusNew`** (the
never-spoken subset) so the task card can tell them apart without counts of its own. The two
cases deserve different advice anyway: "you have not tried this" and "this needs another
outing to stick" are not one nudge phrased twice. `node tools/test-next-action.mjs` pins
every shape, starting with the reported one. No schedule table needed — the `w:{word}`
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

## Site metrics

**Traffic is Vercel Web Analytics, never KV.** `index.html` carries
`<script defer src="/_vercel/insights/script.js">`; it needs Analytics switched on in the
Vercel dashboard. Counting page loads in KV would burn the 500K/month free tier and count
bots as people, and "unique visitors" would need a cookie we do not want to set. Do not
build a visit counter.

**KV owns the member half**, which no analytics tool can know:

```
elc:stats           hash  games -> completions, uilsec -> seconds analysed
elc:members         set   every uid ever seen  (bounded by membership, not traffic)
elc:active:{week}   set   uids seen this ISO week, EXPIREd after POP_WEEKS
```

Sets, not counters: one member opening the Arcade twice is one member. `touchMember()` is
called from **`api/games.js`** — the hub every member session loads — and NOT from the auth
callback: the cookie lasts 30 days, so counting sign-ins would badly under-count who is
still here. It is fire-and-forget; a statistic must never delay or fail the request.

**`/api/stats` is public and edge-cached** (`s-maxage=600, stale-while-revalidate=3600`),
so a thousand visitors cost ONE KV read — without that, social proof would be the most
expensive thing on the site. It publishes nothing at all below `MIN_MEMBERS` (25), and
rounds every figure **down** (412 -> "400+"): a small true number does more harm than no
number, and an exact one invites arithmetic. The home page strip (`#clubStats`, in the
**Club** section — those are club figures, not the channel's 1.3M) stays `hidden` unless
the response says `show`. No skeleton, no zeros.

`node tools/test-stats.mjs` asserts the floor, the rounding direction, the omissions and
the KV-down path. Note it sets `KV_REST_API_*` **before** a dynamic import: `lib/history.js`
reads them at module load and ESM hoists static imports above every statement.

## Help form

`help.html` answers the four most common questions first (wrong Patreon account, locked
games by tier, where the downloads are, where progress is), then takes a message. It is
linked from **Help & feedback** in the account card, for signed-in and signed-out visitors
alike — someone who cannot sign in is exactly who needs it.

`api/support.js` mails it through Resend (**live** — sending from the verified subdomain
`help.englishleap.app`). **The mailbox address lives only in
`SUPPORT_TO`** and is never echoed: the email goes out from `SUPPORT_FROM` with the visitor's
own address as **Reply-To**, so replying from the inbox answers them directly. A provider
error is logged, never forwarded — Resend's error text can name the recipient.

Screenshots are resized in the browser (longest edge 1600px, JPEG 0.82, white behind
transparency) because a phone PNG is often 3-8MB and Vercel's request body limit is 4.5MB;
the server still enforces 3 files, PNG/JPEG/WebP, 1.5MB each. The page always draws
**exactly three slots** — filled ones show the image with a remove button, the rest are "+"
boxes that open the picker — so the limit is visible before anyone reaches it. Abuse controls: a honeypot
(a bot that fills it is told "sent" and nothing is mailed), and 5 sends per IP per hour in
KV (`support:ip:{ip}`), which **fails open** — blocking a member trying to report a problem
is the worse failure. Every visitor field is escaped before it enters the email HTML.

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
  `out-loud.html` no longer relies on the `MediaRecorder` container at all — it decodes
  each take and re-encodes one WAV, so Chrome/Safari differences stop at decode time.
- Gemini model ids retire: `gemini-2.5-flash` is refused for new API keys with a **404**
  naming its replacement. Default is `gemini-3.6-flash`; override with `GEMINI_MODEL`.
- KV keys: no whitespace/slashes/quotes; `encodeURIComponent` them.
- DEP0169 in logs is harmless (Vercel adapter) — already silenced via
  `lib/quiet-deprecations.js`; import it in any new api route if the warning reappears.
