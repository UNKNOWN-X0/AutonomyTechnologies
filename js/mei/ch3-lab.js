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
    var m = P.mapping(rule), yy = function (i, n) { return 76 + (n <= 1 ? 0 : i * 205 / (n - 1)); };
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
    if (phase > .82) text(svg, "Injective: " + (m.injective ? "yes" : "no") + "     Surjective: " + (m.surjective ? "yes" : "no"), 280, 316, 16, tok("--act"), "middle", 800);
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
      ch("mapping-relation", "3.1", "Function or relation?", "Does y²=x define y as a function of x over the reals?", [option("no", "No; x=4 has two y-values"), option("yes", "Yes; every x has one y"), option("zero", "Only x=0 has an output")], "no", "At x=4, both y=2 and y=−2 satisfy the relation. One input with two outputs breaks the definition of a function.", function (s, p, g) { relationDraw(s, p, g); }, function () { return Math.sqrt(4) === -Math.sqrt(4) ? "yes" : "no"; }),
      ch("mapping-bijection", "3.2", "A bijection", "For x+1 from {0,1,2} to {1,2,3}, what type of mapping is it?", [option("onto", "Onto but not injective"), option("bijective", "Bijective"), option("inj", "Injective but not onto")], "bijective", "The outputs 1, 2, and 3 each occur exactly once. The map is both injective and surjective for this codomain.", function (s, p, g) { mappingDraw(s, "shift", p, g); }, function () { var m = P.mapping("shift"); return m.injective && m.surjective ? "bijective" : "onto"; }),
    ],
    inverse: [
      ch("inverse-affine", "3.3", "Reverse a linear map", "If f(x)=2x+3, what input has output 11?", [option("3", "3"), option("6", "6"), option("4", "4")], "4", "Solve 2x+3=11, giving x=4. The inverse rule is f⁻¹(y)=(y−3)/2.", function (s, p, g) { graphDraw(s, "affine", p, g); }, function () { return String(P.inverseAffine(2, 3, 11)); }),
      ch("inverse-square", "3.3", "Domain restriction", "For f(x)=x² with domain [0,∞), which is its inverse?", [option("plusminus", "±√y"), option("square", "y²"), option("sqrt", "√y for y≥0")], "sqrt", "On the non-negative domain, each y≥0 has exactly one input √y. The domain restriction removes the negative branch that would make the inverse ambiguous.", function (s, p, g) { graphDraw(s, "restricted", p, g); }, function () { return P.inverseSquare(9) === 3 ? "sqrt" : "square"; }),
      ch("inverse-collision", "3.3", "Horizontal line test", "Can x² on [−2,2] have an inverse function with its full image as domain?", [option("yes", "Yes; every output has one input"), option("no", "No; positive outputs have two inputs"), option("zero", "Only at zero")], "no", "For example, output 1 comes from both −1 and 1. Reversing x² on [−2,2] would assign two values to one input, so it is not a function.", function (s, p, g) { graphDraw(s, "square", p, g); }, function () { return Math.pow(-1, 2) === Math.pow(1, 2) ? "no" : "yes"; }),
      ch("inverse-cosine", "3.5", "Principal interval", "On [0,π], does cosine have a unique inverse value for every output in [−1,1]?", [option("no", "No; cosine repeats within [0,π]"), option("zero", "Only for output 0"), option("yes", "Yes; it is strictly decreasing")], "yes", "Cosine decreases from 1 to −1 on [0,π], so every value in [−1,1] occurs once. The restricted interval makes arccos well-defined.", function (s, p, g) { graphDraw(s, "cosine", p, g); }, function () { return Math.cos(0) > Math.cos(Math.PI) ? "yes" : "no"; }),
    ],
    composition: [
      ch("composition-gof", "3.4", "Apply f, then g", "With f(x)=2x+1 and g(x)=x², what is (g∘f)(2)?", [option("25", "25"), option("9", "9"), option("16", "16")], "25", "First f(2)=5, then g(5)=25. Read g∘f from right to left: f is applied before g.", function (s, p, g) { compositionDraw(s, "gof", p, g, 2); }, function () { return String(P.composition(2, "gof")); }),
      ch("composition-fog", "3.4", "Order changes the result", "For the same f and g, what is (f∘g)(2)?", [option("25", "25"), option("9", "9"), option("5", "5")], "9", "First g(2)=4, then f(4)=9. Reversing the order gives 25, so composition is generally not commutative.", function (s, p, g) { compositionDraw(s, "fog", p, g, 2); }, function () { return String(P.composition(2, "fog")); }),
      ch("composition-domain", "3.4", "Check the intermediate domain", "Let g(t)=t−1 for t≥0 and f(u)=u² only for u≥0. Is f∘g defined for every t≥0?", [option("yes", "Yes; f squares every real"), option("one", "Only at t=1"), option("no", "No; g(t)<0 for 0≤t<1")], "no", "For every t in [0,1), g(t)=t−1 is negative and is outside f’s domain. The composition is defined only for t≥1.", function (s, p, g) { compositionDraw(s, "domain", p, g, .5); }, function () { return .5 - 1 < 0 ? "no" : "yes"; }),
      ch("composition-associative", "3.4", "Association and order", "Let f(x)=x+1, g(x)=2x, h(x)=x². What is h(g(f(1)))?", [option("16", "16"), option("9", "9"), option("25", "25")], "16", "The chain gives f(1)=2, g(2)=4, and h(4)=16. Parentheses may move by associativity, but the function order stays the same.", function (s, p, g) { compositionDraw(s, "triple", p, g, 1); }, function () { var n = 1 + 1; n = 2 * n; return String(n * n); }),
    ],
    elementary: [
      ch("elementary-quadratic", "3.5", "Discriminant and roots", "How many real roots does x²−2x−3=0 have?", [option("one", "One repeated root"), option("two", "Two distinct roots"), option("none", "No real roots")], "two", "The discriminant is (−2)²−4(1)(−3)=16>0, so there are two distinct real roots, −1 and 3.", function (s, p, g) { elementaryDraw(s, "quadratic", p, g); }, function () { return P.roots(1, -2, -3).length === 2 ? "two" : "none"; }),
      ch("elementary-sine", "3.5", "Double-angle identity", "Using sin(2x)=2sin x cos x, what is sin(π/3)?", [option("1/2", "1/2"), option("1", "1"), option("sqrt3/2", "√3/2")], "sqrt3/2", "Set x=π/6. Then 2·(1/2)·(√3/2)=√3/2, matching the unit circle at π/3.", function (s, p, g) { elementaryDraw(s, "sine", p, g); }, function () { return Math.abs(2 * Math.sin(Math.PI / 6) * Math.cos(Math.PI / 6) - Math.sin(Math.PI / 3)) < 1e-12 ? "sqrt3/2" : "1/2"; }),
      ch("elementary-log-domain", "3.5", "Logarithm domain", "Which statement about ln(−1) over the reals is correct?", [option("undefined", "It is undefined"), option("zero", "It equals 0"), option("one", "It equals 1")], "undefined", "The real logarithm requires a positive input. Since −1 is not positive, ln(−1) has no real value.", function (s, p, g) { elementaryDraw(s, "logarithm", p, g); }, function () { return P.logDefined(-1) ? "zero" : "undefined"; }),
      ch("elementary-tangent", "3.5", "Tangent domain", "At which listed angle is tan x undefined?", [option("pi4", "π/4"), option("pi2", "π/2"), option("pi3", "π/3")], "pi2", "Tangent is sin x/cos x, so it is undefined when cos x=0: x=π/2+kπ for integer k.", function (s, p, g) { elementaryDraw(s, "tangent", p, g); }, function () { return P.tanUndefined(Math.PI / 2) ? "pi2" : "pi4"; }),
    ],
    polar: [
      ch("polar-quadrant", "3.6", "Choose the quadrant", "Convert (x,y)=(−1,−√3) using r≥0 and 0≤φ<2π.", [option("2", "(2, 2π/3)"), option("pi3", "(2, π/3)"), option("4", "(2, 4π/3)")], "4", "The radius is √(1+3)=2. Both coordinates are negative, so the point is in quadrant III and φ=4π/3.", function (s, p, g) { polarDraw(s, 4 * Math.PI / 3, 2, p, g); }, function () { var v = P.cartesianToPolar(-1, -Math.sqrt(3)); return Math.abs(v.r - 2) < 1e-10 && Math.abs(v.phi - 4 * Math.PI / 3) < 1e-10 ? "4" : "2"; }),
      ch("polar-components", "3.6", "Cartesian components", "For (r,φ)=(4,π/3), what is (x,y)?", [option("right", "(2, 2√3)"), option("wrong", "(2, 2)"), option("swap", "(2√3, 2)")], "right", "Use x=r cosφ=2 and y=r sinφ=2√3. The angle is measured from the positive x-axis, so cosine gives the horizontal component.", function (s, p, g) { polarDraw(s, Math.PI / 3, 4, p, g); }, function () { var v = P.polarToCartesian(4, Math.PI / 3); return Math.abs(v.x - 2) < 1e-10 && Math.abs(v.y - 2 * Math.sqrt(3)) < 1e-10 ? "right" : "swap"; }),
      ch("polar-equivalent", "3.6", "Equivalent angle", "With positive r, which angle gives the same point as (2,π/4)?", [option("pi2", "3π/2"), option("same", "9π/4"), option("zero", "0")], "same", "Adding 2π preserves both sine and cosine, so (2,π/4) and (2,9π/4) describe the same point. A chosen angle interval selects one representative.", function (s, p, g) { polarDraw(s, Math.PI / 4, 2, p, g); }, function () { var a = P.polarToCartesian(2, Math.PI / 4), b = P.polarToCartesian(2, Math.PI / 4 + 2 * Math.PI); return Math.hypot(a.x - b.x, a.y - b.y) < 1e-10 ? "same" : "zero"; }),
      ch("polar-origin", "3.6", "The origin exception", "At the origin, is the polar angle uniquely determined?", [option("yes", "Yes; the angle is 0"), option("pi", "Only π is allowed"), option("no", "No; every angle gives the origin when r=0")], "no", "For r=0, x=r cosφ and y=r sinφ are both zero for every φ. The origin has no unique polar angle, even when one angle interval is chosen.", function (s, p, g) { polarDraw(s, Math.PI / 4, 0, p, g); }, function () { return P.cartesianToPolar(0, 0).phi === null ? "no" : "yes"; }),
    ],
  };
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), visual = stage(id), controls = Array.from(root.querySelectorAll("[data-control]"));
    function setup(c) { root.classList.remove("sandbox-open"); c.stage(); }
    function sandbox() {
      root.classList.add("sandbox-open"); root.querySelector(".stage").classList.add("can-grab"); bindSlider(root);
      function update() {
        var values = {}; controls.forEach(function (c) { values[c.dataset.control] = c.value; });
        if (id === "mappings") mappingDraw(visual, values.rule, 1);
        else if (id === "inverse") graphDraw(visual, values.function, 1);
        else if (id === "composition") compositionDraw(visual, values.order, 1);
        else if (id === "elementary") elementaryDraw(visual, values.family, 1);
        else polarDraw(visual, +values.angle, +values.radius, 1);
        var sliderControl = id === "polar" ? root.querySelector("[data-control='angle']") : controls[0];
        slider(root, visual, sliderControl, update);
      }
      if (!root._controlsBound) {
        root._controlsBound = true;
        controls.forEach(function (c) { c.addEventListener("change", update); });
      }
      update();
    }
    Lab.experiment({ id: id, title: title, card: root.querySelector(".challenge"), lock: function () {}, setup: setup, sandbox: sandbox,
      challenges: data[id].map(function (challenge) {
        var said = null;
        function draw(phase) { challenge.draw(visual, phase, said); }
        return Object.assign({}, challenge, {
          stage: function () { said = null; draw(0); },
          preview: function (choice) { var selected = challenge.options.find(function (o) { return o[0] === choice; }); said = selected && selected[1]; draw(0); },
          reveal: function () { return Lab.tween(1400, draw).then(function () { draw(1); }); },
        });
      }) });
  }
  register("mappings", "3.1–3.2 Mapping types");
  register("inverse", "3.3 Inverse functions");
  register("composition", "3.4 Composition");
  register("elementary", "3.5 Elementary functions");
  register("polar", "3.6 Polar coordinates");
})();
