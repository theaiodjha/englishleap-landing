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
    // Win-screen extras removed (no share / comment challenge). Kept as a no-op so callers don't break.
    mountWinActions: function () {}
  };
  window.ELC = ELC;
})();
