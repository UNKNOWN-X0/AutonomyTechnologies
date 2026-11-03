/* MEI Chapter 3 mapping, function, composition, and polar-coordinate calculations. */
(function (root) {
  function mapping(name) {
    var domain, codomain, rule;
    if (name === "shift") {
      domain = [0, 1, 2]; codomain = [1, 2, 3]; rule = function (x) { return x + 1; };
    } else if (name === "square-gap") {
      domain = [-1, 0, 1]; codomain = [0, 1, 4, 9]; rule = function (x) { return x * x; };
    } else {
      domain = [-2, -1, 0, 1, 2]; codomain = [0, 1, 4]; rule = function (x) { return x * x; };
    }
    var pairs = domain.map(function (x) { return [x, rule(x)]; });
    var image = Array.from(new Set(pairs.map(function (p) { return p[1]; }))).sort(function (a, b) { return a - b; });
    return { domain: domain, codomain: codomain, pairs: pairs, image: image,
      injective: image.length === domain.length,
      surjective: codomain.every(function (y) { return image.indexOf(y) !== -1; }) };
  }
  function discriminant(a, b, c) { return b * b - 4 * a * c; }
  function roots(a, b, c) {
    var d = discriminant(a, b, c);
    return d < 0 ? [] : d === 0 ? [-b / (2 * a)] : [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)];
  }
  function inverseAffine(a, b, y) { return (y - b) / a; }
  function inverseSquare(y) { return y < 0 ? NaN : Math.sqrt(y); }
  function composition(x, order) {
    var f = function (n) { return 2 * n + 1; }, g = function (n) { return n * n; };
    return order === "gof" ? g(f(x)) : f(g(x));
  }
  // All real y with y²=x: two for x>0, one for x=0, none for x<0.
  function relationValues(x) { return x < 0 ? [] : x === 0 ? [0] : [Math.sqrt(x), -Math.sqrt(x)]; }
  // Inputs of x² on [lo,hi] that land on y.
  function squarePreimages(y, lo, hi) {
    return relationValues(y).filter(function (x) { return x >= lo && x <= hi; });
  }
  // Sampled test that fn is strictly decreasing on [a,b].
  function strictlyDecreasing(fn, a, b) {
    for (var i = 0, n = 200; i < n; i++) if (!(fn(a + (b - a) * (i + 1) / n) < fn(a + (b - a) * i / n))) return false;
    return true;
  }
  // f∘g with g(t)=t−1 and f(u)=u² only for u≥0: defined exactly when g(t) lies in D(f).
  function fogDefined(t) { return t - 1 >= 0; }
  // Apply fns left to right, so chain(x, [f, g, h]) = h(g(f(x))).
  function chain(x, fns) { return fns.reduce(function (v, fn) { return fn(v); }, x); }
  function tanUndefined(x) { return Math.abs(Math.cos(x)) < 1e-10; }
  function logDefined(x) { return x > 0; }
  function polarToCartesian(r, phi) { return { x: r * Math.cos(phi), y: r * Math.sin(phi) }; }
  function cartesianToPolar(x, y) {
    var r = Math.hypot(x, y), phi = Math.atan2(y, x);
    if (phi < 0) phi += 2 * Math.PI;
    return { r: r, phi: r === 0 ? null : phi };
  }
  var api = { mapping: mapping, discriminant: discriminant, roots: roots, inverseAffine: inverseAffine, inverseSquare: inverseSquare,
    composition: composition, relationValues: relationValues, squarePreimages: squarePreimages,
    strictlyDecreasing: strictlyDecreasing, fogDefined: fogDefined, chain: chain, tanUndefined: tanUndefined, logDefined: logDefined,
    polarToCartesian: polarToCartesian, cartesianToPolar: cartesianToPolar };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MEI3 = api;
})(this);
