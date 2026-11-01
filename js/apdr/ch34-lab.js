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

  function text(ctx, value, x, y, c, size, align, color) {
    ctx.fillStyle = color || c.ink; ctx.font = "600 " + size + "px " + (c.font || "sans-serif");
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle"; ctx.fillText(String(value), x, y);
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
      text(ctx, value, x + i * (boxW + gap) + boxW / 2, y + boxH / 2, c, 13);
      if (i < nodes.length - 1) {
        var ax = x + (i + 1) * boxW + i * gap, ay = y + boxH / 2;
        ctx.strokeStyle = c.fau; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax + 2, ay); ctx.lineTo(ax + gap - 2, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + gap - 2, ay); ctx.lineTo(ax + gap - 7, ay - 4); ctx.lineTo(ax + gap - 7, ay + 4); ctx.closePath(); ctx.fillStyle = c.fau; ctx.fill();
      }
    });
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, 148, c, 12, "center", c.muted);
    var visible = s.done ? s.steps.length : 0, revealCount = s.revealing ? Math.ceil(s.progress * s.steps.length) : visible;
    for (var i = 0; i < revealCount; i++) text(ctx, s.steps[i], w / 2, 196 + i * 29, c, 13, "center", i === revealCount - 1 ? c.fau : c.ink);
  }

  function challenge(state, canvas, spec) {
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer, why: spec.why,
      stage: function () { Object.assign(state, { heading: spec.heading, nodes: spec.nodes, answer: spec.answer, steps: spec.steps, guess: "", done: false, revealing: false, progress: 0 }); queue(canvas, state); },
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
    var state = Object.assign({ guess: "", done: false, steps: [], nodes: ["input", "rule", "?"] }, initial);
    function paint() { queue(canvas, state); }
    function lock(on) {
      form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = on; });
      canvas.parentElement.classList.toggle("locked", on);
    }
    Lab.experiment({
      id: id, title: title, card: card,
      lock: lock,
      setup: paint,
      sandbox: function () { state.guess = ""; state.done = false; state.steps = []; paint(); },
      challenges: specs.map(function (spec) { return challenge(state, canvas, spec); }),
    });
    form.querySelector('[data-act="run"]').addEventListener("click", function () {
      try {
        var result = run(form);
        state.heading = result.heading; state.nodes = result.nodes || ["input", "rule", "result"];
        state.answer = result.answer; state.steps = result.steps || [result.answer]; state.done = true; state.revealing = false;
        form.querySelector('[data-out="result"]').textContent = showResult(result);
      } catch (e) {
        state.heading = "Check the input"; state.nodes = ["entered value", "valid format?", "—"];
        state.answer = e.message || "Check the input"; state.steps = [state.answer]; state.done = true;
        form.querySelector('[data-out="result"]').textContent = state.answer;
      }
      paint();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () {
      form.reset(); state.heading = "Follow the representation"; state.nodes = ["input", "rule", "result"];
      state.answer = "?"; state.steps = []; state.done = false; state.guess = "";
      form.querySelector('[data-out="result"]').textContent = "—"; paint();
    });
  }

  function spec(id, short, ref, prompt, answer, options, heading, nodes, steps, why) {
    return { id: id, short: short, ref: ref, prompt: prompt, answer: answer, options: options, heading: heading, nodes: nodes, steps: steps, why: why };
  }

  (function () {
    var s = document.querySelector('[data-experiment="integers"]'), f = s.querySelector("form"), cv = s.querySelector("canvas"),
      opts = [["110101₂", "101101₂", "111010₂", "110011₂"], ["−1", "15", "−7", "0"], ["−3", "−4", "1", "3"], ["0100 0010", "101010", "0100 0011", "0010 1000"]];
    mount("integers", "3.1–3.2 Integer representations", s.querySelector(".challenge"), f, cv, [
      spec("base-53", "convert 53 to binary", "3.1", "Convert 53₁₀ to binary.", "110101₂", opts[0].map(x => [x, x]), "Decimal to binary", ["53₁₀", "divide by 2", "?"], ["Remainders from 53 are collected in reverse order.", "110101₂ = 32+16+4+1 = 53."], "Repeated division by 2 gives remainders that read upward as 110101₂."),
      spec("twos-1111", "decode a four-bit pattern", "3.2", "What value does 1111₂ represent as a four-bit two’s-complement number?", "−1", opts[1].map(x => [x, x]), "Two’s-complement decode", ["1111₂", "subtract 2⁴", "?"], ["The top bit is 1, so subtract the four-bit modulus 16.", "15−16=−1."], "The unsigned value 15 minus 2⁴ gives −1; the width is part of the decoding rule."),
      spec("excess-001", "decode Excess-4", "3.2", "What value does 001₂ represent in three-bit Excess-4?", "−3", opts[2].map(x => [x, x]), "Biased integer", ["001₂ = 1", "bias 4", "?"], ["An Excess-4 value is the stored value minus 4.", "1−4=−3."], "Subtract the bias from the unsigned stored value: 1−4=−3."),
      spec("bcd-42", "encode decimal 42", "3.2", "Which pattern is BCD for decimal 42?", "0100 0010", opts[3].map(x => [x, x]), "Decimal digit groups", ["4", "2", "?"], ["Encode each decimal digit separately with four bits.", "4 is 0100 and 2 is 0010, so BCD is 0100 0010."], "BCD keeps one four-bit group per decimal digit. It is not the ordinary binary encoding of the whole number."),
    ], { heading: "Base conversion and integer encodings", nodes: ["value", "base or encoding", "meaning"] }, function (form) {
      var task = form.querySelector("[data-task]").value, value = form.querySelector("[data-value]").value, answer, nodes, steps;
      if (task === "convert") { var r = P.convert(value, Number(form.querySelector("[data-from]").value), Number(form.querySelector("[data-to]").value)); answer = r.result + " (base " + form.querySelector("[data-to]").value + ")"; nodes = [value, "base conversion", "result"]; steps = ["The input value is " + r.value + " in decimal.", "The converted digits are " + answer + "."]; }
      else if (task === "bcd") { answer = P.encodeBcd(Number(value)); nodes = [value, "one group per digit", "BCD"]; steps = ["Encode every decimal digit in four bits.", "BCD pattern: " + answer + "."]; }
      else { answer = String(P.decodeInteger(value, form.querySelector("[data-encoding]").value, Number(form.querySelector("[data-bias]").value))); nodes = [value, form.querySelector("[data-encoding]").selectedOptions[0].textContent, "value"]; steps = ["Keep the stated bit width.", "Decoded value: " + answer + "."]; }
      return { heading: "Integer conversion", nodes: nodes, answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="arithmetic"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("arithmetic", "3.4–3.5 Binary arithmetic", s.querySelector(".challenge"), f, cv, [
      spec("unsigned-divide", "divide unsigned values", "3.4", "For 11101₂ ÷ 00101₂, give the quotient and remainder.", "q=101₂, r=100₂", [["q=101₂, r=100₂", "q=100₂, r=101₂", "q=110₂, r=001₂"]], "Unsigned division", ["11101₂ ÷ 00101₂", "quotient and remainder", "?"], ["29÷5 gives quotient 5 and remainder 4.", "5 is 101₂ and 4 is 100₂; the remainder is less than the divisor."], "Check dividend = quotient×divisor + remainder, with remainder less than divisor."),
      spec("unsigned-add", "add unsigned values", "3.4", "What is 1011₂ + 0110₂ as an unsigned binary sum?", "10001₂", [["10001₂", "0001₂", "1111₂"]], "Unsigned addition", ["1011₂", "+ 0110₂", "?"], ["Add each column and carry into the next.", "The five-bit result is 10001₂, which is 17 in decimal."], "The carry beyond the original four columns is part of the exact unsigned result when width is not fixed."),
      spec("signed-overflow", "detect signed overflow", "3.5", "In four-bit two’s complement, does 0101₂ + 0011₂ overflow?", "Yes · 1000₂ reads −8", [["Yes · 1000₂ reads −8", "No · the exact sum is 8", "Yes · carry-out alone proves it"]], "Fixed-width addition", ["+5", "+3", "four-bit result"], ["The exact sum is 8, outside the four-bit range −8…+7.", "The retained pattern is 1000₂, which decodes as −8: signed overflow occurred."], "The four-bit pattern wraps to 1000₂, but the exact value 8 is outside the signed range. Carry-out is not the signed overflow test."),
      spec("signed-no-overflow", "separate carry from overflow", "3.5", "For 1011₂ + 0011₂ as four-bit two’s complement, is there signed overflow?", "No · result −2", [["No · result −2", "Yes · carry-out means overflow", "Yes · result is −14"]], "Signed addition", ["−5", "+3", "four-bit result"], ["The exact sum is −2, inside −8…+7.", "The retained pattern 1110₂ decodes to −2, so there is no signed overflow."], "The exact result is representable. A carry bit and signed overflow are different properties."),
    ], { heading: "Binary arithmetic", nodes: ["operands", "operation", "result"] }, function (form) {
      var a = form.querySelector("[data-left]").value, b = form.querySelector("[data-right]").value, mode = form.querySelector("[data-mode]").value, op = form.querySelector("[data-operation]").value, result, answer, steps;
      if (mode === "unsigned") { result = P.unsignedArithmetic(a, b, op); answer = op === "divide" ? "q=" + result.quotientBits + ", r=" + result.remainderBits : result.bits + "₂"; steps = op === "divide" ? ["Divide the unsigned values.", "Quotient " + result.quotientBits + "₂ and remainder " + result.remainderBits + "₂."] : ["Interpret both operands as unsigned values.", "Result: " + answer + "."]; }
      else { if (op === "divide") throw new RangeError("choose add or subtract for two’s-complement mode"); result = P.twosArithmetic(a, b, op); answer = result.pattern + "₂ = " + result.decoded + (result.overflow ? " · overflow" : " · no overflow"); steps = ["Exact signed result: " + result.exact + ".", "Allowed range: " + result.min + "…" + result.max + ".", "Stored " + answer + "."]; }
      return { heading: "Binary arithmetic", nodes: [a, op, b], answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="spacing"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("spacing", "4.1 Floating-point spacing", s.querySelector(".challenge"), f, cv, [
      spec("spacing-one", "next gap after one", "4.1", "What is the gap from 1 to the next larger single-precision value?", "2⁻²³", [["2⁻²³", "2⁻²⁴", "2⁻⁷"]], "Spacing near one", ["single precision", "p=24 bits", "gap after 1"], ["For binary precision p, the gap after 1 is 2¹⁻ᵖ.", "With p=24, the gap is 2⁻²³."], "Normalised single precision has 24 significand bits, including the hidden leading bit; the next value after 1 differs by 2⁻²³."),
      spec("spacing-eight", "spacing near eight", "4.1", "For 24-bit precision, what is the spacing in the binade beginning at 8?", "2⁻²⁰", [["2⁻²⁰", "2⁻²³", "2⁻²⁴"]], "Spacing scales with exponent", ["8 = 2³", "p=24", "local gap"], ["Within exponent E, spacing is 2ᴱ⁻ᵖ⁺¹.", "For E=3 and p=24, the gap is 2⁻²⁰."], "Each increase of the exponent doubles the local spacing. At 8, the exponent is 3, giving 2³⁻²⁴⁺¹=2⁻²⁰."),
      spec("spacing-double", "double epsilon", "4.1", "What is machine epsilon for IEEE double precision with 53 significant bits?", "2⁻⁵²", [["2⁻⁵²", "2⁻⁵³", "2⁻¹¹"]], "Precision near one", ["double precision", "p=53", "εmach"], ["Machine epsilon is 2¹⁻ᵖ for binary precision p.", "2¹⁻⁵³=2⁻⁵², approximately 2.22×10⁻¹⁶."], "Machine epsilon is the gap from 1 to the next larger representable value: 2⁻⁵² for p=53."),
      spec("spacing-bit", "add one precision bit", "4.1", "If precision rises from 24 to 25 binary significand bits, how does spacing near 1 change?", "It halves", [["It halves", "It doubles", "It stays the same"]], "Precision and spacing", ["24 bits", "add one bit", "25 bits"], ["The gap changes from 2⁻²³ to 2⁻²⁴.", "Each additional precision bit halves the spacing near 1."], "One extra significand bit doubles the number of subdivisions per interval, halving adjacent spacing."),
    ], { heading: "Representable spacing", nodes: ["exponent", "precision", "gap"] }, function (form) {
      var e = Number(form.querySelector("[data-exponent]").value), p = Number(form.querySelector("[data-precision]").value), gap = P.spacing(e, p);
      return { heading: "Local floating-point spacing", nodes: ["2^" + e, "p=" + p, "gap"], answer: String(gap), steps: ["For binary precision p, local spacing is 2^(E−p+1).", "At E=" + e + " and p=" + p + ", the gap is " + gap + "."] };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="fractions"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("fractions", "4.2 Binary fractions", s.querySelector(".challenge"), f, cv, [
      spec("fraction-01101", "decode binary fraction", "4.2", "Convert 0.01101₂ to decimal.", "0.40625", [["0.40625", "0.3125", "0.6875"]], "Fractional place values", ["0.01101₂", "2⁻² + 2⁻³ + 2⁻⁵", "?"], ["The one-bits contribute 1/4, 1/8, and 1/32.", "1/4+1/8+1/32=0.40625."], "Add the negative powers of two at positions containing 1: 0.25+0.125+0.03125."),
      spec("fraction-06875", "encode decimal fraction", "4.2", "What is 0.6875 in binary?", "0.1011₂", [["0.1011₂", "0.1101₂", "0.0111₂"]], "Repeated multiplication by 2", ["0.6875", "×2 and record bits", "?"], ["The successive integer bits are 1, 0, 1, 1.", "The remainder reaches zero, so 0.6875=0.1011₂ exactly."], "Repeatedly multiply the fractional remainder by 2. Because the remainder reaches zero, this binary expansion terminates."),
      spec("fraction-tenth", "test exact binary storage", "4.2", "Does decimal 0.1 have a terminating binary expansion?", "No · it repeats", [["No · it repeats", "Yes · four bits", "Yes · one bit"]], "Finite binary fraction?", ["0.1₁₀", "binary expansion", "?"], ["A reduced fraction terminates in base 2 only when its denominator is a power of 2.", "The denominator of 1/10 contains a factor 5, so its binary expansion repeats."], "The denominator 10 is not a power of two, so no finite binary fraction represents one tenth exactly."),
      spec("fraction-place", "identify a fractional place", "4.2", "What is the place value of the fifth bit after a binary point?", "1/32", [["1/32", "1/16", "1/64"]], "Binary place values", ["1st bit: 1/2", "each place halves", "5th bit: ?"], ["The kth bit after the point has weight 2⁻ᵏ.", "For k=5, the weight is 2⁻⁵=1/32."], "Count the first fractional bit as 2⁻¹, so the fifth is 2⁻⁵."),
    ], { heading: "Binary fractions", nodes: ["binary digits", "place values", "decimal value"] }, function (form) {
      var value = form.querySelector("[data-value]").value, lim = Number(form.querySelector("[data-limit]").value), answer, steps;
      if (form.querySelector("[data-task]").value === "decode") { answer = String(P.fractionValue(value)); steps = ["Add the powers of two for each 1 bit.", "Decimal value: " + answer + "."]; }
      else { var r = P.fractionBits(Number(value), lim); answer = "0." + r.bits + (r.exact ? " exact" : "… rounded after " + lim + " bits"); steps = ["Multiply each fractional remainder by 2.", "Bits: " + r.bits + ". " + (r.exact ? "The remainder reaches zero." : "The expansion continues beyond the selected limit." )]; }
      return { heading: "Binary fraction conversion", nodes: [value, "powers of 2", "result"], answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="ieee"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("ieee", "4.4 IEEE 754 fields", s.querySelector(".challenge"), f, cv, [
      spec("ieee-one", "decode positive one", "4.4", "What value is encoded by 3F800000₁₆ as IEEE single precision?", "1", [["1", "0.5", "2"]], "Decode IEEE fields", ["3F800000₁₆", "S | E | F", "?"], ["The sign is 0, exponent field is 01111111₂=127, and fraction is zero.", "Unbiased exponent is 127−127=0, so the value is +1×2⁰=1."], "The biased exponent equals 127, which decodes to exponent 0; the hidden leading bit gives significand 1."),
      spec("ieee-minus-ten", "decode a negative value", "4.4", "What value is encoded by C1200000₁₆?", "−10", [["−10", "−8", "10"]], "Sign, exponent, fraction", ["C1200000₁₆", "sign and scale", "?"], ["The sign bit is 1 and the unbiased exponent is 3.", "The significand is 1.01₂=1.25, so −1.25×2³=−10."], "Decode the negative sign, significand 1.01₂, and exponent 3; their product is −10."),
      spec("ieee-infinity", "classify infinity", "4.4", "What does 7F800000₁₆ encode?", "+Infinity", [["+Infinity", "NaN", "largest finite value"]], "Reserved exponent", ["7F800000₁₆", "S | E | F", "?"], ["All-one exponent with zero fraction is infinity.", "The sign bit is zero, so it is positive infinity."], "The exponent is all ones, the fraction is zero, and the sign is positive: positive infinity."),
      spec("ieee-nan", "classify NaN", "4.4", "What does 7FC00000₁₆ encode?", "NaN", [["NaN", "+Infinity", "positive zero"]], "Exponent and fraction", ["7FC00000₁₆", "S | E | F", "?"], ["All-one exponent with non-zero fraction is NaN.", "The exact payload does not turn it into a finite number."], "An all-one exponent and non-zero fraction encode NaN, regardless of the payload bits."),
    ], { heading: "IEEE single precision", nodes: ["sign", "8-bit exponent", "23-bit fraction"] }, function (form) {
      var r = P.decodeSingle(form.querySelector("[data-hex]").value), exp = parseInt(r.exponent, 2), detail = r.classification === "normalised" ? "value " + r.value : r.classification;
      return { heading: "IEEE single-precision decode", nodes: ["S=" + r.sign, "E=" + r.exponent, "F=" + r.fraction], answer: detail, steps: ["The stored exponent is " + exp + "; normalised values subtract bias 127.", "Classification and decoded value: " + detail + "."] };
    }, function (r) { return r.answer; });
  })();

  (function () {
    var s = document.querySelector('[data-experiment="stability"]'), f = s.querySelector("form"), cv = s.querySelector("canvas");
    mount("stability", "4.5 Numerical stability", s.querySelector(".challenge"), f, cv, [
      spec("cancel-error", "estimate cancellation error", "4.5", "With five significant decimal digits, what relative error results from subtracting the stored values 0.12346−0.12345 instead of the exact inputs?", "About 80%", [["About 80%", "About 0.8%", "Zero"]], "Close rounded inputs", ["exact difference", "stored difference", "relative error"], ["The exact difference is 0.000005555; the stored difference is 0.00001.", "The stored result has about 80.0% relative error."], "The stored result is nearly 1.80 times the exact difference, so relative error is about 80%."),
      spec("sterbenz-exact", "apply Sterbenz lemma", "4.5", "For x=1.5 and y=1.0, is x−y exactly representable under Sterbenz’s condition?", "Yes · 0.5", [["Yes · 0.5", "No · 0.5 is rounded", "No · values are too far apart"]], "Nearby floating-point values", ["x=1.5", "compare x and y", "y=1.0"], ["The ratio condition y/2≤x≤2y holds.", "The difference 1.5−1.0=0.5 is exact."], "The positive operands satisfy y/2≤x≤2y. The subtraction is exact; any prior rounding in the inputs remains."),
      spec("quadratic-stable", "choose a stable root", "4.5", "For b>0, which numerator avoids cancellation when b² is much larger than 4ac?", "−b−√D", [["−b−√D", "−b+√D", "b−√D"]], "Quadratic formula", ["D=b²−4ac", "b>0", "choose a branch"], ["When b is positive, √D is close to b.", "The numerator −b−√D adds magnitudes; −b+√D subtracts close values."], "Select the branch that adds magnitudes in the numerator. For b>0, −b−√D avoids subtracting nearly equal quantities."),
      spec("fma-rounding", "compare fused multiply-add", "4.5", "How many final roundings does a fused multiply-add perform?", "One", [["One", "Two", "None"]], "Fused operation", ["a×b", "+c", "one final rounding"], ["The product is not rounded to the target format before c is added.", "The fused result is rounded once after a×b+c."], "FMA evaluates the exact product-plus-sum before one final rounding; separate operations can round twice."),
    ], { heading: "Floating-point error and stability", nodes: ["inputs", "operation", "error"] }, function (form) {
      var task = form.querySelector("[data-task]").value, a = Number(form.querySelector("[data-a]").value), b = Number(form.querySelector("[data-b]").value), c = Number(form.querySelector("[data-c]").value), answer, steps, nodes;
      if (task === "cancellation") { var r = P.cancellation(a, b); answer = "exact " + r.exact + "; stored " + r.stored + "; relative error " + (100 * r.relativeError).toFixed(2) + "%"; nodes = ["rounded x,y", "subtract", "relative error"]; steps = ["Five significant digits store the inputs as " + Number(a).toPrecision(5) + " and " + Number(b).toPrecision(5) + ".", "Exact difference " + r.exact + "; stored difference " + r.stored + ".", "Relative error: " + (100 * r.relativeError).toFixed(2) + "%." ]; }
      else if (task === "sterbenz") { answer = String(P.subtractExactBySterbenz(a, b)); nodes = [String(a), "subtract", String(b)]; steps = ["Check y/2≤x≤2y for positive finite inputs.", "The exact result is " + answer + "."]; }
      else { var q = P.stableQuadratic(a, b, c); answer = q.roots.map(x => Number(x).toPrecision(8)).join(", "); nodes = ["ax²+bx+c", "stable q/a and c/q", "roots"]; steps = ["Discriminant D=" + q.discriminant + ".", "Stable roots: " + answer + "."]; }
      return { heading: "Numerical stability", nodes: nodes, answer: answer, steps: steps };
    }, function (r) { return r.answer; });
  })();

  var stabilityForm = document.querySelector('[data-experiment="stability"] form');
  stabilityForm.querySelector("[data-task]").addEventListener("change", function () {
    var values = this.value === "quadratic" ? ["1", "100000000", "1"] : this.value === "sterbenz" ? ["1.5", "1", "1"] : ["0.123456789", "0.123451234", "1"];
    ["[data-a]", "[data-b]", "[data-c]"].forEach(function (sel, i) { stabilityForm.querySelector(sel).value = values[i]; });
  });
})();
