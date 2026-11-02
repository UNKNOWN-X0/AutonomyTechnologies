/* APDR Chapter 1a: identities, completeness, minimisation, representations, and hazards. */
(function () {
  var P = window.APDR12, canvases = [];

  function colours(stage) {
    var s = getComputedStyle(stage);
    return { paper: s.getPropertyValue("--paper").trim(), panel: s.getPropertyValue("--paper-2").trim(), ink: s.getPropertyValue("--ink").trim(), muted: s.getPropertyValue("--muted").trim(), line: s.getPropertyValue("--line").trim(), fau: s.getPropertyValue("--fau-mark").trim(), course: s.getPropertyValue("--course").trim(), font: s.getPropertyValue("--f-display").trim() };
  }
  function queue(canvas, state) {
    canvas._labState = state;
    if (canvas._paint) cancelAnimationFrame(canvas._paint);
    canvas._paint = requestAnimationFrame(function () {
      canvas._paint = 0;
      var r = canvas.parentElement.getBoundingClientRect(); if (!r.width || !r.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = canvas.getContext("2d"), c = colours(canvas.parentElement);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, r.width, r.height); ctx.lineJoin = "round"; ctx.lineCap = "round";
      ({ identity: drawIdentity, nand: drawNand, kmap: drawKmap, shannon: drawShannon, anf: drawAnf, hazard: drawHazard })[state.kind](ctx, r.width, r.height, c, state);
    });
  }
  function text(ctx, value, x, y, c, size, colour) {
    ctx.fillStyle = colour || c.ink; ctx.font = "600 " + (size || 14) + "px " + (c.font || "sans-serif"); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(value), x, y);
  }
  function box(ctx, label, x, y, w, h, c, active, size) {
    ctx.fillStyle = active ? c.panel : c.paper; ctx.strokeStyle = active ? c.fau : c.line; ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); text(ctx, label, x + w / 2, y + h / 2, c, size || 13);
  }
  function line(ctx, x1, y1, x2, y2, c, active) { ctx.strokeStyle = active ? c.fau : c.muted; ctx.lineWidth = active ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function arrow(ctx, x1, y1, x2, y2, c, active) {
    line(ctx, x1, y1, x2, y2, c, active); var a = Math.atan2(y2 - y1, x2 - x1), l = 7; ctx.fillStyle = active ? c.fau : c.muted;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - l * Math.cos(a - .45), y2 - l * Math.sin(a - .45)); ctx.lineTo(x2 - l * Math.cos(a + .45), y2 - l * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }
  function animate(s, show, finish) { s.revealing = true; return Lab.tween(1300, function (t) { s.progress = t; show(); }).then(function () { s.revealing = false; finish(); show(); }); }
  function lock(form, section, on) { form.querySelectorAll("input,select,button").forEach(function (el) { el.disabled = on; }); section.querySelector(".stage").classList.toggle("locked", on); }
  function label(values, key) { var hit = values.filter(function (v) { return v[0] === key; })[0]; return hit ? hit[1] : key; }
  /* s holds the challenge's id and setup; state is what the stage draws. */
  function standard(s, state, show, values, ref, prompt, answer, why, short) {
    return { id: s.id, short: short, ref: ref, prompt: prompt, options: values, answer: answer, why: why,
      stage: function () { state.reveal = null; state.challenge = true; if (s.setup) s.setup(); state.progress = 0; state.revealing = false; state.result = null; state.guess = ""; show(); },
      preview: function (choice) { state.guess = label(values, choice); show(); },
      reveal: function () { var text = s.result || label(values, answer); return state.reveal ? state.reveal(show, text) : animate(state, show, function () { state.result = text; }); } };
  }
  function register(id, title, section, form, state, challenges, sandbox) {
    var canvas = section.querySelector("canvas"), show = function () { queue(canvas, state); };
    Lab.experiment({ id: id, title: title, card: section.querySelector(".challenge"), lock: function (on) { lock(form, section, on); },
      setup: function (c) { c.stage(); }, sandbox: function () { state.challenge = false; state.guess = ""; state.result = null; state.progress = 0; state.revealing = false; state.reveal = null; sandbox(); }, challenges: challenges(show) });
    canvases.push(canvas); if (typeof ResizeObserver !== "undefined") { if (!window._apdr12Resize) window._apdr12Resize = new ResizeObserver(function (entries) { entries.forEach(function (e) { var cv = e.target.querySelector("canvas"); if (cv && cv._labState) queue(cv, cv._labState); }); }); window._apdr12Resize.observe(canvas.parentElement); }
  }
  var LAWS = {
    absorption: { title: "Absorption · x + xy and x", left: function (x, y) { return Number(x || (x && y)); }, right: function (x) { return x; } },
    demorgan: { title: "De Morgan · (x + y)′ and x′y′", left: function (x, y) { return Number(!(x || y)); }, right: function (x, y) { return Number(!x && !y); } },
    product: { title: "(xy)′ and x′y′", left: function (x, y) { return Number(!(x && y)); }, right: function (x, y) { return Number(!x && !y); } }
  };
  function drawIdentity(ctx, w, h, c, s) {
    if (s.law === "duality") {
      var shown = s.revealing || !!s.result;
      text(ctx, shown ? "x + x = x   ⇄   x · x = x" : "x + x = x   ⇄   ?", w / 2, 70, c, 17);
      text(ctx, shown ? "Swap + with ·, and 0 with 1" : "Predict the dual", w / 2, 112, c, 13, c.muted);
      if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 52, c, 12);
      if (s.result) text(ctx, "x · x = x is the dual", w / 2, h - 30, c, 13);
      return;
    }
    var law = LAWS[s.law], rows = P.truthTable(2, law.left), differ = [];
    text(ctx, law.title, w / 2, 27, c, 16);
    ["x y", "left", "right"].forEach(function (v, i) { text(ctx, v, w * (.27 + .23 * i), 62, c, 13); });
    rows.forEach(function (r, i) {
      var y = 94 + i * 31, a = law.left(r.bits[0], r.bits[1]), b = law.right(r.bits[0], r.bits[1]), active = s.revealing && s.progress > i / 4;
      var visible = !s.challenge || active || !!s.result, clash = visible && a !== b;
      if (a !== b) differ.push(r.bits.join(""));
      text(ctx, r.bits.join("  "), w * .27, y, c, 13); text(ctx, visible ? a : "?", w * .50, y, c, 13, clash || active ? c.fau : c.ink); text(ctx, visible ? b : "?", w * .73, y, c, 13, clash || active ? c.fau : c.ink);
      if (clash) text(ctx, "≠", w * .615, y, c, 14, c.fau);
    });
    if (s.result || !s.challenge) text(ctx, differ.length ? "Rows " + differ.join(", ") + " differ: not an identity" : "Every row agrees", w / 2, h - 30, c, 14);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 52, c, 12);
  }
  function drawNand(ctx, w, h, c, s) {
    text(ctx, "One gate type · several functions", w / 2, 26, c, 16);
    var mode = s.mode || "and";
    if (s.challenge && !s.revealing && !s.result) { box(ctx, "Inputs", 36, 82, 66, 40, c, false, 12); box(ctx, "NAND …", w / 2 - 42, 82, 84, 40, c, false, 12); box(ctx, "?", w - 102, 82, 58, 40, c, false, 12); text(ctx, "Predict the NAND-only construction", w / 2, 147, c, 13, c.muted); if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 31, c, 12); return; }
    if (mode === "not") { box(ctx, "A", 28, 82, 52, 40, c, false); box(ctx, "NAND", w * .43, 82, 76, 40, c, s.revealing, 12); box(ctx, "¬A", w - 88, 82, 56, 40, c, !!s.result, 12); line(ctx, 80, 95, w * .43, 90, c, true); line(ctx, 80, 110, w * .43, 112, c, true); arrow(ctx, w * .43 + 76, 102, w - 88, 102, c, s.revealing); }
    else if (mode === "or") { box(ctx, "¬A", 26, 63, 58, 36, c, false, 12); box(ctx, "¬B", 26, 112, 58, 36, c, false, 12); box(ctx, "NAND", w * .43, 86, 76, 42, c, s.revealing, 12); box(ctx, "A OR B", w - 104, 86, 76, 42, c, !!s.result, 12); arrow(ctx, 84, 81, w * .43, 96, c, true); arrow(ctx, 84, 130, w * .43, 116, c, true); arrow(ctx, w * .43 + 76, 107, w - 104, 107, c, s.revealing); }
    else { var bw = Math.min(70, w * .17), x1 = w * .05, x2 = w * .29, x3 = w * .53, x4 = w * .77, fs = bw < 62 ? 10 : 11; box(ctx, "A,B", x1, 88, bw, 40, c, false, fs + 1); box(ctx, "NAND 1", x2, 88, bw, 40, c, s.revealing && s.progress < .5, fs); box(ctx, "NAND 2", x3, 88, bw, 40, c, s.revealing && s.progress >= .5, fs); box(ctx, "A AND B", x4, 88, bw, 40, c, !!s.result, fs); arrow(ctx, x1 + bw, 108, x2, 108, c, true); arrow(ctx, x2 + bw, 108, x3, 100, c, s.revealing); arrow(ctx, x2 + bw, 108, x3, 118, c, s.revealing); arrow(ctx, x3 + bw, 108, x4, 108, c, s.revealing); }
    text(ctx, s.caption || "NAND output is ¬(A AND B)", w / 2, 163, c, 13, c.muted);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 31, c, 12);
  }
  function inCube(pattern, min) { return pattern.split("").every(function (ch, j) { return ch === "-" || Number(ch) === ((min >> (2 - j)) & 1); }); }
  function drawKmap(ctx, w, h, c, s) {
    var cols = [0, 1, 3, 2], cw = 48, ch = 38, x0 = (w - cw * 4) / 2, y0 = 79, groups = s.cubes || [], dc = s.dc || [];
    text(ctx, "Three-variable Karnaugh map", w / 2, 24, c, 16); text(ctx, "BC in Gray-code order", w / 2, 49, c, 12, c.muted);
    ["00", "01", "11", "10"].forEach(function (lab, j) { text(ctx, lab, x0 + j * cw + cw / 2, 66, c, 12); });
    ["A=0", "A=1"].forEach(function (lab, r) { text(ctx, lab, x0 - 39, y0 + r * ch + ch / 2, c, 11); });
    for (var r = 0; r < 2; r++) for (var j = 0; j < 4; j++) {
      var min = (r << 2) | cols[j], selected = (!s.challenge || s.revealing || !!s.result) && groups.some(function (g) { return inCube(g.pattern, min); });
      box(ctx, dc.indexOf(min) >= 0 ? "d" : (s.minterms || []).indexOf(min) >= 0 ? "1" : "0", x0 + j * cw, y0 + r * ch, cw, ch, c, selected, 14);
    }
    var wraps = (!s.challenge || s.revealing || !!s.result) && groups.some(function (g) { return g.pattern.slice(1) === "-0"; });
    if (wraps) text(ctx, "The outer columns are neighbours: 00 and 10 differ in B only", w / 2, 174, c, 12, c.fau);
    text(ctx, s.result || "Predict a smallest cover", w / 2, 196, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 27, c, 12);
  }
  function drawGraph(ctx, w, h, c, s) {
    var names = "ABC", g = P.obdd(3, s.order, function (a, b, cc) { return a ? b : cc; }), top = 58, bottom = h - 84, step = (bottom - top) / 3, pos = {}, seen = s.challenge ? (s.result ? 4 : s.revealing ? Math.ceil(s.progress * 4) : 0) : 4;
    text(ctx, "Reduced OBDD · order " + s.order.map(function (v) { return names[v]; }).join(", "), w / 2, 25, c, 15);
    if (!seen) { text(ctx, "Build the tree, then merge and remove", w / 2, 110, c, 13, c.muted); if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 48, c, 11); return; }
    s.order.forEach(function (v, lvl) {
      var here = g.nodes.filter(function (n) { return n.v === v; });
      here.forEach(function (n, i) { pos[n.id] = { x: w * (i + 1) / (here.length + 1), y: top + lvl * step, lvl: lvl }; });
    });
    pos[0] = { x: w * .36, y: bottom + 8, lvl: 3 }; pos[1] = { x: w * .64, y: bottom + 8, lvl: 3 };
    g.nodes.forEach(function (n) {
      if (pos[n.id].lvl >= seen) return;
      [[n.lo, true], [n.hi, false]].forEach(function (e) {
        var a = pos[n.id], b = pos[e[0]];
        ctx.setLineDash(e[1] ? [5, 4] : []); line(ctx, a.x, a.y + 12, b.x, b.y - 12, c, false); ctx.setLineDash([]);
      });
    });
    g.nodes.forEach(function (n) { if (pos[n.id].lvl < seen) box(ctx, names[n.v], pos[n.id].x - 16, pos[n.id].y - 12, 32, 24, c, s.revealing, 12); });
    if (seen > 3) [0, 1].forEach(function (t) { box(ctx, t, pos[t].x - 14, pos[t].y - 12, 28, 24, c, false, 12); });
    text(ctx, "Dashed: variable = 0 · solid: variable = 1", w / 2, h - 60, c, 11, c.muted);
    if (s.result) text(ctx, s.result, w / 2, h - 27, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 44, c, 11);
  }
  function drawShannon(ctx, w, h, c, s) {
    if (s.view === "graph") return drawGraph(ctx, w, h, c, s);
    text(ctx, "Shannon expansion · split on A", w / 2, 25, c, 15);
    box(ctx, "A", w / 2 - 27, 52, 54, 34, c, s.revealing && s.progress < .4, 13);
    arrow(ctx, w / 2 - 5, 86, w * .29, 115, c, s.revealing && s.progress >= .3); arrow(ctx, w / 2 + 5, 86, w * .71, 115, c, s.revealing && s.progress >= .3);
    var shown = !s.challenge || (s.revealing && s.progress >= .45) || !!s.result;
    box(ctx, shown ? "C" : "?", w * .29 - 28, 114, 56, 36, c, s.revealing && s.progress >= .45, 12);
    box(ctx, shown ? "B" : "?", w * .71 - 28, 114, 56, 36, c, s.revealing && s.progress >= .45, 12);
    text(ctx, "A=0", w * .29, 160, c, 11, c.muted); text(ctx, "A=1", w * .71, 160, c, 11, c.muted);
    if (s.result) text(ctx, s.result, w / 2, h - 27, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 48, c, 11);
  }
  function drawAnf(ctx, w, h, c, s) {
    var vals = s.values || [0, 1, 1, 0], steps = P.anfSteps(vals), x0 = w / 2 - 92, cell = Math.min(50, (w - 104) / 4), done = !s.challenge || !!s.result, p = s.revealing ? s.progress : 0;
    var rows = [["AB", ["00", "01", "10", "11"], true], ["f", steps[0], true], ["B pass", steps[1], done || p > .3], ["A pass", steps[2], done || p > .65], ["Term", ["1", "B", "A", "AB"], done || p > .65]];
    x0 = (w - cell * 4) / 2 + 22;
    text(ctx, "Truth table → Möbius transform → ANF", w / 2, 26, c, 15);
    rows.forEach(function (row, r) {
      var y = 52 + r * 32; text(ctx, row[0], x0 - 30, y + 13, c, 11, c.muted);
      row[1].forEach(function (v, i) {
        var hot = s.revealing && ((r === 2 && p > .3 && p <= .65 && (i & 1)) || (r === 3 && p > .65 && (i & 2)));
        box(ctx, row[2] ? v : "?", x0 + i * cell, y, cell - 5, 27, c, hot, 12);
      });
    });
    text(ctx, s.revealing && p > .3 ? "Each highlighted cell is XORed with its partner without that variable" : "", w / 2, 216, c, 11, c.muted);
    text(ctx, done ? s.poly : "a₁, a_B, a_A, a_AB ?", w / 2, 238, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 26, c, 12);
  }
  function drawHazard(ctx, w, h, c, s) {
    var left = 52, right = w - 28, y0 = 62, row = 37, p = s.revealing ? s.progress : 1, x = left + (right - left) * p, both = s.y && s.z;
    text(ctx, "Signal handoff · x falls while y=" + s.y + ", z=" + s.z, w / 2, 25, c, 15);
    ["xy", "x′z", "xy+x′z", "with yz"].forEach(function (lab, i) {
      var y = y0 + i * row; text(ctx, lab, left - 24, y, c, 11);
      ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, y + 9); ctx.lineTo(right, y + 9); ctx.stroke();
      var sum = both ? [[0,.25],[.75,1]] : s.y ? [[0,.25]] : s.z ? [[.75,1]] : [];
      var intervals = i === 0 ? (s.y ? [[0,.25]] : []) : i === 1 ? (s.z ? [[.75,1]] : []) : i === 2 ? sum : (s.consensusEnabled && both ? [[0,1]] : sum);
      if (!s.challenge || s.revealing || s.result) intervals.forEach(function (range) {
        if (range[0] < p) line(ctx, left + (right-left)*range[0], y, left + (right-left)*Math.min(range[1], p), y, c, true);
      });
      if (s.revealing) { ctx.fillStyle = c.fau; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill(); }
    });
    text(ctx, s.result || "Predict the output during the handoff", w / 2, h - 25, c, 12);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 46, c, 11);
  }

  function experimentIdentity() {
    var section = document.querySelector('[data-experiment="identity"]'), form = section.querySelector("form"), state = { kind: "identity", law: "absorption" };
    function setLaw() { state.law = form.querySelector("[data-law]").value; state.result = null; queue(section.querySelector("canvas"), state); }
    form.querySelector("[data-law]").addEventListener("change", setLaw); form.querySelector('[data-act="reset"]').addEventListener("click", setLaw);
    register("identity", "1.2 Identity checks", section, form, state, function (show) {
      return [
        standard({ id: "absorption", setup: function () { state.law = "absorption"; } }, state, show, [["no", "No · a counterexample"], ["yes", "Yes · every row"]], "1.2", "For x,y in {0,1}, does x+xy=x hold on every row?", "yes", "If x=0, both sides are 0. If x=1, x+xy is 1 regardless of y; all four rows agree.", "absorption"),
        standard({ id: "demorgan", setup: function () { state.law = "demorgan"; } }, state, show, [["yes", "Yes · every row"], ["no", "No · a counterexample"]], "1.2", "For x,y in {0,1}, is (x+y)' equal to x'y' on every row?", "yes", "The complement of OR is 1 only when both inputs are 0. The product of their complements has exactly that truth table.", "De Morgan"),
        standard({ id: "product-complement", setup: function () { state.law = "product"; } }, state, show, [["yes", "Yes · every row"], ["no", "No · a counterexample"]], "1.2", "For x,y in {0,1}, is (xy)' equal to x'y' on every row?", "no", "Row 01 gives (0·1)'=1 but 1·0=0, and row 10 fails the same way. One row is enough to disprove a law; De Morgan's correct form is (xy)'=x'+y'.", "complement of a product"),
        standard({ id: "dual", setup: function () { state.law = "duality"; } }, state, show, [["no", "No · not a dual"], ["yes", "Yes · a dual law"]], "1.1", "The identity x+x=x is proved. Is x·x=x its dual after swapping + with ·?", "yes", "Duality swaps join with meet, so the idempotence equation becomes x·x=x. It does not complement the variable.", "duality"),
      ];
    }, function () { state.law = form.querySelector("[data-law]").value; queue(section.querySelector("canvas"), state); });
  }
  function experimentNand() {
    var section = document.querySelector('[data-experiment="nand"]'), form = section.querySelector("form"), state = { kind: "nand", mode: "and", caption: "NAND output is ¬(A AND B)" };
    function set() { state.mode = form.querySelector("[data-mode]").value; state.caption = form.querySelector("[data-mode] option:checked").textContent; queue(section.querySelector("canvas"), state); }
    form.querySelector("[data-mode]").addEventListener("change", set); form.querySelector('[data-act="reset"]').addEventListener("click", set);
    var gates = [["1", "1 gate"], ["2", "2 gates"], ["3", "3 gates"]];
    register("nand", "1.3 NAND completeness", section, form, state, function (show) {
      return [
        standard({ id: "not", setup: function () { state.mode="not";state.caption="Tie both NAND inputs to A"; } }, state, show, gates, "1.3", "What is the smallest number of NAND gates that makes NOT A?", "1", "A NAND A is ¬(A·A)=¬A, so one gate is enough.", "NOT from NAND"),
        standard({ id: "and", setup: function () { state.mode="and";state.caption="Invert the first NAND output"; } }, state, show, gates, "1.3", "What is the smallest number of NAND gates that makes A AND B?", "2", "The first gate gives ¬(AB). A second tied-input NAND complements it, giving AB.", "AND from NAND"),
        standard({ id: "or", setup: function () { state.mode="or";state.caption="Invert A and B, then NAND"; } }, state, show, gates, "1.3", "What is the smallest number of NAND gates that makes A OR B?", "3", "Make ¬A and ¬B with two tied-input NANDs, then NAND those outputs: ¬(¬A·¬B)=A+B.", "OR from NAND"),
        standard({ id: "complete", setup: function () { state.mode="and";state.caption="NOT, AND, OR can be built from NAND"; } }, state, show, [["no", "No · only some functions"], ["yes", "Yes · any Boolean function"]], "1.3", "NAND can build NOT, AND, and OR. Is NAND alone functionally complete?", "yes", "Any Boolean formula can be written with NOT, AND, and OR. Replacing each operator by its NAND construction gives a NAND-only implementation.", "NAND is complete"),
      ];
    }, function () { set(); });
  }
  function experimentKmap() {
    var section = document.querySelector('[data-experiment="kmap"]'), form = section.querySelector("form"), state = { kind: "kmap", minterms: [2, 3, 6, 7] };
    var maps = [[2,3,6,7],[4,5,6,7],[1,3,5,7],[1,2,5,6],[0,2,4,6]];
    function cubeText(pattern) { return pattern.split("").map(function (v, i) { return v === "-" ? "" : "ABC"[i] + (v === "0" ? "′" : ""); }).join("") || "1"; }
    function set(m, dc) { state.minterms = m; state.dc = dc || []; state.cubes = P.minimize(m, 3, state.dc); state.result = state.cubes.map(function (c) { return cubeText(c.pattern); }).join(" + "); form.querySelector('[data-out="result"]').textContent = state.result; queue(section.querySelector("canvas"), state); }
    function prepare(m, dc) {
      set(m, dc); state.targetCubes = state.cubes; state.cubes = []; state.result = null;
      state.reveal = function (show, answer) {
        state.revealing = true;
        return Lab.tween(1300, function (t) { state.progress = t; state.cubes = state.targetCubes.slice(0, Math.max(1, Math.ceil(t * state.targetCubes.length))); show(); })
          .then(function () { state.revealing = false; state.cubes = state.targetCubes; state.result = answer; show(); });
      };
    }
    function chosen() { set(maps[Number(form.querySelector("[data-map]").value)]); }
    form.querySelector("[data-map]").addEventListener("change", chosen);
    register("kmap", "1.4 Karnaugh maps", section, form, state, function (show) {
      return [
        standard({ id: "group-four", setup: function () { prepare([2,3,6,7]); } }, state, show, [["A", "A"], ["B", "B"], ["C", "C"]], "1.4", "With A as the most significant bit, f=1 on minterms 2, 3, 6, and 7. Which single literal remains after grouping?", "B", "The rows are 010, 011, 110, and 111. B stays 1 while A and C vary, so both changing variables disappear.", "four-cell group"),
        standard({ id: "wrap-column", setup: function () { prepare([0,2,4,6]); } }, state, show, [["B′", "B′"], ["A′", "A′"], ["C′", "C′"]], "1.4", "With A,B,C as the bit order, f=1 on minterms 0, 2, 4, and 6. Which single literal covers them?", "C′", "Columns 00 and 10 sit at opposite edges, yet they differ only in B, so the group wraps around. A and B vary while C stays 0, leaving C′.", "wraparound group"),
        standard({ id: "dont-care", setup: function () { prepare([1,3,7], [5]); } }, state, show, [["A′C + BC", "A′C + BC"], ["BC", "BC"], ["C", "C"]], "1.4", "In A,B,C order, f=1 on minterms 1, 3, and 7, and minterm 5 is a don't-care. What is the smallest cover?", "C", "Treat 5 as a 1: the rows 001, 011, 101, 111 form a group of four with C fixed. Without the don't-care you would need two terms, A′C + BC.", "don't-care group"),
        standard({ id: "two-pairs", setup: function () { prepare([1,2,5,6]); } }, state, show, [["B′C + BC′", "B′C + BC′"], ["B + C", "B + C"], ["A", "A"]], "1.4", "For minterms 1, 2, 5, and 6 in A,B,C order, which expression covers the true rows with two groups?", "B′C + BC′", "Pair 1 with 5 to get B′C; pair 2 with 6 to get BC′. The two groups cover all four minterms without covering a zero.", "two-cell groups"),
      ];
    }, chosen);
    form.querySelector('[data-act="reset"]').addEventListener("click", chosen);
  }
  function experimentShannon() {
    var section = document.querySelector('[data-experiment="shannon"]'), form = section.querySelector("form"), state = { kind: "shannon", view: "split", order: [0,1,2] };
    var mux = function (a,b,c) { return a ? b : c; };
    function set() { state.view = "graph"; state.order = form.querySelector("[data-order]").value === "abc" ? [0,1,2] : [1,2,0]; state.result = "Reduced OBDD nodes: " + P.obddNodeCount(3, state.order, mux); form.querySelector('[data-out="result"]').textContent = state.result; queue(section.querySelector("canvas"), state); }
    form.querySelector("[data-order]").addEventListener("change", set); form.querySelector('[data-act="reset"]').addEventListener("click", set);
    function split() { state.view = "split"; }
    function graph() { state.view = "graph"; state.order = [0,1,2]; }
    register("shannon", "1.5 Shannon expansion and OBDDs", section, form, state, function (show) {
      return [
        standard({ id: "cofactor-one", setup: split }, state, show, [["C", "C"], ["1", "1"], ["B", "B"]], "1.5", "For f(A,B,C)=A·B+A'·C, what is the cofactor when A=1?", "B", "Set A to 1: the second term becomes 0 and the first becomes B.", "cofactor A=1"),
        standard({ id: "cofactor-zero", setup: split }, state, show, [["B", "B"], ["C", "C"], ["0", "0"]], "1.5", "For f(A,B,C)=A·B+A'·C, what is the cofactor when A=0?", "C", "Set A to 0: the first term becomes 0 and A' becomes 1, leaving C.", "cofactor A=0"),
        standard({ id: "mux-count", setup: graph }, state, show, [["3", "3 nodes"], ["5", "5 nodes"], ["7", "7 nodes"]], "1.5", "Reduce the OBDD for the 2-to-1 mux A?B:C with order A,B,C. How many nonterminal nodes remain?", "3", "The A test selects between B and C, so the reduced graph has one A node and one node for each selected input: three nonterminal nodes.", "reduced mux"),
        standard({ id: "fixed-order", setup: graph, result: "One order, one reduced graph" }, state, show, [["no", "No · several reduced graphs"], ["yes", "Yes · unique for that order"]], "1.5", "Two people reduce OBDDs for A?B:C, both with order A,B,C. Is the reduced graph guaranteed to be the same?", "yes", "Reduction merges identical subgraphs and removes redundant tests until neither applies, and the result depends only on the function and the order. Another order can still give another graph: B,C,A needs five nodes.", "OBDD canonicity"),
      ];
    }, set);
  }
  function experimentAnf() {
    var section = document.querySelector('[data-experiment="anf"]'), form = section.querySelector("form"), state = { kind: "anf", values: [0,1,1,0] };
    var options = [[0,1,1,0],[0,0,0,1],[0,1,1,1]];
    function anfText(c) { var labels = ["1", "B", "A", "AB"], terms = c.map(function (v,i) { return v ? labels[i] : null; }).filter(Boolean); return terms.length ? terms.join(" ⊕ ") : "0"; }
    function set(values) { state.values = values; state.coeff = P.toAnf(values); state.poly = anfText(state.coeff); queue(section.querySelector("canvas"), state); }
    function choose() { set(options[Number(form.querySelector("[data-anf]").value)]); form.querySelector('[data-out="result"]').textContent = state.poly; }
    state.coeff = P.toAnf(state.values); state.poly = anfText(state.coeff);
    form.querySelector("[data-anf]").addEventListener("change", choose); form.querySelector('[data-act="reset"]').addEventListener("click", choose);
    register("anf", "1.5 Algebraic normal form", section, form, state, function (show) {
      return [
        standard({ id: "xor-anf", setup: function () { set(options[0]); } }, state, show, [["AB", "AB"], ["A ⊕ B", "A ⊕ B"], ["A ⊕ B ⊕ AB", "A ⊕ B ⊕ AB"]], "1.5", "The truth-table outputs for rows 00,01,10,11 are 0,1,1,0. What is the ANF?", "A ⊕ B", "The Möbius transform gives coefficients 0,1,1,0 for 1,B,A,AB. Therefore the polynomial is B⊕A, equal to A⊕B.", "XOR normal form"),
        standard({ id: "and-anf", setup: function () { set(options[1]); } }, state, show, [["AB", "AB"], ["A ⊕ B", "A ⊕ B"], ["1 ⊕ A ⊕ B", "1 ⊕ A ⊕ B"]], "1.5", "The outputs for 00,01,10,11 are 0,0,0,1. Which ANF represents the function?", "AB", "Only the coefficient of the monomial AB is 1, so the ANF is AB.", "AND normal form"),
        standard({ id: "or-anf", setup: function () { set(options[2]); } }, state, show, [["A ⊕ B", "A ⊕ B"], ["AB", "AB"], ["A ⊕ B ⊕ AB", "A ⊕ B ⊕ AB"]], "1.5", "The outputs for 00,01,10,11 are 0,1,1,1. Which ANF represents OR?", "A ⊕ B ⊕ AB", "The coefficient vector in order 1,B,A,AB is 0,1,1,1. Over F₂, XOR combines the three selected terms.", "OR normal form"),
        standard({ id: "unique", setup: function () { set(options[0]); }, result: "One coefficient list, one ANF" }, state, show, [["two", "Two ANFs"], ["one", "One ANF"], ["many", "Many ANFs"]], "1.5", "For one Boolean function of A and B, how many algebraic normal forms can it have?", "one", "The monomials form a basis for Boolean functions on these variables. Each function therefore has one unique coefficient list in ANF.", "ANF uniqueness"),
      ];
    }, choose);
  }
  function experimentHazard() {
    var section = document.querySelector('[data-experiment="hazard"]'), form = section.querySelector("form"), state = { kind: "hazard", y: 1, z: 1 };
    function set(y,z) { state.y = y; state.z = z; var r = P.hazard(1,y,z,1,.5); state.result = !(y && z) ? "No static-1 handoff" : state.consensusEnabled && r.consensus ? "yz bridges the gap" : "Gap without consensus"; form.querySelector('[data-out="result"]').textContent = state.result; queue(section.querySelector("canvas"), state); }
    function choose() { var v = form.querySelector("[data-inputs]").value.split("").map(Number); state.consensusEnabled = form.querySelector("[data-consensus]").checked; set(v[0],v[1]); }
    form.querySelector("[data-inputs]").addEventListener("change", choose);
    form.querySelector("[data-consensus]").addEventListener("change", choose);
    function inputs(y, z, on) { return function () { state.y = y; state.z = z; state.consensusEnabled = on; }; }
    register("hazard", "1.6 Static-1 hazards", section, form, state, function (show) {
      return [
        standard({ id: "hazard-present", setup: inputs(1,1,false), result: "Both products are 0 in the gap" }, state, show, [["no", "No · stays at 1"], ["yes", "Yes · a brief drop"]], "1.6", "In f=xy+x'z, let y=z=1 while x changes. Can unequal path delays create a brief 1-to-0 glitch?", "yes", "The output should remain 1 at both endpoints. The xy path can turn off before x'z turns on, leaving a short gap.", "static-1 glitch"),
        standard({ id: "hazard-fixed", setup: inputs(1,1,true), result: "yz bridges the gap" }, state, show, [["yes", "Yes · gap remains"], ["no", "No · yz covers it"]], "1.6", "With y=z=1, add consensus term yz. Does a gap remain in the output during the x handoff?", "no", "The term yz stays 1 throughout the transition, covering the interval when the other two product paths do not overlap.", "consensus coverage"),
        standard({ id: "no-handoff", setup: inputs(0,1,false), result: "The output rises from 0 to 1" }, state, show, [["no", "No · endpoints differ"], ["yes", "Yes"]], "1.6", "Let y=0,z=1 while x goes 1 to 0. The output goes from 0 to 1. Is that a static-1 hazard situation?", "no", "At x=1 the function is 0; at x=0 it is 1. The intended output changes, so this is not a static-1 handoff between two high endpoints.", "output changes"),
        standard({ id: "consensus-identity", setup: inputs(1,1,true), result: "Same stable outputs, safer transition" }, state, show, [["different", "Different truth function"], ["same", "Same truth function"]], "1.6", "Across all Boolean inputs, do xy+x'z+yz and xy+x'z have the same stable truth-table output?", "same", "The consensus theorem makes yz logically redundant. Its role here is to cover a physical transition, not to change the stable Boolean function.", "same logic, safer transition"),
      ];
    }, choose);
    form.querySelector('[data-act="reset"]').addEventListener("click", choose);
  }
  experimentIdentity(); experimentNand(); experimentKmap(); experimentShannon(); experimentAnf(); experimentHazard();
  window.addEventListener("resize", function () { canvases.forEach(function (canvas) { if (canvas._labState) queue(canvas, canvas._labState); }); });
})();
