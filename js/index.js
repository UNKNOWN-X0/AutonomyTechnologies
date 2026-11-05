(function () {
  // Chapter rows follow each other in as their subject scrolls into view.
  document.querySelectorAll(".subjects .chapters").forEach(function (list) {
    list.querySelectorAll(".chapter").forEach(function (c, i) {
      c.style.setProperty("--c", Math.min(i, 6));
    });
  });
  // Spaced review: each distinct study day logged by a guide widens the gap.
  var GAPS = [1, 7, 30];
  var DAY = 86400000;

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function today() {
    var d = new Date();
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function parseDay(s) {
    var p = s.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  // Guide skills first, then lab experiments after a small gap. --i staggers the fill animation.
  function ticksHTML(c) {
    var html = "",
      n = 0,
      guide = c.total - c.lab;
    function bars(done, count, first) {
      for (var i = 0; i < count; i++) {
        var cls = (i < done ? "on" : "") + (first && i === 0 ? " lab-start" : "");
        html += "<i" + (cls.trim() ? ' class="' + cls.trim() + '"' : "") + (i < done ? ' style="--i:' + n++ + '"' : "") + "></i>";
      }
    }
    bars(c.guideDone, guide, false);
    if (c.lab) bars(c.labDone, c.lab, true);
    return html;
  }
  function tickTip(c) {
    return c.lab ? c.guideDone + " of " + (c.total - c.lab) + " guide skills · " + c.labDone + " of " + c.lab + " lab experiments" : c.done + " of " + c.total + " chapter skills ticked";
  }

  var chapters = Array.prototype.map.call(document.querySelectorAll("li.chapter[data-key]"), function (li) {
    var key = li.dataset.key;
    var total = +li.dataset.total || 0;
    var checks = read(key + "-checks", {});
    var lab = +li.dataset.lab || 0;
    var labDone = Object.keys(checks).filter(function (k) {
      return checks[k] && k.indexOf("lab-") === 0;
    }).length;
    var guideDone = Object.keys(checks).filter(function (k) {
      return checks[k] && k.indexOf("lab-") !== 0;
    }).length;
    var done = guideDone + labDone;
    var log = read(key + "-log", { days: [] });
    var days = (log.days || []).slice().sort();
    var item = {
      li: li,
      code: li.dataset.code,
      course: li.dataset.course,
      title: li.querySelector(".title").textContent,
      links: li.querySelector(".go").innerHTML,
      done: Math.min(done, total),
      total: total,
      lab: lab,
      labDone: Math.min(labDone, lab),
      guideDone: Math.min(guideDone, total - lab),
      state: "new",
      since: null,
      gap: GAPS[0],
      weight: 0,
    };
    if (days.length) {
      item.gap = GAPS[Math.min(days.length, GAPS.length) - 1];
      item.since = Math.round((today() - parseDay(days[days.length - 1])) / DAY);
      item.weight = item.since / item.gap;
      item.state = item.weight >= 2 ? "overdue" : item.weight >= 1 ? "due" : "fresh";
    } else if (done > 0) {
      item.state = "due";
      item.weight = 1;
    }
    li.classList.toggle("started", item.state !== "new");
    li.querySelector(".ticks").innerHTML = ticksHTML(item) + "<b>" + item.done + "/" + total + "</b>";
    li.querySelector(".ticks").classList.toggle("mastered", total > 0 && item.done === total);
    li.querySelector(".ticks").dataset.tip = tickTip(item);
    li.setAttribute("aria-label", li.querySelector(".title").textContent + ": " + item.done + " of " + total + " chapter skills ticked");
    return item;
  });

  // The route is lit down to the furthest chapter in each semester that has been started.
  function topIn(el, root) {
    var y = 0;
    for (; el && el !== root; el = el.offsetParent) y += el.offsetTop;
    return y;
  }
  function route() {
    document.querySelectorAll(".subjects").forEach(function (ul) {
      var last = null;
      ul.querySelectorAll("li.chapter.started").forEach(function (li) {
        last = li;
      });
      // a folded subject hides its chapters, so the route then stops at the subject's tile
      var at = last && !last.offsetParent ? last.closest("li.subject").querySelector(".code") : last;
      ul.querySelectorAll("li.chapter.here").forEach(function (li) {
        li.classList.remove("here");
      });
      if (last && last.offsetParent) last.classList.add("here");
      if (!ul.querySelector(".route-pulse")) {
        var pulse = document.createElement("li");
        pulse.className = "route-pulse";
        pulse.setAttribute("aria-hidden", "true");
        ul.appendChild(pulse);
      }
      ul.style.setProperty("--route-lit", at ? topIn(at, ul) + at.offsetHeight / 2 + "px" : "0px");
    });
  }
  var queued = false;
  function reroute() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      route();
    });
  }
  route();
  window.addEventListener("resize", reroute);
  window.addEventListener("load", reroute);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reroute);

  // Course parts act as tabs; Lecture keeps the chapter route, while other tabs show their linked resources or an honest empty state.
  document.querySelectorAll("li.subject").forEach(function (sub, si) {
    var parts = sub.querySelector("ul.parts"),
      chapters = sub.querySelector("ol.chapters");
    if (!parts || !chapters || !parts.children.length) return;

    var subjectCode = (sub.querySelector(".code") || {}).textContent || "course",
      panels = document.createElement("div"),
      tabItems = Array.prototype.slice.call(parts.children),
      tabs = [],
      views = [];
    parts.setAttribute("role", "tablist");
    parts.setAttribute("aria-label", subjectCode.trim() + " course parts");
    panels.className = "part-panels";
    parts.parentNode.insertBefore(panels, parts.nextSibling);

    tabItems.forEach(function (item, pi) {
      var sourceLink = item.querySelector("a[href]"),
        label = item.dataset.tab || (sourceLink ? sourceLink.textContent.trim() : item.textContent.trim()),
        key = "part-" + si + "-" + pi,
        tab = document.createElement("button"),
        panel = document.createElement("div");
      tab.type = "button";
      tab.className = "part-tab";
      tab.id = key + "-tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", key + "-panel");
      tab.setAttribute("aria-selected", "false");
      tab.tabIndex = -1;
      tab.textContent = label;
      item.setAttribute("role", "presentation");
      item.replaceChildren(tab);

      panel.className = "part-panel";
      panel.id = key + "-panel";
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      panel.hidden = true;
      if (label.toLowerCase() === "lecture") {
        chapters.id = key + "-chapters";
        panel.appendChild(chapters);
      } else if (sourceLink) {
        var resource = document.createElement("div"),
          heading = document.createElement("h4"),
          link = sourceLink.cloneNode(true),
          note = document.createElement("p");
        resource.className = "part-resource";
        heading.appendChild(link);
        note.textContent = tabItems[pi].dataset.note || "Open the linked " + label.toLowerCase() + " material.";
        resource.appendChild(heading);
        resource.appendChild(note);
        panel.appendChild(resource);
      } else {
        var empty = document.createElement("p");
        empty.className = "part-empty";
        empty.textContent = "No " + label.toLowerCase() + " material is posted here yet.";
        panel.appendChild(empty);
      }
      panels.appendChild(panel);
      tabs.push(tab);
      views.push(panel);

      function select(index, focus) {
        tabs.forEach(function (other, i) {
          var selected = i === index;
          other.setAttribute("aria-selected", String(selected));
          other.tabIndex = selected ? 0 : -1;
          views[i].hidden = !selected;
        });
        if (focus) tabs[index].focus();
        reroute();
      }
      tab.addEventListener("click", function () { select(pi, false); });
      tab.addEventListener("keydown", function (event) {
        var next = pi;
        if (event.key === "ArrowRight") next = (pi + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (pi + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        select(next, true);
      });
    });
    if (tabs.length) {
      tabs[0].setAttribute("aria-selected", "true");
      tabs[0].tabIndex = 0;
      views[0].hidden = false;
    }
  });
  reroute();

  // Subjects fold their chapter lists. Until any chapter is started everything is open; after that a subject you have
  // started opens by default and the rest start folded. A subject you open or fold yourself stays that way (saved here).
  var folds = read("hub-folds", {}),
    anyStarted = !!document.querySelector("li.chapter.started");
  document.querySelectorAll("li.subject").forEach(function (sub, n) {
    var list = sub.querySelector("ol.chapters"),
      items = list ? list.querySelectorAll("li.chapter") : [],
      about = sub.querySelector(".about"),
      code = (sub.querySelector(".code") || {}).textContent;
    if (!items.length || !about) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "subject-fold";
    list.id = list.id || "chapters-" + n;
    btn.setAttribute("aria-controls", list.id);
    btn.textContent = items.length + (items.length === 1 ? " chapter" : " chapters");
    about.appendChild(btn);
    function set(open) {
      list.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      sub.classList.toggle("folded", !open);
    }
    set(code in folds ? folds[code] : !anyStarted || !!sub.querySelector("li.chapter.started"));
    btn.addEventListener("click", function () {
      set(list.hidden);
      folds[code] = !list.hidden;
      list.classList.toggle("opening", !list.hidden);
      setTimeout(function () {
        list.classList.remove("opening");
      }, 300);
      try {
        localStorage.setItem("hub-folds", JSON.stringify(folds));
      } catch (e) {}
      reroute();
    });
  });
  route();

  var order = { overdue: 0, due: 1, new: 2, fresh: 3 };
  chapters.sort(function (a, b) {
    return order[a.state] - order[b.state] || b.weight - a.weight;
  });

  var rows = document.getElementById("rows");
  var started = chapters.some(function (c) {
    return c.state !== "new";
  });
  radar(); // drawn for everyone; with nothing started it is an empty sweep
  if (!started) {
    rows.hidden = true;
    tips();
    return;
  }
  document.getElementById("board-empty").hidden = true;

  // First hub visit of the session: a signal line sweeps down the screen once and each started chapter's route stop
  // fills as the line reaches it. Content stays visible throughout; only the stops and the line move.
  (function sweep() {
    var SPAN = 600;
    if (window.scrollY > 0) return;
    if (window.siteReduceMotion ? window.siteReduceMotion() : window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.documentElement.animate) return;
    try {
      if (sessionStorage.getItem("hub-swept")) return;
      sessionStorage.setItem("hub-swept", "1");
    } catch (e) {
      return;
    }
    var root = document.documentElement,
      stops = Array.prototype.slice.call(document.querySelectorAll("li.chapter.started"));
    if (!stops.length) return;
    root.classList.add("sweeping");
    // Stops below the fold fill the first time they scroll into view, so the route reads as reached as you go.
    var waiting = stops.length,
      seen = "IntersectionObserver" in window ? new IntersectionObserver(reach) : null;
    function light(li) {
      if (li.classList.contains("lit")) return;
      li.classList.add("lit");
      if (--waiting === 0) root.classList.remove("sweeping");
    }
    function reach(entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        seen.unobserve(e.target);
        light(e.target);
      });
    }
    function go() {
      var line = document.createElement("div"),
        h = window.innerHeight;
      line.className = "sweep-line";
      line.setAttribute("aria-hidden", "true");
      document.body.appendChild(line);
      stops.forEach(function (li) {
        var r = li.getBoundingClientRect(),
          at = r.top + r.height / 2;
        if (at < h) setTimeout(function () { light(li); }, (Math.max(at, 0) / h) * SPAN);
        else if (seen) seen.observe(li);
        else light(li);
      });
      line
        .animate([{ transform: "translateY(0)" }, { transform: "translateY(" + h + "px)" }], { duration: SPAN, easing: "linear", fill: "forwards" })
        .finished.then(function () { line.remove(); }, function () { line.remove(); });
    }
    // Arriving from another page of the site means a page transition is playing: wait it out, so two sweeps never overlap.
    var inside = document.referrer.indexOf(location.origin) === 0;
    setTimeout(go, inside ? 450 : 0);
  })();

  function ago(n) {
    return n === 0 ? "today" : n === 1 ? "yesterday" : n + " days ago";
  }
  function when(c) {
    if (c.state === "new") return { big: "—", small: "not started" };
    if (c.since === null) return { big: "now", small: "first review" };
    if (c.state === "fresh") return { big: "in " + (c.gap - c.since) + " d", small: "reviewed " + ago(c.since) };
    var late = c.since - c.gap;
    if (late > 0) return { big: late + " d", small: "overdue · reviewed " + ago(c.since) };
    return { big: "due", small: "reviewed " + ago(c.since) };
  }

  rows.innerHTML = chapters
    .map(function (c) {
      var w = when(c);
      return (
        '<li class="row ' + c.state + '" data-key="' + c.li.dataset.key + '">' +
        '<p class="gap"><b>' + w.big + "</b><span>" + w.small + "</span></p>" +
        '<span class="code ' + c.course + '">' + c.code + "</span>" +
        '<h3 class="ch">' + c.title + "</h3>" +
        '<p class="count"><span class="ticks' + (c.total > 0 && c.done === c.total ? " mastered" : "") + '" aria-hidden="true" data-tip="' + tickTip(c) + '">' + ticksHTML(c) + "</span>" +
        "<span>" + c.done + " / " + c.total + " skills</span></p>" +
        '<div class="go">' + c.links + "</div>" +
        "</li>"
      );
    })
    .join("");

  tips();
  settle();
  foldBoard();

  // The board shows what is due first. Chapters not due yet (new or fresh) fold under one button when something is due;
  // when nothing is due, the fresh ones show and only the new ones fold.
  function foldBoard() {
    var all = Array.prototype.slice.call(rows.children),
      due = all.filter(function (r) {
        return r.classList.contains("due") || r.classList.contains("overdue");
      }),
      keep = due.length ? due : all.filter(function (r) {
        return r.classList.contains("fresh");
      }),
      rest = all.filter(function (r) {
        return keep.indexOf(r) < 0;
      });
    if (!keep.length || !rest.length) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "board-more";
    btn.setAttribute("aria-controls", "rows");
    rows.parentNode.insertBefore(btn, rows.nextSibling);
    function set(open) {
      rest.forEach(function (r) {
        r.hidden = !open;
      });
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Show only what is " + (due.length ? "due" : "reviewed") : "Show all " + all.length + " chapters";
    }
    set(false);
    btn.addEventListener("click", function () {
      set(rest[0].hidden);
    });
  }

  // The board settles: when a review has moved a chapter from due to fresh since the last visit,
  // its row slides from its old place (FLIP) and its gap value counts up to the new interval.
  function settle() {
    var prev = null,
      now = { order: [], state: {} };
    chapters.forEach(function (c) {
      var k = c.li.dataset.key;
      now.order.push(k);
      now.state[k] = c.state;
    });
    try {
      prev = JSON.parse(sessionStorage.getItem("board-last"));
      sessionStorage.setItem("board-last", JSON.stringify(now));
    } catch (e) {}
    if (!prev || !prev.order || !prev.state) return;
    if (window.siteReduceMotion ? window.siteReduceMotion() : window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!rows.animate) return;
    var els = {},
      heights = {};
    Array.prototype.forEach.call(rows.children, function (r) {
      els[r.dataset.key] = r;
      heights[r.dataset.key] = r.offsetHeight;
    });
    var oldTop = {},
      y = 0;
    prev.order.forEach(function (k) {
      if (!els[k]) return;
      oldTop[k] = y;
      y += heights[k];
    });
    var newTop = 0;
    now.order.forEach(function (k) {
      var el = els[k],
        h = heights[k],
        was = prev.state[k];
      if (el && oldTop[k] !== undefined && was !== undefined && oldTop[k] !== newTop) {
        el.animate([{ transform: "translateY(" + (oldTop[k] - newTop) + "px)" }, { transform: "none" }], { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      }
      if (el && (was === "due" || was === "overdue") && now.state[k] === "fresh") countUp(el.querySelector(".gap b"));
      newTop += h || 0;
    });
  }
  function countUp(b) {
    var m = b && /^in (\d+) d$/.exec(b.textContent);
    if (!m) return;
    var to = +m[1],
      t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / 400, 1);
      b.textContent = "in " + Math.round(to * p) + " d";
      if (p < 1) requestAnimationFrame(step);
    }
    b.textContent = "in 0 d";
    requestAnimationFrame(step);
    setTimeout(function () {
      b.textContent = "in " + to + " d";
    }, 450);
  }

  // Radar behind the sign field: a sweep turns over a range grid and each started chapter is a contact on it. The angle
  // is the subject (one sector each, in hub order) and the range is how far into that subject the chapter sits, so the
  // contacts spread outward as you work through a subject. A contact flares as the sweep passes over it.
  function radar() {
    var field = document.querySelector("header.field");
    if (!field) return;
    var SPIN = 6,
      box = document.createElement("div"),
      sweep = document.createElement("div"),
      subjects = Array.prototype.slice.call(document.querySelectorAll("li.subject"));
    box.className = "radar";
    box.setAttribute("aria-hidden", "true");
    sweep.className = "radar-sweep";
    // The grid is inline SVG (rings, crosshairs, bearing ticks), which every engine paints the same way.
    var NS = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(NS, "svg"),
      grid = "";
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("class", "radar-grid");
    [25, 50, 75, 99].forEach(function (r) {
      grid += '<circle cx="100" cy="100" r="' + r + '"/>';
    });
    grid += '<path d="M100 1V199M1 100H199"/>';
    for (var deg = 0; deg < 360; deg += 10) {
      var rr = (deg * Math.PI) / 180,
        inner = deg % 30 ? 95 : 91;
      grid +=
        '<line class="tick" x1="' + (100 + Math.sin(rr) * inner).toFixed(2) + '" y1="' + (100 - Math.cos(rr) * inner).toFixed(2) +
        '" x2="' + (100 + Math.sin(rr) * 99).toFixed(2) + '" y2="' + (100 - Math.cos(rr) * 99).toFixed(2) + '"/>';
    }
    svg.innerHTML = grid;
    box.appendChild(svg);
    box.appendChild(sweep);
    var furthest = [];
    document.querySelectorAll(".subjects").forEach(function (ul) {
      var all = ul.querySelectorAll("li.chapter.started");
      if (all.length) furthest.push(all[all.length - 1]);
    });
    subjects.forEach(function (sub, si) {
      var chaps = sub.querySelectorAll("li.chapter");
      chaps.forEach(function (li, ci) {
        if (!li.classList.contains("started")) return;
        var a = ((si + 0.2 + (0.6 * (ci + 1)) / (chaps.length + 1)) / subjects.length) * 360,
          r = 0.22 + (0.7 * (ci + 1)) / (chaps.length + 1),
          rad = (a * Math.PI) / 180,
          blip = document.createElement("span");
        blip.className = "blip" + (furthest.indexOf(li) > -1 ? " here" : "");
        blip.style.left = 50 + Math.sin(rad) * r * 50 + "%";
        blip.style.top = 50 - Math.cos(rad) * r * 50 + "%";
        blip.style.animationDelay = ((a / 360) * SPIN).toFixed(2) + "s";
        box.appendChild(blip);
      });
    });
    field.insertBefore(box, field.firstChild);
  }

  // Tooltips (shown by js/tooltip.js). Runs whether or not any chapter has been started.
  function tips() {
    var names = {};
    document.querySelectorAll("li.subject").forEach(function (sub) {
      var code = sub.querySelector(".code"),
        name = sub.querySelector("h3"),
        module = sub.querySelector(".module");
      if (!code || !name) return;
      names[code.textContent.trim()] = name.textContent.trim();
      code.dataset.tip = name.textContent.trim() + (module ? " · " + module.textContent.split("·")[0].trim() : "");
      sub.querySelectorAll(".parts li").forEach(function (part) {
        part.dataset.tip = part.classList.contains("has") ? "Material available" : "No material yet";
      });
    });
    document.querySelectorAll("#rows .code").forEach(function (code) {
      var name = names[code.textContent.trim()];
      if (name) code.dataset.tip = name;
    });
    document.querySelectorAll(".semesters a").forEach(function (a) {
      a.dataset.tip = "Jump to " + a.textContent.replace(/\s+/g, " ").trim().replace(/^\d+\s*/, "");
    });
  }
})();
