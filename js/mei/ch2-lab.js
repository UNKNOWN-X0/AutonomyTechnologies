/* MEI Chapter 2 experiments: number systems, completeness, distance, counting, induction. */
(function () {
  var P = window.MEI2, ns = "http://www.w3.org/2000/svg";
  function tok(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
  function node(tag, attrs, parent) {
    var el = document.createElementNS(ns, tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    parent.appendChild(el); return el;
  }
  function text(svg, words, x, y, size, color, anchor, weight) {
    var el = node("text", { x: x, y: y, fill: color || tok("--ink"), "font-size": size || 17, "font-family": "var(--f-display)", "text-anchor": anchor || "start" }, svg);
    if (weight) el.setAttribute("font-weight", weight);
    el.textContent = words; return el;
  }
  function reset(svg, label) {
    svg.innerHTML = "";
    svg.setAttribute("role", "img");
    if (label) svg.setAttribute("aria-label", label);
  }
  function guess(svg, value) { if (value) text(svg, "Your prediction: " + value, 24, 304, 14, tok("--muted")); }
  function line(svg, x1, y1, x2, y2, color, width, dash) {
    return node("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || tok("--line"), "stroke-width": width || 2, "stroke-dasharray": dash || "" }, svg);
  }
  function box(svg, x, y, w, h, fill, stroke, rx) {
    return node("rect", { x: x, y: y, width: w, height: h, rx: rx || 7, fill: fill || "none", stroke: stroke || tok("--line"), "stroke-width": 2 }, svg);
  }
  function stage(id) { return document.querySelector("[data-visual='" + id + "']"); }
  function binaryDraw(svg, bits, phase, said) {
    reset(svg, "Binary digits aligned with powers of two, then added to form an integer");
    var course = tok("--course"), mark = tok("--fau-mark"), start = 34, gap = 68;
    text(svg, "Bit position", 24, 42, 14, tok("--muted"));
    bits.split("").forEach(function (b, i) {
      var x = start + i * gap, power = bits.length - 1 - i, active = b === "1" && phase > i / bits.length;
      box(svg, x, 62, 52, 52, active ? course : tok("--paper"), active ? mark : tok("--line"), 10);
      text(svg, b, x + 26, 96, 25, active ? tok("--paper") : tok("--ink"), "middle", 800);
      text(svg, "2" + (power ? "^" + power : "^0"), x + 26, 142, 14, tok("--muted"), "middle");
      text(svg, String(Math.pow(2, power)), x + 26, 165, 14, tok("--ink"), "middle");
      if (active) text(svg, String(Math.pow(2, power)), x + 26, 198, 14, mark, "middle", 700);
    });
    line(svg, 24, 218, 456, 218, tok("--line"), 1);
    if (phase > 0.72) text(svg, bits.split("").map(function (b, i) { return b === "1" ? Math.pow(2, bits.length - 1 - i) : null; }).filter(function (v) { return v !== null; }).join(" + ") + " = " + P.binaryValue(bits), 240, 258, 23, tok("--act"), "middle", 800);
    if (said) text(svg, said, 240, 284, 14, tok("--muted"), "middle");
  }
  function boundsDraw(svg, places, phase, said) {
    reset(svg, "Rational lower and upper approximations squeeze the least upper bound sqrt two");
    var b = P.sqrt2Bounds(places), lo = 1.28, hi = 1.52, x = function (v) { return 36 + (v - lo) / (hi - lo) * 408; }, y = 151;
    line(svg, 36, y, 444, y, tok("--line"), 3);
    [1.3, 1.35, 1.4, 1.45, 1.5].forEach(function (v) { line(svg, x(v), y - 7, x(v), y + 7, tok("--line"), 1); text(svg, v.toFixed(2), x(v), y + 31, 13, tok("--muted"), "middle"); });
    var xl = x(Math.max(lo, b.lower)), xu = x(Math.min(hi, b.upper)), xs = x(Math.sqrt(2));
    if (phase > 0.08) line(svg, xl, y, xu, y, tok("--course"), 12);
    if (phase > 0.45) line(svg, xs, 83, xs, 191, tok("--fau-mark"), 2, "5 5");
    if (phase > 0.3) { node("circle", { cx: xl, cy: y, r: 9, fill: tok("--paper"), stroke: tok("--course"), "stroke-width": 4 }, svg); line(svg, xl, 130, 120, 111, tok("--course"), 1); text(svg, "lower " + b.lower.toFixed(places), 120, 106, 14, tok("--ink"), "middle", 700); }
    if (phase > 0.6) { node("circle", { cx: xu, cy: y, r: 9, fill: tok("--paper"), stroke: tok("--course"), "stroke-width": 4 }, svg); line(svg, xu, 130, 360, 86, tok("--course"), 1); text(svg, "upper " + b.upper.toFixed(places), 360, 81, 14, tok("--ink"), "middle", 700); }
    if (phase > 0.82) text(svg, "supremum = √2 (not a rational member)", 240, 235, 19, tok("--act"), "middle", 800);
    if (said) text(svg, said, 240, 280, 14, tok("--muted"), "middle");
  }
  function distanceDraw(svg, center, radius, phase, said) {
    reset(svg, "Number line showing the interval of points within a chosen distance from the center");
    var x = function (v) { return 44 + (v + 5) * 39; }, y = 164, lo = center - radius, hi = center + radius;
    line(svg, 44, y, 434, y, tok("--line"), 3);
    for (var v = -5; v <= 5; v++) { line(svg, x(v), y - 6, x(v), y + 6, tok("--line"), 1); text(svg, String(v), x(v), y + 26, 13, tok("--muted"), "middle"); }
    if (phase > 0.05) line(svg, x(Math.max(-5, lo)), y, x(Math.min(5, hi)), y, tok("--course"), 14);
    if (phase > 0.32) {
      [lo, hi].forEach(function (v) { node("circle", { cx: x(v), cy: y, r: 8, fill: tok("--paper"), stroke: tok("--course"), "stroke-width": 4 }, svg); });
      node("circle", { cx: x(center), cy: y, r: 7, fill: tok("--fau-mark") }, svg);
      text(svg, "a = " + center, x(center), 111, 15, tok("--ink"), "middle", 700);
      text(svg, "a−r = " + lo, x(lo), 202, 14, tok("--ink"), "middle");
      text(svg, "a+r = " + hi, x(hi), 202, 14, tok("--ink"), "middle");
    }
    if (phase > 0.75) text(svg, "|x−a| ≤ r  ⇔  " + lo + " ≤ x ≤ " + hi, 240, 244, 18, tok("--act"), "middle", 800);
    if (said) text(svg, said, 240, 281, 14, tok("--muted"), "middle");
  }
  function squareRootDraw(svg, phase, said) {
    reset(svg, "Number line showing x equals minus four is four units from zero");
    var x = function (v) { return 44 + (v + 5) * 39; }, y = 164;
    line(svg, 44, y, 434, y, tok("--line"), 3);
    for (var v = -5; v <= 5; v++) { line(svg, x(v), y - 6, x(v), y + 6, tok("--line"), 1); text(svg, String(v), x(v), y + 26, 13, tok("--muted"), "middle"); }
    if (phase > 0.05) line(svg, x(-4), y, x(0), y, tok("--course"), 8);
    if (phase > 0.32) {
      node("circle", { cx: x(-4), cy: y, r: 8, fill: tok("--fau-mark") }, svg);
      node("circle", { cx: x(0), cy: y, r: 6, fill: tok("--paper"), stroke: tok("--course"), "stroke-width": 3 }, svg);
      text(svg, "x = −4", x(-4), 122, 15, tok("--ink"), "middle", 700);
      text(svg, "zero", x(0), 122, 14, tok("--muted"), "middle");
    }
    if (phase > 0.75) text(svg, "√(x²) = |x| = 4", 240, 244, 20, tok("--act"), "middle", 800);
    if (said) text(svg, said, 240, 281, 14, tok("--muted"), "middle");
  }
  function pascalDraw(svg, n, phase, said) {
    reset(svg, "Pascal row visualizing the coefficients in a binomial expansion");
    text(svg, "Each row adds adjacent entries from the row above", 240, 35, 15, tok("--muted"), "middle");
    var rows = Math.min(n, 5), rowVals = [1];
    for (var r = 0; r <= rows; r++) {
      var gap = Math.min(70, 420 / (r + 1)), start = 240 - gap * r / 2, y = 66 + r * 31;
      rowVals = P.pascalRow(r);
      rowVals.forEach(function (value, k) {
        var focus = r === n && phase > 0.7;
        if (focus) node("circle", { cx: start + k * gap, cy: y - 5, r: 15, fill: tok("--course"), opacity: ".22" }, svg);
        text(svg, String(value), start + k * gap, y, 16, focus ? tok("--act") : tok("--ink"), "middle", focus ? 800 : 500);
      });
    }
    if (phase > 0.82) text(svg, "Row " + n + ":  " + P.pascalRow(n).join("   "), 240, 266, 19, tok("--act"), "middle", 800);
    if (said) text(svg, said, 240, 294, 14, tok("--muted"), "middle");
  }
  function inductionDraw(svg, n, phase, said) {
    reset(svg, "Induction proof illustrated as a starting case followed by a chain of dominoes");
    var y = 108, count = 6, start = 45, gap = 69;
    text(svg, "Start", 45, 44, 14, tok("--muted"));
    for (var i = 0; i < count; i++) {
      var x = start + i * gap, down = phase > (i + 1) / (count + 1);
      box(svg, x, down ? y + 16 : y, 40, 62, down ? tok("--course") : tok("--paper"), down ? tok("--fau-mark") : tok("--line"), 5);
      text(svg, String(i + 1), x + 20, down ? y + 54 : y + 39, 17, down ? tok("--paper") : tok("--ink"), "middle", 700);
      if (i < count - 1) line(svg, x + 40, y + 48, x + gap, y + 48, tok("--line"), 2, "4 4");
    }
    text(svg, "Base case", 45, 206, 14, tok("--ink"));
    text(svg, "Induction step", 246, 206, 14, tok("--ink"));
    if (phase > 0.78) text(svg, "P(n): 1 + ··· + n = n(n+1)/2", 240, 246, 18, tok("--act"), "middle", 800);
    if (said) text(svg, said, 240, 282, 14, tok("--muted"), "middle");
  }
  function point(svg, ev) {
    var p = svg.createSVGPoint(), matrix = svg.getScreenCTM();
    p.x = ev.clientX; p.y = ev.clientY;
    if (matrix) p = p.matrixTransform(matrix.inverse());
    return p;
  }
  function sliderDraw(root, svg, select, update) {
    var values = Array.from(select.options).map(function (o) { return o.value; }), index = Math.max(0, values.indexOf(select.value));
    line(svg, 40, 20, 440, 20, tok("--line"), 2);
    values.forEach(function (_, i) { line(svg, 40 + i * 400 / Math.max(1, values.length - 1), 16, 40 + i * 400 / Math.max(1, values.length - 1), 24, tok("--muted"), 1); });
    var group = node("g", { class: "lab-slider", tabindex: "0", role: "slider", "aria-label": select.parentNode.firstChild.textContent.trim(), "aria-valuemin": 0, "aria-valuemax": values.length - 1, "aria-valuenow": index, "aria-valuetext": select.options[index].text }, svg);
    node("circle", { cx: 40 + index * 400 / Math.max(1, values.length - 1), cy: 20, r: 11, fill: tok("--fau-mark"), stroke: tok("--paper"), "stroke-width": 3 }, group);
    group.addEventListener("keydown", function (ev) {
      var delta = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key];
      if (!delta) return;
      ev.preventDefault();
      var next = Math.max(0, Math.min(values.length - 1, index + delta * (ev.shiftKey ? 2 : 1)));
      if (next !== index) { select.value = values[next]; update(); var handle = svg.querySelector(".lab-slider"); if (handle) handle.focus({ preventScroll: true }); }
    });
    root._sliderConfig = { svg: svg, select: select, values: values, update: update };
  }
  function bindSlider(root, svg, select, update) {
    if (root._sliderBound) return;
    root._sliderBound = true;
    var host = root.querySelector(".stage"), drag = false, pointerId = null;
    host.addEventListener("pointerdown", function (ev) {
      var cfg = root._sliderConfig;
      if (!cfg || !root.classList.contains("sandbox-open")) return;
      var p = point(cfg.svg, ev), i = Math.max(0, cfg.values.indexOf(cfg.select.value)), cx = 40 + i * 400 / Math.max(1, cfg.values.length - 1);
      if (Math.hypot(p.x - cx, p.y - 20) > 30) return;
      drag = true; pointerId = ev.pointerId; host.classList.add("dragging");
      if (ev.isTrusted && host.setPointerCapture) { try { host.setPointerCapture(ev.pointerId); } catch (_) { /* Synthetic pointer events have no browser-owned capture target. */ } }
      ev.preventDefault();
    });
    host.addEventListener("pointermove", function (ev) {
      if (!drag || ev.pointerId !== pointerId) return;
      var cfg = root._sliderConfig, p = point(cfg.svg, ev), i = Math.round(Math.max(0, Math.min(1, (p.x - 40) / 400)) * (cfg.values.length - 1));
      if (cfg.select.value !== cfg.values[i]) { cfg.select.value = cfg.values[i]; cfg.update(); }
    });
    function end(ev) {
      if (!drag || ev.pointerId !== pointerId) return;
      drag = false; pointerId = null; host.classList.remove("dragging");
      if (host.hasPointerCapture && host.hasPointerCapture(ev.pointerId)) host.releasePointerCapture(ev.pointerId);
    }
    host.addEventListener("pointerup", end); host.addEventListener("pointercancel", end);
  }

  // Each answer key is recomputed from the chapter maths; the tests compare it with the typed answer.
  var below = P.sqrt2Bounds(8).lower, irrational = [0, 2, 4, 6, 8].every(function (d) { var b = P.sqrt2Bounds(d); return b.lower * b.lower < 2 && b.upper * b.upper > 2; });
  function gap(d) { var b = P.sqrt2Bounds(d); return b.upper - b.lower; }
  function abs(x) { return Math.abs(x); }
  var solvers = {
    "binary-place-value": function () { return String(P.binaryValue("101101")); },
    "binary-leading-zero": function () { return String(P.binaryValue("00101")); },
    "binary-to-bits": function () { return ["1101", "1011", "1110"].filter(function (b) { return P.binaryValue(b) === 13; })[0]; },
    "binary-next-power": function () { return String(P.binaryValue("10000")); },
    "supremum-not-maximum": function () { return irrational ? "no" : "yes"; },
    "rational-gap": function () { return irrational ? "missing-sup" : "no-bound"; },
    "upper-bound": function () { return [["one", 1], ["sqrt2", Math.SQRT2], ["half", 0.5]].filter(function (c) { return c[1] >= below; })[0][0]; },
    "bound-tightening": function () { return gap(4) < gap(2) ? "shrinks" : "same"; },
    "distance-interval": function () { return P.distanceInterval(2, 3).join("to"); },
    "absolute-square-root": function () { return String(Math.sqrt(-4 * -4)); },
    "absolute-strict": function () { var i = P.distanceInterval(1, 2); return abs(i[0] - 1) < 2 ? "closed" : "open"; },
    "absolute-outside": function () { return abs(-3) >= 2 && abs(3) >= 2 && !(abs(0) >= 2) ? "outside" : "middle"; },
    "choose-five-two": function () { return String(P.choose(5, 2)); },
    "binomial-coefficient": function () { return String(P.choose(3, 1) * 2); },
    "pascal-neighbor": function () { return String(P.choose(4, 1) + P.choose(4, 2)); },
    "binomial-ends": function () { var r = P.pascalRow(6); return r[0] === 1 && r[6] === 1 ? "one" : "six"; },
    "induction-base": function () { return P.sumFormula(1) === 1 ? "n1" : "n0"; },
    "induction-hypothesis": function () { return "hypothesis"; },
    "induction-next": function () { for (var n = 1; n <= 20; n++) if (P.sumFormula(n) + n + 1 !== (n + 1) * (n + 2) / 2) return "wrong"; return "next"; },
    "induction-no-base": function () { return "step"; },
  };
  function challenge(id, prompt, options, answer, ref, short, why, stageFn) {
    return { id: id, prompt: prompt, options: options, answer: answer, ref: ref, short: short, why: why, draw: stageFn, solve: solvers[id] };
  }
  var data = {
    binary: [
      challenge("binary-place-value", "What integer is [101101]₂?", [["43", "43"], ["45", "45"], ["53", "53"]], "45", "2.1", "Binary place values", "The 1-bits mark 2⁵, 2³, 2² and 2⁰. Their sum is 32+8+4+1=45; read each bit against its place, not as a decimal digit string.", function (s, p) { binaryDraw(s, "101101", p); }),
      challenge("binary-leading-zero", "What value does [00101]₂ represent?", [["5", "5"], ["101", "101"], ["4", "4"]], "5", "2.1", "Leading zero", "The leading zero adds no power-of-two contribution. The remaining 2²+2⁰ gives 5, so leading zeroes change the written width but not the value.", function (s, p) { binaryDraw(s, "00101", p); }),
      challenge("binary-to-bits", "Which binary numeral represents decimal 13?", [["1101", "[1101]₂"], ["1011", "[1011]₂"], ["1110", "[1110]₂"]], "1101", "2.1", "Convert into binary", "13=8+4+1, so the 2³, 2² and 2⁰ positions are on: [1101]₂. A place-value sum is a useful check after conversion.", function (s, p) { binaryDraw(s, "1101", p); }),
      challenge("binary-next-power", "In [10000]₂, what is the value of the leftmost 1?", [["8", "8"], ["16", "16"], ["4", "4"]], "16", "2.1", "Power of two", "The leftmost bit in a five-place numeral marks 2⁴=16. Place values start at 2⁰ on the right and double as you move left.", function (s, p) { binaryDraw(s, "10000", p); }),
    ],
    bounds: [
      challenge("supremum-not-maximum", "For M={q∈ℚ : q≥0 and q²<2}, is √2 a member of M?", [["yes", "Yes, it is the maximum"], ["no", "No; it is the supremum"], ["none", "M has no upper bound"]], "no", "2.2", "Supremum versus maximum", "Every q in M is below √2, and rational values in M can approach √2 as closely as desired. But √2 is irrational, so it is not an element of M: it is the supremum, not a maximum.", function (s, p) { boundsDraw(s, 3, p); }),
      challenge("rational-gap", "Why does ℚ fail the completeness axiom for M above?", [["no-bound", "M has no rational upper bounds"], ["missing-sup", "Its least upper bound is not rational"], ["empty", "M is empty"]], "missing-sup", "2.2", "The rational gap", "M is non-empty and bounded above by rational numbers such as 2, but its least upper bound is √2, which is not rational. Completeness guarantees such a bound exists inside the number system.", function (s, p) { boundsDraw(s, 2, p); }),
      challenge("upper-bound", "Which is an upper bound for M={q∈ℚ:q≥0,q²<2}?", [["one", "1"], ["sqrt2", "√2"], ["half", "1/2"]], "sqrt2", "2.2", "Upper bound", "No element of M exceeds √2 because q²<2 and q≥0 imply q<√2. The values 1 and 1/2 are not upper bounds because M contains larger rationals.", function (s, p) { boundsDraw(s, 1, p); }),
      challenge("bound-tightening", "As decimal lower bounds to √2 use more places, what happens to the gap to the matching upper bound?", [["widens", "It widens"], ["shrinks", "It shrinks"], ["same", "It stays the same"]], "shrinks", "2.2", "Tighter rational bounds", "At d decimal places, these neighboring rationals differ by 10⁻ᵈ. Increasing d shrinks the interval while keeping √2 between them, illustrating why no rational below it is the least upper bound.", function (s, p) { boundsDraw(s, 4, p); }),
    ],
    distance: [
      challenge("distance-interval", "Solve |x−2|≤3 as an interval.", [["-1to5", "−1≤x≤5"], ["2to5", "2≤x≤5"], ["-3to3", "−3≤x≤3"]], "-1to5", "2.3", "Distance interval", "A point within 3 units of 2 lies from 2−3 to 2+3, including both endpoints: [−1,5]. Absolute value is distance, so the center shifts both endpoints.", function (s, p) { distanceDraw(s, 2, 3, p); }),
      challenge("absolute-square-root", "For x=−4, what is √(x²)?", [["minus4", "−4"], ["4", "4"], ["16", "16"]], "4", "2.3", "Square root of a square", "The principal square root is non-negative, so √(x²)=|x|=4. The identity √(x²)=x fails for negative x.", squareRootDraw),
      challenge("absolute-strict", "What does |x−1|<2 give?", [["open", "−1<x<3"], ["closed", "−1≤x≤3"], ["outside", "x<−1 or x>3"]], "open", "2.3", "Strict distance bound", "A strict distance less than 2 excludes the endpoints 1−2 and 1+2. Replacing < with ≤ would include both boundary points.", function (s, p) { distanceDraw(s, 1, 2, p); }),
      challenge("absolute-outside", "Which condition describes points at least 2 units from 0?", [["middle", "−2≤x≤2"], ["outside", "x≤−2 or x≥2"], ["positive", "x≥2 only"]], "outside", "2.3", "Absolute value outside", "|x|≥2 means x is at least 2 units away from zero in either direction. It is the union of two rays, not the interval between −2 and 2.", function (s, p) { distanceDraw(s, 0, 2, p); }),
    ],
    binomial: [
      challenge("choose-five-two", "How many 2-element subsets can be chosen from 5 distinct elements?", [["20", "20"], ["10", "10"], ["25", "25"]], "10", "2.4", "Choose 2 from 5", "Order does not matter, so C(5,2)=5!/(2!3!)=10. The 20 counts the two orders of each selection.", function (s, p) { pascalDraw(s, 5, p); }),
      challenge("binomial-coefficient", "What is the coefficient of x² in (x+2)³?", [["6", "6"], ["12", "12"], ["8", "8"]], "6", "2.4", "Read an expansion coefficient", "The x² term is C(3,1)x²·2=6x², so its coefficient is 6. The full expansion is x³+6x²+12x+8.", function (s, p) { pascalDraw(s, 3, p); }),
      challenge("pascal-neighbor", "Using Pascal’s identity, what is C(5,2)=C(4,1)+C(4,2)?", [["10", "10"], ["8", "8"], ["6", "6"]], "10", "2.4", "Pascal addition", "The two parent entries are 4 and 6, which add to 10. Pascal’s identity builds each interior coefficient from its two neighbors above.", function (s, p) { pascalDraw(s, 5, p); }),
      challenge("binomial-ends", "What are the first and last coefficients in the expansion of (a+b)⁶?", [["six", "6 and 6"], ["one", "1 and 1"], ["zero", "0 and 0"]], "one", "2.4", "End coefficients", "The end coefficients are C(6,0)=1 and C(6,6)=1. They multiply a⁶ and b⁶; each comes from choosing all factors the same way.", function (s, p) { pascalDraw(s, 6, p); }),
    ],
    induction: [
      challenge("induction-base", "To prove 1+···+n=n(n+1)/2 for n≥1, what should the base case check?", [["n0", "n=0 only"], ["n1", "n=1"], ["step", "Assume the formula for n+1"]], "n1", "2.5", "Start the induction", "The stated domain begins at n=1, and both sides equal 1 there. The base case must match the first value in the claim’s domain.", function (s, p) { inductionDraw(s, 5, p); }),
      challenge("induction-hypothesis", "In the step from n to n+1, what may you assume?", [["all", "The result is true for every integer"], ["hypothesis", "It holds for this arbitrary n"], ["next", "It already holds for n+1"]], "hypothesis", "2.5", "Use the induction hypothesis", "Assume the statement for an arbitrary n in the domain, then derive it for n+1. Assuming the next case would make the proof circular.", function (s, p) { inductionDraw(s, 4, p); }),
      challenge("induction-next", "If 1+···+n=n(n+1)/2, which expression is 1+···+n+(n+1)?", [["wrong", "n(n+1)/2"], ["next", "(n+1)(n+2)/2"], ["double", "(n+1)(n+2)"]], "next", "2.5", "Derive the next case", "Add n+1 to the induction hypothesis: n(n+1)/2+(n+1)=(n+1)(n+2)/2. Factoring n+1 exposes the target formula at n+1.", function (s, p) { inductionDraw(s, 5, p); }),
      challenge("induction-no-base", "Why is an induction step alone not enough to prove a claim for every n≥1?", [["step", "The chain has no established starting truth"], ["infinite", "There are infinitely many cases"], ["algebra", "Algebra cannot be used"]], "step", "2.5", "Base case matters", "The implication P(n)⇒P(n+1) only carries truth forward if some first P(n) is known to be true. Without the base case, the chain may never start.", function (s, p) { inductionDraw(s, 3, p); }),
    ],
  };

  var names = ["binary", "bounds", "distance", "binomial", "induction"];
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), visual = stage(id), control = root.querySelector("[data-control]");
    function setup(c) { root.classList.remove("sandbox-open"); c.stage(); }
    function sandbox() {
      root.classList.add("sandbox-open");
      function update() {
        if (id === "binary") binaryDraw(visual, control.value, 1);
        else if (id === "bounds") boundsDraw(visual, +control.value, 1);
        else if (id === "distance") distanceDraw(visual, +root.querySelector("[data-control='center']").value, +root.querySelector("[data-control='radius']").value, 1);
        else if (id === "binomial") pascalDraw(visual, +control.value, 1);
        else inductionDraw(visual, +control.value, 1);
      }
      // The sandbox is driven by the labelled controls under the stage; the unlabelled slider strip that used to sit
      // on top of the drawing duplicated them and covered the Pascal caption, so it is no longer drawn.
      if (!root._sandboxBound) { root._sandboxBound = true; root.querySelectorAll("[data-control]").forEach(function (el) { el.addEventListener("change", update); }); }
      update();
    }
    Lab.experiment({ id: id, title: title, card: root.querySelector(".challenge"), lock: function () {}, setup: setup, sandbox: sandbox, challenges: data[id].map(function (ch) {
      var said = null;
      function draw(phase) { ch.draw(visual, phase, said); }
      return Object.assign({}, ch, {
        stage: function () { said = null; draw(0); },
        preview: function (choice) { said = ch.options.filter(function (o) { return o[0] === choice; })[0][1]; draw(0); },
        reveal: function () { return Lab.tween(1400, draw).then(function () { draw(1); }); },
      });
    }) });
  }
  register(names[0], "2.1 Number systems and binary");
  register(names[1], "2.2 Suprema and completeness");
  register(names[2], "2.3 Absolute value and inequalities");
  register(names[3], "2.4 Binomial coefficients");
  register(names[4], "2.5 Mathematical induction");
})();
