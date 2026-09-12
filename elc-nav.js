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

  // ELCAccount({name, plan}) signed in, or ELCAccount(null, {next}) signed out.
  window.ELCAccount = function (user, opts) {
    var slot = document.getElementById('acct');
    if (!slot) return;
    var next = (opts && opts.next) || location.pathname;

    if (!user || !user.name) {
      slot.innerHTML = '<a class="elcnav-login" href="/api/auth/login?next=' + encodeURIComponent(next) + '">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6Z"/></svg>' +
        '<span>Member Login</span></a>';
      // No card to hold it, so the floating theme toggle stays where it is.
      if (window.ELCTheme) window.ELCTheme.show();
      return;
    }

    var ini = initials(user.name);
    var plan = PLAN[user.plan] || '';
    var mode = (window.ELCTheme && window.ELCTheme.mode()) || 'auto';
    var tour = (window.ELCTour && window.ELCTour.pageTour && window.ELCTour.pageTour()) || null;

    slot.innerHTML =
      '<button class="elcnav-av" id="acctBtn" type="button" aria-haspopup="true" aria-expanded="false" ' +
        'aria-label="Account: ' + esc(user.name) + '"><span aria-hidden="true">' + esc(ini) + '</span></button>' +
      '<div class="elcnav-card" id="acctCard" role="menu" hidden>' +
        '<div class="elcnav-card-id">' +
          '<span class="elcnav-av lg" aria-hidden="true"><span>' + esc(ini) + '</span></span>' +
          '<span class="elcnav-card-who"><b>' + esc(user.name) + '</b>' +
            (plan ? '<span class="elcnav-card-plan">' + esc(plan) + '</span>' : '') + '</span>' +
        '</div>' +
        '<a class="elcnav-card-row" role="menuitem" href="/progress.html">' +
          svg('progress') + '<span>Your progress</span></a>' +
        (tour ? '<button class="elcnav-card-row" role="menuitem" type="button" id="acctTour">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.2 2.5c-.5.2-.7.6-.7 1.1v.4"/>' +
            '<path d="M12 17h.01"/></svg><span>Take the tour</span></button>' : '') +
        '<div class="elcnav-card-theme" role="group" aria-label="Theme">' +
          '<span class="elcnav-card-theme-lbl">Theme</span>' +
          '<span class="elcnav-seg">' +
            '<button type="button" data-mode="auto"' + (mode === 'auto' ? ' class="on"' : '') +
              ' aria-pressed="' + (mode === 'auto') + '" title="Match local sunrise and sunset">Auto</button>' +
            '<button type="button" data-mode="light"' + (mode === 'light' ? ' class="on"' : '') +
              ' aria-pressed="' + (mode === 'light') + '" aria-label="Light" title="Light">\u2600</button>' +
            '<button type="button" data-mode="dark"' + (mode === 'dark' ? ' class="on"' : '') +
              ' aria-pressed="' + (mode === 'dark') + '" aria-label="Dark" title="Dark">\u263E</button>' +
          '</span>' +
        '</div>' +
        '<button class="elcnav-card-row out" role="menuitem" type="button" id="acctOut">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M15 17l5-5-5-5M20 12H9M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></svg>' +
          '<span>Sign out</span></button>' +
      '</div>';

    // The card now owns both: take the floating controls off this page. Neither element
    // is moved — the theme toggle is hidden by a class and the tour pill is removed —
    // because re-parenting them broke clicks site-wide when it was tried.
    if (window.ELCTheme) window.ELCTheme.hide();
    if (tour && window.ELCTour && window.ELCTour.hideLauncher) window.ELCTour.hideLauncher();

    var btn = document.getElementById('acctBtn');
    var card = document.getElementById('acctCard');
    var open = function (on) {
      card.hidden = !on;
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      btn.classList.toggle('on', !!on);
    };
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(card.hidden); });
    card.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { if (!card.hidden) open(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !card.hidden) { open(false); btn.focus(); }
    });

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

    document.getElementById('acctOut').addEventListener('click', function () {
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

    // Pages call ELCAccount() once they know who is signed in. If a page never does,
    // fall back to the signed-out control so the slot is never just empty.
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        var a = document.getElementById('acct');
        if (a && !a.innerHTML.trim()) window.ELCAccount(null);
      }, 600);
    });
  }

  render();
})();
