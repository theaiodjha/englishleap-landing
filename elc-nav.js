/* elc-nav.js — the one member header, rendered from a single definition.
 *
 * Six pages previously carried five different headers (.topbar, .hd, .bar, .nav …) with
 * drifting labels ("Arcade" vs "Practice Arcade") and inconsistent destinations — Progress
 * and Use It Live did not link to each other at all. Defining the items once makes that
 * class of bug impossible.
 *
 * Usage: put `<div id="elcnav"></div><script src="/elc-nav.js"></script>` at the top of
 * .wrap. It renders synchronously at that point, so a page's own scripts (which look for
 * #acct) always find the markup already in place.
 *
 * The games deliberately do NOT use this: a game is a focus task and keeps its minimal
 * back-only bar. index.html keeps its marketing nav.
 */
(function () {
  // Use It Live is still hidden behind UIL_ENABLED — flip this the day it launches.
  var SHOW_UIL = false;
  // published so a page can announce the launch from the same single switch
  window.ELC_SHOW_UIL = SHOW_UIL;

  var ICON = {
    arcade: '<path d="M7 12h4M9 10v4"/><circle cx="15.5" cy="11" r="1"/><circle cx="17.5" cy="13.5" r="1"/>' +
            '<rect x="2.5" y="6.5" width="19" height="11" rx="4"/>',
    progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    live: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
  };

  var ITEMS = [
    { href: '/practice-arcade.html', label: 'Arcade',      icon: 'arcade',
      match: ['/practice-arcade.html', '/arcade-browse.html', '/arcade-type.html'] },
    { href: '/progress.html',        label: 'Progress',    icon: 'progress', match: ['/progress.html'] },
    { href: '/use-it-live.html',     label: 'Use It Live', icon: 'live',     match: ['/use-it-live.html'], uil: true }
  ];

  function svg(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  // ---- the smart back link ------------------------------------------------
  // Most back links name a fixed PARENT, which is right when a page sits in a hierarchy
  // (a game type belongs under "browse all games" however you got there). Progress is
  // not like that: it is a top-level tab reachable from every page and from the account
  // card, so a fixed parent is a guess that is wrong more often than it is right. For
  // those, `data-smart` rewrites the link from document.referrer — but only for a page
  // on this site that we can NAME, so the label is never a bare URL. Anything else
  // (typed in, reloaded, arrived from outside, referrer suppressed) keeps the markup's
  // own href, which is why it is written as a real link and not built here.
  var PAGE = {
    '/practice-arcade.html': 'Practice Arcade',
    '/arcade-browse.html': 'Browse the arcade',
    '/use-it-live.html': 'Use It Live',
    '/help.html': 'Help',
    '/archive.html': 'Member Archive'
  };

  function titleCase(t) {
    return String(t || '').split('-').filter(Boolean).map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  function nameFor(u) {
    var path = u.pathname.replace(/index\.html$/, '') || '/';
    if (path === '/arcade-type.html') {
      // the game's own name reads better than "the game type page"
      var t = titleCase(u.searchParams.get('type'));
      return t || 'Browse the arcade';
    }
    // /games/phrase-pairs/ -> "Phrase Pairs". Leaving a game to check Progress and coming
    // back should return to the GAME, not to the Arcade.
    var game = path.match(/^\/games\/([a-z0-9-]+)\/?$/);
    if (game) return titleCase(game[1]);
    if (path === '/') return 'Home';
    return PAGE[path] || null;
  }

  function smartBack() {
    var link = document.querySelector('a.elcback[data-smart]');
    if (!link || !document.referrer) return;
    var u;
    try { u = new URL(document.referrer); } catch (e) { return; }
    if (u.origin !== location.origin) return;                    // came from off-site
    if (u.pathname === location.pathname) return;                // a reload, not a journey
    var name = nameFor(u);
    if (!name) return;                                           // unnamed page: keep the fallback
    link.href = u.pathname + u.search;
    var label = link.querySelector('span');
    if (label) label.textContent = name;
  }

  /* ---- revealing a card that arrived late ----------------------------------
     A card that waits on a fetch and then flips display:none -> block appears at full
     opacity AND shoves the page down by its whole height, in one frame. Animating the
     height makes the push followable. */
  window.ELCReveal = function (el, cls) {
    if (!el) return;
    if (cls) el.classList.add.apply(el.classList, cls.split(' '));
    else el.hidden = false;

    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduced) return;                       // the whole point of that setting is stillness

    var h = el.scrollHeight;
    if (!h) return;
    var st = el.style;
    st.overflow = 'hidden'; st.height = '0px'; st.opacity = '0'; st.transform = 'translateY(-6px)';
    void el.offsetHeight;                      // commit the start state before transitioning
    st.transition = 'height .38s cubic-bezier(.22,1,.36,1),opacity .32s ease,transform .38s cubic-bezier(.22,1,.36,1)';
    st.height = h + 'px'; st.opacity = '1'; st.transform = 'none';

    el.addEventListener('transitionend', function done(e) {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', done);
      // release it: a card pinned to a measured height is wrong as soon as text rewraps
      st.height = ''; st.overflow = ''; st.transition = ''; st.transform = '';
    });
  };

  /* ---- notice strips -------------------------------------------------------
     ELCNotice(el, {key, tone, icon, html}) renders one strip into `el`, or nothing at all
     if this device has dismissed that key. Returns true if it rendered.

     The KEY should carry a period where the notice recurs — 'quota-2026-09' rather than
     'quota' — so dismissing this month's warning does not silence next month's. A notice
     that can be permanently switched off is a notice that will be, and then the one time
     it mattered it will not be there. */
  var SEEN_KEY = 'elc-notice-seen';

  function seenSet() {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function markSeen(key) {
    try {
      var set = seenSet();
      set.add(key);
      // Array.from, NOT slice.call: a Set has no length, so slice.call returns [] and every
      // dismissal is silently forgotten. Bounded because old periods never recur.
      localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set).slice(-40)));
    } catch (e) {}
  }

  window.ELCNotice = function (el, o) {
    if (!el || !o || !o.key) return false;
    if (seenSet().has(o.key)) return false;
    el.innerHTML =
      '<div class="elcnotice ' + (o.tone || '') + '" role="status">' +
        '<span class="ni" aria-hidden="true">' + (o.icon || '') + '</span>' +
        '<span class="nt">' + (o.html || '') + '</span>' +
        '<button type="button" class="nx" aria-label="Dismiss">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
            'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>';
    el.querySelector('.nx').addEventListener('click', function () {
      markSeen(o.key);
      el.innerHTML = '';
    });
    return true;
  };

  /* ---- slow and dead responses ---------------------------------------------
     fetch() has no timeout of its own: a hung connection hangs until the browser gives
     up, which can be minutes, with the page showing nothing and saying nothing. */
  window.ELCFetch = function (url, opts, ms) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 12000);
    var o = {};
    for (var k in (opts || {})) o[k] = opts[k];
    if (ctl) o.signal = ctl.signal;
    return fetch(url, o).then(
      function (r) { clearTimeout(t); return r; },
      function (e) { clearTimeout(t); throw e; }
    );
  };

  /* A placeholder that only appears if the wait is long enough to notice. Under ~450ms a
     spinner reads as a flash of clutter and makes a quick page feel slower than it was.
     Returns a function to call when the real content is ready. */
  window.ELCBusy = function (el, html, ms) {
    if (!el) return function () {};
    var shown = false;
    var t = setTimeout(function () { shown = true; el.innerHTML = html; }, ms || 450);
    return function () { clearTimeout(t); if (shown) el.innerHTML = ''; };
  };

  /* ---- the first-frame hint ------------------------------------------------
     Being signed in is an HttpOnly cookie, so a page cannot know it without asking the
     server. Remembering the last answer lets the header and the floating controls settle
     on the FIRST frame instead of after a round trip — which is what was causing the
     theme toggle and tour pill to appear and then vanish on every navigation. */
  var HINT_KEY = 'elc-acct';

  function readHint() {
    try {
      var h = JSON.parse(localStorage.getItem(HINT_KEY) || 'null');
      return (h && h.name) ? h : null;
    } catch (e) { return null; }
  }
  function writeHint(user) {
    try {
      if (user && user.name) localStorage.setItem(HINT_KEY, JSON.stringify({ name: user.name, plan: user.plan }));
      else localStorage.removeItem(HINT_KEY);
    } catch (e) {}
  }

  /* Whether the floating theme toggle and tour pill should exist on this page. Expressed
     as classes on <html> so it holds for elements that have not been created yet — script
     order stops mattering. */
  function setFloating(signedIn) {
    var d = document.documentElement;
    if (!d || !d.classList) return;
    d.classList.toggle('elc-nofloat-theme', !!signedIn);
    d.classList.toggle('elc-nolaunch', !!signedIn);
  }

  // ---- the account control -------------------------------------------------
  // An avatar with the member's initials; clicking it opens a card with their name,
  // plan and sign-out. Six pages previously printed "Signed in as Fahad" plus a bare
  // button into the header, which ate horizontal room on phones and read as a form
  // control rather than an account.
  var PLAN = {
    fluency: 'Fluency Club', transcript: 'Transcript Library',
    trial: 'Free trial', none: ''
  };

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // "Mohammad Fahad" -> MF, "Fahad" -> F. Non-Latin names keep their first character,
  // so an initial is never an empty circle.
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var first = Array.from(parts[0])[0] || '';
    var last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] || '') : '';
    return (first + last).toUpperCase();
  }

  // elc-tour.js honours ?elctour=<id> on load, so a page with no tour of its own can still
  // offer one without carrying the script.
  var TOURHREF = '/practice-arcade.html?elctour=arcade';
  var TOURICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.2 2.5c-.5.2-.7.6-.7 1.1v.4"/>' +
      '<path d="M12 17h.01"/></svg>';

  // ELCAccount({name, plan}) signed in, or ELCAccount(null, {next}) signed out.
  var PERSON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6Z"/></svg>';

  /* ELCAccount({name, plan}) for a member, ELCAccount(null, {next}) for anyone signed out.
     BOTH get the avatar and the card — the card is the only home of the theme choice and
     the tour, so a signed-out visitor needs it as much as a member does. */
  window.ELCAccount = function (user, opts) {
    var slot = document.getElementById('acct');
    if (!slot) return;
    /* The card is absolutely positioned and anchors to .elcnav-acct{position:relative}.
       Without the class it resolves against whatever ancestor happens to be positioned and
       hangs off the edge of the screen — which is what the game bars did. Add it here so a
       page cannot get this wrong by omission. */
    slot.classList.add('elcnav-acct');
    var next = (opts && opts.next) || (location.pathname + (location.search || ''));
    var provisional = !!(opts && opts.hint === true);   // drawn from cache or as a default
    var signedIn = !!(user && user.name);

    // the floating corner controls are retired everywhere; the classes stay as a guard in
    // case a cached old theme.js / elc-tour.js still creates them for one more load
    setFloating(true);
    if (!provisional) writeHint(signedIn ? user : null);

    var mode = (window.ELCTheme && window.ELCTheme.mode()) || 'auto';
    var tour = (window.ELCTour && window.ELCTour.pageTour && window.ELCTour.pageTour()) || null;
    var ini = signedIn ? initials(user.name) : '';
    var plan = signedIn ? (PLAN[user.plan] || '') : '';

    var avatar = signedIn
      ? '<button class="elcnav-av" id="acctBtn" type="button" aria-haspopup="true" aria-expanded="false" ' +
          'aria-label="Account: ' + esc(user.name) + '"><span aria-hidden="true">' + esc(ini) + '</span></button>'
      : '<button class="elcnav-av anon" id="acctBtn" type="button" aria-haspopup="true" aria-expanded="false" ' +
          'aria-label="Account: sign in">' + PERSON + '</button>';

    var idBlock = signedIn
      ? '<div class="elcnav-card-id">' +
          '<span class="elcnav-av lg" aria-hidden="true"><span>' + esc(ini) + '</span></span>' +
          '<span class="elcnav-card-who"><b>' + esc(user.name) + '</b>' +
            (plan ? '<span class="elcnav-card-plan plan-' + esc(user.plan) + '">' + esc(plan) + '</span>' : '') +
          '</span></div>'
      : '<div class="elcnav-card-id">' +
          '<span class="elcnav-av lg anon" aria-hidden="true">' + PERSON + '</span>' +
          '<span class="elcnav-card-who"><b>Welcome</b>' +
            '<span class="elcnav-card-sub">Sign in with your Patreon account</span></span></div>' +
        '<a class="elcnav-card-row r-signin" role="menuitem" href="/api/auth/login?next=' +
          encodeURIComponent(next) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></svg>' +
          '<span>Sign in</span></a>';

    var tourRow = tour
      ? '<button class="elcnav-card-row r-tour" role="menuitem" type="button" id="acctTour">' + TOURICON +
          '<span>Take the tour</span></button>'
      : '<a class="elcnav-card-row r-tour" role="menuitem" href="' + TOURHREF + '">' + TOURICON +
          '<span>Take the tour</span></a>';

    // help is for everyone, and most useful to someone who cannot sign in
    var helpRow =
      '<a class="elcnav-card-row r-help" role="menuitem" href="/help.html">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>' +
          '<path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>' +
        '<span>Help &amp; feedback</span></a>';

    var themeRow =
      '<div class="elcnav-card-theme" role="group" aria-label="Theme">' +
        '<span class="elcnav-card-theme-lbl">Theme</span>' +
        '<span class="elcnav-seg">' +
          '<button type="button" data-mode="auto"' + (mode === 'auto' ? ' class="on"' : '') +
            ' aria-pressed="' + (mode === 'auto') + '" title="Match local sunrise and sunset">Auto</button>' +
          '<button type="button" data-mode="light"' + (mode === 'light' ? ' class="on"' : '') +
            ' aria-pressed="' + (mode === 'light') + '" aria-label="Light" title="Light">☀</button>' +
          '<button type="button" data-mode="dark"' + (mode === 'dark' ? ' class="on"' : '') +
            ' aria-pressed="' + (mode === 'dark') + '" aria-label="Dark" title="Dark">☾</button>' +
        '</span>' +
      '</div>';

    var memberRows = signedIn
      ? '<a class="elcnav-card-row r-progress" role="menuitem" href="/progress.html">' +
          svg('progress') + '<span>Your progress</span></a>'
      : '';

    var signOut = signedIn
      ? '<button class="elcnav-card-row out" role="menuitem" type="button" id="acctOut">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M15 17l5-5-5-5M20 12H9M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></svg>' +
          '<span>Sign out</span></button>'
      : '';

    slot.innerHTML = avatar +
      '<div class="elcnav-card" id="acctCard" role="menu" hidden>' +
        idBlock + memberRows + tourRow + helpRow + themeRow + signOut +
      '</div>';

    var btn = document.getElementById('acctBtn');
    var card = document.getElementById('acctCard');
    var open = function (on) {
      card.hidden = !on;
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      btn.classList.toggle('on', !!on);
    };
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(card.hidden); });
    card.addEventListener('click', function (e) { e.stopPropagation(); });
    // bound once per page, however many times the control re-renders
    if (!window.__elcAcctBound) {
      window.__elcAcctBound = true;
      document.addEventListener('click', function () {
        var c = document.getElementById('acctCard'), b = document.getElementById('acctBtn');
        if (c && !c.hidden) { c.hidden = true; if (b) { b.setAttribute('aria-expanded', 'false'); b.classList.remove('on'); } }
      });
      document.addEventListener('keydown', function (e) {
        var c = document.getElementById('acctCard'), b = document.getElementById('acctBtn');
        if (e.key === 'Escape' && c && !c.hidden) {
          c.hidden = true;
          if (b) { b.setAttribute('aria-expanded', 'false'); b.classList.remove('on'); b.focus(); }
        }
      });
    }

    var seg = card.querySelector('.elcnav-seg');
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (window.ELCTheme) window.ELCTheme.set(b.dataset.mode);
      Array.prototype.forEach.call(seg.querySelectorAll('button'), function (x) {
        var on = x === b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });

    var tourBtn = document.getElementById('acctTour');
    if (tourBtn) tourBtn.addEventListener('click', function () {
      open(false);
      window.ELCTour.start(tour);
    });

    var outBtn = document.getElementById('acctOut');
    if (outBtn) outBtn.addEventListener('click', function () {
      writeHint(null);          // so the next page does not paint a stale avatar
      fetch('/api/auth/signout', { method: 'POST' })
        .catch(function () {})
        .then(function () { location.href = '/'; });
    });
  };

  function render() {
    var slot = document.getElementById('elcnav');
    if (!slot) return;
    var path = location.pathname.replace(/index\.html$/, '') || '/';
    var tabs = ITEMS.filter(function (i) { return SHOW_UIL || !i.uil; }).map(function (i) {
      var on = i.match.some(function (m) { return path === m || path === m.replace('.html', ''); });
      return '<a href="' + i.href + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' +
             svg(i.icon) + '<span>' + i.label + '</span></a>';
    }).join('');

    slot.outerHTML =
      '<header class="elcnav">' +
        '<a class="elcnav-brand" href="/">' +
          '<span class="mark"><img src="/assets/brand/elc-icon-64.png" alt="" width="30" height="30"></span>' +
          'English Leap</a>' +
        '<nav class="elcnav-tabs" aria-label="Member sections">' + tabs + '</nav>' +
        '<div class="elcnav-acct" id="acct"></div>' +
      '</header>';

    // frost the bar once the page has moved, exactly as index.html does
    var bar = document.querySelector('.elcnav');
    if (bar) {
      var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 12); };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

  }

  /* Draw the last known account straight away, so the header does not pop in and the
     floating controls are never created visible. The page's own fetch calls ELCAccount()
     again with the truth a moment later.

     Deliberately OUTSIDE render(): index.html carries #acct but no #elcnav (it keeps its
     own marketing nav), and render() returns early without that slot — so putting this
     there silently skipped the busiest page on the site. */
  function bootAccount() {
    /* Draw the control on the FIRST frame: the remembered account if there is one, the
       signed-out card if not. Both are the same circle in the same place, so when the
       page's own fetch answers, a correction is a glyph change inside the circle rather
       than a layout jump. The floating corner controls are retired, so this is also the
       only theme control the page has — it must not wait on a round trip. */
    setFloating(true);
    var hint = readHint();
    var draw = function () { window.ELCAccount(hint, { hint: true }); };
    if (document.getElementById('acct')) draw();
    else document.addEventListener('DOMContentLoaded', draw);
  }

  render();
  bootAccount();

  /* The back link sits BELOW this script in the document, so it does not exist yet when
     this file runs (the header is rendered synchronously on purpose, so page scripts can
     find #acct). Wait for the parse to finish before looking for it. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', smartBack);
  else smartBack();
})();
