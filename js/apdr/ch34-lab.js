/* APDR Chapter 2a predict-then-reveal experiments. */
(function () {
  var P = window.APDR34;

  function colors(stage) {
    var s = getComputedStyle(stage);
    return { paper: s.getPropertyValue("--paper").trim(), panel: s.getPropertyValue("--paper-2").trim(), ink: s.getPropertyValue("--ink").trim(), muted: s.getPropertyValue("--muted").trim(), line: s.getPropertyValue("--line").trim(), fau: s.getPropertyValue("--fau-mark").trim(), course: s.getPropertyValue("--course").trim(), font: s.getPropertyValue("--f-display").trim() };
  }

  function queue(canvas, state) {
    canvas._labState = state;
    if (canvas._paint) cancelAnimationFrame(canvas._paint);
    canvas._paint = requestAnimationFrame(function () {
      canvas._paint = 0;
      var r = canvas.parentElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = canvas.getContext("2d"), c = colors(canvas.parentElement);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, r.width, r.height); ctx.lineJoin = "round";
      draw(ctx, r.width, r.height, c, state);
    });
  }

  function text(ctx, value, x, y, c, size, align, color, maxWidth) {
    ctx.fillStyle = color || c.ink; ctx.font = "600 " + size + "px " + (c.font || "sans-serif");
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle"; ctx.fillText(String(value), x, y, maxWidth || 4000);
  }

  function wrap(ctx, value, width) {
    var lines = [], line = "";
    String(value).split(" ").forEach(function (word) {
      var next = line ? line + " " + word : word;
      if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; } else line = next;
    });
    if (line) lines.push(line);
    return lines;
  }

  // Column addition, filled from the right as the reveal runs.
  function drawColumns(ctx, w, y, c, v, s) {
    var r = P.addColumns(v.a, v.b), n = r.sum.length, cell = Math.min(26, (w - 96) / (n + 1)), left = (w - cell * (n + 1)) / 2 + 20, row = 19,
      shown = s.done ? n : Math.ceil((s.progress || 0) * n);
    function x(i) { return left + cell * (i + 1.5); } // i counts from the left bit; slot 0 is the carry-out
    text(ctx, "carry", left - 30, y, c, 10, "center", c.muted);
    for (var i = 0; i < n; i++) {
      var fromRight = n - 1 - i, on = fromRight < shown;
      if (on && i > 0 && r.carries[i - 1]) text(ctx, "1", x(i - 1), y, c, 11, "center", c.fau);
      text(ctx, r.a[i], x(i), y + row, c, 13); text(ctx, r.b[i], x(i), y + row * 2, c, 13);
      if (on) text(ctx, r.sum[i], x(i), y + row * 3 + 4, c, 13, "center", c.fau);
    }
    if (shown === n && r.carryOut) { text(ctx, "1", x(0) - cell, y, c, 11, "center", c.fau); text(ctx, "1", x(0) - cell, y + row * 3 + 4, c, 13, "center", v.signed ? c.muted : c.fau); }
    text(ctx, "+", x(0) - cell, y + row * 2, c, 13, "center", c.muted);
    ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(0) - cell - 10, y + row * 2.6); ctx.lineTo(x(n - 1) + 10, y + row * 2.6); ctx.stroke();
    if (shown === n) text(ctx, r.carryOut ? (v.signed ? "carry-out 1, discarded" : "carry-out 1, kept") : "no carry-out", w / 2, y + row * 4 + 2, c, 11, "center", c.muted);
    return y + row * 4 + 20;
  }

  // A three-bit toy format on a real scale: the gap doubles at each power of two.
  function drawLine(ctx, w, y, c, s) {
    var left = 18, width = w - 36, top = 8, base = y + 18, k = s.done ? 1 : s.progress || 0;
    function x(v) { return left + width * v / top; }
    ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(left, base); ctx.lineTo(left + width, base); ctx.stroke();
    ctx.strokeStyle = c.fau; ctx.lineWidth = 1.5;
    for (var e = 0; e < 3; e++) {
      var from = Math.pow(2, e), gap = from / 4;
      for (var v = from; v < from * 2 && (v / top) <= k + 0.13; v += gap) { ctx.beginPath(); ctx.moveTo(x(v), base - 8); ctx.lineTo(x(v), base + 8); ctx.stroke(); }
    }
    [1, 2, 4, 8].forEach(function (v) { text(ctx, v, x(v), base + 19, c, 11, "center", c.muted); });
    text(ctx, "Toy format, 3 significant bits: the gap doubles at each power of 2", w / 2, base + 37, c, 11, "center", c.muted, w - 24);
    return base + 54;
  }

  function drawFields(ctx, w, y, c, v, s) {
    var word = parseInt(v.hex, 16), bits = (word >>> 0).toString(2).padStart(32, "0"), cell = Math.min(15, (w - 24) / 32), left = (w - cell * 32) / 2, shown = s.done ? 32 : Math.ceil((s.progress || 0) * 32);
    for (var i = 0; i < 32; i++) {
      var tone = i === 0 ? c.course : i < 9 ? c.fau : c.muted;
      ctx.strokeStyle = tone; ctx.lineWidth = 1; ctx.strokeRect(left + i * cell, y, cell, 22);
      if (i < shown) text(ctx, bits[i], left + (i + 0.5) * cell, y + 11, c, Math.min(11, cell), "center", tone);
    }
    text(ctx, "S", left + cell / 2, y + 33, c, 10, "center", c.course);
    text(ctx, "exponent", left + 5 * cell, y + 33, c, 10, "center", c.fau);
    text(ctx, "fraction", left + 20.5 * cell, y + 33, c, 10, "center", c.muted);
    return y + 48;
  }

  function draw(ctx, w, h, c, s) {
    text(ctx, s.heading || "Follow the representation", w / 2, 28, c, 16, "center", c.muted);
    var nodes = s.nodes || ["input", "rule", "result"], gap = 12, boxW = Math.min(190, (w - 36 - gap * (nodes.length - 1)) / nodes.length), total = nodes.length * boxW + (nodes.length - 1) * gap, x = (w - total) / 2, y = 72, boxH = 48;
    nodes.forEach(function (node, i) {
      var value = s.done && i === nodes.length - 1 ? s.answer : node;
      ctx.fillStyle = s.done && i === nodes.length - 1 ? c.panel : c.paper;
      ctx.strokeStyle = s.done && i === nodes.length - 1 ? c.fau : c.line;
      ctx.lineWidth = s.done && i === nodes.length - 1 ? 2.5 : 1.5;
      ctx.fillRect(x + i * (boxW + gap), y, boxW, boxH); ctx.strokeRect(x + i * (boxW + gap), y, boxW, boxH);
      text(ctx, value, x + i * (boxW + gap) + boxW / 2, y + boxH / 2, c, 13, "center", null, boxW - 8);
      if (i < nodes.length - 1) {
        var ax = x + (i + 1) * boxW + i * gap, ay = y + boxH / 2;
        ctx.strokeStyle = c.fau; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax + 2, ay); ctx.lineTo(ax + gap - 2, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + gap - 2, ay); ctx.lineTo(ax + gap - 7, ay - 4); ctx.lineTo(ax + gap - 7, ay + 4); ctx.closePath(); ctx.fillStyle = c.fau; ctx.fill();
      }
    });
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, 136, c, 12, "center", c.muted, w - 24);
    var bottom = 152, shown = s.done || s.revealing;
    if (shown && s.viz) {
      if (s.viz.type === "columns") bottom = drawColumns(ctx, w, bottom, c, s.viz, s);
      else if (s.viz.type === "line") bottom = drawLine(ctx, w, bottom, c, s);
      else bottom = drawFields(ctx, w, bottom, c, s.viz, s);
    }
    var count = s.done ? s.steps.length : s.revealing ? Math.ceil(s.progress * s.steps.length) : 0, lines = [], lineH = 18;
    ctx.font = "600 13px " + (c.font || "sans-serif");
    for (var i = 0; i < count; i++) wrap(ctx, s.steps[i], w - 32).forEach(function (l) { lines.push({ text: l, last: i === count - 1 }); });
    lines = lines.slice(-Math.max(1, Math.floor((h - bottom - 34) / lineH))); // keep the newest lines when the stage is short
    lines.forEach(function (l, i) { text(ctx, l.text, w / 2, bottom + 9 + i * lineH, c, 13, "center", l.last ? c.fau : c.ink); });
  }

  function challenge(state, canvas, spec) {
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer, why: spec.why,
      stage: function () { Object.assign(state, { heading: spec.heading, nodes: spec.nodes, answer: spec.answer, steps: spec.steps, viz: spec.viz || null, guess: "", done: false, revealing: false, progress: 0 }); queue(canvas, state); },
      preview: function (choice) { state.guess = choice; queue(canvas, state); },
      reveal: function () {
        state.revealing = true;
        return Lab.tween(1300, function (p) { state.progress = p; queue(canvas, state); }).then(function () {
          state.revealing = false; state.done = true; queue(canvas, state);
        });
      },
    };
  }

  function mount(id, title, card, form, canvas, specs, initial, run, showResult) {
    var start = Object.assign({ guess: "", done: false, revealing: false, steps: [], viz: null, answer: "?", nodes: ["input", "rule", "?"] }, initial), state = Object.assign({}, start);
    canvas.parentElement.style.aspectRatio = "auto"; canvas.parentElement.style.minHeight = "448px"; // the standard height for stages with plots; the note overlays the bottom
    function paint() { queue(canvas, state); }
    function lock(on) {
      form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = on; });
      canvas.parentElement.classList.toggle("locked", on);
    }
    Lab.experiment({
      id: id, title: title, card: card,
      lock: lock,
      setup: function (c) { c.stage(); },
      sandbox: function () { Object.assign(state, start, { nodes: start.nodes.slice(), steps: [] }); paint(); },
      challenges: specs.map(function (spec) { return challenge(state, canvas, spec); }),
    });
    form.querySelector('[data-act="run"]').addEventListener("click", function () {
      try {
        var result = run(form);
        state.heading = result.heading; state.nodes = result.nodes || ["input", "rule", "result"];
        state.answer = result.answer; state.steps = result.steps || [result.answer]; state.viz = result.viz || null; state.guess = ""; state.done = true; state.revealing = false;
        form.querySelector('[data-out="result"]').textContent = showResult(result);
      } catch (e) {
        state.heading = "Check the input"; state.nodes = ["entered value", "valid format?", "—"];
        state.answer = e.message || "Check the input"; state.steps = [state.answer]; state.viz = null; state.done = true;
        form.querySelector('[data-out="result"]').textContent = state.answer;
      }
      paint();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () {
      form.reset(); state.heading = "Follow the representation"; state.nodes = ["input", "rule", "result"];
      state.answer = "?"; state.steps = []; state.viz = null; state.done = false; state.guess = "";
      form.querySelector('[data-out="result"]').textContent = "—"; paint();
    });
  }

  function spec(id, short, ref, prompt, answer, options, heading, nodes, steps, why, viz) {
    return { id: id, short: short, ref: ref, prompt: prompt, answer: answer, options: options, heading: heading, nodes: nodes, steps: steps, why: why, viz: viz };
  }

  // Options are listed in display order, set by hand so the answer moves around; key and label are the same text.
  function o() { return Array.prototype.map.call(arguments, function (x) { return [x, x]; }); }

  function signedText(n) { return Object.is(n, -0) ? "−0" : String(n).replace("-", "−"); }

  (function () {
    var s = document.querySelector('[data-experiment="integers"]'), f = s.querySelector("form"), cv = s.querySelector("canvas"),
      opts = [["101101₂", "111010₂", "110101₂", "110011₂"], ["15", "−1", "−7", "0"], ["1", "3", "−4", "−3"], ["101010", "0100 0011", "0100 0010", "0010 1000"]];
    mount("integers", "3.1–3.2 Integer representations", s.querySelector(".challenge"), f, cv, [
      spec("base-53", "convert 53 to binary", "3.1", "Convert 53₁₀ to binary.", "110101₂", opts[0].map(x => [x, x]), "Decimal to binary", ["53₁₀", "divide by 2", "?"], ["Remainders from 53 are collected in reverse order.", "110101₂ = 32+16+4+1 = 53."], "Repeated division by 2 gives remainders that read upward as 110101₂."),
      spec("twos-1111", "decode a four-bit pattern", "3.2", "What value does 1111₂ represent as a four-bit two’s-complement number?", "−1", opts[1].map(x => [x, x]), "Two’s-complement decode", ["1111₂", "subtract 2⁴", "?"], ["The top bit is 1, so subtract the four-bit modulus 16.", "15−16=−1."], "The unsigned value 15 minus 2⁴ gives −1; the width is part of the decoding rule."),
      spec("excess-001", "decode Excess-4", "3.2", "What value does 001₂ represent in three-bit Excess-4?", "−3", opts[2].map(x => [x, x]), "Biased integer", ["001₂ = 1", "bias 4", "?"], ["An Excess-4 value is the stored value minus 4.", "1−4=−3."], "Subtract the bias from the unsigned stored value: 1−4=−3."),
      spec("bcd-42", "encode decimal 42", "3.2", "Which pattern is BCD for decimal 42?", "0100 0010", opts[3].map(x => [x, x]), "Decimal digit groups", ["4", "2", "?"], ["Encode each decimal digit separately with four bits.", "4 is 0100 and 2 is 0010, so BCD is 0100 0010."], "BCD keeps one four-bit group per decimal digit. It is not the ordinary binary encoding of the whole number."),
    ], { heading: "Base conversion and integer encodings", nodes: ["value", "base or encoding", "meaning"] }, function (form) {
      var task = form.querySelector("[data-task]").value, value = form.querySelector("[data-value]").value, answer, nodes, steps;
      if (task === "convert") { var r = P.convert(value, Number(form.querySelector("[data-from]").value), Number(form.querySelector("[data-to]").value)); answer = r.result + " (base " + form.querySelector("[data-to]").value + ")"; nodes = [value, "base conversion", "result"]; steps = ["The input value is " + r.value + " in decimal.", "The converted digits are " + answer + "."]; }
      else if (task === "bcd") { answer = P.encodeBcd(Number(value)); nodes = [value, "one group per digit", "BCD"]; steps = ["Encode every decimal digit in four bits.", "BCD pattern: " + answer + "."]; }
      else { answer = signedText(P.decodeInteger(value, form.querySelector("[data-encoding]").value, Number(form.querySelector("[data-bias]").value))); nodes = [value, form.querySelector("[data-encoding]").selectedOptions[0].textContent, "value"]; steps = ["Keep the stated bit width.", "Decoded value: " + answer + "."]; }
      return { heading: "Integer conversion", nodes: nodes, answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="arithmetic"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("arithmetic", "3.4–3.5 Binary arithmetic", s.querySelector(".challenge"), f, cv, [
      spec("unsigned-divide", "divide unsigned values", "3.4", "For 11101₂ ÷ 00101₂, give the quotient and remainder.", "q=101₂, r=100₂", o("q=100₂, r=101₂", "q=110₂, r=001₂", "q=101₂, r=100₂"), "Unsigned division", ["11101₂ ÷ 00101₂", "quotient and remainder", "?"], ["29÷5 gives quotient 5 and remainder 4.", "5 is 101₂ and 4 is 100₂; the remainder is less than the divisor."], "Check dividend = quotient×divisor + remainder, with remainder less than divisor."),
      spec("unsigned-add", "add unsigned values", "3.4", "What is 1011₂ + 0110₂ as an unsigned binary sum?", "10001₂", o("0001₂", "10001₂", "1111₂"), "Unsigned addition", ["1011₂", "+ 0110₂", "?"], ["Add each column and carry into the next.", "The five-bit result is 10001₂, which is 17 in decimal."], "The carry beyond the original four columns is part of the exact unsigned result when width is not fixed.", { type: "columns", a: "1011", b: "0110" }),
      spec("signed-overflow", "detect signed overflow", "3.5", "In four-bit two’s complement, does 0101₂ + 0011₂ overflow?", "Yes · 1000₂ reads −8", o("No · there is no carry-out", "Yes · 1000₂ reads −8", "No · the exact sum is 8"), "Fixed-width addition", ["+5", "+3", "four-bit result"], ["The exact sum is 8, outside the four-bit range −8…+7.", "The retained pattern is 1000₂, which decodes as −8: signed overflow occurred."], "The four-bit pattern wraps to 1000₂, but the exact value 8 is outside the signed range. This sum has no carry-out at all, so carry-out is not the signed overflow test.", { type: "columns", a: "0101", b: "0011", signed: true }),
      spec("carry-no-overflow", "separate carry from overflow", "3.5", "For 1011₂ + 0111₂ as four-bit two’s complement, the top column produces a carry-out. Is there signed overflow?", "No · result +2", o("Yes · carry-out means overflow", "Yes · result is −14", "No · result +2"), "Signed addition", ["−5", "+7", "four-bit result"], ["The exact sum is +2, inside −8…+7.", "The carry-out is discarded and the retained 0010₂ decodes to +2, so there is no signed overflow."], "A carry-out of 1 appears, yet the exact result +2 is representable. Unlike signs cannot overflow, so carry-out and signed overflow are different properties.", { type: "columns", a: "1011", b: "0111", signed: true }),
    ], { heading: "Binary arithmetic", nodes: ["operands", "operation", "result"] }, function (form) {
      var a = form.querySelector("[data-left]").value, b = form.querySelector("[data-right]").value, mode = form.querySelector("[data-mode]").value, op = form.querySelector("[data-operation]").value, result, answer, steps, viz = null;
      if (mode === "unsigned") { result = P.unsignedArithmetic(a, b, op); answer = op === "divide" ? "q=" + result.quotientBits + ", r=" + result.remainderBits : result.bits + "₂"; steps = op === "divide" ? ["Divide the unsigned values.", "Quotient " + result.quotientBits + "₂ and remainder " + result.remainderBits + "₂."] : ["Interpret both operands as unsigned values.", "Result: " + answer + "."]; if (op === "add" && a.length === b.length) viz = { type: "columns", a: a, b: b }; }
      else { if (op === "divide" || op === "multiply") throw new RangeError("choose add or subtract for two’s-complement mode"); result = P.twosArithmetic(a, b, op); answer = result.pattern + "₂ = " + signedText(result.decoded) + (result.overflow ? " · overflow" : " · no overflow"); steps = ["Exact signed result: " + signedText(result.exact) + ".", "Allowed range: " + signedText(result.min) + "…" + result.max + ".", "Stored " + answer + ".", op === "add" ? "Carry-out: " + (result.carryOut ? "yes, discarded." : "no.") : "Carry-out applies to addition; subtraction here adds the negated value."]; if (op === "add") viz = { type: "columns", a: a, b: b, signed: true }; }
      return { heading: "Binary arithmetic", nodes: [a, op, b], answer: answer, steps: steps, viz: viz };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="spacing"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("spacing", "4.1 Floating-point spacing", s.querySelector(".challenge"), f, cv, [
      spec("spacing-one", "next gap after one", "4.5", "What is the gap from 1 to the next larger single-precision value?", "2⁻²³", o("2⁻²⁴", "2⁻²³", "2⁻⁷"), "Spacing near one", ["single precision", "p=24 bits", "gap after 1"], ["For binary precision p, the gap after 1 is 2¹⁻ᵖ.", "With p=24, the gap is 2⁻²³."], "Normalised single precision has 24 significand bits, including the hidden leading bit; the next value after 1 differs by 2⁻²³.", { type: "line" }),
      spec("spacing-eight", "spacing near eight", "4.1", "For 24-bit precision, what is the spacing between 8 and 16?", "2⁻²⁰", o("2⁻²³", "2⁻²⁴", "2⁻²⁰"), "Spacing scales with exponent", ["8 = 2³", "p=24", "local gap"], ["Within exponent E, spacing is 2ᴱ⁻ᵖ⁺¹.", "For E=3 and p=24, the gap is 2⁻²⁰."], "Each increase of the exponent doubles the local spacing. At 8, the exponent is 3, giving 2³⁻²⁴⁺¹=2⁻²⁰.", { type: "line" }),
      spec("spacing-double", "double epsilon", "4.5", "What is machine epsilon for IEEE double precision with 53 significant bits?", "2⁻⁵²", o("2⁻¹¹", "2⁻⁵²", "2⁻⁵³"), "Precision near one", ["double precision", "p=53", "εmach"], ["Machine epsilon is 2¹⁻ᵖ for binary precision p.", "2¹⁻⁵³=2⁻⁵², approximately 2.22×10⁻¹⁶."], "Machine epsilon is the gap from 1 to the next larger representable value: 2⁻⁵² for p=53.", { type: "line" }),
      spec("spacing-bit", "add one precision bit", "4.1", "If precision rises from 24 to 25 binary significand bits, how does spacing near 1 change?", "It halves", o("It doubles", "It stays the same", "It halves"), "Precision and spacing", ["24 bits", "add one bit", "25 bits"], ["The gap changes from 2⁻²³ to 2⁻²⁴.", "Each additional precision bit halves the spacing near 1."], "One extra significand bit doubles the number of subdivisions per interval, halving adjacent spacing.", { type: "line" }),
    ], { heading: "Representable spacing", nodes: ["exponent", "precision", "gap"] }, function (form) {
      var e = Number(form.querySelector("[data-exponent]").value), p = Number(form.querySelector("[data-precision]").value), gap;
      if (!(e >= -126 && e <= 127)) throw new RangeError("use a binary exponent from −126 to 127");
      gap = P.spacing(e, p);
      var power = "2^(" + signedText(e - p + 1) + ")", answerText = power + " ≈ " + gap.toPrecision(4);
      return { heading: "Local floating-point spacing", nodes: ["2^" + e, "p=" + p, "gap"], answer: answerText, viz: { type: "line" }, steps: ["For binary precision p, local spacing is 2^(E−p+1).", "At E=" + e + " and p=" + p + ", the gap is " + answerText + "."] };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="fractions"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("fractions", "4.2 Binary fractions", s.querySelector(".challenge"), f, cv, [
      spec("fraction-01101", "decode binary fraction", "4.2", "Convert 0.01101₂ to decimal.", "0.40625", o("0.3125", "0.40625", "0.6875"), "Fractional place values", ["0.01101₂", "2⁻² + 2⁻³ + 2⁻⁵", "?"], ["The one-bits contribute 1/4, 1/8, and 1/32.", "1/4+1/8+1/32=0.40625."], "Add the negative powers of two at positions containing 1: 0.25+0.125+0.03125."),
      spec("fraction-06875", "encode decimal fraction", "4.2", "What is 0.6875 in binary?", "0.1011₂", o("0.1101₂", "0.0111₂", "0.1011₂"), "Repeated multiplication by 2", ["0.6875", "×2 and record bits", "?"], ["The successive integer bits are 1, 0, 1, 1.", "The remainder reaches zero, so 0.6875=0.1011₂ exactly."], "Repeatedly multiply the fractional remainder by 2. Because the remainder reaches zero, this binary expansion terminates."),
      spec("fraction-tenth", "test exact binary storage", "4.2", "Does decimal 0.1 have a terminating binary expansion?", "No · it repeats", o("Yes · four bits", "No · it repeats", "Yes · one bit"), "Finite binary fraction?", ["0.1₁₀", "binary expansion", "?"], ["A reduced fraction terminates in base 2 only when its denominator is a power of 2.", "The denominator of 1/10 contains a factor 5, so its binary expansion repeats."], "The denominator 10 is not a power of two, so no finite binary fraction represents one tenth exactly."),
      spec("fraction-place", "identify a fractional place", "4.2", "What is the place value of the fifth bit after a binary point?", "1/32", o("1/16", "1/64", "1/32"), "Binary place values", ["1st bit: 1/2", "each place halves", "5th bit: ?"], ["The kth bit after the point has weight 2⁻ᵏ.", "For k=5, the weight is 2⁻⁵=1/32."], "Count the first fractional bit as 2⁻¹, so the fifth is 2⁻⁵."),
    ], { heading: "Binary fractions", nodes: ["binary digits", "place values", "decimal value"] }, function (form) {
      var value = form.querySelector("[data-value]").value, lim = Number(form.querySelector("[data-limit]").value), answer, steps;
      if (form.querySelector("[data-task]").value === "decode") { answer = String(P.fractionValue(value)); steps = ["Add the powers of two for each 1 bit.", "Decimal value: " + answer + "."]; }
      else { var r = P.fractionBits(Number(value), lim); answer = "0." + (r.bits || "0") + (r.exact ? " exact" : "… truncated after " + lim + " bits"); steps = ["Multiply each fractional remainder by 2.", "Bits: " + (r.bits || "0") + ". " + (r.exact ? "The remainder reaches zero." : "The expansion continues beyond the selected limit." )]; }
      return { heading: "Binary fraction conversion", nodes: [value, "powers of 2", "result"], answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="ieee"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("ieee", "4.4 IEEE 754 fields", s.querySelector(".challenge"), f, cv, [
      spec("ieee-one", "decode positive one", "4.4", "What value is encoded by 3F800000₁₆ as IEEE single precision?", "1", o("0.5", "1", "2"), "Decode IEEE fields", ["3F800000₁₆", "S | E | F", "?"], ["The sign is 0, exponent field is 01111111₂=127, and fraction is zero.", "Unbiased exponent is 127−127=0, so the value is +1×2⁰=1."], "The biased exponent equals 127, which decodes to exponent 0; the hidden leading bit gives significand 1.", { type: "fields", hex: "3F800000" }),
      spec("ieee-minus-ten", "decode a negative value", "4.4", "What value is encoded by C1200000₁₆?", "−10", o("10", "−8", "−10"), "Sign, exponent, fraction", ["C1200000₁₆", "sign and scale", "?"], ["The sign bit is 1 and the unbiased exponent is 3.", "The significand is 1.01₂=1.25, so −1.25×2³=−10."], "Decode the negative sign, significand 1.01₂, and exponent 3; their product is −10.", { type: "fields", hex: "C1200000" }),
      spec("ieee-infinity", "classify infinity", "4.5", "What does 7F800000₁₆ encode?", "+Infinity", o("NaN", "largest finite value", "+Infinity"), "Reserved exponent", ["7F800000₁₆", "S | E | F", "?"], ["All-one exponent with zero fraction is infinity.", "The sign bit is zero, so it is positive infinity."], "The exponent is all ones, the fraction is zero, and the sign is positive: positive infinity.", { type: "fields", hex: "7F800000" }),
      spec("ieee-nan", "classify NaN", "4.5", "What does 7FC00000₁₆ encode?", "NaN", o("+Infinity", "NaN", "positive zero"), "Exponent and fraction", ["7FC00000₁₆", "S | E | F", "?"], ["All-one exponent with non-zero fraction is NaN.", "The exact payload does not turn it into a finite number."], "An all-one exponent and non-zero fraction encode NaN, regardless of the payload bits.", { type: "fields", hex: "7FC00000" }),
    ], { heading: "IEEE single precision", nodes: ["sign", "8-bit exponent", "23-bit fraction"] }, function (form) {
      var r = P.decodeSingle(form.querySelector("[data-hex]").value), exp = parseInt(r.exponent, 2), hasValue = r.classification === "normalised" || /subnormal|denormal/i.test(r.classification), detail = hasValue ? r.classification + " value " + r.value : r.classification, rule = /subnormal|denormal/i.test(r.classification) ? "Exponent field 0 and non-zero fraction: value = 0.F × 2⁻¹²⁶, hidden bit 0." : "The stored exponent is " + exp + "; normalised values subtract bias 127.";
      return { heading: "IEEE single-precision decode", nodes: ["S=" + r.sign, "E=" + r.exponent, "F=" + r.fraction], answer: detail, viz: { type: "fields", hex: r.hex }, steps: [rule, "Classification and decoded value: " + detail + "."] };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="stability"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("stability", "4.5 Numerical stability", s.querySelector(".challenge"), f, cv, [
      spec("cancel-error", "estimate cancellation error", "4.5", "True x=0.123456789 and y=0.123451234 are stored to five digits as 0.12346 and 0.12345. What is the relative error of the computed difference?", "About 80%", o("Zero", "About 0.8%", "About 80%"), "Close rounded inputs", ["exact difference", "stored difference", "relative error"], ["The exact difference is 0.000005555; the stored difference is 0.00001.", "The stored result has about 80.0% relative error."], "The stored result is nearly 1.80 times the exact difference, so relative error is about 80%."),
      spec("sterbenz-exact", "apply Sterbenz lemma", "4.5", "For x=1.5 and y=1.0, is x−y exactly representable under Sterbenz’s condition?", "Yes · 0.5", o("No · 0.5 is rounded", "Yes · 0.5", "No · values are too far apart"), "Nearby floating-point values", ["x=1.5", "compare x and y", "y=1.0"], ["The ratio condition y/2≤x≤2y holds.", "The difference 1.5−1.0=0.5 is exact."], "The positive operands satisfy y/2≤x≤2y. The subtraction is exact; any prior rounding in the inputs remains."),
      spec("quadratic-stable", "choose a stable root", "4.5", "For b>0, which numerator avoids cancellation when b² is much larger than 4ac?", "−b−√D", o("−b+√D", "b−√D", "−b−√D"), "Quadratic formula", ["D=b²−4ac", "b>0", "choose a branch"], ["When b is positive, √D is close to b.", "The numerator −b−√D adds magnitudes; −b+√D subtracts close values."], "Select the branch that adds magnitudes in the numerator. For b>0, −b−√D avoids subtracting nearly equal quantities."),
      spec("fma-rounding", "compare fused multiply-add", "4.5", "How many final roundings does a fused multiply-add perform?", "One", o("Two", "One", "None"), "Fused operation", ["a×b", "+c", "one final rounding"], ["The product is not rounded to the target format before c is added.", "The fused result is rounded once after a×b+c."], "FMA evaluates the exact product-plus-sum before one final rounding; separate operations can round twice."),
    ], { heading: "Floating-point error and stability", nodes: ["inputs", "operation", "error"] }, function (form) {
      var task = form.querySelector("[data-task]").value, a = Number(form.querySelector("[data-a]").value), b = Number(form.querySelector("[data-b]").value), c = Number(form.querySelector("[data-c]").value), answer, steps, nodes;
      if (task === "cancellation") { var r = P.cancellation(a, b); var ex = Number(r.exact.toPrecision(4)), st = Number(r.stored.toPrecision(4)); answer = "exact " + ex + "; stored " + st + "; relative error " + (100 * r.relativeError).toFixed(2) + "%"; nodes = ["rounded x,y", "subtract", "relative error"]; steps = ["Five significant digits store the inputs as " + Number(a).toPrecision(5) + " and " + Number(b).toPrecision(5) + ".", "Exact difference " + ex + "; stored difference " + st + " (four significant digits shown).", "Relative error: " + (100 * r.relativeError).toFixed(2) + "%." ]; }
      else if (task === "sterbenz") { answer = String(P.subtractExactBySterbenz(a, b)); nodes = [String(a), "subtract", String(b)]; steps = ["Check y/2≤x≤2y for positive finite inputs.", "The exact difference of the stored doubles is " + answer + ".", "A decimal input such as 0.3 is already a rounded binary double, so long digit strings here are input error, not subtraction error."]; }
      else { var q = P.stableQuadratic(a, b, c); answer = q.roots.map(x => (x === 0 ? "0" : Number(x).toPrecision(8))).join(", "); var plainD = b * b - 4 * a * c, shownD = Number.isFinite(plainD) && plainD !== 0 ? Number(plainD.toPrecision(12)) : q.discriminant; nodes = ["ax²+bx+c", "stable q/a and c/q", "roots"]; steps = ["Discriminant D=" + shownD + ".", "Stable roots: " + answer + "."]; }
      return { heading: "Numerical stability", nodes: nodes, answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  function defaults(name, table) {
    var form = document.querySelector('[data-experiment="' + name + '"] form');
    form.querySelector("[data-task]").addEventListener("change", function () { form.querySelector("[data-value]").value = table[this.value]; });
  }
  defaults("integers", { convert: "53", decode: "1011", bcd: "42" });
  defaults("fractions", { decode: "0.01101", encode: "0.1" });

  var stabilityForm = document.querySelector('[data-experiment="stability"] form');
  stabilityForm.querySelector("[data-task]").addEventListener("change", function () {
    var values = this.value === "quadratic" ? ["1", "100000000", "1"] : this.value === "sterbenz" ? ["1.5", "1", "1"] : ["0.123456789", "0.123451234", "1"];
    ["[data-a]", "[data-b]", "[data-c]"].forEach(function (sel, i) { stabilityForm.querySelector(sel).value = values[i]; });
  });
})();
