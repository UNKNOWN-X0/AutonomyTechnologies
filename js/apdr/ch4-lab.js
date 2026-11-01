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
  function challenge(show, state, spec) {
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer, why: spec.why,
      stage: function () { Object.assign(state, spec.state); state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; state.guess = ""; show(); },
      preview: function (choice) { state.guess = choice; show(); },
      reveal: function () { return animate(state, show, function () { state.result = spec.answer; }); },
    };
  }
  function mount(id, title, ref, state, challenges, read, apply, painter) {
    var section = document.querySelector('[data-experiment="' + id + '"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      show = function () { queue(canvas, state, painter); };
    Lab.experiment({
      id: id, title: title, card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function () { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; show(); },
      sandbox: function () { state.challenge = false; state.guess = ""; state.result = null; Object.assign(state, read(form)); show(); },
      challenges: challenges.map(function (item) { return challenge(show, state, item); }),
    });
    form.querySelector('[data-act="run"]').addEventListener("click", function () {
      try {
        Object.assign(state, read(form));
        state.challenge = false; state.guess = ""; state.result = apply(state);
        form.querySelector('[data-out="result"]').textContent = state.result;
      } catch (e) {
        state.result = null; form.querySelector('[data-out="result"]').textContent = e.message || "Check the inputs.";
      }
      show();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () {
      form.reset(); state.challenge = false; state.guess = ""; state.result = null;
      form.querySelector('[data-out="result"]').textContent = "—"; Object.assign(state, read(form)); show();
    });
    if (typeof ResizeObserver !== "undefined") {
      observer = observer || new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { var cv = entry.target.querySelector("canvas"); if (cv && cv._labState) queue(cv, cv._labState, painter); });
      });
      observer.observe(canvas.parentElement);
    }
  }
  function resultText(result) { return Number(result).toPrecision(8).replace(/(?:\.0+|(?:(\.\d*?)0+))(?=e|$)/, "$1"); }
  function field(ctx, name, value, x, y, w, h, c, active, size) {
    text(ctx, name, x + w / 2, y - 16, c, 12, c.muted);
    box(ctx, value, x, y, w, h, c, active, size);
  }
  function drawGuess(ctx, w, h, c, s) {
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 22, c, 12);
    if (s.result) text(ctx, "Result: " + s.result, w / 2, h - 47, c, 13, c.fau);
  }
  function drawFraction(ctx, w, h, c, s) {
    text(ctx, "Each binary fraction bit halves the place value", w / 2, 25, c, 15);
    var bits = String(s.bits || "0.1011").split(".")[1] || "", n = Math.min(bits.length, 12), cw = Math.min(42, (w - 42) / Math.max(n, 1)), x0 = (w - n * cw) / 2;
    for (var i = 0; i < n; i++) {
      var visible = !s.challenge || s.revealing && s.progress > i / Math.max(n, 1) || !!s.result;
      text(ctx, "2⁻" + (i + 1), x0 + i * cw + cw / 2, 68, c, 11, c.muted);
      box(ctx, visible ? bits[i] : "?", x0 + i * cw + 3, 83, cw - 6, 39, c, s.revealing && s.progress > i / Math.max(n, 1), 16);
      text(ctx, visible && bits[i] === "1" ? "keep" : visible ? "skip" : "?", x0 + i * cw + cw / 2, 142, c, 10, c.muted);
    }
    arrow(ctx, w * .24, 172, w * .76, 172, c, s.revealing);
    text(ctx, !s.challenge || s.revealing || s.result ? "Sum the selected powers of 2" : "Predict the decimal value", w / 2, 199, c, 13, c.muted);
    drawGuess(ctx, w, h, c, s);
  }
  function drawSpacing(ctx, w, h, c, s) {
    var e = Number(s.exponent == null ? 3 : s.exponent), p = Number(s.precision == null ? 4 : s.precision),
      gap = P.spacing(e, p), start = Math.pow(2, e), count = Math.min(Math.pow(2, p - 1), 16),
      x0 = 34, x1 = w - 34, y = 126, dx = (x1 - x0) / count,
      reveal = !s.challenge || s.revealing || !!s.result, shown = reveal ? Math.ceil(count * (s.revealing ? s.progress : 1)) : 0;
    text(ctx, "Sample of representable values in one exponent zone", w / 2, 25, c, 15);
    text(ctx, "2⁽" + e + "⁾ to 2⁽" + (e + 1) + "⁾   ·   " + p + " significant bits", w / 2, 55, c, 13, c.muted);
    line(ctx, x0, y, x1, y, c, false);
    for (var i = 0; i <= shown; i++) {
      var x = x0 + dx * i;
      line(ctx, x, y - (i % Math.max(1, Math.floor(count / 4)) === 0 ? 12 : 7), x, y + 12, c, s.revealing && s.progress > i / count);
      if (reveal && i % Math.max(1, Math.floor(count / 4)) === 0) text(ctx, resultText(start + i * gap), x, y + 31, c, 10, c.muted);
    }
    text(ctx, reveal ? "Adjacent gap = " + resultText(gap) : "Predict the distance between adjacent values", w / 2, 207, c, 15, reveal ? c.fau : c.ink);
    text(ctx, "Exponent sets scale     ·     precision sets spacing", w / 2, 237, c, 12, c.muted);
    drawGuess(ctx, w, h, c, s);
  }
  function drawArithmetic(ctx, w, h, c, s) {
    var showWork = !s.challenge || s.revealing || !!s.result;
    text(ctx, s.mode === "ieee" ? "IEEE single-precision addition" : "Scientific-notation arithmetic", w / 2, 25, c, 15);
    if (s.mode === "ieee" && s.ieeeResult) {
      var r = s.ieeeResult, x = 24, top = 67, full = w - 48;
      if (!showWork) {
        text(ctx, resultText(r.left.value) + " + " + resultText(r.right.value) + " · predict the sum", w / 2, 102, c, 14, c.muted);
        drawGuess(ctx, w, h, c, s); return;
      }
      text(ctx, "Restore the hidden bit, then align to exponent " + r.exponent, w / 2, 51, c, 12, c.muted);
      field(ctx, "larger", r.left.significand, x, top, full * .43, 36, c, s.revealing && s.progress > .15, 12);
      field(ctx, "smaller shifted right by " + r.exponentDifference, "1.1 × 2⁻" + r.exponentDifference, x + full * .53, top, full * .47, 36, c, s.revealing && s.progress > .4, 12);
      arrow(ctx, w * .25, 128, w * .75, 128, c, s.revealing);
      text(ctx, "Aligned sum: " + r.significand + " × 2⁽" + r.exponent + "⁾", w / 2, 163, c, 14, c.fau);
      text(ctx, "Rounded single-precision result: " + (s.result || "—"), w / 2, 193, c, 13);
    } else {
      var exp = s.operation === "multiply" ? Number(s.e1) + Number(s.e2) : Math.max(Number(s.e1), Number(s.e2));
      text(ctx, String(s.m1) + " × 10⁽" + s.e1 + "⁾", w * .25, 79, c, 14);
      text(ctx, s.operation === "multiply" ? "×" : "+", w / 2, 79, c, 19, c.course);
      text(ctx, String(s.m2) + " × 10⁽" + s.e2 + "⁾", w * .75, 79, c, 14);
      if (s.operation === "add") {
        text(ctx, "Align to exponent " + exp + " · smaller coefficient shifts right", w / 2, 116, c, 12, c.muted);
        if (showWork && s.calc && s.calc.aligned) text(ctx, resultText(s.calc.aligned[0]) + " + " + resultText(s.calc.aligned[1]) + " at 10⁽" + exp + "⁾", w / 2, 145, c, 13, s.revealing ? c.fau : c.ink);
      } else text(ctx, "Multiply coefficients · add exponents", w / 2, 123, c, 13, c.muted);
      arrow(ctx, w * .25, 174, w * .75, 174, c, s.revealing);
      if (showWork && s.calc) text(ctx, "Exact: " + s.calc.exactScientific.text + " · rounded: " + s.calc.roundedScientific.text, w / 2, 207, c, 12, c.fau);
    }
    drawGuess(ctx, w, h, c, s);
  }
  function drawIeee(ctx, w, h, c, s) {
    text(ctx, "IEEE single precision · 32 stored bits", w / 2, 26, c, 15);
    var d = s.fields || P.float32(42.6875), gap = 7, x = 22, y = 91, total = w - 44, sw = 34, ew = total * .29, fw = total - sw - ew - gap * 2,
      hideFields = s.challenge && !s.revealing && !s.result;
    field(ctx, "S · 1 bit", d.sign, x, y, sw, 42, c, s.revealing && s.progress > .15, 14);
    field(ctx, "E · 8 bits", hideFields ? "????????" : d.exponent, x + sw + gap, y, ew, 42, c, s.revealing && s.progress > .4, 12);
    field(ctx, "F · 23 bits", hideFields ? "???????????????????????" : d.fraction, x + sw + ew + gap * 2, y, fw, 42, c, s.revealing && s.progress > .65, Math.max(7, Math.min(10, fw / 28)));
    text(ctx, hideFields ? "Predict the bit fields" : "Exponent bias = 127", w / 2, 166, c, 13, c.muted);
    if (!hideFields) text(ctx, "Hidden leading 1 applies to normalised values", w / 2, 193, c, 12, c.muted);
    if (s.result) text(ctx, s.result, w / 2, 222, c, 14, c.fau);
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
    text(ctx, hideFields ? "Predict the value class" : s.result || "Inspect both fields before naming the value", w / 2, 189, c, 14, s.result ? c.fau : c.ink);
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
    return r.roundedScientific.text;
  }
  function readIeee(form) { return { task: form.querySelector("[data-task]").value, input: form.querySelector("[data-value]").value.trim() }; }
  function ieeeResult(state) {
    var d = state.task === "encode" ? P.float32(Number(state.input)) : P.decodeSingle(state.input);
    state.fields = d;
    return (state.task === "encode" ? "0x" + d.hex : d.value === Infinity || d.value === -Infinity || Number.isNaN(d.value) ? String(d.value) : resultText(d.value)) +
      " · " + d.classification;
  }
  function readSpecial(form) {
    return { sign: form.querySelector("[data-sign]").value, exponent: form.querySelector("[data-exponent]").value.trim(),
      fraction: form.querySelector("[data-fraction]").value.trim() };
  }
  function specialResult(state) { return P.classifySingle(state.sign, state.exponent, state.fraction); }

  

