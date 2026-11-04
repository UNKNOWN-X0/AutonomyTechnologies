(function () {
  // HUD layer, loaded by js/settings.js on every page. Three pieces:
  // 0. Section headings that only just wrap are fitted onto one line.
  // 1. Headings decode once: the first time a heading comes into view a signal line sweeps across it and the letters
  //    it passes settle from random glyphs into the real words.
  // 2. Reading readout: the guide section being read shows its number and how far through it you are, top right of
  //    its heading. The readout sits on the section, not inside the h2, so heading text read by other scripts is clean.
  // Both wait for DOMContentLoaded, after guide.js and nav.js have read the headings.
  function start() {
    var reduce = window.siteReduceMotion
      ? window.siteReduceMotion()
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fitAll();
    if (!reduce && "IntersectionObserver" in window) decodeAll();
    readout();
    // Web fonts can land after start; refit, then let the readouts re-pin.
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(function () {
        fitAll();
        window.dispatchEvent(new Event("resize"));
      });
    var t;
    window.addEventListener("resize", function (e) {
      if (!e.isTrusted) return;
      clearTimeout(t);
      t = setTimeout(function () {
        fitAll();
        window.dispatchEvent(new Event("resize"));
      }, 150);
    });
  }

  // A section heading that only just wraps (it would fit at 84% of its size or more) is set a little smaller so it sits
  // on one line; a heading that is far too long keeps its size and wraps, balanced, as before.
  function fit(h) {
    h.style.fontSize = "";
    var ws = h.style.whiteSpace;
    h.style.whiteSpace = "nowrap";
    var need = h.scrollWidth,
      avail = h.clientWidth;
    h.style.whiteSpace = ws;
    if (need <= avail + 1) return;
    var ratio = avail / need;
    if (ratio < 0.84) return;
    h.style.fontSize = parseFloat(getComputedStyle(h).fontSize) * ratio * 0.985 + "px";
  }
  function fitAll() {
    document.querySelectorAll("main section > h2").forEach(fit);
  }

  var LOWER = "abcdefghkmnopqrsuvwxyz0123456789",
    UPPER = "ABCDEFGHKMNPRSTUVXYZ0123456789#";
  function glyph(ch) {
    if (/[a-z]/.test(ch)) return LOWER[(Math.random() * LOWER.length) | 0];
    if (/[A-Z0-9]/.test(ch)) return UPPER[(Math.random() * UPPER.length) | 0];
    return ch;
  }
  // Decode as a sweep: a 2px signal line crosses the heading from left to right and every character it has passed
  // settles, on all lines at once, so a two-line heading resolves as one scan rather than line after line.
  function decode(el) {
    var nodes = [],
      walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT),
      n;
    while ((n = walk.nextNode())) nodes.push(n);
    var orig = nodes.map(function (t) {
        return t.data;
      }),
      total = orig.join("").length;
    if (!total || total > 160) return;
    // Each character's centre, measured before anything changes.
    var range = document.createRange(),
      minX = Infinity,
      maxX = -Infinity,
      xs = nodes.map(function (t) {
        var out = [];
        for (var k = 0; k < t.data.length; k++) {
          range.setStart(t, k);
          range.setEnd(t, k + 1);
          var r = range.getBoundingClientRect();
          if (r.width) {
            minX = Math.min(minX, r.left);
            maxX = Math.max(maxX, r.right);
            out.push(r.left + r.width / 2);
          } else out.push(-Infinity);
        }
        return out;
      });
    if (!(maxX > minX)) return;
    var box = el.getBoundingClientRect(),
      line = document.createElement("span");
    line.className = "decode-line";
    line.setAttribute("aria-hidden", "true");
    line.style.top = box.top + window.scrollY - 4 + "px";
    line.style.height = box.height + 8 + "px";
    line.style.left = minX + window.scrollX + "px";
    document.body.appendChild(line);
    // Hold the heading's box so swapped glyphs never shift the page, and keep the real words for screen readers.
    el.style.height = el.offsetHeight + "px";
    el.setAttribute("aria-label", el.textContent.trim());
    var t0 = performance.now(),
      DUR = 380 + Math.min(260, (maxX - minX) * 0.35),
      last = 0;
    function frame(now) {
      var p = Math.min(1, (now - t0) / DUR),
        e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
        sx = minX + (maxX - minX) * e;
      line.style.transform = "translateX(" + (sx - minX) + "px)";
      if (now - last > 40 || p === 1) {
        last = now;
        nodes.forEach(function (t, i) {
          var s = orig[i],
            out = "";
          for (var k = 0; k < s.length; k++) out += xs[i][k] <= sx ? s[k] : glyph(s[k]);
          t.data = out;
        });
      }
      if (p < 1) requestAnimationFrame(frame);
      else {
        nodes.forEach(function (t, i) {
          t.data = orig[i];
        });
        el.style.height = "";
        el.removeAttribute("aria-label");
        line.remove();
      }
    }
    requestAnimationFrame(frame);
  }
  function decodeAll() {
    var heads = document.querySelectorAll("header h1, main h1, main h2");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          decode(e.target);
        });
      },
      { threshold: 0.6 }
    );
    heads.forEach(function (h) {
      if (h.closest("dialog, .cmap")) return;
      io.observe(h);
    });
  }

  function readout() {
    var secs = Array.prototype.slice.call(document.querySelectorAll("main section[id]")).filter(function (s) {
      return s.querySelector(":scope > h2");
    });
    if (!secs.length || !document.querySelector("nav.toc")) return;
    var items = secs.map(function (s) {
      var span = document.createElement("span"),
        m = /^\s*(\d+(?:\.\d+)*[a-z]?)\s/.exec(s.querySelector(":scope > h2").textContent);
      span.className = "hud-read";
      span.setAttribute("aria-hidden", "true");
      s.classList.add("hud-sec");
      s.insertBefore(span, s.firstChild);
      return { sec: s, span: span, h: s.querySelector(":scope > h2"), num: m ? "§" + m[1] + "  " : "" };
    });
    // Pin each readout to its heading's rule (the section is the positioned box).
    function place() {
      items.forEach(function (it) {
        it.span.style.top = it.h.offsetTop - 17 + "px";
        it.span.style.left = it.h.offsetLeft + it.h.offsetWidth + "px";
      });
    }
    var cur = null,
      queued = false;
    function update() {
      queued = false;
      var line = window.innerHeight * 0.3,
        found = null,
        pct = 0;
      for (var i = 0; i < items.length; i++) {
        var r = items[i].sec.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) {
          found = items[i];
          pct = Math.round(Math.min(1, Math.max(0, (line - r.top) / r.height)) * 100);
          break;
        }
      }
      if (cur && cur !== found) cur.span.classList.remove("on");
      if (found) {
        found.span.textContent = found.num + ("00" + pct).slice(-3) + "%";
        found.span.classList.add("on");
      }
      cur = found;
    }
    function queue() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", function () {
      place();
      queue();
    });
    place();
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
