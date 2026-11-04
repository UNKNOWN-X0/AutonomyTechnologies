/* MEI Chapter 3 experiments: mappings, inverses, composition, functions, and polar coordinates. */
(function () {
  var P = window.MEI3, ns = "http://www.w3.org/2000/svg";
  function tok(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
  function node(tag, attrs, parent) {
    var el = document.createElementNS(ns, tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    parent.appendChild(el); return el;
  }
  function text(svg, words, x, y, size, color, anchor, weight) {
    var el = node("text", { x: x, y: y, fill: color || tok("--ink"), "font-size": size || 16, "font-family": "var(--f-display)", "text-anchor": anchor || "start" }, svg);
    if (weight) el.setAttribute("font-weight", weight);
    el.textContent = words; return el;
  }
  function line(svg, x1, y1, x2, y2, color, width, dash) {
    return node("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || tok("--line"), "stroke-width": width || 2, "stroke-dasharray": dash || "" }, svg);
  }
  function reset(svg, label) { svg.innerHTML = ""; svg.setAttribute("role", "img"); svg.setAttribute("aria-label", label); }
  function stage(id) { return document.querySelector("[data-visual='" + id + "']"); }
  function prediction(svg, said) { if (said) text(svg, "Your prediction: " + said, 280, 346, 13, tok("--muted"), "middle"); }
  function mappingDraw(svg, rule, phase, said) {
    reset(svg, "Finite mapping with arrows from domain inputs to codomain outputs");
    var m = typeof rule === "object" ? rule : P.mapping(rule), yy = function (i, n) { return 76 + (n <= 1 ? 0 : i * 205 / (n - 1)); };
    text(svg, "Domain X", 95, 40, 15, tok("--muted"), "middle", 700); text(svg, "Codomain Y", 457, 40, 15, tok("--muted"), "middle", 700);
    m.pairs.forEach(function (p, i) {
      var from = yy(i, m.domain.length), to = yy(m.codomain.indexOf(p[1]), m.codomain.length), x2 = 424;
      line(svg, 126, from, 410, to, tok("--fau-mark"), 2, phase < (i + 1) / (m.pairs.length + 1) ? "5 5" : "");
      node("circle", { cx: 95, cy: from, r: 17, fill: tok("--paper"), stroke: tok("--course"), "stroke-width": 2 }, svg);
      text(svg, String(p[0]), 95, from + 5, 14, tok("--ink"), "middle", 700);
    });
    m.codomain.forEach(function (v, i) {
      var incoming = m.image.indexOf(v) !== -1;
      node("circle", { cx: 457, cy: yy(i, m.codomain.length), r: 18, fill: incoming ? tok("--course") : tok("--paper"), stroke: incoming ? tok("--fau-mark") : tok("--line"), "stroke-width": 2 }, svg);
      text(svg, String(v), 457, yy(i, m.codomain.length) + 5, 14, incoming ? tok("--paper") : tok("--muted"), "middle", 700);
    });
    if (phase > .82) text(svg, m.note || "Injective: " + (m.injective ? "yes" : "no") + "     Surjective: " + (m.surjective ? "yes" : "no"), 280, 316, 16, tok("--act"), "middle", 800);
    prediction(svg, said);
  }
  function graphDraw(svg, kind, phase, said) {
    reset(svg, "Function graph and the diagonal used to visualize an inverse");
    var left = 136, right = 424, top = 48, bottom = 336;
    function X(x) { return left + (x + 3) * 32; }
    function Y(y) { return bottom - (y + 3) * 32; }
    line(svg, X(-3), Y(0), X(6), Y(0)); line(svg, X(0), Y(-3), X(0), Y(6));
    line(svg, X(-3), Y(-3), X(6), Y(6), tok("--muted"), 1.5, "5 5");
    var pts = [], n = 90;
    for (var i = 0; i <= n; i++) {
      var x = kind === "cosine" ? Math.PI * i / n : -2 + 4 * i / n;
      if (kind === "restricted" && x < 0) continue;
      var y = kind === "affine" ? 2 * x + 3 : kind === "cosine" ? Math.cos(x) : x * x;
      if (y < -2 || y > 6) continue;
      pts.push((pts.length ? "L" : "M") + X(x) + " " + Y(y));
    }
    node("path", { d: pts.join(" "), fill: "none", stroke: tok("--course"), "stroke-width": 3 }, svg);
    if (kind === "restricted" || kind === "affine") {
      var inverse = [], active = false;
      for (var j = 0; j <= n; j++) {
        var ix, iy;
        if (kind === "restricted") { ix = 3 * j / n; iy = Math.sqrt(ix); }
        else { var ox = -2 + 2 * j / n; ix = 2 * ox + 3; iy = ox; }
        if (ix < -3 || ix > 3 || iy < -2 || iy > 6) { active = false; continue; }
        inverse.push((active ? "L" : "M") + X(ix) + " " + Y(iy)); active = true;
      }
      node("path", { d: inverse.join(" "), fill: "none", stroke: tok("--fau-mark"), "stroke-width": 2.5, "stroke-dasharray": "6 4" }, svg);
    }
    if (kind !== "affine" && phase > .55) line(svg, X(kind === "cosine" ? 0 : -2), Y(1), X(kind === "cosine" ? Math.PI : 2), Y(1), tok("--act"), 2, phase > .82 ? "" : "6 5");
    if (phase > .82) text(svg, kind === "restricted" ? "one input for each output · inverse √y" : kind === "affine" ? "reflect across y=x · inverse (y−3)/2" : kind === "cosine" ? "cos: [0,π] → [−1,1] · strictly decreasing" : "y=1 meets twice · no inverse on [−2,2]", 280, 316, 15, tok("--act"), "middle", 800);
    prediction(svg, said);
  }
  function compositionDraw(svg, order, phase, said, x) {
    reset(svg, "Input passing through functions in sequence");
    x = x == null ? 2 : x;
    if (order === "triple") {
      var tx = [45, 130, 215, 300, 385, 500], tv = ["1", "f", "2", "g", "4", "h"];
      text(svg, "input", tx[0], 105, 14, tok("--muted"), "middle"); text(svg, "first rule", tx[1], 105, 14, tok("--muted"), "middle"); text(svg, "then", tx[3], 105, 14, tok("--muted"), "middle"); text(svg, "then", tx[5], 105, 14, tok("--muted"), "middle");
      text(svg, "f(x)=x+1", tx[1], 139, 12, tok("--ink"), "middle"); text(svg, "g(u)=2u", tx[3], 139, 12, tok("--ink"), "middle"); text(svg, "h(v)=v²", tx[5], 139, 12, tok("--ink"), "middle");
      for (var j = 0; j < tx.length; j++) {
        if (j < tx.length - 1) line(svg, tx[j] + 25, 184, tx[j + 1] - 25, 184, j < tx.length * phase ? tok("--fau-mark") : tok("--line"), 3);
        node("circle", { cx: tx[j], cy: 184, r: j % 2 ? 32 : 24, fill: j < tx.length * phase ? tok("--course") : tok("--paper"), stroke: tok("--line"), "stroke-width": 2 }, svg);
        text(svg, tv[j], tx[j], 189, tv[j].length > 10 ? 10 : 12, j < tx.length * phase ? tok("--paper") : tok("--ink"), "middle", 700);
      }
      if (phase > .82) text(svg, "h(g(f(1))) = h(2·2) = 4² = 16", 280, 270, 16, tok("--act"), "middle", 800);
      prediction(svg, said); return;
    }
    var invalid = order === "domain", first = invalid ? "g(t)=t−1" : order === "gof" ? "f(x)=2x+1" : "g(x)=x²", second = invalid ? "f(u)=u², u≥0" : order === "gof" ? "g(u)=u²" : "f(u)=2u+1";
    var mid = invalid ? x - 1 : order === "gof" ? 2 * x + 1 : x * x, out = invalid && mid < 0 ? null : order === "gof" ? mid * mid : order === "fog" ? 2 * mid + 1 : mid * mid;
    text(svg, "input", 52, 80, 14, tok("--muted"), "middle"); text(svg, "first rule", 210, 80, 14, tok("--muted"), "middle"); text(svg, "intermediate", 350, 80, 14, tok("--muted"), "middle"); text(svg, "second rule", 468, 80, 14, tok("--muted"), "middle");
    var cols = [52, 145, 274, 374, 500], vals = [String(x), invalid || order === "fog" ? "g" : "f", String(mid), invalid || order === "gof" ? "g" : "f", out == null ? "undefined" : String(out)];
    for (var i = 0; i < cols.length; i++) {
      if (i < cols.length - 1) line(svg, cols[i] + 28, 176, cols[i + 1] - 30, 176, i < 4 * phase ? tok("--fau-mark") : tok("--line"), 3, invalid && i === 2 ? "6 5" : "");
      node("circle", { cx: cols[i], cy: 176, r: 25, fill: i === 4 && out == null ? tok("--paper") : i < 4 * phase ? tok("--course") : tok("--paper"), stroke: i === 4 && out == null ? tok("--act") : tok("--line"), "stroke-width": 2 }, svg);
      text(svg, vals[i], cols[i], 181, vals[i].length > 8 ? 10 : 13, i < 4 * phase ? tok("--paper") : tok("--ink"), "middle", 700);
    }
    if (phase > .82) text(svg, invalid && out == null ? "The chain stops: the intermediate value is outside D(f)." : "Result = " + out + " · the order determines the value.", 280, 253, 15, tok("--act"), "middle", 800);
    prediction(svg, said);
  }
  function elementaryDraw(svg, family, phase, said) {
    reset(svg, "Sampled graph of a polynomial, sine, exponential, or logarithm");
    var left = 58, right = 500, top = 52, bottom = 292;
    function X(x) { return left + (x + 3) * (right - left) / 6; }
    function Y(y) { return family === "quadratic" ? bottom - (y + 4) * (bottom - top) / 10 : bottom - (y + 2) * (bottom - top) / 8; }
    line(svg, X(-3), Y(0), X(3), Y(0)); line(svg, X(0), Y(family === "quadratic" ? -4 : -2), X(0), Y(6));
    var pts = [], n = 130, active = false;
    for (var i = 0; i <= n; i++) {
      var x = -3 + 6 * i / n, y;
      if (family === "quadratic") y = x * x - 2 * x - 3;
      else if (family === "sine") y = Math.sin(x);
      else if (family === "exponential") y = Math.exp(x);
      else if (family === "tangent") y = Math.tan(x);
      else { if (x <= 0) { active = false; continue; } y = Math.log(x); }
      if (y < (family === "quadratic" ? -4 : -2) || y > 6) { active = false; continue; }
      pts.push((active ? "L" : "M") + X(x) + " " + Y(y)); active = true;
    }
    node("path", { d: pts.join(" "), fill: "none", stroke: tok("--course"), "stroke-width": 3 }, svg);
    if (phase > .82) {
      var msg = family === "quadratic" ? "Δ=16 · roots −1 and 3" : family === "sine" ? "period 2π · values repeat" : family === "tangent" ? "tan x undefined at π/2 + kπ" : family === "exponential" ? "eˣ>0 · inverse ln x" : "domain x>0 · inverse eˣ";
      text(svg, msg, 280, 323, 16, tok("--act"), "middle", 800);
    }
    prediction(svg, said);
  }
  function polarDraw(svg, angle, radius, phase, said) {
    reset(svg, "Polar radius with its Cartesian horizontal and vertical components");
    var cx = 280, cy = 184, scale = 48, x = cx + scale * radius * Math.cos(angle), y = cy - scale * radius * Math.sin(angle);
    line(svg, 52, cy, 508, cy); line(svg, cx, 48, cx, 316);
    line(svg, cx, cy, cx + (x - cx) * phase, cy + (y - cy) * phase, tok("--course"), 4);
    line(svg, x, y, x, cy, tok("--fau-mark"), 2, "5 5"); line(svg, x, y, cx, y, tok("--fau-mark"), 2, "5 5");
    node("circle", { cx: x, cy: y, r: 9, fill: tok("--act"), stroke: tok("--paper"), "stroke-width": 3 }, svg);
    if (phase > .82) {
      var c = P.polarToCartesian(radius, angle);
      text(svg, "r=" + radius + "   φ=" + angle.toFixed(2) + " rad", 280, 45, 15, tok("--ink"), "middle", 700);
      text(svg, "x=" + c.x.toFixed(2) + "   y=" + c.y.toFixed(2), 280, 320, 16, tok("--act"), "middle", 800);
    }
    prediction(svg, said);
  }
  function relationDraw(svg, phase, said) {
    reset(svg, "Relation y squared equals x: the input four has outputs two and minus two");
    var x = 350, y1 = 116, y2 = 244;
    line(svg, 105, 180, 470, 180); line(svg, 155, 65, 155, 300);
    line(svg, x, 68, x, 294, tok("--act"), 2, "6 5");
    if (phase > .15) {
      node("circle", { cx: x, cy: y1, r: 9, fill: tok("--course"), stroke: tok("--paper"), "stroke-width": 3 }, svg);
      node("circle", { cx: x, cy: y2, r: 9, fill: tok("--course"), stroke: tok("--paper"), "stroke-width": 3 }, svg);
      text(svg, "(4, 2)", x + 20, y1 + 5, 14, tok("--ink")); text(svg, "(4, −2)", x + 20, y2 + 5, 14, tok("--ink"));
    }
    if (phase > .82) text(svg, "one x-value, two y-values · not a function", 280, 320, 15, tok("--act"), "middle", 800);
    prediction(svg, said);
  }
  function point(svg, ev) {
    var p = svg.createSVGPoint(), matrix = svg.getScreenCTM(); p.x = ev.clientX; p.y = ev.clientY;
    if (matrix) p = p.matrixTransform(matrix.inverse()); return p;
  }
  function slider(root, svg, select, update) {
    var values = Array.from(select.options).map(function (o) { return o.value; }), i = Math.max(0, values.indexOf(select.value)), x = 40 + i * 480 / Math.max(1, values.length - 1);
    line(svg, 40, 24, 520, 24, tok("--line"), 2);
    var handle = node("g", { class: "lab-slider", tabindex: "0", role: "slider", "aria-label": select.parentNode.firstChild.textContent.trim(), "aria-valuemin": 0, "aria-valuemax": values.length - 1, "aria-valuenow": i, "aria-valuetext": select.options[i].text }, svg);
    node("circle", { cx: x, cy: 24, r: 11, fill: tok("--fau-mark"), stroke: tok("--paper"), "stroke-width": 3 }, handle);
    handle.addEventListener("keydown", function (ev) {
      var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key]; if (!d) return;
      ev.preventDefault(); var n = Math.max(0, Math.min(values.length - 1, i + d * (ev.shiftKey ? 2 : 1)));
      if (n !== i) { select.value = values[n]; update(); var h = svg.querySelector(".lab-slider"); if (h) h.focus({ preventScroll: true }); }
    });
    root._sliderConfig = { svg: svg, select: select, values: values, update: update };
  }
  function bindSlider(root) {
    if (root._sliderBound) return; root._sliderBound = true;
    var host = root.querySelector(".stage"), drag = false, pointerId = null;
    host.addEventListener("pointerdown", function (ev) {
      var cfg = root._sliderConfig; if (!cfg || !root.classList.contains("sandbox-open")) return;
      var p = point(cfg.svg, ev), i = Math.max(0, cfg.values.indexOf(cfg.select.value)), cx = 40 + i * 480 / Math.max(1, cfg.values.length - 1);
      if (Math.hypot(p.x - cx, p.y - 24) > 30) return;
      drag = true; pointerId = ev.pointerId; host.classList.add("dragging");
      if (ev.isTrusted && host.setPointerCapture) { try { host.setPointerCapture(ev.pointerId); } catch (_) { /* Synthetic pointer events have no browser-owned capture target. */ } }
      ev.preventDefault();
    });
    host.addEventListener("pointermove", function (ev) {
      if (!drag || ev.pointerId !== pointerId) return;
      var cfg = root._sliderConfig, p = point(cfg.svg, ev), i = Math.round(Math.max(0, Math.min(1, (p.x - 40) / 480)) * (cfg.values.length - 1));
      if (cfg.select.value !== cfg.values[i]) { cfg.select.value = cfg.values[i]; cfg.update(); }
    });
    function end(ev) {
      if (!drag || ev.pointerId !== pointerId) return; drag = false; pointerId = null; host.classList.remove("dragging");
      if (host.hasPointerCapture && host.hasPointerCapture(ev.pointerId)) host.releasePointerCapture(ev.pointerId);
    }
    host.addEventListener("pointerup", end); host.addEventListener("pointercancel", end);
  }
  function option(key, label) { return [key, label]; }
  function ch(id, ref, short, prompt, options, answer, why, draw, solve) {
    return { id: id, ref: ref, short: short, prompt: prompt, options: options, answer: answer, why: why, draw: draw, solve: solve };
  }
  var data = {
    mappings: [
      ch("mapping-collision", "3.2", "Collision and onto", "For x² from {−2,−1,0,1,2} to {0,1,4}, which description fits?", [option("both", "Injective and surjective"), option("surj", "Surjective, not injective"), option("inj", "Injective, not surjective"), option("neither", "Neither")], "surj", "The image is {0,1,4}, so every codomain value is reached. But −2 and 2 share an output, so the mapping is not injective.", function (s, p, g) { mappingDraw(s, "square", p, g); }, function () { var m = P.mapping("square"); return !m.injective && m.surjective ? "surj" : "neither"; }),
      ch("mapping-codomain", "3.2", "Codomain matters", "For x² from {−1,0,1} to {0,1,4,9}, is it bijective?", [option("onto", "Yes; the image equals the codomain"), option("surj", "No; it is onto but not one-to-one"), option("neither", "No; it is neither injective nor surjective")], "neither", "The inputs −1 and 1 collide, so the map is not injective. Its image {0,1} also misses 4 and 9 in the stated codomain.", function (s, p, g) { mappingDraw(s, "square-gap", p, g); }, function () { var m = P.mapping("square-gap"); return !m.injective && !m.surjective ? "neither" : "onto"; }),
      ch("mapping-relation", "3.1", "Function or relation?", "Does y²=x define y as a function of x over the reals?", [option("no", "No; x=4 has two y-values"), option("yes", "Yes; every x has one y"), option("zero", "Only x=0 has an output")], "no", "At x=4, both y=2 and y=−2 satisfy the relation. One input with two outputs breaks the definition of a function.", function (s, p, g) { relationDraw(s, p, g); }, function () { return P.relationValues(4).length > 1 ? "no" : "yes"; }),
      ch("mapping-bijection", "3.2", "A bijection", "For x+1 from {0,1,2} to {1,2,3}, what type of mapping is it?", [option("onto", "Onto but not injective"), option("bijective", "Bijective"), option("inj", "Injective but not onto")], "bijective", "The outputs 1, 2, and 3 each occur exactly once. The map is both injective and surjective for this codomain.", function (s, p, g) { mappingDraw(s, "shift", p, g); }, function () { var m = P.mapping("shift"); return m.injective && m.surjective ? "bijective" : "onto"; }),
    ],
    inverse: [
      ch("inverse-affine", "3.3", "Reverse a linear map", "If f(x)=2x+3, what input has output 11?", [option("3", "3"), option("6", "6"), option("4", "4")], "4", "Solve 2x+3=11, giving x=4. The inverse rule is f⁻¹(y)=(y−3)/2.", function (s, p, g) { graphDraw(s, "affine", p, g); }, function () { return String(P.inverseAffine(2, 3, 11)); }),
      ch("inverse-square", "3.3", "Domain restriction", "For f(x)=x² with domain [0,∞), which is its inverse?", [option("plusminus", "±√y"), option("square", "y²"), option("sqrt", "√y for y≥0")], "sqrt", "On the non-negative domain, each y≥0 has exactly one input √y. The domain restriction removes the negative branch that would make the inverse ambiguous.", function (s, p, g) { graphDraw(s, "restricted", p, g); }, function () { return P.inverseSquare(9) === 3 ? "sqrt" : "square"; }),
      ch("inverse-collision", "3.3", "Horizontal line test", "Can x² on [−2,2] have an inverse function with its full image as domain?", [option("yes", "Yes; every output has one input"), option("no", "No; positive outputs have two inputs"), option("zero", "Only at zero")], "no", "For example, output 1 comes from both −1 and 1. Reversing x² on [−2,2] would assign two values to one input, so it is not a function.", function (s, p, g) { graphDraw(s, "square", p, g); }, function () { return P.squarePreimages(1, -2, 2).length > 1 ? "no" : "yes"; }),
      ch("inverse-cosine", "3.5", "Principal interval", "On [0,π], does cosine have a unique inverse value for every output in [−1,1]?", [option("no", "No; cosine repeats within [0,π]"), option("zero", "Only for output 0"), option("yes", "Yes; it is strictly decreasing")], "yes", "Cosine decreases from 1 to −1 on [0,π], so every value in [−1,1] occurs once. The restricted interval makes arccos well-defined.", function (s, p, g) { graphDraw(s, "cosine", p, g); }, function () { return P.strictlyDecreasing(Math.cos, 0, Math.PI) ? "yes" : "no"; }),
    ],
    composition: [
      ch("composition-gof", "3.4", "Apply f, then g", "With f(x)=2x+1 and g(x)=x², what is (g∘f)(2)?", [option("25", "25"), option("9", "9"), option("16", "16")], "25", "First f(2)=5, then g(5)=25. Read g∘f from right to left: f is applied before g.", function (s, p, g) { compositionDraw(s, "gof", p, g, 2); }, function () { return String(P.composition(2, "gof")); }),
      ch("composition-fog", "3.4", "Order changes the result", "For the same f and g, what is (f∘g)(2)?", [option("25", "25"), option("9", "9"), option("5", "5")], "9", "First g(2)=4, then f(4)=9. Reversing the order gives 25, so composition is generally not commutative.", function (s, p, g) { compositionDraw(s, "fog", p, g, 2); }, function () { return String(P.composition(2, "fog")); }),
      ch("composition-domain", "3.4", "Check the intermediate domain", "Let g(t)=t−1 for t≥0 and f(u)=u² only for u≥0. Is f∘g defined for every t≥0?", [option("yes", "Yes; f squares every real"), option("one", "Only at t=1"), option("no", "No; g(t)<0 for 0≤t<1")], "no", "For every t in [0,1), g(t)=t−1 is negative and is outside f’s domain. The composition is defined only for t≥1.", function (s, p, g) { compositionDraw(s, "domain", p, g, .5); }, function () { return P.fogDefined(0.5) ? "yes" : "no"; }),
      ch("composition-associative", "3.4", "Association and order", "Let f(x)=x+1, g(x)=2x, h(x)=x². What is h(g(f(1)))?", [option("16", "16"), option("9", "9"), option("25", "25")], "16", "The chain gives f(1)=2, g(2)=4, and h(4)=16. Parentheses may move by associativity, but the function order stays the same.", function (s, p, g) { compositionDraw(s, "triple", p, g, 1); }, function () { return String(P.chain(1, [function (x) { return x + 1; }, function (x) { return 2 * x; }, function (x) { return x * x; }])); }),
    ],
    elementary: [
      ch("elementary-quadratic", "3.5", "Discriminant and roots", "How many real roots does x²−2x−3=0 have?", [option("one", "One repeated root"), option("two", "Two distinct roots"), option("none", "No real roots")], "two", "The discriminant is (−2)²−4(1)(−3)=16>0, so there are two distinct real roots, −1 and 3.", function (s, p, g) { elementaryDraw(s, "quadratic", p, g); }, function () { return P.roots(1, -2, -3).length === 2 ? "two" : "none"; }),
      ch("elementary-sine", "3.5", "Double-angle identity", "Using sin(2x)=2sin x cos x, what is sin(π/3)?", [option("1/2", "1/2"), option("1", "1"), option("sqrt3/2", "√3/2")], "sqrt3/2", "Set x=π/6. Then 2·(1/2)·(√3/2)=√3/2, matching the unit circle at π/3.", function (s, p, g) { elementaryDraw(s, "sine", p, g); }, function () { return Math.abs(2 * Math.sin(Math.PI / 6) * Math.cos(Math.PI / 6) - Math.sin(Math.PI / 3)) < 1e-12 ? "sqrt3/2" : "1/2"; }),
      ch("elementary-log-domain", "3.5", "Logarithm domain", "Which statement about ln(−1) over the reals is correct?", [option("undefined", "It is undefined"), option("zero", "It equals 0"), option("one", "It equals 1")], "undefined", "The real logarithm requires a positive input. Since −1 is not positive, ln(−1) has no real value.", function (s, p, g) { elementaryDraw(s, "logarithm", p, g); }, function () { return P.logDefined(-1) ? "zero" : "undefined"; }),
      ch("elementary-tangent", "3.5", "Tangent domain", "At which listed angle is tan x undefined?", [option("pi4", "π/4"), option("pi2", "π/2"), option("pi3", "π/3")], "pi2", "Tangent is sin x/cos x, so it is undefined when cos x=0: x=π/2+kπ for integer k.", function (s, p, g) { elementaryDraw(s, "tangent", p, g); }, function () { return P.tanUndefined(Math.PI / 2) ? "pi2" : "pi4"; }),
    ],
    polar: [
      ch("polar-quadrant", "3.6", "Choose the quadrant", "Convert (x,y)=(−√3,−1) using r≥0 and 0≤φ<2π.", [option("5", "(2, 5π/6)"), option("pi6", "(2, π/6)"), option("7", "(2, 7π/6)")], "7", "The radius is √(3+1)=2. arctan(y/x)=arctan(1/√3)=π/6, but both coordinates are negative, so the point is in quadrant III: φ=π/6+π=7π/6.", function (s, p, g) { polarDraw(s, 7 * Math.PI / 6, 2, p, g); }, function () { var v = P.cartesianToPolar(-Math.sqrt(3), -1); return Math.abs(v.r - 2) < 1e-10 && Math.abs(v.phi - 7 * Math.PI / 6) < 1e-10 ? "7" : "pi6"; }),
      ch("polar-components", "3.6", "Cartesian components", "For (r,φ)=(2,5π/6), what is (x,y)?", [option("sign", "(√3, 1)"), option("right", "(−√3, 1)"), option("swap", "(1, −√3)")], "right", "Use x=r cosφ=2·(−√3/2)=−√3 and y=r sinφ=2·(1/2)=1. The angle 5π/6 is in quadrant II, so x is negative and y positive.", function (s, p, g) { polarDraw(s, 5 * Math.PI / 6, 2, p, g); }, function () { var v = P.polarToCartesian(2, 5 * Math.PI / 6); return Math.abs(v.x + Math.sqrt(3)) < 1e-10 && Math.abs(v.y - 1) < 1e-10 ? "right" : "sign"; }),
      ch("polar-equivalent", "3.6", "Equivalent angle", "With positive r, which angle gives the same point as (2,π/4)?", [option("pi2", "3π/2"), option("same", "9π/4"), option("zero", "0")], "same", "Adding 2π preserves both sine and cosine, so (2,π/4) and (2,9π/4) describe the same point. A chosen angle interval selects one representative.", function (s, p, g) { polarDraw(s, Math.PI / 4, 2, p, g); }, function () { var a = P.polarToCartesian(2, Math.PI / 4), b = P.polarToCartesian(2, Math.PI / 4 + 2 * Math.PI); return Math.hypot(a.x - b.x, a.y - b.y) < 1e-10 ? "same" : "zero"; }),
      ch("polar-origin", "3.6", "The origin exception", "At the origin, is the polar angle uniquely determined?", [option("yes", "Yes; the angle is 0"), option("pi", "Only π is allowed"), option("no", "No; every angle gives the origin when r=0")], "no", "For r=0, x=r cosφ and y=r sinφ are both zero for every φ. The origin has no unique polar angle, even when one angle interval is chosen.", function (s, p, g) { polarDraw(s, Math.PI / 4, 0, p, g); }, function () { return P.cartesianToPolar(0, 0).phi === null ? "no" : "yes"; }),
    ],
  };
  // ---- Your own rule (sandbox): typed with js/mei/expr.js ----
  function fmt(v) { if (!isFinite(v)) return "undefined"; var r = Math.round(v * 1000) / 1000; return String(r).replace("-", "−"); }
  function nums(text) { return String(text).split(/[,;\s]+/).filter(Boolean).map(function (t) { return Number(t.replace("−", "-")); }).filter(function (v) { return isFinite(v); }); }
  function ownMapping(f, xs, ys) {
    var pairs = xs.map(function (x) { return [x, Math.round(f(x) * 1000) / 1000]; }), image = [];
    pairs.forEach(function (q) { if (isFinite(q[1]) && image.indexOf(q[1]) < 0) image.push(q[1]); });
    var cod = ys.length ? ys.slice() : image.slice(), outside = pairs.filter(function (q) { return !isFinite(q[1]) || cod.indexOf(q[1]) < 0; });
    outside.forEach(function (q) { if (isFinite(q[1]) && cod.indexOf(q[1]) < 0) cod.push(q[1]); });
    cod.sort(function (a, b) { return a - b; });
    var m = { domain: xs, codomain: cod, image: image, pairs: pairs.filter(function (q) { return isFinite(q[1]); }) };
    m.injective = image.length === m.pairs.length;
    m.surjective = cod.every(function (v) { return image.indexOf(v) >= 0; });
    if (outside.length) m.note = "Not a mapping into Y: f(" + fmt(outside[0][0]) + ") = " + fmt(outside[0][1]) + " is not in Y";
    return m;
  }
  function ownGraph(svg, f, a, b, c) {
    // samples f on [a, b], scales to fit, and (with c) draws the horizontal line y = c and counts where it meets
    reset(svg, "Graph of your rule on the chosen interval");
    var L = 70, R = 520, T = 40, B = 290, n = 300, xs = [], ys = [], lo = Infinity, hi = -Infinity;
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n, y = f(x);
      xs.push(x); ys.push(y);
      if (isFinite(y) && Math.abs(y) < 1e6) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    }
    if (!isFinite(lo)) { text(svg, "Your rule is undefined everywhere on this interval.", 280, 170, 15, tok("--act"), "middle", 700); return null; }
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    // the scale comes from the graph alone, so dragging the line cannot stretch it; the line stays inside
    if (c != null) c = Math.max(lo, Math.min(hi, c));
    function X(x) { return L + (x - a) / (b - a) * (R - L); }
    function Y(y) { return B - (y - lo) / (hi - lo) * (B - T); }
    var ay = lo < 0 && hi > 0 ? Y(0) : B, ax = a < 0 && b > 0 ? X(0) : L;
    line(svg, L - 6, ay, R + 6, ay); line(svg, ax, B + 6, ax, T - 6);
    text(svg, fmt(a), L, B + 22, 12, tok("--muted"), "middle"); text(svg, fmt(b), R, B + 22, 12, tok("--muted"), "middle");
    text(svg, fmt(hi), L - 10, T + 4, 12, tok("--muted"), "end"); text(svg, fmt(lo), L - 10, B, 12, tok("--muted"), "end");
    var d = [], pen = false;
    for (var k = 0; k <= n; k++) {
      var ok = isFinite(ys[k]) && Math.abs(ys[k]) < 1e6 && (!pen || Math.abs(ys[k] - ys[k - 1]) < (hi - lo));
      if (!ok) { pen = false; continue; }
      d.push((pen ? "L" : "M") + X(xs[k]).toFixed(1) + " " + Y(ys[k]).toFixed(1)); pen = true;
    }
    node("path", { d: d.join(" "), fill: "none", stroke: tok("--course"), "stroke-width": 3 }, svg);
    var info = { Y: Y, lo: lo, hi: hi, T: T, B: B };
    if (c != null) {
      line(svg, L - 6, Y(c), R + 6, Y(c), tok("--act"), 2);
      node("circle", { cx: R + 6, cy: Y(c), r: 8, fill: tok("--act"), stroke: tok("--paper"), "stroke-width": 2 }, svg);
      var hits = 0;
      for (var j = 1; j <= n; j++) {
        var u = ys[j - 1] - c, v = ys[j] - c;
        if (isFinite(u) && isFinite(v) && (u === 0 || u * v < 0)) hits++;
      }
      if (isFinite(ys[n]) && ys[n] === c) hits++;
      var up = true, down = true, prev = null;
      ys.forEach(function (y) { if (!isFinite(y)) return; if (prev != null) { if (y <= prev) up = false; if (y >= prev) down = false; } prev = y; });
      text(svg, "y = " + fmt(c) + " meets the graph " + hits + (hits === 1 ? " time" : " times"), 280, 26, 14, tok("--ink"), "middle", 700);
      text(svg, (up || down) ? "strictly " + (up ? "increasing" : "decreasing") + " on [" + fmt(a) + ", " + fmt(b) + "]: an inverse exists" : "not one-to-one on [" + fmt(a) + ", " + fmt(b) + "]: some output has two inputs", 280, 326, 15, tok("--act"), "middle", 800);
    }
    return info;
  }
  function ownChain(svg, fs, gs, f, g, x) {
    reset(svg, "Your input passing through your two rules");
    var mid = f(x), out = isFinite(mid) ? g(mid) : NaN, cols = [60, 160, 280, 400, 500];
    text(svg, "input", cols[0], 84, 14, tok("--muted"), "middle"); text(svg, "f(x) = " + fs, cols[1], 84, 13, tok("--muted"), "middle");
    text(svg, "f(x)", cols[2], 84, 14, tok("--muted"), "middle"); text(svg, "g(u) = " + gs, cols[3], 84, 13, tok("--muted"), "middle"); text(svg, "g(f(x))", cols[4], 84, 14, tok("--muted"), "middle");
    var vals = [fmt(x), "f", fmt(mid), "g", fmt(out)];
    cols.forEach(function (cx, i) {
      if (i < cols.length - 1) line(svg, cx + 28, 176, cols[i + 1] - 28, 176, tok("--fau-mark"), 3, (i === 2 && !isFinite(mid)) || (i === 3 && !isFinite(out)) ? "6 5" : "");
      var bad = (i === 2 && !isFinite(mid)) || (i === 4 && !isFinite(out));
      node("circle", { cx: cx, cy: 176, r: 26, fill: bad ? tok("--paper") : tok("--course"), stroke: bad ? tok("--act") : tok("--line"), "stroke-width": 2 }, svg);
      text(svg, vals[i], cx, 181, vals[i].length > 7 ? 10 : 13, bad ? tok("--act") : tok("--paper"), "middle", 700);
    });
    var msg = !isFinite(mid) ? "f is not defined at x = " + fmt(x) + ": the chain cannot start" : !isFinite(out) ? "The chain stops: f(x) = " + fmt(mid) + " is outside the domain of g" : "(g∘f)(" + fmt(x) + ") = " + fmt(out);
    text(svg, msg, 280, 256, 15, tok("--act"), "middle", 800);
    var gx = g(x), fg = isFinite(gx) ? f(gx) : NaN;
    text(svg, "the other order: (f∘g)(" + fmt(x) + ") = " + fmt(fg), 280, 286, 14, tok("--muted"), "middle");
  }
  // ---- Endless practice: fresh challenges with computed answers (checked by tests/lab-generators.test.js) ----
  function pick(n) { return Math.floor(Math.random() * n); }
  function shuffle(o) { for (var i = o.length - 1; i > 0; i--) { var j = pick(i + 1), t = o[i]; o[i] = o[j]; o[j] = t; } return o; }
  function numOpts(right, wrongs) {
    var seen = {}, out = [];
    [right].concat(wrongs).forEach(function (v) { var k = fmt(v); if (!seen[k] && out.length < 3 && isFinite(v)) { seen[k] = true; out.push([k, k]); } });
    for (var d = 1; out.length < 3; d++) { var k = fmt(right + d); if (!seen[k]) { seen[k] = true; out.push([k, k]); } }
    return shuffle(out);
  }
  var RULES = [["x²", function (x) { return x * x; }], ["x+1", function (x) { return x + 1; }], ["|x|", Math.abs], ["2x", function (x) { return 2 * x; }], ["x³", function (x) { return x * x * x; }]];
  var generators = {
    mappings: function () {
      var r = RULES[pick(RULES.length)], xs = [-2, -1, 0, 1, 2].slice(0, 3 + pick(3)), img = [];
      xs.forEach(function (x) { var y = r[1](x); if (img.indexOf(y) < 0) img.push(y); });
      var ys = img.slice(); if (pick(2)) ys.push(Math.max.apply(null, img) + 1 + pick(3));
      var m = ownMapping(r[1], xs, ys), key = m.injective && m.surjective ? "both" : m.surjective ? "surj" : m.injective ? "inj" : "neither";
      return ch("gen-mapping", "3.2", "Mapping type", "For f(x)=" + r[0] + " from {" + xs.join(",").replace(/-/g, "−") + "} to {" + ys.slice().sort(function (a, b) { return a - b; }).join(",").replace(/-/g, "−") + "}, which description fits?",
        shuffle([option("both", "Bijective"), option("surj", "Surjective, not injective"), option("inj", "Injective, not surjective"), option("neither", "Neither")]), key,
        (m.injective ? "No two inputs share an output, so it is injective. " : "Two inputs share an output, so it is not injective. ") + (m.surjective ? "Every value of Y is reached, so it is surjective." : "Some value of Y is never reached, so it is not surjective."),
        function (sv, p, g) { mappingDraw(sv, m, p, g); });
    },
    inverse: function () {
      var a = 2 + pick(4), b = pick(11) - 4, x = 1 + pick(5), y = a * x + b, f = function (t) { return a * t + b; };
      return ch("gen-inverse", "3.3", "Reverse a linear map", "If f(x)=" + a + "x" + (b < 0 ? "−" + -b : "+" + b) + ", what input has output " + fmt(y) + "?", numOpts(x, [y - b, (y + b) / a, x + 1]), fmt(x),
        "Solve " + a + "x" + (b < 0 ? "−" + -b : "+" + b) + "=" + fmt(y) + ": x=(" + fmt(y) + (b < 0 ? "+" + -b : "−" + b) + ")/" + a + "=" + fmt(x) + ". The inverse rule is f⁻¹(y)=(y" + (b < 0 ? "+" + -b : "−" + b) + ")/" + a + ".",
        function (sv, p) { ownGraph(sv, f, -1, 6, p > 0.4 ? y : null); });
    },
    composition: function () {
      var p1 = 1 + pick(3), q = pick(5) - 2, x = pick(5) - 1, f = function (t) { return p1 * t + q; }, g = function (t) { return t * t; },
        fs = p1 + "x" + (q < 0 ? "−" + -q : "+" + q), right = g(f(x));
      return ch("gen-composition", "3.4", "Compose in order", "With f(x)=" + fs + " and g(x)=x², what is (g∘f)(" + fmt(x) + ")?", numOpts(right, [f(g(x)), f(x) * g(x), f(x)]), fmt(right),
        "Apply f first: f(" + fmt(x) + ")=" + fmt(f(x)) + ", then g: " + fmt(f(x)) + "²=" + fmt(right) + ". The other order gives f(g(" + fmt(x) + "))=" + fmt(f(g(x))) + ".",
        function (sv, ph) { ownChain(sv, fs, "u²", f, g, x); });
    },
    polar: function () {
      var angs = [[0, "0"], [Math.PI / 6, "π/6"], [Math.PI / 3, "π/3"], [Math.PI / 2, "π/2"], [2 * Math.PI / 3, "2π/3"], [Math.PI, "π"]], A = angs[pick(angs.length)], r = 1 + pick(4),
        c = P.polarToCartesian(r, A[0]), right = Math.round(c.x * 100) / 100;
      return ch("gen-polar", "3.6", "Polar to Cartesian", "For r=" + r + " and φ=" + A[1] + ", what is x = r cos φ?", numOpts(right, [Math.round(c.y * 100) / 100, r, -right]), fmt(right),
        "x = r cos φ = " + r + " · cos(" + A[1] + ") = " + fmt(right) + "; the vertical part is y = r sin φ = " + fmt(Math.round(c.y * 100) / 100) + ".",
        function (sv, p) { polarDraw(sv, A[0], r, p); });
    },
  };
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), visual = stage(id), controls = Array.from(root.querySelectorAll("[data-control]"));
    function setup(c) { root.classList.remove("sandbox-open"); c.stage(); }
    function sandbox() {
      root.classList.add("sandbox-open"); // the labelled controls under the stage drive it; no duplicate slider strip on the stage
      function own(name) { var el = root.querySelector("[data-own='" + name + "']"); return el ? el.value : ""; }
      function say(msg) { var el = root.querySelector("[data-own-msg]"); if (el) el.textContent = msg || ""; }
      function rule(name) { var r = Expr.compile(own(name)); if (r.error) say(name + ": " + r.error); return r.fn; }
      function update() {
        var values = {}; controls.forEach(function (c) { values[c.dataset.control] = c.value; });
        say("");
        if (root._own) {
          var f = rule("f");
          if (!f) return;
          if (id === "mappings") {
            var xs = nums(own("x"));
            if (!xs.length) return say("X: list some numbers, for example −2, −1, 0, 1, 2");
            mappingDraw(visual, ownMapping(f, xs.slice(0, 7), nums(own("y")).slice(0, 7)), 1);
            if (xs.length > 7) say("Only the first 7 inputs are drawn.");
          } else if (id === "inverse" || id === "elementary") {
            var a = Number(own("a").replace("−", "-")), b = Number(own("b").replace("−", "-"));
            if (!(isFinite(a) && isFinite(b) && b > a)) return say("Interval: “from” must be smaller than “to”.");
            root._graph = ownGraph(visual, f, a, b, id === "inverse" ? (root._lineY != null ? root._lineY : f((a + b) / 2)) : null);
          } else if (id === "composition") {
            var g = rule("g"), x = Number(own("x").replace("−", "-"));
            if (!g) return;
            if (!isFinite(x)) return say("x: type a number");
            ownChain(visual, own("f"), own("g"), f, g, x);
          }
          return;
        }
        if (id === "mappings") mappingDraw(visual, values.rule, 1);
        else if (id === "inverse") graphDraw(visual, values.function, 1);
        else if (id === "composition") compositionDraw(visual, values.order, 1);
        else if (id === "elementary") elementaryDraw(visual, values.family, 1);
        else if (root._polar && root._polarSet === values.angle + "|" + values.radius) polarDraw(visual, root._polar.angle, root._polar.radius, 1);
        else { root._polar = null; root._polarSet = values.angle + "|" + values.radius; polarDraw(visual, +values.angle, +values.radius, 1); }
        var sliderControl = id === "polar" ? root.querySelector("[data-control='angle']") : controls[0];
      }
      if (!root._controlsBound) {
        root._controlsBound = true;
        // a preset puts the stage back on the preset; typing in "Or try your own" switches it to your rule
        controls.forEach(function (c) { c.addEventListener("change", function () { root._own = false; root._lineY = null; update(); }); });
        root.querySelectorAll("[data-own]").forEach(function (el) { el.addEventListener("input", function () { root._own = true; if (el.dataset.own !== "y") root._lineY = null; update(); }); });
        var host = root.querySelector(".stage"), drag = false;
        function at(ev) { var q = visual.createSVGPoint(), m = visual.getScreenCTM(); q.x = ev.clientX; q.y = ev.clientY; return m ? q.matrixTransform(m.inverse()) : q; }
        function move(ev) {
          var q = at(ev);
          if (id === "polar") {
            var ang = Math.atan2(184 - q.y, q.x - 280); if (ang < 0) ang += 2 * Math.PI;
            root._polar = { angle: ang, radius: Math.max(0.2, Math.min(4, Math.round(Math.hypot(q.x - 280, q.y - 184) / 48 * 10) / 10)) };
            polarDraw(visual, root._polar.angle, root._polar.radius, 1);
          } else if (id === "inverse" && root._own && root._graph) {
            var gr = root._graph, yv = gr.lo + (gr.B - Math.max(gr.T, Math.min(gr.B, q.y))) / (gr.B - gr.T) * (gr.hi - gr.lo);
            root._lineY = Math.round(yv * 100) / 100; update();
          }
        }
        host.addEventListener("pointerdown", function (ev) {
          if (!root.classList.contains("sandbox-open") || !(id === "polar" || (id === "inverse" && root._own))) return;
          drag = true; host.classList.add("dragging"); if (ev.isTrusted && host.setPointerCapture) { try { host.setPointerCapture(ev.pointerId); } catch (_) {} }
          move(ev); ev.preventDefault();
        });
        host.addEventListener("pointermove", function (ev) { if (drag) move(ev); });
        ["pointerup", "pointercancel"].forEach(function (t) { host.addEventListener(t, function () { drag = false; host.classList.remove("dragging"); }); });
      }
      update();
    }
    function wrap(challenge) {
      var said = null;
      function draw(phase) { challenge.draw(visual, phase, said); }
      return Object.assign({}, challenge, {
        stage: function () { said = null; draw(0); },
        preview: function (choice) { var selected = challenge.options.find(function (o) { return o[0] === choice; }); said = selected && selected[1]; draw(0); },
        reveal: function () { return Lab.tween(1400, draw).then(function () { draw(1); }); },
      });
    }
    Lab.experiment({ id: id, title: title, card: root.querySelector(".challenge"), lock: function () {}, setup: setup, sandbox: sandbox,
      generate: generators[id] ? function () { return wrap(generators[id]()); } : null,
      challenges: data[id].map(wrap) });
  }
  register("mappings", "3.1–3.2 Mapping types");
  register("inverse", "3.3 Inverse functions");
  register("composition", "3.4 Composition");
  register("elementary", "3.5 Elementary functions");
  register("polar", "3.6 Polar coordinates");
})();
