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
    KEY = "nav-chapters-2"; // v2 added exercises; a stale v1 cache is simply ignored
  function parse(html) {
    var doc = new DOMParser().parseFromString(html, "text/html"),
      out = [];
    doc.querySelectorAll("li.subject").forEach(function (sub) {
      var subCode = ((sub.querySelector(".code") || {}).textContent || "").trim();
      sub.querySelectorAll("li.chapter .go").forEach(function (go) {
        var li = go.closest("li.chapter"),
          links = go.querySelectorAll("a");
        out.push({
          kind: "chapter",
          code: li.dataset.code || subCode,
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
          no: a.dataset.no || String(i + 1),
          title: a.textContent.trim(),
          guide: a.getAttribute("href"),
          lab: null,
        });
      });
    });
    return out;
  }
  function show(chs) {
    var cur = -1,
      lab = /-lab\.html$/.test(here);
    chs.forEach(function (c, i) {
      if (c.guide === here || c.lab === here) cur = i;
    });
    if (cur < 0) return;
    function href(c) {
      return "../" + ((lab && c.lab) || c.guide);
    }
    function label(c) {
      return c.kind === "chapter" ? "Chapter " + c.no + ": " + c.title : c.title;
    }
    function build() {
      var d = document.createElement("details"),
        sum = document.createElement("summary"),
        ul = document.createElement("ul");
      d.className = "chapter-fold";
      sum.textContent = "Chapters";
      d.appendChild(sum);
      var group = null;
      chs.forEach(function (c, i) {
        var g = c.code + (c.kind === "chapter" ? "" : " " + c.kind + "s");
        if (g !== group) {
          group = g;
          var h = document.createElement("li");
          h.className = "fold-code";
          h.textContent = c.kind === "chapter" ? c.code : c.code + " · " + c.kind.charAt(0).toUpperCase() + c.kind.slice(1) + "s";
          ul.appendChild(h);
        }
        var li = document.createElement("li"),
          a = document.createElement("a");
        a.href = href(c);
        a.textContent = c.kind === "chapter" ? c.no + " " + c.title : c.title.replace(/:.*/, "");
        if (i === cur) a.setAttribute("aria-current", "page");
        li.appendChild(a);
        ul.appendChild(li);
      });
      d.appendChild(ul);
      return d;
    }
    var anchor = toc.querySelector(".chapter-switch") || toc.querySelector("a.home");
    // settings.js may already have wrapped "All semesters" in a row with the gear; the list goes after that row.
    if (anchor) anchor = anchor.closest(".home-row") || anchor;
    if (anchor && !toc.querySelector(".chapter-fold")) anchor.parentNode.insertBefore(build(), anchor.nextSibling);
    if (sheet && !sheet.querySelector(".chapter-fold")) sheet.insertBefore(build(), sheet.firstChild);
    // Pager: neighbours of the same kind within the same subject.
    var me = chs[cur];
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
      nav.setAttribute("aria-label", "Neighbouring " + noun + "s");
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
  }
  var cached = null;
  try {
    cached = JSON.parse(sessionStorage.getItem(KEY));
  } catch (e) {}
  if (cached) show(cached);
  else if (window.fetch)
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
