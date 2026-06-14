/* English Leap — client-side progress, gentle streak, and share.
   All local to the device (no account needed). Safe if storage is blocked. */
(function () {
  var KEY = "elc:progress";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  // ISO week key for a given Date, e.g. "2026-W24"
  function isoWeek(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    var firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    var week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }
  function weekAgo(n) { var d = new Date(); d.setDate(d.getDate() - n * 7); return isoWeek(d); }

  var ELC = {
    markComplete: function (type, ep) {
      var o = load(); o.completed = o.completed || {};
      o.completed[type + ":" + ep] = Date.now(); save(o); this.recordPlay();
    },
    isComplete: function (type, ep) { var o = load(); return !!(o.completed && o.completed[type + ":" + ep]); },
    completedCountFor: function (type, epIds) {
      var o = load(); if (!o.completed) return 0;
      return (epIds || []).filter(function (id) { return o.completed[type + ":" + id]; }).length;
    },
    recordPlay: function () {
      var o = load(); o.weeks = o.weeks || [];
      var w = isoWeek(new Date());
      if (o.weeks.indexOf(w) === -1) { o.weeks.push(w); o.weeks = o.weeks.slice(-80); save(o); }
    },
    // Consecutive weeks of practice, ending at this week (or last week, as grace). Gentle: no decay warnings.
    streakWeeks: function () {
      var o = load(); var weeks = {}; (o.weeks || []).forEach(function (w) { weeks[w] = 1; });
      var start = weeks[weekAgo(0)] ? 0 : (weeks[weekAgo(1)] ? 1 : null);
      if (start === null) return 0;
      var n = 0; while (weeks[weekAgo(start + n)]) n++; return n;
    },
    // Win-screen share/comment removed. Kept as a no-op so callers don't break.
    mountWinActions: function () {},
    // Inject the real Oriva (celebrate pose) into a win screen, with emoji fallback.
    orivaCheer: function (host, msg) {
      if (!host) return;
      var row = document.createElement("div");
      row.style.cssText = "display:flex;gap:14px;align-items:center;justify-content:center;max-width:390px;margin:18px auto 0;padding:12px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);text-align:left";
      var img = document.createElement("img");
      img.src = "/assets/oriva/celebrate.png"; img.alt = "Oriva celebrating";
      img.style.cssText = "width:60px;height:60px;object-fit:contain;flex:0 0 auto";
      img.onerror = function () { var s = document.createElement("span"); s.textContent = "\uD83C\uDF89"; s.style.fontSize = "30px"; this.replaceWith(s); };
      var t = document.createElement("div"); t.style.cssText = "font-size:14px;line-height:1.45;color:#fff";
      t.innerHTML = msg || "<b>Oriva is cheering for you!</b>";
      row.appendChild(img); row.appendChild(t); host.appendChild(row);
    }
  };
  window.ELC = ELC;
})();