mount("spacing", "4.1 Range and precision", "4.1", { kind: "spacing", exponent: 3, precision: 4 }, [
  { id: "spacing-scale", short: "exponent changes scale", ref: "4.1", prompt: "With precision held at 4 bits, what happens to the gap when the exponent rises from 3 to 4?", options: [["doubles", "It doubles"], ["halves", "It halves"], ["same", "It stays the same"]], answer: "doubles", why: "Within an exponent zone the gap is 2^(e−p+1). Raising e by one doubles that gap while keeping precision fixed.", state: { exponent: 4, precision: 4 } },
  { id: "spacing-precision", short: "more significand bits", ref: "4.1", prompt: "At exponent 3, precision increases from 4 bits to 5 bits. What happens to adjacent spacing?", options: [["halves", "It halves"], ["doubles", "It doubles"], ["range-doubles", "The exponent range doubles"]], answer: "halves", why: "One extra significand bit divides each exponent zone into twice as many steps. Adjacent spacing halves; the exponent range is unchanged.", state: { exponent: 3, precision: 5 } },
  { id: "spacing-number", short: "calculate one gap", ref: "4.1", prompt: "For normalised numbers in [8,16) with 4 significant bits, what is the spacing?", options: [["1", "1"], ["0.5", "0.5"], ["2", "2"]], answer: "1", why: "Here e=3 and p=4, so spacing is 2^(3−4+1)=1. The four significant bits determine the steps within this zone.", state: { exponent: 3, precision: 4 } },
  { id: "spacing-finite", short: "finite range", ref: "4.1", prompt: "Does a fixed floating-point format represent every real number, including arbitrarily large values?", options: [["no", "No, it has finite range and finitely many values"], ["yes", "Yes, the exponent covers every magnitude"], ["only fractions", "Only fractional values are bounded"]], answer: "no", why: "A format has finitely many exponent and significand patterns. It covers a wide but bounded range, with spacing that varies by exponent zone.", state: { exponent: 6, precision: 5 } },
  ], readSpacing, spacingResult, drawSpacing);

