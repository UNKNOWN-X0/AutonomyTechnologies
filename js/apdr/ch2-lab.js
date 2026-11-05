/* APDR Chapter 2: algorithm, Boolean decision, NAND, and signal timing experiments. */
(function () {
  var P = window.APDR2,
    canvases = [];

  function colours(stage) {
    var s = getComputedStyle(stage);
    return {
      paper: s.getPropertyValue("--paper").trim(),
      panel: s.getPropertyValue("--paper-2").trim(),
      ink: s.getPropertyValue("--ink").trim(),
      muted: s.getPropertyValue("--muted").trim(),
      line: s.getPropertyValue("--line").trim(),
      fau: s.getPropertyValue("--fau-mark").trim(),
      course: s.getPropertyValue("--course").trim(),
      act: s.getPropertyValue("--act").trim(),
      font: s.getPropertyValue("--f-display").trim(),
    };
  }

  function queue(canvas, state) {
    canvas._labState = state;
    if (canvas._paint) cancelAnimationFrame(canvas._paint);
    canvas._paint = requestAnimationFrame(function () {
      canvas._paint = 0;
      var rect = canvas.parentElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2),
        ctx = canvas.getContext("2d"),
        c = colours(canvas.parentElement);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = c.paper;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (state.kind === "algorithm") drawAlgorithm(ctx, rect.width, rect.height, c, state);
      if (state.kind === "logic") drawLogic(ctx, rect.width, rect.height, c, state);
      if (state.kind === "nand") drawNand(ctx, rect.width, rect.height, c, state);
      if (state.kind === "timing") drawTiming(ctx, rect.width, rect.height, c, state);
      if (state.kind === "equivalent") drawEquivalent(ctx, rect.width, rect.height, c, state);
    });
  }

  function text(ctx, value, x, y, c, size, align) {
    ctx.fillStyle = c.ink;
    ctx.font = "600 " + (size || 14) + "px " + (c.font || "sans-serif");
    ctx.textAlign = align || "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(value), x, y);
  }

  function box(ctx, label, x, y, w, h, c, active, size) {
    ctx.fillStyle = active ? c.panel : c.paper;
    ctx.strokeStyle = active ? c.fau : c.line;
    ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    text(ctx, label, x + w / 2, y + h / 2, c, size || 13);
  }

  function wire(ctx, x1, y1, x2, y2, c, strong) {
    ctx.strokeStyle = strong ? c.fau : c.muted;
    ctx.lineWidth = strong ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1), l = 7;
    ctx.fillStyle = strong ? c.fau : c.muted;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - l * Math.cos(a - 0.45), y2 - l * Math.sin(a - 0.45));
    ctx.lineTo(x2 - l * Math.cos(a + 0.45), y2 - l * Math.sin(a + 0.45));
    ctx.closePath();
    ctx.fill();
  }

  function drawAlgorithm(ctx, w, h, c, s) {
    var x = 18, gap = 22, y = 58, bh = 62, bw = (w - 36 - gap * 3) / 4,
      labels = ["Guess g", "Test g²≈x", "Stop?", "Update g"],
      active = Math.min(3, Math.floor((s.progress || 0) * 4));
    text(ctx, "Square-root iteration", w / 2, 25, c, 17);
    labels.forEach(function (label, i) {
      var bx = x + i * (bw + gap);
      box(ctx, label, bx, y, bw, bh, c, i === active && !!s.revealing, 12);
      if (i < 3) wire(ctx, bx + bw, y + bh / 2, bx + bw + gap, y + bh / 2, c, i === active && !!s.revealing);
    });
    var stopX = x + 2.5 * bw + 2 * gap, testX = x + 1.5 * bw + gap, updateX = x + 3.5 * bw + 3 * gap, backY = y + bh + 14;
    wire(ctx, stopX, y, stopX, y - 12, c, false);
    text(ctx, "yes: output g", stopX, y - 20, c, 11);
    text(ctx, "no", x + 3 * bw + 2.5 * gap, y + bh / 2 - 12, c, 11);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(updateX, y + bh); ctx.lineTo(updateX, backY); ctx.lineTo(testX, backY); ctx.stroke();
    wire(ctx, testX, backY, testX, y + bh, c, false);
    text(ctx, "g ← (g + x/g) / 2", w / 2, y + bh + 42, c, 15);
    text(ctx, "x = " + (s.x == null ? 16 : s.x) + "     g = " + (s.g == null ? 3 : Number(s.g).toFixed(3)), w / 2, h - 96, c, 14);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 70, c, 13);
    if (s.result) text(ctx, "Result: " + s.result, w / 2, h - 48, c, 13);
  }

  function drawLogic(ctx, w, h, c, s) {
    var vals = s.bits || { car: false, forecast: false, rain: false },
      top = 46, inputX = 16, inputW = 54, inputH = 36,
      gateW = Math.min(72, w * 0.19), gateH = 38,
      gateX = w * 0.39 - gateW / 2, andX = w * 0.67 - gateW / 2,
      outputX = w - 48;
    text(ctx, "U = NOT C AND (W OR R)", w / 2, 25, c, 17);
    ["car", "forecast", "rain"].forEach(function (key, i) {
      var y = top + i * 50;
      box(ctx, ["C", "W", "R"][i] + " = " + Number(!!vals[key]), inputX, y, inputW, inputH, c, false, 12);
    });
    box(ctx, "NOT C", gateX, top, gateW, gateH, c, s.revealing && s.progress > 0.25, 12);
    box(ctx, "W OR R", gateX, top + 100, gateW, gateH, c, s.revealing && s.progress > 0.25, 11);
    box(ctx, "AND", andX, top + 50, gateW, gateH, c, s.revealing && s.progress > 0.55, 13);
    wire(ctx, inputX + inputW, top + inputH / 2, gateX, top + gateH / 2, c, false);
    wire(ctx, inputX + inputW, top + 50 + inputH / 2, gateX, top + 100 + gateH / 2 - 9, c, false);
    wire(ctx, inputX + inputW, top + 100 + inputH / 2, gateX, top + 100 + gateH / 2 + 9, c, false);
    wire(ctx, gateX + gateW, top + gateH / 2, andX, top + 50 + gateH / 2 - 9, c, s.revealing && s.progress > 0.35);
    wire(ctx, gateX + gateW, top + 100 + gateH / 2, andX, top + 50 + gateH / 2 + 9, c, s.revealing && s.progress > 0.55);
    wire(ctx, andX + gateW, top + 50 + gateH / 2, outputX, top + 50 + gateH / 2, c, s.revealing && s.progress > 0.8);
    box(ctx, "U = " + (s.result == null ? "?" : Number(s.result)), outputX, top + 50 + 1, 44, 36, c, !!s.result, 11);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 69, c, 12);
    if (s.note) text(ctx, s.note, w / 2, h - 49, c, 12);
  }

  function drawNand(ctx, w, h, c, s) {
    var mode = s.fn || "and", a = !!s.a, b = !!s.b, y = 55, bw = 72, bh = 42;
    text(ctx, "Build the function from NAND gates", w / 2, 24, c, 16);
    text(ctx, "A = " + Number(a), 32, y + 21, c, 13, "left");
    if (mode !== "not") text(ctx, "B = " + Number(b), 32, y + 84, c, 13, "left");
    if (mode === "nand") {
      box(ctx, "NAND", w * 0.47 - bw / 2, y + 30, bw, bh, c, s.revealing && s.progress > 0.35, 12);
      wire(ctx, 70, y + 21, w * 0.47 - bw / 2, y + 42, c, true);
      wire(ctx, 70, y + 84, w * 0.47 - bw / 2, y + 60, c, true);
      wire(ctx, w * 0.47 + bw / 2, y + 51, w - 67, y + 51, c, true);
      box(ctx, s.result == null ? "?" : "= " + Number(s.result), w - 63, y + 30, 58, bh, c, !!s.result, 12);
    } else if (mode === "not") {
      box(ctx, "NAND", w * 0.47 - bw / 2, y + 12, bw, bh, c, s.revealing && s.progress > 0.35, 12);
      text(ctx, "A", w * 0.29, y + 25, c, 13);
      wire(ctx, 68, y + 21, w * 0.47 - bw / 2, y + 25, c, true);
      wire(ctx, 68, y + 21, w * 0.47 - bw / 2, y + 40, c, false);
      wire(ctx, w * 0.47 + bw / 2, y + 33, w - 67, y + 33, c, true);
      box(ctx, s.result == null ? "NOT A" : "= " + Number(s.result), w - 63, y + 12, 58, bh, c, !!s.result, 12);
      text(ctx, "A NAND A = NOT A", w / 2, y + 113, c, 13);
    } else if (mode === "and") {
      box(ctx, "NAND 1", w * 0.39 - bw / 2, y + 24, bw, bh, c, s.revealing && s.progress < 0.55, 11);
      box(ctx, "NAND 2", w * 0.69 - bw / 2, y + 24, bw, bh, c, s.revealing && s.progress >= 0.55, 11);
      wire(ctx, 70, y + 21, w * 0.39 - bw / 2, y + 34, c, true);
      wire(ctx, 70, y + 84, w * 0.39 - bw / 2, y + 55, c, true);
      wire(ctx, w * 0.39 + bw / 2, y + 45, w * 0.69 - bw / 2, y + 45, c, true);
      wire(ctx, w * 0.39 + bw / 2, y + 45, w * 0.69 - bw / 2, y + 60, c, false);
      wire(ctx, w * 0.69 + bw / 2, y + 45, w - 65, y + 45, c, true);
      text(ctx, "A AND B", w - 30, y + 20, c, 11);
      box(ctx, s.result == null ? "?" : "= " + Number(s.result), w - 64, y + 32, 58, bh, c, !!s.result, 12);
    } else {
      box(ctx, "NAND A", w * 0.37 - bw / 2, y + 6, bw, bh, c, s.revealing && s.progress < 0.38, 11);
      box(ctx, "NAND B", w * 0.37 - bw / 2, y + 69, bw, bh, c, s.revealing && s.progress < 0.38, 11);
      box(ctx, "NAND 3", w * 0.69 - bw / 2, y + 38, bw, bh, c, s.revealing && s.progress >= 0.38, 11);
      wire(ctx, 70, y + 21, w * 0.37 - bw / 2, y + 18, c, true);
      wire(ctx, 70, y + 21, w * 0.37 - bw / 2, y + 34, c, false);
      wire(ctx, 70, y + 84, w * 0.37 - bw / 2, y + 80, c, true);
      wire(ctx, 70, y + 84, w * 0.37 - bw / 2, y + 96, c, false);
      wire(ctx, w * 0.37 + bw / 2, y + 27, w * 0.69 - bw / 2, y + 49, c, true);
      wire(ctx, w * 0.37 + bw / 2, y + 90, w * 0.69 - bw / 2, y + 66, c, true);
      wire(ctx, w * 0.69 + bw / 2, y + 59, w - 65, y + 59, c, true);
      box(ctx, s.result == null ? "?" : "= " + Number(s.result), w - 64, y + 46, 58, bh, c, !!s.result, 12);
    }
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 46, c, 13);
  }

  function drawTiming(ctx, w, h, c, s) {
    var x0 = 52, x1 = w - 22, yInput = 76, yOutput = 168, plotW = x1 - x0,
      a = !!s.a, before = !!s.before, after = !!s.after,
      oldOut = P.boolean(s.gate || "and", a, before), newOut = P.boolean(s.gate || "and", a, after),
      t = s.time == null ? 0.5 : Number(s.time), sampleX = x0 + plotW * Math.min(1, t / 2),
      switchX = x0, settleX = x0 + plotW * 0.5, revealed = s.revealing || s.result != null,
      revealX = x0 + plotW * Math.min(1, (s.revealedTime || 0) / 2);
    text(ctx, s.gate === "or" ? "OR gate · symbolic delay Δt" : "AND gate · symbolic delay Δt", w / 2, 25, c, 15);
    text(ctx, "B input", 12, yInput, c, 11, "left");
    text(ctx, "Output", 12, yOutput, c, 11, "left");
    ctx.strokeStyle = c.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, yInput + 22); ctx.lineTo(x1, yInput + 22); ctx.moveTo(x0, yOutput + 22); ctx.lineTo(x1, yOutput + 22); ctx.stroke();
    var hiB = before ? yInput : yInput + 34, loB = after ? yInput : yInput + 34,
      hiO = oldOut ? yOutput : yOutput + 34, loO = oldOut ? yOutput + 34 : yOutput,
      endO = newOut ? yOutput : yOutput + 34;
    ctx.strokeStyle = c.fau; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, hiB); ctx.lineTo(switchX, hiB); ctx.lineTo(switchX, loB); ctx.lineTo(x1, loB); ctx.stroke();
    if (revealed) {
      ctx.strokeStyle = c.course; ctx.beginPath(); ctx.moveTo(x0, hiO);
      if (revealX < settleX) ctx.lineTo(revealX, hiO);
      else { ctx.lineTo(settleX, hiO); ctx.lineTo(settleX, endO); ctx.lineTo(revealX, endO); }
      ctx.stroke();
    } else text(ctx, "?", sampleX, yOutput + 17, c, 14);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(switchX, yInput - 8); ctx.lineTo(switchX, yOutput + 48); ctx.moveTo(settleX, yInput - 8); ctx.lineTo(settleX, yOutput + 48); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "0", switchX, yOutput + 63, c, 11);
    text(ctx, "Δt", settleX, yOutput + 63, c, 11);
    text(ctx, "2Δt", x1, yOutput + 63, c, 11, "right");
    ctx.strokeStyle = c.act; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sampleX, yInput - 10); ctx.lineTo(sampleX, yOutput + 45); ctx.stroke();
    text(ctx, "A=" + Number(a) + " · B: " + Number(before) + " → " + Number(after), w / 2, h - 70, c, 12);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 52, c, 12);
    if (s.result != null) text(ctx, typeof s.result === "boolean" ? "Output at sample: " + Number(s.result) : s.result, w / 2, h - 34, c, 12);
  }

  function stageFor(section, data) {
    var canvas = section.querySelector("canvas");
    data.progress = 0;
    data.revealing = false;
    canvas.setAttribute("aria-label", data.label || section.querySelector("h2").textContent);
    queue(canvas, data);
  }

  function bits(form, names) {
    var v = {};
    names.forEach(function (key) { v[key] = form.querySelector('[data-bit="' + key + '"]').value === "1"; });
    return v;
  }

  function rnd(n) { return Math.floor(Math.random() * n); }
  function mix(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Results follow the inputs (no Evaluate or Show button): the action runs on every edit, after Reset and when the
  // sandbox opens. Stands in for the removed button, so each experiment keeps its one handler.
  function liveAction(form) {
    return { addEventListener: function (type, fn) {
      form._live = fn;
      form.addEventListener("input", fn); form.addEventListener("change", fn);
      var r = form.querySelector('[data-act="reset"]');
      if (r) r.addEventListener("click", function () { if (typeof setTimeout === "function") setTimeout(fn, 0); });
    } };
  }
  function ownMsg(form, m) { var e = form.querySelector("[data-own-msg]"); if (e) e.textContent = m || ""; }
  function ownOut(form, m) { var e = form.querySelector("[data-own-out]"); if (e) e.textContent = m || ""; }
  // "Or try your own" umbrella rule in C, W, R, compared with C′·(W+R) on all eight rows.
  function ownUmbrella(form) {
    var input = form.querySelector('[data-own="u"]');
    if (!input) return;
    var r = Expr.bool(input.value, "CWR");
    if (r.error) { ownMsg(form, r.error + "."); ownOut(form, ""); return; }
    ownMsg(form, "");
    var b = bits(form, ["car", "forecast", "rain"]), diff = [];
    for (var k = 0; k < 8; k++) { var c = k >> 2 & 1, w = k >> 1 & 1, rr = k & 1; if (r.fn(c, w, rr) !== Number(P.umbrella(!!c, !!w, !!rr))) diff.push("" + c + w + rr); }
    ownOut(form, "Your rule gives U = " + r.fn(b.car, b.forecast, b.rain) + " here. " + (diff.length ? "It differs from C′·(W+R) on " + diff.length + " of 8 rows (CWR = " + diff.join(", ") + ")." : "It matches C′·(W+R) on all 8 rows, so it is the same rule."));
  }
  // A typed NAND-only circuit: NAND(x, y) nested, with A, B, 0 and 1. A repeated sub-circuit is one shared gate, so
  // NAND(NAND(A, B), NAND(A, B)) counts 2. Returns { fn(a, b), gates } or { error }.
  function nandCircuit(text) {
    var toks = String(text).toUpperCase().match(/NAND|[AB01(),]|\S/g) || [], p = 0, seen = {};
    if (!toks.length) return { error: "type a circuit, for example NAND(A, B)" };
    function node() {
      var t = toks[p++];
      if (t === "A") return { key: "A", f: function (a) { return a; } };
      if (t === "B") return { key: "B", f: function (a, b) { return b; } };
      if (t === "0" || t === "1") { var v = +t; return { key: t, f: function () { return v; } }; }
      if (t === "NAND") {
        if (toks[p++] !== "(") throw new Error("write NAND(x, y) with brackets");
        var x = node(); if (toks[p++] !== ",") throw new Error("NAND takes two inputs, separated by a comma");
        var y = node(); if (toks[p++] !== ")") throw new Error("a bracket is not closed");
        var key = "N(" + [x.key, y.key].sort().join(",") + ")";
        seen[key] = true;
        return { key: key, f: function (a, b) { return 1 - (x.f(a, b) & y.f(a, b)); } };
      }
      throw new Error(t === undefined ? "the circuit ends too early" : "“" + t + "” is not allowed: use NAND(x, y), A, B, 0 and 1");
    }
    try { var n = node(); if (p < toks.length) throw new Error("unexpected “" + toks[p] + "” after the circuit"); return { fn: n.f, gates: Object.keys(seen).length }; }
    catch (e) { return { error: e.message }; }
  }
  var FUNCTIONS = { "0000": "constant 0", "0001": "A AND B", "0010": "A AND NOT B", "0011": "A", "0100": "NOT A AND B", "0101": "B", "0110": "A XOR B", "0111": "A OR B",
    "1000": "A NOR B", "1001": "A XNOR B", "1010": "NOT B", "1011": "A OR NOT B", "1100": "NOT A", "1101": "NOT A OR B", "1110": "A NAND B", "1111": "constant 1" };
  function ownNand(form) {
    var input = form.querySelector('[data-own="circuit"]');
    if (!input) return;
    var r = nandCircuit(input.value);
    if (r.error) { ownMsg(form, r.error + "."); ownOut(form, ""); return; }
    ownMsg(form, "");
    var rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (v) { return r.fn(v[0], v[1]); }), a = +form.querySelector('[data-bit="a"]').value, b = +form.querySelector('[data-bit="b"]').value;
    ownOut(form, "Output " + r.fn(a, b) + " for A=" + a + ", B=" + b + " · " + r.gates + " NAND gate" + (r.gates === 1 ? "" : "s") + " · rows 00, 01, 10, 11 give " + rows.join(", ") + ": this is " + FUNCTIONS[rows.join("")] + ".");
  }
  function lock(form, section, on) {
    form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = on; });
    section.querySelector(".stage").classList.toggle("locked", on);
  }

  function experimentAlgorithm() {
    var section = document.querySelector('[data-experiment="algorithm"]'),
      form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "algorithm", x: 16, g: 3 }, xInput = form.querySelector("[data-x]"), gInput = form.querySelector("[data-g]");
    function show() { queue(canvas, state); }
    form.querySelector('[data-act="step"]').addEventListener("click", function () {
      var x = Number(xInput.value), kept = x === state.x && gInput.value === Number(state.g).toFixed(3),
        g = kept ? state.g : Number(gInput.value), r;
      try { r = P.squareRootStep(x, g); }
      catch (e) { form.querySelector('[data-out="guess"]').textContent = "check inputs"; return; }
      var verdict = r.residual < 0.01 ? "stop" : "continue";
      state.x = x; state.g = r.next; gInput.value = r.next.toFixed(3);
      form.querySelector('[data-out="guess"]').textContent = r.next.toFixed(3);
      form.querySelector('[data-out="residual"]').textContent = r.residual.toPrecision(3) + " · " + verdict;
      state.result = r.next.toFixed(3) + " · " + verdict; show();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { xInput.value = "16"; gInput.value = "3"; state.x = 16; state.g = 3; state.result = ""; form.querySelector('[data-out="guess"]').textContent = "3.000"; form.querySelector('[data-out="residual"]').textContent = "—"; show(); });
    Lab.experiment({
      id: "algorithm", title: "2.1 Square-root algorithm", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (challenge) { state.guess = state.result = ""; state.progress = 0; state.revealing = false; challenge.stage(); },
      sandbox: function () { state.guess = state.result = ""; state.revealing = false; state.progress = 0; state.x = Number(xInput.value); state.g = Number(gInput.value); show(); },
      // Endless practice: one update step with new x and g (tests/lab-generators.test.js checks one correct option).
      generate: function () {
        var x, g, r, right, avg, div;
        do { x = 5 + rnd(60); g = 1 + rnd(8); r = P.squareRootStep(x, g); right = r.next.toFixed(3); avg = ((x + g) / 2).toFixed(3); div = (x / g).toFixed(3); }
        while (g * g === x || right === avg || right === div || avg === div);
        return { id: "gen-update", short: "one update step", ref: "2.1", prompt: "For x=" + x + " and guess g=" + g + ", what is the next guess (to three decimals)?",
          options: mix([[right, right], [avg, avg], [div, div]]), answer: right,
          stage: function () { state.x = x; state.g = g; state.result = ""; show(); },
          preview: function (choice) { state.guess = choice; show(); },
          reveal: function () { return Lab.tween(1400, function (t) { state.progress = t; state.revealing = true; state.g = g + (r.next - g) * t; show(); }).then(function () { state.revealing = false; state.g = r.next; state.result = right; show(); }); },
          why: "The update is (g + x/g)/2 = (" + g + " + " + x + "/" + g + ")/2 = (" + g + " + " + div + ")/2 ≈ " + right + ". Averaging x with g (" + avg + ") is the common slip, and x/g alone (" + div + ") skips the averaging." };
      },
      challenges: [
        { id: "first-update", short: "the first estimate", ref: "2.1", prompt: "For x=16 and guess g=3, what is the first updated guess (to three decimals)?", options: [["3.500", "3.500"], ["9.500", "9.500"], ["4.167", "4.167"]], answer: "4.167", stage: function () { state.x=16;state.g=3;show(); }, preview: function (choice) { state.guess=choice;show(); }, reveal: function () { var r=P.squareRootStep(16,3); return Lab.tween(1400,function(t){state.progress=t;state.revealing=true;state.g=3+(r.next-3)*t;show();}).then(function(){state.revealing=false;state.g=r.next;state.result=r.next.toFixed(3);show();}); }, why: "The update is (3+16/3)/2=25/6≈4.167. The new guess comes from the rule, not from averaging the target with the old guess." },
        { id: "test-first", short: "whether the first estimate passes", ref: "2.1", prompt: "At g=4.167 for x=16, is |g²−x| above or below the practice tolerance 0.01?", options: [["below", "Below 0.01"], ["above", "Above 0.01"]], answer: "above", stage: function () { state.x=16;state.g=25/6;state.result="";show(); }, preview: function (choice) { state.guess=choice==="above"?"Above 0.01":"Below 0.01";show(); }, reveal: function () { state.revealing=true;return Lab.tween(1200,function(t){state.progress=t;show();}).then(function(){state.revealing=false;state.result="residual ≈ 1.36 · continue";show();}); }, why: "The residual is |(25/6)²−16|=49/36≈1.36, which is greater than 0.01. The control flow therefore repeats the update instead of stopping." },
        { id: "second-update", short: "the second estimate", ref: "2.1", prompt: "Starting from g=4.167 with x=16, what is the next estimate to three decimals?", options: [["3.840", "3.840"], ["4.003", "4.003"], ["4.167", "4.167"]], answer: "4.003", stage: function () { state.x=16;state.g=25/6;state.result="";show(); }, preview: function (choice) { state.guess=choice;show(); }, reveal: function () { var r=P.squareRootStep(16,25/6);return Lab.tween(1400,function(t){state.progress=t;state.revealing=true;state.g=25/6+(r.next-25/6)*t;show();}).then(function(){state.revealing=false;state.g=r.next;state.result=r.next.toFixed(3);show();}); }, why: "The next update is (4.167+16/4.167)/2≈4.003. The estimate moves closer to 4 because g and x/g lie on opposite sides of √x." },
        { id: "stop-test", short: "when to stop", ref: "2.1", prompt: "At g≈4.003 for x=16, does the next update make the residual smaller than 0.01?", options: [["stop", "Yes · stop"], ["continue", "No · continue"]], answer: "stop", stage: function () { state.x=16;state.g=4.003333333333333;state.result="";show(); }, preview: function (choice) { state.guess=choice==="stop"?"Yes · stop":"No · continue";show(); }, reveal: function () { var r=P.squareRootStep(16,4.003333333333333);return Lab.tween(1400,function(t){state.progress=t;state.revealing=true;state.g=4.003333333333333+(r.next-4.003333333333333)*t;show();}).then(function(){state.revealing=false;state.g=r.next;state.result="residual < 0.01 · stop";show();}); }, why: "The next estimate is about 4.000 and its residual is far below 0.01. The stopping test is now true, so the procedure returns an answer." },
      ],
    });
  }

  function experimentLogic() {
    var section = document.querySelector('[data-experiment="logic"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"), state = { kind: "logic" };
    function show() { queue(canvas,state); }
    form.addEventListener("input",function(){ownUmbrella(form);});form.addEventListener("change",function(){ownUmbrella(form);});ownUmbrella(form);
    liveAction(form).addEventListener("live",function(){state.bits=bits(form,["car","forecast","rain"]);state.result=P.umbrella(state.bits.car,state.bits.forecast,state.bits.rain);form.querySelector('[data-out="result"]').textContent=Number(state.result);show();});
    function challenge(id,short,car,forecast,rain,answer,prompt,why,note,flip){var zero=["0","U = 0 · no umbrella"],one=["1","U = 1 · take umbrella"];return {id:id,short:short,ref:note?"2.5":"2.4",prompt:prompt,options:flip?[zero,one]:[one,zero],answer:String(Number(answer)),stage:function(){state.bits={car:!!car,forecast:!!forecast,rain:!!rain};state.result=null;state.note="";show();},preview:function(choice){state.guess="U = "+choice;show();},reveal:function(){state.result=P.umbrella(!!car,!!forecast,!!rain);state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;show();}).then(function(){state.revealing=false;state.note=note||"";show();});},why:why};}
    Lab.experiment({id:"logic",title:"2.4 Boolean umbrella rule",card:section.querySelector(".challenge"),lock:function(on){lock(form,section,on);},setup:function(challenge){state.guess="";state.result=null;state.note="";state.progress=0;state.revealing=false;challenge.stage();},sandbox:function(){state.guess="";state.note="";state.bits=bits(form,["car","forecast","rain"]);state.result=null;show();if(form._live)form._live();},
      generate:function(){var c=rnd(2),w=rnd(2),r=rnd(2),u=P.umbrella(!!c,!!w,!!r);return challenge("gen-umbrella","the umbrella rule",c,w,r,u,"C="+c+", W="+w+", R="+r+". What is U = C'·(W+R)?",
        "C'="+(1-c)+" and W+R="+(w||r?1:0)+", so U="+(1-c)+"·"+(w||r?1:0)+"="+(u?1:0)+". "+(c?"Taking the car makes C'=0, so the weather cannot matter.":u?"Without the car, one bad-weather input is enough.":"Without the car, U still needs W or R to be 1."),null,!!rnd(2));},
      challenges:[
      challenge("clear-day", "grouping with parentheses",1,0,1,false,"C=1, W=0, R=1. Compare U=C'·(W+R) with C'·W+R (slide 31). What is U for the rule with parentheses?","C'·(W+R)=0·1=0, but C'·W+R=0+1=1. Parentheses change the result, because AND binds tighter than OR.","Without parentheses: C'·W+R = 1"),
      challenge("bad-forecast", "bad forecast",0,1,0,true,"You are not taking the car (C=0), and only the forecast is bad (W=1, R=0). What is U?","C'=1 and W+R=1, so U=1. Either weather condition is enough when you are not taking the car.",null,true),
      challenge("rain", "rain",0,0,1,true,"You are not taking the car (C=0), and it is raining (R=1) with a good forecast (W=0). What is U?","C'=1 and W+R=1 because R=1, so U=1. The OR is inclusive and either condition can make it true."),
      challenge("car", "car condition",1,1,1,false,"You are taking the car (C=1), with bad weather (W=1) and rain (R=1). What is U?","C'=0, so C'·(W+R)=0 even though both weather inputs are 1. The outer AND condition still has to be true."),
    ]});
  }

    function experimentNand(){
    var section=document.querySelector('[data-experiment="nand"]'),form=section.querySelector("form"),canvas=section.querySelector("canvas"),state={kind:"nand"};
    function show(){queue(canvas,state);}
    form.addEventListener("input",function(){ownNand(form);});form.addEventListener("change",function(){ownNand(form);});ownNand(form);
    liveAction(form).addEventListener("live",function(){state.fn=form.querySelector("[data-fn]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.b=form.querySelector('[data-bit="b"]').value==="1";state.result=P.nandCircuit(state.fn,state.a,state.b);form.querySelector('[data-out="result"]').textContent=Number(state.result);show();});
    function challenge(id,short,fn,a,b,answer,prompt,why,flip){var zero=["0","Output 0"],one=["1","Output 1"];return {id:id,short:short,ref:"2.7",prompt:prompt,options:flip?[zero,one]:[one,zero],answer:String(Number(answer)),stage:function(){state.fn=fn;state.a=!!a;state.b=!!b;state.result=null;show();},preview:function(choice){state.guess="Output "+choice;show();},reveal:function(){state.result=P.nandCircuit(fn,!!a,!!b);state.revealing=true;return Lab.tween(1350,function(t){state.progress=t;show();}).then(function(){state.revealing=false;show();});},why:why};}
    Lab.experiment({id:"nand",title:"2.7 Build functions with NAND",card:section.querySelector(".challenge"),lock:function(on){lock(form,section,on);},setup:function(challenge){state.guess="";state.result=null;state.progress=0;state.revealing=false;challenge.stage();},sandbox:function(){state.guess="";state.fn=form.querySelector("[data-fn]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.b=form.querySelector('[data-bit="b"]').value==="1";state.result=null;show();if(form._live)form._live();},
      generate:function(){var fns={nand:["one NAND gate","A NAND B"],not:["NOT built from one NAND with tied inputs","NOT A"],and:["the two-NAND AND construction","A AND B"],or:["the three-NAND OR construction","A OR B"]},keys=Object.keys(fns),fn=keys[rnd(4)],a=rnd(2),b=fn==="not"?a:rnd(2),out=P.nandCircuit(fn,!!a,!!b);
        return challenge("gen-nand","NAND circuits",fn,a,b,out,(fn==="not"?"A="+a+" feeds ":"A="+a+" and B="+b+" feed ")+fns[fn][0]+". What is the output?",
          "The circuit computes "+fns[fn][1]+(fn==="not"?" = NOT "+a:" with A="+a+", B="+b)+", which is "+(out?1:0)+". NAND(x,y) is 0 only when both inputs are 1; every construction here is built from that one rule.",!!rnd(2));},
      challenges:[
      challenge("nand-one", "NAND of two 1s", "nand",1,1,0,"A single NAND gate receives A=1 and B=1. What is its output?","AND gives 1 for two true inputs, then NAND inverts it to 0. The output is low only for the 1,1 input pair."),
      challenge("not-tied", "NOT from tied inputs", "not",0,0,1,"Both inputs of one NAND gate are tied to A=0. What is the output?","NAND(A,A)=NOT A. With A=0, the AND is 0 and inversion gives 1."),
      challenge("and-build", "AND from NAND", "and",1,0,0,"A=1 and B=0 feed the two-NAND AND construction. What is the final output?","The first NAND gives 1 for inputs 1 and 0; the second NAND ties those outputs together and inverts 1 to 0. That reproduces A AND B."),
      challenge("or-build", "OR from NAND", "or",0,1,1,"A=0 and B=1 feed the three-NAND OR construction. What is the final output?","The tied-input NANDs form NOT A=1 and NOT B=0; NAND(1,0)=1. This is A OR B, built with NAND gates only.",true),
    ]});
  }

  function experimentTiming(){
    var section=document.querySelector('[data-experiment="timing"]'),form=section.querySelector("form"),canvas=section.querySelector("canvas"),state={kind:"timing",gate:"and",before:false,after:true,time:0.5};
    function show(){queue(canvas,state);}
    liveAction(form).addEventListener("live",function(){state.gate=form.querySelector("[data-gate]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.after=form.querySelector('[data-bit="b"]').value==="1";state.before=false;state.time=Number(form.querySelector("[data-time]").value);state.result=P.delayedOutput(P.boolean(state.gate,state.a,state.before),P.boolean(state.gate,state.a,state.after),state.time,1);form.querySelector('[data-out="result"]').textContent=Number(state.result);show();});
    function challenge(id,short,prompt,answer,gate,a,before,after,time,why){return {id:id,short:short,ref:"2.8",prompt:prompt,options:answer==="old"?[["old","Old output"],["new","New output"],["unknown","Cannot tell from the information"]]:[["unknown","Cannot tell from the information"],["new","New output"],["old","Old output"]],answer:answer,stage:function(){state.kind="timing";state.gate=gate;state.a=!!a;state.before=!!before;state.after=!!after;state.time=time;state.revealedTime=0;state.result=null;state.guess="";show();},preview:function(choice){state.guess=choice==="old"?"Old output":choice==="new"?"New output":"Need timing data";show();},reveal:function(){state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;state.revealedTime=2*t;show();}).then(function(){state.revealing=false;state.revealedTime=2;state.result=answer==="old"?P.boolean(gate,!!a,!!before):answer==="new"?P.boolean(gate,!!a,!!after):null;show();});},why:why};}
    Lab.experiment({id:"timing",title:"2.8 Logic and circuit timing",card:section.querySelector(".challenge"),lock:function(on){lock(form,section,on);},setup:function(challenge){state.kind="timing";state.guess="";state.result=null;state.progress=0;state.revealing=false;challenge.stage();},sandbox:function(){state.kind="timing";state.guess="";state.result=null;state.revealedTime=2;state.gate=form.querySelector("[data-gate]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.after=form.querySelector('[data-bit="b"]').value==="1";state.before=false;state.time=Number(form.querySelector("[data-time]").value);show();if(form._live)form._live();},challenges:[
      challenge("delay-start","output before propagation", "An AND gate has A=1 and B changes 0→1 at t=0. Which logic value does this simplified model show at t=0.5Δt?","old","and",1,0,1,0.5,"Before the symbolic delay Δt has passed, this model keeps the previous stable value, 0. At Δt it shows the Boolean result 1. The slide draws a gradual change across Δt, and gives no measured duration."),
      challenge("delay-end","output after propagation", "An OR gate has A=0 and B changes 0→1 at t=0. Which logic value does this simplified model show at t=Δt?","new","or",0,0,1,1,"At t=Δt the output has reached the new stable value A OR B=1. The truth table gives the destination; the timing trace shows that it is not instantaneous."),
      {id:"saturation",short:"the switching-speed limit",ref:"2.8",prompt:"The slides name time delay and saturation. What do they limit?",options:[["truth","Which stable output the truth table gives"],["rate","How fast the state can switch"],["voltage","How many inputs a gate may have"]],answer:"rate",stage:function(){state.kind="timing";state.gate="and";state.a=true;state.before=false;state.after=true;state.time=0.5;state.revealedTime=0;state.result=null;state.guess="";show();},preview:function(choice){state.guess={rate:"How fast it can switch",truth:"The stable output",voltage:"The number of inputs"}[choice];show();},reveal:function(){state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;state.revealedTime=2*t;show();}).then(function(){state.revealing=false;state.revealedTime=2;state.result="The limit is switching speed";show();});},why:"They limit switching speed (slide 48). The truth table still gives the same stable output. The slides do not explain the mechanism or give numbers."},
      {id:"timing-data",short:"what equivalence says about speed",ref:"2.8",prompt:"A direct OR gate and an equivalent three-NAND circuit produce the same stable truth table. Without delay measurements, which can you say is faster?",options:[["direct","Direct OR is definitely faster"],["unknown","The truth table cannot decide timing"],["nand","The NAND circuit is definitely faster"]],answer:"unknown",stage:function(){state.kind="equivalent";state.result=null;state.guess="";show();},preview:function(choice){state.guess={unknown:"Cannot be decided",direct:"Direct OR",nand:"NAND circuit"}[choice];show();},reveal:function(){state.kind="equivalent";state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;show();}).then(function(){state.revealing=false;state.result="timing needs measurements";show();});},why:"Equivalent truth tables establish the same stable logic outputs. They do not give gate propagation delays, so the circuit timing cannot be ranked without physical timing information."},
    ]});
  }

  function drawEquivalent(ctx,w,h,c,state){
    text(ctx,"Same stable truth table · timing not specified",w/2,28,c,14);
    text(ctx,"A OR B",w*.17,h*.47,c,14);box(ctx,"OR",w*.36-36,h*.39,72,45,c,false,13);wire(ctx,w*.17+28,h*.47,w*.36-36,h*.47,c,false);wire(ctx,w*.36+36,h*.47,w*.58,h*.47,c,false);text(ctx,"versus",w*.53,h*.47,c,12);box(ctx,"NANDs",w*.66,h*.39,66,45,c,state.revealing&&state.progress>.4,12);wire(ctx,w*.58,h*.47,w*.66,h*.47,c,state.revealing&&state.progress>.4);wire(ctx,w*.66+66,h*.47,w*.88,h*.47,c,state.revealing&&state.progress>.75);text(ctx,"?",w*.91,h*.47,c,18);
    if(state.guess)text(ctx,"Your prediction: "+state.guess,w/2,h-67,c,13);if(state.result)text(ctx,state.result,w/2,h-49,c,13);
  }

  experimentAlgorithm();experimentLogic();experimentNand();experimentTiming();
  var observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(function(){canvases.forEach(function(canvas){if(canvas._labState)queue(canvas,canvas._labState);});});
  document.querySelectorAll(".experiment canvas").forEach(function(canvas){canvases.push(canvas);if(observer)observer.observe(canvas.parentElement);});
  window.addEventListener("resize",function(){canvases.forEach(function(canvas){if(canvas._labState)queue(canvas,canvas._labState);});});
})();
