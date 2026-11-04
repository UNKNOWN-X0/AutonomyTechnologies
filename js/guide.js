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
    reduce = window.siteReduceMotion ? window.siteReduceMotion() : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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

  // Arrow diagrams (figure.amap): each set is a box with its elements, and each pair in data-map is an arrow.
  // data-sets="X: 1, 2, 3 | Y: a, b, c", data-map="1>a 2>b | …" (one group per gap between sets), data-rev draws the
  // arrows backwards (an inverse). An input without exactly one arrow and an output reached more than once are shown in
  // action blue; an output never reached is greyed, so the property named in the caption can be seen. The PDF
  // (tools/guide-to-tex.py) draws the same data with the same rules.
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) {
      n.setAttribute(k, attrs[k]);
    });
    if (parent) parent.appendChild(n);
    return n;
  }
  document.querySelectorAll("figure.amap").forEach(function (fig, fi) {
    var sets = (fig.dataset.sets || "").split("|").map(function (part) {
        var bits = part.split(":");
        return {
          name: bits[0].trim(),
          items: (bits[1] || "").split(",").map(function (x) {
            return x.trim();
          }).filter(Boolean),
        };
      }),
      maps = (fig.dataset.map || "").split("|").map(function (g) {
        return g.trim().split(/\s+/).filter(function (p) {
          return p.indexOf(">") > 0;
        }).map(function (p) {
          return p.split(">");
        });
      }),
      rev = fig.hasAttribute("data-rev"),
      ROW = 30,
      BW = 48,
      GAP = 72,
      TOP = 36,
      rows = Math.max.apply(null, sets.map(function (st) {
        return st.items.length;
      })),
      W = sets.length * BW + (sets.length - 1) * GAP,
      H = TOP + rows * ROW + 8,
      svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img" }),
      pos = {},
      said = [];
    var defs = el("defs", {}, svg);
    ["ink", "hot"].forEach(function (k) {
      var m = el("marker", { id: "amap-" + fi + "-" + k, viewBox: "0 0 8 8", refX: "7", refY: "4", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0 0 8 4 0 8z", class: "mk-" + k }, m);
    });
    sets.forEach(function (st, si) {
      var x0 = si * (BW + GAP),
        hits = {},
        outs = {};
      if (si > 0 && maps[si - 1]) maps[si - 1].forEach(function (p) { hits[p[1]] = (hits[p[1]] || 0) + 1; });
      if (maps[si]) maps[si].forEach(function (p) { outs[p[0]] = (outs[p[0]] || 0) + 1; });
      el("rect", { x: x0, y: TOP - 14, width: BW, height: st.items.length * ROW + 4, class: "set" }, svg);
      el("text", { x: x0 + BW / 2, y: TOP - 20, class: "set-name" }, svg).textContent = st.name;
      st.items.forEach(function (it, r) {
        var y = TOP + r * ROW + 6,
          cls = "item";
        if (si > 0 && !hits[it]) cls += " off";
        else if (hits[it] > 1 || (si === 0 && maps[0] && outs[it] !== 1)) cls += " hot";
        pos[si + "|" + it] = { l: x0, r: x0 + BW, y: y - 4, hot: hits[it] > 1 };
        el("text", { x: x0 + BW / 2, y: y, class: cls }, svg).textContent = it;
      });
    });
    maps.forEach(function (g, gi) {
      g.forEach(function (p) {
        var a = pos[gi + "|" + p[0]],
          b = pos[gi + 1 + "|" + p[1]];
        if (!a || !b) return;
        var hot = b.hot,
          x1 = a.r + 4,
          x2 = b.l - 4,
          y1 = a.y,
          y2 = b.y;
        if (rev) {
          var t = x1; x1 = x2; x2 = t;
          t = y1; y1 = y2; y2 = t;
        }
        el("line", { x1: x1, y1: y1, x2: x2, y2: y2, class: hot ? "arrow hot" : "arrow", "marker-end": "url(#amap-" + fi + "-" + (hot ? "hot" : "ink") + ")" }, svg);
        said.push(rev ? p[1] + " to " + p[0] : p[0] + " to " + p[1]);
      });
    });
    svg.setAttribute("aria-label", sets.map(function (st) { return st.name; }).join(", ") + ": " + said.join(", "));
    fig.insertBefore(svg, fig.firstChild);
  });

  // Picture diagrams (figure.viz, data-kind = venn | numline | bits | circle | field | ladder), drawn from data so the
  // page and the PDF (tools/guide-to-tex.py, same coordinates) show the same picture. Shaded or thick parts use the
  // action colour; the caption says what to look at. Each kind's attributes are described in docs/GUIDE-STANDARD.md.
  function txt(svg, x, y, s, cls, anchor) {
    var t = el("text", { x: x, y: y, class: cls || "vz-text", "text-anchor": anchor || "middle" }, svg);
    t.textContent = s;
    return t;
  }
  function head(svg, id, x1, y1, x2, y2, cls) {
    // a filled triangle at (x2, y2) pointing along the segment
    var a = Math.atan2(y2 - y1, x2 - x1),
      L = 8,
      W = 4,
      p = [x2, y2, x2 - L * Math.cos(a) + W * Math.sin(a), y2 - L * Math.sin(a) - W * Math.cos(a), x2 - L * Math.cos(a) - W * Math.sin(a), y2 - L * Math.sin(a) + W * Math.cos(a)];
    el("path", { d: "M" + p[0] + " " + p[1] + "L" + p[2] + " " + p[3] + "L" + p[4] + " " + p[5] + "z", class: cls || "vz-head" }, svg);
  }
  function arrow(svg, x1, y1, x2, y2, cls) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, class: cls || "vz-line" }, svg);
    head(svg, null, x1, y1, x2, y2, cls === "vz-seg" ? "vz-head hot" : "vz-head");
  }
  // Dipole field lines: start 12 lines on a small circle round +q and step along E (unit steps of 3) until they reach
  // −q or leave the frame. tools/guide-to-tex.py traces the same lines with the same numbers.
  function DIPOLE_LINES(A, B) {
    var out = [];
    for (var k = 0; k < 12; k++) {
      var t = (k * Math.PI * 2) / 12 + Math.PI / 12, x = A[0] + 14 * Math.cos(t), y = A[1] + 14 * Math.sin(t), pts = [[x, y]];
      for (var n = 0; n < 220; n++) {
        var ax = x - A[0], ay = y - A[1], bx = x - B[0], by = y - B[1], ra = Math.pow(ax * ax + ay * ay, 1.5), rb = Math.pow(bx * bx + by * by, 1.5),
          ex = ax / ra - bx / rb, ey = ay / ra - by / rb, L = Math.sqrt(ex * ex + ey * ey);
        x += (3 * ex) / L;
        y += (3 * ey) / L;
        pts.push([x, y]);
        if (Math.hypot(x - B[0], y - B[1]) < 13 || x < 4 || x > 256 || y < 4 || y > 176) break;
      }
      out.push(pts);
    }
    return out;
  }
  var VIZ = {
    plot: function (svg, d) {
      // axes from data ranges; lines as data points; an optional shaded polygon and labelled marks
      var xr = (d.xr || "0 1").split(" ").map(Number), yr = (d.yr || "0 1").split(" ").map(Number),
        X0 = 40, X1 = 244, Y0 = 146, Y1 = 18,
        X = function (v) { return X0 + ((v - xr[0]) / (xr[1] - xr[0])) * (X1 - X0); },
        Y = function (v) { return Y0 - ((v - yr[0]) / (yr[1] - yr[0])) * (Y0 - Y1); },
        pts = function (s) { return s.trim().split(" ").map(function (p) { var q = p.split(","); return X(+q[0]).toFixed(1) + "," + Y(+q[1]).toFixed(1); }).join(" "); };
      if (d.shade) el("polygon", { points: pts(d.shade), class: "vz-fill" }, svg);
      // axes through the origin when 0 is in range, else along the low edges
      var ax = xr[0] < 0 && xr[1] > 0 ? X(0) : X0, ay = yr[0] < 0 && yr[1] > 0 ? Y(0) : Y0;
      arrow(svg, X0, ay, X1 + 10, ay);
      arrow(svg, ax, Y0, ax, Y1 - 8);
      (d.lines || "").split(";").forEach(function (l, i) {
        if (!l.trim()) return; // an empty slot keeps the next line's style (blue, black, dashed by position)
        el("polyline", { points: pts(l), class: i === 0 ? "vz-seg thin" : i === 1 ? "vz-line thick" : "vz-dash" }, svg);
      });
      (d.marks || "").split(";").filter(Boolean).forEach(function (m) {
        var q = m.split(":"), xy = q[0].split(",");
        txt(svg, X(+xy[0]) + 6, Y(+xy[1]) - 6, q[1], "vz-small vz-acc", "start");
      });
      txt(svg, X1 + 8, ay + 18, d.xlabel || "x", "vz-small vz-it", "end");
      txt(svg, ax - 8, Y1 - 2, d.ylabel != null ? d.ylabel : "y", "vz-small vz-it", "end");
      (d.xticks || "").split(" ").filter(Boolean).forEach(function (t) {
        var q = t.split(":");
        el("line", { x1: X(+q[0]), y1: ay - 4, x2: X(+q[0]), y2: ay + 4, class: "vz-line" }, svg);
        txt(svg, X(+q[0]), ay + 18, q[1] || q[0], "vz-small");
      });
      return [262, 170];
    },
    venn: function (svg, d, id) {
      var A = [78, 68], B = [122, 68], R = 44, shade = d.shade || "inter";
      var defs = el("defs", {}, svg),
        clip = el("clipPath", { id: id + "-a" }, defs);
      el("circle", { cx: A[0], cy: A[1], r: R }, clip);
      if (shade === "comp") {
        el("rect", { x: 4, y: 4, width: 192, height: 122, class: "vz-fill" }, svg);
        el("circle", { cx: A[0], cy: A[1], r: R, class: "vz-bg" }, svg);
      }
      if (shade === "union" || shade === "a" || shade === "diff") el("circle", { cx: A[0], cy: A[1], r: R, class: "vz-fill" }, svg);
      if (shade === "union" || shade === "b") el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-fill" }, svg);
      if (shade === "diff") el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-bg" }, svg);
      if (shade === "inter") {
        var g = el("g", { "clip-path": "url(#" + id + "-a)" }, svg);
        el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-fill" }, g);
      }
      // nor: outside both; nand: all but the overlap; imp: all but A \ B (where A ⇒ B is false)
      if (shade === "nor" || shade === "nand" || shade === "imp") el("rect", { x: 4, y: 4, width: 192, height: 122, class: "vz-fill" }, svg);
      if (shade === "nor") {
        el("circle", { cx: A[0], cy: A[1], r: R, class: "vz-bg" }, svg);
        el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-bg" }, svg);
      }
      if (shade === "nand") {
        var g2 = el("g", { "clip-path": "url(#" + id + "-a)" }, svg);
        el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-bg" }, g2);
      }
      if (shade === "imp") {
        el("circle", { cx: A[0], cy: A[1], r: R, class: "vz-bg" }, svg);
        el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-fill" }, svg);
      }
      el("rect", { x: 4, y: 4, width: 192, height: 122, class: "vz-line" }, svg);
      el("circle", { cx: A[0], cy: A[1], r: R, class: "vz-line" }, svg);
      el("circle", { cx: B[0], cy: B[1], r: R, class: "vz-line" }, svg);
      var L = (d.labels || "A B X").split(" ");
      txt(svg, 28, 32, L[0], "vz-text vz-it");
      txt(svg, 172, 32, L[1], "vz-text vz-it");
      if (L[2]) txt(svg, 12, 118, L[2], "vz-small vz-it", "start");
      return [200, 130];
    },
    numline: function (svg, d) {
      var r = d.range.split(" ").map(Number), lo = r[0], hi = r[1], X0 = 24, X1 = 256, Y = 34;
      var x = function (v) { return X0 + ((v - lo) / (hi - lo)) * (X1 - X0); };
      arrow(svg, X0 - 14, Y, X1 + 16, Y);
      (d.ticks || "").split(" ").filter(Boolean).forEach(function (t) {
        var bits = t.split(":"), v = Number(bits[0]);
        el("line", { x1: x(v), y1: Y - 5, x2: x(v), y2: Y + 5, class: "vz-line" }, svg);
        txt(svg, x(v), Y + 22, bits[1] || bits[0], "vz-small");
      });
      if (d.seg) {
        var g = d.seg.split(" "), a = g[0] === "-inf" ? X0 - 12 : x(Number(g[0])), b = g[1] === "inf" ? X1 + 12 : x(Number(g[1]));
        el("line", { x1: a, y1: Y, x2: b, y2: Y, class: "vz-seg" }, svg);
        [[g[0], a, g[2][0]], [g[1], b, g[2][1]]].forEach(function (e) {
          if (/inf/.test(e[0])) return;
          el("circle", { cx: e[1], cy: Y, r: 5, class: e[2] === "c" ? "vz-dot" : "vz-dot open" }, svg);
        });
      }
      (d.marks || "").split(";").filter(Boolean).forEach(function (m) {
        var bits = m.split(":");
        txt(svg, x(Number(bits[0])), Y - 12, bits[1], "vz-small vz-acc");
      });
      return [280, 66];
    },
    bits: function (svg, d) {
      var U = 26, X = 4, cells = d.cells.split(";").map(function (c) { return c.split("|"); });
      cells.forEach(function (c) {
        var w = (Number(c[2]) || 1) * U, hot = c[0].charAt(0) === "*", v = hot ? c[0].slice(1) : c[0];
        if (c[3]) txt(svg, X + w / 2, 14, c[3], "vz-small");
        el("rect", { x: X, y: 20, width: w, height: 30, class: hot ? "vz-cell hot" : "vz-cell" }, svg);
        txt(svg, X + w / 2, 40, v, "vz-text vz-num");
        if (c[1]) txt(svg, X + w / 2, 68, c[1], "vz-small");
        X += w;
      });
      return [X + 4, 76];
    },
    circle: function (svg, d) {
      var a = ((Number(d.angle) || 40) * Math.PI) / 180, R = 62, cx = 84, cy = 84,
        px = cx + R * Math.cos(a), py = cy - R * Math.sin(a), L = (d.labels || "cos φ|sin φ|1").split("|");
      arrow(svg, cx - 76, cy, cx + 82, cy);
      arrow(svg, cx, cy + 74, cx, cy - 80);
      el("circle", { cx: cx, cy: cy, r: R, class: "vz-line" }, svg);
      el("line", { x1: px, y1: py, x2: px, y2: cy, class: "vz-dash" }, svg);
      el("line", { x1: cx, y1: cy, x2: px, y2: cy, class: "vz-seg" }, svg);
      el("line", { x1: cx, y1: cy, x2: px, y2: py, class: "vz-line thick" }, svg);
      el("path", { d: "M" + (cx + 20) + " " + cy + "A20 20 0 0 0 " + (cx + 20 * Math.cos(a)) + " " + (cy - 20 * Math.sin(a)), class: "vz-line" }, svg);
      el("circle", { cx: px, cy: py, r: 4, class: "vz-dot" }, svg);
      txt(svg, cx + 28 * Math.cos(a / 2) + 6, cy - 28 * Math.sin(a / 2) + 4, L[3] || "φ", "vz-small vz-it");
      txt(svg, cx + 4, cy + 18, L[0], "vz-small vz-acc", "start");
      txt(svg, px + 8, (cy + py) / 2 + 4, L[1], "vz-small", "start");
      txt(svg, (cx + px) / 2 - 10, (cy + py) / 2 - 6, L[2], "vz-small vz-it", "end");
      txt(svg, px + 8, py - 6, "P", "vz-text vz-it", "start");
      return [200, 168];
    },
    field: function (svg, d) {
      var sub = d.kind2;
      function charge(x, y, sign) {
        el("circle", { cx: x, cy: y, r: 12, class: "vz-charge" }, svg);
        txt(svg, x, y + 5, sign === "-" ? "−" : "+", "vz-text vz-on");
      }
      if (sub === "pair") {
        // two charges and the force on each: apart for like signs, together for unlike
        var sg = (d.signs || "+ +").split(" "), like = sg[0] === sg[1];
        charge(70, 60, sg[0]);
        charge(170, 60, sg[1]);
        if (like) {
          arrow(svg, 56, 60, 22, 60, "vz-seg");
          arrow(svg, 184, 60, 218, 60, "vz-seg");
        } else {
          arrow(svg, 84, 60, 112, 60, "vz-seg");
          arrow(svg, 156, 60, 128, 60, "vz-seg");
        }
        txt(svg, 120, 104, d.label || (like ? "like charges repel" : "unlike charges attract"), "vz-small");
        return [240, 114];
      }
      if (sub === "vectors") {
        // field vectors from two charges at a point P and their sum
        charge(40, 148, "+");
        charge(200, 148, "+");
        var P = [120, 84];
        el("circle", { cx: P[0], cy: P[1], r: 3.5, class: "vz-dot" }, svg);
        txt(svg, P[0] - 10, P[1] + 4, "P", "vz-text vz-it", "end");
        arrow(svg, P[0], P[1], P[0] + 40, P[1] - 32);
        arrow(svg, P[0], P[1], P[0] - 40, P[1] - 32);
        arrow(svg, P[0], P[1], P[0], P[1] - 52, "vz-seg");
        txt(svg, P[0] + 46, P[1] - 30, "E₁", "vz-small vz-it", "start");
        txt(svg, P[0] - 46, P[1] - 30, "E₂", "vz-small vz-it", "end");
        txt(svg, P[0] + 6, P[1] - 54, "E = E₁ + E₂", "vz-small vz-acc", "start");
        return [240, 168];
      }
      if (sub === "dipole") {
        // field lines traced from the field of +q and −q (same steps as the PDF renderer)
        var A = [80, 90], B = [180, 90];
        DIPOLE_LINES(A, B).forEach(function (pts) {
          el("polyline", { points: pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "), class: "vz-line" }, svg);
          var m = Math.floor(pts.length / 2);
          if (pts.length > 4) head(svg, null, pts[m - 1][0], pts[m - 1][1], pts[m][0], pts[m][1]);
        });
        charge(A[0], A[1], "+");
        charge(B[0], B[1], "-");
        return [260, 180];
      }
      if (sub === "slab") {
        // a dielectric slab between charged plates: fewer E lines inside, aligned dipoles
        el("rect", { x: 84, y: 18, width: 32, height: 94, class: "vz-fill" }, svg);
        el("line", { x1: 46, y1: 18, x2: 46, y2: 112, class: "vz-plate" }, svg);
        el("line", { x1: 154, y1: 18, x2: 154, y2: 112, class: "vz-plate" }, svg);
        txt(svg, 46, 12, "+", "vz-text");
        txt(svg, 154, 12, "−", "vz-text");
        [30, 48, 66, 84, 102].forEach(function (y, k) {
          el("line", { x1: 54, y1: y, x2: 82, y2: y, class: "vz-line" }, svg);
          arrow(svg, 118, y, 146, y);
          if (k % 2 === 0) el("line", { x1: 82, y1: y, x2: 118, y2: y, class: "vz-line" }, svg);
        });
        [38, 74].forEach(function (y) { txt(svg, 100, y + 4, "−+", "vz-small"); });
        txt(svg, 100, 126, d.label || "fewer E lines inside the slab", "vz-small");
        return [200, 134];
      }
      if (d.kind2 === "plates") {
        el("line", { x1: 46, y1: 18, x2: 46, y2: 112, class: "vz-plate" }, svg);
        el("line", { x1: 154, y1: 18, x2: 154, y2: 112, class: "vz-plate" }, svg);
        txt(svg, 46, 12, "+", "vz-text");
        txt(svg, 154, 12, "−", "vz-text");
        [30, 48, 66, 84, 102].forEach(function (y) { arrow(svg, 54, y, 146, y); });
        txt(svg, 100, 126, d.label || "uniform E between the plates", "vz-small");
        return [200, 134];
      }
      var c = 80, neg = d.kind2 === "point-";
      if (d.extra === "equipot") [34, 54].forEach(function (r) { el("circle", { cx: c, cy: c, r: r, class: "vz-dash" }, svg); });
      if (d.extra === "surface") {
        el("circle", { cx: c, cy: c, r: 46, class: "vz-dash thick" }, svg);
        txt(svg, c + 36, c - 40, "A", "vz-small vz-it vz-acc", "start");
      }
      for (var k = 0; k < 8; k++) {
        var t = (k * Math.PI) / 4, x1 = c + 20 * Math.cos(t), y1 = c - 20 * Math.sin(t), x2 = c + 66 * Math.cos(t), y2 = c - 66 * Math.sin(t);
        if (neg) arrow(svg, x2, y2, x1, y1); else arrow(svg, x1, y1, x2, y2);
      }
      el("circle", { cx: c, cy: c, r: 13, class: "vz-charge" }, svg);
      txt(svg, c, c + 5, neg ? "−" : "+", "vz-text vz-on");
      return [160, 160];
    },
    nest: function (svg, d) {
      // nested sets, innermost first: "ℕ: 2|ℤ: −3|…"; each ring shows its name and one example that first appears there
      var R = d.rings.split("|").map(function (r) { return r.split(":").map(function (x) { return x.trim(); }); });
      for (var i = R.length - 1; i >= 0; i--) {
        var w = 84 + i * 60, h = 44 + i * 40, x = 136 - w / 2, y = 94 - h / 2;
        el("rect", { x: x, y: y, width: w, height: h, class: i === 0 ? "vz-cell hot" : "vz-cell" }, svg);
        txt(svg, x + 8, y + 16, R[i][0], "vz-text", "start");
        txt(svg, x + w - 8, y + 16, R[i][1] || "", "vz-small vz-acc", "end");
      }
      return [272, 190];
    },
    flow: function (svg, d) {
      // boxes in a row with arrows; "line one / line two" breaks a box label
      var S = d.steps.split("|"), n = S.length, BW = 108, G = 24, X = 4;
      S.forEach(function (st, i) {
        var lines = st.split(" / ");
        el("rect", { x: X, y: 10, width: BW, height: 56, class: i === n - 1 ? "vz-cell hot" : "vz-cell" }, svg);
        lines.forEach(function (l, k) { txt(svg, X + BW / 2, 34 + (k - (lines.length - 1) / 2) * 16, l, k === 0 ? "vz-text" : "vz-small"); });
        if (i < n - 1) arrow(svg, X + BW + 2, 38, X + BW + G - 2, 38);
        X += BW + G;
      });
      return [X - G + 4, 76];
    },
    pascal: function (svg, d) {
      // rows 0..n of Pascal's triangle; data-sum="r:k" marks entries k and k+1 of row r and their sum below
      var n = +d.rows || 5, sum = (d.sum || "").split(":"), sr = +sum[0], sk = +sum[1], C = [[1]];
      for (var r = 1; r <= n; r++) { var row = [1]; for (var k = 1; k < r; k++) row.push(C[r - 1][k - 1] + C[r - 1][k]); row.push(1); C.push(row); }
      C.forEach(function (row, r) {
        row.forEach(function (v, k) {
          var x = 130 + (k - r / 2) * 34, y = 20 + r * 24, hot = d.sum && ((r === sr && (k === sk || k === sk + 1)) || (r === sr + 1 && k === sk + 1));
          if (hot) el("circle", { cx: x, cy: y - 5, r: 11, class: "vz-fill" }, svg);
          txt(svg, x, y, String(v), hot ? "vz-text vz-acc" : "vz-text");
        });
      });
      return [260, 20 + n * 24 + 14];
    },
    ladder: function (svg, d) {
      // labels above and below the stack, the arrow on the right, so nothing overlaps the level boxes
      var L = d.levels.split(";"), n = L.length, H = 30, top = 24;
      txt(svg, 130, 14, d.top || "faster", "vz-small");
      L.forEach(function (name, i) {
        var w = 90 + (i * 120) / Math.max(1, n - 1), x = 130 - w / 2;
        el("rect", { x: x, y: top + i * (H + 6), width: w, height: H, class: "vz-cell" }, svg);
        txt(svg, 130, top + i * (H + 6) + 20, name, "vz-text");
      });
      var bottom = top + n * (H + 6) - 6;
      arrow(svg, 252, bottom, 252, top);
      txt(svg, 130, bottom + 18, d.bottom || "larger", "vz-small");
      return [262, bottom + 26];
    },
  };
  document.querySelectorAll("figure.viz").forEach(function (fig, fi) {
    var d = Object.assign({}, fig.dataset), kind = d.kind.split(" ")[0];
    d.kind2 = d.kind.split(" ")[1];
    if (!VIZ[kind]) return;
    var svg = el("svg", { role: "img" }),
      wh = VIZ[kind](svg, d, "vz" + fi);
    svg.setAttribute("viewBox", "0 0 " + wh[0] + " " + wh[1]);
    svg.setAttribute("width", wh[0]);
    svg.setAttribute("height", wh[1]);
    var cap = fig.querySelector("figcaption");
    svg.setAttribute("aria-label", cap ? cap.textContent : kind);
    fig.insertBefore(svg, fig.firstChild);
  });
})();
