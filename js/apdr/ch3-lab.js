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

  function rnd(n) { return Math.floor(Math.random() * n); }
  function mix(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function three(right, wrongs, more) {
    var out = [right];
    wrongs.concat(more || []).forEach(function (w) { if (out.length < 3 && out.indexOf(w) < 0) out.push(w); });
    return mix(out);
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
      // The drawings are laid out for a stage about 360 px tall; a taller stage (grown to match the card) centres
      // that layout instead of leaving its lower half empty.
      var H = Math.min(r.height, 360);
      ctx.translate(0, Math.round((r.height - H) / 2));
      if (state.kind === "bases") drawBases(ctx, r.width, H, c, state);
      if (state.kind === "encodings") drawEncoding(ctx, r.width, H, c, state);
      if (state.kind === "characters") drawCharacters(ctx, r.width, H, c, state);
      if (state.kind === "unsigned") drawUnsigned(ctx, r.width, H, c, state);
      if (state.kind === "signed") drawSigned(ctx, r.width, H, c, state);
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
    var str = String(bits || "—").replace(/\s/g, ""), cut = str.length > 16, max = Math.min(str.length, 16), w = Math.min(38, 300 / max), h = 38,
      x = centerX - (max * w + (max - 1) * 3) / 2;
    for (var i = 0; i < max; i++) box(ctx, cut && i === max - 1 ? "…" : str[i], x + i * (w + 3), y, w, h, c, i === activeIndex, 15);
  }

  // Bits split into groups from the right, each with its digit underneath once shown.
  function drawGroups(ctx, bits, size, base, centerX, y, c, shown, activeGroup) {
    var groups = [], end = bits.length;
    while (end > 0) { groups.unshift(bits.slice(Math.max(0, end - size), end).padStart(size, "0")); end -= size; }
    var bw = Math.min(22, 270 / (groups.length * size)), gap = 12, total = groups.length * size * bw + (groups.length - 1) * gap, x = centerX - total / 2;
    groups.forEach(function (g, i) {
      var fromRight = groups.length - 1 - i, active = fromRight === activeGroup;
      g.split("").forEach(function (b, k) { box(ctx, b, x + k * bw, y, bw, 34, c, active, 13); });
      text(ctx, fromRight < shown ? P.toBase(parseInt(g, 2), base) : "?", x + size * bw / 2, y + 54, c, 17, "center", active ? c.fau : c.ink);
      x += size * bw + gap;
    });
  }

  // Rows of digits lined up on their right edge. Each row: { label, digits, reveal, colour }; reveal rows show only the rightmost `shown` columns.
  function drawColumns(ctx, w, h, c, rows, shown, active) {
    var width = rows.reduce(function (m, r) { return Math.max(m, r.digits.length); }, 1),
      cell = Math.min(24, (w - 96) / width), step = Math.min(25, (h - 145) / rows.length), right = (w + width * cell) / 2 + 20;
    rows.forEach(function (row, n) {
      var y = 52 + n * step, small = row.small ? 11 : 15, len = row.digits.length;
      if (row.label) text(ctx, row.label, right - width * cell - 10, y, c, 12, "right", c.muted);
      for (var i = 0; i < len; i++) {
        var col = len - 1 - i;
        if (row.reveal && col >= shown) continue;
        var ch = row.digits[i];
        if (ch !== " ") text(ctx, ch, right - col * cell - cell / 2, y, c, Math.min(small, cell * .8), "center", col === active ? c.fau : row.colour);
      }
      if (row.rule) { ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(right - width * cell, y + step / 2); ctx.lineTo(right, y + step / 2); ctx.stroke(); }
    });
  }

  function columnsShown(s, width) {
    if (s.revealing) return Math.ceil(s.progress * width);
    return s.result != null ? width : 0;
  }

  function drawBases(ctx, w, h, c, s) {
    text(ctx, "Positional value: digit × base place", w / 2, 26, c, 15);
    text(ctx, String(s.value || "—") + "  in base " + (s.from || "?"), w / 2, 67, c, 16);
    var binary = "";
    try { binary = P.toBase(P.parseBase(s.value || "0", s.from || 10), 2); } catch (e) { binary = "enter a valid numeral"; }
    var valid = /^[01]+$/.test(binary), hidden = s.challenge && !s.revealing && s.result == null, size = s.to === 8 ? 3 : s.to === 16 ? 4 : 0;
    if (valid && s.from === 2 && size && binary.length <= 16) {
      // Grouping: the given bits stay visible; each group's digit appears from the right.
      var groups = Math.ceil(binary.length / size), done = hidden ? 0 : s.revealing ? Math.ceil(groups * s.progress) : groups;
      drawGroups(ctx, binary, size, s.to, w / 2, 90, c, done, s.revealing ? done - 1 : -1);
    } else if (valid && s.from === 2 && s.to === 10 && binary.length <= 16) {
      // Place values: the given bits stay visible; each 1 adds its power of two.
      drawBits(ctx, binary, w / 2, 95, c, s.revealing ? binary.length - Math.ceil(binary.length * s.progress) : -1);
      var terms = binary.split("").map(function (bit, i) { return bit === "1" ? Math.pow(2, binary.length - 1 - i) : 0; }).filter(Boolean),
        seen = hidden ? 0 : s.revealing ? Math.ceil(terms.length * s.progress) : terms.length;
      if (seen) text(ctx, terms.slice(terms.length - seen).join(" + "), w / 2, 153, c, Math.min(14, (w - 24) / (terms.length * 4)));
    } else {
      // Repeated division finds the lowest bit first, so bits fill in from the right.
      var count = hidden ? 0 : s.revealing ? Math.ceil(binary.length * s.progress) : binary.length,
        shown = valid ? binary.split("").map(function (bit, i) { return i >= binary.length - count ? bit : "?"; }).join("") : binary;
      drawBits(ctx, shown, w / 2, 95, c, s.revealing ? binary.length - count : -1);
      arrow(ctx, w * .72, 153, w * .28, 153, c, s.revealing && s.progress > .35);
    }
    if (s.result != null) text(ctx, "Base " + s.to + " = " + s.result, w / 2, h - 68, c, 16);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 45, c, 12);
  }

  // The sum that turns the pattern into its value, in the encoding's own terms.
  function decodeStep(s) {
    var bits = String(s.bits), n = bits.length, u;
    try { u = P.parseBits(bits); } catch (e) { return ""; }
    if (s.encoding === "excess") return u + " − " + s.bias;
    if (s.encoding === "unsigned" || bits[0] === "0") return "place values: " + u;
    if (s.encoding === "twos-complement") return u + " − " + Math.pow(2, n);
    if (s.encoding === "sign-magnitude") return "sign 1, magnitude " + bits.slice(1);
    return "sign 1, inverted " + P.toBase(Math.pow(2, n) - 1 - u, 2).padStart(n, "0");
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
      drawBits(ctx, s.bits || "1111", w / 2, 68, c, s.revealing ? Math.min(String(s.bits).length - 1, Math.floor(s.progress * String(s.bits).length)) : -1);
      text(ctx, (s.encoding || "unsigned") + (s.encoding === "excess" ? " with B=" + s.bias : ""), w / 2, 127, c, 13);
      if (s.result != null || s.revealing && s.progress > .5) text(ctx, decodeStep(s), w / 2, 155, c, 14, "center", c.fau);
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

  function digits(values) { return values.slice().reverse().map(function (v) { return v ? "1" : " "; }).join(""); }

  // Column layout for add, subtract and multiply. Returns false when the inputs have no such layout.
  function unsignedRows(ctx, w, h, c, s) {
    var left = String(s.left), right = String(s.right), rows, width;
    if (!/^[01]+$/.test(left) || !/^[01]+$/.test(right)) return false;
    try {
      if (s.operation === "add") {
        var add = P.columnAdd(left, right); width = add.sum.length;
        rows = [{ label: "carry", digits: digits(add.carries), reveal: true, small: true, colour: c.course }, { digits: add.a }, { label: "+", digits: add.b, rule: true }, { digits: add.sum.replace(/^0/, " "), reveal: true }];
      } else if (s.operation === "subtract") {
        var sub = P.columnSubtract(left, right); width = sub.diff.length;
        rows = [{ label: "borrow", digits: digits(sub.borrowed), reveal: true, small: true, colour: c.course }, { digits: sub.a }, { label: "−", digits: sub.b, rule: true }, { digits: sub.diff, reveal: true }];
      } else if (s.operation === "multiply") {
        var parts = P.partialProducts(left, right), product = P.unsignedArithmetic(left, right, "multiply").bits; width = product.length;
        rows = [{ digits: left }, { label: "×", digits: right, rule: true }].concat(parts.map(function (p, i) { return { digits: p, reveal: true, rule: i === parts.length - 1, colour: c.muted }; }), [{ digits: product, reveal: true }]);
      } else return false;
    } catch (e) { return false; }
    var shown = columnsShown(s, width);
    drawColumns(ctx, w, h, c, rows, shown, s.revealing ? shown - 1 : -1);
    return true;
  }

  function drawUnsigned(ctx, w, h, c, s) {
    text(ctx, "Unsigned binary arithmetic", w / 2, 25, c, 15);
    var drawn = unsignedRows(ctx, w, h, c, s);
    if (!drawn) {
      text(ctx, String(s.left || "—"), w * .22, 74, c, 15);
      text(ctx, s.operation === "subtract" ? "−" : s.operation === "multiply" ? "×" : s.operation === "divide" ? "÷" : "+", w / 2, 74, c, 19, "center", c.course);
      text(ctx, String(s.right || "—"), w * .78, 74, c, 15);
      arrow(ctx, w * .25, 111, w * .75, 111, c, s.revealing);
      if (s.operation === "divide" && (s.result != null || s.revealing && s.progress > .5)) {
        try {
          var a = P.parseBits(s.left), b = P.parseBits(s.right), d = P.unsignedArithmetic(s.left, s.right, "divide");
          text(ctx, a + " = " + d.quotient + " × " + b + " + " + d.remainder, w / 2, 140, c, 15, "center", c.fau);
        } catch (e) {}
      }
    }
    if (s.result != null) {
      if (s.operation === "divide") {
        text(ctx, "quotient " + s.quotientBits + " · remainder " + s.remainderBits, w / 2, h - 65, c, 13);
      } else text(ctx, "Result: " + s.resultBits + "₂", w / 2, h - 65, c, 16);
    }
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 43, c, 12);
  }

  function drawSigned(ctx, w, h, c, s) {
    text(ctx, "Two’s-complement fixed-width check", w / 2, 25, c, 14);
    var left = String(s.left || ""), right = String(s.right || ""), ok = /^[01]+$/.test(left) && left.length === right.length && /^[01]+$/.test(right);
    if (ok) {
      var working = s.revealing || s.result != null, negated = s.operation === "subtract" && working,
        addend = negated ? P.negatePattern(right) : right, add = P.columnAdd(left, addend), n = left.length,
        shown = columnsShown(s, n + 1);
      drawColumns(ctx, w, h, c, [
        { label: "carry", digits: digits(add.carries), reveal: true, small: true, colour: c.course },
        { digits: left },
        { label: negated ? "+ −B" : s.operation === "subtract" ? "−" : "+", digits: addend, rule: true },
        { digits: add.sum[0] === "1" ? add.sum : " " + add.sum.slice(1), reveal: true },
      ], shown, s.revealing ? shown - 1 : -1);
    } else text(ctx, left + (s.operation === "subtract" ? " − " : " + ") + right, w / 2, 90, c, 14);
    if (s.result != null) {
      text(ctx, "exact " + minus(s.exact) + "; stored as " + minus(s.decoded), w / 2, h - 86, c, 12);
      text(ctx, "Carry out: " + (s.carryOut ? "1" : "0") + " · " + (s.overflow ? "Overflow: yes" : "Overflow: no"), w / 2, h - 64, c, 14, "center", s.overflow ? c.fau : c.ink);
    }
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 42, c, 12);
  }

  function minus(value) { return String(value).replace("-", "−"); }

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

  function pairs(labels) { return labels.map(function (x) { return [x, x]; }); }

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
    function challenge(id, short, prompt, value, from, to, options, answer, why) {
      return standard(function () { set(value, from, to); state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { state.result = P.convert(value, from, to).result; }); },
        why, id, short, "3.1", prompt,
        pairs(options), answer);
    }
    Lab.experiment({ id: "bases", title: "3.1 Number bases", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.revealing = false; state.guess = ""; readForm(); show(); },
      // Endless practice (tests/lab-generators.test.js checks one correct option, every time)
      generate: function () {
        var v = 20 + rnd(100), bin = v.toString(2), rev = bin.split("").reverse().join(""), flip = bin.slice(0, -2) + (bin.slice(-2, -1) === "1" ? "0" : "1") + bin.slice(-1);
        return challenge("gen-bases", "decimal to binary", "Convert decimal " + v + " to binary.", String(v), 10, 2, three(bin, [rev, flip], [(v + 1).toString(2), (v - 1).toString(2)]), bin,
          "Repeated division by 2 gives the bits from the right; reading the remainders from last to first gives " + bin + "₂. Check with place values: " + bin.split("").map(function (b, i) { return b === "1" ? Math.pow(2, bin.length - 1 - i) : null; }).filter(function (x) { return x !== null; }).join(" + ") + " = " + v + ".");
      },
      challenges: [
        challenge("decimal-binary", "decimal to binary", "Convert decimal 46 to binary.", "46", 10, 2, ["011101", "101110", "101100"], "101110", "Repeated division by 2 gives the remainders 0, 1, 1, 1, 0, 1, and you read them from last to first: 101110₂. Reading them in the order found gives 011101, the common slip. Check: 32+8+4+2=46."),
        challenge("binary-decimal", "binary place values", "What decimal value does 1100010₂ represent?", "1100010", 2, 10, ["98", "35", "196"], "98", "The 1 bits mark 2⁶, 2⁵, and 2¹. Their place values add to 64+32+2=98."),
        challenge("binary-octal", "three-bit octal groups", "Group 101101₂ in threes and write the octal value.", "101101", 2, 8, ["45", "55", "2D"], "55", "From the right, the groups are 101 and 101. Each group is 5, so the octal numeral is 55₈."),
        challenge("binary-hex", "four-bit hexadecimal groups", "Group 11001010₂ in fours and write the hexadecimal value.", "11001010", 2, 16, ["202", "AC", "CA"], "CA", "The groups are 1100 and 1010. They have values C and A in hexadecimal, giving CA₁₆."),
      ] });
  }

  function experimentEncodings() {
    var section = document.querySelector('[data-experiment="encodings"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "encodings", task: "decode", bits: "1111", encoding: "twos-complement", bias: 8 };
    function show() { queue(canvas, state); }
    function calculate(task, bits, encoding, bias) { return task === "bcd" ? P.encodeBcd(Number(bits)) : minus(P.decodeInteger(bits, encoding, bias)); }
    function readForm() { state.task = form.querySelector("[data-task]").value; state.bits = form.querySelector("[data-value]").value; state.encoding = form.querySelector("[data-encoding]").value; state.bias = Number(form.querySelector("[data-bias]").value); }
    form.querySelector('[data-act="decode"]').addEventListener("click", function () { readForm(); try { state.result = calculate(state.task, state.bits, state.encoding, state.bias); form.querySelector('[data-out="result"]').textContent = state.result; } catch (e) { state.result = null; form.querySelector('[data-out="result"]').textContent = "check the pattern or bias"; } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { form.querySelector("[data-task]").value = "decode"; form.querySelector("[data-value]").value = "1111"; form.querySelector("[data-encoding]").value = "twos-complement"; form.querySelector("[data-bias]").value = "8"; readForm(); state.result = null; form.querySelector('[data-out="result"]').textContent = "—"; show(); });
    form.querySelector("[data-task]").addEventListener("change", function (event) { form.querySelector('[data-value]').value = event.target.value === "bcd" ? "59" : "1111"; });
    function challenge(id, short, prompt, task, bits, encoding, bias, options, answer, why) {
      return standard(function () { state.task = task; state.bits = bits; state.encoding = encoding; state.bias = bias; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { state.result = calculate(task, bits, encoding, bias); }); },
        why, id, short, "3.2", prompt, pairs(options), answer);
    }
    Lab.experiment({ id: "encodings", title: "3.2 Integer representations", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.revealing = false; state.result = null; state.guess = ""; readForm(); show(); },
      // Endless practice (tests/lab-generators.test.js checks one correct option, every time)
      generate: function () {
        var u = 9 + rnd(7), bits = u.toString(2), val = u - 16, sm = -(u - 8), lab = function (x) { return String(x).replace("-", "−"); };
        return challenge("gen-encodings", "four-bit two’s complement", "Decode " + bits + " as a four-bit two’s-complement value.", "decode", bits, "twos-complement", 8, three(lab(val), [String(u), lab(sm)], [lab(val + 1)]), lab(val),
          "The top bit weighs −8 in two’s complement: " + bits + " = −8 + " + (u - 8) + " = " + lab(val) + ". Read as unsigned it would be " + u + ", and as sign and magnitude " + lab(sm) + ".");
      },
      challenges: [
        challenge("unsigned-pattern", "excess-8 pattern", "Decode 0111 as a four-bit excess-8 value.", "decode", "0111", "excess", 8, ["7", "1", "−1"], "−1", "In excess-B, the value is the stored number minus B. Here 7−8=−1, so a leading 0 does not mean positive. Slide 24 prints 1 here, which is a slip."),
        challenge("sign-magnitude", "sign and magnitude", "Decode 1101 using four-bit sign-and-magnitude.", "decode", "1101", "sign-magnitude", 8, ["−3", "−5", "13"], "−5", "The first bit is the negative sign. The remaining bits 101 are magnitude 5, so the value is −5."),
        challenge("twos-pattern", "two’s-complement pattern", "Decode 1011 using four-bit two’s complement.", "decode", "1011", "twos-complement", 8, ["11", "−3", "−4", "−5"], "−5", "The unsigned value is 11. Since the sign bit is 1, subtract 2⁴: 11−16=−5. The other readings come from other encodings: −3 is sign and magnitude, and −4 is one’s complement."),
        challenge("bcd-digits", "BCD digit groups", "Write decimal 59 in four-bit BCD.", "bcd", "59", "unsigned", 8, ["0101 1001", "0011 1011", "1001 0101"], "0101 1001", "Encode each decimal digit separately: 5 is 0101 and 9 is 1001. BCD uses two groups; it is not the ordinary binary encoding of 59."),
      ] });
  }

  function experimentCharacters() {
    var section = document.querySelector('[data-experiment="characters"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "characters", hex: "46 72 65 64" };
    function show() { queue(canvas, state); }
    function decode(hex) { return P.decodeAsciiHex(hex); }
    form.querySelector('[data-act="decode"]').addEventListener("click", function () { state.hex = form.querySelector("[data-hex]").value; try { state.result = decode(state.hex); form.querySelector('[data-out="result"]').textContent = state.result; } catch (e) { state.result = null; form.querySelector('[data-out="result"]').textContent = "use two-digit ASCII-range hex bytes"; } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { state.hex = "46 72 65 64"; state.result = null; state.guess = ""; form.querySelector("[data-hex]").value = state.hex; form.querySelector('[data-out="result"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, hex, options, answer, why) {
      return standard(function () { state.hex = hex; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { state.result = decode(hex); }); },
        why, id, short, "3.3", prompt, pairs(options), answer);
    }
    Lab.experiment({ id: "characters", title: "3.3 Character data", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.revealing = false; state.result = null; state.guess = ""; state.hex = form.querySelector("[data-hex]").value; show(); },
      // Endless practice (tests/lab-generators.test.js checks one correct option, every time)
      generate: function () {
        var c = 65 + rnd(26), ch = String.fromCharCode(c), hex = c.toString(16).toUpperCase();
        return challenge("gen-characters", "ASCII letter", "Which character has the ASCII code " + hex + " (hexadecimal)?", hex, three(ch, [String.fromCharCode(c === 90 ? 89 : c + 1), String.fromCharCode(c + 32)]), ch,
          hex + "₁₆ = " + c + ", and ASCII " + c + " is " + ch + ". Capital letters run from 41₁₆ (A, 65) to 5A₁₆ (Z, 90); lower case starts 32 higher.");
      },
      challenges: [
        challenge("ascii-f", "ASCII hexadecimal code", "The hexadecimal ASCII byte 46 represents which character?", "46", [".", "F", "f"], "F", "Hex 46 is decimal 70. In the ASCII mapping, code 70 represents the uppercase letter F. Reading 46 as decimal would give the full stop."),
        challenge("ascii-d", "read the final byte", "The final byte in the lecture’s word example is 64₁₆. Which ASCII character is it?", "64", ["D", "@", "d"], "d", "Hex 64 is decimal 100, the lowercase ASCII letter d. Character codes identify symbols through a named encoding."),
        challenge("ascii-word", "decode the lecture example", "Decode the ASCII bytes 46 72 65 64 as text.", "46 72 65 64", ["Fred", "FRED", "fred"], "Fred", "The hexadecimal values map to F, r, e, and d. Read in order, they spell Fred."),
        challenge("ascii-unicode", "ASCII and Unicode range", "Which character is named by both ASCII code 41₁₆ and Unicode code point U+0041?", "41", ["a", "A", ")"], "A", "Both values identify the character A: the first 128 Unicode code points correspond to ASCII. A byte sequence still needs its encoding named before it can be decoded."),
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
    form.querySelector('[data-act="calculate"]').addEventListener("click", function () { readForm(); try { var r = calculate(state.left, state.right, state.operation); state.result = r.label; state.resultBits = r.source.bits; state.quotientBits = r.source.quotientBits; state.remainderBits = r.source.remainderBits; form.querySelector('[data-out="result"]').textContent = r.label; } catch (e) { state.result = null; form.querySelector('[data-out="result"]').textContent = "check binary digits and divisor"; } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { form.querySelector("[data-left]").value = "111011"; form.querySelector("[data-right]").value = "101010"; form.querySelector("[data-operation]").value = "add"; state = Object.assign(state, { left: "111011", right: "101010", operation: "add", result: null, guess: "" }); form.querySelector('[data-out="result"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, left, right, operation, options, answer, why) {
      return standard(function () { state.left = left; state.right = right; state.operation = operation; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice; show(); },
        function () { return animate(state, show, function () { var r = calculate(left, right, operation); state.result = r.label; state.resultBits = r.source.bits; state.quotientBits = r.source.quotientBits; state.remainderBits = r.source.remainderBits; }); },
        why, id, short, "3.4", prompt, pairs(options), answer);
    }
    Lab.experiment({ id: "unsigned", title: "3.4 Unsigned arithmetic", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.revealing = false; state.result = null; state.guess = ""; readForm(); show(); },
      // Endless practice (tests/lab-generators.test.js checks one correct option, every time)
      generate: function () {
        var x = 8 + rnd(24), y = 8 + rnd(24), a = x.toString(2), b = y.toString(2), sum = (x + y).toString(2), xor = (x ^ y).toString(2);
        return challenge("gen-unsigned", "binary addition", "Add " + a + "₂ and " + b + "₂.", a, b, "add", three(sum, [xor, (x + y + 1).toString(2)], [(x + y - 1).toString(2)]), sum,
          a + "₂ = " + x + " and " + b + "₂ = " + y + ", so the sum is " + (x + y) + " = " + sum + "₂. Forgetting the carries gives " + xor + "₂ instead.");
      },
      challenges: [
        challenge("binary-add", "add with carries", "Add 111011₂ and 101010₂. Write the result in binary.", "111011", "101010", "add", ["100101", "1100101", "10001"], "1100101", "The operands are 59 and 42 in decimal, which sum to 101. That is 1100101₂; the leftmost carry becomes an additional result bit."),
        challenge("binary-multiply", "multiply partial products", "Multiply 101₂ by 11₂. Write the result in binary.", "101", "11", "multiply", ["1010", "1000", "1111"], "1111", "101₂ is 5 and 11₂ is 3, so the product is 15. Fifteen is 1111₂."),
        challenge("binary-divide", "quotient and remainder", "Divide 11101₂ by 101₂. Give the binary quotient and remainder.", "11101", "101", "divide", ["q=100; r=1001", "q=101; r=100", "q=101; r=11"], "q=101; r=100", "The dividend is 29 and the divisor is 5. The quotient is 5 and the remainder is 4, so in binary q=101 and r=100; the remainder is less than the divisor."),
        challenge("binary-subtract", "subtract by borrowing", "Subtract 01101₂ from 11010₂. Write the result in binary.", "11010", "01101", "subtract", ["1101", "10111", "11101"], "1101", "The values are 26−13=13. Thirteen is 1101₂; column borrowing gives the same result."),
      ] });
  }

  var YES_FIRST = [["yes", "Yes · overflow"], ["no", "No · fits the range"]], NO_FIRST = [YES_FIRST[1], YES_FIRST[0]];

  function experimentSigned() {
    var section = document.querySelector('[data-experiment="signed"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "signed", left: "0101", right: "0011", operation: "add" };
    function show() { queue(canvas, state); }
    function readForm() { state.width = Number(form.querySelector("[data-width]").value); state.left = form.querySelector("[data-left]").value.trim(); state.right = form.querySelector("[data-right]").value.trim(); state.operation = form.querySelector("[data-operation]").value; }
    function calculate(left, right, operation) { return P.twosArithmetic(left, right, operation); }
    form.querySelector('[data-act="calculate"]').addEventListener("click", function () { readForm(); function out(name, value) { form.querySelector('[data-out="' + name + '"]').textContent = value; } try { if (state.left.length !== state.width || state.right.length !== state.width) throw new RangeError("wrong width"); var r = calculate(state.left, state.right, state.operation); Object.assign(state, r); state.result = r; out("pattern", r.pattern); out("result", minus(r.decoded)); out("carry", r.carryOut ? "1" : "0"); out("overflow", r.overflow ? "yes" : "no"); } catch (e) { state.result = null; out("pattern", "enter exactly " + state.width + " bits"); out("result", "—"); out("carry", "—"); out("overflow", "—"); } show(); });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { form.querySelector("[data-width]").value = "4"; form.querySelector("[data-left]").value = "0101"; form.querySelector("[data-right]").value = "0011"; form.querySelector("[data-operation]").value = "add"; Object.assign(state, { left: "0101", right: "0011", operation: "add", result: null, guess: "" }); form.querySelector('[data-out="pattern"]').textContent = "—"; form.querySelector('[data-out="result"]').textContent = "—"; form.querySelector('[data-out="carry"]').textContent = "—"; form.querySelector('[data-out="overflow"]').textContent = "—"; show(); });
    function challenge(id, short, prompt, left, right, operation, options, answer, why) {
      return standard(function () { state.left = left; state.right = right; state.operation = operation; state.result = null; state.guess = ""; show(); },
        function (choice) { state.guess = choice === "yes" ? "Overflow" : "No overflow"; show(); },
        function () { return animate(state, show, function () { var r = calculate(left, right, operation); Object.assign(state, r); state.result = r; }); },
        why, id, short, "3.5", prompt, options, answer);
    }
    Lab.experiment({ id: "signed", title: "3.5 Two’s-complement arithmetic", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (c) { state.challenge = true; state.progress = 0; state.revealing = false; state.result = null; c.stage(); },
      sandbox: function () { state.challenge = false; state.revealing = false; state.result = null; state.guess = ""; readForm(); show(); },
      // Endless practice: does a random four-bit two’s-complement addition overflow?
      generate: function () {
        var a = rnd(16), b = rnd(16), sv = function (u) { return u >= 8 ? u - 16 : u; }, exact = sv(a) + sv(b), over = exact < -8 || exact > 7,
          pa = a.toString(2).padStart(4, "0"), pb = b.toString(2).padStart(4, "0"), lab = function (x) { return String(x).replace("-", "−"); };
        return challenge("gen-signed", "four-bit addition", "In four-bit two’s complement, add " + pa + " and " + pb + ". Does it overflow?", pa, pb, "add", rnd(2) ? YES_FIRST : NO_FIRST, over ? "yes" : "no",
          pa + " is " + lab(sv(a)) + " and " + pb + " is " + lab(sv(b)) + ", so the exact sum is " + lab(exact) + (over ? ", outside the range −8 … 7: overflow." : ", inside the range −8 … 7: no overflow, whatever the carry out."));
      },
      challenges: [
        challenge("positive-overflow", "positive sum outside range", "In four-bit two’s complement, add 0101 and 0011. Does it overflow?", "0101", "0011", "add", YES_FIRST, "yes", "The exact sum is +8, outside the four-bit range −8 to +7. The stored pattern is 1000, so two positive operands produced a negative-sign pattern."),
        challenge("negative-overflow", "negative sum outside range", "In four-bit two’s complement, add 1001 and 1010. Does it overflow?", "1001", "1010", "add", NO_FIRST, "yes", "The patterns represent −7 and −6, whose exact sum is −13. The four-bit result wraps to 0011, which decodes as +3, so signed overflow occurred."),
        challenge("mixed-sign", "carry out without overflow", "In four-bit two’s complement, add 1110 and 1011. A carry comes out of the top column. Does it overflow?", "1110", "1011", "add", NO_FIRST, "no", "The operands are −2 and −5, so the exact result is −7, inside −8 to +7. The stored pattern 1001 decodes as −7. The carry out is discarded, and it does not signal signed overflow."),
        challenge("lower-bound", "negating the lowest value", "In four-bit two’s complement, negate 1000 by calculating 0000−1000. Does it overflow?", "0000", "1000", "subtract", YES_FIRST, "yes", "The exact result is +8, one above +7. Inverting 1000 and adding 1 gives 1000 again, so the stored value is still −8. No carry comes out, so a carry test would miss this overflow."),
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
