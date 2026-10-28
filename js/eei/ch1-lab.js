/* EEI Chapter 1 lab experiments. Needs js/eei/ch1-physics.js (EEI1) and js/lab.js (Lab). */
(function () {
  var P = window.EEI1,
    nC = 1e-9,
    SVGNS = "http://www.w3.org/2000/svg";

  function css(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- Field playground: point charges, field, potential and work ---------- */
  function fieldPlayground(root) {
    var stage = root.querySelector(".stage"),
      canvas = stage.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      over = stage.querySelector("svg"),
      form = root.querySelector(".controls"),
      out = {},
      // The visible world is at least 40 cm × 27 cm; a wider or taller stage shows more of it (set in resize).
      W = 0.4,
      Hw = 0.27,
      drag = null,
      st = {
        charges: [],
        probe: null, // { x, y, q }
        show: { lines: true, vectors: false, equi: true, parts: false },
        trail: [],
        ghost: null, // world x of the student's prediction
        marker: null, // world x of the true answer
        workFrom: null,
        locked: true,
      },
      size = { w: 0, h: 0, s: 1 },
      queued = false;

    root.querySelectorAll("[data-out]").forEach(function (n) {
      out[n.dataset.out] = n;
    });

    function toPx(x, y) {
      return [(x + W / 2) * size.s, (Hw / 2 - y) * size.s];
    }
    function toWorld(px, py) {
      return [px / size.s - W / 2, Hw / 2 - py / size.s];
    }
    function resize() {
      var r = stage.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      size.w = r.width;
      size.h = r.height;
      size.s = Math.min(r.width / 0.4, r.height / 0.27);
      W = r.width / size.s;
      Hw = r.height / size.s;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      over.setAttribute("viewBox", "0 0 " + r.width + " " + r.height);
      draw();
    }
    function draw() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    }

    function paint() {
      queued = false;
      var w = size.w,
        hgt = size.h,
        ink = css("--ink"),
        muted = css("--muted"),
        line = css("--line");
      ctx.clearRect(0, 0, w, hgt);
      ctx.fillStyle = css("--paper");
      ctx.fillRect(0, 0, w, hgt);
      // 5 cm grid, so distances can be read off
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var gx = -Math.floor(W / 2 / 0.05) * 0.05; gx <= W / 2; gx += 0.05) {
        var p = toPx(gx, 0)[0];
        ctx.moveTo(Math.round(p) + 0.5, 0);
        ctx.lineTo(Math.round(p) + 0.5, hgt);
      }
      for (var gy = -Math.floor(Hw / 2 / 0.05) * 0.05; gy <= Hw / 2; gy += 0.05) {
        var q = toPx(0, gy)[1];
        ctx.moveTo(0, Math.round(q) + 0.5);
        ctx.lineTo(w, Math.round(q) + 0.5);
      }
      ctx.stroke();
      if (!st.charges.length) return handles();
      if (st.show.equi) equipotentials(css("--eei-3") || css("--fau-mark"));
      if (st.show.lines) fieldLines(muted);
      if (st.show.vectors) vectors(ink);
      if (st.trail.length > 1) {
        ctx.strokeStyle = css("--act");
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        st.trail.forEach(function (pt, i) {
          var p = toPx(pt[0], pt[1]);
          if (i) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
        });
        ctx.stroke();
      }
      if (st.paths) {
        st.paths.forEach(function (pth, k) {
          ctx.strokeStyle = k ? css("--fau-mark") : css("--act");
          ctx.lineWidth = 2.5;
          ctx.setLineDash(k ? [6, 4] : []);
          ctx.beginPath();
          pth.pts.forEach(function (pt, i) {
            var p = toPx(pt[0], pt[1]);
            if (i) ctx.lineTo(p[0], p[1]);
            else ctx.moveTo(p[0], p[1]);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        });
        ctx.font = "700 13px " + css("--f-display");
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        st.paths.forEach(function (pth, k) {
          ctx.fillStyle = k ? css("--fau-mark") : css("--act");
          ctx.fillText((k ? "Detour" : "Straight") + ": " + P.fmt(pth.w, "J"), 16, 16 + k * 19);
        });
      }
      if (st.show.parts && st.probe && st.charges.length) partsAtProbe();
      handles();
      readouts();
    }

    // Each charge's field at the probe, chained tip to tail, and the resultant (one log scale for all).
    function partsAtProbe() {
      var pp = toPx(st.probe.x, st.probe.y),
        parts = P.contributions(st.charges, st.probe.x, st.probe.y),
        tot = P.field(st.charges, st.probe.x, st.probe.y),
        big = Math.max.apply(
          null,
          parts.map(function (v) {
            return Math.hypot(v[0], v[1]);
          }).concat([Math.hypot(tot[0], tot[1])])
        ),
        unit = 70 / big; // the longest arrow is 70 px; all share this linear scale
      function vec(x0, y0, v, color, width, dash) {
        var x1 = x0 + v[0] * unit,
          y1 = y0 - v[1] * unit,
          t = Math.atan2(y1 - y0, x1 - x0);
        if (Math.hypot(x1 - x0, y1 - y0) < 4) return [x1, y1];
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        arrowHead(x1, y1, t, 7);
        return [x1, y1];
      }
      // the chain of contributions runs 12 px beside the resultant, so collinear parts stay visible
      var tm = Math.hypot(tot[0], tot[1]) || 1,
        off = [(-tot[1] / tm) * -12, (-tot[0] / tm) * -12],
        tip = [pp[0] + off[0], pp[1] + off[1]];
      parts.forEach(function (v, k) {
        var from = tip;
        tip = vec(tip[0], tip[1], v, css("--muted"), 2, [5, 3]);
        ctx.fillStyle = css("--muted");
        ctx.font = "700 11px " + css("--f-display");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("E" + (k + 1), (from[0] + tip[0]) / 2 + off[0] * 1.1, (from[1] + tip[1]) / 2 + off[1] * 1.1);
      });
      vec(pp[0], pp[1], tot, css("--fau-mark"), 3.2);
    }

    // Equipotential lines by marching squares over a coarse potential grid.
    function equipotentials(color) {
      var cell = 7,
        nx = Math.ceil(size.w / cell) + 1,
        ny = Math.ceil(size.h / cell) + 1,
        g = [];
      for (var j = 0; j < ny; j++) {
        var row = new Float64Array(nx);
        for (var i = 0; i < nx; i++) {
          var wpt = toWorld(i * cell, j * cell);
          row[i] = P.potential(st.charges, wpt[0], wpt[1]);
        }
        g.push(row);
      }
      var levels = [];
      [15, 30, 60, 120, 240, 480].forEach(function (v) {
        levels.push(v, -v);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      levels.forEach(function (L) {
        for (var j = 0; j < ny - 1; j++)
          for (var i = 0; i < nx - 1; i++) {
            var a = g[j][i],
              b = g[j][i + 1],
              c = g[j + 1][i + 1],
              d = g[j + 1][i],
              pts = [];
            if (a > L !== b > L) pts.push([i + (L - a) / (b - a), j]);
            if (b > L !== c > L) pts.push([i + 1, j + (L - b) / (c - b)]);
            if (d > L !== c > L) pts.push([i + (L - d) / (c - d), j + 1]);
            if (a > L !== d > L) pts.push([i, j + (L - a) / (d - a)]);
            for (var k = 0; k + 1 < pts.length; k += 2) {
              ctx.moveTo(pts[k][0] * cell, pts[k][1] * cell);
              ctx.lineTo(pts[k + 1][0] * cell, pts[k + 1][1] * cell);
            }
          }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Field lines: start around the positive charges (or the negatives, traced backwards) and follow E.
    function fieldLines(color) {
      var pos = st.charges.filter(function (c) {
          return c.q > 0;
        }),
        seeds = pos.length ? pos : st.charges,
        dir = pos.length ? 1 : -1,
        r0 = 0.011,
        h = 0.0022;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;
      seeds.forEach(function (c) {
        var n = Math.max(8, Math.min(20, Math.round((Math.abs(c.q) / nC) * 8)));
        for (var k = 0; k < n; k++) {
          var ang = (2 * Math.PI * (k + 0.5)) / n,
            x = c.x + r0 * Math.cos(ang),
            y = c.y + r0 * Math.sin(ang),
            path = [[x, y]];
          for (var s = 0; s < 700; s++) {
            var e1 = P.field(st.charges, x, y),
              m1 = Math.hypot(e1[0], e1[1]);
            if (m1 < 1e-3) break;
            var mx = x + (dir * h * e1[0]) / m1 / 2,
              my = y + (dir * h * e1[1]) / m1 / 2,
              e2 = P.field(st.charges, mx, my),
              m2 = Math.hypot(e2[0], e2[1]);
            if (m2 < 1e-3) break;
            x += (dir * h * e2[0]) / m2;
            y += (dir * h * e2[1]) / m2;
            path.push([x, y]);
            if (Math.abs(x) > W / 2 + 0.02 || Math.abs(y) > Hw / 2 + 0.02) break;
            var hit = st.charges.some(function (o) {
              return o !== c && Math.hypot(x - o.x, y - o.y) < r0;
            });
            if (hit) break;
          }
          ctx.beginPath();
          path.forEach(function (pt, i) {
            var p = toPx(pt[0], pt[1]);
            if (i) ctx.lineTo(p[0], p[1]);
            else ctx.moveTo(p[0], p[1]);
          });
          ctx.stroke();
          // one arrowhead per line, a third of the way along, in the direction of E
          var m = Math.floor(path.length / 3);
          if (path.length > 12) {
            var a = toPx(path[m][0], path[m][1]),
              b = toPx(path[m + 2][0], path[m + 2][1]),
              t = Math.atan2(b[1] - a[1], b[0] - a[0]) + (dir < 0 ? Math.PI : 0);
            arrowHead(a[0], a[1], t, 6);
          }
        }
      });
    }
    function arrowHead(x, y, t, len) {
      ctx.beginPath();
      ctx.moveTo(x + len * Math.cos(t), y + len * Math.sin(t));
      ctx.lineTo(x + len * Math.cos(t + 2.5), y + len * Math.sin(t + 2.5));
      ctx.lineTo(x + len * Math.cos(t - 2.5), y + len * Math.sin(t - 2.5));
      ctx.closePath();
      ctx.fill();
    }
    // Field vectors on a grid: direction of E, opacity grows with |E| (log scale).
    function vectors(color) {
      var gap = 34;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.4;
      for (var py = gap / 2; py < size.h; py += gap)
        for (var px = gap / 2; px < size.w; px += gap) {
          var wpt = toWorld(px, py),
            e = P.field(st.charges, wpt[0], wpt[1]),
            m = Math.hypot(e[0], e[1]);
          if (m < 1) continue;
          var t = Math.atan2(-e[1], e[0]),
            len = 11;
          ctx.globalAlpha = Math.max(0.15, Math.min(1, Math.log10(m) / 4.5));
          ctx.beginPath();
          ctx.moveTo(px - len * Math.cos(t), py - len * Math.sin(t));
          ctx.lineTo(px + len * Math.cos(t), py + len * Math.sin(t));
          ctx.stroke();
          arrowHead(px + len * Math.cos(t), py + len * Math.sin(t), t, 5);
        }
      ctx.globalAlpha = 1;
    }

    // Handles: charges and probe as SVG so they can be dragged, focused and moved with the keyboard.
    function handles() {
      while (over.firstChild) over.removeChild(over.firstChild);
      if (st.ghost != null) {
        var g = toPx(st.ghost, 0);
        svg("circle", { class: "ghost", cx: g[0], cy: g[1], r: 9 }, over);
        svg("text", { class: "ghost-label", x: g[0], y: g[1] - 16 }, over).textContent = "your guess";
      }
      if (st.marker != null) {
        var mk = toPx(st.marker, 0);
        svg("path", { class: "truth", d: "M" + (mk[0] - 7) + " " + (mk[1] - 7) + "l14 14m0 -14l-14 14" }, over);
        svg("text", { class: "truth-label", x: mk[0], y: mk[1] + 24 }, over).textContent = "E = 0";
      }
      st.charges.forEach(function (c, i) {
        var p = toPx(c.x, c.y),
          grp = svg("g", { class: "charge " + (c.q > 0 ? "pos" : "neg"), tabindex: st.locked ? -1 : 0, role: "button", "data-idx": i }, over);
        grp.setAttribute("aria-label", (c.q > 0 ? "+" : "−") + Math.abs(c.q / nC) + " nC charge at " + cm(c.x) + ", " + cm(c.y) + ". Drag it or use the arrow keys.");
        svg("circle", { cx: p[0], cy: p[1], r: 13 }, grp);
        svg("text", { x: p[0], y: p[1] + 5 }, grp).textContent = c.q > 0 ? "+" : "−";
        svg("text", { class: "qlabel", x: p[0], y: p[1] - 19 }, grp).textContent = (c.q > 0 ? "+" : "−") + Math.abs(c.q / nC) + " nC";
        grab(grp, c, i);
      });
      if (st.probe) {
        var pp = toPx(st.probe.x, st.probe.y),
          e = P.field(st.charges, st.probe.x, st.probe.y),
          f = [e[0] * st.probe.q, e[1] * st.probe.q],
          fm = Math.hypot(f[0], f[1]),
          pg = svg("g", { class: "probe", tabindex: st.locked ? -1 : 0, role: "button", "data-idx": "probe" }, over);
        pg.setAttribute("aria-label", "Probe charge " + (st.probe.q > 0 ? "+" : "−") + "1 nC. Drag it or use the arrow keys; the panel reads the field, potential, force and work.");
        if (fm > 0) {
          var len = Math.min(70, 14 + 9 * Math.log10(1 + fm / 1e-7)),
            t = Math.atan2(-f[1], f[0]),
            ex = pp[0] + len * Math.cos(t),
            ey = pp[1] + len * Math.sin(t);
          svg("line", { class: "force", x1: pp[0], y1: pp[1], x2: ex, y2: ey }, pg);
          var hx1 = ex - 9 * Math.cos(t - 0.45),
            hy1 = ey - 9 * Math.sin(t - 0.45),
            hx2 = ex - 9 * Math.cos(t + 0.45),
            hy2 = ey - 9 * Math.sin(t + 0.45);
          svg("path", { class: "force-head", d: "M" + ex + " " + ey + "L" + hx1 + " " + hy1 + "L" + hx2 + " " + hy2 + "Z" }, pg);
        }
        svg("circle", { cx: pp[0], cy: pp[1], r: 8 }, pg);
        svg("text", { x: pp[0], y: pp[1] + 4 }, pg).textContent = st.probe.q > 0 ? "+" : "−";
        grab(pg, st.probe, -1);
      }
    }
    function cm(v) {
      return (v * 100).toFixed(1) + " cm";
    }
    function clamp(o) {
      o.x = Math.max(-W / 2 + 0.01, Math.min(W / 2 - 0.01, o.x));
      o.y = Math.max(-Hw / 2 + 0.01, Math.min(Hw / 2 - 0.01, o.y));
    }
    function grab(node, obj, index) {
      node.addEventListener("keydown", function (e) {
        if (st.locked) return;
        var step = e.shiftKey ? 0.02 : 0.005,
          d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
        if (!d) return;
        e.preventDefault();
        if (obj === st.probe && st.workFrom == null) startWork();
        obj.x += d[0];
        obj.y += d[1];
        clamp(obj);
        if (obj === st.probe) st.trail.push([obj.x, obj.y]);
        paint();
        focusAfter(index);
      });
    }
    // Handles are redrawn on every change; keep keyboard focus on the one being moved.
    function focusAfter(index) {
      requestAnimationFrame(function () {
        var n = index < 0 ? over.querySelector(".probe") : over.querySelectorAll(".charge")[index];
        if (n && document.activeElement !== n) n.focus({ preventScroll: true });
      });
    }
    // Dragging, as in the live lab: the stage element owns the pointer and picks the nearest handle
    // within reach. The SVG handles ignore the pointer (they are redrawn every frame and only serve
    // keyboard focus), so nothing the drag depends on is ever replaced mid-gesture.
    var REACH = 30;
    function pointerPx(e) {
      var r = stage.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    function nearest(px) {
      var best = null,
        bestD = REACH;
      st.charges.forEach(function (c, i) {
        var p = toPx(c.x, c.y),
          d = Math.hypot(p[0] - px[0], p[1] - px[1]);
        if (d < bestD) {
          bestD = d;
          best = { obj: c, index: i };
        }
      });
      if (st.probe) {
        var q = toPx(st.probe.x, st.probe.y),
          dq = Math.hypot(q[0] - px[0], q[1] - px[1]);
        if (dq < bestD) best = { obj: st.probe, index: -1 };
      }
      return best;
    }
    stage.addEventListener("pointerdown", function (e) {
      if (st.locked || drag) return;
      var px = pointerPx(e),
        hit = nearest(px);
      if (!hit) return;
      e.preventDefault();
      var w = toWorld(px[0], px[1]);
      try {
        stage.setPointerCapture(e.pointerId);
      } catch (err) {}
      drag = { id: e.pointerId, obj: hit.obj, index: hit.index, dx: hit.obj.x - w[0], dy: hit.obj.y - w[1] };
      stage.classList.add("dragging");
      if (hit.obj === st.probe) startWork();
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag) {
        if (!st.locked && e.pointerType === "mouse") stage.classList.toggle("can-grab", !!nearest(pointerPx(e)));
        return;
      }
      if (e.pointerId !== drag.id) return;
      var w = toWorld.apply(null, pointerPx(e));
      drag.obj.x = w[0] + drag.dx;
      drag.obj.y = w[1] + drag.dy;
      clamp(drag.obj);
      if (drag.obj === st.probe) st.trail.push([drag.obj.x, drag.obj.y]);
      draw();
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      stage.classList.remove("dragging");
      draw();
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("lostpointercapture", endDrag);
    stage.addEventListener("pointerleave", function () {
      stage.classList.remove("can-grab");
    });

    function startWork() {
      st.paths = null;
      st.pathWork = null;
      st.workFrom = P.potential(st.charges, st.probe.x, st.probe.y);
      st.trail = [[st.probe.x, st.probe.y]];
    }

    function readouts() {
      var pr = st.probe;
      if (!pr) {
        ["E", "angle", "phi", "F", "W"].forEach(function (k) {
          if (out[k]) out[k].textContent = "—";
        });
        return;
      }
      var e = P.field(st.charges, pr.x, pr.y),
        m = Math.hypot(e[0], e[1]),
        phi = P.potential(st.charges, pr.x, pr.y);
      out.E.textContent = P.fmt(m, "V/m");
      out.angle.textContent = m > 0 ? Math.round((Math.atan2(e[1], e[0]) * 180) / Math.PI) + "°" : "—";
      out.phi.textContent = P.fmt(phi, "V");
      out.F.textContent = P.fmt(m * Math.abs(pr.q), "N");
      out.W.textContent = st.pathWork != null ? P.fmt(st.pathWork, "J") : st.workFrom == null ? "—" : P.fmt(P.work(pr.q, st.workFrom, phi), "J");
    }

    // Sandbox controls
    function setLayout(name) {
      var L = {
        single: [{ x: 0, y: 0, q: 2 * nC }],
        dipole: [{ x: -0.07, y: 0, q: 1 * nC }, { x: 0.07, y: 0, q: -1 * nC }],
        like: [{ x: -0.07, y: 0, q: 1 * nC }, { x: 0.07, y: 0, q: 1 * nC }],
        unequal: [{ x: -0.15, y: 0, q: 1 * nC }, { x: 0.15, y: 0, q: 2 * nC }],
      }[name];
      st.charges = L.map(function (c) {
        return { x: c.x, y: c.y, q: c.q };
      });
      st.ghost = st.marker = null;
      st.trail = [];
      st.workFrom = null;
      if (!st.probe) st.probe = { x: 0, y: 0.08, q: 1 * nC };
      syncList();
      draw();
    }
    function syncList() {
      var list = form.querySelector(".charge-list");
      list.innerHTML = "";
      st.charges.forEach(function (c, i) {
        var li = document.createElement("li"),
          lab = document.createElement("label"),
          sel = document.createElement("select");
        lab.textContent = "Charge " + (i + 1);
        [-3, -2, -1, 1, 2, 3].forEach(function (v) {
          var o = document.createElement("option");
          o.value = v;
          o.textContent = (v > 0 ? "+" : "−") + Math.abs(v) + " nC";
          if (Math.round(c.q / nC) === v) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener("change", function () {
          c.q = +sel.value * nC;
          draw();
        });
        lab.appendChild(sel);
        li.appendChild(lab);
        var rm = document.createElement("button");
        rm.type = "button";
        rm.className = "btn small";
        rm.textContent = "Remove";
        rm.disabled = st.charges.length < 2;
        rm.addEventListener("click", function () {
          st.charges.splice(i, 1);
          syncList();
          draw();
        });
        li.appendChild(rm);
        list.appendChild(li);
      });
      form.querySelector("[data-act=add]").disabled = st.charges.length >= 4;
    }
    form.querySelectorAll("input[data-show]").forEach(function (box) {
      box.checked = st.show[box.dataset.show];
      box.addEventListener("change", function () {
        st.show[box.dataset.show] = box.checked;
        draw();
      });
    });
    form.querySelector("[data-act=add]").addEventListener("click", function () {
      st.charges.push({ x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.1, q: -1 * nC });
      syncList();
      draw();
    });
    form.querySelectorAll("[data-layout]").forEach(function (b) {
      b.addEventListener("click", function () {
        setLayout(b.dataset.layout);
      });
    });
    form.querySelector("[data-probe]").addEventListener("change", function (e) {
      if (st.probe) st.probe.q = +e.target.value * nC;
      st.workFrom = null;
      draw();
    });

    new ResizeObserver(resize).observe(stage);

    // Challenges: each sets the stage, previews the guess, then plays the true result.
    function line(x0, x1, y) {
      return function (t) {
        st.probe.x = x0 + (x1 - x0) * t;
        st.probe.y = y || 0;
        st.trail.push([st.probe.x, st.probe.y]);
        paint();
      };
    }
    var GUESS = { left: -0.075, mid: 0, right: 0.075 };
    Lab.experiment({
      id: "field",
      title: "1.2–1.9 Point charges",
      card: root.querySelector(".challenge"),
      lock: function (on) {
        st.locked = on;
        form.querySelectorAll("button, select, input").forEach(function (n) {
          n.disabled = on;
        });
        stage.classList.toggle("locked", on);
        if (!on) {
          syncList();
          form.querySelectorAll("input[data-show]").forEach(function (box) {
            box.checked = st.show[box.dataset.show];
          });
          var pq = form.querySelector("[data-probe]");
          if (pq && st.probe) pq.value = String(Math.round(st.probe.q / nC));
        }
        draw();
      },
      setup: function (c) {
        st.paths = null;
        st.pathWork = null;
        c.stage();
        st.ghost = st.marker = null;
        st.trail = [];
        st.workFrom = null;
        draw();
      },
      sandbox: function () {
        st.ghost = st.marker = null;
        if (!st.probe) st.probe = { x: 0, y: 0.08, q: 1 * nC };
        draw();
      },
      challenges: [
        {
          id: "null",
          short: "where the field of +Q and +2Q cancels",
          ref: "1.4",
          prompt: "A +1 nC and a +2 nC charge sit 30 cm apart. Where on the line between them is the field zero?",
          options: [
            ["left", "Closer to the +1 nC charge"],
            ["mid", "Exactly halfway"],
            ["right", "Closer to the +2 nC charge"],
            ["none", "Nowhere between them"],
          ],
          answer: "left",
          stage: function () {
            st.charges = [
              { x: -0.15, y: 0, q: 1 * nC },
              { x: 0.15, y: 0, q: 2 * nC },
            ];
            st.probe = null;
            st.show = { lines: true, vectors: false, equi: false };
          },
          preview: function (choice) {
            st.ghost = choice in GUESS ? GUESS[choice] : null;
            draw();
          },
          reveal: function () {
            var x = -0.15 + P.nullPoint(1, 2, 0.3);
            st.probe = { x: -0.13, y: 0, q: 1 * nC };
            st.trail = [];
            return Lab.tween(1400, line(-0.13, x)).then(function () {
              // the probe has stopped where its force vanished; leave the cross beside the guess
              st.marker = x;
              st.probe = null;
              st.trail = [];
              paint();
            });
          },
          why: "The fields cancel where kQ/x² = k(2Q)/(0.30 m − x)², so x = 0.30 m/(1 + √2) ≈ 12.4 cm from the smaller charge. To match the stronger charge, you have to stand closer to the weaker one. Watch the force arrow shrink to nothing at the cross.",
        },
        {
          id: "dipole",
          short: "the field midway between + and −",
          ref: "1.4",
          prompt: "A +1 nC and a −1 nC charge sit 14 cm apart. Which way does the field point exactly halfway between them?",
          options: [
            ["plus", "Toward the + charge"],
            ["minus", "Toward the − charge"],
            ["zero", "Nowhere: it is zero there"],
          ],
          answer: "minus",
          stage: function () {
            st.charges = [
              { x: -0.07, y: 0, q: 1 * nC },
              { x: 0.07, y: 0, q: -1 * nC },
            ];
            st.probe = { x: 0, y: 0.09, q: 1 * nC };
            st.show = { lines: true, vectors: false, equi: false, parts: true };
          },
          preview: function (choice) {
            st.ghost = choice === "plus" ? -0.035 : choice === "minus" ? 0.035 : 0;
            draw();
          },
          reveal: function () {
            st.ghost = null;
            return Lab.tween(1400, function (t) {
              st.probe.y = 0.09 * (1 - t);
              st.trail.push([st.probe.x, st.probe.y]);
              paint();
            });
          },
          why: "Halfway, the + charge pushes a positive probe away (to the right) and the − charge pulls it in (also to the right). The two fields point the same way, so they add: E = 2·kQ/r<sup>2</sup> ≈ 3.67 kV/m toward the − charge. Fields cancel only between charges of the same sign.",
        },
        {
          id: "two-paths",
          short: "work along two routes between the same points",
          ref: "1.8",
          prompt: "You carry a +1 nC probe from 20 cm above a +2 nC charge to 10 cm to its right: once along the straight line, once straight down to 10 cm and then around the dashed circle. Which route costs more work?",
          options: [
            ["straight", "The straight route"],
            ["detour", "The longer detour"],
            ["same", "Both the same"],
          ],
          answer: "same",
          stage: function () {
            st.charges = [{ x: 0, y: 0, q: 2 * nC }];
            st.probe = { x: 0, y: 0.2, q: 1 * nC };
            st.show = { lines: true, vectors: false, equi: true, parts: false };
          },
          reveal: function () {
            // Each route is integrated step by step (−q E·ds), so the readout climbs as the probe moves.
            var routes = [
              function (t) {
                return [0.1 * t, 0.2 - 0.2 * t];
              },
              function (t) {
                return t < 0.5 ? [0, 0.2 - 0.2 * t] : [0.1 * Math.sin((t - 0.5) * Math.PI), 0.1 * Math.cos((t - 0.5) * Math.PI)];
              },
            ];
            st.paths = [];
            function run(k) {
              var route = routes[k],
                done = { pts: [route(0)], w: 0 };
              st.paths.push(done);
              st.trail = [];
              return Lab.tween(1700, function (t) {
                var a = done.pts[done.pts.length - 1],
                  b = route(t),
                  e = P.field(st.charges, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
                done.w -= st.probe.q * (e[0] * (b[0] - a[0]) + e[1] * (b[1] - a[1]));
                done.pts.push(b);
                st.probe.x = b[0];
                st.probe.y = b[1];
                st.pathWork = done.w;
                paint();
              }).then(function () {
                // exact value at the end, so reduced motion (one step) shows the same number
                done.w = P.lineWork(st.charges, st.probe.q, route);
                st.pathWork = done.w;
                paint();
              });
            }
            return run(0).then(function () {
              st.probe.x = 0;
              st.probe.y = 0.2;
              return run(1);
            });
          },
          why: "Both routes cost W<sub>e</sub> = Q(φ<sub>end</sub> − φ<sub>start</sub>) = (1 nC)(179.8 V − 89.9 V) ≈ +89.9 nJ. On the detour the radial leg costs all of it and the arc along the equipotential costs nothing. The field is conservative, so only the end points count.",
        },
        {
          id: "sign",
          short: "the sign of the work for opposite charges",
          ref: "1.8",
          prompt: "Now the probe is −1 nC. You pull it straight out from 10 cm to 20 cm away from the +2 nC charge. What is the sign of the work you supply?",
          options: [
            ["pos", "Positive"],
            ["zero", "Zero"],
            ["neg", "Negative"],
          ],
          answer: "pos",
          stage: function () {
            st.charges = [{ x: 0, y: 0, q: 2 * nC }];
            st.probe = { x: 0.1, y: 0, q: -1 * nC };
            st.show = { lines: true, vectors: false, equi: true };
          },
          reveal: function () {
            startWork();
            return Lab.tween(1600, line(0.1, 0.2));
          },
          why: "Opposite charges attract, so pulling them apart costs energy: W<sub>e</sub> = Q(φ<sub>end</sub> − φ<sub>start</sub>) = (−1 nC)(89.9 V − 179.8 V) ≈ +89.9 nJ. The work readout climbs as you watch.",
        },
      ],
    });
  }

  /* ---------- Capacitor bench: gap, slab, battery, and what U, Q and W do ---------- */
  function capacitorBench(root) {
    var stage = root.querySelector(".stage"),
      canvas = stage.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      form = root.querySelector(".controls"),
      out = {},
      mm = 1e-3,
      st = {
        p: { A: 0.01, d: 4 * mm, slab: "none", t: 2 * mm, er: 4 },
        mode: "connected",
        U: 100,
        Q: 0,
        scale: { U: 220, Q: 5e-9, W: 250e-9 },
        before: null, // gauge values before the reveal
        guess: null, // { key, dir }
        mark: null, // { key, value, label } an extra reading kept on a gauge
        locked: true,
      },
      size = { w: 0, h: 0 },
      queued = false,
      GAUGES = [
        ["U", "Voltage U", "V"],
        ["Q", "Charge Q", "C"],
        ["W", "Stored energy W", "J"],
      ],
      E_REF = 25e3; // field of the starting capacitor (100 V across 4 mm), drawn as 9 lines

    root.querySelectorAll("[data-out]").forEach(function (n) {
      out[n.dataset.out] = n;
    });
    function now() {
      return P.bench(st.p, st.mode, st.mode === "connected" ? st.U : st.Q);
    }
    function charged() {
      // the starting capacitor at 100 V: its charge is what a disconnected challenge holds
      return P.bench({ A: 0.01, d: 4 * mm, slab: "none", t: 0, er: 1 }, "connected", 100).Q;
    }
    function rescale() {
      var s = now();
      st.scale = { U: nice(s.U * 2.2), Q: nice(s.Q * 2.2), W: nice(s.W * 2.2) };
    }
    function nice(v) {
      var e = Math.pow(10, Math.floor(Math.log10(v))),
        m = v / e;
      return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e;
    }
    function resize() {
      var r = stage.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      size.w = r.width;
      size.h = r.height;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    }

    function paint() {
      queued = false;
      var w = size.w,
        h = size.h,
        s = now(),
        ink = css("--ink"),
        muted = css("--muted"),
        fau = css("--fau-mark"),
        course = css("--course"),
        paper = css("--paper"),
        topH = Math.round(h * (w < 480 ? 0.44 : 0.62)),
        small = w < 480;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, h);

      // plates to scale: up to 10 mm of gap spans 62 % of the width; plate height follows √A
      var pxmm = (w * 0.62) / 10,
        gap = (st.p.d / mm) * pxmm,
        cx = w / 2,
        lx = cx - gap / 2,
        rx = cx + gap / 2,
        plateH = Math.max(40, (topH - 100) * Math.sqrt(st.p.A / 0.04)),
        y0 = 30 + (topH - 30 - plateH) / 2,
        y1 = y0 + plateH,
        hasSlab = st.p.slab !== "none" && st.p.t > 0,
        slabW = hasSlab ? (Math.min(st.p.t, st.p.d) / mm) * pxmm : 0,
        sx0 = cx - slabW / 2,
        sx1 = cx + slabW / 2;

      // energy density as a tint of the subject colour
      function tint(x0, x1, wd) {
        if (x1 - x0 < 0.5) return;
        ctx.globalAlpha = Math.max(0.06, Math.min(0.7, 0.12 + (0.35 * wd) / 2.77e-3));
        ctx.fillStyle = course;
        ctx.fillRect(x0, y0, x1 - x0, plateH);
        ctx.globalAlpha = 1;
      }
      tint(lx, hasSlab ? sx0 : rx, s.wair);
      if (hasSlab) {
        tint(sx1, rx, s.wair);
        if (st.p.slab === "metal") {
          ctx.fillStyle = muted;
          ctx.globalAlpha = 0.45;
          ctx.fillRect(sx0, y0 + 6, slabW, plateH - 12);
          ctx.globalAlpha = 1;
        } else {
          tint(sx0, sx1, s.wslab);
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx0 + 0.75, y0 + 6.75, slabW - 1.5, plateH - 13.5);
        }
      }

      // field lines: line density shows E (9 lines at the starting 25 kV/m)
      function lines(x0, x1, E) {
        if (x1 - x0 < 4 || E <= 0) return;
        var n = Math.max(1, Math.min(40, Math.round((E / E_REF) * 9)));
        ctx.strokeStyle = muted;
        ctx.fillStyle = muted;
        ctx.lineWidth = 1.2;
        for (var i = 0; i < n; i++) {
          var y = y0 + ((i + 0.5) * plateH) / n;
          ctx.beginPath();
          ctx.moveTo(x0 + 2, y);
          ctx.lineTo(x1 - 2, y);
          ctx.stroke();
          if (x1 - x0 > 18) {
            var xm = (x0 + x1) / 2 + 3;
            ctx.beginPath();
            ctx.moveTo(xm, y);
            ctx.lineTo(xm - 6, y - 3.5);
            ctx.lineTo(xm - 6, y + 3.5);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      if (hasSlab) {
        lines(lx, sx0, s.Eair);
        lines(sx0, sx1, s.Eslab);
        lines(sx1, rx, s.Eair);
      } else lines(lx, rx, s.Eair);

      // plates with their charge: one sign per share of the starting charge
      ctx.fillStyle = fau;
      ctx.fillRect(lx - 8, y0 - 4, 8, plateH + 8);
      ctx.fillRect(rx, y0 - 4, 8, plateH + 8);
      function signs(x, n, glyph, color, size2) {
        ctx.fillStyle = color;
        ctx.font = "800 " + size2 + "px " + css("--f-display");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (var i = 0; i < n; i++) ctx.fillText(glyph, x, y0 + ((i + 0.5) * plateH) / n);
      }
      var nq = Math.max(1, Math.min(24, Math.round((s.Q / charged()) * 8)));
      signs(lx - 4, nq, "+", css("--on-fau"), 11);
      signs(rx + 4, nq, "−", css("--on-fau"), 11);
      // charges on the slab faces: bound (dielectric) or induced (metal)
      if (hasSlab && slabW > 10) {
        var sigma = st.p.slab === "metal" ? 1 : 1 - 1 / st.p.er,
          ns = Math.round(nq * sigma);
        if (ns > 0) {
          signs(sx0 + 6, ns, "−", ink, 10);
          signs(sx1 - 6, ns, "+", ink, 10);
        }
      }

      // labels
      ctx.fillStyle = ink;
      ctx.font = "700 12px " + css("--f-display");
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("+Q", lx - 4, y0 - 10);
      ctx.fillText("−Q", rx + 4, y0 - 10);
      ctx.textBaseline = "top";
      ctx.fillStyle = muted;
      ctx.font = "600 12px " + css("--f-display");
      ctx.fillText("d = " + (st.p.d / mm).toFixed(1) + " mm", cx, y1 + 6);
      circuit(lx, rx, y1, cx, s.Q, ink, muted);
      if (hasSlab) {
        ctx.fillStyle = ink;
        ctx.fillText(st.p.slab === "metal" ? "metal" : "εr = " + st.p.er.toFixed(1), cx, y0 - 22);
      }
      ctx.textAlign = "left";
      ctx.fillStyle = ink;
      ctx.font = "700 12px " + css("--f-display");
      ctx.fillText(st.mode === "connected" ? "Battery connected · U held at " + st.U.toFixed(0) + " V" : "Disconnected · Q held", 10, 8);

      // gauges: value, the reading before the reveal, and the student's guess
      var gx = small ? 12 : 128,
        gw = w - gx - (small ? 92 : 140),
        rowH = (h - topH - 12) / 3;
      GAUGES.forEach(function (g, i) {
        var key = g[0],
          y = topH + 6 + i * rowH,
          barY = y + rowH * 0.45,
          barH = Math.max(8, Math.min(16, rowH * 0.32)),
          v = s[key],
          frac = Math.max(0, Math.min(1, v / st.scale[key]));
        ctx.fillStyle = ink;
        ctx.font = "700 " + (small ? 11 : 13) + "px " + css("--f-display");
        ctx.textAlign = "left";
        ctx.textBaseline = small ? "bottom" : "middle";
        ctx.fillText(g[1], small ? gx : 12, small ? barY - 3 : barY + barH / 2);
        ctx.strokeStyle = css("--line");
        ctx.lineWidth = 1;
        ctx.strokeRect(gx + 0.5, barY + 0.5, gw - 1, barH - 1);
        ctx.fillStyle = fau;
        ctx.fillRect(gx, barY, gw * frac, barH);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = ink;
        ctx.font = "700 " + (small ? 11 : 13) + "px " + css("--f-display");
        ctx.fillText(P.fmt(v, g[2]) + (v > st.scale[key] ? " ›" : ""), gx + gw + 8, barY + barH / 2);
        function tick(val, label, solid) {
          var x = gx + gw * Math.max(0, Math.min(1, val / st.scale[key]));
          ctx.strokeStyle = solid ? ink : muted;
          ctx.lineWidth = 2;
          ctx.setLineDash(solid ? [] : [3, 2]);
          ctx.beginPath();
          ctx.moveTo(x, barY - 5);
          ctx.lineTo(x, barY + barH + 5);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = muted;
          ctx.font = "600 11px " + css("--f-display");
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, x, barY + barH + 6);
        }
        if (st.before) tick(st.before[key], "before", false);
        if (st.mark && st.mark.key === key) tick(st.mark.value, st.mark.label, true);
        if (st.guess && st.guess.key === key && st.before) {
          var gxx = gx + gw * Math.max(0, Math.min(1, st.before[key] / st.scale[key])),
            word = { up: "guess: larger", down: "guess: smaller", same: "guess: unchanged" }[st.guess.dir];
          ctx.fillStyle = muted;
          ctx.font = "italic 600 11px " + css("--f-display");
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(word, gxx, barY - 6);
        }
      });
      readouts(s);
    }

    // The source under the plates. Connected: battery and closed wires, with charge carriers that run
    // whenever Q changes (into the plates while charging, back to the battery when Q drops). Disconnected: an open wire.
    var flow = { phase: 0, lastQ: null, until: 0 };
    function circuit(lx, rx, y1, cx, Q, ink, muted) {
      var yw = y1 + 28,
        xl = lx - 4,
        xr = rx + 4;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(xl, y1 + 4);
      ctx.lineTo(xl, yw);
      ctx.lineTo(cx - (st.mode === "connected" ? 6 : 22), yw);
      ctx.moveTo(cx + (st.mode === "connected" ? 6 : 22), yw);
      ctx.lineTo(xr, yw);
      ctx.lineTo(xr, y1 + 4);
      ctx.stroke();
      if (st.mode === "connected") {
        // long plate +, short plate −: + feeds the left plate
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 6, yw - 10);
        ctx.lineTo(cx - 6, yw + 10);
        ctx.moveTo(cx + 6, yw - 5);
        ctx.lineTo(cx + 6, yw + 5);
        ctx.stroke();
      } else {
        [cx - 22, cx + 22].forEach(function (x) {
          ctx.beginPath();
          ctx.arc(x, yw, 3, 0, 2 * Math.PI);
          ctx.fillStyle = css("--paper");
          ctx.fill();
          ctx.stroke();
        });
      }
      // moving charge
      var nowT = performance.now();
      if (flow.lastQ != null && Q !== flow.lastQ && st.mode === "connected") {
        flow.phase -= ((Q - flow.lastQ) / charged()) * 160;
        flow.until = nowT + 450;
        setTimeout(draw, 470);
      }
      flow.lastQ = Q;
      if (st.mode !== "connected" || nowT > flow.until) return;
      var legs = [
          [xl, y1 + 4, xl, yw],
          [xl, yw, cx - 6, yw],
          [cx + 6, yw, xr, yw],
          [xr, yw, xr, y1 + 4],
        ],
        total = 0;
      legs.forEach(function (l) {
        l.len = Math.hypot(l[2] - l[0], l[3] - l[1]);
        total += l.len;
      });
      ctx.fillStyle = css("--eei-3");
      for (var d = ((flow.phase % 18) + 18) % 18; d < total; d += 18) {
        var acc = 0;
        for (var k = 0; k < legs.length; k++) {
          var l = legs[k];
          if (d <= acc + l.len) {
            var f = (d - acc) / l.len;
            ctx.beginPath();
            ctx.arc(l[0] + f * (l[2] - l[0]), l[1] + f * (l[3] - l[1]), 2.6, 0, 2 * Math.PI);
            ctx.fill();
            break;
          }
          acc += l.len;
        }
      }
    }

    // "Compare from here": every readout also shows its factor against the stored state.
    function ratio(now_, then) {
      if (!then) return "";
      var r = now_ / then;
      if (!isFinite(r)) return "";
      var known = [[1, "unchanged"], [2, "×2"], [3, "×3"], [4, "×4"], [0.5, "×½"], [1 / 3, "×⅓"], [0.25, "×¼"]];
      for (var k = 0; k < known.length; k++) if (Math.abs(r / known[k][0] - 1) < 0.005) return known[k][1];
      return "×" + (r >= 10 ? r.toFixed(0) : r.toPrecision(3));
    }
    function show(key, v, unit) {
      var r = st.compare ? ratio(v, st.compare[key]) : "";
      out[key].textContent = P.fmt(v, unit) + (r ? "  (" + r + ")" : "");
    }
    function readouts(s) {
      show("C", s.C, "F");
      show("Q", s.Q, "C");
      show("U", s.U, "V");
      show("Eair", s.Eair, "V/m");
      if (st.p.slab === "none") out.Eslab.textContent = "—";
      else show("Eslab", s.Eslab, "V/m");
      show("W", s.W, "J");
    }

    // Controls: sliders in cm², mm and V; the model works in SI units.
    var ctl = {};
    form.querySelectorAll("[data-p]").forEach(function (n) {
      ctl[n.dataset.p] = n;
    });
    function syncControls() {
      ctl.A.value = Math.round(st.p.A * 1e4);
      ctl.d.value = st.p.d / mm;
      ctl.slab.value = st.p.slab;
      ctl.t.max = Math.max(0.5, st.p.d / mm - 0.5);
      ctl.t.value = Math.min(st.p.t / mm, +ctl.t.max);
      ctl.er.value = st.p.er;
      ctl.U.value = st.U;
      form.querySelectorAll("input[name=cap-mode]").forEach(function (r) {
        r.checked = r.value === st.mode;
      });
      ctl.t.disabled = ctl.er.disabled = st.locked || st.p.slab === "none";
      if (st.p.slab === "metal") ctl.er.disabled = true;
      ctl.U.disabled = st.locked || st.mode !== "connected";
      form.querySelectorAll("[data-val]").forEach(function (o) {
        var k = o.dataset.val;
        o.textContent = k === "A" ? ctl.A.value + " cm²" : k === "U" ? ctl.U.value + " V" : k === "er" ? (+ctl.er.value).toFixed(1) : (+ctl[k].value).toFixed(1) + " mm";
      });
    }
    form.addEventListener("input", function (e) {
      var n = e.target,
        k = n.dataset.p;
      if (k === "A") st.p.A = +n.value * 1e-4;
      if (k === "d") {
        st.p.d = +n.value * mm;
        st.p.t = Math.min(st.p.t, st.p.d - 0.5 * mm);
      }
      if (k === "slab") st.p.slab = n.value;
      if (k === "t") st.p.t = +n.value * mm;
      if (k === "er") st.p.er = +n.value;
      if (k === "U") st.U = +n.value;
      if (n.name === "cap-mode") {
        var s = now();
        st.mode = n.value;
        if (st.mode === "isolated") st.Q = s.Q;
        else st.U = Math.max(10, Math.min(200, Math.round(s.U / 10) * 10));
      }
      st.guess = st.mark = null;
      if (!st.compare) st.before = null;
      syncControls();
      grow();
      draw();
    });
    // in the sandbox, widen the gauges when a value outgrows them
    function grow() {
      var s = now();
      ["U", "Q", "W"].forEach(function (k) {
        if (s[k] > st.scale[k]) st.scale[k] = nice(s[k] * 1.4);
      });
    }
    form.querySelector("[data-act=mark]").addEventListener("click", function () {
      var s = now();
      st.compare = { C: s.C, Q: s.Q, U: s.U, Eair: s.Eair, Eslab: s.Eslab, W: s.W };
      st.before = { U: s.U, Q: s.Q, W: s.W };
      draw();
    });
    form.querySelector("[data-act=reset]").addEventListener("click", function () {
      st.compare = null;
      st.p = { A: 0.01, d: 4 * mm, slab: "none", t: 2 * mm, er: 4 };
      st.mode = "connected";
      st.U = 100;
      st.before = st.guess = st.mark = null;
      rescale();
      syncControls();
      draw();
    });

    new ResizeObserver(resize).observe(stage);

    function snapshot() {
      var s = now();
      st.before = { U: s.U, Q: s.Q, W: s.W };
    }
    function startFrom(p, mode) {
      st.p = Object.assign({ A: 0.01, d: 4 * mm, slab: "none", t: 2 * mm, er: 4 }, p);
      st.mode = mode;
      st.U = 100;
      st.Q = charged();
      st.mark = null;
      rescale();
      snapshot();
    }
    var DIRS = [
      ["up", "It gets larger"],
      ["same", "It stays the same"],
      ["down", "It gets smaller"],
    ];
    function guessOn(key) {
      return function (choice) {
        st.guess = { key: key, dir: choice };
        draw();
      };
    }
    Lab.experiment({
      id: "capacitor",
      title: "1.12–1.14 Plate capacitor",
      card: root.querySelector(".challenge"),
      lock: function (on) {
        st.locked = on;
        form.querySelectorAll("button, select, input").forEach(function (n) {
          n.disabled = on;
        });
        syncControls();
        draw();
      },
      setup: function (c) {
        st.guess = null;
        st.compare = null;
        c.stage();
        syncControls();
        draw();
      },
      sandbox: function () {
        st.guess = st.mark = st.before = st.compare = null;
        syncControls();
        draw();
      },
      challenges: [
        {
          id: "gap-isolated",
          short: "the gap doubled with the battery disconnected",
          ref: "1.13",
          prompt: "The capacitor was charged to 100 V and then disconnected. You pull the plates apart to twice the gap. What happens to the voltage U?",
          options: DIRS,
          answer: "up",
          stage: function () {
            startFrom({}, "isolated");
          },
          preview: guessOn("U"),
          reveal: function () {
            return Lab.tween(1600, function (t) {
              st.p.d = (4 + 4 * t) * mm;
              syncControls();
              paint();
            });
          },
          why: "With the battery off, Q cannot change, so D = Q/A and E = D/ε<sub>0</sub> stay the same: the field lines keep their spacing. The same field over twice the distance gives U = E·d = 200 V, while C = ε<sub>0</sub>A/d halves.",
        },
        {
          id: "gap-connected",
          short: "the gap doubled with the battery connected",
          ref: "1.13",
          prompt: "Now the battery stays connected at 100 V. You pull the plates apart to twice the gap again. What happens to the charge Q on the plates?",
          options: DIRS,
          answer: "down",
          stage: function () {
            startFrom({}, "connected");
          },
          preview: guessOn("Q"),
          reveal: function () {
            return Lab.tween(1600, function (t) {
              st.p.d = (4 + 4 * t) * mm;
              syncControls();
              paint();
            });
          },
          why: "The battery holds U at 100 V, but C = ε<sub>0</sub>A/d halves, so Q = CU halves and charge flows back into the battery. The field E = U/d halves too: the lines thin out.",
        },
        {
          id: "slab-order",
          short: "dielectric versus metal slab at fixed charge",
          ref: "1.12",
          prompt: "Battery disconnected again, 4 mm gap. You slide in a 2 mm slab. Which slab lowers the voltage more?",
          options: [
            ["dielectric", "A dielectric with εr = 4"],
            ["metal", "A metal slab"],
            ["same", "Both lower it equally"],
          ],
          answer: "metal",
          stage: function () {
            startFrom({ slab: "dielectric", t: 0 }, "isolated");
          },
          preview: function (choice) {
            st.guess = null;
            draw();
          },
          reveal: function () {
            return Lab.tween(1300, function (t) {
              st.p.t = 2 * mm * t;
              paint();
            })
              .then(function () {
                st.mark = { key: "U", value: now().U, label: "dielectric" };
                st.p.slab = "metal";
                st.p.t = 0;
                return new Promise(function (r) {
                  setTimeout(r, Lab.reduce ? 0 : 450);
                });
              })
              .then(function () {
                return Lab.tween(1300, function (t) {
                  st.p.t = 2 * mm * t;
                  paint();
                });
              })
              .then(syncControls);
          },
          why: "Q is fixed, so D is the same everywhere. Inside the dielectric the field drops to E/ε<sub>r</sub>; inside metal it is zero. Over the same 2 mm, less field means less voltage: 100 V → 62.5 V with the dielectric, 50 V with metal. Empty gap > dielectric > metal.",
        },
        {
          id: "fill-energy",
          short: "the stored energy when a dielectric fills a disconnected capacitor",
          ref: "1.14",
          prompt: "Battery disconnected. A dielectric with εr = 4 fills the whole 4 mm gap. What happens to the stored energy W?",
          options: DIRS,
          answer: "down",
          stage: function () {
            startFrom({ slab: "dielectric", t: 4 * mm, er: 1 }, "isolated");
          },
          preview: guessOn("W"),
          reveal: function () {
            return Lab.tween(1600, function (t) {
              st.p.er = 1 + 3 * t;
              paint();
            }).then(syncControls);
          },
          why: "Q is fixed and C grows four times, so W = Q<sup>2</sup>/(2C) drops to a quarter, from 111 nJ to 27.7 nJ. The field pulled the slab in and did that work. With the battery connected it is the other way round: U stays, Q and W grow four times.",
        },
      ],
    });
  }

  /* ---------- Networks: capacitors in series and in parallel ---------- */
  function networks(root) {
    var stage = root.querySelector(".stage"),
      canvas = stage.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      form = root.querySelector(".controls"),
      out = {},
      uF = 1e-6,
      st = { Cs: [6 * uF, 3 * uF], how: "series", U: 12, k: 1, pick: null, mark: null, locked: true, scale: null },
      size = { w: 0, h: 0 },
      queued = false;
    root.querySelectorAll("[data-out]").forEach(function (n) {
      out[n.dataset.out] = n;
    });
    function now() {
      return P.network(st.Cs, st.how, st.U * st.k);
    }
    function fixScale() {
      var full = P.network(st.Cs, st.how, st.U),
        qmax = Math.max.apply(null, full.parts.map(function (p) { return p.Q; }));
      st.scale = { U: st.U, Q: qmax * 1.25 };
    }
    function resize() {
      var r = stage.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      size.w = r.width;
      size.h = r.height;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    }
    function label(text, x, y, opts) {
      opts = opts || {};
      ctx.fillStyle = opts.color || css("--ink");
      ctx.font = (opts.weight || 700) + " " + (opts.size || 13) + "px " + css("--f-display");
      ctx.textAlign = opts.align || "center";
      ctx.textBaseline = opts.base || "middle";
      ctx.fillText(text, x, y);
    }
    // capacitor symbol centred at (x, y); vertical plates when the wire runs horizontally
    function cap(x, y, horizontalWire, i, n) {
      var ink = css("--ink"),
        g = 7,
        L = 26;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (horizontalWire) {
        ctx.moveTo(x - g, y - L / 2);
        ctx.lineTo(x - g, y + L / 2);
        ctx.moveTo(x + g, y - L / 2);
        ctx.lineTo(x + g, y + L / 2);
      } else {
        ctx.moveTo(x - L / 2, y - g);
        ctx.lineTo(x + L / 2, y - g);
        ctx.moveTo(x - L / 2, y + g);
        ctx.lineTo(x + L / 2, y + g);
      }
      ctx.stroke();
      // charge on the plates: one sign per share of the largest charge in the circuit
      var part = now().parts[i],
        ns = Math.max(0, Math.min(6, Math.round((part.Q / (st.scale.Q / 1.25)) * 5)));
      if (ns) {
        ctx.font = "800 12px " + css("--f-display");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (var si = 0; si < ns; si++) {
          var f = (si + 0.5) / ns - 0.5;
          ctx.fillStyle = css("--fau-mark");
          if (horizontalWire) {
            ctx.fillText("+", x - g - 7, y + f * L);
            ctx.fillText("−", x + g + 7, y + f * L);
          } else {
            ctx.fillText("+", x + f * L, y - g - 7);
            ctx.fillText("−", x + f * L, y + g + 7);
          }
        }
      }
      var picked = st.pick === i,
        txt = "C" + (i + 1) + " · " + Math.round(st.Cs[i] / uF) + " μF";
      if (horizontalWire) label(txt, x, y - L / 2 - 12, { color: picked ? css("--act") : ink });
      else label(txt, x + L / 2 + 8, y, { align: "left", color: picked ? css("--act") : ink });
      if (picked) label("your pick", horizontalWire ? x : x + L / 2 + 8, horizontalWire ? y + L / 2 + 12 : y + 16, { align: horizontalWire ? "center" : "left", weight: 600, size: 11, color: css("--muted") });
    }
    function paint() {
      queued = false;
      var w = size.w,
        h = size.h,
        ink = css("--ink"),
        muted = css("--muted"),
        fau = css("--fau-mark"),
        n = st.Cs.length,
        res = now(),
        topH = Math.round(h * 0.48),
        x0 = Math.max(w < 480 ? 78 : 40, w * 0.12),
        x1 = w - Math.max(40, w * 0.12),
        yT = 44,
        yB = topH - 14;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = css("--paper");
      ctx.fillRect(0, 0, w, h);
      // wires and source
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      var ym = (yT + yB) / 2;
      // Parallel has no closing wire on the right, so centre the source-to-last-branch span.
      if (st.how === "parallel") {
        var sp = (x1 - x0) / (n + 1);
        x0 = (w - n * sp) / 2;
        x1 = x0 + (n + 1) * sp;
      }
      // Series: one closed loop through every capacitor. Parallel: two rails that end at the last
      // capacitor, with no wire of their own between them (that would short the source).
      var xEnd = st.how === "series" ? x1 : x0 + (n * (x1 - x0)) / (n + 1);
      ctx.beginPath();
      ctx.moveTo(x0, ym - 10);
      ctx.lineTo(x0, yT);
      ctx.lineTo(xEnd, yT);
      if (st.how === "series") ctx.lineTo(x1, yB);
      else ctx.moveTo(xEnd, yB);
      ctx.lineTo(x0, yB);
      ctx.lineTo(x0, ym + 10);
      ctx.stroke();
      // junction dots where a parallel branch meets a rail
      if (st.how === "parallel") {
        ctx.fillStyle = ink;
        for (var jd = 1; jd < n; jd++) {
          var jx = x0 + (jd * (x1 - x0)) / (n + 1);
          [yT, yB].forEach(function (yy) {
            ctx.beginPath();
            ctx.arc(jx, yy, 3.5, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      }
      // battery: long plate +, short plate −
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0 - 14, ym - 6);
      ctx.lineTo(x0 + 14, ym - 6);
      ctx.moveTo(x0 - 7, ym + 6);
      ctx.lineTo(x0 + 7, ym + 6);
      ctx.stroke();
      label("U = " + (st.U * st.k).toFixed(1) + " V", x0 - 22, ym, { align: "right", size: 12 });
      if (st.how === "series") {
        for (var i = 0; i < n; i++) {
          var cx = x0 + ((i + 1) * (x1 - x0)) / (n + 1);
          ctx.fillStyle = css("--paper"); // clear the wire between the plates
          ctx.fillRect(cx - 7, yT - 3, 14, 6);
          cap(cx, yT, true, i, n);
        }
      } else {
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        for (var j = 0; j < n; j++) {
          var px = x0 + ((j + 1) * (x1 - x0)) / (n + 1);
          ctx.beginPath();
          ctx.moveTo(px, yT);
          ctx.lineTo(px, ym - 7);
          ctx.moveTo(px, ym + 7);
          ctx.lineTo(px, yB);
          ctx.stroke();
          cap(px, ym, false, j, n);
        }
      }
      label(st.how === "series" ? "In series: the same charge on every capacitor" : "In parallel: the same voltage on every capacitor", w / 2, yB + 16, { weight: 600, size: 12, color: muted });

      // bars: U and Q per capacitor
      var small = w < 480,
        gx = small ? 12 : 110,
        gw = w - gx - (small ? 86 : 120),
        rowH = (h - topH - 10) / (n * 2 + 0.6),
        y = topH + 8;
      res.parts.forEach(function (p, i) {
        [["U", p.U, "V", st.scale.U], ["Q", p.Q, "C", st.scale.Q]].forEach(function (g, k) {
          var by = y + rowH * 0.25,
            bh = Math.max(7, Math.min(14, rowH * 0.5)),
            frac = Math.max(0, Math.min(1, g[1] / g[3]));
          label((k ? "Q" : "U") + (i + 1), small ? gx : 12, small ? by - 2 : by + bh / 2, { align: "left", base: small ? "bottom" : "middle", size: small ? 11 : 13 });
          ctx.strokeStyle = css("--line");
          ctx.lineWidth = 1;
          ctx.strokeRect(gx + 0.5, by + 0.5, gw - 1, bh - 1);
          ctx.fillStyle = k ? css("--course") : fau;
          ctx.fillRect(gx, by, gw * frac, bh);
          if (k) {
            ctx.strokeStyle = ink;
            ctx.strokeRect(gx + 0.5, by + 0.5, Math.max(0, gw * frac - 1), bh - 1);
          }
          label(P.fmt(g[1], g[2]), gx + gw + 8, by + bh / 2, { align: "left", size: small ? 11 : 13 });
          if (st.mark && st.mark.i === i && st.mark.k === k) {
            var mx = gx + gw * Math.max(0, Math.min(1, st.mark.v / g[3]));
            ctx.strokeStyle = muted;
            ctx.setLineDash([3, 2]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mx, by - 4);
            ctx.lineTo(mx, by + bh + 4);
            ctx.stroke();
            ctx.setLineDash([]);
            label("before", mx, by + bh + 5, { base: "top", weight: 600, size: 11, color: muted });
          }
          y += rowH;
        });
        y += (rowH * 0.6) / n;
      });
      out.C.textContent = P.fmt(res.C, "F");
      out.Q.textContent = P.fmt(res.Q, "C");
      out.W.textContent = P.fmt(0.5 * res.C * Math.pow(st.U * st.k, 2), "J");
    }

    // Controls
    var VALUES = [1, 2, 3, 4, 6, 8, 10, 30];
    function syncControls() {
      var list = form.querySelector(".cap-list");
      list.innerHTML = "";
      st.Cs.forEach(function (c, i) {
        var li = document.createElement("li"),
          lab = document.createElement("label"),
          sel = document.createElement("select");
        lab.textContent = "C" + (i + 1);
        VALUES.forEach(function (v) {
          var o = document.createElement("option");
          o.value = v;
          o.textContent = v + " μF";
          if (Math.round(c / uF) === v) o.selected = true;
          sel.appendChild(o);
        });
        sel.disabled = st.locked;
        sel.addEventListener("change", function () {
          st.Cs[i] = +sel.value * uF;
          st.mark = st.pick = null;
          fixScale();
          draw();
        });
        lab.appendChild(sel);
        li.appendChild(lab);
        list.appendChild(li);
      });
      form.querySelectorAll("input[name=net-how]").forEach(function (r) {
        r.checked = r.value === st.how;
        r.disabled = st.locked;
      });
      var cnt = form.querySelector("[data-act=count]");
      cnt.textContent = st.Cs.length === 3 ? "Remove C3" : "Add a third capacitor";
      cnt.disabled = st.locked;
      var u = form.querySelector("[data-p=U]");
      u.value = st.U;
      u.disabled = st.locked;
      form.querySelector("[data-val=U]").textContent = st.U + " V";
    }
    form.addEventListener("change", function (e) {
      if (e.target.name === "net-how") {
        st.how = e.target.value;
        st.mark = st.pick = null;
        fixScale();
        draw();
      }
    });
    form.querySelector("[data-p=U]").addEventListener("input", function (e) {
      st.U = +e.target.value;
      form.querySelector("[data-val=U]").textContent = st.U + " V";
      st.mark = null;
      fixScale();
      draw();
    });
    form.querySelector("[data-act=count]").addEventListener("click", function () {
      if (st.Cs.length === 3) st.Cs.pop();
      else st.Cs.push(2 * uF);
      st.mark = st.pick = null;
      fixScale();
      syncControls();
      draw();
    });
    new ResizeObserver(resize).observe(stage);

    function start(Cs, how) {
      st.Cs = Cs.map(function (c) { return c * uF; });
      st.how = how;
      st.U = 12;
      st.k = 0;
      st.pick = st.mark = null;
      fixScale();
    }
    function charge() {
      return Lab.tween(1500, function (t) {
        st.k = t;
        paint();
      });
    }
    var WHICH = [
      ["0", "C1 · 6 μF"],
      ["1", "C2 · 3 μF"],
      ["same", "Both the same"],
    ];
    Lab.experiment({
      id: "networks",
      title: "1.13 Capacitor networks",
      card: root.querySelector(".challenge"),
      lock: function (on) {
        st.locked = on;
        form.querySelectorAll("button, select, input").forEach(function (n) {
          n.disabled = on;
        });
        syncControls();
        draw();
      },
      setup: function (c) {
        c.stage();
        syncControls();
        draw();
      },
      sandbox: function () {
        st.k = 1;
        st.pick = st.mark = null;
        fixScale();
        syncControls();
        draw();
      },
      challenges: [
        {
          id: "series-voltage",
          short: "which series capacitor takes the larger voltage",
          ref: "1.13",
          prompt: "6 μF and 3 μF in series are charged from 12 V. Which capacitor ends up with the larger voltage?",
          options: WHICH,
          answer: "1",
          stage: function () {
            start([6, 3], "series");
          },
          preview: function (c) {
            st.pick = c === "same" ? null : +c;
            draw();
          },
          reveal: charge,
          why: "In series both capacitors carry the same charge, Q = C<sub>total</sub>U = 2 μF × 12 V = 24 μC. Then U = Q/C is largest on the smallest capacitor: 8 V on 3 μF, 4 V on 6 μF. The voltages add up to 12 V.",
        },
        {
          id: "parallel-charge",
          short: "which parallel capacitor holds more charge",
          ref: "1.13",
          prompt: "Now the same two capacitors are connected in parallel across 12 V. Which one holds more charge?",
          options: WHICH,
          answer: "0",
          stage: function () {
            start([6, 3], "parallel");
          },
          preview: function (c) {
            st.pick = c === "same" ? null : +c;
            draw();
          },
          reveal: charge,
          why: "In parallel every capacitor sees the full 12 V, so Q = CU grows with C: 72 μC on 6 μF, 36 μC on 3 μF. The total capacitance is 9 μF, larger than either one.",
        },
        {
          id: "third-series",
          short: "adding a capacitor in series",
          ref: "1.13",
          prompt: "Back in series, 6 μF and 3 μF at 12 V. You add a third capacitor of 2 μF in series. What happens to the total capacitance?",
          options: [
            ["up", "It gets larger"],
            ["same", "It stays the same"],
            ["down", "It gets smaller"],
          ],
          answer: "down",
          stage: function () {
            start([6, 3], "series");
            st.k = 1;
          },
          reveal: function () {
            var before = now();
            st.mark = { i: 0, k: 1, v: before.parts[0].Q };
            st.Cs.push(2 * uF);
            st.k = 0;
            syncControls();
            return charge();
          },
          why: "Series capacitors add as reciprocals: 1/C = 1/6 + 1/3 + 1/2 = 1, so C = 1 μF, smaller than the smallest one. The charge drops from 24 μC to 12 μC, and the new 2 μF capacitor takes 6 V of the 12 V.",
        },
        {
          id: "series-swap",
          short: "a much larger partner in series",
          ref: "1.13",
          prompt: "6 μF and 3 μF in series at 12 V. You swap the 3 μF for a much larger 30 μF. What happens to the voltage across the 6 μF capacitor?",
          options: [
            ["up", "It gets larger"],
            ["same", "It stays the same"],
            ["down", "It gets smaller"],
          ],
          answer: "up",
          stage: function () {
            start([6, 3], "series");
            st.k = 1;
            st.scale.U = 12;
          },
          reveal: function () {
            st.mark = { i: 0, k: 0, v: now().parts[0].U };
            return Lab.tween(1500, function (t) {
              st.Cs[1] = (3 + 27 * t) * uF;
              paint();
            }).then(syncControls);
          },
          why: "A large capacitor in series needs only a small voltage to hold the shared charge. C<sub>total</sub> = 1/(1/6 + 1/30) = 5 μF, Q = 60 μC, so the 6 μF now takes 10 V (up from 4 V) and the 30 μF only 2 V.",
        },
      ],
    });
  }

  /* ---------- Interface: a field crossing the boundary between two media ---------- */
  function interfaceBench(root) {
    var stage = root.querySelector(".stage"),
      canvas = stage.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      form = root.querySelector(".controls"),
      out = {},
      nCm = 1e-9,
      st = { E1: 100, a1: 45, er1: 1, er2: 1, sigma: 0, ghost: null, locked: true, scale: null },
      size = { w: 0, h: 0 },
      queued = false;
    root.querySelectorAll("[data-out]").forEach(function (n) {
      out[n.dataset.out] = n;
    });
    function now() {
      return P.interface(st.E1, st.a1, st.er1, st.er2, st.sigma * nCm);
    }
    function fixScale() {
      var r = now();
      st.scale = {
        E: Math.max(Math.abs(r.En1), Math.abs(r.En2), r.Et, 1) * 1.15,
        D: Math.max(Math.abs(r.Dn1), Math.abs(r.Dn2), 1e-12) * 1.15,
      };
    }
    function resize() {
      var b = stage.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      size.w = b.width;
      size.h = b.height;
      canvas.width = Math.round(b.width * dpr);
      canvas.height = Math.round(b.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    }
    function text(t, x, y, o) {
      o = o || {};
      ctx.fillStyle = o.color || css("--ink");
      ctx.font = (o.weight || 700) + " " + (o.size || 13) + "px " + css("--f-display");
      ctx.textAlign = o.align || "center";
      ctx.textBaseline = o.base || "middle";
      ctx.fillText(t, x, y);
    }
    function arrowTo(x0, y0, x1, y1, color, width) {
      var t = Math.atan2(y1 - y0, x1 - x0);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width || 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - 9 * Math.cos(t - 0.42), y1 - 9 * Math.sin(t - 0.42));
      ctx.lineTo(x1 - 9 * Math.cos(t + 0.42), y1 - 9 * Math.sin(t + 0.42));
      ctx.closePath();
      ctx.fill();
    }
    function paint() {
      queued = false;
      var w = size.w,
        h = size.h,
        r = now(),
        ink = css("--ink"),
        muted = css("--muted"),
        fau = css("--fau-mark"),
        course = css("--course"),
        small = w < 480,
        topH = Math.round(h * (small ? 0.5 : 0.62)),
        bx = w / 2,
        cy = topH / 2 + 6;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = css("--paper");
      ctx.fillRect(0, 0, w, h);
      // media: denser tint for larger permittivity
      [[0, st.er1], [bx, st.er2]].forEach(function (m) {
        ctx.globalAlpha = Math.min(0.75, 0.08 + 0.07 * (m[1] - 1));
        ctx.fillStyle = course;
        ctx.fillRect(m[0], 0, bx, topH);
        ctx.globalAlpha = 1;
      });
      text("medium 1 · εr = " + st.er1.toFixed(1), bx / 2, 16, { size: 12 });
      text("medium 2 · εr = " + st.er2.toFixed(1), bx + bx / 2, 16, { size: 12 });
      // boundary, with its surface charge
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, 26);
      ctx.lineTo(bx, topH);
      ctx.stroke();
      if (Math.abs(st.sigma) > 1e-6) {
        var nsig = Math.min(14, Math.round(Math.abs(st.sigma) * 8) + 2);
        for (var k = 0; k < nsig; k++) text(st.sigma > 0 ? "+" : "−", bx, 34 + ((k + 0.5) * (topH - 40)) / nsig, { size: 12, color: fau });
      }
      // field lines: parallel in medium 1, refracted in medium 2 (direction of E)
      var a1 = (st.a1 * Math.PI) / 180,
        d1 = [Math.cos(a1), -Math.sin(a1)],
        m2 = Math.hypot(r.En2, r.Et) || 1,
        d2 = [r.En2 / m2, -r.Et / m2],
        lines = 7,
        gapY = (topH - 50) / (lines - 1),
        hits = [];
      // the main line meets the boundary in the middle of the scene, the others spaced around it
      for (var i = 0; i < lines; i++) hits.push(cy + (i - (lines - 1) / 2) * gapY * 0.8);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 26, w, topH - 26);
      ctx.clip();
      hits.forEach(function (y, i) {
        var main = i === (lines - 1) / 2,
          L = Math.max(w, topH) * 2;
        ctx.globalAlpha = main ? 1 : 0.55;
        arrowTo(bx - L * d1[0], y - L * d1[1], bx - 40 * d1[0], y - 40 * d1[1], main ? ink : muted, main ? 2.4 : 1.4);
        ctx.strokeStyle = main ? ink : muted;
        ctx.beginPath();
        ctx.moveTo(bx - 40 * d1[0], y - 40 * d1[1]);
        ctx.lineTo(bx, y);
        ctx.stroke();
        arrowTo(bx, y, bx + 70 * d2[0], y + 70 * d2[1], main ? ink : muted, main ? 2.4 : 1.4);
        ctx.beginPath();
        ctx.moveTo(bx + 70 * d2[0], y + 70 * d2[1]);
        ctx.lineTo(bx + L * d2[0], y + L * d2[1]);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // the student's guessed direction, kept beside the real one
      var yc = hits[(lines - 1) / 2];
      if (st.ghost != null) {
        var g = (st.ghost * Math.PI) / 180;
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = muted;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, yc);
        ctx.lineTo(bx + 150 * Math.cos(g), yc - 150 * Math.sin(g));
        ctx.stroke();
        ctx.setLineDash([]);
        var lx = Math.min(bx + 158 * Math.cos(g), w - 8),
          ly = Math.max(36, yc - 158 * Math.sin(g) - 8);
        text("your guess", lx, ly, { size: 11, weight: 600, color: muted, align: lx > w - 80 ? "right" : "left" });
      }
      // the field split into its normal and tangential parts, on both sides of the crossing
      var kk = 90 / st.scale.E,
        nCol = css("--fau-mark"),
        tCol = css("--eei-3");
      function comp(x0, y0, x1, y1, color, lab, lx, ly) {
        if (Math.hypot(x1 - x0, y1 - y0) < 6) return;
        ctx.setLineDash([4, 3]);
        arrowTo(x0, y0, x1, y1, color, 2.2);
        ctx.setLineDash([]);
        text(lab, lx, ly, { size: 11, color: color });
      }
      var t1x = bx - r.En1 * kk,
        t1y = yc + r.Et * kk;
      comp(t1x, t1y, bx, t1y, nCol, "En1", (t1x + bx) / 2, t1y + 12);
      comp(bx, t1y, bx, yc, tCol, "Et", bx - 16, (t1y + yc) / 2);
      comp(bx, yc, bx + r.En2 * kk, yc, nCol, "En2", bx + Math.max(r.En2 * kk, 18) + 16, yc + 13);
      comp(bx + r.En2 * kk, yc, bx + r.En2 * kk, yc - r.Et * kk, tCol, "Et", bx + r.En2 * kk + 16, yc - (r.Et * kk) / 2);
      // the normal and both angles at the main line
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 110, yc);
      ctx.lineTo(bx + 110, yc);
      ctx.stroke();
      ctx.setLineDash([]);
      text("normal", bx + 112, yc + 12, { size: 11, weight: 600, color: muted, align: "left" });
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, yc, 46, Math.PI, Math.PI + a1, false);
      ctx.stroke();
      text("α1 = " + st.a1.toFixed(0) + "°", bx - 54 - 22, yc + 14, { size: 12 });
      var a2 = (r.a2 * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(bx, yc, 52, -a2, 0, false);
      ctx.stroke();
      text("α2 = " + r.a2.toFixed(0) + "°", bx + 60 + 22, yc - 14, { size: 12 });
      ctx.restore();

      // paired bars: side 1 against side 2 for the normal E, normal D and tangential E
      var rows = [
          ["Normal E", r.En1, r.En2, st.scale.E, "V/m"],
          ["Normal D", r.Dn1, r.Dn2, st.scale.D, "C/m²"],
          ["Tangential E", r.Et, r.Et, st.scale.E, "V/m"],
        ],
        gx = small ? 12 : 120,
        colW = (w - gx - 24) / 2,
        rowH = (h - topH - (small ? 22 : 8)) / rows.length;
      text("medium 1", gx + colW / 2, topH + 10, { size: 11, weight: 600, color: muted });
      text("medium 2", gx + colW + 12 + colW / 2, topH + 10, { size: 11, weight: 600, color: muted });
      rows.forEach(function (row, i) {
        var y = topH + (small ? 36 : 22) + i * rowH,
          bh = Math.max(8, Math.min(14, rowH * 0.32));
        text(row[0], small ? gx : 12, small ? y - 2 : y + bh / 2, { align: "left", base: small ? "bottom" : "middle", size: small ? 11 : 13 });
        [row[1], row[2]].forEach(function (v, j) {
          var x = gx + j * (colW + 12),
            bw = colW - 8,
            frac = Math.max(0, Math.min(1, Math.abs(v) / row[3]));
          ctx.strokeStyle = css("--line");
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
          ctx.fillStyle = i === 1 ? course : fau;
          ctx.fillRect(x, y, bw * frac, bh);
          if (i === 1) {
            ctx.strokeStyle = ink;
            ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, bw * frac - 1), bh - 1);
          }
          text(P.fmt(v, row[4]), x, y + bh + 9, { align: "left", size: small ? 10 : 12, weight: 600 });
        });
      });
      out.E2.textContent = P.fmt(r.E2, "V/m");
      out.a2.textContent = r.a2.toFixed(1) + "°";
      out.En2.textContent = P.fmt(r.En2, "V/m");
      out.Dn.textContent = P.fmt(r.Dn1, "C/m²") + " → " + P.fmt(r.Dn2, "C/m²");
    }

    // Controls
    var ctl = {};
    form.querySelectorAll("[data-p]").forEach(function (n) {
      ctl[n.dataset.p] = n;
    });
    function syncControls() {
      ["E1", "a1", "er1", "er2", "sigma"].forEach(function (k) {
        ctl[k].value = st[k];
        ctl[k].disabled = st.locked;
      });
      form.querySelector("[data-val=E1]").textContent = st.E1 + " V/m";
      form.querySelector("[data-val=a1]").textContent = st.a1 + "°";
      form.querySelector("[data-val=er1]").textContent = (+st.er1).toFixed(1);
      form.querySelector("[data-val=er2]").textContent = (+st.er2).toFixed(1);
      form.querySelector("[data-val=sigma]").textContent = (st.sigma > 0 ? "+" : st.sigma < 0 ? "−" : "") + Math.abs(st.sigma).toFixed(2) + " nC/m²";
    }
    form.addEventListener("input", function (e) {
      var k = e.target.dataset.p;
      if (!k) return;
      st[k] = +e.target.value;
      st.ghost = null;
      syncControls();
      fixScale();
      draw();
    });
    new ResizeObserver(resize).observe(stage);

    function start(o) {
      st.E1 = 100;
      st.a1 = 45;
      st.er1 = 1;
      st.er2 = 1;
      st.sigma = 0;
      Object.assign(st, o || {});
      st.ghost = null;
      fixScale();
    }
    // guesses drawn 15° off the incoming angle, toward or away from the normal
    function guess(base) {
      return function (choice) {
        var b = base(),
          t = { toward: b - 15, same: b, away: b + 15 }[choice];
        st.ghost = t == null ? null : t;
        draw();
      };
    }
    var BEND = [
      ["toward", "Toward the normal"],
      ["same", "It does not bend"],
      ["away", "Away from the normal"],
    ];
    Lab.experiment({
      id: "interface",
      title: "1.11 Interface conditions",
      card: root.querySelector(".challenge"),
      lock: function (on) {
        st.locked = on;
        form.querySelectorAll("button, select, input").forEach(function (n) {
          n.disabled = on;
        });
        syncControls();
        draw();
      },
      setup: function (c) {
        c.stage();
        syncControls();
        draw();
      },
      sandbox: function () {
        st.ghost = null;
        fixScale();
        syncControls();
        draw();
      },
      challenges: [
        {
          id: "bend",
          short: "which way a field line bends into the higher permittivity",
          ref: "1.11",
          prompt: "A field line crosses from vacuum (εr = 1) into a dielectric with εr = 4, at 45° to the normal. There is no surface charge. Which way does it bend?",
          options: BEND,
          answer: "away",
          stage: function () {
            start();
          },
          preview: guess(function () {
            return 45;
          }),
          reveal: function () {
            st.scale.E = 100;
            return Lab.tween(1600, function (t) {
              st.er2 = 1 + 3 * t;
              paint();
            }).then(syncControls);
          },
          why: "The tangential E is continuous (70.7 V/m on both sides), but the normal D is continuous, so the normal E drops to 70.7/4 ≈ 17.7 V/m. A small normal part next to an unchanged tangential part tilts the line to 76°, away from the normal: tan α<sub>1</sub>/tan α<sub>2</sub> = ε<sub>1</sub>/ε<sub>2</sub>.",
        },
        {
          id: "continuous",
          short: "what stays continuous across an uncharged boundary",
          ref: "1.11",
          prompt: "Same boundary, no surface charge. As εr of medium 2 grows, which normal component stays the same on both sides?",
          options: [
            ["E", "The normal part of E"],
            ["D", "The normal part of D"],
            ["both", "Both"],
          ],
          answer: "D",
          stage: function () {
            start({ a1: 30 });
          },
          reveal: function () {
            return Lab.tween(2000, function (t) {
              st.er2 = 1 + 5 * t;
              paint();
            }).then(syncControls);
          },
          why: "A flat pillbox across the boundary encloses no charge, so the D-flux in equals the D-flux out: D<sub>n1</sub> = D<sub>n2</sub>. The two D bars stay equal while E<sub>n2</sub> = D<sub>n</sub>/ε<sub>2</sub> shrinks as ε<sub>2</sub> grows.",
        },
        {
          id: "normal-incidence",
          short: "a field line along the normal",
          ref: "1.11",
          prompt: "Now the field meets the dielectric (εr = 4) straight on, along the normal. Does the line bend?",
          options: BEND,
          answer: "same",
          stage: function () {
            start({ er2: 4, a1: 40 });
          },
          preview: guess(function () {
            return 0;
          }),
          reveal: function () {
            return Lab.tween(1600, function (t) {
              st.a1 = Math.round(40 * (1 - t));
              paint();
            }).then(syncControls);
          },
          why: "With no tangential part there is nothing to tilt: the line goes straight through. Only its strength changes, from 100 V/m to 25 V/m, because D<sub>n</sub> is continuous and ε<sub>r</sub> = 4.",
        },
        {
          id: "surface-charge",
          short: "the effect of positive surface charge",
          ref: "1.11",
          prompt: "Vacuum on both sides, field at 45°. You put a positive surface charge on the boundary (the normal points from medium 1 into medium 2). Which way does the line bend in medium 2?",
          options: BEND,
          answer: "toward",
          stage: function () {
            start();
          },
          preview: guess(function () {
            return 45;
          }),
          reveal: function () {
            return Lab.tween(1600, function (t) {
              st.sigma = Math.round(88.5 * t) / 100;
              paint();
            }).then(syncControls);
          },
          why: "The jump condition is D<sub>n2</sub> − D<sub>n1</sub> = σ<sub>A</sub>. Positive σ adds to the normal D on the far side, while the tangential E is untouched, so the line turns toward the normal (here from 45° to 22.5°). Negative σ would turn it away.",
        },
      ],
    });
  }

  /* ---------- Gauss cylinder: enclosed charge, D(ρ) and what a dielectric changes ---------- */
  function gaussCylinder(root) {
    var stage = root.querySelector(".stage"),
      canvas = stage.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      form = root.querySelector(".controls"),
      out = {},
      uC = 1e-6,
      cm = 1e-2,
      st = { rv: 4, a: 10, rho: 10, er: 1, ghost: null, locked: true, Dmax: 1, Emax: 1 },
      size = { w: 0, h: 0 },
      queued = false;
    root.querySelectorAll("[data-out]").forEach(function (n) {
      out[n.dataset.out] = n;
    });
    function at(rho, er) {
      return P.cylinder(st.rv * uC, st.a * cm, rho * cm, er == null ? st.er : er);
    }
    function fixScale() {
      var peak = at(st.a, 1);
      st.Dmax = peak.D * 1.2;
      st.Emax = peak.E * 1.2;
    }
    function resize() {
      var b = stage.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      size.w = b.width;
      size.h = b.height;
      canvas.width = Math.round(b.width * dpr);
      canvas.height = Math.round(b.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    }
    function text(t, x, y, o) {
      o = o || {};
      ctx.fillStyle = o.color || css("--ink");
      ctx.font = (o.weight || 700) + " " + (o.size || 13) + "px " + css("--f-display");
      ctx.textAlign = o.align || "center";
      ctx.textBaseline = o.base || "middle";
      ctx.fillText(t, x, y);
    }
    function paint() {
      queued = false;
      if (size.w < 80 || size.h < 80) return; // not laid out yet
      var w = size.w,
        h = size.h,
        ink = css("--ink"),
        muted = css("--muted"),
        fau = css("--fau-mark"),
        course = css("--course"),
        stack = w < 560,
        rMax = 3 * st.a, // the plot and the view cover 0…3a
        v = at(st.rho);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = css("--paper");
      ctx.fillRect(0, 0, w, h);

      // cross-section of the long cylinder, looking along its axis
      var vw = stack ? w : w * 0.44,
        vh = stack ? h * 0.46 : h,
        cx = vw / 2,
        cy = vh / 2 + 6,
        sc = Math.max(0.5, Math.min(vw, vh) / 2 - 30) / Math.max(rMax * 0.75, st.rho * 1.05),
        rA = st.a * sc,
        rG = st.rho * sc;
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = course;
      ctx.beginPath();
      ctx.arc(cx, cy, rA, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(rA, rG), 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
      // the charge as evenly spread dots: solid if the Gaussian surface encloses it
      for (var di = 0; di < 90; di++) {
        var dr = Math.sqrt((di + 0.5) / 90),
          dt = di * 2.39996,
          inside = dr * st.a <= st.rho;
        ctx.beginPath();
        ctx.arc(cx + dr * rA * 0.94 * Math.cos(dt), cy + dr * rA * 0.94 * Math.sin(dt), Math.max(1.6, rA / 34), 0, 2 * Math.PI);
        if (inside) {
          ctx.fillStyle = ink;
          ctx.fill();
        } else {
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.45;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rA, 0, 2 * Math.PI);
      ctx.stroke();
      // Gaussian surface and D arrows on it (length grows with D)
      ctx.strokeStyle = fau;
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(rG, 1), 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      var len = 6 + 34 * Math.min(1, v.D / st.Dmax);
      if (st.rho > 0.2) {
        ctx.fillStyle = fau;
        for (var k = 0; k < 12; k++) {
          var t = (k * Math.PI) / 6,
            x0 = cx + rG * Math.cos(t),
            y0 = cy + rG * Math.sin(t),
            x1 = cx + (rG + len) * Math.cos(t),
            y1 = cy + (rG + len) * Math.sin(t);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 - 7 * Math.cos(t - 0.45), y1 - 7 * Math.sin(t - 0.45));
          ctx.lineTo(x1 - 7 * Math.cos(t + 0.45), y1 - 7 * Math.sin(t + 0.45));
          ctx.closePath();
          ctx.fill();
        }
      }
      text("Gaussian surface ρ = " + st.rho.toFixed(1) + " cm · encloses " + Math.round((100 * v.q) / v.total) + " % of the charge", cx, 14, { size: stack ? 11 : 12 });
      if (!stack) text("charged cylinder, radius a = " + st.a + " cm", cx, vh - 12, { size: 11, weight: 600, color: muted });

      // D(ρ) plot with the E(ρ) curve for the current εr
      var px = stack ? 46 : vw + 50,
        py = stack ? vh + 34 : 36,
        pw = (stack ? w : w - vw) - (stack ? 66 : 78),
        ph = (stack ? h - vh : h) - (stack ? 60 : 82);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py + ph);
      ctx.lineTo(px + pw, py + ph);
      ctx.stroke();
      function X(r) {
        return px + (r / rMax) * pw;
      }
      function Y(f) {
        return py + ph - Math.min(1.05, f) * ph;
      }
      // the surface of the cylinder
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X(st.a), py);
      ctx.lineTo(X(st.a), py + ph);
      ctx.stroke();
      ctx.setLineDash([]);
      text("ρ = a", X(st.a), py + ph + 14, { size: 11, weight: 600, color: muted });
      text("3a", X(rMax), py + ph + 14, { size: 11, weight: 600, color: muted });
      text("0", px, py + ph + 14, { size: 11, weight: 600, color: muted });
      function curve(fn, color, dash, width) {
        ctx.strokeStyle = color;
        ctx.setLineDash(dash || []);
        ctx.lineWidth = width || 2.5;
        ctx.beginPath();
        for (var i = 0; i <= 120; i++) {
          var r = (i / 120) * rMax,
            yv = Y(fn(r));
          if (i) ctx.lineTo(X(r), yv);
          else ctx.moveTo(X(r), yv);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      curve(function (r) {
        return at(r).E / st.Emax;
      }, muted, [6, 4], 2);
      curve(function (r) {
        return at(r).D / st.Dmax;
      }, fau, null, 2.8);
      text("D(ρ)", px + 6, py + 4, { align: "left", color: fau, size: 12 });
      text("E(ρ), dashed, for εr = " + st.er.toFixed(1), px + 6, py + 20, { align: "left", color: muted, size: 11, weight: 600 });
      // ghost guess and the current reading
      if (st.ghost) {
        ctx.strokeStyle = muted;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        var gy = Math.max(py + 30, Y(st.ghost.f));
        ctx.arc(X(st.ghost.r), gy, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        text("your guess", Math.min(X(st.ghost.r), px + pw - 30), gy - 16, { size: 11, weight: 600, color: muted });
      }
      ctx.fillStyle = fau;
      ctx.beginPath();
      ctx.arc(X(st.rho), Y(v.D / st.Dmax), 6, 0, 2 * Math.PI);
      ctx.fill();

      out.q.textContent = P.fmt(v.q, "C/m");
      out.D.textContent = P.fmt(v.D, "C/m²");
      out.E.textContent = P.fmt(v.E, "V/m");
    }

    // Controls
    var ctl = {};
    form.querySelectorAll("[data-p]").forEach(function (n) {
      ctl[n.dataset.p] = n;
    });
    function syncControls() {
      ctl.rho.max = 3 * st.a;
      ["rv", "a", "rho", "er"].forEach(function (k) {
        ctl[k].value = st[k];
        ctl[k].disabled = st.locked;
      });
      form.querySelector("[data-val=rv]").textContent = st.rv + " μC/m³";
      form.querySelector("[data-val=a]").textContent = st.a + " cm";
      form.querySelector("[data-val=rho]").textContent = (+st.rho).toFixed(1) + " cm";
      form.querySelector("[data-val=er]").textContent = (+st.er).toFixed(1);
    }
    form.addEventListener("input", function (e) {
      var k = e.target.dataset.p;
      if (!k) return;
      st[k] = +e.target.value;
      if (k === "a") st.rho = Math.min(st.rho, 3 * st.a);
      st.ghost = null;
      if (k !== "rho" && k !== "er") fixScale();
      syncControls();
      draw();
    });
    new ResizeObserver(resize).observe(stage);

    function start(o) {
      st.rv = 4;
      st.a = 10;
      st.rho = 10;
      st.er = 1;
      Object.assign(st, o || {});
      st.ghost = null;
      fixScale();
    }
    function sweep(from, to, ms) {
      return Lab.tween(ms || 1600, function (t) {
        st.rho = from + (to - from) * t;
        paint();
      }).then(syncControls);
    }
    Lab.experiment({
      id: "gauss",
      title: "1.10 Gauss’s law",
      card: root.querySelector(".challenge"),
      lock: function (on) {
        st.locked = on;
        form.querySelectorAll("button, select, input").forEach(function (n) {
          n.disabled = on;
        });
        syncControls();
        draw();
      },
      setup: function (c) {
        c.stage();
        syncControls();
        draw();
      },
      sandbox: function () {
        st.ghost = null;
        syncControls();
        draw();
      },
      challenges: [
        {
          id: "outside",
          short: "D outside the cylinder",
          ref: "1.10",
          prompt: "The Gaussian surface sits on the cylinder's surface, ρ = a. You widen it to ρ = 2a. Compared with ρ = a, how large is D there?",
          options: [
            ["up", "Larger"],
            ["same", "The same"],
            ["half", "Half as large"],
            ["quarter", "A quarter as large"],
          ],
          answer: "half",
          stage: function () {
            start();
          },
          preview: function (c) {
            st.ghost = { r: 2 * st.a, f: { up: 1.2, same: 1 / 1.2, half: 0.5 / 1.2, quarter: 0.25 / 1.2 }[c] };
            draw();
          },
          reveal: function () {
            return sweep(10, 20);
          },
          why: "Outside, the enclosed charge no longer grows, but the surface 2πρl does. So D = ρ<sub>V</sub>a<sup>2</sup>/(2ρ) falls as 1/ρ: half at 2a. Not 1/ρ<sup>2</sup> as for a point charge, because a cylinder's surface grows only with ρ.",
        },
        {
          id: "peak",
          short: "where D is largest",
          ref: "1.10",
          prompt: "Sweep the Gaussian surface from the axis outward to 3a. Where is D largest?",
          options: [
            ["axis", "On the axis, ρ = 0"],
            ["surface", "At the surface, ρ = a"],
            ["far", "Far outside"],
          ],
          answer: "surface",
          stage: function () {
            start({ rho: 0 });
          },
          preview: function (c) {
            st.ghost = { r: { axis: 0, surface: st.a, far: 2.6 * st.a }[c], f: 1 / 1.2 };
            draw();
          },
          reveal: function () {
            return sweep(0, 30, 2400);
          },
          why: "Inside, the enclosed charge grows like ρ<sup>2</sup> while the surface grows like ρ, so D = ρ<sub>V</sub>ρ/2 rises linearly. Outside it falls as 1/ρ. The two formulas meet at ρ = a, where D peaks at ρ<sub>V</sub>a/2. On the axis D is zero: nothing is enclosed.",
        },
        {
          id: "quarter",
          short: "the charge inside half the radius",
          ref: "1.10",
          prompt: "You shrink the Gaussian surface from ρ = a to ρ = a/2. What share of the cylinder's charge does it still enclose?",
          options: [
            ["half", "Half"],
            ["quarter", "A quarter"],
            ["eighth", "An eighth"],
          ],
          answer: "quarter",
          stage: function () {
            start();
          },
          reveal: function () {
            return sweep(10, 5);
          },
          why: "The enclosed charge per length is ρ<sub>V</sub>πρ<sup>2</sup>, so it scales with the cross-section: (1/2)<sup>2</sup> = 1/4. An eighth would be a sphere (volume ∝ r<sup>3</sup>), not a long cylinder.",
        },
        {
          id: "dielectric",
          short: "what a dielectric changes around a fixed charge",
          ref: "1.10",
          prompt: "The same charged cylinder, but now everything is filled with a dielectric of εr = 4. What changes at ρ = 2a?",
          options: [
            ["D", "D drops, E stays"],
            ["E", "E drops, D stays"],
            ["both", "Both drop"],
          ],
          answer: "E",
          stage: function () {
            start({ rho: 20 });
          },
          reveal: function () {
            return Lab.tween(1600, function (t) {
              st.er = 1 + 3 * t;
              paint();
            }).then(syncControls);
          },
          why: "Gauss's law sees only the enclosed charge, so D is unchanged: the solid curve does not move. The field E = D/(ε<sub>0</sub>ε<sub>r</sub>), the dashed curve, drops to a quarter.",
        },
      ],
    });
  }

  // Experiments register in chapter order, which is also the order of the results list.
  document.querySelectorAll("[data-experiment=field]").forEach(fieldPlayground);
  document.querySelectorAll("[data-experiment=gauss]").forEach(gaussCylinder);
  document.querySelectorAll("[data-experiment=interface]").forEach(interfaceBench);
  document.querySelectorAll("[data-experiment=capacitor]").forEach(capacitorBench);
  document.querySelectorAll("[data-experiment=networks]").forEach(networks);
})();
