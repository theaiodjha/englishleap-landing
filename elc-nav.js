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
    archive: '<path d="M4 7v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7"/><path d="M2.5 4.5h19v3h-19z"/><path d="M10 12h4"/>',
    live: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
  };

  var ITEMS = [
    { href: '/practice-arcade.html', label: 'Arcade',      icon: 'arcade',
      match: ['/practice-arcade.html', '/arcade-browse.html', '/arcade-type.html'] },
    { href: '/progress.html',        label: 'Progress',    icon: 'progress', match: ['/progress.html'] },
    { href: '/archive.html',         label: 'Archive',     icon: 'archive',  match: ['/archive.html'] },
    { href: '/use-it-live.html',     label: 'Use It Live', icon: 'live',     match: ['/use-it-live.html'], uil: true }
  ];

  function svg(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }

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
        '<a class="elcnav-brand" href="/"><span class="d"></span>English Leap Club</a>' +
        '<nav class="elcnav-tabs" aria-label="Member sections">' + tabs + '</nav>' +
        '<div class="elcnav-acct" id="acct"></div>' +
      '</header>';

    // Pages fill #acct themselves once they know who is signed in. If a page has nothing
    // to say, fall back to a sign-out link so the slot is never just empty.
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        var a = document.getElementById('acct');
        if (a && !a.innerHTML.trim()) {
          a.innerHTML = '<a class="elcnav-out" href="/api/auth/signout">Sign out</a>';
        }
      }, 600);
    });
  }

  render();
})();
