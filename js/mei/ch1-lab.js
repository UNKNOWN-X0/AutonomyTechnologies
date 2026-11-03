/* MEI Chapter 1 experiments: logic, quantifiers and set membership. */
(function () {
  var P = window.MEI1, ns = "http://www.w3.org/2000/svg";
  var X = [1, 2, 3, 4], SA = [1, 2], SB = [2, 3];
  var bits = [[true, true], [true, false], [false, true], [false, false]];
  var O = P.operators;
  function stage(id) { return document.querySelector("[data-visual='" + id + "']"); }
  function tok(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
  function bit(v) { return v ? "1" : "0"; }
  function set(xs) { return xs.length ? "{" + xs.join(",") + "}" : "∅"; }
  function label(el, words, x, y, size, color, weight, anchor) {
    var t = document.createElementNS(ns, "text");
    t.setAttribute("x", x); t.setAttribute("y", y); t.setAttribute("fill", color || tok("--ink")); t.setAttribute("font-size", size);
    t.setAttribute("font-family", "var(--f-display)"); if (weight) t.setAttribute("font-weight", weight); if (anchor) t.setAttribute("text-anchor", anchor);
    t.textContent = words; el.appendChild(t); return t;
  }
  function wrap(line, max) {
    var out = [], now = "";
    line.split(" ").forEach(function (w) {
      if (now && (now + " " + w).length > max) { out.push(now); now = w; } else now = now ? now + " " + w : w;
    });
    return out.concat([now]);
  }
  // Short stage lines, wrapped to the 480-wide view box. A line starting with "=" is the result.
  function text(el, lines) {
    el.innerHTML = "";
    var y = 44;
    lines.forEach(function (line) {
      var result = line.charAt(0) === "=", body = result ? line.slice(1) : line;
      wrap(body, 44).forEach(function (part) { label(el, part, 24, y, 18, result ? tok("--act") : tok("--ink"), result ? "700" : null); y += 30; });
      y += 8;
    });
  }
  function guessLine(el, guess) { if (guess) label(el, "You said: " + guess, 24, 308, 14, tok("--muted")); }
  // The only shaded regions are the elements of `members`, which sit one in each region of the diagram.
  function venn(el, members, focus) {
    var paper = tok("--paper"), ink = tok("--ink"), course = tok("--course");
    var circA = 'cx="195" cy="138" r="68"', circB = 'cx="285" cy="138" r="68"', box = 'x="20" y="20" width="440" height="224"';
    var fill = ' fill="' + course + '" fill-opacity=".42"', html = "<defs>";
    html += '<clipPath id="mei-a"><circle ' + circA + '/></clipPath>';
    html += '<mask id="mei-na"><rect ' + box + ' fill="white"/><circle ' + circA + ' fill="black"/></mask>';
    html += '<mask id="mei-nb"><rect ' + box + ' fill="white"/><circle ' + circB + ' fill="black"/></mask></defs>';
    html += "<rect " + box + ' fill="' + paper + '" stroke="' + ink + '" stroke-width="2"/>';
    if (members.indexOf(1) >= 0) html += "<circle " + circA + fill + ' mask="url(#mei-nb)"/>';
    if (members.indexOf(2) >= 0) html += "<circle " + circB + fill + ' clip-path="url(#mei-a)"/>';
    if (members.indexOf(3) >= 0) html += "<circle " + circB + fill + ' mask="url(#mei-na)"/>';
    if (members.indexOf(4) >= 0) html += '<g mask="url(#mei-na)"><rect ' + box + fill + ' mask="url(#mei-nb)"/></g>';
    html += "<circle " + circA + ' fill="none" stroke="' + ink + '" stroke-width="2"/><circle ' + circB + ' fill="none" stroke="' + ink + '" stroke-width="2"/>';
    el.innerHTML = html;
    label(el, "A", 165, 78, 18); label(el, "B", 305, 78, 18); label(el, "X = {1,2,3,4}", 38, 232, 14);
    var at = { 1: [155, 142], 2: [238, 142], 3: [322, 142], 4: [56, 64] };
    X.forEach(function (x) { label(el, String(x), at[x][0], at[x][1], 18, ink, x === focus ? "800" : null); });
    if (focus) {
      var ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", at[focus][0] + 5); ring.setAttribute("cy", at[focus][1] - 6); ring.setAttribute("r", "17");
      ring.setAttribute("fill", "none"); ring.setAttribute("stroke", tok("--fau-mark")); ring.setAttribute("stroke-width", "2.5"); el.appendChild(ring);
    }
    el.setAttribute("aria-label", "Venn diagram of A and B in X with shaded elements " + set(members));
  }
  function setCaption(el, words) { label(el, words, 96, 46, 18, tok("--act"), "700"); }
  // A table over every A, B row. `shown` is "none", "row" (the selected row) or "all"; hidden outputs read "?".
  function truthTable(el, o) {
    el.innerHTML = "";
    var ink = tok("--ink"), mark = tok("--course"), xs = [48, 104], gap = 300 / o.cols.length;
    o.cols.forEach(function (c, i) { xs.push(170 + i * gap); });
    ["A", "B"].concat(o.cols.map(function (c) { return c.head; })).forEach(function (head, i) { label(el, head, xs[i], 43, 16, ink, "700"); });
    bits.forEach(function (r, i) {
      var y = 75 + i * 38, current = !!o.selected && r[0] === o.selected[0] && r[1] === o.selected[1];
      var open = o.shown === "all" || (o.shown === "row" && current);
      var row = document.createElementNS(ns, "g"), bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "24"); bg.setAttribute("y", String(y - 25)); bg.setAttribute("width", "430"); bg.setAttribute("height", "36");
      bg.setAttribute("fill", mark); bg.setAttribute("fill-opacity", current ? ".22" : "0"); row.appendChild(bg);
      row.setAttribute("tabindex", "0"); row.setAttribute("role", "button"); row.setAttribute("aria-label", "Highlight truth-table row " + (i + 1));
      [bit(r[0]), bit(r[1])].concat(o.cols.map(function (c) { return open ? bit(c.f(r[0], r[1])) : "?"; })).forEach(function (v, j) { label(row, v, xs[j], y, 18, ink); });
      function highlight() { bg.setAttribute("fill-opacity", ".22"); }
      function clear() { bg.setAttribute("fill-opacity", current ? ".22" : "0"); }
      row.addEventListener("pointerenter", highlight); row.addEventListener("pointerleave", clear); row.addEventListener("focus", highlight); row.addEventListener("blur", clear);
      el.appendChild(row);
    });
    if (o.caption) wrap(o.caption, 56).forEach(function (part, i) { label(el, part, 24, 224 + i * 19, 14, tok("--act"), "700"); });
    el.setAttribute("aria-label", "Truth table of " + o.cols.map(function (c) { return c.head; }).join(" and "));
  }
  // Rows of domain values. `upto` marks that many values, row by row, with a tick or a cross under each.
  function domainRows(el, lines, rows, upto, resultLines, resultY) {
    el.innerHTML = "";
    lines.forEach(function (line, i) { label(el, line, 24, 30 + i * 22, 16, tok("--ink"), i ? null : "700"); });
    var base = 30 + lines.length * 22, seen = 0, course = tok("--course"), ink = tok("--ink");
    rows.forEach(function (row, r) {
      var top = base + r * 88;
      if (row.label) label(el, row.label, 24, top + 6, 14, tok("--muted"));
      row.xs.forEach(function (x, i) {
        var cx = 48 + i * 64, cy = top + 36, ok = seen < upto ? row.test(x) : null, dot = document.createElementNS(ns, "circle");
        dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.setAttribute("r", "19"); dot.setAttribute("stroke", ink); dot.setAttribute("stroke-width", "2");
        dot.setAttribute("fill", ok ? course : "none"); dot.setAttribute("fill-opacity", ".42"); el.appendChild(dot);
        label(el, String(x), cx, cy + 6, 16, ink, null, "middle");
        if (ok !== null) label(el, ok ? "✓" : "✗", cx + 30, cy + 6, 16, ink, "700", "middle");
        seen++;
      });
    });
    (resultLines || []).forEach(function (line, i) { label(el, line, 24, (resultY || 268) + i * 22, 16, tok("--act"), "700"); });
  }
  function count(rows) { return rows.reduce(function (n, r) { return n + r.xs.length; }, 0); }
  // Each maker returns render(el, t): t=0 draws only the givens, t=1 the finished mechanism.
  function logicStage(row, cols, result) {
    return function (el, t) {
      truthTable(el, { selected: row, cols: cols, shown: t <= 0 ? "none" : t < 0.5 ? "row" : "all", caption: t < 0.5 ? null : result });
    };
  }
  function domainStage(lines, rows, result) {
    return function (el, t) {
      var n = count(rows);
      domainRows(el, lines, rows, Math.round(t * n), t >= 1 ? result : null);
    };
  }
  function setStage(test, caption) {
    return function (el, t) {
      var upto = Math.min(X.length, Math.floor(t * X.length)), hit = X.slice(0, upto).filter(test);
      venn(el, hit, t > 0 && upto < X.length ? X[upto] : null);
      if (t >= 1) setCaption(el, caption);
    };
  }
  function stepStage(givens, steps) {
    return function (el, t) {
      var n = t <= 0 ? 0 : Math.max(1, Math.ceil(t * steps.length));
      text(el, givens.concat(steps.slice(0, n)));
    };
  }
  function shape(el, tag, attrs) {
    var n = document.createElementNS(ns, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    el.appendChild(n); return n;
  }
  // Three sensors feed the pair terms, which feed V. `s` holds each reading, or null for unknown; `shown` fills terms and V.
  function voteDiagram(el, s, shown, caption) {
    el.innerHTML = "";
    var ink = tok("--ink"), course = tok("--course"), paper = tok("--paper"), ys = [60, 140, 220];
    var terms = [["A ∧ B", 0, 1, 70], ["A ∧ C", 0, 2, 140], ["B ∧ C", 1, 2, 210]];
    function out(v) { return v === null ? "?" : bit(v); }
    function fill(v) { return v ? course : paper; }
    terms.forEach(function (t) {
      [t[1], t[2]].forEach(function (i) { shape(el, "line", { x1: 92, y1: ys[i], x2: 200, y2: t[3], stroke: ink, "stroke-width": 1.5 }); });
      shape(el, "line", { x1: 310, y1: t[3], x2: 388, y2: 140, stroke: ink, "stroke-width": 1.5 });
    });
    ["A", "B", "C"].forEach(function (name, i) {
      shape(el, "circle", { cx: 70, cy: ys[i], r: 22, fill: fill(s[i]), "fill-opacity": ".42", stroke: ink, "stroke-width": 2 });
      label(el, name, 24, ys[i] + 6, 16, ink, "700");
      label(el, out(s[i]), 70, ys[i] + 6, 18, ink, "700", "middle");
    });
    var known = s.every(function (v) { return v !== null; }), v = known ? P.vote(s[0], s[1], s[2]) : null;
    terms.forEach(function (t) {
      var tv = shown && known ? !!(s[t[1]] && s[t[2]]) : null;
      shape(el, "rect", { x: 200, y: t[3] - 20, width: 110, height: 40, rx: 6, fill: fill(tv), "fill-opacity": ".42", stroke: ink, "stroke-width": 2 });
      label(el, t[0] + " = " + out(tv), 255, t[3] + 6, 15, ink, null, "middle");
    });
    shape(el, "circle", { cx: 410, cy: 140, r: 22, fill: fill(shown ? v : null), "fill-opacity": ".42", stroke: ink, "stroke-width": 2 });
    label(el, "V", 410, 106, 16, ink, "700", "middle");
    label(el, out(shown ? v : null), 410, 146, 18, ink, "700", "middle");
    if (caption) label(el, caption, 24, 276, 16, tok("--act"), "700");
    el.setAttribute("aria-label", "Majority vote of sensors A, B and C" + (shown && known ? ", V = " + bit(v) : ""));
  }
  // Number lines from −3 to 5. Each row is { label, parts }; a filled end is included, a hollow one is not.
  function px(v) { return 48 + (Math.max(-3.6, Math.min(5.6, v)) + 3) * 48; }
  function numberLine(el, y, row) {
    var ink = tok("--ink"), course = tok("--course"), paper = tok("--paper");
    label(el, row.label, 24, y - 24, 14, ink, "700");
    shape(el, "line", { x1: 20, y1: y, x2: 460, y2: y, stroke: ink, "stroke-width": 1.5 });
    for (var k = -3; k <= 5; k++) {
      shape(el, "line", { x1: px(k), y1: y - 5, x2: px(k), y2: y + 5, stroke: ink, "stroke-width": 1.5 });
      label(el, k < 0 ? "−" + -k : String(k), px(k), y + 22, 12, tok("--muted"), null, "middle");
    }
    row.parts.forEach(function (I) {
      shape(el, "line", { x1: px(I.lo), y1: y, x2: px(I.hi), y2: y, stroke: course, "stroke-width": 8, "stroke-opacity": ".7" });
      [[I.lo, I.loIn], [I.hi, I.hiIn]].forEach(function (end) {
        if (isFinite(end[0])) shape(el, "circle", { cx: px(end[0]), cy: y, r: 6, fill: end[1] ? ink : paper, stroke: ink, "stroke-width": 2 });
      });
    });
  }
  function lines(el, rows, caption) {
    el.innerHTML = "";
    rows.forEach(function (row, i) { numberLine(el, 60 + i * 80, row); });
    if (caption) label(el, caption, 24, 276, 16, tok("--act"), "700");
    el.setAttribute("aria-label", "Number lines: " + rows.map(function (r) { return r.label; }).join("; "));
  }
  function lineStage(givens, answer, caption) {
    return function (el, t) { lines(el, t > 0 ? givens.concat([answer]) : givens, t >= 1 ? caption : null); };
  }
  function drawSlider(root, el, values, selected, update) {
    var ink = getComputedStyle(document.body).getPropertyValue("--ink").trim();
    var course = getComputedStyle(document.body).getPropertyValue("--course").trim();
    var index = Math.max(0, values.indexOf(selected)), group = document.createElementNS(ns, "g");
    var line = document.createElementNS(ns, "line");
    line.setAttribute("x1", "48"); line.setAttribute("x2", "432"); line.setAttribute("y1", "260"); line.setAttribute("y2", "260");
    line.setAttribute("stroke", ink); line.setAttribute("stroke-width", "3"); group.appendChild(line);
    values.forEach(function (value, i) {
      var x = 48 + (values.length === 1 ? 0 : i * 384 / (values.length - 1));
      var label = document.createElementNS(ns, "text"); label.setAttribute("x", x); label.setAttribute("y", "289");
      label.setAttribute("text-anchor", "middle"); label.setAttribute("fill", ink); label.setAttribute("font-size", "12"); label.textContent = String(value); group.appendChild(label);
    });
    var knob = document.createElementNS(ns, "circle"), x = 48 + (values.length === 1 ? 0 : index * 384 / (values.length - 1));
    knob.setAttribute("cx", x); knob.setAttribute("cy", "260"); knob.setAttribute("r", "12"); knob.setAttribute("fill", course); knob.setAttribute("stroke", ink); knob.setAttribute("stroke-width", "2");
    knob.setAttribute("tabindex", "0"); knob.setAttribute("role", "slider"); knob.setAttribute("aria-label", "Stage marker; drag or use the arrow keys");
    knob.setAttribute("aria-valuemin", "1"); knob.setAttribute("aria-valuemax", String(values.length)); knob.setAttribute("aria-valuenow", String(index + 1)); knob.setAttribute("aria-valuetext", String(values[index]));
    knob.addEventListener("keydown", function (ev) {
      var delta = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!delta) return;
      ev.preventDefault(); var next = Math.max(0, Math.min(values.length - 1, index + delta * (ev.shiftKey ? 2 : 1)));
      if (next !== index) { update(values[next]); root.querySelector("[role='slider']").focus({ preventScroll: true }); }
    });
    group.appendChild(knob); el.appendChild(group);
    root._stageSlider = { values: values, index: index, update: update };
  }
  function bindStagePointer(root) {
    if (root.dataset.stagePointerBound) return;
    root.dataset.stagePointerBound = "true";
    var stageEl = root.querySelector(".stage"), drag = false, pointerId = null;
    function coords(ev) {
      var r = stageEl.getBoundingClientRect(), scale = Math.min(r.width / 480, r.height / 320);
      var ox = (r.width - 480 * scale) / 2, oy = (r.height - 320 * scale) / 2;
      return [(ev.clientX - r.left - ox) / scale, (ev.clientY - r.top - oy) / scale, scale];
    }
    function choose(ev) {
      var cfg = root._stageSlider, p = coords(ev);
      if (!cfg) return;
      var index = Math.round(Math.max(0, Math.min(1, (p[0] - 48) / 384)) * (cfg.values.length - 1));
      if (index !== cfg.index) cfg.update(cfg.values[index]);
    }
    stageEl.addEventListener("pointerdown", function (ev) {
      var cfg = root._stageSlider, p = coords(ev);
      if (!cfg || root.classList.contains("in-challenge")) return;
      var handleX = 48 + cfg.index * 384 / Math.max(1, cfg.values.length - 1);
      if (Math.hypot((p[0] - handleX) * p[2], (p[1] - 260) * p[2]) > 30) return;
      drag = true; pointerId = ev.pointerId; stageEl.classList.add("dragging");
      if (ev.isTrusted && stageEl.setPointerCapture) {
        try { stageEl.setPointerCapture(ev.pointerId); } catch (_) { /* Synthetic touch pointers have no browser-owned capture target. */ }
      }
      ev.preventDefault();
    });
    stageEl.addEventListener("pointermove", function (ev) { if (drag && ev.pointerId === pointerId) choose(ev); });
    function end(ev) {
      if (!drag || ev.pointerId !== pointerId) return;
      drag = false; pointerId = null; stageEl.classList.remove("dragging");
      if (stageEl.hasPointerCapture(ev.pointerId)) stageEl.releasePointerCapture(ev.pointerId);
    }
    stageEl.addEventListener("pointerup", end); stageEl.addEventListener("pointercancel", end);
  }
  function challenge(id, prompt, options, answer, ref, short, why, solve, render) {
    return { id: id, prompt: prompt, options: options, answer: answer, ref: ref, short: short, why: why, solve: solve, render: render };
  }
  var imp = { head: "A ⇒ B", f: O.implies }, con = { head: "B ⇒ A", f: function (a, b) { return O.implies(b, a); } };
  var or = { head: "A ∨ B", f: O.or }, xor = { head: "either-or", f: O.xor };
  var nand = { head: "¬(A ∧ B)", f: function (a, b) { return !O.and(a, b); } }, orn = { head: "¬A ∨ ¬B", f: function (a, b) { return O.or(!a, !b); } };
  var nab = { head: "¬A ∨ B", f: function (a, b) { return O.or(!a, b); } }, eqv = { head: "⇔", f: function (a, b) { return O.iff(O.implies(a, b), O.or(!a, b)); } };
  var contra ={ head: "¬B ⇒ ¬A", f: function (a, b) { return O.implies(!b, !a); } };
  function even(x) { return x % 2 === 0; }
  function square(x) { return x * x === 1; }
  var data = {
    logic: [
      challenge("tautology", "Is (A ⇒ B) ⇔ (¬A ∨ B) true for every choice of A and B?", [["tautology", "Yes, in all four rows"], ["fails", "No, it fails at A=1, B=0"], ["only-a", "Only in rows where A is true"]], "tautology", "1.1", "Tautology", "A tautology is true for every input. A ⇒ B and ¬A ∨ B match in all four rows, even at A=1, B=0 where both are 0, so their equivalence is always 1. This is how the notes rewrite ⇒ with ¬ and ∨.",
        function () { return P.truthTable(function (a, b) { return O.iff(O.implies(a, b), O.or(!a, b)); }).every(function (r) { return r.value; }) ? "tautology" : "fails"; },
        logicStage([true, false], [imp, nab, eqv], "Columns match, so ⇔ is 1 in every row: a tautology.")),
      challenge("inclusive-or", "For A=1 and B=1, what is the mathematical A ∨ B?", [["false", "False"], ["xor", "True only if exactly one holds"], ["true", "True"]], "true", "1.1", "Inclusive OR", "Inclusive OR needs at least one true input, so it stays true when both are true. The everyday either-or would give 0 here, but ∨ is not that operator.",
        function () { return String(O.or(true, true)); }, logicStage([true, true], [or, xor], "A ∨ B = 1 here; only either-or gives 0.")),
      challenge("converse", "For A=0 and B=1, compare A ⇒ B with its converse B ⇒ A.", [["different", "First true, converse false"], ["same", "Both true"], ["false", "Both false"]], "different", "1.1", "Converse", "Swapping an implication gives its converse, which need not share its truth value: here 1 against 0. The contrapositive ¬B ⇒ ¬A does stay equivalent, as the sandbox shows.",
        function () { return O.implies(false, true) !== O.implies(true, false) ? "different" : "same"; }, logicStage([false, true], [imp, con], "The columns differ in two rows.")),
      challenge("demorgan", "For A=0 and B=0, compare ¬(A ∧ B) with ¬A ∨ ¬B.", [["both-false", "Both false"], ["both-true", "Both true"], ["different", "Different values"]], "both-true", "1.1", "De Morgan", "De Morgan’s law negates each part and changes ∧ to ∨. Here both forms are 1, and the columns match in every row.",
        function () { var l = nand.f(false, false), r = orn.f(false, false); return l !== r ? "different" : l ? "both-true" : "both-false"; }, logicStage([false, false], [nand, orn], "Same output in all four rows.")),
    ],
    quantifiers: [
      challenge("forall-negation", "On D={1,2,3}, let P(x): x is even. What is the negation of ∀x P(x)?", [["all", "Every x is odd"], ["none", "No x is odd"], ["some", "At least one x is odd"]], "some", "1.1", "Negating ∀", "Negating ‘for every’ gives one counterexample: ∃x ¬P(x). Here x=1 is enough; it does not take every x failing.",
        function () { return P.quantifier([1, 2, 3], even, "forall") === false && P.quantifier([1, 2, 3], function (x) { return !even(x); }, "exists") ? "some" : "all"; },
        domainStage(["P(x): x is even", "D = {1, 2, 3}"], [{ xs: [1, 2, 3], test: even }], ["¬∀x P(x) ⇔ ∃x ¬P(x): x=1 and x=3 fail."])),
      challenge("unique-exists", "On D={1,2,3,4}, let P(x): x is even. Is ∃!x P(x) true?", [["yes", "True: an even x exists"], ["no", "False: two values are even"], ["domain", "Undecided until D is larger"]], "no", "1.1", "Unique existence", "∃! means exactly one. ∃x P(x) holds here, but both 2 and 4 pass, so ‘exactly one’ fails. Count the witnesses instead of stopping at the first.",
        function () { return [1, 2, 3, 4].filter(even).length === 1 ? "yes" : "no"; },
        domainStage(["P(x): x is even", "D = {1, 2, 3, 4}"], [{ xs: [1, 2, 3, 4], test: even }], ["Two witnesses, 2 and 4, so ∃!x P(x) is false."])),
      challenge("domain-matters", "Let P(x): x²=1. Compare ∀x∈{−1,1} P(x) with ∀x∈{−1,0,1} P(x).", [["yes", "Both true"], ["different", "First true, second false"], ["no", "Both false"]], "different", "1.1", "State the domain", "The predicate is the same; only the domain changed. Both members of {−1,1} pass, but x=0 fails in the larger domain, so a quantified claim has no truth value until its domain is stated.",
        function () { return P.quantifier([-1, 1], square, "forall") && !P.quantifier([-1, 0, 1], square, "forall") ? "different" : "no"; },
        domainStage(["P(x): x²=1"], [{ label: "Domain {−1, 1}", xs: [-1, 1], test: square }, { label: "Domain {−1, 0, 1}", xs: [-1, 0, 1], test: square }], ["Same predicate: true, then false."])),
      challenge("nested", "Over D={1,2}, compare ∀x ∃y (x≠y) with ∃y ∀x (x≠y).", [["yes", "Both true"], ["no", "Both false"], ["different", "First true, second false"]], "different", "1.1", "Quantifier order", "Each x has a different y, so the first holds. No single y differs from every x, because y would have to differ from itself, so the second fails. The order changes the meaning.",
        function () { var D = [1, 2], f = P.quantifier(D, function (x) { return P.quantifier(D, function (y) { return x !== y; }, "exists"); }, "forall"), g = P.quantifier(D, function (y) { return P.quantifier(D, function (x) { return x !== y; }, "forall"); }, "exists"); return f && !g ? "different" : f === g ? (f ? "yes" : "no") : "other"; },
        domainStage(["D = {1, 2}"], [{ label: "∀x ∃y: does this x have some y≠x?", xs: [1, 2], test: function (x) { return [1, 2].some(function (y) { return x !== y; }); } }, { label: "∃y ∀x: does this one y differ from all x?", xs: [1, 2], test: function (y) { return [1, 2].every(function (x) { return x !== y; }); } }], ["First true; second false."])),
    ],
    sets: [
      challenge("union", "Let X={1,2,3,4}, A={1,2}, B={2,3}. What is A∪B?", [["2", "{2}"], ["123", "{1,2,3}"], ["1234", "{1,2,3,4}"]], "123", "1.2", "Union", "Union keeps elements in at least one set, so it is membership with ∨. Element 4 belongs to neither set, so being in X is not enough.",
        function () { return P.setOp(SA, SB, "union").join(""); }, setStage(function (x) { return P.setOp(SA, SB, "union").indexOf(x) >= 0; }, "A ∪ B = " + set(P.setOp(SA, SB, "union")))),
      challenge("difference-order", "For the same A and B, compare A\\B with B\\A.", [["same", "Both {1}"], ["both", "Both {1,3}"], ["different", "A\\B={1}, B\\A={3}"]], "different", "1.2", "Difference direction", "A\\B starts from A and removes B, which leaves 1. B\\A starts from B and removes A, which leaves 3. The first set supplies the candidates, so the order matters.",
        function () { return P.setOp(SA, SB, "difference").join() === "1" && P.setOp(SB, SA, "difference").join() === "3" ? "different" : "same"; },
        setStage(function (x) { return P.setOp(SA, SB, "difference").concat(P.setOp(SB, SA, "difference")).indexOf(x) >= 0; }, "A\\B = " + set(P.setOp(SA, SB, "difference")) + ", B\\A = " + set(P.setOp(SB, SA, "difference")))),
      challenge("complement", "With X={1,2,3,4} and A={1,2}, what is Aᶜ?", [["34", "{3,4}"], ["empty", "∅"], ["1234", "X"]], "34", "1.2", "Relative complement", "A complement is relative to the stated universal set. The elements of X not in A are 3 and 4; change X and the answer changes.",
        function () { return P.setOp(SA, [], "complement", X).join(""); }, setStage(function (x) { return P.setOp(SA, [], "complement", X).indexOf(x) >= 0; }, "Aᶜ = " + set(P.setOp(SA, [], "complement", X)))),
      challenge("demorgan-sets", "For X={1,2,3,4}, A={1,2}, B={2,3}, what is (A∪B)ᶜ?", [["2", "{2}"], ["1", "{1}"], ["4", "{4}"]], "4", "1.2", "De Morgan for sets", "A∪B={1,2,3}, whose complement in X is {4}. De Morgan gives Aᶜ∩Bᶜ={3,4}∩{1,4}, the same set.",
        function () { var u = P.setOp(SA, SB, "union"); var l = P.setOp(u, [], "complement", X).join(""), r = P.setOp(P.setOp(SA, [], "complement", X), P.setOp(SB, [], "complement", X), "intersection").join(""); return l === r ? l : "2"; },
        setStage(function (x) { return x === 4; }, "(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ = {4}")),
    ],
    finite: [
      challenge("subset-empty", "Is ∅ a subset of A={a,b}?", [["no", "No"], ["yes", "Yes"], ["element", "Only if ∅∈A"]], "yes", "1.2", "Empty subset", "Every element of ∅ is in A, because there are no elements that could break the condition. So ∅⊂A, and this does not need ∅ to be an element of A.",
        function () { return [].every(function (x) { return ["a", "b"].indexOf(x) >= 0; }) ? "yes" : "no"; }, stepStage(["A = {a,b}", "∅ has no elements"], ["Test: every x∈∅ must be in A", "No x exists to fail the test", "=∅ ⊂ A"])),
      challenge("power-count", "If A={a,b,c}, how many subsets does 𝒫(A) contain?", [["3", "3"], ["6", "6"], ["8", "8"]], "8", "1.2", "Power set size", "Each of the three elements is either included or not, giving 2³=8 subsets. The count includes ∅ and A itself, which is why 6 is the common wrong answer.",
        function () { return String(P.powerSet(["a", "b", "c"]).length); },
        stepStage(["A = {a,b,c}"], [0, 1, 2, 3].map(function (size) { return "Size " + size + ": " + P.powerSet(["a", "b", "c"]).filter(function (s) { return s.length === size; }).map(function (s) { return s.length ? "{" + s.join(",") + "}" : "∅"; }).join(" "); }).concat(["=Count: 2³ = " + P.powerSet(["a", "b", "c"]).length]))),
      challenge("element-subset", "Let A={1,2}. Which statement is true?", [["in", "{1} ∈ A"], ["sub", "{1} ⊂ A"], ["both", "Both"]], "sub", "1.2", "Element or subset", "The elements of A are the numbers 1 and 2. The set {1} is not one of them, so {1} ∉ A. Its only element, 1, is in A, so {1} ⊂ A. ∈ compares one object with the list; ⊂ compares every element.",
        function () { var A = [1, 2], one = [1], isIn = A.some(function (x) { return Array.isArray(x) && String(x) === String(one); }), isSub = one.every(function (x) { return A.indexOf(x) >= 0; }); return isIn && isSub ? "both" : isSub ? "sub" : "in"; },
        stepStage(["A = {1,2}: its elements are 1 and 2"], ["{1} ∈ A? No: the set {1} is not listed in A", "{1} ⊂ A? Yes: its element 1 is in A", "={1} ⊂ A and 1 ∈ A, but {1} ∉ A"])),
      challenge("product-empty", "If A=∅, how many ordered pairs are in A×{1,2}?", [["0", "0"], ["1", "1"], ["2", "2"]], "0", "1.2", "Empty Cartesian factor", "There is no first coordinate to pair with either element, so an empty factor makes the Cartesian product empty. The count is 0×2.",
        function () { return String(P.product([], [1, 2]).length); }, stepStage(["A = ∅", "B = {1,2}"], ["No first coordinate is available", "=Pairs: 0 × 2 = " + P.product([], [1, 2]).length])),
    ],
  };
  var I = P.interval, F = P.formatInterval, A13 = I(-1, 3, false, true);
  function union(parts) { return parts.map(F).join(" ∪ "); }
  function circuit(a, b) { return O.or(O.and(a, b), O.and(a, !b)); }
  data.vote = [
    challenge("vote-agree", "Sensors read A=1, B=1, C=0. What is the vote V?", [["0", "0"], ["1", "1"], ["depends", "Depends on which sensor is faulty"]], "1", "1.1", "Majority vote", "V is 1 when at least two sensors read 1. A ∧ B is already 1, so V is 1 whatever C reads.",
      function () { return bit(P.vote(true, true, false)); }, function (el, t) { voteDiagram(el, [true, true, false], t > 0, t >= 1 ? "A ∧ B = 1, so V = 1." : null); }),
    challenge("vote-decides", "A=1 and B=0, and sensor C is faulty: it may read 0 or 1. Does C decide V?", [["decides", "Yes: V equals C"], ["no", "No: A already reads 1"], ["zero", "No: V is 0 either way"]], "decides", "1.1", "When one sensor matters", "With A and B disagreeing, each pair term needs C. C=0 gives V=0 and C=1 gives V=1, so the faulty sensor decides. One fault is harmless only when the other two agree.",
      function () { return P.vote(true, false, false) !== P.vote(true, false, true) ? "decides" : "no"; },
      stepStage(["A = 1, B = 0, C faulty"], ["C = 0: (1∧0) ∨ (1∧0) ∨ (0∧0) = " + bit(P.vote(true, false, false)), "C = 1: (1∧0) ∨ (1∧1) ∨ (0∧1) = " + bit(P.vote(true, false, true)), "=A and B disagree, so C decides V"])),
    challenge("vote-outvoted", "A=0 and B=0 are working; faulty C reads 1. What is V?", [["1", "1: C reports a reading"], ["unknown", "Cannot tell"], ["0", "0"]], "0", "1.1", "Outvoted fault", "Every pair term needs two 1s, and only C reads 1, so all three terms are 0 and V is 0. The two working sensors outvote the faulty one.",
      function () { return bit(P.vote(false, false, true)); }, function (el, t) { voteDiagram(el, [false, false, true], t > 0, t >= 1 ? "One 1 is not a majority: V = 0." : null); }),
    challenge("circuit", "Which single input does (A ∧ B) ∨ (A ∧ ¬B) equal?", [["a", "A"], ["b", "B"], ["one", "Always 1"]], "a", "1.1", "Circuit simplification", "By the distributive law it is A ∧ (B ∨ ¬B), and B ∨ ¬B is always 1, so it is A. The notes use this to replace four gates with one wire.",
      function () { return P.truthTable(circuit).every(function (r) { return r.value === r.A; }) ? "a" : "b"; },
      logicStage([false, true], [{ head: "(A∧B)∨(A∧¬B)", f: circuit }, { head: "A", f: function (a) { return a; } }], "Same column as A: four gates become a wire.")),
  ];
  data.intervals = [
    challenge("closed-end", "Is 3 an element of (−1,3]?", [["no", "No: 3 is an endpoint"], ["yes", "Yes: ] includes 3"], ["closed", "Only if written [−1,3]"]], "yes", "1.2", "Closed end", "A square bracket includes its endpoint and a round one excludes it. (−1,3] has ] at 3, so 3 is in it, while −1 is not.",
      function () { return P.inInterval(A13, 3) ? "yes" : "no"; },
      lineStage([{ label: "A = (−1,3]", parts: [A13] }], { label: "x = 3 sits on the filled end", parts: [I(3, 3, true, true)] }, "3 ∈ A, because ] includes it; −1 ∉ A.")),
    challenge("complement-ends", "What is the complement of (−1,3] in ℝ?", [["swap", "(−∞,−1) ∪ [3,∞)"], ["mid", "[−1,3)"], ["right", "(−∞,−1] ∪ (3,∞)"]], "right", "1.2", "Complement flips ends", "The complement takes every real number not in A. −1 is not in A, so it joins the complement; 3 is in A, so it does not. Each shared end changes bracket.",
      function () { return union(P.complement(A13)) === "(−∞,−1] ∪ (3,∞)" ? "right" : "swap"; },
      lineStage([{ label: "A = (−1,3]", parts: [A13] }], { label: "Aᶜ = " + union(P.complement(A13)), parts: P.complement(A13) }, "Filled and hollow ends swap at −1 and 3.")),
    challenge("interval-meet", "What is [0,2] ∩ (1,3)?", [["right", "(1,2]"], ["closed", "[1,2]"], ["span", "(0,3)"]], "right", "1.2", "Intersecting intervals", "The intersection keeps points in both. It starts after 1, because (1,3) excludes 1, and ends at 2 inclusive, because [0,2] includes 2.",
      function () { return F(P.intersect(I(0, 2, true, true), I(1, 3, false, false))) === "(1,2]" ? "right" : "closed"; },
      lineStage([{ label: "[0,2]", parts: [I(0, 2, true, true)] }, { label: "(1,3)", parts: [I(1, 3, false, false)] }], { label: "[0,2] ∩ (1,3) = " + F(P.intersect(I(0, 2, true, true), I(1, 3, false, false))), parts: [P.intersect(I(0, 2, true, true), I(1, 3, false, false))] }, "Each end comes from the stricter interval.")),
    challenge("nonneg", "Which interval is ℝ≥0?", [["pos", "(0,∞)"], ["right", "[0,∞)"], ["neg", "(−∞,0]"]], "right", "1.2", "ℝ≥0 against ℝ+", "ℝ≥0 includes 0, so its left end is closed: [0,∞). ℝ+ = (0,∞) leaves 0 out. ∞ always gets a round bracket, because it is not a number in the set.",
      function () { return P.inInterval(I(0, Infinity, true, false), 0) && F(I(0, Infinity, true, false)) === "[0,∞)" ? "right" : "pos"; },
      lineStage([{ label: "ℝ+ = (0,∞)", parts: [I(0, Infinity, false, false)] }], { label: "ℝ≥0 = [0,∞)", parts: [I(0, Infinity, true, false)] }, "Only the end at 0 differs.")),
  ];
  var ends = { "(−1,3)": [false, false], "[−1,3)": [true, false], "(−1,3]": [false, true], "[−1,3]": [true, true] };
  var predicates ={ even: ["x is even", even], positive: ["x>0", function (x) { return x > 0; }], large: ["x>3", function (x) { return x > 3; }] };
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), card = root.querySelector(".challenge"), visual = stage(id);
    function setup(c) {
      root.classList.remove("sandbox-open"); root._stageSlider = null;
      root.querySelector(".stage").classList.remove("can-grab");
      c.stage();
    }
    function sandbox() {
      root.classList.add("sandbox-open");
      if (root._sandboxUpdate) { root.querySelector(".stage").classList.add("can-grab"); root._sandboxUpdate(); return; }
      var c = root.querySelector("[data-control]");
      function update() {
        if (id === "logic") {
          var a = root.querySelector("[data-control='a']").value === "true", b = root.querySelector("[data-control='b']").value === "true";
          truthTable(visual, { selected: [a, b], cols: [imp, contra], shown: "all", caption: "The implication and its contrapositive match in every row." });
          drawSlider(root, visual, ["00", "01", "10", "11"], bit(a) + bit(b), function (v) {
            root.querySelector("[data-control='a']").value = String(v[0] === "1"); root.querySelector("[data-control='b']").value = String(v[1] === "1"); update();
          });
        } else if (id === "quantifiers") {
          var xs = Array.from({ length: +c.value }, function (_, i) { return i + 1; }), pred = predicates[root.querySelector("[data-control='predicate']").value];
          var fail = xs.filter(function (x) { return !pred[1](x); });
          domainRows(visual, ["P(x): " + pred[0]], [{ xs: xs, test: pred[1] }], xs.length, [
            "∀x P(x) = " + bit(P.quantifier(xs, pred[1], "forall")) + "   ∃x P(x) = " + bit(P.quantifier(xs, pred[1], "exists")),
            fail.length ? "First counterexample: x=" + fail[0] : "No counterexample in this domain",
          ], 150);
          drawSlider(root, visual, ["2", "3", "4", "5", "6"], c.value, function (v) { c.value = v; update(); });
        } else if (id === "sets") {
          var op = c.value, result = P.setOp(SA, op === "complement" ? [] : SB, op, X), symbol = { union: "∪", intersection: "∩", difference: "\\" }[op];
          venn(visual, result); setCaption(visual, (op === "complement" ? "Aᶜ" : "A " + symbol + " B") + " = " + set(result));
          drawSlider(root, visual, ["union", "intersection", "difference", "complement"], op, function (v) { c.value = v; update(); });
        } else if (id === "vote") {
          var s = ["a", "b", "c"].map(function (k) { return root.querySelector("[data-control='" + k + "']").value === "true"; });
          voteDiagram(visual, s, true);
          drawSlider(root, visual, ["000", "001", "010", "011", "100", "101", "110", "111"], s.map(bit).join(""), function (v) {
            ["a", "b", "c"].forEach(function (k, i) { root.querySelector("[data-control='" + k + "']").value = String(v[i] === "1"); }); update();
          });
        } else if (id === "intervals") {
          var e = ends[c.value], A = I(-1, 3, e[0], e[1]);
          lines(visual, [{ label: "A = " + F(A), parts: [A] }, { label: "Aᶜ = " + union(P.complement(A)), parts: P.complement(A) }]);
          drawSlider(root, visual, Object.keys(ends), c.value, function (v) { c.value = v; update(); });
        } else {
          var ps = P.powerSet(["a", "b", "c"]), pairs = P.product(SA, ["x"]);
          text(visual, c.value === "power" ? ["A = {a,b,c}", "𝒫(A) = {∅,{a},{b},{c},{a,b},{a,c},{b,c},{a,b,c}}", "=Count: 2³ = " + ps.length] : ["A = {1,2}    B = {x}", "=A × B = {" + pairs.map(function (p) { return "(" + p.join(",") + ")"; }).join(", ") + "}", "Pair order follows A, then B."]);
          drawSlider(root, visual, ["power", "product"], c.value, function (v) { c.value = v; update(); });
        }
      }
      root._sandboxUpdate = update;
      bindStagePointer(root); root.querySelector(".stage").classList.add("can-grab");
      root.querySelectorAll("[data-control]").forEach(function (control) { control.addEventListener("change", update); });
      update();
    }
    Lab.experiment({ id: id, title: title, card: card, lock: function () {}, setup: setup, sandbox: sandbox, challenges: data[id].map(function (ch) {
      var guess = null;
      function draw(t) { ch.render(visual, t); guessLine(visual, guess); }
      return Object.assign({}, ch, {
        stage: function () { guess = null; draw(0); },
        preview: function (choice) { guess = ch.options.filter(function (o) { return o[0] === choice; })[0][1]; draw(0); },
        reveal: function () { return Lab.tween(1500, draw).then(function () { draw(1); }); },
      });
    }) });
  }
  register("logic", "1.1 Truth tables"); register("quantifiers", "1.1 Quantifiers");
  register("vote", "1.1 Sensor vote and circuits");
  register("sets", "1.2 Set operations"); register("finite", "1.2 Finite sets"); register("intervals", "1.2 Intervals");
})();
