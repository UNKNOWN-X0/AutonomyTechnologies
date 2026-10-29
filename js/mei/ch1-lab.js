/* MEI Chapter 1 experiments: logic, quantifiers and set membership. */
(function () {
  var P = window.MEI1, ns = "http://www.w3.org/2000/svg";
  function stage(id) { return document.querySelector("[data-visual='" + id + "']"); }
  function text(el, lines) {
    el.innerHTML = "";
    lines.forEach(function (line, i) {
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", "24"); t.setAttribute("y", String(48 + i * 42));
      t.setAttribute("class", i === lines.length - 1 ? "result" : "");
      t.setAttribute("fill", getComputedStyle(document.body).getPropertyValue(i === lines.length - 1 ? "--act" : "--ink").trim());
      t.setAttribute("font-family", "var(--f-display)"); t.setAttribute("font-size", "18");
      if (el.dataset.visual === "logic" && i > 0) {
        t.setAttribute("tabindex", "0"); t.setAttribute("role", "button");
        t.setAttribute("aria-label", "Highlight truth-table row " + i);
        t.addEventListener("focus", function () { el.querySelectorAll("text").forEach(function (row) { row.setAttribute("opacity", row === t ? "1" : "0.42"); }); });
        t.addEventListener("blur", function () { el.querySelectorAll("text").forEach(function (row) { row.setAttribute("opacity", "1"); }); });
        t.addEventListener("pointerenter", function () { t.setAttribute("font-weight", "800"); });
        t.addEventListener("pointerleave", function () { t.removeAttribute("font-weight"); });
      }
      t.textContent = line; el.appendChild(t);
    });
  }
  function venn(el, op) {
    var paper = getComputedStyle(document.body).getPropertyValue("--paper").trim();
    var ink = getComputedStyle(document.body).getPropertyValue("--ink").trim();
    var course = getComputedStyle(document.body).getPropertyValue("--course").trim();
    var html = '<defs><clipPath id="mei-a"><circle cx="195" cy="138" r="68"/></clipPath></defs>';
    var fill = ' fill="' + course + '" fill-opacity=".42"';
    html += '<rect x="20" y="20" width="440" height="224" fill="' + paper + '" stroke="' + ink + '" stroke-width="2"/>';
    if (op === "union") html += '<circle cx="195" cy="138" r="68"' + fill + '/><circle cx="285" cy="138" r="68"' + fill + '/>';
    if (op === "intersection") html += '<circle cx="285" cy="138" r="68"' + fill + ' clip-path="url(#mei-a)"/>';
    if (op === "difference") html += '<circle cx="195" cy="138" r="68"' + fill + '/><circle cx="285" cy="138" r="68" fill="' + paper + '"/>';
    if (op === "complement") html += '<rect x="20" y="20" width="440" height="224"' + fill + '/><circle cx="195" cy="138" r="68" fill="' + paper + '"/>';
    html += '<circle cx="195" cy="138" r="68" fill="none" stroke="' + ink + '" stroke-width="2"/><circle cx="285" cy="138" r="68" fill="none" stroke="' + ink + '" stroke-width="2"/>';
    html += '<text x="165" y="78" fill="' + ink + '" font-size="18">A</text><text x="305" y="78" fill="' + ink + '" font-size="18">B</text>';
    html += '<text x="155" y="142" fill="' + ink + '" font-size="18">1</text><text x="238" y="142" fill="' + ink + '" font-size="18">2</text><text x="322" y="142" fill="' + ink + '" font-size="18">3</text><text x="56" y="64" fill="' + ink + '" font-size="18">4</text>';
    html += '<text x="38" y="232" fill="' + ink + '" font-size="14">U = {1,2,3,4}</text>';
    el.innerHTML = html;
    el.setAttribute("aria-label", "Venn diagram with " + op + " region shaded");
    el.querySelectorAll("text").forEach(function (t) { t.setAttribute("font-family", "var(--f-display)"); });
  }
  function truthTable(el, selected) {
    el.innerHTML = "";
    var ink = getComputedStyle(document.body).getPropertyValue("--ink").trim();
    var mark = getComputedStyle(document.body).getPropertyValue("--course").trim();
    var cols = [48, 145, 245, 365], heads = ["A", "B", "A ⇒ B", "¬B ⇒ ¬A"];
    function cell(label, x, y, size, color, weight) {
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", x); t.setAttribute("y", y); t.setAttribute("fill", color); t.setAttribute("font-size", size);
      t.setAttribute("font-family", "var(--f-display)"); if (weight) t.setAttribute("font-weight", weight);
      t.textContent = label; el.appendChild(t);
    }
    heads.forEach(function (h, i) { cell(h, cols[i], 43, 16, ink, "700"); });
    P.truthTable(P.operators.implies).forEach(function (r, i) {
      var y = 75 + i * 38, current = selected && r.A === selected[0] && r.B === selected[1];
      var row = document.createElementNS(ns, "g"), bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "24"); bg.setAttribute("y", String(y - 25)); bg.setAttribute("width", "430"); bg.setAttribute("height", "36");
      bg.setAttribute("fill", current ? mark : "transparent"); bg.setAttribute("fill-opacity", current ? ".22" : "0"); row.appendChild(bg);
      row.setAttribute("tabindex", "0"); row.setAttribute("role", "button"); row.setAttribute("aria-label", "Highlight truth-table row " + (i + 1));
      [r.A ? "T" : "F", r.B ? "T" : "F", r.value ? "T" : "F", P.operators.implies(!r.B, !r.A) ? "T" : "F"].forEach(function (v, j) {
        var t = document.createElementNS(ns, "text"); t.setAttribute("x", cols[j]); t.setAttribute("y", y); t.setAttribute("fill", ink);
        t.setAttribute("font-size", "18"); t.setAttribute("font-family", "var(--f-display)"); t.textContent = v; row.appendChild(t);
      });
      function highlight() { bg.setAttribute("fill-opacity", ".22"); }
      function clear() { bg.setAttribute("fill-opacity", current ? ".22" : "0"); }
      row.addEventListener("pointerenter", highlight); row.addEventListener("pointerleave", clear); row.addEventListener("focus", highlight); row.addEventListener("blur", clear);
      el.appendChild(row);
    });
    cell("The implication and its contrapositive match in every row.", 24, 224, 14, ink);
    el.setAttribute("aria-label", "Truth table comparing A implies B with its equivalent contrapositive");
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
  function challenge(id, prompt, options, answer, ref, short, why) {
    return { id: id, prompt: prompt, options: options, answer: answer, ref: ref, short: short, why: why };
  }
  var data = {
    logic: [
      challenge("implication-false", "For A=true and B=false, what is A ⇒ B?", [["false", "False"], ["true", "True"], ["undefined", "Undefined"]], "false", "1.1", "Implication false row", "An implication is false only when its premise is true and its conclusion false."),
      challenge("inclusive-or", "For A=true and B=true, what is inclusive A ∨ B?", [["true", "True"], ["false", "False"], ["xor", "Exclusive OR is true"]], "true", "1.1", "Inclusive OR", "Inclusive OR needs at least one true input, so it remains true when both are true. Exclusive OR would be false here."),
      challenge("converse", "For A=false and B=true, compare A ⇒ B with B ⇒ A.", [["different", "First true, converse false"], ["same", "Both true"], ["false", "Both false"]], "different", "1.1", "Converse", "Swapping an implication gives its converse, which need not have the same truth value. Its contrapositive ¬B ⇒ ¬A does remain equivalent."),
      challenge("demorgan", "For A=false and B=false, compare ¬(A ∧ B) with (¬A ∨ ¬B).", [["both-true", "Both true"], ["both-false", "Both false"], ["different", "Different values"]], "both-true", "1.1", "De Morgan", "De Morgan’s law negates each part and changes AND to OR. Here both forms evaluate to true."),
    ],
    quantifiers: [
      challenge("forall-negation", "On D={1,2,3}, P(x): x is even. What is the negation of ∀x P(x)?", [["all", "Every x is odd"], ["some", "At least one x is odd"], ["none", "No x is odd"]], "some", "1.1", "Negating ∀", "Negating ‘for every’ gives ‘there exists a counterexample’: ∃x ¬P(x). Here x=1 is enough."),
      challenge("exists-negation", "On D={1,2,3}, P(x): x>3. Is ∃x P(x) true?", [["yes", "Yes, at least one"], ["no", "No, none"], ["all", "Yes, every x"]], "no", "1.1", "Negating ∃", "An existential claim needs one witness in the stated domain. No element of {1,2,3} exceeds 3."),
      challenge("domain-matters", "For P(x): x²=1, is ∀x∈{−1,1} P(x) true?", [["yes", "Yes, both values work"], ["no", "No, only one works"], ["open", "It has no truth value"]], "yes", "1.1", "State the domain", "Both members of the finite domain satisfy x²=1. A quantified statement is evaluated over its named domain."),
      challenge("nested", "Over D={1,2}, is ∀x ∃y (x<y) true?", [["yes", "Yes, each x has a larger y"], ["no", "No, x=2 has none"], ["swap", "It means ∃y ∀x (x<y)"]], "no", "1.1", "Quantifier order", "For x=2 there is no y in the domain with 2<y, so the universal claim fails. Quantifier order cannot be swapped casually."),
    ],
    sets: [
      challenge("union", "Let U={1,2,3,4}, A={1,2}, B={2,3}. What is A∪B?", [["123", "{1,2,3}"], ["2", "{2}"], ["1234", "{1,2,3,4}"]], "123", "1.2", "Union", "Union includes elements in at least one set. Element 4 belongs to neither, so it is excluded."),
      challenge("intersection", "For the same A and B, what is A∩B?", [["2", "{2}"], ["123", "{1,2,3}"], ["empty", "∅"]], "2", "1.2", "Intersection", "Intersection includes only elements in both sets. The shared element is 2."),
      challenge("complement", "With U={1,2,3,4} and A={1,2}, what is Aᶜ?", [["34", "{3,4}"], ["empty", "∅"], ["1234", "U"]], "34", "1.2", "Relative complement", "A complement is relative to the stated universe. The elements of U not in A are 3 and 4."),
      challenge("demorgan-sets", "For U={1,2,3,4}, A={1,2}, B={2,3}, what is (A∪B)ᶜ?", [["4", "{4}"], ["2", "{2}"], ["1", "{1}"]], "4", "1.2", "De Morgan for sets", "A∪B={1,2,3}, whose complement in U is {4}. De Morgan gives Aᶜ∩Bᶜ, the same set."),
    ],
    finite: [
      challenge("subset-empty", "Is ∅ a subset of A={a,b}?", [["yes", "Yes"], ["no", "No"], ["element", "Only if ∅∈A"]], "yes", "1.2", "Empty subset", "Every element of ∅ is in A: there are no elements that could violate the condition. Thus ∅⊆A."),
      challenge("power-count", "If A={a,b,c}, how many subsets does P(A) contain?", [["8", "8"], ["6", "6"], ["3", "3"]], "8", "1.2", "Power set size", "Each of the three elements is either included or not, giving 2³=8 subsets."),
      challenge("ordered-pair", "If A={1,2} and B={x}, which pair belongs to A×B?", [["2x", "(2,x)"], ["x2", "(x,2)"], ["sets", "{A,B}"]], "2x", "1.2", "Coordinate order", "In A×B the first coordinate comes from A and the second from B. Ordered pairs keep their coordinate order."),
      challenge("product-empty", "If A=∅, how many ordered pairs are in A×{1,2}?", [["0", "0"], ["2", "2"], ["1", "1"]], "0", "1.2", "Empty Cartesian factor", "There is no first coordinate to pair with either element. An empty factor makes the Cartesian product empty."),
    ],
  };
  function initial(id, el) {
    if (id === "logic") { truthTable(el); return; }
    var lines = {
      logic: ["A   B   A⇒B   ¬B⇒¬A", "F   F     T       T", "F   T     T       T", "T   F     F       F", "T   T     T       T"],
      quantifiers: ["D = {1, 2, 3}", "P(x): x is even", "∀x P(x) = false", "∃x P(x) = true"],
      sets: ["U = {1,2,3,4}", "A = {1,2}", "B = {2,3}", "A ∪ B = {1,2,3}"],
      finite: ["P({a,b}) = {∅,{a},{b},{a,b}}", "There are 2² = 4 subsets", "{1,2} × {x}", "= {(1,x),(2,x)}"],
    };
    text(el, lines[id]);
  }
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), card = root.querySelector(".challenge"), visual = stage(id);
    Lab.experiment({ id: id, title: title, card: card, lock: function () {}, setup: function () { initial(id, visual); }, sandbox: function () {
      root.classList.add("sandbox-open");
      if (root.dataset.sandboxBound) return;
      root.dataset.sandboxBound = "true";
      var c = root.querySelector("[data-control]");
      function update() {
        if (id === "logic") {
          var a = root.querySelector("[data-control='a']").value === "true", b = root.querySelector("[data-control='b']").value === "true";
          truthTable(visual, [a, b]);
          drawSlider(root, visual, [0, 1, 2, 3], (a ? 2 : 0) + (b ? 1 : 0), function (i) {
            root.querySelector("[data-control='a']").value = String(i >= 2); root.querySelector("[data-control='b']").value = String(i % 2 === 1); update();
          });
        } else if (id === "quantifiers") {
          var n = +c.value, xs = Array.from({ length: n }, function (_, i) { return i + 1; }), evens = xs.filter(function (x) { return x % 2 === 0; });
          text(visual, ["D = {" + xs.join(", ") + "}", "P(x): x is even", "∀x P(x) = " + P.quantifier(xs, function (x) { return x % 2 === 0; }, "forall"), "∃x P(x) = " + P.quantifier(xs, function (x) { return x % 2 === 0; }, "exists"), "Witnesses: {" + evens.join(", ") + "}"]);
          drawSlider(root, visual, ["2", "3", "4", "5", "6"], c.value, function (v) { c.value = v; update(); });
        } else if (id === "sets") {
          var op = c.value, result = P.setOp([1, 2], [2, 3], op, [1, 2, 3, 4]), symbol = { union: "∪", intersection: "∩", difference: "\\", complement: "ᶜ" }[op];
          venn(visual, op);
          var answer = document.createElementNS(ns, "text"); answer.setAttribute("x", "36"); answer.setAttribute("y", "42");
          answer.setAttribute("fill", getComputedStyle(document.body).getPropertyValue("--act").trim()); answer.setAttribute("font-size", "18");
          answer.setAttribute("font-family", "var(--f-display)"); answer.textContent = (op === "complement" ? "Aᶜ" : "A " + symbol + " B") + " = {" + result.join(",") + "}"; visual.appendChild(answer);
          drawSlider(root, visual, ["union", "intersection", "difference", "complement"], op, function (v) { c.value = v; update(); });
        } else {
          var ps = P.powerSet(["a", "b", "c"]), pairs = P.product([1, 2], ["x"]);
          text(visual, c.value === "power" ? ["A = {a,b,c}", "P(A) = {∅,{a},{b},{c},", "{a,b},{a,c},{b,c},{a,b,c}}", "Count: 2³ = " + ps.length] : ["A × B", "A = {1,2}    B = {x}", "{" + pairs.map(function (p) { return "(" + p.join(",") + ")"; }).join(", ") + "}", "Pair order follows A, then B."]);
          drawSlider(root, visual, ["power", "product"], c.value, function (v) { c.value = v; update(); });
        }
      }
      if (c) {
        bindStagePointer(root); root.querySelector(".stage").classList.add("can-grab");
        root.querySelectorAll("[data-control]").forEach(function (control) { control.addEventListener("change", update); });
        update();
      }
    }, challenges: data[id].map(function (ch) {
      return Object.assign({}, ch, {
        preview: function (choice) { text(visual, [ch.prompt, "Prediction committed: " + choice, "Reveal to check the rule."]); },
        reveal: function () {
          var mechanism = {
            logic: ["Read the committed A and B row.", "Apply the connective rule to those inputs.", "Compare output columns to test equivalence."],
            quantifiers: ["List the values in the stated domain.", "Check the predicate for each candidate.", "A universal claim fails at one counterexample."],
            sets: ["Check each element in the universe.", "Apply the operation’s membership rule.", "Collect only elements that pass the rule."],
            finite: ["Choose elements from the stated set.", "Form each subset or ordered pair.", "Count the complete collection."],
          }[id], current = -1;
          return Lab.tween(1500, function (t) {
            var next = Math.min(mechanism.length - 1, Math.floor(t * mechanism.length));
            if (next !== current) { current = next; text(visual, [ch.prompt, mechanism[next], "Checking the result…"]); }
          }).then(function () {
            text(visual, [ch.prompt, "Answer: " + ch.options.filter(function (o) { return o[0] === ch.answer; })[0][1], ch.why]);
          });
        },
      });
    }) });
  }
  register("logic", "1.1 Truth tables"); register("quantifiers", "1.1 Quantifiers");
  register("sets", "1.2 Set operations"); register("finite", "1.2 Finite sets");
})();