mount("fractions", "4.2 Binary fractions", "4.2", { kind: "fraction", bits: "0.1011" }, [
    { id: "fraction-101", short: "binary fraction 0.101", ref: "4.2", prompt: "What decimal value does 0.101₂ represent?", options: [["0.625", "0.625"], ["0.75", "0.75"], ["0.5", "0.5"]], answer: "0.625", why: "Keep the first and third places: 1/2+1/8=0.625. Each position after the point is a negative power of 2.", state: { bits: "0.101" } },
    { id: "fraction-01101", short: "five-bit fraction", ref: "4.2", prompt: "Convert 0.01101₂ to decimal.", options: [["0.40625", "0.40625"], ["0.375", "0.375"], ["0.3125", "0.3125"]], answer: "0.40625", why: "The 1 bits contribute 1/4, 1/8, and 1/32. Their sum is 0.40625.", state: { bits: "0.01101" } },
    { id: "fraction-terminating", short: "terminating conversion", ref: "4.2", prompt: "What is 0.6875 in binary?", options: [["0.1011", "0.1011"], ["0.1101", "0.1101"], ["0.1010", "0.1010"]], answer: "0.1011", why: "Repeatedly multiply by 2 to get bits 1, 0, 1, 1. The final remainder is zero, so this binary fraction terminates.", state: { bits: "0.1011" } },
    { id: "fraction-repeat", short: "repeating binary expansion", ref: "4.2", prompt: "Can the decimal fraction 0.1 be written exactly with a finite number of binary fraction bits?", options: [["no", "No, it repeats"], ["yes", "Yes, it terminates"], ["only in single precision", "Only single precision stores it exactly"]], answer: "no", why: "One tenth has a factor of 5 in its reduced denominator, so its binary expansion repeats. A finite significand stores an approximation.", state: { bits: "0.00011001100110011001", displayValue: "0.1" } },
  ], readFraction, fractionResult, drawFraction);

