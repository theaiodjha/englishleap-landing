/* ===========================================================================
   English Leap — guided tour (buildless, drop-in)
   Add to any page:   <script defer src="/elc-tour.js"></script>
   - Auto-runs once on a first visit (per page), replayable from the launcher.
   - Chains across pages: a step with `nextHref` carries the tour onward.
   - Oriva guides each step. Drop the real PNGs at assets/oriva-<pose>.png
     (poses: happy, point, think, celebrate, read, exercise). If a PNG is
     missing the card still works — the image just hides itself.
   - Edit copy/steps in the TOURS section near the bottom. Target real elements
     by CSS selector; a step whose target isn't on the page is skipped silently.
   =========================================================================== */
(function () {
  if (window.ELCTour) return;

  var CFG = {
    orivaSrc: function (pose) { return '/assets/oriva/' + pose + '.png'; },
    showLauncher: true,           // floating "Take the tour" button
    launcherLabel: 'Take the tour',
    storageKey: 'elc_tour_seen_', // + tour id
  };

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- styles ---------- */
  var CSS =
  '.elct-ov{position:fixed;inset:0;z-index:99998;opacity:0;transition:opacity .25s}' +
  '.elct-ov.show{opacity:1}' +
  '.elct-spot{position:fixed;border-radius:16px;box-shadow:0 0 0 9999px rgba(7,13,18,.80);' +
    'transition:all .3s cubic-bezier(.2,.7,.2,1);pointer-events:none;z-index:99998}' +
  '.elct-spot.none{box-shadow:0 0 0 9999px rgba(7,13,18,.86);width:0;height:0;top:50%;left:50%}' +
  '.elct-card{position:fixed;z-index:99999;max-width:340px;width:calc(100% - 32px);' +
    'background:#0e1a20;border:1px solid #1d3138;border-radius:18px;color:#eaf3f1;' +
    'font-family:"Poppins",system-ui,sans-serif;box-shadow:0 24px 70px -20px rgba(0,0,0,.8);' +
    'padding:18px 18px 16px;opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s}' +
  '.elct-card.show{opacity:1;transform:none}' +
  '.elct-top{display:flex;align-items:flex-start;gap:12px}' +
  '.elct-oriva{width:52px;height:52px;flex:0 0 52px;object-fit:contain;margin-top:-2px}' +
  '.elct-h{font-size:16px;font-weight:600;line-height:1.25;margin:0 0 5px}' +
  '.elct-b{font-size:14px;line-height:1.55;color:#bcd0cc;margin:0}' +
  '.elct-x{position:absolute;top:12px;right:13px;width:24px;height:24px;border:none;background:transparent;' +
    'color:#6f8682;font-size:18px;cursor:pointer;line-height:1;border-radius:6px}' +
  '.elct-x:hover{color:#eaf3f1}' +
  '.elct-foot{display:flex;align-items:center;justify-content:space-between;margin-top:15px;gap:12px}' +
  '.elct-dots{display:flex;gap:6px}' +
  '.elct-dot{width:7px;height:7px;border-radius:50%;background:#28424a;transition:.25s}' +
  '.elct-dot.on{background:#1fc4b6;box-shadow:0 0 10px #1fc4b6aa;transform:scale(1.15)}' +
  '.elct-btns{display:flex;align-items:center;gap:8px}' +
  '.elct-skip{background:none;border:none;color:#6f8682;font-size:12.5px;cursor:pointer;font-family:inherit;padding:6px}' +
  '.elct-skip:hover{color:#9fb4b0}' +
  '.elct-back{background:#11242b;border:1px solid #1d3138;color:#bcd0cc;border-radius:10px;' +
    'padding:9px 13px;font-size:13px;cursor:pointer;font-family:inherit}' +
  '.elct-back:hover{border-color:#1fc4b633}' +
  '.elct-next{background:linear-gradient(135deg,#8b6cff,#1fc4b6);border:none;color:#06201c;' +
    'border-radius:10px;padding:9px 15px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit}' +
  '.elct-launch{position:fixed;right:14px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:99990;' +
    'display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:11px 18px;' +
    'background:linear-gradient(110deg,#8b6cff 0%,#e834a0 55%,#ff7848 100%);border:1.5px solid rgba(255,255,255,.55);' +
    'color:#fff;font:700 13px/1 "Poppins",system-ui,sans-serif;letter-spacing:.01em;cursor:pointer;' +
    'box-shadow:0 8px 22px -6px rgba(232,52,160,.55),0 0 26px -4px rgba(139,108,255,.6)}' +
  '.elct-launch:hover{filter:brightness(1.05);transform:translateY(-1px);' +
    'box-shadow:0 10px 28px -6px rgba(232,52,160,.65),0 0 36px 0 rgba(139,108,255,.72)}' +
  '.elct-launch .d{width:9px;height:9px;border-radius:50%;background:#ffd27a;animation:elctpulse 1.8s infinite}' +
  '@keyframes elctpulse{0%{box-shadow:0 0 0 0 rgba(255,210,122,.55)}70%{box-shadow:0 0 0 7px rgba(255,210,122,0)}100%{box-shadow:0 0 0 0 rgba(255,210,122,0)}}' +
  '@media (max-width:560px){.elct-card{left:16px!important;right:16px!important;bottom:16px!important;' +
    'top:auto!important;max-width:none;width:auto}}' +
  '@media (max-width:640px){.elct-launch{padding:0;width:46px;height:46px;justify-content:center;gap:0}' +
    '.elct-launch .elct-lbl{display:none}.elct-launch .d{width:12px;height:12px}}' +
  '.elct-launch{transition:opacity .28s ease}.elct-launch.elct-hidden{opacity:0;pointer-events:none}' +
  '@media (prefers-reduced-motion:reduce){.elct-ov,.elct-spot,.elct-card,.elct-dot{transition:none}.elct-launch .d{animation:none}}';

  function injectStyles() {
    if (document.getElementById('elct-css')) return;
    var s = document.createElement('style'); s.id = 'elct-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- registry + state ---------- */
  var TOURS = {};
  function define(id, steps) { TOURS[id] = steps; }
  var active = null, idx = 0, dom = null;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- dom ---------- */
  function build() {
    var ov = document.createElement('div'); ov.className = 'elct-ov';
    var spot = document.createElement('div'); spot.className = 'elct-spot';
    var card = document.createElement('div'); card.className = 'elct-card'; card.setAttribute('role', 'dialog');
    card.innerHTML =
      '<button class="elct-x" aria-label="Close tour">&times;</button>' +
      '<div class="elct-top"><img class="elct-oriva" alt="Oriva" />' +
      '<div><h3 class="elct-h"></h3><p class="elct-b"></p></div></div>' +
      '<div class="elct-foot"><div class="elct-dots"></div>' +
      '<div class="elct-btns"><button class="elct-skip">Skip</button>' +
      '<button class="elct-back">Back</button>' +
      '<button class="elct-next">Next</button></div></div>';
    ov.appendChild(spot); document.body.appendChild(ov); document.body.appendChild(card);
    dom = { ov: ov, spot: spot, card: card,
      img: card.querySelector('.elct-oriva'), h: card.querySelector('.elct-h'),
      b: card.querySelector('.elct-b'), dots: card.querySelector('.elct-dots'),
      back: card.querySelector('.elct-back'), next: card.querySelector('.elct-next'),
      skip: card.querySelector('.elct-skip'), x: card.querySelector('.elct-x') };
    dom.img.onerror = function () { dom.img.style.display = 'none'; };
    dom.next.onclick = next; dom.back.onclick = prev;
    dom.skip.onclick = end; dom.x.onclick = end;
    requestAnimationFrame(function () { ov.classList.add('show'); card.classList.add('show'); });
  }

  function cur() { return TOURS[active][idx]; }

  function render() {
    var steps = TOURS[active], step = steps[idx];
    var target = step.sel ? document.querySelector(step.sel) : null;
    if (step.sel && !target) {            // selector not on page -> skip
      if (idx < steps.length - 1) { idx++; return render(); }
      return end();
    }
    dom.img.style.display = '';
    dom.img.src = CFG.orivaSrc(step.pose || 'point');
    dom.h.textContent = step.title || '';
    dom.b.textContent = step.body || '';
    // dots
    dom.dots.innerHTML = '';
    for (var i = 0; i < steps.length; i++) {
      var d = document.createElement('span');
      d.className = 'elct-dot' + (i === idx ? ' on' : ''); dom.dots.appendChild(d);
    }
    dom.back.style.visibility = idx === 0 ? 'hidden' : 'visible';
    var last = idx === steps.length - 1;
    dom.next.textContent = step.nextLabel || (step.nextHref ? 'Next \u2192' : (last ? 'Done' : 'Next'));
    if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    setTimeout(function () { position(target); }, reduced ? 0 : 300);
  }

  function position(target) {
    var spot = dom.spot, card = dom.card;
    if (!target) {
      spot.className = 'elct-spot none';
      card.style.top = '50%'; card.style.left = '50%';
      card.style.transform = 'translate(-50%,-50%)';
      return;
    }
    spot.className = 'elct-spot';
    var r = target.getBoundingClientRect(), pad = 8;
    spot.style.top = (r.top - pad) + 'px'; spot.style.left = (r.left - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
    if (window.innerWidth <= 560) { card.style.transform = 'none'; return; } // CSS bottom-sheet
    var cw = card.offsetWidth, ch = card.offsetHeight, gap = 14, top, left;
    if (r.bottom + gap + ch < window.innerHeight) top = r.bottom + gap;       // below
    else if (r.top - gap - ch > 0) top = r.top - gap - ch;                   // above
    else top = Math.max(16, (window.innerHeight - ch) / 2);                  // center vert
    left = Math.min(Math.max(16, r.left + r.width / 2 - cw / 2), window.innerWidth - cw - 16);
    card.style.transform = 'none'; card.style.top = top + 'px'; card.style.left = left + 'px';
  }

  function next() {
    var step = cur();
    if (step.nextHref) { markSeen(); window.location.href = step.nextHref; return; }
    if (idx < TOURS[active].length - 1) { idx++; render(); } else { end(); }
  }
  function prev() { if (idx > 0) { idx--; render(); } }

  function reposition() { if (active && dom) { var s = cur(); position(s.sel ? document.querySelector(s.sel) : null); } }
  function onKey(e) {
    if (!active) return;
    if (e.key === 'Escape') end();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  function markSeen() { if (active) safeSet(CFG.storageKey + active, '1'); }

  function start(id, from) {
    var steps = TOURS[id]; if (!steps || !steps.length) return;
    injectStyles();
    if (!dom) build();
    dom.ov.style.display = ''; dom.card.style.display = '';
    active = id; idx = from || 0; render();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition, { passive: true });
    window.addEventListener('scroll', reposition, { passive: true });
  }

  function end() {
    markSeen();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition);
    if (dom) {
      dom.ov.classList.remove('show'); dom.card.classList.remove('show');
      setTimeout(function () { if (dom) { dom.ov.style.display = 'none'; dom.card.style.display = 'none'; } }, 260);
    }
    active = null;
  }

  /* ---------- launcher + autostart ---------- */
  function detectPageTour() {
    if (/practice-arcade/.test(location.pathname)) return 'arcade';
    if (document.querySelector('#ecosystem')) return 'home';
    return null;
  }
  function mountLauncher() {
    if (!CFG.showLauncher || document.querySelector('.elct-launch')) return;
    var tour = detectPageTour(); if (!tour) return;
    var b = document.createElement('button'); b.className = 'elct-launch';
    b.innerHTML = '<span class="d"></span><span class="elct-lbl">' + CFG.launcherLabel + '</span>';
    b.onclick = function () { start(tour); };
    document.body.appendChild(b);
    // Stack above the theme toggle only when it's actually floating (desktop);
    // on mobile the toggle lives in the menu, so the launcher uses its base spot.
    function positionLauncher() {
      var tg = document.getElementById('elc-theme-toggle');
      var floating = tg && getComputedStyle(tg).position === 'fixed' && tg.offsetParent !== null;
      if (floating) { var h = tg.getBoundingClientRect().height || 40; b.style.bottom = 'calc(' + Math.round(h + 34) + 'px + env(safe-area-inset-bottom))'; }
      else { b.style.bottom = 'calc(22px + env(safe-area-inset-bottom))'; }
    }
    [80, 400, 900, 1600].forEach(function (t) { setTimeout(positionLauncher, t); });
    window.addEventListener('resize', positionLauncher);
    try { matchMedia('(max-width:1080px)').addEventListener('change', function () { setTimeout(positionLauncher, 80); }); } catch (e) {}
    var elctLastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      if (Math.abs(y - elctLastY) < 10) return;
      if (y > elctLastY && y > 240) b.classList.add('elct-hidden'); else b.classList.remove('elct-hidden');
      elctLastY = y;
    }, { passive: true });
  }
  function autostart() {
    injectStyles();
    var q = new URLSearchParams(location.search).get('elctour');
    if (q && TOURS[q]) { start(q); mountLauncher(); return; }
    var t = detectPageTour();
    if (t && !safeGet(CFG.storageKey + t)) start(t);
    mountLauncher();
  }

  window.ELCTour = { define: define, start: start, end: end, config: function (o) { for (var k in o) CFG[k] = o[k]; }, autostart: autostart };

  /* =======================================================================
     TOUR CONTENT — edit freely. Plain B1–B2 English, short and warm.
     Targets use your real section ids / links; missing targets are skipped.
     ======================================================================= */
  define('home', [
    { sel: null, pose: 'happy',
      title: "Hi, I'm Oriva \u2014 welcome!",
      body: "Let me give you a quick 60-second tour of English Leap. Tap Next." },
    { sel: '#ecosystem', pose: 'point',
      title: 'Three steps, one journey',
      body: 'Watch free on YouTube, practise in the Club, and master English with your AI coach. It all connects.' },
    { sel: '#watch', pose: 'point',
      title: '1 \u00b7 Watch \u2014 always free',
      body: 'New podcast episodes every week. This is where everyone starts \u2014 no account needed.' },
    { sel: '#episodes', pose: 'happy',
      title: 'This week\u2019s episodes',
      body: 'Every episode turns into a practice pack. Play the latest free, or grab the full pack \u2014 new one lands each week.' },
    { sel: '#club', pose: 'think',
      title: '2 \u00b7 The Club \u2014 where you practise',
      body: 'Every episode becomes a pack you keep: read it, hear it, practise it, use it. Transcript Library is $1, Fluency Club is $2.99 \u2014 both start with a free week.' },
    { sel: '#free', pose: 'happy',
      title: 'Free to start',
      body: 'Hundreds of free episodes, the podcast on Spotify, and a 2-minute survey \u2014 the first 100 people get 50% off the AI coach.' },
    { sel: 'a[href*="practice-arcade"]', pose: 'point',
      title: 'Play this week\u2019s game',
      body: 'The Practice Arcade has one mini-game per episode. Let me open it and show you how to get in.',
      nextHref: 'practice-arcade.html?elctour=arcade', nextLabel: 'Open the Arcade \u2192' },
  ]);

  define('arcade', [
    { sel: null, pose: 'happy',
      title: 'Welcome to the Practice Arcade',
      body: 'One set of mini-games per episode \u2014 they turn the week\u2019s six phrases into something you actually do. Quick look around?' },
    { sel: '#playFree', pose: 'point',
      title: 'Start free, right now',
      body: 'The Clue Room is free for everyone \u2014 no account needed. Tap this to jump straight into this week\u2019s game.' },
    { sel: '#featured', pose: 'happy',
      title: 'Your free game',
      body: 'Here\u2019s the free Clue Room. Tip: tap the cover to watch a short \u201cHow to play\u201d before you start.' },
    { sel: '#shelfWrap', pose: 'think',
      title: 'More games \u2014 some are members-only',
      body: 'Browse the rest with the arrows. A \ud83d\udd12 means it needs a tier: Phrase Pairs unlocks at $1, the Fluency games at $2.99.' },
    { sel: '#thisweekSec', pose: 'point',
      title: 'This week\u2019s phrases',
      body: 'These are the six phrases from the latest episode, and the games that drill them.' },
    { sel: '.journey', pose: 'point',
      title: 'How it all fits',
      body: 'Watch \u2192 Read \u2192 Play \u2192 Speak. That\u2019s the loop that turns a 10-minute episode into English you can use.' },
    // Use It Live tour step hidden until verified
    { sel: '#convo', pose: 'think',
      title: 'Unlock everything',
      body: 'Free players get the Clue Room. Fluency Club opens every game for every episode \u2014 and you can start with a free week.' },
    { sel: '#code', pose: 'happy',
      title: 'Got a member code?',
      body: 'If we sent you a code, drop it in here to unlock your games instantly.' },
    { sel: 'a[href*="/api/auth/login"]', pose: 'point',
      title: 'Already a member? Sign in once',
      body: 'Connect with Patreon a single time \u2014 the page remembers you, so the games just open whenever you come back.' },
  ]);

  define('arcade-games', [
    { sel: '[data-elc="game-clue-room"]', pose: 'point',
      title: 'Clue Room \u2014 free for everyone',
      body: 'Start here. No tier needed \u2014 warm up with this week\u2019s clues.' },
    { sel: '[data-elc="game-phrase-pairs"]', pose: 'think',
      title: 'Phrase Pairs \u2014 Transcript Library ($1+)',
      body: 'Match each phrase to its meaning. Unlocks with the $1 tier and up.' },
    { sel: '[data-elc="game-listening-gap"]', pose: 'point',
      title: 'Listening Gap \u2014 Fluency Club ($2.99)',
      body: 'Listen, then tap the phrase that fills the gap. Part of the $2.99 Fluency Club.' },
    { sel: '[data-elc="game-story-unlock"]', pose: 'celebrate',
      title: 'Story Unlock \u2014 Fluency Club ($2.99)',
      body: 'Place every phrase to unlock the episode\u2019s mini-story \u2014 plus a bonus ending. Also Fluency Club.' },
  ]);

  /* ---------- run ---------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autostart);
  else autostart();
})();
