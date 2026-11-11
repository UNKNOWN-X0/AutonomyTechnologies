(function () {
  // The contents rail: marks the section being read, draws the route line down to it, keeps the current entry in view
  // inside a long rail, and on phones adds a bar that names the section and opens the contents from anywhere.
  var toc = document.querySelector("nav.toc");
  if (!toc) return;

  // Folding the whole rail (wide screens): the arrow at its top hides it to a slim strip and gives the page the width.
  // The choice is saved as rail-folded and applied from js/settings.js in <head>, so a folded rail never flashes open.
  (function railFold() {
    var root = document.documentElement,
      btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rail-toggle";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    function sync() {
      var folded = root.classList.contains("rail-folded");
      btn.setAttribute("aria-expanded", String(!folded));
      btn.setAttribute("aria-label", folded ? "Show contents" : "Hide contents");
      btn.dataset.tip = folded ? "Show contents" : "Hide contents";
    }
    btn.addEventListener("click", function () {
      var folded = root.classList.toggle("rail-folded");
      try {
        localStorage.setItem("rail-folded", folded ? "1" : "0");
      } catch (e) {}
      sync();
    });
    toc.insertBefore(btn, toc.firstChild);
    sync();
  })();
  var rail = toc.querySelector(":scope > ol"),
    links = Array.prototype.slice.call(toc.querySelectorAll("ol a")),
    reduce = window.siteReduceMotion ? window.siteReduceMotion() : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function idOf(a) {
    return decodeURIComponent(a.hash.slice(1));
  }
  var heads = links
    .map(function (a) {
      return document.getElementById(idOf(a));
    })
    .filter(function (el, i, all) {
      return el && all.indexOf(el) === i;
    });
  if (!links.length || !heads.length) return;

  // Phone sheet: copied before any folding, so it always lists every entry.
  var sheetList = rail ? rail.cloneNode(true) : null;

  // Folding: each group heading in the rail (Sections, Practise, Experiments) folds the entries under it. The group being read
  // is always open, the others start closed, and a group you open yourself stays open.
  var groups = [];
  if (rail) {
    var group = null;
    Array.prototype.slice.call(rail.children).forEach(function (li) {
      if (li.classList.contains("toc-group")) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "toc-fold";
        btn.textContent = li.textContent;
        li.removeAttribute("aria-hidden");
        li.textContent = "";
        li.appendChild(btn);
        var g = { head: li, btn: btn, items: [], open: false };
        group = g;
        groups.push(g);
        btn.addEventListener("click", function () {
          fold(g, !g.open);
        });
      } else if (group) group.items.push(li);
    });
  }
  function fold(g, open) {
    g.open = open;
    g.btn.setAttribute("aria-expanded", String(open));
    g.items.forEach(function (li) {
      li.hidden = !open;
    });
    lit();
  }
  function groupOf(a) {
    var li = a.closest("li");
    return groups.filter(function (g) {
      return g.items.indexOf(li) >= 0;
    })[0];
  }
  groups.forEach(function (g) {
    fold(g, false);
  });

  // The instrument (owner's request, 2026-11-11: "futuristic, not 2010s"). Over the list, a readout names the section
  // being read in large figures, counts it ("5 of 18") and fills a strip of one segment per entry; each entry is a
  // station on the route line, solid once passed; a reticle of four corner brackets glides to the current entry and
  // locks onto it; each group heading counts how far into it you are. All of it is decorative (aria-hidden): the list
  // itself carries aria-current. Reduced motion keeps every state and drops the movement.
  // only the rail's own list counts (the rail also holds a second copy of the entries)
  var stations = rail ? links.filter(function (a) { return rail.contains(a); }) : [],
    strips = [],
    tele = null,
    teleNo = null,
    teleTitle = null,
    teleCount = null,
    lock = null;
  function strip() {
    var s = document.createElement("div");
    s.className = "tele-segs";
    s.setAttribute("aria-hidden", "true");
    stations.forEach(function (a, i) {
      var seg = document.createElement("i");
      seg.style.setProperty("--i", i);
      seg.style.setProperty("--n", Math.max(2, stations.length));
      s.appendChild(seg);
    });
    strips.push(s);
    return s;
  }
  // "1.4 Superposition" → ["1.4", "Superposition"]; "Task 7 · Point charges" → ["Task 7", "Point charges"]
  function split(text) {
    var m = text.match(/^([0-9][0-9.–-]*[a-z]?)\s+(.+)$/) || text.match(/^(.+?)\s+·\s+(.+)$/);
    return m ? [m[1], m[2]] : ["", text];
  }
  // Letters settle from random glyphs into the title, left to right (about 320ms).
  function settle(el, text) {
    el.textContent = text;
    if (reduce || !window.requestAnimationFrame) return;
    var t0 = performance.now(),
      SET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    (function frame(now) {
      var p = Math.min(1, (now - t0) / 320),
        n = Math.floor(text.length * p),
        out = text.slice(0, n);
      for (var k = n; k < text.length; k++) out += /\s/.test(text[k]) ? text[k] : SET[(Math.random() * SET.length) | 0];
      el.textContent = out;
      if (p < 1 && el.dataset.text === text) requestAnimationFrame(frame);
      else if (el.dataset.text === text) el.textContent = text;
    })(t0);
  }
  if (rail) {
    tele = document.createElement("div");
    tele.className = "rail-tele";
    tele.setAttribute("aria-hidden", "true");
    var top = document.createElement("div");
    top.className = "tele-top";
    teleNo = document.createElement("span");
    teleNo.className = "tele-no";
    teleCount = document.createElement("span");
    teleCount.className = "tele-count";
    top.appendChild(teleNo);
    top.appendChild(teleCount);
    teleTitle = document.createElement("div");
    teleTitle.className = "tele-title";
    tele.appendChild(top);
    tele.appendChild(teleTitle);
    tele.appendChild(strip());
    rail.parentNode.insertBefore(tele, rail);
    lock = document.createElement("li");
    lock.className = "rail-lock";
    lock.setAttribute("aria-hidden", "true");
    lock.hidden = true;
    rail.appendChild(lock);
    groups.forEach(function (g) {
      g.count = document.createElement("span");
      g.count.className = "toc-count";
      g.count.setAttribute("aria-hidden", "true");
      g.btn.appendChild(g.count);
    });
  }
  function instrument(a) {
    var idx = stations.indexOf(a);
    stations.forEach(function (l, i) {
      l.classList.toggle("is-past", i < idx);
    });
    strips.forEach(function (s) {
      Array.prototype.forEach.call(s.children, function (seg, i) {
        seg.className = i < idx ? "past" : i === idx ? "now" : "";
      });
    });
    groups.forEach(function (g) {
      var reached = g.items.filter(function (li) {
        var l = li.querySelector("a");
        return l && stations.indexOf(l) <= idx;
      }).length;
      if (g.count) g.count.textContent = reached + "/" + g.items.length;
    });
    if (!tele || !a) return;
    var parts = split(a.textContent.trim());
    tele.classList.toggle("no-number", !parts[0]);
    teleNo.textContent = parts[0] || parts[1];
    teleCount.textContent = idx + 1 + " of " + stations.length;
    teleTitle.dataset.text = parts[0] ? parts[1] : "";
    settle(teleTitle, teleTitle.dataset.text);
    if (lock) {
      lock.classList.remove("lock-in");
      void lock.offsetWidth;
      lock.classList.add("lock-in");
    }
  }

  var bar = null,
    label = null,
    sheet = null,
    sheetLinks = [];
  var current = null,
    queued = false;

  // Keep the current entry inside the rail's own scroll area; the page itself is never scrolled by this.
  function follow() {
    if (!rail || toc.scrollHeight <= toc.clientHeight) return;
    var a = rail.querySelector("a[aria-current]");
    if (!a) return;
    var box = toc.getBoundingClientRect(),
      r = a.getBoundingClientRect(),
      pad = 48;
    if (r.top < box.top + pad) toc.scrollTo({ top: toc.scrollTop - (box.top + pad - r.top), behavior: reduce ? "auto" : "smooth" });
    else if (r.bottom > box.bottom - pad) toc.scrollTo({ top: toc.scrollTop + (r.bottom - (box.bottom - pad)), behavior: reduce ? "auto" : "smooth" });
  }

  // The route line: one signal line down the rail's left edge, from the top to the entry being read.
  function lit() {
    if (!rail) return;
    var a = rail.querySelector("a[aria-current]"),
      y = 0;
    if (a && a.offsetParent) y = a.getBoundingClientRect().bottom - rail.getBoundingClientRect().top - rail.clientTop;
    rail.style.setProperty("--lit", Math.max(0, Math.round(y)) + "px");
    if (lock) {
      lock.hidden = !(a && a.offsetParent);
      if (!lock.hidden) {
        var r = a.getBoundingClientRect();
        lock.style.top = Math.round(r.top - rail.getBoundingClientRect().top - rail.clientTop - 5) + "px";
        lock.style.height = Math.round(r.height + 10) + "px";
        // glide only between entries, never in from the top on the first placement
        if (!lock.classList.contains("ready")) requestAnimationFrame(function () { lock.classList.add("ready"); });
      }
    }
  }
  window.addEventListener("resize", lit);

  function spy() {
    queued = false;
    var line = window.innerHeight / 3,
      id = heads[0].id;
    heads.forEach(function (h) {
      if (h.getBoundingClientRect().top < line) id = h.id;
    });
    if (id === current) return;
    current = id;
    links.forEach(function (a) {
      if (idOf(a) === id) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    sheetLinks.forEach(function (a) {
      var here = idOf(a) === id;
      if (here) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    var a = rail && rail.querySelector("a[aria-current]");
    if (label && a) label.textContent = a.textContent.trim();
    var g = a && groupOf(a);
    if (g && !g.open) fold(g, true);
    instrument(a);
    lit();
    follow();
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(spy);
      }
    },
    { passive: true }
  );

  // Phones: the rail is a block at the top of the page, so once it has scrolled away there is no way to jump.
  // A bar then names the section being read and opens the same list.
  if (rail && "IntersectionObserver" in window) {
    bar = document.createElement("div");
    bar.className = "toc-bar";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toc-bar-btn";
    btn.setAttribute("aria-expanded", "false");
    label = document.createElement("span");
    label.className = "toc-bar-label";
    var word = document.createElement("span");
    word.className = "toc-bar-word";
    word.textContent = "Contents";
    btn.appendChild(label);
    btn.appendChild(word);
    sheet = document.createElement("nav");
    sheet.className = "toc-sheet";
    sheet.id = "toc-sheet";
    sheet.setAttribute("aria-label", "Jump to a section");
    sheet.hidden = true;
    btn.setAttribute("aria-controls", "toc-sheet");
    sheetList.removeAttribute("class");
    sheet.appendChild(sheetList);
    sheetLinks = Array.prototype.slice.call(sheet.querySelectorAll("a"));
    bar.appendChild(btn);
    bar.appendChild(strip());
    document.body.appendChild(bar);
    document.body.appendChild(sheet);
    function open(on) {
      sheet.hidden = !on;
      btn.setAttribute("aria-expanded", String(on));
      bar.classList.toggle("open", on);
      if (on) {
        var a = sheet.querySelector("a[aria-current]");
        if (a) sheet.scrollTop = Math.max(0, a.offsetTop - sheet.clientHeight / 3);
      }
    }
    btn.addEventListener("click", function () {
      open(sheet.hidden);
    });
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("a")) open(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !sheet.hidden) {
        open(false);
        btn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!sheet.hidden && !sheet.contains(e.target) && !bar.contains(e.target)) open(false);
    });
    // Shown only while the rail itself is off screen.
    new IntersectionObserver(function (entries) {
      var away = !entries[0].isIntersecting;
      bar.classList.toggle("on", away);
      if (!away) open(false);
    }).observe(toc);
    current = null;
  }
  spy();
  // Before the first group is reached (the study plan), the first group is the one to show.
  if (groups.length && !groups.some(function (g) { return g.open; })) fold(groups[0], true);

  // Chapters and exercises: the hub (index.html) is the one list of them, so it is read from there rather than repeated
  // in every page. A fold in the rail lists them all, subject by subject, and a pager at the end of the page goes to the
  // neighbours of the same kind (chapter to chapter, exercise to exercise). Both keep the current view, guide or lab.
  // Without the hub (opened as a file, offline) nothing is added.
  var here = location.pathname.split("/").slice(-2).join("/"),
    root = new URL("../", location.href),
    KEY = "nav-chapters-4"; // v4 added the subject colour class; a stale older cache is simply ignored
  function parse(html) {
    var doc = new DOMParser().parseFromString(html, "text/html"),
      out = [];
    doc.querySelectorAll("li.subject").forEach(function (sub) {
      var subCode = ((sub.querySelector(".code") || {}).textContent || "").trim(),
        subName = ((sub.querySelector(".about h3") || {}).textContent || "").trim(),
        course = (sub.className.match(/\bs-[a-z]+-\d\b/) || [""])[0];
      sub.querySelectorAll("li.chapter .go").forEach(function (go) {
        var li = go.closest("li.chapter"),
          links = go.querySelectorAll("a");
        out.push({
          kind: "chapter",
          code: li.dataset.code || subCode,
          name: subName,
          course: course,
          no: li.querySelector(".no").textContent.trim(),
          title: li.querySelector(".title").textContent.trim(),
          guide: links[0] && links[0].getAttribute("href"),
          lab: links[1] ? links[1].getAttribute("href") : null,
        });
      });
      sub.querySelectorAll(".parts li[data-tab] a[href]").forEach(function (a, i) {
        out.push({
          kind: (a.closest("li").dataset.tab || "Exercise").toLowerCase(),
          code: subCode,
          name: subName,
          course: course,
          no: a.dataset.no || String(i + 1),
          title: a.textContent.trim(),
          guide: a.getAttribute("href"),
          lab: null,
        });
      });
    });
    return out;
  }
  // "Exercise" → "Exercises", "Appendix" → "Appendices"
  function plural(w) {
    return /ix$/.test(w) ? w.slice(0, -2) + "ices" : w + "s";
  }
  function show(chs) {
    var cur = -1,
      lab = /-lab\.html$/.test(here);
    chs.forEach(function (c, i) {
      if (c.guide === here || c.lab === here) cur = i;
    });
    if (cur < 0) return false;
    function href(c) {
      return "../" + ((lab && c.lab) || c.guide);
    }
    function label(c) {
      return c.kind === "chapter" ? "Chapter " + c.no + ": " + c.title : c.title;
    }
    // The list: the subject being read first and open, the others one row each; inside a subject one fold per kind
    // (lectures, each kind of exercise, tutorials, appendix), with only the fold holding this page open. Whether the
    // list and each fold is open is remembered in localStorage (nav-folds); this page's subject and fold always open.
    var FOLDS = "nav-folds",
      saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(FOLDS)) || {};
    } catch (e) {}
    function remember(key, open) {
      saved[key] = open;
      try {
        localStorage.setItem(FOLDS, JSON.stringify(saved));
      } catch (e) {}
    }
    function fold(cls, key, open, head) {
      var d = document.createElement("details"),
        s = document.createElement("summary");
      d.className = cls;
      if (open) d.open = true;
      if (typeof head === "string") s.textContent = head;
      else head.forEach(function (n) { s.appendChild(n); });
      d.appendChild(s);
      // opening it here fires one toggle of its own; only the reader's toggles are remembered
      var initial = open;
      d.addEventListener("toggle", function () {
        var own = initial && d.open;
        initial = false;
        if (!own) remember(key, d.open);
        if (d.open) reveal(d);
      });
      return d;
    }
    function span(cls, text) {
      var e = document.createElement("span");
      e.className = cls;
      e.textContent = text;
      return e;
    }
    // Scroll the rail or sheet (never the page) so this page's link is in view, once its fold is open.
    function reveal(d) {
      var a = d.querySelector("a[aria-current]");
      if (!a || !a.offsetParent) return;
      for (var s = a.parentElement; s && s !== document.body; s = s.parentElement) {
        var oy = getComputedStyle(s).overflowY;
        if ((oy === "auto" || oy === "scroll") && s.scrollHeight > s.clientHeight + 1) {
          var r = a.getBoundingClientRect(), b = s.getBoundingClientRect();
          if (r.top < b.top || r.bottom > b.bottom) s.scrollTop += r.top - b.top - b.height / 3;
          return;
        }
      }
    }
    function build() {
      var subjects = [],
        bySub = {};
      chs.forEach(function (c, i) {
        if (!bySub[c.code]) subjects.push((bySub[c.code] = { code: c.code, name: c.name, course: c.course, kinds: [], byKind: {} }));
        var S = bySub[c.code];
        if (!S.byKind[c.kind]) S.kinds.push((S.byKind[c.kind] = []));
        S.byKind[c.kind].push(i);
      });
      // this page's subject first, the rest in hub order
      subjects.sort(function (x, y) { return (y.code === me.code) - (x.code === me.code); });
      var top = fold("chapter-fold", "list", saved.list === true, "Chapters"),
        ul = document.createElement("ul");
      ul.className = "fold-subjects";
      subjects.forEach(function (S) {
        var mine = S.code === me.code,
          li = document.createElement("li"),
          code = span("fold-code", S.code);
        li.className = "fold-subject" + (S.course ? " " + S.course : "");
        var sd = fold("fold-sub", "s:" + S.code, mine || saved["s:" + S.code] === true, S.name ? [code, span("fold-name", S.name)] : [code]);
        S.kinds.forEach(function (list) {
          var kind = chs[list[0]].kind,
            key = "k:" + S.code + ":" + kind,
            here = kind === me.kind && mine,
            word = kind === "chapter" ? "Lectures" : plural(kind.charAt(0).toUpperCase() + kind.slice(1)),
            gd = fold("fold-kind", key, here || saved[key] === true, [span("fold-kind-name", word), span("fold-count", String(list.length))]),
            gl = document.createElement("ul");
          list.forEach(function (i) {
            var c = chs[i],
              item = document.createElement("li"),
              a = document.createElement("a");
            a.href = href(c);
            if (c.kind === "chapter") {
              a.appendChild(span("fold-no", c.no));
              a.appendChild(span("fold-title", c.title));
            } else a.appendChild(span("fold-title", c.title.replace(/:.*/, "")));
            if (i === cur) a.setAttribute("aria-current", "page");
            item.appendChild(a);
            gl.appendChild(item);
          });
          gd.appendChild(gl);
          sd.appendChild(gd);
        });
        li.appendChild(sd);
        ul.appendChild(li);
      });
      top.appendChild(ul);
      return top;
    }
    var me = chs[cur];
    var anchor = toc.querySelector(".chapter-switch") || toc.querySelector("a.home");
    // settings.js may already have wrapped "All semesters" in a row with the gear; the list goes after that row.
    if (anchor) anchor = anchor.closest(".home-row") || anchor;
    if (anchor && !toc.querySelector(".chapter-fold")) anchor.parentNode.insertBefore(build(), anchor.nextSibling);
    if (sheet && !sheet.querySelector(".chapter-fold")) sheet.insertBefore(build(), sheet.firstChild);
    var railList = toc.querySelector(".chapter-fold");
    if (railList && railList.open) reveal(railList);
    // Pager: neighbours of the same kind within the same subject.
    function same(c) {
      return c && c.code === me.code && c.kind === me.kind ? c : null;
    }
    var main = document.querySelector("main"),
      prev = same(chs[cur - 1]),
      next = same(chs[cur + 1]),
      noun = me.kind === "chapter" ? "chapter" : me.kind;
    if (main && (prev || next) && !document.querySelector(".chapter-pager")) {
      var nav = document.createElement("nav");
      nav.className = "chapter-pager";
      nav.setAttribute("aria-label", "Neighbouring " + plural(noun));
      [[prev, "Previous " + noun, "prev"], [next, "Next " + noun, "next"]].forEach(function (p) {
        var a = document.createElement(p[0] ? "a" : "span"),
          k = document.createElement("span"),
          t = document.createElement("span");
        a.className = p[2];
        k.className = "pager-kind";
        k.textContent = p[1];
        t.className = "pager-title";
        if (p[0]) {
          a.href = href(p[0]);
          t.textContent = label(p[0]);
        }
        a.appendChild(k);
        a.appendChild(t);
        nav.appendChild(a);
      });
      main.appendChild(nav);
    }
    return true;
  }
  var cached = null;
  try {
    cached = JSON.parse(sessionStorage.getItem(KEY));
  } catch (e) {}
  // a list saved earlier in this tab may predate the page being on the hub (a new tutorial, say): then fetch afresh
  if (cached && show(cached)) return;
  if (window.fetch)
    fetch(new URL("index.html", root))
      .then(function (r) {
        return r.ok ? r.text() : Promise.reject();
      })
      .then(function (html) {
        var chs = parse(html);
        try {
          sessionStorage.setItem(KEY, JSON.stringify(chs));
        } catch (e) {}
        show(chs);
      })
      .catch(function () {});
})();
