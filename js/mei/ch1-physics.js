/* MEI Chapter 1 logic and set operations. Plain functions shared by the lab and Node tests. */
(function (root) {
  var operators = {
    not: function (a) { return !a; },
    and: function (a, b) { return a && b; },
    or: function (a, b) { return a || b; },
    implies: function (a, b) { return !a || b; },
    iff: function (a, b) { return a === b; },
    xor: function (a, b) { return a !== b; },
  };
  function truthTable(fn) {
    return [[false, false], [false, true], [true, false], [true, true]].map(function (row) {
      return { A: row[0], B: row[1], value: !!fn(row[0], row[1]) };
    });
  }
  function quantifier(values, predicate, kind) {
    var results = values.map(predicate);
    return kind === "forall" ? results.every(Boolean) : results.some(Boolean);
  }
  function member(set, x) { return set.indexOf(x) !== -1; }
  function setOp(A, B, op, universe) {
    var all = op === "complement" ? universe || [] : Array.from(new Set(A.concat(B)));
    return all.filter(function (x) {
      var a = member(A, x), b = member(B, x);
      return op === "union" ? a || b : op === "intersection" ? a && b : op === "difference" ? a && !b : !a;
    });
  }
  function powerSet(A) {
    return A.reduce(function (sets, x) { return sets.concat(sets.map(function (s) { return s.concat([x]); })); }, [[]]);
  }
  function product(A, B) {
    return A.flatMap(function (a) { return B.map(function (b) { return [a, b]; }); });
  }
  // Majority vote of three sensors, V ⇔ (A ∧ B) ∨ (A ∧ C) ∨ (B ∧ C).
  function vote(a, b, c) { return !!((a && b) || (a && c) || (b && c)); }
  // A real interval; an infinite end is never included.
  function interval(lo, hi, loIn, hiIn) { return { lo: lo, hi: hi, loIn: !!loIn && isFinite(lo), hiIn: !!hiIn && isFinite(hi) }; }
  function inInterval(I, x) { return (x > I.lo || (I.loIn && x === I.lo)) && (x < I.hi || (I.hiIn && x === I.hi)); }
  // Complement in ℝ: the parts left and right of I, each taking the opposite bracket at the shared end.
  function complement(I) {
    var out = [];
    if (I.lo > -Infinity) out.push(interval(-Infinity, I.lo, false, !I.loIn));
    if (I.hi < Infinity) out.push(interval(I.hi, Infinity, !I.hiIn, false));
    return out;
  }
  function intersect(I, J) {
    var lo = Math.max(I.lo, J.lo), hi = Math.min(I.hi, J.hi);
    var loIn = (I.lo !== lo || I.loIn) && (J.lo !== lo || J.loIn), hiIn = (I.hi !== hi || I.hiIn) && (J.hi !== hi || J.hiIn);
    if (lo > hi || (lo === hi && !(loIn && hiIn))) return null;
    return interval(lo, hi, loIn, hiIn);
  }
  function formatInterval(I) {
    function n(v) { return v === Infinity ? "∞" : v === -Infinity ? "−∞" : v < 0 ? "−" + -v : String(v); }
    return (I.loIn ? "[" : "(") + n(I.lo) + "," + n(I.hi) + (I.hiIn ? "]" : ")");
  }
  var api = { operators: operators, truthTable: truthTable, quantifier: quantifier, setOp: setOp, powerSet: powerSet, product: product,
    vote: vote, interval: interval, inInterval: inInterval, complement: complement, intersect: intersect, formatInterval: formatInterval };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MEI1 = api;
})(this);
