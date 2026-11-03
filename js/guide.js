/* Study guide behaviour. Set <body data-key="<prefix>">; ticks save as <prefix>-checks, review days as <prefix>-log. */
(function () {
  var PREFIX = document.body.dataset.key || "guide",
    KEY = PREFIX + "-checks",
    LOG = PREFIX + "-log",
    saved = {},
    log = { days: [] };
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    log = JSON.parse(localStorage.getItem(LOG) || '{"days":[]}');
  } catch (e) {}
  if (!Array.isArray(log.days)) log.days = [];

  function stamp() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function logToday() {
    var t = stamp();
    if (log.days.indexOf(t) === -1) log.days.push(t);
    try {
      localStorage.setItem(LOG, JSON.stringify(log));
    } catch (e) {}
    render();
  }

  var boxes = document.querySelectorAll("li.check input"),
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    bars = [],
    hold = -1; // segment kept empty while a ticked skill travels to it
  boxes.forEach(function (cb) {
    cb.checked = !!saved[cb.dataset.k];
    cb.addEventListener("change", function () {
      saved[cb.dataset.k] = cb.checked;
      try {
        localStorage.setItem(KEY, JSON.stringify(saved));
      } catch (e) {}
      // A new tick flies to the bar segment it fills, if a bar is on screen; otherwise the segment just fills.
      var target = null;
      hold = -1;
      if (cb.checked && !reduce) {
        var idx = Array.prototype.filter.call(boxes, function (b) {
          return b.checked;
        }).length - 1;
        bars.some(function (bar) {
          var r = bar.segs[idx] && bar.segs[idx].getBoundingClientRect();
          if (r && r.top >= 0 && r.bottom <= window.innerHeight) return (target = bar.segs[idx]);
        });
        if (target) hold = idx;
      }
      logToday();
      if (target)
        travel(cb, target, function () {
          hold = -1;
          render();
        });
      [meta, status].forEach(function (el) {
        if (!el) return;
        el.classList.remove("lit");
        void el.offsetWidth; // restart the animation on repeated ticks
        el.classList.add("lit");
      });
    });
  });

  // Tick bars: one segment per guide skill (then per lab experiment), like the hub's, in the sign header and under the checklist.
  function addBar(host, before, extra) {
    var el = document.createElement("span"),
      segs = [],
      total = boxes.length + (+document.body.dataset.lab || 0);
    el.className = "ticks sign-ticks" + (extra ? " " + extra : "");
    el.setAttribute("aria-hidden", "true");
    for (var i = 0; i < total; i++) {
      var seg = document.createElement("i");
      if (i === boxes.length) seg.className = "lab-start";
      seg.style.setProperty("--i", Math.min(i, 14));
      el.appendChild(seg);
      segs.push(seg);
    }
    host.insertBefore(el, before);
    bars.push({ el: el, segs: segs });
  }
  function paint(done, labDone) {
    bars.forEach(function (bar) {
      bar.segs.forEach(function (seg, i) {
        seg.classList.toggle("on", i !== hold && (i < boxes.length ? i < done : i - boxes.length < labDone));
      });
      bar.el.classList.toggle("mastered", bar.segs.length > 0 && done + labDone === bar.segs.length);
    });
  }
  // The ticked skill's square arcs from its checkbox to the segment it fills.
  function travel(from, to, finish) {
    var a = from.getBoundingClientRect(),
      b = to.getBoundingClientRect(),
      fx = a.left + a.width / 2,
      fy = a.top + a.height / 2,
      tx = b.left + b.width / 2,
      ty = b.top + b.height / 2,
      dot = document.createElement("span");
    dot.className = "tick-dot";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    var anim = dot.animate(
      [
        { transform: "translate(" + fx + "px," + fy + "px) scale(1)" },
        { transform: "translate(" + (fx + tx) / 2 + "px," + (Math.min(fy, ty) - 48) + "px) scale(1.2)", offset: 0.5 },
        { transform: "translate(" + tx + "px," + ty + "px) scale(0.7)" },
      ],
      { duration: 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
    );
    anim.onfinish = anim.oncancel = function () {
      dot.remove();
      finish();
    };
  }

  // Review log: shown in the sign header and under the checklist.
  var meta = document.getElementById("review-meta");
  var list = boxes.length ? boxes[boxes.length - 1].closest("ul") : null;
  var panel, status, button;
  if (list) {
    panel = document.createElement("div");
    panel.className = "review";
    status = document.createElement("p");
    button = document.createElement("button");
    button.type = "button";
    button.className = "btn primary";
    button.textContent = "Log today's review";
    button.addEventListener("click", logToday);
    panel.appendChild(status);
    panel.appendChild(button);
    list.parentNode.insertBefore(panel, list.nextSibling);
    addBar(panel, button);
    addBar(list.parentNode, list, "list-ticks"); // so a bar is usually on screen while you tick
  }
  if (meta && boxes.length) addBar(meta.parentNode, meta.nextSibling);

  function render() {
    var done = 0;
    boxes.forEach(function (cb) {
      if (cb.checked) done++;
    });
    var days = log.days.slice().sort(),
      last = days[days.length - 1],
      labTotal = +document.body.dataset.lab || 0,
      labDone = Object.keys(saved).filter(function (k) {
        return saved[k] && k.indexOf("lab-") === 0;
      }).length,
      skills = done + " of " + boxes.length + (labTotal ? " guide skills · " + labDone + " of " + labTotal + " lab experiments" : " chapter skills ticked"),
      text;
    if (!last) text = skills + " · not reviewed yet";
    else {
      var p = last.split("-"),
        then = new Date(+p[0], +p[1] - 1, +p[2]),
        now = new Date(),
        since = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - then) / 86400000);
      text =
        skills + " · last reviewed " +
        (since === 0 ? "today" : since === 1 ? "yesterday" : since + " days ago") +
        " · " + days.length + (days.length === 1 ? " review" : " reviews");
    }
    paint(done, labDone);
    if (meta) meta.textContent = text;
    if (status) status.textContent = text;
    if (button) button.disabled = last === stamp();
    if (button && button.disabled) button.textContent = "Reviewed today";
  }
  render();
  // Once the first fill has played, a newly ticked segment fills at once.
  setTimeout(function () {
    bars.forEach(function (bar) {
      bar.el.classList.add("painted");
    });
  }, 900);

  // The contents rail itself (current section, follow, phone bar) lives in js/nav.js, shared with the labs.
  var links = Array.prototype.slice.call(document.querySelectorAll("nav.toc ol a"));

  // Tooltips (shown by js/tooltip.js). Full section titles behind the short contents entries.
  var titles = {};
  document.querySelectorAll("main section[id]").forEach(function (sec) {
    var h = sec.querySelector("h2");
    if (h) titles[sec.id] = h.textContent.trim();
  });
  links.forEach(function (a) {
    var full = titles[decodeURIComponent(a.hash.slice(1))];
    if (full && full !== a.textContent.trim()) a.dataset.tip = full;
  });

  // Section references in answers ("§1.12, 1.14") become links to those sections.
  // (not inside the concept map: its nodes are buttons, and its detail panel carries the link)
  document.querySelectorAll(".sec-ref").forEach(function (ref) {
    if (ref.closest(".cmap")) return;
    ref.innerHTML = ref.textContent.replace(/\d+\.\d+/g, function (n) {
      var id = "sec-" + n.replace(".", "");
      if (!titles[id]) return n;
      return '<a href="#' + id + '" data-tip="Revisit ' + titles[id].replace(/"/g, "&quot;") + '">' + n + "</a>";
    });
  });

  // Answer keys ask for a commitment first: the first press arms, the second opens.
  document.querySelectorAll("details.answers").forEach(function (d) {
    var sum = d.querySelector("summary");
    if (!sum) return;
    var label = sum.textContent;
    d.querySelectorAll(":scope > ol > li").forEach(function (li, i) {
      li.style.setProperty("--n", Math.min(i, 8));
    });
    sum.addEventListener("click", function (e) {
      if (d.open || d.classList.contains("armed")) return;
      e.preventDefault();
      d.classList.add("armed");
      sum.textContent = "Written your answer down? Open the answers";
    });
    d.addEventListener("toggle", function () {
      d.classList.remove("armed");
      sum.textContent = label;
    });
  });

  // Worked examples can be stepped through: the steps show one at a time, so the next one is worked out before it is read.
  // Every step stays visible until the button is pressed, and without script the example is simply whole.
  document.querySelectorAll(".worked").forEach(function (box) {
    var steps = box.querySelectorAll(":scope > ol.method-list > li"),
      list = steps.length ? steps[0].parentNode : null;
    if (steps.length < 2) return;
    var btn = document.createElement("button"),
      shown = steps.length;
    btn.type = "button";
    btn.className = "btn step-btn";
    list.parentNode.insertBefore(btn, list.nextSibling);
    function label() {
      btn.textContent = shown === steps.length ? (stepping ? "Show all again" : "Step through") : "Next step (" + (shown + 1) + " of " + steps.length + ")";
    }
    var stepping = false;
    function show(n) {
      shown = n;
      steps.forEach(function (li, i) {
        li.hidden = stepping && i >= n;
      });
      label();
    }
    btn.addEventListener("click", function () {
      if (!stepping) {
        stepping = true;
        show(1);
      } else if (shown < steps.length) {
        var li = steps[shown];
        show(shown + 1);
        li.classList.remove("step-in");
        void li.offsetWidth; // restart the reveal if it is pressed quickly
        li.classList.add("step-in");
        setTimeout(function () {
          li.classList.remove("step-in");
        }, 900);
      } else {
        stepping = false;
        show(steps.length);
      }
    });
    label();
  });

  // Symbol tracing (mouse only): hovering a symbol underlines the same symbol everywhere in its section, in reading order.
  // A symbol is the variable plus a subscript directly after it, so E and E1 are different. Purely a reading aid.
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)"),
    traced = [];
  function symbol(v) {
    var n = v.nextElementSibling,
      sub = n && n.tagName === "SUB" && v.nextSibling === n ? n : null;
    return { key: v.textContent.trim() + "|" + (sub ? sub.textContent.trim() : ""), sub: sub };
  }
  function untrace() {
    var gone = traced;
    traced = [];
    gone.forEach(function (el) {
      el.classList.add("trace-off");
    });
    setTimeout(function () {
      gone.forEach(function (el) {
        el.classList.remove("trace", "trace-off");
        el.style.removeProperty("--t");
      });
    }, 170);
  }
  document.addEventListener("mouseover", function (e) {
    var v = e.target.closest && e.target.closest("var");
    if (!v || !fine.matches || v.closest(".cmap, details.answers, nav")) return;
    var sec = v.closest("section");
    if (!sec) return;
    var want = symbol(v).key,
      hits = Array.prototype.filter.call(sec.querySelectorAll("var"), function (x) {
        return !x.closest(".cmap, details.answers") && symbol(x).key === want;
      });
    if (hits.length < 2) return;
    untrace();
    hits.forEach(function (x, i) {
      var parts = [x],
        sub = symbol(x).sub;
      if (sub) parts.push(sub);
      parts.forEach(function (el) {
        el.classList.remove("trace-off");
        el.style.setProperty("--t", Math.min(i, 11));
        el.classList.add("trace");
        traced.push(el);
      });
    });
  });
  document.addEventListener("mouseout", function (e) {
    var v = e.target.closest && e.target.closest("var");
    if (v && !(e.relatedTarget && v.contains(e.relatedTarget))) untrace();
  });

  // Subject code: name the course.
  var code = document.querySelector(".sign .code"),
    course = document.querySelector(".sign .course");
  if (code && course) code.dataset.tip = course.textContent.trim();
})();
