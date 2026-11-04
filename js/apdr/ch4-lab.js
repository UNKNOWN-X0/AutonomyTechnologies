/* APDR Chapter 4: binary fractions, spacing, arithmetic, IEEE fields, and special values. */
(function () {
  var P = window.APDR4, observer;

  function colours(stage) {
    var s = getComputedStyle(stage);
    return { paper: s.getPropertyValue("--paper").trim(), panel: s.getPropertyValue("--paper-2").trim(), ink: s.getPropertyValue("--ink").trim(), muted: s.getPropertyValue("--muted").trim(), line: s.getPropertyValue("--line").trim(), fau: s.getPropertyValue("--fau-mark").trim(), course: s.getPropertyValue("--course").trim(), font: s.getPropertyValue("--f-display").trim() };
  }
  function queue(canvas, state, painter) {
    canvas._labState = state;
    if (canvas._paint) cancelAnimationFrame(canvas._paint);
    canvas._paint = requestAnimationFrame(function () {
      canvas._paint = 0;
      var r = canvas.parentElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = canvas.getContext("2d"), c = colours(canvas.parentElement);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, r.width, r.height); ctx.lineJoin = "round"; ctx.lineCap = "round";
      painter(ctx, r.width, r.height, c, state);
    });
  }
  function text(ctx, value, x, y, c, size, color, align) {
    ctx.fillStyle = color || c.ink; ctx.font = "600 " + (size || 14) + "px " + (c.font || "sans-serif");
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle"; ctx.fillText(String(value), x, y);
  }
  function box(ctx, value, x, y, w, h, c, active, size) {
    ctx.fillStyle = active ? c.panel : c.paper; ctx.strokeStyle = active ? c.fau : c.line; ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); text(ctx, value, x + w / 2, y + h / 2, c, size || 13);
  }
  function line(ctx, x1, y1, x2, y2, c, active) {
    ctx.strokeStyle = active ? c.fau : c.muted; ctx.lineWidth = active ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function arrow(ctx, x1, y1, x2, y2, c, active) {
    line(ctx, x1, y1, x2, y2, c, active);
    var a = Math.atan2(y2 - y1, x2 - x1), l = 7; ctx.fillStyle = active ? c.fau : c.muted;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - l * Math.cos(a - .45), y2 - l * Math.sin(a - .45));
    ctx.lineTo(x2 - l * Math.cos(a + .45), y2 - l * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }
  function animate(state, show, finish) {
    state.revealing = true;
    return Lab.tween(1400, function (t) { state.progress = t; show(); }).then(function () {
      state.revealing = false; finish(); show();
    });
  }
  function lock(form, section, on) {
    form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = on; });
    section.querySelector(".stage").classList.toggle("locked", on);
  }
  function labelOf(spec, key) {
    var hit = spec.options.filter(function (o) { return o[0] === key; })[0];
    return hit ? hit[1] : key;
  }
  function challenge(show, state, spec) {
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer, why: spec.why,
      stage: function () { state.calc = null; state.ieeeResult = null; state.displayValue = null; Object.assign(state, spec.state); state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; state.guess = ""; show(); },
      preview: function (choice) { state.guess = labelOf(spec, choice); show(); },
      reveal: function () { return animate(state, show, function () { state.result = labelOf(spec, spec.answer); }); },
    };
  }
  function mount(id, title, ref, state, challenges, read, apply, painter, generate) {
    var section = document.querySelector('[data-experiment="' + id + '"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      out = form.querySelector('[data-out="result"]'),
      show = function () { queue(canvas, state, painter); },
      // Back to the form's values with no challenge leftovers; invalid form text keeps the last good drawing.
      fresh = function () {
        state.challenge = false; state.guess = ""; state.progress = 0; state.revealing = false; state.calc = null; state.ieeeResult = null; state.displayValue = null;
        try { var next = Object.assign({}, state, read(form)); apply(next); Object.assign(state, next); } catch (e) {}
        state.result = null; out.textContent = "—";
        form.dispatchEvent(new Event("change")); show();
      };
    canvas._painter = painter;
    Lab.experiment({
      id: id, title: title, card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { c.stage(); },
      sandbox: fresh,
      challenges: challenges.map(function (item) { return challenge(show, state, item); }),
      // Endless practice: generate() returns a spec like the fixed ones (tests/lab-generators.test.js checks it).
      generate: generate && function () { return challenge(show, state, generate()); },
    });
    form.querySelector('[data-act="run"]').addEventListener("click", function () {
      try {
        var next = Object.assign({}, state, read(form), { challenge: false, guess: "" });
        next.result = apply(next);
        Object.assign(state, next); out.textContent = state.result;
      } catch (e) {
        state.result = null; out.textContent = e.message || "Check the inputs.";
      }
      show();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () {
      form.reset(); fresh();
    });
    if (typeof ResizeObserver !== "undefined") {
      observer = observer || new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { var cv = entry.target.querySelector("canvas"); if (cv && cv._labState) queue(cv, cv._labState, cv._painter); });
      });
      observer.observe(canvas.parentElement);
    }
  }
  function resultText(result) { return Number(result).toPrecision(8).replace(/(?:\.0+|(?:(\.\d*?)0+))(?=e|$)/, "$1"); }
  function field(ctx, name, value, x, y, w, h, c, active, size) {
    text(ctx, name, x + w / 2, y - 16, c, 12, c.muted);
    box(ctx, value, x, y, w, h, c, active, size);
  }
  // Shrinks a line to the stage width, so long option labels fit at phone size.
  function fit(ctx, value, x, y, w, c, size, color) {
    for (var s = size; s > 9; s--) {
      ctx.font = "600 " + s + "px " + (c.font || "sans-serif");
      if (ctx.measureText(value).width <= w - 24) break;
    }
    text(ctx, value, x, y, c, s, color);
  }
  function sci(parts) { return parts.text.replace(/e\+?(-?\d+)$/, " × 10^$1").replace(/-/g, "−"); }
  // Sits above the absolutely placed .stage-note.
  function drawGuess(ctx, w, h, c, s, noResult) {
    if (s.guess) fit(ctx, "Your prediction: " + s.guess, w / 2, h - 58, w, c, 12);
    if (s.result && !noResult) fit(ctx, "Result: " + s.result, w / 2, h - 82, w, c, 13, c.fau);
  }
  function drawRemainders(ctx, w, h, c, s) {
    var r = P.remainderSteps(1, 10), cols = r.steps.concat([{ remainder: r.next, bit: null }]), n = cols.length,
      cw = Math.min(64, (w - 32) / n), x0 = (w - n * cw) / 2, open = s.revealing || !!s.result;
    text(ctx, s.displayValue + " in binary: double the remainder, keep the whole part", w / 2, 25, c, Math.min(15, w / 26));
    text(ctx, "remainder", x0 + cw * n / 2, 66, c, 11, c.muted);
    for (var i = 0; i < n; i++) {
      var seen = open && (s.result || s.progress > i / n), again = i === r.repeatsFrom || i === n - 1;
      box(ctx, seen ? resultText(cols[i].remainder) : "?", x0 + i * cw + 3, 78, cw - 6, 36, c, !!seen && again, 13);
      if (cols[i].bit != null) text(ctx, seen ? "bit " + cols[i].bit : "?", x0 + i * cw + cw / 2, 132, c, 11, c.muted);
    }
    if (s.result || (open && s.progress > .95)) {
      text(ctx, "Remainder " + resultText(r.next) + " is back, so the bits repeat", w / 2, 170, c, 13, c.fau);
      text(ctx, s.displayValue + " = 0.0001 1001 1001…₂", w / 2, 199, c, 13);
    } else text(ctx, "Predict: does a remainder ever reach zero?", w / 2, 170, c, 13, c.muted);
    drawGuess(ctx, w, h, c, s);
  }
  function drawFraction(ctx, w, h, c, s) {
    if (s.displayValue) return drawRemainders(ctx, w, h, c, s);
    text(ctx, "Each binary fraction bit halves the place value", w / 2, 25, c, 15);
    var parts = String(s.bits || "0.1011").split("."), whole = parts[0] || "0", all = parts[1] || "", bits = all.slice(0, 12),
      n = bits.length, cw = Math.min(42, (w - 42) / Math.max(n, 1)), x0 = (w - n * cw) / 2, open = !s.challenge || s.revealing || !!s.result, sum = [];
    if (Number(whole)) text(ctx, "Whole part " + whole + "₂ = " + parseInt(whole, 2) + ", plus:", w / 2, 48, c, 12, c.muted);
    for (var i = 0; i < n; i++) {
      var visible = !s.challenge || s.revealing && s.progress > i / Math.max(n, 1) || !!s.result;
      text(ctx, "2^−" + (i + 1), x0 + i * cw + cw / 2, 68, c, 10, c.muted);
      box(ctx, visible ? bits[i] : "?", x0 + i * cw + 3, 83, cw - 6, 39, c, s.revealing && s.progress > i / Math.max(n, 1), 16);
      text(ctx, visible && bits[i] === "1" ? "keep" : visible ? "skip" : "?", x0 + i * cw + cw / 2, 142, c, 10, c.muted);
      if (visible && bits[i] === "1") sum.push(resultText(Math.pow(2, -(i + 1))));
    }
    if (all.length > 12) text(ctx, "Showing the first 12 of " + all.length + " bits", w / 2, 158, c, 11, c.muted);
    arrow(ctx, w * .24, 172, w * .76, 172, c, s.revealing);
    text(ctx, open ? "Sum the selected powers of 2" : "Predict the decimal value", w / 2, 192, c, 13, c.muted);
    if (open && sum.length) fit(ctx, sum.join(" + "), w / 2, 216, w, c, 13, c.fau);
    drawGuess(ctx, w, h, c, s);
  }
  function drawSpacing(ctx, w, h, c, s) {
    var e = Number(s.exponent == null ? 3 : s.exponent), p = Number(s.precision == null ? 4 : s.precision),
      gap = P.spacing(e, p), start = Math.pow(2, e), steps = Math.pow(2, p - 1), count = Math.min(steps, 16),
      x0 = 34, x1 = w - 34, y = 126, dx = (x1 - x0) / count,
      reveal = !s.challenge || s.revealing || !!s.result, shown = reveal ? Math.ceil(count * (s.revealing ? s.progress : 1)) : 0;
    text(ctx, "Sample of representable values in one exponent zone", w / 2, 25, c, 15);
    text(ctx, (steps > count ? "First 16 of " + steps + " steps from 2^" + e : "2^" + e + " to 2^" + (e + 1)) + "   ·   " + p + " significant bits", w / 2, 55, c, 13, c.muted);
    line(ctx, x0, y, x1, y, c, false);
    for (var i = 0; i <= shown; i++) {
      var x = x0 + dx * i;
      line(ctx, x, y - (i % Math.max(1, Math.floor(count / 4)) === 0 ? 12 : 7), x, y + 12, c, s.revealing && s.progress > i / count);
      if (reveal && i % Math.max(1, Math.floor(count / 4)) === 0) text(ctx, resultText(start + i * gap), x, y + 31, c, 10, c.muted);
    }
    text(ctx, reveal ? "Adjacent gap = " + resultText(gap) : "Predict the distance between adjacent values", w / 2, 207, c, 15, reveal ? c.fau : c.ink);
    if (reveal) text(ctx, "Exponent sets scale     ·     precision sets spacing", w / 2, 237, c, 12, c.muted);
    drawGuess(ctx, w, h, c, s);
  }
  function drawArithmetic(ctx, w, h, c, s) {
    var showWork = !s.challenge || s.revealing || !!s.result;
    text(ctx, s.mode === "ieee" ? "IEEE single-precision addition" : "Scientific-notation arithmetic", w / 2, 25, c, 15);
    if (s.mode === "ieee" && !s.ieeeResult) {
      text(ctx, "Press Calculate to trace the addition", w / 2, 102, c, 14, c.muted);
      drawGuess(ctx, w, h, c, s); return;
    }
    if (s.mode === "ieee") {
      var r = s.ieeeResult, x = 24, top = 84, full = w - 48, diff = r.exponentDifference;
      if (!showWork) {
        text(ctx, resultText(r.left.value) + " + " + resultText(r.right.value) + " · predict the sum", w / 2, 102, c, 14, c.muted);
        drawGuess(ctx, w, h, c, s); return;
      }
      fit(ctx, "Restore the hidden bit, then align to exponent " + r.exponent, w / 2, 40, w, c, 12, c.muted);
      field(ctx, "larger: " + resultText(r.larger.value), r.larger.significand, x, top, full * .43, 36, c, s.revealing && s.progress > .15, 12);
      field(ctx, "smaller, shifted right " + diff, r.smaller.significand + (diff ? " × 2^−" + diff : ""), x + full * .53, top, full * .47, 36, c, s.revealing && s.progress > .4, 12);
      arrow(ctx, w * .25, 136, w * .75, 136, c, s.revealing);
      fit(ctx, "Normalised sum: " + r.significand + " × 2^" + String(r.resultExponent).replace("-", "−"), w / 2, 163, w, c, 14, c.fau);
      fit(ctx, "Rounded single-precision result: " + (s.result || (s.revealing ? "—" : resultText(r.result.value))), w / 2, 193, w, c, 13);
      drawGuess(ctx, w, h, c, s, true); return;
    }
    var exp = s.operation === "multiply" ? Number(s.e1) + Number(s.e2) : Math.max(Number(s.e1), Number(s.e2));
    text(ctx, String(s.m1) + " × 10^" + s.e1, w * .25, 79, c, 14);
    text(ctx, s.operation === "multiply" ? "×" : "+", w / 2, 79, c, 19, c.course);
    text(ctx, String(s.m2) + " × 10^" + s.e2, w * .75, 79, c, 14);
    if (s.operation === "add") {
      if (showWork) text(ctx, "Align to exponent " + exp + " · smaller coefficient shifts right", w / 2, 116, c, 12, c.muted);
      if (showWork && s.calc && s.calc.aligned) text(ctx, resultText(s.calc.aligned[0]) + " + " + resultText(s.calc.aligned[1]) + " at 10^" + exp, w / 2, 145, c, 13, s.revealing ? c.fau : c.ink);
    } else if (showWork) text(ctx, "Multiply coefficients · add exponents", w / 2, 123, c, 13, c.muted);
    arrow(ctx, w * .25, 174, w * .75, 174, c, s.revealing);
    if (showWork && s.calc) fit(ctx, "Exact: " + sci(s.calc.exactScientific) + " · rounded: " + sci(s.calc.roundedScientific), w / 2, 207, w, c, 12, c.fau);
    drawGuess(ctx, w, h, c, s);
  }
  function drawIeee(ctx, w, h, c, s) {
    text(ctx, "IEEE single precision · 32 stored bits", w / 2, 26, c, 15);
    var d = s.fields || P.float32(42.6875), gap = 7, x = 22, y = 91, total = w - 44, sw = 34, ew = total * .29, fw = total - sw - ew - gap * 2,
      hideFields = s.challenge && !s.revealing && !s.result;
    field(ctx, hideFields ? "S" : "S · 1 bit", hideFields ? "?" : d.sign, x, y, sw, 42, c, s.revealing && s.progress > .15, 14);
    field(ctx, hideFields ? "E" : "E · 8 bits", hideFields ? "?" : d.exponent, x + sw + gap, y, ew, 42, c, s.revealing && s.progress > .4, 12);
    field(ctx, hideFields ? "F" : "F · 23 bits", hideFields ? "?" : d.fraction, x + sw + ew + gap * 2, y, fw, 42, c, s.revealing && s.progress > .65, Math.max(7, Math.min(10, fw / 28)));
    text(ctx, hideFields ? "Predict the bit fields" : "Exponent bias = 127", w / 2, 166, c, 13, c.muted);
    if (!hideFields) {
      var stored = parseInt(d.exponent, 2), trimmed = d.significand.replace(/0+$/, "").replace(/\.$/, ".0");
      if (d.classification === "normalised") {
        fit(ctx, "E = " + stored + ", so the exponent is " + stored + " − 127 = " + String(stored - 127).replace("-", "−"), w / 2, 193, w, c, 12, c.ink);
        fit(ctx, (d.sign === "1" ? "−" : "+") + trimmed + "₂ × 2^" + String(stored - 127).replace("-", "−") + " · hidden 1 restored", w / 2, 216, w, c, 12, c.muted);
      } else text(ctx, "Reserved exponent: no hidden leading 1 here", w / 2, 193, c, 12, c.muted);
    }
    drawGuess(ctx, w, h, c, s);
  }
  function drawSpecial(ctx, w, h, c, s) {
    text(ctx, "Classify from exponent and fraction fields", w / 2, 25, c, 15);
    var sign = s.sign == null ? "0" : String(s.sign), exp = String(s.exponent || "11111111"), frac = String(s.fraction || "00000000000000000000000"),
      x = 20, y = 85, total = w - 40, sw = 34, ew = total * .3, fw = total - sw - ew - 14,
      hideFields = s.challenge && !s.revealing && !s.result;
    field(ctx, "S", hideFields ? "?" : sign, x, y, sw, 40, c, s.revealing && s.progress > .15, 14);
    field(ctx, "E · 8 bits", hideFields ? "????????" : exp, x + sw + 7, y, ew, 40, c, s.revealing && s.progress > .4, 12);
    field(ctx, "F · 23 bits", hideFields ? "???????????????????????" : frac, x + sw + ew + 14, y, fw, 40, c, s.revealing && s.progress > .65, Math.max(7, Math.min(10, fw / 28)));
    text(ctx, "Exponent 0 and 255 reserve encodings for edge cases", w / 2, 156, c, 12, c.muted);
    if (!s.result) text(ctx, hideFields ? "Predict the value class" : "Inspect both fields before naming the value", w / 2, 189, c, 14, c.ink);
    drawGuess(ctx, w, h, c, s);
  }
  function readFraction(form) { return { bits: form.querySelector("[data-bits]").value.trim() }; }
  function fractionResult(state) { return resultText(P.fractionValue(state.bits)); }
  function readSpacing(form) { return { exponent: Number(form.querySelector("[data-exp]").value), precision: Number(form.querySelector("[data-precision]").value) }; }
  function spacingResult(state) { return resultText(P.spacing(state.exponent, state.precision)); }
  function readArithmetic(form) {
    return { mode: form.querySelector("[data-mode]").value, operation: form.querySelector("[data-operation]").value,
      m1: Number(form.querySelector("[data-m1]").value), e1: Number(form.querySelector("[data-e1]").value),
      m2: Number(form.querySelector("[data-m2]").value), e2: Number(form.querySelector("[data-e2]").value),
      precision: Number(form.querySelector("[data-digits]").value) };
  }
  function arithmeticResult(state) {
    if (state.mode === "ieee") {
      var r = P.singleAdd(state.m1, state.m2); state.ieeeResult = r; state.calc = null;
      return resultText(r.result.value);
    }
    state.ieeeResult = null;
    var r = P.scientificOperation(state.m1, state.e1, state.m2, state.e2, state.operation, state.precision); state.calc = r;
    return sci(r.roundedScientific);
  }
  function readIeee(form) { return { task: form.querySelector("[data-task]").value, input: form.querySelector("[data-value]").value.trim() }; }
  function ieeeResult(state) {
    var d = state.task === "encode" ? P.float32(P.parseDecimal(state.input)) : P.decodeSingle(state.input);
    state.fields = d;
    return (state.task === "encode" ? "0x" + d.hex : d.value === Infinity || d.value === -Infinity || Number.isNaN(d.value) ? String(d.value) : resultText(d.value)) +
      " · " + d.classification;
  }
  function readSpecial(form) {
    return { sign: form.querySelector("[data-sign]").value, exponent: form.querySelector("[data-exponent]").value.trim(),
      fraction: form.querySelector("[data-fraction]").value.trim() };
  }
  function specialResult(state) { return P.classifySingle(state.sign, state.exponent, state.fraction); }

  

  function rnd(n) { return Math.floor(Math.random() * n); }
  function mix(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Up to three options: the right one first in the pool, then distinct wrong ones, shuffled. Each item is [key, label].
  function pick(right, wrongs) {
    var out = [right];
    wrongs.forEach(function (w) { if (out.length < 3 && out.every(function (o) { return o[0] !== w[0]; })) out.push(w); });
    return mix(out);
  }
  function num(v) { return String(+v.toPrecision(10)); }
  function sup(n) { return String(n).replace(/-/g, "⁻").replace(/\d/g, function (d) { return "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]; }); }
  function minus(n) { return String(n).replace(/-/g, "−"); }
  var GEN = {
    spacing: function () {
      var e = rnd(8) - 2, p = 2 + rnd(5), gap = P.spacing(e, p), lo = Math.pow(2, e), o = function (v) { return [num(v), num(v)]; };
      return { id: "gen-spacing", short: "calculate one gap", ref: "4.1", prompt: "Normalised numbers in [" + num(lo) + ", " + num(2 * lo) + ") with " + p + " significant bits: what is the gap between neighbours?",
        options: pick(o(gap), [o(gap * 2), o(gap / 2), o(gap * 4)]), answer: num(gap), state: { exponent: e, precision: p },
        why: "Here e=" + minus(e) + " and p=" + p + ", so the gap is 2^(e−p+1) = 2" + sup(e - p + 1) + " = " + num(gap) + ". The zone [" + num(lo) + ", " + num(2 * lo) + ") is split into 2" + sup(p - 1) + " equal steps." };
    },
    fractions: function () {
      var n = 3 + rnd(3), bits = "", i;
      for (i = 0; i < n - 1; i++) bits += rnd(2);
      bits += "1";
      var val = function (b) { return b.split("").reduce(function (t, d, k) { return t + (d === "1" ? Math.pow(2, -(k + 1)) : 0); }, 0); },
        v = val(bits), rev = val(bits.split("").reverse().join("")), o = function (x) { return [num(x), num(x)]; },
        terms = bits.split("").map(function (d, k) { return d === "1" ? "1/" + Math.pow(2, k + 1) : null; }).filter(Boolean);
      return { id: "gen-fraction", short: "binary fraction value", ref: "4.2", prompt: "What decimal value does 0." + bits + "₂ represent?",
        options: pick(o(v), [o(rev), o(v + Math.pow(2, -n)), o(v - Math.pow(2, -n)), o(parseInt(bits, 2) / 10)]), answer: num(v), state: { bits: "0." + bits },
        why: "Each place after the point is a negative power of 2: " + terms.join(" + ") + " = " + num(v) + ". Reading the places from the right instead gives " + num(rev) + "." };
    },
    arithmetic: function () {
      var a = 11 + rnd(89), b = 11 + rnd(89), e1 = rnd(6) - 2, e2 = rnd(6) - 3, c = a * b, e = e1 + e2, coef = c / 100, big = c >= 1000,
        nc = big ? coef / 10 : coef, ne = big ? e + 1 : e, key = function (m, x) { return num(m) + "e" + x; }, lab = function (m, x) { return num(m) + " × 10" + sup(x); },
        m1 = a / 10, m2 = b / 10;
      return { id: "gen-multiply", short: "multiply and normalise", ref: "4.3", prompt: "Calculate (" + num(m1) + "×10" + sup(e1) + ")(" + num(m2) + "×10" + sup(e2) + ") and normalise.",
        options: pick([key(nc, ne), lab(nc, ne)], [[key(coef, e), lab(coef, e)], [key(nc, ne + 1), lab(nc, ne + 1)], [key(nc, ne - 1), lab(nc, ne - 1)]]), answer: key(nc, ne),
        state: { mode: "decimal", operation: "multiply", m1: m1, e1: e1, m2: m2, e2: e2, precision: 4, calc: P.scientificOperation(m1, e1, m2, e2, "multiply", 4) },
        why: "Multiply the coefficients and add the exponents: " + num(m1) + "×" + num(m2) + " = " + num(coef) + ", and " + minus(e1) + " + " + minus(e2) + " = " + minus(e) + "." + (big ? " The coefficient is 10 or more, so shift it one place and raise the exponent: " + lab(nc, ne) + "." : " The coefficient is already between 1 and 10, so the result is " + lab(nc, ne) + ".") };
    },
    ieee: function () {
      var f; do { f = 110 + rnd(40); } while (f === 127);
      var t = f - 127, value = 1.5 * Math.pow(2, t), o = function (x) { return [String(x), minus(x)]; };
      return { id: "gen-bias", short: "unbias exponent", ref: "4.4", prompt: "A normalised single has exponent field " + f.toString(2).padStart(8, "0") + "₂, or " + f + ". What is its true exponent?",
        options: pick(o(t), [o(-t), o(f), o(f - 128)]), answer: String(t), state: { task: "encode", input: num(value), fields: P.float32(value) },
        why: "The single-precision bias is 127. Subtract it from the stored field: " + f + " − 127 = " + minus(t) + "." };
    },
    special: function () {
      var kinds = ["zero", "subnormal", "normal", "infinity", "NaN"], k = kinds[rnd(5)], sign = String(rnd(2)), frac = "", i,
        exponent = k === "zero" || k === "subnormal" ? "00000000" : k === "infinity" || k === "NaN" ? "11111111" : (1 + rnd(254)).toString(2).padStart(8, "0");
      if (k === "zero" || k === "infinity") frac = "00000000000000000000000";
      else { for (i = 0; i < 23; i++) frac += rnd(4) ? "0" : "1"; if (!/1/.test(frac)) frac = frac.slice(0, 22) + "1"; }
      var label = { zero: "Zero (sign set by the sign bit)", subnormal: "A denormalised number", normal: "A normalised number", infinity: "Infinity", NaN: "NaN" },
        all = kinds.map(function (x) { return [x, label[x]]; }),
        why = { zero: "Exponent zero with a zero fraction is zero; the sign bit only picks +0 or −0.", subnormal: "Exponent zero with a non-zero fraction is denormalised: the leading bit is 0, so it reaches closer to zero than any normalised value.",
          normal: "Any exponent field between 1 and 254 is normalised: value = (−1)^s × 1.f × 2^(e−127).", infinity: "An all-ones exponent with a zero fraction is infinity, signed by the sign bit.", NaN: "An all-ones exponent with any non-zero fraction is NaN." }[k];
      return { id: "gen-special", short: "classify the fields", ref: "4.5", prompt: "Sign " + sign + ", exponent " + exponent + ", fraction " + (/1/.test(frac) ? "non-zero" : "all zero") + ". What does it encode?",
        options: pick([k, label[k]], mix(all.slice())), answer: k, state: { sign: sign, exponent: exponent, fraction: frac }, why: why };
    },
  };

mount("spacing", "4.1 Range and precision", "4.1", { kind: "spacing", exponent: 3, precision: 4 }, [
  { id: "spacing-scale", short: "exponent changes scale", ref: "4.1", prompt: "With precision held at 4 bits, what happens to the gap when the exponent rises from 3 to 4?", options: [["halves", "It halves"], ["doubles", "It doubles"], ["same", "It stays the same"]], answer: "doubles", why: "Within an exponent zone the gap is 2^(e−p+1), as the guide’s §4.1 card shows. Raising e by one doubles that gap while keeping precision fixed.", state: { exponent: 4, precision: 4 } },
  { id: "spacing-precision", short: "more significand bits", ref: "4.1", prompt: "At exponent 3, precision increases from 4 bits to 5 bits. What happens to adjacent spacing?", options: [["doubles", "It doubles"], ["range-doubles", "The exponent range doubles"], ["halves", "It halves"]], answer: "halves", why: "One extra significand bit divides each exponent zone into twice as many steps. Adjacent spacing halves; the exponent range is unchanged.", state: { exponent: 3, precision: 5 } },
  { id: "spacing-number", short: "calculate one gap", ref: "4.1", prompt: "For normalised numbers in [8,16) with 4 significant bits, what is the spacing?", options: [["1", "1"], ["0.5", "0.5"], ["2", "2"]], answer: "1", why: "Here e=3 and p=4, so spacing is 2^(3−4+1)=1. The four significant bits determine the steps within this zone.", state: { exponent: 3, precision: 4 } },
  { id: "spacing-finite", short: "finite range", ref: "4.1", prompt: "Does a fixed floating-point format represent every real number, including arbitrarily large values?", options: [["yes", "Yes, the exponent covers every magnitude"], ["no", "No, it has finite range and finitely many values"], ["only fractions", "Only fractional values are bounded"]], answer: "no", why: "A format has finitely many exponent and significand patterns. It covers a wide but bounded range, with spacing that varies by exponent zone.", state: { exponent: 6, precision: 5 } },
  ], readSpacing, spacingResult, drawSpacing, GEN.spacing);

mount("fractions", "4.2 Binary fractions", "4.2", { kind: "fraction", bits: "0.1011" }, [
    { id: "fraction-101", short: "binary fraction 0.101", ref: "4.2", prompt: "What decimal value does 0.101₂ represent?", options: [["0.75", "0.75"], ["0.5", "0.5"], ["0.625", "0.625"]], answer: "0.625", why: "Keep the first and third places: 1/2+1/8=0.625. Each position after the point is a negative power of 2.", state: { bits: "0.101" } },
    { id: "fraction-01101", short: "five-bit fraction", ref: "4.2", prompt: "Convert 0.01101₂ to decimal.", options: [["0.40625", "0.40625"], ["0.375", "0.375"], ["0.3125", "0.3125"]], answer: "0.40625", why: "The 1 bits contribute 1/4, 1/8, and 1/32. Their sum is 0.40625.", state: { bits: "0.01101" } },
    { id: "fraction-terminating", short: "terminating conversion", ref: "4.2", prompt: "What is 0.6875 in binary?", options: [["0.1101", "0.1101"], ["0.1011", "0.1011"], ["0.1010", "0.1010"]], answer: "0.1011", why: "Repeatedly multiply by 2 to get bits 1, 0, 1, 1. The final remainder is zero, so this binary fraction terminates.", state: { bits: "0.1011" } },
    { id: "fraction-repeat", short: "repeating binary expansion", ref: "4.2", prompt: "Can the decimal fraction 0.1 be written exactly with a finite number of binary fraction bits?", options: [["yes", "Yes, it terminates"], ["only in single precision", "Only single precision stores it exactly"], ["no", "No, it repeats"]], answer: "no", why: "One tenth has a factor of 5 in its reduced denominator, so its binary expansion repeats. A finite significand stores an approximation.", state: { bits: "0.00011001100110011001", displayValue: "0.1" } },
  ], readFraction, fractionResult, drawFraction, GEN.fractions);

mount("arithmetic", "4.3 Floating-point arithmetic", "4.3", { kind: "arithmetic", mode: "decimal", operation: "add", m1: 4.5, e1: 3, m2: 6.7, e2: 2, precision: 2 }, [
    { id: "arithmetic-multiply", short: "multiply and normalise", ref: "4.3", prompt: "Calculate (2.6×10³)(5.4×10⁻²).", options: [["14.04e1", "14.04 × 10¹"], ["1.404e2", "1.404 × 10²"], ["1.404e1", "1.404 × 10¹"]], answer: "1.404e2", why: "Multiply coefficients and add exponents: 14.04×10¹. Normalising gives 1.404×10², which is 140.4.", state: { mode: "decimal", operation: "multiply", m1: 2.6, e1: 3, m2: 5.4, e2: -2, precision: 4, calc: P.scientificOperation(2.6, 3, 5.4, -2, "multiply", 4) } },
    { id: "arithmetic-align", short: "align before adding", ref: "4.3", prompt: "Rewrite 6.7×10² at exponent 3 before adding it to 4.5×10³.", options: [["0.67e3", "0.67 × 10³"], ["67e3", "67 × 10³"], ["6.7e3", "6.7 × 10³"]], answer: "0.67e3", why: "Raise the smaller exponent from 2 to 3 and shift its coefficient one place right. The value stays 6.7×10² while both terms now share exponent 3.", state: { mode: "decimal", operation: "add", m1: 4.5, e1: 3, m2: 6.7, e2: 2, precision: 3, calc: P.scientificOperation(4.5, 3, 6.7, 2, "add", 3) } },
    { id: "arithmetic-round", short: "round finite precision", ref: "4.3", prompt: "With 2 significant decimal digits, what is 3.4×10⁴ + 5.6×10² after rounding?", options: [["3.4e4", "3.4 × 10⁴"], ["3.456e4", "3.456 × 10⁴"], ["3.5e4", "3.5 × 10⁴"]], answer: "3.5e4", why: "Align to exponent 4: 3.4+0.056=3.456. Two significant digits round this to 3.5×10⁴; the exact sum is 34560.", state: { mode: "decimal", operation: "add", m1: 3.4, e1: 4, m2: 5.6, e2: 2, precision: 2, calc: P.scientificOperation(3.4, 4, 5.6, 2, "add", 2) } },
    { id: "arithmetic-ieee", short: "IEEE single addition", ref: "4.4", prompt: "The slides add 42.6875 and 0.375 in single precision. What exact result do the aligned significands produce?", options: [["42.75", "42.75"], ["43.0625", "43.0625"], ["43.125", "43.125"]], answer: "43.0625", why: "Restore both hidden leading bits. Their exponents differ by 7, so shift the smaller significand right by 7 places. The aligned sum is 1.010110001×2⁵=43.0625.", state: { mode: "ieee", m1: 42.6875, m2: 0.375, ieeeResult: P.singleAdd(42.6875, 0.375) } },
  ], readArithmetic, arithmeticResult, drawArithmetic, GEN.arithmetic);

var arithmeticForm = document.querySelector('[data-experiment="arithmetic"] form'), arithmeticMode = arithmeticForm.querySelector("[data-mode]");
function syncArithmeticMode() {
  var ieee = arithmeticMode.value === "ieee";
  ["[data-operation]", "[data-e1]", "[data-e2]", "[data-digits]"].forEach(function (selector) {
    arithmeticForm.querySelector(selector).disabled = ieee;
  });
}
arithmeticForm.addEventListener("change", syncArithmeticMode);
syncArithmeticMode();
arithmeticForm.addEventListener("reset", function () { setTimeout(syncArithmeticMode, 0); });

mount("ieee", "4.4 IEEE 754 single precision", "4.4", { kind: "ieee", task: "encode", input: "42.6875", fields: P.float32(42.6875) }, [
  { id: "ieee-width", short: "single-precision fields", ref: "4.4", prompt: "How are the 32 single-precision bits divided among sign, exponent, and fraction?", options: [["1-11-20", "1, 11, and 20 bits"], ["2-8-22", "2, 8, and 22 bits"], ["1-8-23", "1, 8, and 23 bits"]], answer: "1-8-23", why: "Single precision stores 1 sign bit, 8 exponent bits, and 23 fraction bits. Normalised values have 24 bits of precision because the leading 1 is implicit.", state: { task: "encode", input: "42.6875", fields: P.float32(42.6875) } },
  { id: "ieee-bias", short: "unbias exponent", ref: "4.4", prompt: "A normalised single has exponent field 10000100₂, or 132. What is its true exponent?", options: [["132", "132"], ["5", "5"], ["−5", "−5"]], answer: "5", why: "The single-precision bias is 127. Subtract it from the stored field: 132−127=5.", state: { task: "encode", input: "42.6875", fields: P.float32(42.6875) } },
  { id: "ieee-encode", short: "encode 42.6875", ref: "4.4", prompt: "What hexadecimal single-precision pattern represents 42.6875?", options: [["422AC000", "422A C000"], ["42AC0000", "42AC 0000"], ["412AC000", "412A C000"]], answer: "422AC000", why: "42.6875=1.010101011₂×2⁵. The biased exponent is 132, and the stored fraction follows the hidden leading 1. The resulting word is 422A C000.", state: { task: "encode", input: "42.6875", fields: P.float32(42.6875) } },
  { id: "ieee-decode", short: "decode BEC0 0000", ref: "4.4", prompt: "What decimal value is represented by BEC0 0000 in single precision?", options: [["0.375", "0.375"], ["−0.75", "−0.75"], ["−0.375", "−0.375"]], answer: "−0.375", why: "The sign bit is 1. The exponent field 125 gives exponent −2, and the restored significand is 1.1₂=1.5. Thus −1.5×2⁻²=−0.375.", state: { task: "decode", input: "BEC00000", fields: P.decodeSingle("BEC00000") } },
  ], readIeee, ieeeResult, drawIeee, GEN.ieee);

mount("special", "4.5 Special values", "4.5", { kind: "special", sign: "0", exponent: "11111111", fraction: "00000000000000000000000" }, [
  { id: "special-infinity", short: "infinity encoding", ref: "4.5", prompt: "What does sign 0, all-ones exponent, and an all-zero fraction encode?", options: [["NaN", "NaN"], ["positive infinity", "Positive infinity"], ["largest normal", "Largest normalised number"]], answer: "positive infinity", why: "An all-ones exponent with a zero fraction encodes infinity. Sign 0 makes it positive; a non-zero fraction would instead encode NaN.", state: { sign: "0", exponent: "11111111", fraction: "00000000000000000000000" } },
  { id: "special-nan", short: "NaN encoding", ref: "4.5", prompt: "An all-ones exponent is paired with a non-zero fraction. What kind of value is this?", options: [["infinity", "Infinity"], ["subnormal", "Denormalised"], ["NaN", "NaN"]], answer: "NaN", why: "NaN uses an all-ones exponent and any non-zero fraction. Infinity uses the same exponent field but requires a zero fraction.", state: { sign: "1", exponent: "11111111", fraction: "00000000000000000000001" } },
  { id: "special-subnormal", short: "denormalised encoding", ref: "4.5", prompt: "What does exponent zero and a non-zero fraction encode?", options: [["subnormal", "A denormalised number"], ["normalised", "A normalised number"], ["infinity", "Infinity"]], answer: "subnormal", why: "Exponent zero with a non-zero fraction is a denormalised (subnormal) number. Its leading significand bit is 0, allowing values closer to zero than the normalised range.", state: { sign: "0", exponent: "00000000", fraction: "00000000000000000000001" } },
  { id: "special-zero", short: "signed zero", ref: "4.5", prompt: "What does exponent zero and an all-zero fraction encode?", options: [["smallest normal", "The smallest normalised value"], ["zero", "Positive or negative zero, set by the sign bit"], ["NaN", "NaN"]], answer: "zero", why: "Zero exponent and zero fraction encode zero. The sign bit distinguishes positive zero from negative zero.", state: { sign: "1", exponent: "00000000", fraction: "00000000000000000000000" } },
  ], readSpecial, specialResult, drawSpecial, GEN.special);

})();
