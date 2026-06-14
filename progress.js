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
    },
    // Popup player. `src` may be a self-hosted video file (.mp4/.webm) or a YouTube ID/URL.
    playVideo: function (src, title) {
      if (!src) return;
      var ov = document.createElement("div");
      ov.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,3,12,.86);backdrop-filter:blur(6px)";
      var box = document.createElement("div"); box.style.cssText = "position:relative;width:min(960px,94vw)";
      var frame = document.createElement("div");
      frame.style.cssText = "position:relative;width:100%;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;box-shadow:0 30px 90px -30px rgba(0,0,0,.9)";
      var media;
      if (/\.(mp4|webm|ogg|ogv|m4v|mov)(\?|#|$)/i.test(src)) {
        media = document.createElement("video");
        media.src = src; media.controls = true; media.autoplay = true; media.preload = "metadata";
        media.setAttribute("playsinline", ""); media.playsInline = true;
        media.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;object-fit:contain";
      } else {
        var id = (src.match(/(?:youtu\.be\/|[?&]v=|embed\/)([A-Za-z0-9_-]{6,})/) || [])[1] || src;
        media = document.createElement("iframe");
        media.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
        media.title = title || "How to play"; media.referrerPolicy = "strict-origin-when-cross-origin";
        media.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        media.setAttribute("allowfullscreen", ""); media.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0";
      }
      frame.appendChild(media);
      var x = document.createElement("button"); x.textContent = "\u2715"; x.setAttribute("aria-label", "Close");
      x.style.cssText = "position:absolute;top:-14px;right:-14px;width:40px;height:40px;border-radius:50%;border:0;cursor:pointer;background:#fff;color:#111;font-size:18px;font-weight:700;box-shadow:0 8px 24px -6px rgba(0,0,0,.7)";
      function close(){ try { ov.remove(); } catch (e) {} document.removeEventListener("keydown", onKey); }
      function onKey(e){ if (e.key === "Escape") close(); }
      x.onclick = close; ov.onclick = function (e) { if (e.target === ov) close(); };
      document.addEventListener("keydown", onKey);
      box.appendChild(frame); box.appendChild(x); ov.appendChild(box); document.body.appendChild(ov);
    },
    // Floating "How to play" pill for game pages. No-op if no video id.
    howToPlay: function (id, title) {
      if (!id || document.getElementById("elcHowBtn")) return;
      var b = document.createElement("button"); b.id = "elcHowBtn";
      b.innerHTML = "&#9654;&nbsp; How to play";
      b.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:80;font-family:inherit;font-weight:700;font-size:13.5px;cursor:pointer;" +
        "color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:11px 17px;backdrop-filter:blur(10px);" +
        "background:linear-gradient(110deg,rgba(139,108,255,.92),rgba(77,139,255,.92));box-shadow:0 14px 30px -12px rgba(0,0,0,.8)";
      b.onclick = function () { ELC.playVideo(id, title); };
      document.body.appendChild(b);
    }
  };
  window.ELC = ELC;
})();
