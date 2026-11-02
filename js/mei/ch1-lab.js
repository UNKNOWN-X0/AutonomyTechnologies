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
  var contra = { head: "¬B ⇒ ¬A", f: function (a, b) { return O.implies(!b, !a); } };
  function even(x) { return x % 2 === 0; }
  function square(x) { return x * x === 1; }
  var data = {
    logic: [
      challenge("implication-false", "For A=1 (true) and B=0 (false), what is A ⇒ B?", [["true", "True"], ["false", "False"], ["undefined", "Undefined"]], "false", "1.1", "Implication false row", "An implication is false only when its premise is true and its conclusion false. This is that row, so it is the one case that fails.",
        function () { return String(O.implies(true, false)); }, logicStage([true, false], [imp], "True premise, false conclusion: 0.")),
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
      challenge("exists-negation", "On D={1,2,3}, let P(x): x>3. What is the negation of ∃x P(x)?", [["forall-le", "For every x, x≤3"], ["exists-le", "There is an x with x≤3"], ["forall-gt", "For every x, x>3"]], "forall-le", "1.1", "Negating ∃", "¬∃x P(x) ⇔ ∀x ¬P(x), so ‘none exceeds 3’ means ‘every x is at most 3’. Swap the quantifier and negate the predicate; doing only one of the two gives the other options.",
        function () { var D = [1, 2, 3], gt = function (x) { return x > 3; }; return !P.quantifier(D, gt, "exists") === P.quantifier(D, function (x) { return !gt(x); }, "forall") ? "forall-le" : "exists-le"; },
        domainStage(["P(x): x>3", "D = {1, 2, 3}"], [{ xs: [1, 2, 3], test: function (x) { return x > 3; } }], ["No witness, so ∀x (x≤3) is the true negation."])),
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
      challenge("intersection", "For the same A and B, compare A\\B with B\\A.", [["same", "Both {1}"], ["both", "Both {1,3}"], ["different", "A\\B={1}, B\\A={3}"]], "different", "1.2", "Difference direction", "A\\B starts from A and removes B, which leaves 1. B\\A starts from B and removes A, which leaves 3. The first set supplies the candidates, so the order matters.",
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
      challenge("ordered-pair", "If A={1,2} and B={x}, which pair belongs to A×B?", [["x2", "(x,2)"], ["2x", "(2,x)"], ["sets", "(1,2)"]], "2x", "1.2", "Coordinate order", "In A×B the first coordinate comes from A and the second from B. Ordered pairs keep that order, so (x,2) is in B×A instead, and (1,2) has no second coordinate from B.",
        function () { var ps = P.product(SA, ["x"]).map(String); return ps.indexOf("2,x") >= 0 && ps.indexOf("x,2") < 0 ? "2x" : "x2"; },
        stepStage(["A = {1,2}", "B = {x}"], ["First coordinate from A, second from B", "=A × B = {" + P.product(SA, ["x"]).map(function (p) { return "(" + p.join(",") + ")"; }).join(", ") + "}"])),
      challenge("product-empty", "If A=∅, how many ordered pairs are in A×{1,2}?", [["0", "0"], ["1", "1"], ["2", "2"]], "0", "1.2", "Empty Cartesian factor", "There is no first coordinate to pair with either element, so an empty factor makes the Cartesian product empty. The count is 0×2.",
        function () { return String(P.product([], [1, 2]).length); }, stepStage(["A = ∅", "B = {1,2}"], ["No first coordinate is available", "=Pairs: 0 × 2 = " + P.product([], [1, 2]).length])),
    ],
  };
  var predicates = { even: ["x is even", even], positive: ["x>0", function (x) { return x > 0; }], large: ["x>3", function (x) { return x > 3; }] };
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
  register("sets", "1.2 Set operations"); register("finite", "1.2 Finite sets");
})();
