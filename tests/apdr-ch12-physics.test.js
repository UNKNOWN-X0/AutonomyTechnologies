const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/apdr/ch12-physics.js");

test("§1.2 absorption, De Morgan, and consensus agree on every input", () => {
  assert.deepEqual(P.truthTable(2, (x, y) => P.op("or", x, x && y)).map(r => r.value), [0, 0, 1, 1]);
  assert.deepEqual(P.truthTable(2, (x, y) => P.op("nor", x, y)).map(r => r.value), [1, 0, 0, 0]);
  for (const { bits: [x, y, z] } of P.truthTable(3, () => 0)) {
    assert.equal(Number((x && y) || (!x && z) || (y && z)), Number((x && y) || (!x && z)));
  }
});

test("§1.3 NAND constructions reproduce NOT, AND, and OR", () => {
  for (const { bits: [a, b] } of P.truthTable(2, () => 0)) {
    const nand = (x, y) => P.op("nand", x, y);
    assert.equal(Number(nand(a, a)), Number(!a));
    assert.equal(Number(nand(nand(a, b), nand(a, b))), Number(a && b));
    assert.equal(Number(nand(nand(a, a), nand(b, b))), Number(a || b));
  }
});

test("§1.4 K-map groups minimise the guide and slide truth sets", () => {
  assert.deepEqual(P.minimize([2, 3, 6, 7], 3).map(c => c.pattern), ["-1-"]);
  assert.deepEqual(P.minimize([1, 3, 5, 7], 3).map(c => c.pattern), ["--1"]);
  assert.deepEqual(P.minimize([1, 2, 5, 6], 3).map(c => c.pattern), ["-01", "-10"]);
  assert.deepEqual(P.minimize([], 3), []);
  assert.throws(() => P.minimize([8], 3), RangeError);
});

test("§1.5 Shannon cofactors and reduced OBDD counts", () => {
  assert.equal(Number(P.shannon(1, 0, 1)), 0);
  assert.equal(Number(P.shannon(0, 0, 1)), 1);
  const mux = (a, b, c) => a ? b : c;
  assert.equal(P.obddNodeCount(3, [0, 1, 2], mux), 3);
  assert.equal(P.obddNodeCount(3, [1, 2, 0], mux), 5);
  assert.throws(() => P.obddNodeCount(3, [0, 0, 2], mux), RangeError);
});

test("§1.5 Möbius transform recovers the ANF for XOR, AND, and OR", () => {
  assert.deepEqual(P.toAnf([0, 1, 1, 0]), [0, 1, 1, 0]);
  assert.deepEqual(P.toAnf([0, 0, 0, 1]), [0, 0, 0, 1]);
  assert.deepEqual(P.toAnf([0, 1, 1, 1]), [0, 1, 1, 1]);
  for (const row of P.truthTable(2, (a, b) => a !== b)) assert.equal(P.evalAnf([0, 1, 1, 0], row.bits), row.value);
});

test("§1.6 consensus coverage removes the static-1 hazard gap", () => {
  assert.equal(P.hazard(1, 1, 1, 1, 0.5).direct, 1);
  assert.equal(P.hazard(1, 1, 1, 1, 0.5).products, 0);
  assert.equal(P.hazard(1, 1, 1, 1, 0.5).consensus, 1);
  assert.equal(P.hazard(1, 0, 1, 1, 0.5).direct, 0);
});
