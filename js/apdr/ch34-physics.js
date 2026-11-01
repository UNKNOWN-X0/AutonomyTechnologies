/* APDR Chapters 3+4 calculations reused by the combined lab and its tests. */
(function (root) {
  var I = root.APDR3, F = root.APDR4;
  if (typeof module === "object" && module.exports) {
    I = require("./ch3-physics.js");
    F = require("./ch4-physics.js");
  }

  function cancellation(x, y) {
    var exactX = x == null ? 0.123456789 : Number(x), exactY = y == null ? 0.123451234 : Number(y);
    if (![exactX, exactY].every(Number.isFinite) || exactX === exactY) throw new RangeError("use distinct finite values");
    var
      storedX = Number(exactX.toPrecision(5)), storedY = Number(exactY.toPrecision(5)),
      exact = exactX - exactY, stored = storedX - storedY;
    return { exact: exact, stored: stored, relativeError: Math.abs((stored - exact) / exact) };
  }

  function stableQuadratic(a, b, c) {
    a = Number(a); b = Number(b); c = Number(c);
    if (![a, b, c].every(Number.isFinite) || a === 0) throw new RangeError("use finite coefficients with a non-zero a");
    if (b === 0) {
      if (c === 0) return { discriminant: 0, q: 0, roots: [0, 0] };
      if ((a > 0) === (c > 0)) throw new RangeError("this lab requires real roots");
      var root = Math.sqrt(Math.abs(c)) / Math.sqrt(Math.abs(a)), product = a * c, d0 = -4 * product;
      return { discriminant: d0 && Number.isFinite(d0) ? d0 : "−4 × (" + a + ") × (" + c + ")", q: -Math.sqrt(Math.abs(a)) * Math.sqrt(Math.abs(c)), roots: a > 0 ? [-root, root] : [root, -root] };
    }
    var scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c)),
      an = a / scale, bn = b / scale, cn = c / scale,
      dn = bn * bn - 4 * an * cn,
      d = dn * scale * scale;
    // shortcut: reject ratios that vanish when normalized, upgrade to exponent-scaled arithmetic to support every finite ratio.
    if (an === 0 || bn === 0 || (c !== 0 && cn === 0)) throw new RangeError("coefficient magnitudes exceed this lab's stable range");
    if (dn < 0) throw new RangeError("this lab requires real roots");
    var q = -0.5 * (bn + (bn < 0 ? -1 : 1) * Math.sqrt(dn));
    if (q === 0) return { discriminant: d, q: q, roots: [0, 0] };
    return { discriminant: Number.isFinite(d) && (d !== 0 || dn === 0) ? d : dn.toExponential(6) + " × (" + scale.toExponential(3) + ")²", q: q * scale, roots: [q / an, cn / q] };
  }

  function subtractExactBySterbenz(x, y) {
    x = Number(x); y = Number(y);
    if (!(x > 0 && y > 0 && y / 2 <= x && x <= 2 * y)) throw new RangeError("positive floating-point inputs must satisfy y/2 ≤ x ≤ 2y");
    return x - y;
  }

  var api = {
    decodeInteger: function (bits, encoding, bias) { return I.decodeInteger(bits, encoding, bias); },
    convert: function (value, from, to) { return I.convert(value, from, to); },
    encodeBcd: function (value) { return I.encodeBcd(value); },
    unsignedArithmetic: function (a, b, op) { return I.unsignedArithmetic(a, b, op); },
    twosArithmetic: function (a, b, op) { return I.twosArithmetic(a, b, op); },
    fractionValue: function (bits) { return F.fractionValue(bits); },
    fractionBits: function (value, limit) { return F.fractionBits(value, limit); },
    spacing: function (exponent, precision) { return F.spacing(exponent, precision); },
    decodeSingle: function (hex) { return F.decodeSingle(hex); },
    cancellation: cancellation,
    stableQuadratic: stableQuadratic,
    subtractExactBySterbenz: subtractExactBySterbenz,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR34 = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
