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
  var api = { operators: operators, truthTable: truthTable, quantifier: quantifier, setOp: setOp, powerSet: powerSet, product: product };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MEI1 = api;
})(this);
