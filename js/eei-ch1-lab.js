/* EEI Chapter 1 lab experiments. Needs js/eei-ch1-physics.js (EEI1) and js/lab.js (Lab). */
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
        show: { lines: true, vectors: false, equi: true },
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
      if (st.show.equi) equipotentials(css("--eei-3") || css("--fau"));
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
      handles();
      readouts();
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
      out.W.textContent = st.workFrom == null ? "—" : P.fmt(P.work(pr.q, st.workFrom, phi), "J");
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
      title: "Field playground",
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
          id: "equipotential",
          short: "work along an equipotential",
          ref: "1.8",
          prompt: "You carry a +1 nC probe half a circle around a +2 nC charge, always 10 cm away. How much work do you supply?",
          options: [
            ["pos", "Positive: you push against the repulsion"],
            ["zero", "Zero"],
            ["neg", "Negative: the field does the work"],
          ],
          answer: "zero",
          stage: function () {
            st.charges = [{ x: 0, y: 0, q: 2 * nC }];
            st.probe = { x: 0.1, y: 0, q: 1 * nC };
            st.show = { lines: true, vectors: false, equi: true };
          },
          reveal: function () {
            startWork();
            return Lab.tween(2000, function (t) {
              var a = Math.PI * t;
              st.probe.x = 0.1 * Math.cos(a);
              st.probe.y = 0.1 * Math.sin(a);
              st.trail.push([st.probe.x, st.probe.y]);
              paint();
            });
          },
          why: "The path never leaves one equipotential (the dashed circle), so φ stays the same and W<sub>e</sub> = Q(φ<sub>end</sub> − φ<sub>start</sub>) = 0, however long the path. The force is always perpendicular to the motion.",
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

  document.querySelectorAll("[data-experiment=field]").forEach(fieldPlayground);
})();
