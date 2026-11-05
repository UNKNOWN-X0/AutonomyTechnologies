/* Chapter 2 benches: labelled field diagrams, live SI readouts, and reveal ghosts. */
(function () {
  if (typeof document === "undefined" || typeof EEI2 === "undefined") return;

  var P = EEI2,
    ALPHA_CU = 3.9e-3,
    SERIES = { "0.2": 0.2, "0.1": 0.1, "0.05": 0.05 };

  function number(n) {
    if (!Number.isFinite(n)) return "—";
    if (n === 0) return "0";
    return String(Number(n.toPrecision(3)));
  }
  function fmt(n, unit) { return number(n) + (unit ? " " + unit : ""); }
  function angle(rad) { return (rad * 180) / Math.PI; }
  function rangeText(b) { return fmt(b.low, "Ω") + "–" + fmt(b.high, "Ω"); }
  function getControls(form, base) {
    var s = Object.assign({}, base);
    form.querySelectorAll("[data-p]").forEach(function (n) {
      var v = n.type === "range" || n.type === "number" ? Number(n.value) : n.value;
      if (v !== "" && v != null && !(typeof v === "number" && !Number.isFinite(v))) s[n.dataset.p] = v;
    });
    return s;
  }
  function setControls(form, s) {
    form.querySelectorAll("[data-p]").forEach(function (n) {
      if (s[n.dataset.p] != null) n.value = s[n.dataset.p];
    });
    outputs(form);
  }
  function outputs(form) {
    form.querySelectorAll("[data-p]").forEach(function (n) {
      var out = form.querySelector('[data-val="' + n.dataset.p + '"]');
      if (out) out.textContent = n.tagName === "SELECT" ? n.options[n.selectedIndex].text : n.value;
    });
  }
  function result(type, s) {
    if (type === "current") {
      var I = P.current(s.q, 1 / s.rate), J = I / s.area;
      return { rate: I, J: J, through: P.throughSurface(J, s.area, s.angle), net: 0, signed: s.carrier === "electron" ? 1 : 1 };
    }
    if (type === "drift") {
      var mu = s.mu * 1e-3, n = s.n * 1e28, k = P.conductivity(n, mu, s.dT, ALPHA_CU);
      return { drift: P.drift(mu, s.E), kappa: k, J: k * s.E };
    }
    if (type === "wire") {
      var R = P.wire(s.kappa * 1e6, s.length, s.area * 1e-6), U = s.mode === "voltage" ? s.source : s.source * R, I = s.mode === "voltage" ? s.source / R : s.source;
      return { R: R, I: I, U: U, J: I / (s.area * 1e-6), E: U / s.length };
    }
    if (type === "tolerance") {
      var tau = SERIES[s.series] || s.tau, band = P.tolerance(s.nominal, tau);
      return { band: band, actual: s.actual, inside: s.actual >= band.low && s.actual <= band.high, second: s.otherNominal ? P.tolerance(s.otherNominal, tau) : null };
    }
    if (type === "interface") {
      var v = P.interface(s.k1, s.k2, s.Jn, s.Et);
      return Object.assign(v, { angle1: angle(v.alpha1), angle2: angle(v.alpha2) });
    }
    var R6 = s.R, U6 = s.mode === "voltage" ? s.source : s.source * R6, I6 = s.mode === "voltage" ? U6 / R6 : s.source, pow = P.power(U6, I6, R6), length = 2, A = s.volume / length, E = U6 / length, J6 = I6 / A, pd = P.powerDensity(E, J6, s.volume);
    return { U: U6, I: I6, P: pow.P, energy: P.energy(pow.P, s.time), E: E, J: J6, density: pd.density, total: pd.total, volume: s.volume };
  }

  function draw(root, type, state, values) {
    var canvas = root.querySelector("canvas"), ctx = canvas && canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    var box = canvas.getBoundingClientRect(), w = Math.max(1, box.width || 640), h = Math.max(1, box.height || 410), dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var style = getComputedStyle(document.documentElement), color = function (key, fallback) { return style.getPropertyValue(key).trim() || fallback; },
      ink = color("--ink", "#0b1b33"), muted = color("--muted", "#45556d"), line = color("--line", "#d3dbe6"), paper = color("--paper", "#fff"), amber = color("--eei-3", "#b28324"), blue = color("--fau-mark", "#04316a"), pale = color("--paper-2", "#eef2f7"),
      cx = w / 2, cy = h / 2, p = state.progress || 0, ghost = state.ghost, showResult = !state.challenge || state.revealed;
    function text(s, x, y, size, c, align) { ctx.fillStyle = c || ink; ctx.font = "600 " + (size || 13) + "px Hanken Grotesk, sans-serif"; ctx.textAlign = align || "left"; ctx.fillText(s, x, y); }
    function arrow(x1, y1, x2, y2, c, dashed) {
      var a = Math.atan2(y2 - y1, x2 - x1); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 3; ctx.setLineDash(dashed ? [7, 5] : []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 11 * Math.cos(a - 0.45), y2 - 11 * Math.sin(a - 0.45)); ctx.lineTo(x2 - 11 * Math.cos(a + 0.45), y2 - 11 * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
    }
    function marker(x, label, dashed) { ctx.strokeStyle = amber; ctx.lineWidth = 2; ctx.setLineDash(dashed ? [6, 4] : []); ctx.beginPath(); ctx.moveTo(x, cy - 72); ctx.lineTo(x, cy + 82); ctx.stroke(); ctx.setLineDash([]); text(label, x, cy - 86, 12, amber, "center"); }
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(24, cy); ctx.lineTo(w - 24, cy); ctx.stroke();
    if (type === "current") {
      var a = state.state.angle * Math.PI / 180, flow = values.through, wireY = cy;
      ctx.fillStyle = pale; ctx.fillRect(34, cy - 32, w - 68, 64); text("conducting path", 40, cy - 42, 12, muted);
      for (var i = 0; i < 7; i++) { var x = 62 + i * (w - 124) / 6, shift = p * 18 * (state.state.carrier === "electron" ? -1 : 1); ctx.beginPath(); ctx.arc(((x + shift - 45 + (w - 100)) % (w - 100)) + 50, wireY, 5, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? amber : blue; ctx.fill(); }
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(0, 78); ctx.stroke(); ctx.restore();
      text("oriented cut", cx, cy + 102, 12, muted, "center"); if (showResult) { arrow(58, cy - 54, w - 58, cy - 54, blue); text("conventional current →", cx, cy - 66, 12, blue, "center"); text(state.state.carrier === "electron" ? "electron drift ←" : "positive-carrier motion →", cx, cy - 4, 11, amber, "center"); }
      var gx = 80 + (w - 160) * Math.max(0, Math.min(1, ghost == null ? 0 : ghost / Math.max(1, values.rate)));
      if (ghost != null) marker(gx, "prediction", true); if (showResult) { text("in = out", cx, cy + 142, 13, ink, "center"); text("net closed-surface current = 0", cx, cy + 160, 12, muted, "center"); }
    } else if (type === "drift") {
      var mag = Math.min(150, 40 + Math.abs(values.drift) * 30000), y1 = cy - 52, y2 = cy + 14;
      arrow(cx - 120, y1, cx + 120, y1, blue); text("E", cx + 128, y1 + 4, 15, blue);
      if (showResult) { arrow(cx + 80, y2, cx - mag, y2, amber); text("electron drift", cx, y2 + 30, 12, amber, "center"); }
      if (showResult || state.challengeId !== "drift-direction") { arrow(cx - 120, cy + 86, cx + 120, cy + 86, ink); text("conventional J", cx, cy + 110, 12, ink, "center"); }

    } else if (type === "wire") {
      var half = 80 + Math.min(100, values.R * 9), top = cy - 28;
      ctx.fillStyle = pale; ctx.fillRect(cx - half, top, half * 2, 56); ctx.strokeStyle = amber; ctx.lineWidth = 3; ctx.beginPath();
      for (var j = 0; j <= 8; j++) { var xx = cx - half + j * half * 2 / 8; ctx.lineTo(xx, top + (j % 2 ? 46 : 10)); } ctx.stroke();
      arrow(cx - half - 36, cy, cx - half - 4, cy, blue); arrow(cx + half + 4, cy, cx + half + 36, cy, blue);
      text("L = " + fmt(state.state.length, "m") + "   A = " + fmt(state.state.area, "mm²"), cx, cy + 76, 13, muted, "center");
      var at = cx + (w - 150) * Math.min(1, values.R / 500) - (w - 150) / 2;

      if (showResult) marker(at, "actual R", false); text(state.state.mode === "voltage" ? "voltage source" : "current source", cx, cy + 112, 12, blue, "center");
    } else if (type === "tolerance") {
      var min = Math.min(values.band.low, state.state.otherNominal ? values.second.low : values.band.low), max = Math.max(values.band.high, state.state.otherNominal ? values.second.high : values.band.high), span = max - min || 1, x0 = 56, x1 = w - 56, y = cy + 12;
      ctx.strokeStyle = line; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      function xpos(v) { return x0 + ((v - min) / span) * (x1 - x0); }
      ctx.strokeStyle = blue; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(xpos(values.band.low), y); ctx.lineTo(xpos(values.band.high), y); ctx.stroke();
      if (values.second) { ctx.strokeStyle = amber; ctx.beginPath(); ctx.moveTo(xpos(values.second.low), y + 24); ctx.lineTo(xpos(values.second.high), y + 24); ctx.stroke(); text("second nominal range", cx, y + 58, 12, amber, "center"); }
      if (showResult) marker(xpos(values.actual), "actual", false);
      text("minimum", xpos(values.band.low), y + 50, 11, muted, "center"); text("nominal " + fmt(state.state.nominal, "Ω"), xpos(state.state.nominal), y - 42, 12, ink, "center"); text("maximum", xpos(values.band.high), y + 50, 11, muted, "center");
    } else if (type === "interface") {
      ctx.fillStyle = pale; ctx.fillRect(26, 42, cx - 27, h - 84); ctx.fillStyle = color("--fau-tint", "#dce5f1"); ctx.fillRect(cx, 42, cx - 26, h - 84); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, 32); ctx.lineTo(cx, h - 32); ctx.stroke();
      text("material 1 · κ=" + state.state.k1, cx / 2, 62, 12, muted, "center"); text("material 2 · κ=" + state.state.k2, cx + cx / 2, 62, 12, muted, "center");
      if (showResult) { arrow(cx - 135, cy + 44, cx - 30, cy + 44, blue); arrow(cx + 30, cy - 8, cx + 135, cy - 8, blue); }
      var xcomp = Math.min(95, 20 + values.Jt1 * 7), ycomp = Math.min(95, 20 + values.Jt2 * 7);
      if (showResult) { arrow(cx - 86, cy + 44, cx - 86, cy + 44 - xcomp, amber); arrow(cx + 86, cy - 8, cx + 86, cy - 8 - ycomp, amber); }
      if (showResult) { text("Jₙ continuous", cx, h - 56, 12, blue, "center"); text("Jₜ changes with κ", cx, h - 36, 12, amber, "center"); }

      text("α₁ " + fmt(values.angle1, "°") + " → α₂ " + fmt(values.angle2, "°"), cx, cy + 154, 12, ink, "center");
    } else {
      var bw = Math.max(0, Math.min(w - 110, values.energy / 2000 * (w - 110) * p)), bx = 54, by = cy + 34;
      ctx.strokeStyle = blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(42, cy); ctx.lineTo(cx - 65, cy); ctx.moveTo(cx + 65, cy); ctx.lineTo(w - 42, cy); ctx.stroke();
      ctx.strokeStyle = amber; ctx.beginPath(); ctx.moveTo(cx - 56, cy - 22); ctx.lineTo(cx - 20, cy + 22); ctx.lineTo(cx + 20, cy - 22); ctx.lineTo(cx + 56, cy + 22); ctx.stroke();
      text("resistor", cx, cy - 42, 12, muted, "center"); text("electrical power → heat", cx, cy + 40, 12, ink, "center");
      ctx.fillStyle = pale; ctx.fillRect(bx, by + 34, w - 108, 26); ctx.fillStyle = amber; ctx.fillRect(bx, by + 34, bw, 26); text("energy accumulated", bx, by + 30, 12, muted);

      text("pᵥ = EJ", cx, cy + 118, 12, blue, "center");
    }
    if (state.ghostLabel) { ctx.strokeStyle = amber; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(24, h - 40, w - 48, 26); ctx.setLineDash([]); ctx.font = "600 12px Hanken Grotesk, sans-serif"; ctx.fillStyle = amber; ctx.textAlign = "center"; var label = "Your prediction · " + state.ghostLabel; if (ctx.measureText(label).width > w - 68) ctx.font = "600 10px Hanken Grotesk, sans-serif"; ctx.fillText(label, cx, h - 23); }
    canvas.setAttribute("aria-label", root.querySelector("h2").textContent + ". " + readout(type, values));
  }

  function readout(type, v) {
    if (type === "current") return "current " + fmt(v.rate, "A") + ", through the cut " + fmt(v.through, "A") + ", closed-surface net zero";
    if (type === "drift") return "electron drift " + fmt(v.drift, "m/s") + ", conductivity " + fmt(v.kappa, "S/m") + ", current density " + fmt(v.J, "A/m²");
    if (type === "wire") return "resistance " + fmt(v.R, "Ω") + ", current " + fmt(v.I, "A") + ", voltage " + fmt(v.U, "V");
    if (type === "tolerance") return "allowed range " + rangeText(v.band) + ", actual " + fmt(v.actual, "Ω") + (v.inside ? " inside" : " outside");
    if (type === "interface") return "normal current density " + fmt(v.Jn1, "A/m²") + ", angles " + fmt(v.angle1, "°") + " and " + fmt(v.angle2, "°");
    return "power " + fmt(v.P, "W") + ", energy " + fmt(v.energy, "J") + ", power density " + fmt(v.density, "W/m³");
  }
  function paintReadouts(root, type, v) {
    var vals = type === "current" ? { rate: fmt(v.rate, "A"), current: fmt(v.through, "A"), net: fmt(v.net, "A") } :
      type === "drift" ? { drift: fmt(v.drift, "m/s"), kappa: fmt(v.kappa, "S/m"), J: fmt(v.J, "A/m²") } :
      type === "wire" ? { R: fmt(v.R, "Ω"), I: fmt(v.I, "A"), U: fmt(v.U, "V") } :
      type === "tolerance" ? { range: rangeText(v.band), actual: fmt(v.actual, "Ω"), inside: v.inside ? "Inside band" : "Outside band" } :
      type === "interface" ? { Jn: fmt(v.Jn1, "A/m²"), Jt: fmt(v.Jt1, " → ") + fmt(v.Jt2, "A/m²"), angle: fmt(v.angle1, "°") + " → " + fmt(v.angle2, "°") } :
      { P: fmt(v.P, "W"), density: fmt(v.density, "W/m³"), W: fmt(v.energy, "J") };
    Object.keys(vals).forEach(function (k) { var out = root.querySelector('[data-out="' + k + '"]'); if (out) out.textContent = vals[k]; });
  }

  function challenge(cfg, spec) {
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer,
      expected: spec.expected, guesses: spec.guesses, state: spec.state,
      stage: function () { cfg.challenge = true; cfg.challengeId = spec.id; cfg.revealed = false; cfg.ghostLabel = null; cfg.start = Object.assign({}, spec.start || spec.state); cfg.target = Object.assign({}, spec.state); cfg.state = Object.assign({}, cfg.start); cfg.progress = 0; cfg.ghost = null; setControls(cfg.form, cfg.state); cfg.render(); },
      preview: function (key) { cfg.ghost = spec.guesses && spec.guesses[key] != null ? spec.guesses[key] : spec.expected; cfg.ghostLabel = (spec.options.find(function (o) { return o[0] === key; }) || ["", ""])[1]; cfg.render(); },
      reveal: function () {
        cfg.progress = 0; cfg.revealed = true;
        return Lab.tween(950, function (t) { cfg.progress = t; cfg.state = {}; Object.keys(cfg.target || spec.state).forEach(function (k) { var a = cfg.start[k], b = cfg.target[k]; cfg.state[k] = typeof a === "number" && typeof b === "number" ? a + (b - a) * t : t < 1 ? a : b; }); cfg.render(); });
      },
      why: spec.why,
    };
  }
  function numericChallenge(cfg, id, ref, prompt, state, expected, wrong, unit, why) {
    var ix = Math.floor(Math.random() * 3), vals = [expected, wrong[0], wrong[1]], opts = [], guesses = {}, keys = ["a", "b", "c"];
    if (ix === 1) [vals[0], vals[1]] = [vals[1], vals[0]];
    if (ix === 2) [vals[0], vals[2]] = [vals[2], vals[0]];
    var correct = keys[ix];
    keys.forEach(function (key, i) { opts.push([key, fmt(vals[i], unit)]); guesses[key] = vals[i]; });
    return challenge(cfg, { id: "gen-" + id + "-" + Math.floor(Math.random() * 1e9), short: id, ref: ref, prompt: prompt, state: state, expected: expected, options: opts, answer: correct, guesses: guesses, why: why });
  }

  function mount(root, def, initial) {
    var type = def.id, form = root.querySelector(".controls"), canvas = root.querySelector("canvas"), outs = root.querySelectorAll("[data-out]"), cfg = { root: root, form: form, state: Object.assign({}, initial), progress: 0, ghost: null };
    cfg.render = function () { var v = result(type, cfg.state); if (cfg.challenge && !cfg.revealed) root.querySelectorAll("[data-out]").forEach(function (n) { n.textContent = "Predict first"; }); else paintReadouts(root, type, v); draw(root, type, cfg, v); };
    function sync() { cfg.state = getControls(form, initial); cfg.ghost = null; cfg.progress = 1; cfg.render(); }
    form.querySelectorAll("[data-p]").forEach(function (n) { n.addEventListener(n.tagName === "SELECT" ? "change" : "input", sync); });
    outputs(form);
    if (typeof ResizeObserver === "function") new ResizeObserver(cfg.render).observe(root.querySelector(".stage"));
    else if (typeof window.addEventListener === "function") window.addEventListener("resize", cfg.render);
    var exp = Object.assign({}, def, {
      card: root.querySelector(".challenge"),
      lock: function (on) { form.querySelectorAll("input,select,button").forEach(function (n) { n.disabled = on; }); root.querySelector(".stage").classList.toggle("locked", on); },
      setup: function (c) { c.stage(); },
      sandbox: function () { cfg.challenge = false; cfg.challengeId = null; cfg.revealed = true; cfg.ghost = null; cfg.ghostLabel = null; cfg.progress = 1; cfg.state = getControls(form, initial); cfg.render(); },
    });
    exp.challenges = def.challenges.map(function (c) { return challenge(cfg, c); });
    if (def.generate) exp.generate = function () { return def.generate(cfg); };
    Lab.experiment(exp);
    cfg.render();
  }

  var configs = [
    {
      id: "current", title: "2.1 Current flow", ref: "2.1.1", initial: { q: 4, rate: 2, angle: 0, area: 2, carrier: "electron" }, challenges: [
        { id: "current-rate", short: "charge per second", ref: "2.1.1", prompt: "Packets of 6 C cross the section twice each second. What current flows?", state: { q: 6, rate: 2, angle: 0, area: 2, carrier: "electron" }, options: [["a", "3 A"], ["b", "12 A"], ["c", "6 A"]], answer: "b", expected: 12, guesses: { a: 3, b: 12, c: 6 }, why: "Current is charge per time: 6 C × 2 s⁻¹ = 12 A. Counting the packet only once would miss that two packets pass each second." },
        { id: "surface-angle", short: "current through a tilted cut", ref: "2.1.2", prompt: "A current density of 8 A/m² meets a 2 m² surface at 60° to its normal. How much current crosses it?", state: { q: 8, rate: 2, angle: 60, area: 2, carrier: "electron" }, options: [["a", "16 A"], ["b", "4 A"], ["c", "8 A"]], answer: "c", expected: 8, guesses: { a: 16, b: 4, c: 8 }, why: "The dot product keeps the normal part: I = JA cos 60° = 8 × 2 × 0.5 = 8 A. The full 16 A would cross only when the surface normal aligns with J." },
        { id: "electron-sign", short: "electron and conventional directions", ref: "2.1.2", prompt: "Electrons drift to the left in a wire. Which way does conventional current point?", state: { q: 4, rate: 2, angle: 0, area: 2, carrier: "electron" }, options: [["left", "Left"], ["right", "Right"], ["zero", "There is no current"]], answer: "right", expected: 1, guesses: { left: -1, right: 1, zero: 0 }, why: "Electron charge is negative, so J = ϱVv points opposite electron velocity. The conventional current points right." },
        { id: "stationary-balance", short: "steady current at a closed surface", ref: "2.1.3", prompt: "A stationary region has 3 A entering. How much current must leave?", state: { q: 3, rate: 1, angle: 0, area: 1, carrier: "electron" }, options: [["a", "0 A"], ["b", "3 A"], ["c", "6 A"]], answer: "b", expected: 3, guesses: { a: 0, b: 3, c: 6 }, why: "No charge builds up in a stationary region, so 3 A must leave. Signed current through the closed surface sums to zero: entering and leaving contributions cancel." },
      ],
      generate: function (cfg) { var q = 2 + Math.floor(Math.random() * 8), rate = 2 + Math.floor(Math.random() * 4), v = P.current(q, 1 / rate); return numericChallenge(cfg, "current-rate", "2.1.1", q + " C packets pass at " + rate + " packets/s. Find the current.", { q: q, rate: rate, angle: 0, area: 2, carrier: "electron" }, v, [q, q * (rate + 1)], "A", "I = dQ/dt = " + q + " × " + rate + " = " + fmt(v, "A") + ". A packet’s charge alone is not a current; the passing rate matters."); },
    },
    {
      id: "drift", title: "2.2 Drift and conductivity", ref: "2.2.1–2.2.2", initial: { E: 0.5, mu: 4, n: 8.5, dT: 0 }, challenges: [
        { id: "drift-direction", short: "electron drift direction", ref: "2.2.1", prompt: "The electric field points right in a metal. Which way do its electrons drift on average?", state: { E: 0.5, mu: 4, n: 8.5, dT: 0 }, options: [["same", "Right, with E"], ["opp", "Left, opposite E"], ["still", "No average drift"]], answer: "opp", expected: -1, guesses: { same: 1, opp: -1, still: 0 }, why: "Electrons have negative charge, so vₑ = −μₑE points opposite the field. Their random thermal motion averages out; the field adds this small directed drift." },
        { id: "drift-speed", short: "signed drift speed", ref: "2.2.1", prompt: "For μₑ = 4.12 × 10⁻³ m²/(V s) and E = 0.20 V/m, what is vₑ?", state: { E: 0.2, mu: 4.12, n: 8.5, dT: 0 }, options: [["a", "−8.24 × 10⁻⁴ m/s"], ["b", "+8.24 × 10⁻⁴ m/s"], ["c", "−4.12 × 10⁻⁴ m/s"]], answer: "a", expected: -8.24e-4, guesses: { a: -8.24e-4, b: 8.24e-4, c: -4.12e-4 }, why: "vₑ = −μₑE = −(4.12 × 10⁻³)(0.20) = −8.24 × 10⁻⁴ m/s. The minus sign records motion opposite E." },
        { id: "conductivity", short: "carrier density and conductivity", ref: "2.2.2", start: { E: 0.5, mu: 4, n: 4.25, dT: 0 }, prompt: "At the same mobility and temperature, carrier density doubles. What happens to κ and J for the same E?", state: { E: 0.5, mu: 4, n: 8.5, dT: 0 }, options: [["same", "Both stay the same"], ["half", "Both halve"], ["double", "Both double"]], answer: "double", expected: 2, guesses: { same: 1, half: 0.5, double: 2 }, why: "κ = nₑeμₑ, so doubling nₑ doubles conductivity. With E fixed, J = κE doubles too." },
        { id: "temperature-response", short: "copper resistivity with temperature", ref: "2.2.2", start: { E: 0.5, mu: 4, n: 8.5, dT: 0 }, prompt: "Copper has α = 3.9 × 10⁻³ K⁻¹. Near 293 K, by what factor does resistivity change after a 100 K rise?", state: { E: 0.5, mu: 4, n: 8.5, dT: 100 }, options: [["a", "1.00×"], ["b", "1.39×"], ["c", "0.61×"]], answer: "b", expected: 1.39, guesses: { a: 1, b: 1.39, c: 0.61 }, why: "ρ(T)/ρ(293 K) = 1 + αΔT = 1 + 0.0039 × 100 = 1.39. Conductivity falls to 1/1.39 of its reference value in this approximation." },
      ],
      generate: function (cfg) { var mu = 2 + Math.floor(Math.random() * 5), E = (2 + Math.floor(Math.random() * 9)) / 10, v = P.drift(mu * 1e-3, E); return numericChallenge(cfg, "drift-speed", "2.2.1", "For μₑ = " + mu + " × 10⁻³ m²/(V s) and E = " + E + " V/m, find the signed electron drift velocity.", { E: E, mu: mu, n: 8.5, dT: 0 }, v, [-v, v * 2], "m/s", "vₑ = −μₑE = −(" + mu + " × 10⁻³)(" + E + ") = " + fmt(v, "m/s") + ". The negative sign gives the electron direction."); },
    },
    {
      id: "wire", title: "2.2.3 Uniform wire", ref: "2.2.3", initial: { length: 8, area: 1, kappa: 56, mode: "voltage", source: 12 }, challenges: [
        { id: "wire-length", short: "length and resistance", ref: "2.2.3", start: { length: 4, area: 2, kappa: 50, mode: "voltage", source: 12 }, prompt: "For a uniform wire, length doubles while material and area stay fixed. How does R change?", state: { length: 4, area: 2, kappa: 50, mode: "voltage", source: 12 }, options: [["half", "It halves"], ["same", "It stays the same"], ["double", "It doubles"]], answer: "double", expected: 2, guesses: { half: 0.5, same: 1, double: 2 }, why: "R = ρl/A is proportional to length. Doubling l doubles R when the material and cross-section are unchanged." },
        { id: "wire-area", short: "diameter and resistance", ref: "2.2.3", start: { length: 4, area: Math.PI * 0.25, kappa: 50, mode: "voltage", source: 12 }, prompt: "A round wire’s diameter doubles while its material and length stay fixed. What happens to R?", state: { length: 4, area: Math.PI * 0.25, kappa: 50, mode: "voltage", source: 12 }, options: [["quarter", "It becomes one quarter"], ["half", "It halves"], ["double", "It doubles"]], answer: "quarter", expected: 0.25, guesses: { quarter: 0.25, half: 0.5, double: 2 }, why: "Cross-sectional area is proportional to diameter squared. Doubling the diameter makes A four times larger, so R = ρl/A becomes one quarter." },
        { id: "wire-ohm", short: "voltage, resistance and current", ref: "2.2.3", prompt: "A 24 Ω resistor has 12 V across it. What current flows?", state: { length: 2, area: 0.001488, kappa: 56, mode: "voltage", source: 12 }, options: [["a", "0.50 A"], ["b", "2.0 A"], ["c", "288 A"]], answer: "a", expected: 0.5, guesses: { a: 0.5, b: 2, c: 288 }, why: "I = U/R = 12/24 = 0.50 A. Multiplying U by R would not have the units of current." },
        { id: "drive-condition", short: "what changes with the source", ref: "2.2.3", start: { length: 4, area: 1, kappa: 56, mode: "voltage", source: 12 }, prompt: "Resistance doubles. Compare current at fixed voltage with voltage at fixed current.", state: { length: 8, area: 1, kappa: 56, mode: "voltage", source: 12 }, options: [["both-up", "Both double"], ["split", "I halves; U doubles"], ["both-down", "Both halve"]], answer: "split", expected: 0.5, guesses: { "both-up": 2, split: 0.5, "both-down": 0.25 }, why: "At fixed voltage, I = U/R halves. At fixed current, U = IR doubles. State which quantity the source holds fixed before predicting." },
      ],
      generate: function (cfg) { var length = 2 + Math.floor(Math.random() * 10), area = (1 + Math.floor(Math.random() * 8)) / 2, k = 10 + Math.floor(Math.random() * 41), R = P.wire(k * 1e6, length, area * 1e-6); return numericChallenge(cfg, "wire-resistance", "2.2.3", "A " + length + " m wire has area " + area + " mm² and κ = " + k + " × 10⁶ S/m. Find R.", { length: length, area: area, kappa: k, mode: "voltage", source: 12 }, R, [R * 2, R / 2], "Ω", "R = l/(κA) = " + length + "/(" + k + " × 10⁶ × " + area + " × 10⁻⁶) = " + fmt(R, "Ω") + ". Convert mm² to m² before substituting."); },
    },
    {
      id: "tolerance", title: "2.2.4 Resistor tolerance", ref: "2.2.4", initial: { nominal: 330, series: "0.1", tau: 0.1, actual: 330 }, challenges: [
        { id: "tolerance-band", short: "allowed E12 values", ref: "2.2.4", prompt: "An E12 resistor is nominally 100 Ω. What range is allowed at ±10%?", state: { nominal: 100, series: "0.1", tau: 0.1, actual: 108 }, options: [["a", "90–110 Ω"], ["b", "90–100 Ω"], ["c", "100–110 Ω"]], answer: "a", expected: 110, guesses: { a: 110, b: 90, c: 100 }, why: "The limits are 100(1 − 0.10) = 90 Ω and 100(1 + 0.10) = 110 Ω. Tolerance extends on both sides of the nominal value." },
        { id: "series-precision", short: "E-series tolerance", ref: "2.2.4", prompt: "Which of the listed preferred series has the tightest tolerance?", state: { nominal: 100, series: "0.05", tau: 0.05, actual: 100 }, options: [["e6", "E6 · ±20%"], ["e12", "E12 · ±10%"], ["e24", "E24 · ±5%"]], answer: "e24", expected: 0.05, guesses: { e6: 0.2, e12: 0.1, e24: 0.05 }, why: "E24 has the smallest tolerance of those shown: ±5%, compared with E12 ±10% and E6 ±20%. A smaller band means a closer allowed match to nominal." },
        { id: "inside-band", short: "classifying a measured resistor", ref: "2.2.4", prompt: "A 100 Ω E12 part measures 108 Ω. Is that within tolerance?", state: { nominal: 100, series: "0.1", tau: 0.1, actual: 108 }, options: [["in", "Inside"], ["high", "Too high"], ["low", "Too low"]], answer: "in", expected: 1, guesses: { in: 1, high: 2, low: -1 }, why: "The allowed E12 interval is 90–110 Ω. Since 108 Ω lies inside it, this measurement is within tolerance." },
        { id: "overlap-bands", short: "overlap of two tolerance bands", ref: "2.2.4", prompt: "Do 100 Ω and 120 Ω E12 ranges overlap?", state: { nominal: 100, otherNominal: 120, series: "0.1", tau: 0.1, actual: 109 }, options: [["no", "No overlap"], ["yes", "Yes, from 108 Ω to 110 Ω"], ["same", "They are identical ranges"]], answer: "yes", expected: 1, guesses: { no: 0, yes: 1, same: 2 }, why: "The ranges are 90–110 Ω and 108–132 Ω. Their overlap is 108–110 Ω; nominal values can differ while allowed actual values still intersect." },
      ],
      generate: function (cfg) { var nominal = 200 + Math.floor(Math.random() * 17) * 50, tau = [0.05, 0.1, 0.2][Math.floor(Math.random() * 3)], hi = P.tolerance(nominal, tau).high; return numericChallenge(cfg, "upper-tolerance", "2.2.4", "A resistor is nominally " + nominal + " Ω with ±" + Math.round(tau * 100) + "% tolerance. What is its upper allowed value?", { nominal: nominal, series: String(tau), tau: tau, actual: nominal }, hi, [nominal * (1 - tau), nominal], "Ω", "Upper limit = Rnom(1 + τ) = " + nominal + "(1 + " + tau + ") = " + fmt(hi, "Ω") + ". Add the tolerance to nominal for the upper bound."); },
    },
    {
      id: "interface", title: "2.3 Conductivity interface", ref: "2.3", initial: { k1: 2, k2: 8, Jn: 4, Et: 3 }, challenges: [
        { id: "normal-current", short: "normal current continuity", ref: "2.3", prompt: "Jₙ₁ = 4 A/m² reaches a stationary interface. What is Jₙ₂?", state: { k1: 2, k2: 8, Jn: 4, Et: 3 }, options: [["zero", "0 A/m²"], ["same", "4 A/m²"], ["double", "8 A/m²"]], answer: "same", expected: 4, guesses: { zero: 0, same: 4, double: 8 }, why: "Charge does not accumulate at the stationary boundary, so the normal current density is continuous: Jₙ₂ = Jₙ₁ = 4 A/m²." },
        { id: "tangent-field", short: "tangential field continuity", ref: "2.3", prompt: "A tangential field of 3 V/m reaches the boundary. What is Eₜ₂ in the stationary case?", state: { k1: 2, k2: 8, Jn: 4, Et: 3 }, options: [["same", "3 V/m"], ["quarter", "0.75 V/m"], ["four", "12 V/m"]], answer: "same", expected: 3, guesses: { same: 3, quarter: 0.75, four: 12 }, why: "The tangential electric field is continuous, so Eₜ₂ = Eₜ₁ = 3 V/m. It is the tangential current density, κEₜ, that changes with conductivity." },
        { id: "component-ratios", short: "tangential current in a better conductor", ref: "2.3", prompt: "κ₂ is four times κ₁ and Eₜ is continuous. Compare Jₜ₂ with Jₜ₁.", state: { k1: 2, k2: 8, Jn: 4, Et: 3 }, options: [["same", "It is the same"], ["quarter", "It is one quarter"], ["four", "It is four times larger"]], answer: "four", expected: 4, guesses: { same: 1, quarter: 0.25, four: 4 }, why: "Jₜ = κEₜ and Eₜ is the same on both sides, so Jₜ₂/Jₜ₁ = κ₂/κ₁ = 8/2 = 4." },
        { id: "current-angle", short: "current direction after crossing", ref: "2.3", prompt: "κ₁ = 2 S/m, κ₂ = 8 S/m, Jₙ = 4 A/m² and Eₜ = 3 V/m. What is α₂ from the normal?", state: { k1: 2, k2: 8, Jn: 4, Et: 3 }, options: [["a", "56.3°"], ["b", "80.5°"], ["c", "14.0°"]], answer: "b", expected: 80.5, guesses: { a: 56.3, b: 80.5, c: 14 }, why: "Jₜ₂ = κ₂Eₜ = 24 A/m², while Jₙ₂ = 4 A/m². Thus α₂ = arctan(Jₜ₂/Jₙ₂) = arctan(6) ≈ 80.5° from the normal." },
      ],
      generate: function (cfg) { var k1 = 1 + Math.floor(Math.random() * 4), k2 = k1 * 2, Jn = 2 + Math.floor(Math.random() * 6), Et = 2 + Math.floor(Math.random() * 5), ratio = P.interface(k1, k2, Jn, Et).Jt2 / P.interface(k1, k2, Jn, Et).Jt1; return challenge(cfg, { id: "gen-tangential-ratio-" + Math.floor(Math.random() * 1e9), short: "tangential current ratio", ref: "2.3", prompt: "κ₁ = " + k1 + " S/m and κ₂ = " + k2 + " S/m share Eₜ = " + Et + " V/m. How does Jₜ₂ compare with Jₜ₁?", state: { k1: k1, k2: k2, Jn: Jn, Et: Et }, expected: ratio, options: [["double", "2× Jₜ₁"], ["same", "The same Jₜ₁"], ["half", "½× Jₜ₁"]], answer: "double", guesses: { double: 2, same: 1, half: 0.5 }, why: "Jₜ = κEₜ and Eₜ is continuous, so the ratio equals κ₂/κ₁ = " + k2 + "/" + k1 + " = " + ratio + ". The second material carries twice the tangential current density." }); },
    },
    {
      id: "power", title: "2.4 Power and energy", ref: "2.4", initial: { mode: "voltage", source: 12, R: 24, time: 180, volume: 0.01 }, challenges: [
        { id: "power-voltage", short: "power at fixed voltage", ref: "2.4", prompt: "A 24 Ω resistor has 12 V across it. How much power is dissipated?", state: { mode: "voltage", source: 12, R: 24, time: 180, volume: 0.01 }, options: [["a", "6 W"], ["b", "0.5 W"], ["c", "288 W"]], answer: "a", expected: 6, guesses: { a: 6, b: 0.5, c: 288 }, why: "P = U²/R = 12²/24 = 6 W. The same result follows from I = U/R = 0.5 A and P = UI." },
        { id: "power-current", short: "power at fixed current", ref: "2.4", prompt: "A 24 Ω resistor carries 0.50 A. What power is dissipated?", state: { mode: "current", source: 0.5, R: 24, time: 180, volume: 0.01 }, options: [["a", "12 W"], ["b", "6 W"], ["c", "0.25 W"]], answer: "b", expected: 6, guesses: { a: 12, b: 6, c: 0.25 }, why: "P = I²R = (0.50)² × 24 = 6 W. At the same current, a larger resistance means more power is dissipated." },
        { id: "energy-time", short: "energy transferred over time", ref: "2.4", prompt: "A resistor dissipates 6 W for 3 minutes. How much energy is transferred?", state: { mode: "voltage", source: 12, R: 24, time: 180, volume: 0.01 }, options: [["a", "18 J"], ["b", "1080 J"], ["c", "360 J"]], answer: "b", expected: 1080, guesses: { a: 18, b: 1080, c: 360 }, why: "Convert 3 min to 180 s, then W = PT = 6 × 180 = 1080 J. Multiplying by minutes without converting would leave the units inconsistent." },
        { id: "power-density", short: "local density and total power", ref: "2.4", prompt: "A uniform conductor has E = 6 V/m, J = 100 A/m² and volume 0.010 m³. Find total power from pV.", state: { mode: "voltage", source: 12, R: 24, time: 180, volume: 0.01 }, options: [["a", "600 W"], ["b", "6 W"], ["c", "0.60 W"]], answer: "b", expected: 6, guesses: { a: 600, b: 6, c: 0.6 }, why: "pV = E·J = 600 W/m³. For a uniform 0.010 m³ volume, P = pVV = 600 × 0.010 = 6 W. Power density and total power have different units." },
      ],
      generate: function (cfg) { var U = 6 + Math.floor(Math.random() * 19), R = 10 + Math.floor(Math.random() * 19) * 5, P6 = (U * U) / R; return numericChallenge(cfg, "resistor-power", "2.4", "A " + R + " Ω resistor is held at " + U + " V. Find its power.", { mode: "voltage", source: U, R: R, time: 120, volume: 0.01 }, P6, [U / R, P6 * 2], "W", "P = U²/R = " + U + "²/" + R + " = " + fmt(P6, "W") + ". U/R is current, not power."); },
    },
  ];

  configs.forEach(function (def) { document.querySelectorAll('[data-experiment="' + def.id + '"]').forEach(function (root) { mount(root, def, def.initial); }); });
})();
