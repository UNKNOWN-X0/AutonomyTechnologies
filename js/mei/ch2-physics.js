/* MEI Chapter 2 real-number, inequality, counting, and induction calculations. */
(function (root) {
  function binaryValue(bits) {
    return String(bits).split("").reduce(function (n, bit) { return n * 2 + (+bit); }, 0);
  }
  function sqrt2Bounds(places) {
    var scale = Math.pow(10, places), lower = Math.floor(Math.sqrt(2) * scale) / scale;
    return { lower: lower, upper: lower + 1 / scale };
  }
  function distanceInterval(center, radius) {
    return [center - radius, center + radius];
  }
  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    var out = 1;
    for (var i = 1; i <= k; i++) out = out * (n - i + 1) / i;
    return Math.round(out);
  }
  function pascalRow(n) {
    return Array.from({ length: n + 1 }, function (_, k) { return choose(n, k); });
  }
  function bernoulli(n, x) {
    return { left: Math.pow(1 + x, n), right: 1 + n * x };
  }
  function sumFormula(n) { return n * (n + 1) / 2; }
  var api = { binaryValue: binaryValue, sqrt2Bounds: sqrt2Bounds, distanceInterval: distanceInterval, choose: choose, pascalRow: pascalRow, bernoulli: bernoulli, sumFormula: sumFormula };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MEI2 = api;
})(this);
