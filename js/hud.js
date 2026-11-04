(function () {
  // HUD layer, loaded by js/settings.js on every page. Three pieces:
  // 0. Section headings that only just wrap are fitted onto one line.
  // 1. Headings decode once: the first time a heading comes into view a signal line sweeps across it and the letters
  //    it passes settle from random glyphs into the real words.
  // 2. Reading chip: pinned at the top of the screen while you read a section, with how far through it you are and the
  //    minutes left. It lives outside the headings, so heading text read by other scripts stays clean.
  // Both wait for DOMContentLoaded, after guide.js and nav.js have read the headings.
  function start() {
    var reduce = window.siteReduceMotion
      ? window.siteReduceMotion()
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fitFormulas();
    fitAll();
    if (!reduce && "IntersectionObserver" in window) decodeAll();
    readout();
    // Web fonts can land after start; refit, then let the readouts re-pin.
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(function () {
        fitFormulas();
        fitAll();
        window.dispatchEvent(new Event("resize"));
      });
    // Refit when the reading panel changes width: a window resize, or the contents rail folding or opening.
    var t,
      main = document.querySelector("main"),
      lastW = main ? main.clientWidth : 0;
    function relayout() {
      clearTimeout(t);
      t = setTimeout(function () {
        fitFormulas();
        fitAll();
        window.dispatchEvent(new Event("resize"));
      }, 150);
    }
    if (main && "ResizeObserver" in window)
      new ResizeObserver(function () {
        if (main.clientWidth !== lastW) {
          lastW = main.clientWidth;
          relayout();
        }
      }).observe(main);
    else
      window.addEventListener("resize", function (e) {
        if (e.isTrusted) relayout();
      });
  }

  // Formula lines wrap instead of scrolling. Each .formula is cut into segments at its top-level relations (= ≤ → ⇔ …,
  // never inside brackets, fractions or stacked limits) and after list commas; a segment stays on one line, so a long
  // formula breaks before a relation sign, the way it is set by hand. A segment wider than the card on its own (a long
  // worded chain) may wrap at its spaces. Without this script, formulas wrap at any space.
  var REL = /^(=|≠|≈|≡|≤|≥|<|>|→|←|↔|⇒|⇐|⇔|⟹|⟸|⟺|:=|≅|∼)$/;
  function segmentFormula(f) {
    if (f.dataset.seg) return;
    f.dataset.seg = "1";
    var segs = [[]],
      depth = 0;
    Array.prototype.slice.call(f.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) {
        segs[segs.length - 1].push(node);
        return;
      }
      // split this text node at top-level relations (break before) and list commas (break after)
      var parts = node.data.split(/(\s+)/),
        buf = "";
      function flush() {
        if (buf) segs[segs.length - 1].push(document.createTextNode(buf));
        buf = "";
      }
      parts.forEach(function (tok, i) {
        for (var k = 0; k < tok.length; k++) {
          var ch = tok[k];
          if ("([{⟨".indexOf(ch) > -1) depth++;
          else if (")]}⟩".indexOf(ch) > -1) depth = Math.max(0, depth - 1);
        }
        if (depth === 0 && REL.test(tok) && segs[segs.length - 1].length + buf.length > 0) {
          flush();
          segs.push([]);
        }
        buf += tok;
        if (depth === 0 && /,$/.test(tok) && /^\s+$/.test(parts[i + 1] || "")) {
          flush();
          segs.push([]);
        }
      });
      flush();
    });
    segs = segs.filter(function (g) {
      return g.some(function (n) {
        return n.nodeType !== 3 || n.data.trim();
      });
    });
    if (segs.length < 2 && !(segs[0] && segs[0].length)) return;
    f.textContent = "";
    segs.forEach(function (g, i) {
      var span = document.createElement("span");
      span.className = "f-seg";
      // spaces between segments become the break opportunities
      var first = g[0],
        last = g[g.length - 1];
      if (first && first.nodeType === 3) first.data = first.data.replace(/^\s+/, "");
      if (last && last.nodeType === 3) last.data = last.data.replace(/\s+$/, "");
      g.forEach(function (n) {
        span.appendChild(n);
      });
      if (i) f.appendChild(document.createTextNode(" "));
      f.appendChild(span);
    });
  }
  // Spacing the browser does not do: TeX spaces x∈A and X×Y by itself, HTML sets the glyphs flush. Inside formulas, a set
  // or relation sign written without spaces (∈ ⊂ ⊆ × ∘ ∪ ∩ → = ≤ and a set-builder colon) gets a thin margin either side, a
  // comma gets one after it, and an italic letter gets room before a bracket or an exponent. Indices and stacked limits
  // (sub, sup, .op) stay tight, and anything already written with spaces is left alone.
  var OPS = "∈∉∋⊂⊃⊆⊇⊊⊋×∘∪∩∖∣:→↦⇒⇔=≠≤≥≈";
  function spaceFormula(f, prose) {
    if (f.dataset.spaced) return;
    f.dataset.spaced = "1";
    var walk = document.createTreeWalker(f, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          return n.parentNode.closest("sub, sup, .op, code") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      }),
      nodes = [],
      n;
    while ((n = walk.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      var s = t.data;
      if (!/[∈∉∋⊂⊃⊆⊇⊊⊋×∘∪∩∖∣:→↦⇒⇔=≠≤≥≈,]/.test(s)) return;
      var frag = document.createDocumentFragment(),
        buf = "";
      for (var k = 0; k < s.length; k++) {
        var ch = s[k],
          before = k ? s[k - 1] : "x",
          after = k + 1 < s.length ? s[k + 1] : "x",
          tight = !/\s/.test(before) && !/\s/.test(after);
        if (prose && (ch === ":" || ch === ",")) buf += ch;
        else if ((OPS.indexOf(ch) > -1 && tight) || (ch === "," && !/\s/.test(after))) {
          if (buf) frag.appendChild(document.createTextNode(buf));
          buf = "";
          var sp = document.createElement("span");
          sp.className = ch === "," ? "mp" : "mo";
          sp.textContent = ch;
          frag.appendChild(sp);
        } else buf += ch;
      }
      if (buf) frag.appendChild(document.createTextNode(buf));
      t.parentNode.replaceChild(frag, t);
    });
    f.querySelectorAll("var").forEach(function (v) {
      var next = v.nextSibling;
      if (next && next.nodeType === 3 && /^[(\[{|]/.test(next.data)) v.classList.add("ic");
    });
  }
  function fitFormulas() {
    document.querySelectorAll(".cm-formula").forEach(function (f) {
      spaceFormula(f);
    });
    // notes under formulas are prose: only their set and relation signs are spaced, not colons or commas
    document.querySelectorAll(".eq-note").forEach(function (f) {
      spaceFormula(f, true);
    });
    document.querySelectorAll(".formula").forEach(function (f) {
      segmentFormula(f);
      spaceFormula(f);
      var room = f.clientWidth;
      f.querySelectorAll(":scope > .f-seg").forEach(function (seg) {
        seg.classList.remove("f-free");
        if (room && seg.getBoundingClientRect().width > room + 1) seg.classList.add("f-free");
      });
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

  // Reading chip: once a section's heading has scrolled away, a small chip pinned to the top of the screen, at the
  // reading column's right edge, says which section you are in, how far through it you are, roughly how many minutes
  // of it are left (200 words a minute over the words still ahead), and which section of how many it is.
  function readout() {
    var secs = Array.prototype.slice.call(document.querySelectorAll("main section[id]")).filter(function (s) {
      return s.querySelector(":scope > h2");
    });
    if (!secs.length || !document.querySelector("nav.toc")) return;
    var items = secs.map(function (s, n) {
      var h = s.querySelector(":scope > h2"),
        m = /^\s*(\d+(?:\.\d+)*[a-z]?)\s/.exec(h.textContent);
      return {
        sec: s,
        h: h,
        n: n + 1,
        num: m ? "§" + m[1] : "",
        words: (s.textContent.match(/\S+/g) || []).length,
      };
    });
    var chip = document.createElement("div"),
      secEl = document.createElement("span"),
      bar = document.createElement("span"),
      fill = document.createElement("i"),
      time = document.createElement("span"),
      pos = document.createElement("span");
    chip.className = "hud-chip";
    chip.setAttribute("aria-hidden", "true");
    secEl.className = "hc-sec";
    bar.className = "hc-bar";
    time.className = "hc-time";
    pos.className = "hc-pos";
    bar.appendChild(fill);
    [secEl, bar, time, pos].forEach(function (el) {
      chip.appendChild(el);
    });
    document.body.appendChild(chip);
    var queued = false;
    function update() {
      queued = false;
      var line = window.innerHeight * 0.3,
        found = null,
        p = 0;
      for (var i = 0; i < items.length; i++) {
        var r = items[i].sec.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) {
          found = items[i];
          p = Math.min(1, Math.max(0, (line - r.top) / r.height));
          break;
        }
      }
      var hr = found && found.h.getBoundingClientRect();
      if (!found || hr.bottom > 0) {
        chip.classList.remove("on");
        return;
      }
      var left = Math.ceil((found.words * (1 - p)) / 200);
      secEl.textContent = found.num;
      fill.style.width = Math.round(p * 100) + "%";
      time.textContent = p > 0.97 ? "section done" : left <= 1 ? "under 1 min left" : left + " min left";
      pos.textContent = found.n + " of " + items.length;
      chip.style.left = Math.round(hr.right) + "px";
      chip.classList.add("on");
    }
    function queue() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    update();
  }


  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
