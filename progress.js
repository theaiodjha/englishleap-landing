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
    // Native share sheet on mobile; clipboard fallback elsewhere. Returns 'shared'|'copied'|'none'.
    share: function (text, url) {
      url = url || "https://englishleap.app";
      if (navigator.share) { navigator.share({ title: "English Leap Practice Arcade", text: text, url: url }).catch(function () {}); return "shared"; }
      try { navigator.clipboard.writeText(text + " " + url); return "copied"; } catch (e) { return "none"; }
    },
    // Inject Share + Comment-challenge UI into a host element (portable inline styles).
    mountWinActions: function (host, opts) {
      if (!host) return;
      opts = opts || {};
      var wrap = document.createElement("div");
      wrap.style.cssText = "margin-top:18px;display:flex;flex-direction:column;gap:12px;align-items:center";
      var sh = document.createElement("button");
      sh.textContent = "Share result";
      sh.style.cssText = "font:inherit;font-weight:700;font-size:14px;padding:11px 22px;border-radius:999px;border:0;cursor:pointer;color:#fff;background:linear-gradient(110deg,#8b6cff,#4d8bff)";
      sh.onclick = function () {
        var r = ELC.share(opts.shareText || "I'm practising English in the Practice Arcade!", opts.url);
        if (r === "copied") sh.textContent = "Copied to clipboard \u2713";
        else if (r === "shared") sh.textContent = "Shared \u2713";
      };
      wrap.appendChild(sh);
      if (opts.phrase) {
        var c = document.createElement("div");
        c.style.cssText = "background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:15px 18px;max-width:430px;text-align:center";
        c.innerHTML = '<div style="font-weight:700;margin-bottom:5px">\u270D\uFE0F Your turn</div>' +
          '<div style="opacity:.85;font-size:14px;line-height:1.5">Write one sentence with <b>\u201C' + opts.phrase + '\u201D</b> and share it in the comments.</div>';
        var cb = document.createElement("button");
        cb.textContent = "Copy the challenge";
        cb.style.cssText = "margin-top:11px;font:inherit;font-weight:600;font-size:13px;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:inherit;cursor:pointer";
        cb.onclick = function () {
          try { navigator.clipboard.writeText('Write one sentence with \u201C' + opts.phrase + '\u201D.'); cb.textContent = "Copied \u2713"; } catch (e) {}
        };
        c.appendChild(cb);
        wrap.appendChild(c);
      }
      host.appendChild(wrap);
    }
  };
  window.ELC = ELC;
})();
