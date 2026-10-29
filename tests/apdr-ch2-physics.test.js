// Check the APDR Chapter 2 lab rules against the worked guide examples.
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/apdr/ch2-physics.js");

test("square-root algorithm updates the guess and reaches the stated tolerance", () => {
  const first = P.squareRootStep(16, 3);
  assert.ok(Math.abs(first.next - 4.1666667) < 1e-6);
  const second = P.squareRootStep(16, first.next);
  assert.ok(Math.abs(second.next - 4.0033333) < 1e-6);
  assert.ok(second.residual > 0.01);
  const third = P.squareRootStep(16, second.next);
  assert.ok(third.residual < 0.01);
  assert.throws(() => P.squareRootStep(16, 0), RangeError);
});

test("APDR umbrella expression matches the guide's rule", () => {
  assert.equal(P.umbrella(false, false, false), false);
  assert.equal(P.umbrella(false, true, false), true);
  assert.equal(P.umbrella(false, false, true), true);
  assert.equal(P.umbrella(true, true, true), false);
});

test("NAND constructions reproduce NOT, AND, and OR for every input", () => {
  for (const a of [false, true]) {
    assert.equal(P.nand(a, a), !a);
    for (const b of [false, true]) {
      assert.equal(P.nandAnd(a, b), a && b);
      assert.equal(P.nandOr(a, b), a || b);
    }
  }
});

test("physical signal model preserves the old output until the stated delay", () => {
  assert.equal(P.delayedOutput(false, true, 0, 1), false);
  assert.equal(P.delayedOutput(false, true, 0.5, 1), false);
  assert.equal(P.delayedOutput(false, true, 1, 1), true);
  assert.throws(() => P.delayedOutput(false, true, 0, -1), RangeError);
});