mount("arithmetic", "4.3 Floating-point arithmetic", "4.3", { kind: "arithmetic", mode: "decimal", operation: "add", m1: 4.5, e1: 3, m2: 6.7, e2: 2, precision: 3 }, [
    { id: "arithmetic-multiply", short: "multiply and normalise", ref: "4.3", prompt: "Calculate (2.6×10³)(5.4×10⁻²).", options: [["1.404e2", "1.404 × 10²"], ["14.04e1", "14.04 × 10¹"], ["1.404e1", "1.404 × 10¹"]], answer: "1.404e2", why: "Multiply coefficients and add exponents: 14.04×10¹. Normalising gives 1.404×10², which is 140.4.", state: { mode: "decimal", operation: "multiply", m1: 2.6, e1: 3, m2: 5.4, e2: -2, precision: 4, calc: P.scientificOperation(2.6, 3, 5.4, -2, "multiply", 4) } },
    { id: "arithmetic-align", short: "align before adding", ref: "4.3", prompt: "Rewrite 6.7×10² at exponent 3 before adding it to 4.5×10³.", options: [["0.67e3", "0.67 × 10³"], ["67e3", "67 × 10³"], ["6.7e3", "6.7 × 10³"]], answer: "0.67e3", why: "Raise the smaller exponent from 2 to 3 and shift its coefficient one place right. The value stays 6.7×10² while both terms now share exponent 3.", state: { mode: "decimal", operation: "add", m1: 4.5, e1: 3, m2: 6.7, e2: 2, precision: 3, calc: P.scientificOperation(4.5, 3, 6.7, 2, "add", 3) } },
    { id: "arithmetic-round", short: "round finite precision", ref: "4.3", prompt: "With 2 significant decimal digits, what is 3.4×10⁴ + 5.6×10² after rounding?", options: [["3.5e4", "3.5 × 10⁴"], ["3.4e4", "3.4 × 10⁴"], ["3.456e4", "3.456 × 10⁴"]], answer: "3.5e4", why: "Align to exponent 4: 3.4+0.056=3.456. Two significant digits round this to 3.5×10⁴; the exact sum is 34560.", state: { mode: "decimal", operation: "add", m1: 3.4, e1: 4, m2: 5.6, e2: 2, precision: 2, calc: P.scientificOperation(3.4, 4, 5.6, 2, "add", 2) } },
    { id: "arithmetic-ieee", short: "IEEE single addition", ref: "4.4", prompt: "The slides add 42.6875 and 0.375 in single precision. What exact result do the aligned significands produce?", options: [["43.0625", "43.0625"], ["42.75", "42.75"], ["43.125", "43.125"]], answer: "43.0625", why: "Restore both hidden leading bits. Their exponents differ by 7, so shift the smaller significand right by 7 places. The aligned sum is 1.010110001×2⁵=43.0625.", state: { mode: "ieee", m1: 42.6875, m2: 0.375, ieeeResult: P.singleAdd(42.6875, 0.375) } },
  ], readArithmetic, arithmeticResult, drawArithmetic);

var arithmeticForm = document.querySelector('[data-experiment="arithmetic"] form'), arithmeticMode = arithmeticForm.querySelector("[data-mode]");
function syncArithmeticMode() {
  var ieee = arithmeticMode.value === "ieee";
  ["[data-operation]", "[data-e1]", "[data-e2]", "[data-digits]"].forEach(function (selector) {
    arithmeticForm.querySelector(selector).disabled = ieee;
  });
}
arithmeticMode.addEventListener("change", syncArithmeticMode);
arithmeticForm.addEventListener("reset", function () { setTimeout(syncArithmeticMode, 0); });

