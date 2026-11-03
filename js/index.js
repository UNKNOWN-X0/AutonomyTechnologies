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
      ul.style.setProperty("--route-lit", last ? topIn(last, ul) + last.offsetHeight / 2 + "px" : "0px");
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

  var order = { overdue: 0, due: 1, new: 2, fresh: 3 };
  chapters.sort(function (a, b) {
    return order[a.state] - order[b.state] || b.weight - a.weight;
  });

  var rows = document.getElementById("rows");
  var started = chapters.some(function (c) {
    return c.state !== "new";
  });
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
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
