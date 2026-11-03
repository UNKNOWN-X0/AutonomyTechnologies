// Checks Chapter 1 lab answers against the logic and set definitions in the guide.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const P = require("../js/mei/ch1-physics.js");

// Runs the real lab script with a stand-in DOM and returns its challenge data.
function labChallenges() {
  const fake = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : fake()), apply: () => fake(), set: () => true });
  const defs = [];
  const ctx = vm.createContext({ document: fake(), Lab: { experiment: (d) => defs.push(d), tween: () => Promise.resolve() }, MEI1: P });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/mei/ch1-lab.js"), "utf8"), ctx);
  return defs.flatMap((d) => d.challenges);
}

for (const c of labChallenges()) {
  test("lab challenge " + c.id + ": answer key is computed, not typed", () => assert.equal(c.solve(), c.answer));
}

const V = (a, b, c) => (a && b) || (a && c) || (b && c);
const cube = P.product(P.product([0, 1], [0, 1]), [0, 1]).map(([p, c]) => [...p, c]);

test("practice 5: negated implication", () => {
  for (const r of P.truthTable(P.operators.implies)) assert.equal(!r.value, r.A && !r.B);
});

test("practice 25: (A∨B)∧(A∨¬B) simplifies to A", () => {
  for (const [a, b] of cube) assert.equal(!!((a || b) && (a || !b)), !!a);
});

test("practice 27 and exam 1: majority vote", () => {
  assert.deepEqual([V(1, 1, 0), V(1, 1, 1)].map(Boolean), [true, true]);
  assert.deepEqual([V(1, 0, 0), V(1, 0, 1)].map(Boolean), [false, true]);
  assert.equal(cube.filter(([a, b, c]) => V(a, b, c)).length, 4);
});

test("practice 28: unions, intersections and products of three sets", () => {
  const u = P.setOp(P.setOp([1, 2], [2, 3], "union"), [2, 4], "union");
  assert.deepEqual([...u].sort(), [1, 2, 3, 4]);
  assert.deepEqual(P.setOp(P.setOp([1, 2], [2, 3], "intersection"), [2, 4], "intersection"), [2]);
  assert.equal(P.product(P.product([1, 2], [2, 3]), [2, 4]).length, 8);
});

test("practice 31: distributive law over all eight rows", () => {
  for (const [a, b, c] of cube) assert.equal(!!(a && (b || c)), !!((a && b) || (a && c)));
});

test("practice 32: {0,1}³ has 8 triples", () => assert.equal(cube.length, 8));

test("practice 33: satisfiability", () => {
  const rows = cube.map(([a, b]) => [!!a, !!b]);
  assert.equal(rows.some(([a, b]) => (a || b) && !a && !b), false);
  assert.equal(rows.some(([a, b]) => (a || b) && !a), true);
});

test("slip page 4: the two coffee sentences differ", () => {
  const first = (m, s, d) => !(m || s) || !d, second = (m, s, d) => !(!m && !s) || !!d;
  assert.equal(cube.filter(([m, s, d]) => first(m, s, d) !== second(m, s, d)).length, 4);
});

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
  assert.equal(P.quantifier([1, 2], (x) => [1, 2].some((y) => x !== y), "forall"), true);
  assert.equal(P.quantifier([1, 2], (y) => [1, 2].every((x) => x !== y), "exists"), false);
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

test("practice 6 and 14: interval intersection, union ends, and complement", () => {
  const I = P.interval, F = P.formatInterval;
  assert.equal(F(P.intersect(I(0, 2, true, true), I(1, 3, false, false))), "(1,2]");
  assert.equal(P.complement(I(-1, 3, false, true)).map(F).join(" ∪ "), "(−∞,−1] ∪ (3,∞)");
  assert.equal(P.inInterval(I(-1, 3, false, true), 3), true);
  assert.equal(P.inInterval(I(-1, 3, false, true), -1), false);
  assert.equal(P.intersect(I(0, 1, true, false), I(1, 2, true, true)), null);
});

test("lab vote: one faulty sensor matters only when the others disagree", () => {
  assert.deepEqual([P.vote(1, 1, 0), P.vote(1, 1, 1)], [true, true]);
  assert.deepEqual([P.vote(1, 0, 0), P.vote(1, 0, 1)], [false, true]);
  assert.deepEqual([P.vote(0, 0, 0), P.vote(0, 0, 1)], [false, false]);
});
