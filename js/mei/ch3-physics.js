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
  function tanUndefined(x) { return Math.abs(Math.cos(x)) < 1e-10; }
  function logDefined(x) { return x > 0; }
  function polarToCartesian(r, phi) { return { x: r * Math.cos(phi), y: r * Math.sin(phi) }; }
  function cartesianToPolar(x, y) {
    var r = Math.hypot(x, y), phi = Math.atan2(y, x);
    if (phi < 0) phi += 2 * Math.PI;
    return { r: r, phi: r === 0 ? null : phi };
  }
  var api = { mapping: mapping, discriminant: discriminant, roots: roots, inverseAffine: inverseAffine, inverseSquare: inverseSquare,
    composition: composition, tanUndefined: tanUndefined, logDefined: logDefined,
    polarToCartesian: polarToCartesian, cartesianToPolar: cartesianToPolar };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MEI3 = api;
})(this);
