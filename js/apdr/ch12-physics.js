/* Boolean-function calculations for the APDR Chapter 12a lab. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR12 = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function bit(x) { return x === 1 || x === true; }
  function truthTable(n, fn) {
    if (!Number.isInteger(n) || n < 1 || n > 4) throw new RangeError("use 1–4 variables");
    return Array.from({ length: 1 << n }, function (_, i) {
      var bits = Array.from({ length: n }, function (__, j) { return (i >> (n - j - 1)) & 1; });
      return { bits: bits, value: Number(!!fn.apply(null, bits)) };
    });
  }
  function op(name, a, b) {
    a = bit(a); b = bit(b);
    if (name === "and") return a && b;
    if (name === "or") return a || b;
    if (name === "xor") return a !== b;
    if (name === "nand") return !(a && b);
    if (name === "nor") return !(a || b);
    if (name === "implies") return !a || b;
    throw new RangeError("unknown Boolean operation");
  }
  function shannon(x, f1, f0) { return bit(x) ? bit(f1) : bit(f0); }
  function toAnf(values) {
    if (!Array.isArray(values) || values.length < 2 || values.length > 16 || (values.length & (values.length - 1))) throw new RangeError("truth table length must be a power of two from 2 to 16");
    var c = values.map(function (v) { if (v !== 0 && v !== 1 && v !== false && v !== true) throw new RangeError("truth values must be bits"); return Number(!!v); });
    for (var step = 1; step < c.length; step <<= 1) for (var i = 0; i < c.length; i++) if (i & step) c[i] ^= c[i ^ step];
    return c;
  }
  /* The table after each pass of the transform: the input, then one pass per variable, last variable first. */
  function anfSteps(values) {
    var c = toAnf(values).map(function (_, i) { return Number(!!values[i]); }), out = [c.slice()];
    for (var step = 1; step < c.length; step <<= 1) {
      for (var i = 0; i < c.length; i++) if (i & step) c[i] ^= c[i ^ step];
      out.push(c.slice());
    }
    return out;
  }
  function evalAnf(coefficients, bits) {
    var out = 0, n = bits.length;
    coefficients.forEach(function (coefficient, mask) {
      if (!coefficient) return;
      var term = 1;
      for (var j = 0; j < n; j++) if (mask & (1 << (n - j - 1))) term &= Number(bit(bits[j]));
      out ^= term;
    });
    return out;
  }
  function minimize(minterms, n, dontCares) {
    dontCares = dontCares || [];
    if (!Number.isInteger(n) || n < 1 || n > 4) throw new RangeError("use 1–4 variables");
    var max = 1 << n, ones = new Set(minterms), dc = new Set(dontCares), allowed = new Set([...ones, ...dc]);
    if ([...ones, ...dc].some(function (x) { return !Number.isInteger(x) || x < 0 || x >= max; }) || [...ones].some(function (x) { return dc.has(x); })) throw new RangeError("minterms must be distinct valid row indices");
    if (!ones.size) return [];
    var cubes = [];
    function generate(pattern, pos) {
      if (pos === n) {
        var covered = [];
        for (var k = 0; k < max; k++) {
          var good = pattern.split("").every(function (ch, j) { return ch === "-" || Number(ch) === ((k >> (n - j - 1)) & 1); });
          if (good) covered.push(k);
        }
        if (covered.length && covered.every(function (k) { return allowed.has(k); }) && covered.some(function (k) { return ones.has(k); })) cubes.push({ pattern: pattern, covered: covered.filter(function (k) { return ones.has(k); }), literals: pattern.replace(/-/g, "").length });
        return;
      }
      generate(pattern + "0", pos + 1); generate(pattern + "1", pos + 1); generate(pattern + "-", pos + 1);
    }
    generate("", 0);
    cubes.sort(function (a, b) { return a.literals - b.literals || b.covered.length - a.covered.length || a.pattern.localeCompare(b.pattern); });
    var best = null;
    function cover(remaining, chosen) {
      if (!remaining.size) {
        var cost = [chosen.length, chosen.reduce(function (s, c) { return s + c.literals; }, 0)];
        if (!best || cost[0] < best.cost[0] || (cost[0] === best.cost[0] && cost[1] < best.cost[1])) best = { cost: cost, cubes: chosen.slice() };
        return;
      }
      if (best && chosen.length >= best.cost[0]) return;
      var target = Array.from(remaining).sort(function (a, b) { return a - b; })[0];
      cubes.filter(function (c) { return c.covered.indexOf(target) >= 0; }).forEach(function (c) {
        var next = new Set(remaining); c.covered.forEach(function (x) { next.delete(x); });
        cover(next, chosen.concat(c));
      });
    }
    cover(ones, []);
    return best ? best.cubes : [];
  }
  function obdd(n, order, fn) {
    if (!Number.isInteger(n) || n < 1 || n > 4 || order.length !== n || new Set(order).size !== n || order.some(function (x) { return x < 0 || x >= n; })) throw new RangeError("order must list every variable once");
    var unique = new Map();
    function build(level, assignment) {
      if (level === n) return Number(!!fn.apply(null, assignment));
      var v = order[level];
      assignment[v] = 0; var lo = build(level + 1, assignment);
      assignment[v] = 1; var hi = build(level + 1, assignment);
      if (lo === hi) return lo;
      var key = v + ":" + lo + ":" + hi;
      if (!unique.has(key)) unique.set(key, { id: unique.size + 2, v: v, lo: lo, hi: hi });
      return unique.get(key).id;
    }
    var root = build(0, Array(n).fill(0));
    return { root: root, nodes: Array.from(unique.values()) };
  }
  function obddNodeCount(n, order, fn) { return obdd(n, order, fn).nodes.length; }
  function hazard(x, y, z, tau, t) {
    if (![0, 1].includes(x) || ![0, 1].includes(y) || ![0, 1].includes(z)) throw new RangeError("inputs must be bits");
    var off = Number(t >= tau * 0.25), on = Number(t >= tau * 0.75);
    var left = (x && y) || (!x && z), overlap = y && z;
    return { direct: Number(left), products: Number((x && y && !off) || (!x && z && on)), consensus: Number((x && y && !off) || (!x && z && on) || overlap), overlap: Number(!!overlap) };
  }
  return { truthTable: truthTable, op: op, shannon: shannon, toAnf: toAnf, anfSteps: anfSteps, evalAnf: evalAnf, minimize: minimize, obdd: obdd, obddNodeCount: obddNodeCount, hazard: hazard };
});
