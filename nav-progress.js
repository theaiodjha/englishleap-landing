/* nav-progress.js — lightweight navigation feedback for the static site.
   On any internal link / nav button click: shows a top progress bar and keeps the
   clicked element highlighted (with a spinner on buttons) so the user knows their
   tap is being processed during the few seconds a page can take to load.
   Dependency-free; safe to include on every page. */
(function () {
  if (window.__elcNav) return; window.__elcNav = 1;

  var css =
    '#elc-navbar{position:fixed;top:0;left:0;height:3px;width:0;z-index:100000;' +
    'background:linear-gradient(90deg,#f6479a,#ff8a63,#ffcd46,#1fc4b6);' +
    'box-shadow:0 0 12px rgba(255,138,99,.55);opacity:0;' +
    'transition:width .25s ease,opacity .3s ease;pointer-events:none;border-radius:0 3px 3px 0}' +
    'a.elc-navloading{opacity:1 !important}' +
    'nav a.elc-navloading,header a.elc-navloading,.navlink.elc-navloading,a.elc-navloading.active{filter:brightness(1.14)}' +
    'button.elc-navloading,.btn.elc-navloading,a.btn.elc-navloading{cursor:progress;opacity:.9}' +
    'button.elc-navloading::after,.btn.elc-navloading::after{content:"";display:inline-block;width:13px;height:13px;' +
    'margin-left:9px;vertical-align:-2px;border:2px solid currentColor;border-right-color:transparent;' +
    'border-radius:50%;animation:elcspin .6s linear infinite}' +
    '@keyframes elcspin{to{transform:rotate(360deg)}}' +
    '@media (prefers-reduced-motion:reduce){#elc-navbar{transition:opacity .3s ease}button.elc-navloading::after,.btn.elc-navloading::after{animation:none}}';
  var st = document.createElement('style'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var bar, w = 0, timer = null;
  function ensureBar() { if (!bar) { bar = document.createElement('div'); bar.id = 'elc-navbar'; (document.body || document.documentElement).appendChild(bar); } return bar; }
  function set(p) { w = p; ensureBar().style.width = p + '%'; }
  function start() {
    if (timer) return;
    ensureBar(); bar.style.opacity = '1'; set(8);
    timer = setInterval(function () {
      // trickle toward 90% with shrinking steps (NProgress-style)
      var step = w < 50 ? 9 : w < 75 ? 4 : w < 90 ? 1.5 : 0;
      if (step) set(Math.min(90, w + step));
    }, 360);
  }
  function done() { if (timer) { clearInterval(timer); timer = null; } if (!bar) return; set(100); setTimeout(function () { bar.style.opacity = '0'; setTimeout(function () { set(0); }, 320); }, 200); }
  function reset() { if (timer) { clearInterval(timer); timer = null; } if (bar) { bar.style.opacity = '0'; set(0); } }

  function internal(a, e) {
    if (!a) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button)) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return false;
    var url; try { url = new URL(a.href, location.href); } catch (_) { return false; }
    if (url.origin !== location.origin) return false;                  // external: let browser handle
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return false; // same-page anchor
    return true;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href]') : null;
    if (a && internal(a, e)) { a.classList.add('elc-navloading'); start(); return; }
    // buttons that opt in to feedback (e.g. ones that navigate via JS)
    var b = t && t.closest ? t.closest('[data-nav],button[data-loading]') : null;
    if (b) { b.classList.add('elc-navloading'); start(); }
  }, true);

  // bfcache / back-forward: clear any leftover bar and highlights
  window.addEventListener('pageshow', function () {
    reset();
    var els = document.querySelectorAll('.elc-navloading'); for (var i = 0; i < els.length; i++) els[i].classList.remove('elc-navloading');
  });
  // expose a tiny API for app code (e.g. before a fetch-driven view swap)
  window.elcNav = { start: start, done: done };
})();
