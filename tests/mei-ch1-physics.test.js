// Checks Chapter 1 lab answers against the logic and set definitions in the guide.
const test = require("node:test");
const assert = require("node:assert");
const P = require("../js/mei/ch1-physics.js");

test("truth tables: implication false row and contrapositive", () => {
  assert.equal(P.operators.implies(true, false), false);
  assert.deepEqual(P.truthTable(P.operators.implies).map((r) => r.value), [true, true, false, true]);
  assert.deepEqual(P.truthTable((a, b) => P.operators.implies(!b, !a)).map((r) => r.value), [true, true, false, true]);
});

test("truth tables: inclusive OR, converse, and De Morgan", () => {
  assert.equal(P.operators.or(true, true), true);
  assert.notEqual(P.operators.implies(false, true), P.operators.implies(true, false));
  for (const [a, b] of [[false, false], [false, true], [true, false], [true, true]]) {
    assert.equal(!P.operators.and(a, b), P.operators.or(!a, !b));
  }
});

test("quantifiers: finite-domain universal, existential, negation and counterexample", () => {
  const D = [1, 2, 3], even = (x) => x % 2 === 0;
  assert.equal(P.quantifier(D, even, "forall"), false);
  assert.equal(P.quantifier(D, even, "exists"), true);
  assert.equal(P.quantifier(D, (x) => !even(x), "exists"), true);
  assert.equal(P.quantifier([1, 2], (x) => [1, 2].some((y) => x < y), "forall"), false);
  assert.equal(P.quantifier([-1, 1], (x) => x * x === 1, "forall"), true);
});

test("sets: union, intersection, complement, and De Morgan", () => {
  const A = [1, 2], B = [2, 3], U = [1, 2, 3, 4];
  assert.deepEqual(P.setOp(A, B, "union"), [1, 2, 3]);
  assert.deepEqual(P.setOp(A, B, "intersection"), [2]);
  assert.deepEqual(P.setOp(A, B, "complement", U), [3, 4]);
  assert.deepEqual(P.setOp(P.setOp(A, B, "union"), [], "complement", U), [4]);
  assert.deepEqual(P.setOp(A, B, "difference"), [1]);
});

test("finite sets: empty subset, power set size, coordinate order, and empty product", () => {
  assert.equal([].every((x) => ["a", "b"].includes(x)), true);
  assert.equal(P.powerSet(["a", "b", "c"]).length, 8);
  assert.deepEqual(P.product([1, 2], ["x"]), [[1, "x"], [2, "x"]]);
  assert.deepEqual(P.product([], [1, 2]), []);
});
