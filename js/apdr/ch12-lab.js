/* APDR Chapters 1+2: identities, completeness, minimisation, representations, and hazards. */
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
  function standard(s, show, values, ref, prompt, answer, why, short) {
    return { id: s.id, short: short, ref: ref, prompt: prompt, options: values, answer: answer, why: why,
      stage: function () { if (s.setup) s.setup(); s.challenge = true; s.progress = 0; s.revealing = false; s.result = null; s.guess = ""; show(); },
      preview: function (choice) { s.guess = choice; show(); },
      reveal: function () { return s.reveal ? s.reveal(show, answer) : animate(s, show, function () { s.result = answer; }); } };
  }
  function register(id, title, section, form, state, challenges, sandbox) {
    var canvas = section.querySelector("canvas"), show = function () { queue(canvas, state); };
    Lab.experiment({ id: id, title: title, card: section.querySelector(".challenge"), lock: function (on) { lock(form, section, on); },
      setup: function () { state.progress = 0; state.revealing = false; state.result = null; show(); }, sandbox: function () { state.challenge = false; sandbox(); }, challenges: challenges(show) });
    canvases.push(canvas); if (typeof ResizeObserver !== "undefined") { if (!window._apdr12Resize) window._apdr12Resize = new ResizeObserver(function (entries) { entries.forEach(function (e) { var cv = e.target.querySelector("canvas"); if (cv && cv._labState) queue(cv, cv._labState); }); }); window._apdr12Resize.observe(canvas.parentElement); }
  }
  function drawIdentity(ctx, w, h, c, s) {
    if (s.law === "consensus" || s.law === "duality") {
      var shown = s.revealing || !!s.result;
      text(ctx, shown ? (s.law === "consensus" ? "xy + x′z + yz = xy + x′z" : "x + x = x   ⇄   x · x = x") : (s.law === "consensus" ? "Consensus term · yz" : "Duality · swap + and ·"), w / 2, 70, c, 17);
      text(ctx, shown ? (s.law === "consensus" ? "The extra term changes no truth-table row" : "Swap + with ·, and 0 with 1") : "Predict whether the expressions match", w / 2, 112, c, 13, c.muted);
      if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 52, c, 12);
      if (s.result) text(ctx, "The equations are equivalent", w / 2, h - 30, c, 13);
      return;
    }
    var rows = P.truthTable(2, function (x, y) { return s.law === "demorgan" ? P.op("nor", x, y) : P.op("or", x, x && y); });
    text(ctx, s.law === "demorgan" ? "De Morgan · both sides" : "Absorption · both sides", w / 2, 27, c, 16);
    ["x y", "left", "right"].forEach(function (v, i) { text(ctx, v, w * (.27 + .23 * i), 62, c, 13); });
    rows.forEach(function (r, i) {
      var y = 94 + i * 31, left = s.law === "demorgan" ? Number(!r.bits[0] && !r.bits[1]) : Number(r.bits[0] || (r.bits[0] && r.bits[1])), right = s.law === "demorgan" ? Number(!(r.bits[0] || r.bits[1])) : r.bits[0];
      var visible = !s.challenge || s.revealing && s.progress > i / 4 || !!s.result;
      text(ctx, r.bits.join("  "), w * .27, y, c, 13); text(ctx, visible ? left : "?", w * .50, y, c, 13, s.revealing && s.progress > i / 4 ? c.fau : c.ink); text(ctx, visible ? right : "?", w * .73, y, c, 13, s.revealing && s.progress > i / 4 ? c.fau : c.ink);
    });
    if (s.result) text(ctx, "Every row agrees", w / 2, h - 30, c, 14);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 52, c, 12);
  }
  function drawNand(ctx, w, h, c, s) {
    text(ctx, "One gate type · several functions", w / 2, 26, c, 16);
    var mode = s.mode || "and";
    if (s.challenge && !s.revealing && !s.result) { box(ctx, "A", 44, 82, 58, 40, c, false); box(ctx, "NAND", w / 2 - 42, 82, 84, 40, c, false, 12); box(ctx, "?", w - 102, 82, 58, 40, c, false, 12); text(ctx, "Predict the NAND-only construction", w / 2, 147, c, 13, c.muted); if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 31, c, 12); return; }
    if (mode === "not") { box(ctx, "A", 28, 82, 52, 40, c, false); box(ctx, "NAND", w * .43, 82, 76, 40, c, s.revealing, 12); box(ctx, "¬A", w - 88, 82, 56, 40, c, !!s.result, 12); line(ctx, 80, 95, w * .43, 90, c, true); line(ctx, 80, 110, w * .43, 112, c, false); arrow(ctx, w * .43 + 76, 102, w - 88, 102, c, s.revealing); }
    else if (mode === "or") { box(ctx, "¬A", 26, 63, 58, 36, c, false, 12); box(ctx, "¬B", 26, 112, 58, 36, c, false, 12); box(ctx, "NAND", w * .43, 86, 76, 42, c, s.revealing, 12); box(ctx, "A OR B", w - 104, 86, 76, 42, c, !!s.result, 12); arrow(ctx, 84, 81, w * .43, 96, c, true); arrow(ctx, 84, 130, w * .43, 116, c, true); arrow(ctx, w * .43 + 76, 107, w - 104, 107, c, s.revealing); }
    else { box(ctx, "A,B", 25, 88, 62, 40, c, false); box(ctx, "NAND 1", w * .34, 88, 70, 40, c, s.revealing && s.progress < .5, 11); box(ctx, "NAND 2", w * .68, 88, 70, 40, c, s.revealing && s.progress >= .5, 11); box(ctx, "A AND B", w - 82, 88, 76, 40, c, !!s.result, 11); arrow(ctx, 87, 108, w * .34, 108, c, true); arrow(ctx, w * .34 + 70, 108, w * .68, 100, c, s.revealing); arrow(ctx, w * .34 + 70, 108, w * .68, 118, c, false); arrow(ctx, w * .68 + 70, 108, w - 82, 108, c, s.revealing); }
    text(ctx, s.caption || "NAND output is ¬(A AND B)", w / 2, 163, c, 13, c.muted);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 31, c, 12);
  }
  function drawKmap(ctx, w, h, c, s) {
    var cols = [0, 1, 3, 2], cw = 48, ch = 38, x0 = (w - cw * 4) / 2, y0 = 79, groups = s.cubes || [];
    text(ctx, "Three-variable Karnaugh map", w / 2, 24, c, 16); text(ctx, "BC in Gray-code order", w / 2, 49, c, 12, c.muted);
    ["00", "01", "11", "10"].forEach(function (label, j) { text(ctx, label, x0 + j * cw + cw / 2, 66, c, 12); });
    ["A=0", "A=1"].forEach(function (label, r) { text(ctx, label, x0 - 39, y0 + r * ch + ch / 2, c, 11); });
    for (var r = 0; r < 2; r++) for (var j = 0; j < 4; j++) {
      var min = (r << 2) | cols[j], selected = (!s.challenge || s.revealing || !!s.result) && groups.some(function (g) { return g.covered.indexOf(min) >= 0; });
      box(ctx, (s.minterms || []).indexOf(min) >= 0 ? "1" : "0", x0 + j * cw, y0 + r * ch, cw, ch, c, selected, 14);
    }
    text(ctx, s.result || "Predict a smallest cover", w / 2, 174, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 27, c, 12);
  }
  function drawShannon(ctx, w, h, c, s) {
    var isMux = s.fn === "mux";
    text(ctx, "Shannon expansion · split on a variable", w / 2, 25, c, 15);
    box(ctx, isMux ? "A" : "A?", w / 2 - 27, 52, 54, 34, c, s.revealing && s.progress < .4, 13);
    arrow(ctx, w / 2 - 5, 86, w * .29, 115, c, s.revealing && s.progress >= .3); arrow(ctx, w / 2 + 5, 86, w * .71, 115, c, s.revealing && s.progress >= .3);
    var shown = !s.challenge || s.revealing || !!s.result;
    box(ctx, shown ? (isMux ? "C" : "B") : "?", w * .29 - 28, 114, 56, 36, c, s.revealing && s.progress >= .45, 12);
    box(ctx, shown ? (isMux ? "B" : "1") : "?", w * .71 - 28, 114, 56, 36, c, s.revealing && s.progress >= .45, 12);
    text(ctx, "A=0", w * .29, 160, c, 11, c.muted); text(ctx, "A=1", w * .71, 160, c, 11, c.muted);
    if (s.result) text(ctx, s.result, w / 2, h - 27, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 48, c, 11);
  }
  function drawAnf(ctx, w, h, c, s) {
    var vals = s.values || [0, 1, 1, 0], coeff = s.coeff || [], labels = ["00", "01", "10", "11"], x0 = w / 2 - 130;
    text(ctx, "Truth table → Möbius transform → ANF", w / 2, 26, c, 15);
    labels.forEach(function (label, i) { box(ctx, label, x0 + i * 65, 67, 56, 34, c, s.revealing && s.progress > i / 4, 12); box(ctx, vals[i], x0 + i * 65, 105, 56, 30, c, false, 13); });
    arrow(ctx, w * .32, 148, w * .68, 148, c, s.revealing);
    text(ctx, !s.challenge || s.result ? s.poly : "a₀₀, a₀₁, a₁₀, a₁₁", w / 2, 174, c, 13);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 26, c, 12);
  }
  function drawHazard(ctx, w, h, c, s) {
    var left = 52, right = w - 28, y0 = 62, row = 37, p = s.revealing ? s.progress : 0, x = left + (right - left) * p;
    text(ctx, "Signal handoff · x changes while y=" + s.y + ", z=" + s.z, w / 2, 25, c, 15);
    ["xy", "x′z", "xy+x′z", "+ yz"].forEach(function (label, i) {
      var y = y0 + i * row; text(ctx, label, left - 24, y, c, 11);
      ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, y + 9); ctx.lineTo(right, y + 9); ctx.stroke();
      var intervals = i === 0 ? (s.y ? [[0,.25]] : []) : i === 1 ? (s.z ? [[.75,1]] : []) : null;
      if (i === 2) intervals = (s.y && s.z) ? [[0,.25],[.75,1]] : s.y ? [[0,.25]] : s.z ? [[.75,1]] : [];
      if (i === 3) intervals = s.consensusEnabled && s.y && s.z ? [[0,1]] : ((s.y && s.z) ? [[0,.25],[.75,1]] : s.y ? [[0,.25]] : s.z ? [[.75,1]] : []);
      if (!s.challenge || s.revealing || s.result) {
        intervals.forEach(function (range) { line(ctx, left + (right-left)*range[0], y, left + (right-left)*range[1], y, c, true); });
      }
      if (s.revealing) { ctx.fillStyle = c.fau; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill(); }
    });
    text(ctx, s.result || "The added yz term stays high through the handoff", w / 2, h - 25, c, 12);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 46, c, 11);
  }

  function experimentIdentity() {
    var section = document.querySelector('[data-experiment="identity"]'), form = section.querySelector("form"), state = { kind: "identity", law: "absorption" };
    function setLaw() { state.law = form.querySelector("[data-law]").value; state.result = null; queue(section.querySelector("canvas"), state); }
    form.querySelector("[data-law]").addEventListener("change", setLaw); form.querySelector('[data-act="reset"]').addEventListener("click", setLaw);
    register("identity", "1.2 Identity checks", section, form, state, function (show) {
      return [
        standard({ id: "absorption", short: "absorption", setup: function () { state.law = "absorption"; } }, show, [["yes", "Yes · every row"], ["no", "No · a counterexample"]], "1.2", "For x,y in {0,1}, does x+xy=x hold on every row?", "yes", "If x=0, both sides are 0. If x=1, x+xy is 1 regardless of y; all four rows agree.", "absorption"),
        standard({ id: "demorgan", short: "De Morgan", setup: function () { state.law = "demorgan"; } }, show, [["yes", "Yes · every row"], ["no", "No · a counterexample"]], "1.2", "For x,y in {0,1}, is (x+y)' equal to x'y' on every row?", "yes", "The complement of OR is 1 only when both inputs are 0. The product of their complements has exactly that truth table.", "De Morgan"),
        standard({ id: "consensus", short: "consensus", setup: function () { state.law = "consensus"; } }, show, [["yes", "Yes · equivalent"], ["no", "No · different rows"]], "1.2", "For x,y,z in {0,1}, does xy+x'z+yz simplify to xy+x'z?", "yes", "The consensus term yz adds no new true row. It is logically redundant, though it matters for circuit hazards in §1.6.", "consensus"),
        standard({ id: "dual", short: "duality", setup: function () { state.law = "duality"; } }, show, [["yes", "Yes · a dual law"], ["no", "No · not a dual"]], "1.1", "The identity x+x=x is proved. Is x·x=x its dual after swapping + with ·?", "yes", "Duality swaps join with meet, so the idempotence equation becomes x·x=x. It does not complement the variable.", "duality"),
      ];
    }, function () { state.law = form.querySelector("[data-law]").value; queue(section.querySelector("canvas"), state); });
  }
  function experimentNand() {
    var section = document.querySelector('[data-experiment="nand"]'), form = section.querySelector("form"), state = { kind: "nand", mode: "and", caption: "NAND output is ¬(A AND B)" };
    function set() { state.mode = form.querySelector("[data-mode]").value; state.caption = form.querySelector("[data-mode] option:checked").textContent; queue(section.querySelector("canvas"), state); }
    form.querySelector("[data-mode]").addEventListener("change", set); form.querySelector('[data-act="reset"]').addEventListener("click", set);
    register("nand", "1.3 NAND completeness", section, form, state, function (show) {
      return [
        standard({ id: "not", short: "make NOT", setup: function () { state.mode="not";state.caption="Tie both NAND inputs to A"; } }, show, [["1", "1 gate"], ["2", "2 gates"], ["3", "3 gates"]], "1.3", "Use one NAND gate with its two inputs tied to A. How many gates make NOT A?", "1", "A NAND A is ¬(A·A)=¬A, so one gate is enough.", "NOT from NAND"),
        standard({ id: "and", short: "make AND", setup: function () { state.mode="and";state.caption="Invert the first NAND output"; } }, show, [["1", "1 gate"], ["2", "2 gates"], ["3", "3 gates"]], "1.3", "Use a NAND gate, then invert its output with a tied-input NAND. How many gates make A AND B?", "2", "The first gate gives ¬(AB). A second tied-input NAND complements it, giving AB.", "AND from NAND"),
        standard({ id: "or", short: "make OR", setup: function () { state.mode="or";state.caption="Invert A and B, then NAND"; } }, show, [["1", "1 gate"], ["2", "2 gates"], ["3", "3 gates"]], "1.3", "Use De Morgan’s law and tied-input NANDs. How many gates make A OR B?", "3", "Make ¬A and ¬B with two tied-input NANDs, then NAND those outputs: ¬(¬A·¬B)=A+B.", "OR from NAND"),
        standard({ id: "complete", short: "completeness", setup: function () { state.mode="and";state.caption="NOT, AND, OR can be built from NAND"; } }, show, [["yes", "Yes · any Boolean function"], ["no", "No · only some functions"]], "1.3", "NAND can build NOT, AND, and OR. Is NAND alone functionally complete?", "yes", "Any Boolean formula can be written with NOT, AND, and OR. Replacing each operator by its NAND construction gives a NAND-only implementation.", "NAND is complete"),
      ];
    }, function () { set(); });
  }
  function experimentKmap() {
    var section = document.querySelector('[data-experiment="kmap"]'), form = section.querySelector("form"), state = { kind: "kmap", minterms: [2, 3, 6, 7] };
    function cubeText(pattern) { return pattern.split("").map(function (v, i) { return v === "-" ? "" : "ABC"[i] + (v === "0" ? "′" : ""); }).join("") || "1"; }
    function set(m) { state.minterms = m; state.cubes = P.minimize(m, 3); state.result = state.cubes.map(function (c) { return cubeText(c.pattern); }).join(" + "); form.querySelector('[data-out="result"]').textContent = state.result; queue(section.querySelector("canvas"), state); }
    function prepare(m) {
      set(m); state.targetCubes = state.cubes; state.cubes = []; state.result = null;
      state.reveal = function (show, answer) {
        state.revealing = true;
        return Lab.tween(1300, function (t) { state.progress = t; state.cubes = state.targetCubes.slice(0, Math.max(1, Math.ceil(t * state.targetCubes.length))); show(); })
          .then(function () { state.revealing = false; state.cubes = state.targetCubes; state.result = answer; show(); });
      };
    }
    form.querySelector("[data-map]").addEventListener("change", function () { var i = Number(form.querySelector("[data-map]").value); set([[2,3,6,7],[4,5,6,7],[1,3,5,7],[1,2,5,6]][i]); });
    register("kmap", "1.4 Karnaugh maps", section, form, state, function (show) {
      return [
        standard({ id: "group-four", short: "group of four", setup: function () { prepare([2,3,6,7]); } }, show, [["B", "B"], ["A", "A"], ["C", "C"]], "1.4", "With A as the most significant bit, f=1 on minterms 2, 3, 6, and 7. Which single literal remains after grouping?", "B", "The rows are 010, 011, 110, and 111. B stays 1 while A and C vary, so both changing variables disappear.", "four-cell group"),
        standard({ id: "row-group", short: "row group", setup: function () { prepare([4,5,6,7]); } }, show, [["A", "A"], ["B", "B"], ["C", "C"]], "1.4", "In a three-variable map, f=1 on minterms 4, 5, 6, and 7. Which literal covers that group?", "A", "Those rows are 100 through 111. A remains 1 while B and C vary, leaving the implicant A.", "row group"),
        standard({ id: "wrap-group", short: "Gray-code adjacency", setup: function () { prepare([1,3,5,7]); } }, show, [["A", "A"], ["B", "B"], ["C", "C"]], "1.4", "With A,B,C as the bit order, f=1 on minterms 1, 3, 5, and 7. Which literal is always 1?", "C", "The four odd-index rows end in bit 1. They form a 2×2 group, so A and B vary while C remains.", "Gray-code group"),
        standard({ id: "two-pairs", short: "two implicants", setup: function () { prepare([1,2,5,6]); } }, show, [["B′C + BC′", "B′C + BC′"], ["B + C", "B + C"], ["A", "A"]], "1.4", "For minterms 1, 2, 5, and 6 in A,B,C order, which expression covers the true rows with two groups?", "B′C + BC′", "Pair 1 with 5 to get B′C; pair 2 with 6 to get BC′. The two groups cover all four minterms without covering a zero.", "two-cell groups"),
      ];
    }, function () { set([[2,3,6,7],[4,5,6,7],[1,3,5,7],[1,2,5,6]][Number(form.querySelector("[data-map]").value)]); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { set([[2,3,6,7],[4,5,6,7],[1,3,5,7],[1,2,5,6]][Number(form.querySelector("[data-map]").value)]); });
  }
  function experimentShannon() {
    var section = document.querySelector('[data-experiment="shannon"]'), form = section.querySelector("form"), state = { kind: "shannon", fn: "mux", order: [0,1,2] };
    var mux = function (a,b,c) { return a ? b : c; };
    function set() { state.fn = form.querySelector("[data-function]").value; state.order = form.querySelector("[data-order]").value === "abc" ? [0,1,2] : [1,2,0]; state.result = "Reduced OBDD nodes: " + P.obddNodeCount(3, state.order, mux); form.querySelector('[data-out="result"]').textContent = state.result; queue(section.querySelector("canvas"), state); }
    form.querySelectorAll("[data-function],[data-order]").forEach(function (el) { el.addEventListener("change", set); }); form.querySelector('[data-act="reset"]').addEventListener("click", set);
    register("shannon", "1.5 Shannon expansion and OBDDs", section, form, state, function () {
      return [
        standard({ id: "cofactor-one", short: "A=1 cofactor", setup: function () { state.fn="mux"; } }, function () { state.fn = "mux"; queue(section.querySelector("canvas"), state); }, [["B", "B"], ["C", "C"], ["1", "1"]], "1.5", "For f(A,B,C)=A·B+A'·C, what is the cofactor when A=1?", "B", "Set A to 1: the second term becomes 0 and the first becomes B.", "cofactor A=1"),
        standard({ id: "cofactor-zero", short: "A=0 cofactor", setup: function () { state.fn="mux"; } }, function () { state.fn = "mux"; queue(section.querySelector("canvas"), state); }, [["B", "B"], ["C", "C"], ["0", "0"]], "1.5", "For f(A,B,C)=A·B+A'·C, what is the cofactor when A=0?", "C", "Set A to 0: the first term becomes 0 and A' becomes 1, leaving C.", "cofactor A=0"),
        standard({ id: "mux-count", short: "MUX node count", setup: function () { state.fn="mux";state.order=[0,1,2]; } }, function () { state.fn = "mux"; state.order = [0,1,2]; queue(section.querySelector("canvas"), state); }, [["3", "3 nodes"], ["5", "5 nodes"], ["7", "7 nodes"]], "1.5", "Reduce the OBDD for the 2-to-1 mux A?B:C with order A,B,C. How many nonterminal nodes remain?", "3", "The A test selects between B and C, so the reduced graph has one A node and one node for each selected input: three nonterminal nodes.", "reduced mux"),
        standard({ id: "fixed-order", short: "fixed variable order", setup: function () { state.fn="mux";state.order=[1,2,0]; } }, function () { state.fn = "mux"; state.order = [1,2,0]; queue(section.querySelector("canvas"), state); }, [["same", "Same reduced graph"], ["different", "A different graph"]], "1.5", "For the same Boolean function, is a reduced OBDD guaranteed to be unique when the variable order is fixed?", "same", "Reduction merges identical subgraphs and removes redundant tests. Canonicity applies after the variable order is fixed.", "OBDD canonicity"),
      ];
    }, function () { set(); });
  }
  function experimentAnf() {
    var section = document.querySelector('[data-experiment="anf"]'), form = section.querySelector("form"), state = { kind: "anf", values: [0,1,1,0] };
    var options = [[0,1,1,0],[0,0,0,1],[0,1,1,1]];
    function set(values) { state.values = values; state.coeff = P.toAnf(values); state.poly = anfText(state.coeff); queue(section.querySelector("canvas"), state); }
    function anfText(c) { var labels = ["1", "B", "A", "AB"], terms = c.map(function (v,i) { return v ? labels[i] : null; }).filter(Boolean); return terms.length ? terms.join(" ⊕ ") : "0"; }
    function choose() { set(options[Number(form.querySelector("[data-anf]").value)]); form.querySelector('[data-out="result"]').textContent = state.poly; }
    form.querySelector("[data-anf]").addEventListener("change", choose); form.querySelector('[data-act="reset"]').addEventListener("click", choose);
    register("anf", "1.5 Algebraic normal form", section, form, state, function (show) {
      return [
        standard({ id: "xor-anf", short: "XOR in ANF", setup: function () { set(options[0]); } }, show, [["A ⊕ B", "A ⊕ B"], ["AB", "AB"], ["A ⊕ B ⊕ AB", "A ⊕ B ⊕ AB"]], "1.5", "The truth-table outputs for rows 00,01,10,11 are 0,1,1,0. What is the ANF?", "A ⊕ B", "The Möbius transform gives coefficients 0,1,1,0 for 1,B,A,AB. Therefore the polynomial is B⊕A, equal to A⊕B.", "XOR normal form"),
        standard({ id: "and-anf", short: "AND in ANF", setup: function () { set(options[1]); } }, show, [["AB", "AB"], ["A ⊕ B", "A ⊕ B"], ["1 ⊕ A ⊕ B", "1 ⊕ A ⊕ B"]], "1.5", "The outputs for 00,01,10,11 are 0,0,0,1. Which ANF represents the function?", "AB", "Only the coefficient of the monomial AB is 1, so the ANF is AB.", "AND normal form"),
        standard({ id: "or-anf", short: "OR in ANF", setup: function () { set(options[2]); } }, show, [["A ⊕ B ⊕ AB", "A ⊕ B ⊕ AB"], ["A ⊕ B", "A ⊕ B"], ["AB", "AB"]], "1.5", "The outputs for 00,01,10,11 are 0,1,1,1. Which ANF represents OR?", "A ⊕ B ⊕ AB", "The coefficient vector in order 1,B,A,AB is 0,1,1,1. Over F₂, XOR combines the three selected terms.", "OR normal form"),
        standard({ id: "unique", short: "unique coefficients", setup: function () { set(options[0]); } }, show, [["one", "One ANF"], ["two", "Two ANFs"], ["many", "Many ANFs"]], "1.5", "For one Boolean function of A and B, how many algebraic normal forms can it have?", "one", "The monomials form a basis for Boolean functions on these variables. Each function therefore has one unique coefficient list in ANF.", "ANF uniqueness"),
      ];
    }, function () { set(options[Number(form.querySelector("[data-anf]").value)]); });
  }
  function experimentHazard() {
    var section = document.querySelector('[data-experiment="hazard"]'), form = section.querySelector("form"), state = { kind: "hazard", y: 1, z: 1 };
    function set(y,z) { state.y = y; state.z = z; var r = P.hazard(1,y,z,1,.5); state.result = r.products ? "No gap" : state.consensusEnabled && r.consensus ? "yz bridges the gap" : y && z ? "Gap without consensus" : "No static-1 handoff"; form.querySelector('[data-out="result"]').textContent = state.result; queue(section.querySelector("canvas"), state); }
    function choose() { var v = form.querySelector("[data-inputs]").value.split("").map(Number); state.consensusEnabled = form.querySelector("[data-consensus]").checked; set(v[0],v[1]); }
    form.querySelector("[data-inputs]").addEventListener("change", choose);
    form.querySelector("[data-consensus]").addEventListener("change", choose);
    register("hazard", "1.6 Static-1 hazards", section, form, state, function () {
      return [
        standard({ id: "hazard-present", short: "hazard without consensus", setup: function () { state.y=1;state.z=1;state.consensusEnabled=false; } }, function () { state.y=1; state.z=1; state.consensusEnabled=false; queue(section.querySelector("canvas"),state); }, [["yes", "Yes · a brief drop"], ["no", "No · stays at 1"]], "1.6", "In f=xy+x'z, let y=z=1 while x changes. Can unequal path delays create a brief 1-to-0 glitch?", "yes", "The output should remain 1 at both endpoints. The xy path can turn off before x'z turns on, leaving a short gap.", "static-1 glitch"),
        standard({ id: "hazard-fixed", short: "add consensus", setup: function () { state.y=1;state.z=1;state.consensusEnabled=true; } }, function () { state.y=1; state.z=1; state.consensusEnabled=true; queue(section.querySelector("canvas"),state); }, [["yes", "Yes · gap remains"], ["no", "No · yz covers it"]], "1.6", "With y=z=1, add consensus term yz. Does it prevent the output glitch during the x handoff?", "no", "The term yz stays 1 throughout the transition, covering the interval when the other two product paths do not overlap.", "consensus coverage"),
        standard({ id: "no-handoff", short: "no static handoff", setup: function () { state.y=0;state.z=1; } }, function () { state.y=0; state.z=1; queue(section.querySelector("canvas"),state); }, [["yes", "Yes · a hazard"], ["no", "No · output should change"]], "1.6", "Let y=0,z=1 while x changes from 1 to 0. Is a temporary 1-to-0 drop a static-1 hazard?", "no", "At x=1 the function is 0; at x=0 it is 1. The intended output changes, so this is not a static-1 handoff between two high endpoints.", "output changes"),
        standard({ id: "consensus-identity", short: "logical equivalence", setup: function () { state.y=1;state.z=1; } }, function () { state.y=1;state.z=1;queue(section.querySelector("canvas"),state); }, [["same", "Same truth function"], ["different", "Different truth function"]], "1.6", "Across all Boolean inputs, do xy+x'z+yz and xy+x'z have the same stable truth-table output?", "same", "The consensus theorem makes yz logically redundant. Its role here is to cover a physical transition, not to change the stable Boolean function.", "same logic, safer transition"),
      ];
    }, choose);
    form.querySelector('[data-act="reset"]').addEventListener("click", choose);
  }
  experimentIdentity(); experimentNand(); experimentKmap(); experimentShannon(); experimentAnf(); experimentHazard();
  window.addEventListener("resize", function () { canvases.forEach(function (canvas) { if (canvas._labState) queue(canvas, canvas._labState); }); });
})();
