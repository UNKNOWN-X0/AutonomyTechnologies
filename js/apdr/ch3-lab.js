/* APDR Chapter 3: number bases, encodings, character codes, and arithmetic. */
(function () {
  var P = window.APDR3, canvases = [];

  function colours(stage) {
    var s = getComputedStyle(stage);
    return {
      paper: s.getPropertyValue("--paper").trim(), panel: s.getPropertyValue("--paper-2").trim(),
      ink: s.getPropertyValue("--ink").trim(), muted: s.getPropertyValue("--muted").trim(),
      line: s.getPropertyValue("--line").trim(), fau: s.getPropertyValue("--fau-mark").trim(),
      course: s.getPropertyValue("--course").trim(), act: s.getPropertyValue("--act").trim(),
      font: s.getPropertyValue("--f-display").trim(),
    };
  }

  function queue(canvas, state) {
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
      if (state.kind === "bases") drawBases(ctx, r.width, r.height, c, state);
      if (state.kind === "encodings") drawEncoding(ctx, r.width, r.height, c, state);
      if (state.kind === "characters") drawCharacters(ctx, r.width, r.height, c, state);
      if (state.kind === "unsigned") drawUnsigned(ctx, r.width, r.height, c, state);
      if (state.kind === "signed") drawSigned(ctx, r.width, r.height, c, state);
    });
  }

  function text(ctx, value, x, y, c, size, align, colour) {
    ctx.fillStyle = colour || c.ink; ctx.font = "600 " + (size || 14) + "px " + (c.font || "sans-serif");
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle"; ctx.fillText(String(value), x, y);
  }

  function box(ctx, label, x, y, w, h, c, active, size) {
    ctx.fillStyle = active ? c.panel : c.paper; ctx.strokeStyle = active ? c.fau : c.line;
    ctx.lineWidth = active ? 2.5 : 1.5; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
    text(ctx, label, x + w / 2, y + h / 2, c, size || 13);
  }

  function arrow(ctx, x1, y1, x2, y2, c, active) {
    ctx.strokeStyle = active ? c.fau : c.muted; ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1), l = 7; ctx.fillStyle = active ? c.fau : c.muted;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - l * Math.cos(a - .45), y2 - l * Math.sin(a - .45));
    ctx.lineTo(x2 - l * Math.cos(a + .45), y2 - l * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }

  function drawBits(ctx, bits, centerX, y, c, activeIndex) {
    var str = String(bits || "—").replace(/\s/g, ""), max = Math.min(str.length, 16), w = Math.min(38, 300 / max), h = 38,
      x = centerX - (max * w + (max - 1) * 3) / 2;
    for (var i = 0; i < max; i++) box(ctx, str[i], x + i * (w + 3), y, w, h, c, i === activeIndex, 15);
  }

  function drawBases(ctx, w, h, c, s) {
    text(ctx, "Positional value: digit × base place", w / 2, 26, c, 15);
    text(ctx, String(s.value || "—") + "  in base " + (s.from || "?"), w / 2, 67, c, 16);
    var binary = "";
    try { binary = P.toBase(P.parseBase(s.value || "0", s.from || 10), 2); } catch (e) { binary = "enter a valid numeral"; }
    var count = s.challenge && !s.revealing && s.result == null ? 0 : s.revealing ? Math.ceil(binary.length * s.progress) : binary.length,
      shown = binary.split("").map(function (bit, i) { return i < count ? bit : "?"; }).join("");
    drawBits(ctx, shown, w / 2, 95, c, s.revealing ? Math.min(binary.length - 1, Math.floor(s.progress * binary.length)) : -1);
    arrow(ctx, w * .28, 153, w * .72, 153, c, s.revealing && s.progress > .35);
    if (s.result != null) text(ctx, "Base " + s.to + " = " + s.result, w / 2, h - 68, c, 16);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 45, c, 12);
  }

  function drawEncoding(ctx, w, h, c, s) {
    text(ctx, s.task === "bcd" ? "Each decimal digit gets four bits" : "Interpret the same pattern by its encoding", w / 2, 26, c, 14);
    if (s.task === "bcd") {
      var groups = String(s.bits || "59").split("").map(function (digit) { return Number(digit).toString(2).padStart(4, "0"); });
      var totalW = groups.length * 54, startX = (w - totalW) / 2;
      groups.forEach(function (g, i) {
        var shown = !s.challenge || s.result != null || s.revealing && Math.ceil(s.progress * groups.length) > i;
        box(ctx, shown ? g : "????", startX + i * 54, 72, 48, 42, c, shown && s.revealing, 12);
      });
      text(ctx, "decimal " + s.bits + " → one group per digit", w / 2, 143, c, 13);
    } else {
      drawBits(ctx, s.bits || "1111", w / 2, 68, c, s.revealing ? 0 : -1);
      text(ctx, (s.encoding || "unsigned") + (s.encoding === "excess" ? " with B=" + s.bias : ""), w / 2, 127, c, 13);
    }
    if (s.result != null) text(ctx, "Decoded value: " + s.result, w / 2, h - 68, c, 15);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 45, c, 12);
  }

  function drawCharacters(ctx, w, h, c, s) {
    text(ctx, "Hexadecimal byte → ASCII character", w / 2, 26, c, 15);
    var tokens = String(s.hex || "46").trim().split(/\s+/).filter(Boolean), n = Math.min(tokens.length, 8), bw = Math.min(48, (w - 36) / n), left = (w - n * (bw + 5)) / 2;
    tokens.slice(0, n).forEach(function (token, i) {
      var code = parseInt(token.replace(/^0x/i, ""), 16), ch = code >= 32 && code <= 126 ? String.fromCharCode(code) : "[" + code + "]";
      box(ctx, token.toUpperCase(), left + i * (bw + 5), 68, bw, 38, c, s.revealing && s.progress * n > i, 12);
      var visible = !s.challenge || s.result != null || s.revealing && s.progress * n > i;
      text(ctx, visible ? ch : "?", left + i * (bw + 5) + bw / 2, 131, c, 16);
    });
    arrow(ctx, w * .28, 150, w * .72, 150, c, s.revealing && s.progress > .5);
    if (s.result != null) text(ctx, "Decoded text: " + s.result, w / 2, h - 65, c, 15);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 43, c, 12);
  }

  function drawUnsigned(ctx, w, h, c, s) {
    text(ctx, "Unsigned binary arithmetic", w / 2, 25, c, 15);
    text(ctx, String(s.left || "—"), w * .22, 74, c, 15);
    text(ctx, s.operation === "subtract" ? "−" : s.operation === "multiply" ? "×" : s.operation === "divide" ? "÷" : "+", w / 2, 74, c, 19, "center", c.course);
    text(ctx, String(s.right || "—"), w * .78, 74, c, 15);
    arrow(ctx, w * .25, 111, w * .75, 111, c, s.revealing);
    if (s.result != null) {
      if (s.operation === "divide") {
        text(ctx, "quotient " + s.quotientBits + " · remainder " + s.remainderBits, w / 2, h - 65, c, 13);
      } else text(ctx, "Result: " + s.resultBits + "₂", w / 2, h - 65, c, 16);
    }
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 43, c, 12);
  }

  function drawSigned(ctx, w, h, c, s) {
    text(ctx, "Two’s-complement fixed-width check", w / 2, 25, c, 14);
    text(ctx, s.left || "—", w * .22, 69, c, 15);
    text(ctx, s.operation === "subtract" ? "−" : "+", w / 2, 69, c, 19, "center", c.course);
    text(ctx, s.right || "—", w * .78, 69, c, 15);
    arrow(ctx, w * .25, 94, w * .75, 94, c, s.revealing);
    if (s.result != null) {
      drawBits(ctx, s.pattern, w / 2, 110, c, -1);
      text(ctx, "exact " + s.exact + "; stored as " + s.decoded, w / 2, 157, c, 12);
      text(ctx, s.overflow ? "Overflow: yes" : "Overflow: no", w / 2, h - 64, c, 14, "center", s.overflow ? c.fau : c.ink);
    }
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 42, c, 12);
  }

  function lock(form, section, on) {
    form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = on; });
    section.querySelector(".stage").classList.toggle("locked", on);
  }

  function animate(state, draw, value) {
    state.revealing = true;
    return Lab.tween(1300, function (t) { state.progress = t; draw(); }).then(function () {
      state.revealing = false; value(); draw();
    });
  }

  function standard(setup, preview, reveal, why, id, short, ref, prompt, options, answer) {
    return { id: id, short: short, ref: ref, prompt: prompt, options: options, answer: answer,
      stage: setup, preview: preview, reveal: reveal, why: why };
  }

  function experimentBases() {
    var section = document.querySelector('[data-experiment="bases"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "bases", value: "45", from: 10, to: 2 };
    function show() { queue(canvas, state); }
    function set(value, from, to) { state.value = value; state.from = from; state.to = to; state.result = null; }
    function readForm() { set(form.querySelector("[data-value]").value, Number(form.querySelector("[data-from]").value), Number(form.querySelector("[data-to]").value)); }
    form.querySelector('[data-act="convert"]').addEventListener("click", function () {
      readForm(); try { state.result = P.convert(state.value, state.from, state.to).result; form.querySelector('[data-out="result"]').textContent = state.result; }
      catch (e) { form.querySelector('[data-out="result"]').textContent = "check digits and base"; } show();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { form.querySelector("[data-value]").value = "45"; form.querySelector("[data-from]").value = "10"; form.querySelector("[data-to]").value = "2"; set("45", 10, 2); form.querySelector('[data-out="result"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, value, from, to, answer, why) {
      return standard(function () { set(value, from, to); state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { state.result = P.convert(value, from, to).result; }); },
        why, id, short, "3.1", prompt,
        [[answer, answer], ...["101101", "98", "55", "CA"].filter(function (x) { return x !== answer; }).slice(0, 2).map(function (x) { return [x, x]; })], answer);
    }
    Lab.experiment({ id: "bases", title: "3.1 Number bases", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.guess = ""; readForm(); show(); },
      challenges: [
        challenge("decimal-binary", "decimal to binary", "Convert decimal 45 to binary.", "45", 10, 2, "101101", "Repeated division by 2 gives the remainders 1, 0, 1, 1, 0, 1 from last to first. That reads as 101101₂, which expands back to 45."),
        challenge("binary-decimal", "binary place values", "What decimal value does 1100010₂ represent?", "1100010", 2, 10, "98", "The 1 bits mark 2⁶, 2⁵, and 2¹. Their place values add to 64+32+2=98."),
        challenge("binary-octal", "three-bit octal groups", "Group 101101₂ in threes and write the octal value.", "101101", 2, 8, "55", "From the right, the groups are 101 and 101. Each group is 5, so the octal numeral is 55₈."),
        challenge("binary-hex", "four-bit hexadecimal groups", "Group 11001010₂ in fours and write the hexadecimal value.", "11001010", 2, 16, "CA", "The groups are 1100 and 1010. They have values C and A in hexadecimal, giving CA₁₆."),
      ] });
  }

  function experimentEncodings() {
    var section = document.querySelector('[data-experiment="encodings"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "encodings", task: "decode", bits: "1111", encoding: "twos-complement", bias: 8 };
    function show() { queue(canvas, state); }
    function calculate(task, bits, encoding, bias) { return task === "bcd" ? P.encodeBcd(Number(bits)) : String(P.decodeInteger(bits, encoding, bias)); }
    function readForm() { state.task = form.querySelector("[data-task]").value; state.bits = form.querySelector("[data-value]").value; state.encoding = form.querySelector("[data-encoding]").value; state.bias = Number(form.querySelector("[data-bias]").value); }
    form.querySelector('[data-act="decode"]').addEventListener("click", function () { readForm(); try { state.result = calculate(state.task, state.bits, state.encoding, state.bias); form.querySelector('[data-out="result"]').textContent = state.result; } catch (e) { form.querySelector('[data-out="result"]').textContent = "check the pattern or bias"; } show(); });
    form.querySelector("[data-task]").addEventListener("change", function (event) { form.querySelector('[data-value]').value = event.target.value === "bcd" ? "59" : "1111"; });
    function challenge(id, short, prompt, task, bits, encoding, bias, answer, why) {
      return standard(function () { state.task = task; state.bits = bits; state.encoding = encoding; state.bias = bias; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { state.result = calculate(task, bits, encoding, bias); }); },
        why, id, short, "3.2", prompt, [[answer, answer], ...["15", "−7", "−1", "0101 1001"].filter(function (x) { return x !== answer; }).slice(0, 2).map(function (x) { return [x, x]; })], answer);
    }
    Lab.experiment({ id: "encodings", title: "3.2 Integer representations", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.guess = ""; readForm(); show(); },
      challenges: [
        challenge("unsigned-pattern", "unsigned pattern", "Decode 1111 as an unsigned four-bit value.", "decode", "1111", "unsigned", 8, "15", "For an unsigned pattern, add the place values of its 1 bits: 8+4+2+1=15. The width sets the maximum value at 15."),
        challenge("sign-magnitude", "sign and magnitude", "Decode 1101 using four-bit sign-and-magnitude.", "decode", "1101", "sign-magnitude", 8, "−5", "The first bit is the negative sign. The remaining bits 101 are magnitude 5, so the value is −5."),
        challenge("twos-pattern", "two’s-complement pattern", "Decode 1111 using four-bit two’s complement.", "decode", "1111", "twos-complement", 8, "−1", "The unsigned value is 15. Since the sign bit is 1, subtract 2⁴: 15−16=−1."),
        challenge("bcd-digits", "BCD digit groups", "Write decimal 59 in four-bit BCD.", "bcd", "59", "unsigned", 8, "0101 1001", "Encode each decimal digit separately: 5 is 0101 and 9 is 1001. BCD uses two groups; it is not the ordinary binary encoding of 59."),
      ] });
  }

  function experimentCharacters() {
    var section = document.querySelector('[data-experiment="characters"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "characters", hex: "46 72 65 64" };
    function show() { queue(canvas, state); }
    function decode(hex) { return P.decodeAsciiHex(hex); }
    form.querySelector('[data-act="decode"]').addEventListener("click", function () { state.hex = form.querySelector("[data-hex]").value; try { state.result = decode(state.hex); form.querySelector('[data-out="result"]').textContent = state.result; } catch (e) { form.querySelector('[data-out="result"]').textContent = "use two-digit ASCII-range hex bytes"; } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { state.hex = "46 72 65 64"; state.result = null; state.guess = ""; form.querySelector("[data-hex]").value = state.hex; form.querySelector('[data-out="result"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, hex, answer, why) {
      return standard(function () { state.hex = hex; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { state.result = decode(hex); }); },
        why, id, short, "3.3", prompt, [[answer, answer], ...["F", "d", "Fred", "A", "same", "different"].filter(function (x) { return x !== answer; }).slice(0, 2).map(function (x) { return [x, x]; })], answer);
    }
    Lab.experiment({ id: "characters", title: "3.3 Character data", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.guess = ""; state.hex = form.querySelector("[data-hex]").value; show(); },
      challenges: [
        challenge("ascii-f", "ASCII hexadecimal code", "The hexadecimal ASCII byte 46 represents which character?", "46", "F", "Hex 46 is decimal 70. In the ASCII mapping, code 70 represents the uppercase letter F."),
        challenge("ascii-d", "read the final byte", "The final byte in the lecture’s word example is 64₁₆. Which ASCII character is it?", "64", "d", "Hex 64 is decimal 100, the lowercase ASCII letter d. Character codes identify symbols through a named encoding."),
        challenge("ascii-word", "decode the lecture example", "Decode the ASCII bytes 46 72 65 64 as text.", "46 72 65 64", "Fred", "The hexadecimal values map to F, r, e, and d. Read in order, they spell Fred."),
        challenge("ascii-unicode", "ASCII and Unicode range", "Which character is named by both ASCII code 41₁₆ and Unicode code point U+0041?", "41", "A", "Both values identify the character A: the first 128 Unicode code points correspond to ASCII. A byte sequence still needs its encoding named before it can be decoded."),
      ] });
  }

  function formatUnsigned(result, operation) {
    return operation === "divide" ? "q=" + result.quotientBits + "; r=" + result.remainderBits : result.bits;
  }

  function experimentUnsigned() {
    var section = document.querySelector('[data-experiment="unsigned"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "unsigned", left: "111011", right: "101010", operation: "add" };
    function show() { queue(canvas, state); }
    function readForm() { state.left = form.querySelector("[data-left]").value; state.right = form.querySelector("[data-right]").value; state.operation = form.querySelector("[data-operation]").value; }
    function calculate(left, right, operation) { var r = P.unsignedArithmetic(left, right, operation); return { source: r, label: formatUnsigned(r, operation) }; }
    form.querySelector('[data-act="calculate"]').addEventListener("click", function () { readForm(); try { var r = calculate(state.left, state.right, state.operation); state.result = r.label; state.resultBits = r.source.bits; state.quotientBits = r.source.quotientBits; state.remainderBits = r.source.remainderBits; form.querySelector('[data-out="result"]').textContent = r.label; } catch (e) { form.querySelector('[data-out="result"]').textContent = "check binary digits and divisor"; } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { form.querySelector("[data-left]").value = "111011"; form.querySelector("[data-right]").value = "101010"; form.querySelector("[data-operation]").value = "add"; state = Object.assign(state, { left: "111011", right: "101010", operation: "add", result: null, guess: "" }); form.querySelector('[data-out="result"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, left, right, operation, answer, why) {
      return standard(function () { state.left = left; state.right = right; state.operation = operation; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { var r = calculate(left, right, operation); state.result = r.label; state.resultBits = r.source.bits; state.quotientBits = r.source.quotientBits; state.remainderBits = r.source.remainderBits; }); },
        why, id, short, "3.4", prompt, [[answer, answer], ...["1100101", "1111", "q=101; r=100", "1101"].filter(function (x) { return x !== answer; }).slice(0, 2).map(function (x) { return [x, x]; })], answer);
    }
    Lab.experiment({ id: "unsigned", title: "3.4 Unsigned arithmetic", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.guess = ""; readForm(); show(); },
      challenges: [
        challenge("binary-add", "add with carries", "Add 111011₂ and 101010₂. Write the result in binary.", "111011", "101010", "add", "1100101", "The operands are 59 and 42 in decimal, which sum to 101. That is 1100101₂; the leftmost carry becomes an additional result bit."),
        challenge("binary-multiply", "multiply partial products", "Multiply 101₂ by 11₂. Write the result in binary.", "101", "11", "multiply", "1111", "101₂ is 5 and 11₂ is 3, so the product is 15. Fifteen is 1111₂."),
        challenge("binary-divide", "quotient and remainder", "Divide 11101₂ by 101₂. Give the binary quotient and remainder.", "11101", "101", "divide", "q=101; r=100", "The dividend is 29 and the divisor is 5. The quotient is 5 and the remainder is 4, so in binary q=101 and r=100; the remainder is less than the divisor."),
        challenge("binary-subtract", "subtract by borrowing", "Subtract 01101₂ from 11010₂. Write the result in binary.", "11010", "01101", "subtract", "1101", "The values are 26−13=13. Thirteen is 1101₂; column borrowing gives the same result."),
      ] });
  }

  function experimentSigned() {
    var section = document.querySelector('[data-experiment="signed"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "signed", left: "0101", right: "0011", operation: "add" };
    function show() { queue(canvas, state); }
    function readForm() { var width = Number(form.querySelector("[data-width]").value); state.left = form.querySelector("[data-left]").value.padStart(width, "0"); state.right = form.querySelector("[data-right]").value.padStart(width, "0"); state.operation = form.querySelector("[data-operation]").value; }
    function calculate(left, right, operation) { return P.twosArithmetic(left, right, operation); }
    function report(r) { return "pattern=" + r.pattern + "; exact=" + r.exact + "; overflow=" + (r.overflow ? "yes" : "no") + (r.carryOut ? "; carry out=1" : ""); }
    form.querySelector('[data-act="calculate"]').addEventListener("click", function () { readForm(); try { var r = calculate(state.left, state.right, state.operation); Object.assign(state, r); state.result = r; form.querySelector('[data-out="pattern"]').textContent = r.pattern; form.querySelector('[data-out="result"]').textContent = r.decoded; form.querySelector('[data-out="overflow"]').textContent = r.overflow ? "yes" : "no"; } catch (e) { form.querySelector('[data-out="pattern"]').textContent = "check equal-width bit patterns"; } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { form.querySelector("[data-width]").value = "4"; form.querySelector("[data-left]").value = "0101"; form.querySelector("[data-right]").value = "0011"; form.querySelector("[data-operation]").value = "add"; Object.assign(state, { left: "0101", right: "0011", operation: "add", result: null, guess: "" }); form.querySelector('[data-out="pattern"]').textContent = "—"; form.querySelector('[data-out="result"]').textContent = "—"; form.querySelector('[data-out="overflow"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, left, right, operation, answer, why) {
      return standard(function () { state.left = left; state.right = right; state.operation = operation; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice === "yes" ? "Overflow" : "No overflow"; show(); },
        function () { return animate(state, show, function () { var r = calculate(left, right, operation); Object.assign(state, r); state.result = r; }); },
        why, id, short, "3.5", prompt, [["yes", "Yes · overflow"], ["no", "No · fits the range"]], answer);
    }
    Lab.experiment({ id: "signed", title: "3.5 Two’s-complement arithmetic", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.guess = ""; readForm(); show(); },
      challenges: [
        challenge("positive-overflow", "positive sum outside range", "In four-bit two’s complement, add 0101 and 0011. Does the exact result fit?", "0101", "0011", "add", "yes", "The exact sum is +8, outside the four-bit range −8 to +7. The stored pattern is 1000, so two positive operands produced a negative-sign pattern."),
        challenge("negative-overflow", "negative sum outside range", "In four-bit two’s complement, add 1001 and 1010. Does the exact result fit?", "1001", "1010", "add", "yes", "The patterns represent −7 and −6, whose exact sum is −13. The four-bit result wraps to 0011, which decodes as +3, so signed overflow occurred."),
        challenge("mixed-sign", "mixed-sign addition", "In four-bit two’s complement, add 1011 and 0011. Does the exact result fit?", "1011", "0011", "add", "no", "The operands are −5 and +3, so the exact result is −2. It lies in the range −8 to +7 and the stored pattern is 1110; unlike signs cannot cause signed addition overflow."),
        challenge("lower-bound", "the lower range boundary", "In four-bit two’s complement, calculate 1011−0011. Does the exact result fit?", "1011", "0011", "subtract", "no", "The exact result is −5−3=−8, the lowest representable value. The stored pattern is 1000 and it fits; a carry-out is not the signed-overflow test."),
      ] });
  }

  experimentBases(); experimentEncodings(); experimentCharacters(); experimentUnsigned(); experimentSigned();
  document.querySelectorAll(".experiment canvas").forEach(function (canvas) {
    canvases.push(canvas);
    if (typeof ResizeObserver !== "undefined") {
      if (!window._apdrCh3Resize) window._apdrCh3Resize = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { var cv = entry.target.querySelector("canvas"); if (cv && cv._labState) queue(cv, cv._labState); });
      });
      window._apdrCh3Resize.observe(canvas.parentElement);
    }
  });
  window.addEventListener("resize", function () { canvases.forEach(function (canvas) { if (canvas._labState) queue(canvas, canvas._labState); }); });
})();
