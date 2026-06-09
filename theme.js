/* theme.js — Auto / Light / Dark.
   Auto = follow the visitor's LOCAL sunrise/sunset (computed from an IP-based
   location lookup, no permission prompt). Falls back to a 6am–6pm clock rule
   if the lookup fails. The manual choice overrides Auto and is remembered. */
(function () {
  var KEY = "elc-theme";          // 'auto' | 'light' | 'dark'
  var RKEY = "elc-theme-resolved";// last applied 'light' | 'dark' (avoids flash)
  var CKEY = "elc-coords";        // cached {lat,lng,t}

  function getMode() { try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; } }

  // ---- instant apply (before first paint, no flash) ----
  (function () {
    var m = getMode(), r = null;
    try { r = localStorage.getItem(RKEY); } catch (e) {}
    var sys = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    var init = m === "light" ? "light" : m === "dark" ? "dark" : (r || sys);
    document.documentElement.dataset.theme = init;
  })();

  function setResolved(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(RKEY, t); } catch (e) {}
  }

  // ---- sunrise/sunset (NOAA sunrise equation), returns absolute instants ----
  function sunTimes(date, lat, lng) {
    var rad = Math.PI / 180;
    var toJ = function (d) { return d.valueOf() / 86400000 + 2440587.5; };
    var fromJ = function (j) { return new Date((j - 2440587.5) * 86400000); };
    var n = Math.round(toJ(date) - 2451545.0 + 0.0008);
    var Jstar = n - lng / 360;
    var M = (357.5291 + 0.98560028 * Jstar) % 360;
    var C = 1.9148 * Math.sin(M * rad) + 0.0200 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    var lambda = (M + C + 180 + 102.9372) % 360;
    var Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
    var delta = Math.asin(Math.sin(lambda * rad) * Math.sin(23.44 * rad));
    var cosH = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(delta)) / (Math.cos(lat * rad) * Math.cos(delta));
    if (cosH > 1) return { polar: "night" };
    if (cosH < -1) return { polar: "day" };
    var H = Math.acos(cosH) / rad;
    return { sunrise: fromJ(Jtransit - H / 360), sunset: fromJ(Jtransit + H / 360) };
  }

  function desired(coords) {
    var now = new Date();
    if (coords) {
      var s = sunTimes(now, coords.lat, coords.lng);
      if (s.polar) return s.polar === "day" ? "light" : "dark";
      return (now >= s.sunrise && now < s.sunset) ? "light" : "dark";
    }
    var h = now.getHours();          // clock fallback
    return (h >= 6 && h < 18) ? "light" : "dark";
  }

  function cachedCoords() {
    try { var c = JSON.parse(localStorage.getItem(CKEY) || "null"); if (c && Date.now() - c.t < 7 * 864e5) return c; } catch (e) {}
    return null;
  }
  function fetchCoords() {
    var c = cachedCoords();
    if (c) return Promise.resolve(c);
    var save = function (j) {
      if (j && (j.latitude || j.lat)) {
        var v = { lat: j.latitude != null ? j.latitude : j.lat, lng: j.longitude != null ? j.longitude : j.lon, t: Date.now() };
        try { localStorage.setItem(CKEY, JSON.stringify(v)); } catch (e) {}
        return v;
      }
      return null;
    };
    return fetch("https://ipapi.co/json/").then(function (r) { return r.json(); }).then(save)
      .catch(function () { return fetch("https://ipwho.is/").then(function (r) { return r.json(); }).then(save); })
      .catch(function () { return null; });
  }

  var coords = null, timer = null;
  function applyAuto() { setResolved(desired(coords)); }

  function start(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    paint(mode);
    if (timer) { clearInterval(timer); timer = null; }
    if (mode === "light" || mode === "dark") { setResolved(mode); return; }
    applyAuto();                                   // immediate (cached coords or clock)
    fetchCoords().then(function (c) { coords = c; applyAuto(); });
    timer = setInterval(applyAuto, 10 * 60 * 1000); // re-check so it flips in real time
  }

  // ---- toggle UI ----
  var el;
  function paint(mode) {
    if (!el) return;
    Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
  }
  function build() {
    el = document.createElement("div");
    el.id = "elc-theme-toggle";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", "Theme");
    el.innerHTML =
      '<button data-mode="auto" class="lbl" title="Match local sunrise/sunset">AUTO</button>' +
      '<button data-mode="light" title="Light" aria-label="Light">\u2600</button>' +
      '<button data-mode="dark" title="Dark" aria-label="Dark">\u263E</button>';
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (b) start(b.dataset.mode);
    });
    document.body.appendChild(el);
  }

  function init() { build(); start(getMode()); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