mount("ieee", "4.4 IEEE 754 single precision", "4.4", { kind: "ieee", task: "encode", input: "42.6875", fields: P.float32(42.6875) }, [
  { id: "ieee-width", short: "single-precision fields", ref: "4.4", prompt: "How are the 32 single-precision bits divided among sign, exponent, and fraction?", options: [["1-8-23", "1, 8, and 23 bits"], ["1-11-20", "1, 11, and 20 bits"], ["2-8-22", "2, 8, and 22 bits"]], answer: "1-8-23", why: "Single precision stores 1 sign bit, 8 exponent bits, and 23 fraction bits. Normalised values have 24 bits of precision because the leading 1 is implicit.", state: { task: "encode", input: "42.6875", fields: P.float32(42.6875) } },
  { id: "ieee-bias", short: "unbias exponent", ref: "4.4", prompt: "A normalised single has exponent field 10000100₂, or 132. What is its true exponent?", options: [["5", "5"], ["132", "132"], ["−5", "−5"]], answer: "5", why: "The single-precision bias is 127. Subtract it from the stored field: 132−127=5.", state: { task: "encode", input: "42.6875", fields: P.float32(42.6875) } },
  { id: "ieee-encode", short: "encode 42.6875", ref: "4.4", prompt: "What hexadecimal single-precision pattern represents 42.6875?", options: [["422AC000", "422A C000"], ["42AC0000", "42AC 0000"], ["412AC000", "412A C000"]], answer: "422AC000", why: "42.6875=1.010101011₂×2⁵. The biased exponent is 132, and the stored fraction follows the hidden leading 1. The resulting word is 422A C000.", state: { task: "encode", input: "42.6875", fields: P.float32(42.6875) } },
  { id: "ieee-decode", short: "decode BEC0 0000", ref: "4.4", prompt: "What decimal value is represented by BEC0 0000 in single precision?", options: [["−0.375", "−0.375"], ["0.375", "0.375"], ["−0.75", "−0.75"]], answer: "−0.375", why: "The sign bit is 1. The exponent field 125 gives exponent −2, and the restored significand is 1.1₂=1.5. Thus −1.5×2⁻²=−0.375.", state: { task: "decode", input: "BEC00000", fields: P.decodeSingle("BEC00000") } },
  ], readIeee, ieeeResult, drawIeee);

mount("special", "4.5 Special values", "4.5", { kind: "special", sign: "0", exponent: "11111111", fraction: "00000000000000000000000" }, [
  { id: "special-infinity", short: "infinity encoding", ref: "4.5", prompt: "What does sign 0, all-ones exponent, and an all-zero fraction encode?", options: [["positive infinity", "Positive infinity"], ["NaN", "NaN"], ["largest normal", "Largest normalised number"]], answer: "positive infinity", why: "An all-ones exponent with a zero fraction encodes infinity. Sign 0 makes it positive; a non-zero fraction would instead encode NaN.", state: { sign: "0", exponent: "11111111", fraction: "00000000000000000000000" } },
  { id: "special-nan", short: "NaN encoding", ref: "4.5", prompt: "An all-ones exponent is paired with a non-zero fraction. What kind of value is this?", options: [["NaN", "NaN"], ["infinity", "Infinity"], ["subnormal", "Subnormal"]], answer: "NaN", why: "NaN uses an all-ones exponent and any non-zero fraction. Infinity uses the same exponent field but requires a zero fraction.", state: { sign: "1", exponent: "11111111", fraction: "00000000000000000000001" } },
  { id: "special-subnormal", short: "subnormal encoding", ref: "4.5", prompt: "What does exponent zero and a non-zero fraction encode?", options: [["subnormal", "A subnormal number"], ["normalised", "A normalised number"], ["infinity", "Infinity"]], answer: "subnormal", why: "Exponent zero with a non-zero fraction is subnormal. Its leading significand bit is 0, allowing values closer to zero than the normalised range.", state: { sign: "0", exponent: "00000000", fraction: "00000000000000000000001" } },
  { id: "special-zero", short: "signed zero", ref: "4.5", prompt: "What does exponent zero and an all-zero fraction encode?", options: [["zero", "Positive or negative zero, set by the sign bit"], ["smallest normal", "The smallest normalised value"], ["NaN", "NaN"]], answer: "zero", why: "Zero exponent and zero fraction encode zero. The sign bit distinguishes positive zero from negative zero.", state: { sign: "1", exponent: "00000000", fraction: "00000000000000000000000" } },
  ], readSpecial, specialResult, drawSpecial);

})();
