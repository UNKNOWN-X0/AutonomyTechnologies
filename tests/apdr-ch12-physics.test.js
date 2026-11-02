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

test("lab challenges group-four, wrap-column, dont-care, two-pairs and sandbox minterms 4-7", () => {
  assert.deepEqual(P.minimize([2, 3, 6, 7], 3).map(c => c.pattern), ["-1-"]);
  assert.deepEqual(P.minimize([0, 2, 4, 6], 3).map(c => c.pattern), ["--0"]);
  assert.deepEqual(P.minimize([1, 3, 7], 3, [5]).map(c => c.pattern), ["--1"]);
  assert.equal(P.minimize([1, 3, 7], 3).length, 2);
  assert.deepEqual(P.minimize([1, 2, 5, 6], 3).map(c => c.pattern), ["-01", "-10"]);
  assert.deepEqual(P.minimize([4, 5, 6, 7], 3).map(c => c.pattern), ["1--"]);
});

test("practice 16 (slide 36 rows) reduce to Z; practice 22 reduces to C′", () => {
  assert.deepEqual(P.minimize([1, 3, 7, 11, 15], 4, [5, 9, 13]).map(c => c.pattern), ["---1"]);
  assert.deepEqual(P.minimize([0, 2, 4, 6], 3).map(c => c.pattern), ["--0"]);
});

test("lab challenge mux-count and practice 21: A?B:C has 3 nodes for A,B,C and 5 for B,C,A", () => {
  const mux = (a, b, c) => a ? b : c;
  assert.equal(P.obdd(3, [0, 1, 2], mux).nodes.length, 3);
  assert.equal(P.obdd(3, [1, 2, 0], mux).nodes.length, 5);
});

test("practice 23 and worked Möbius: 1,0,0,1 and NAND 1,1,1,0", () => {
  assert.deepEqual(P.toAnf([1, 0, 0, 1]), [1, 1, 1, 0]);
  assert.deepEqual(P.anfSteps([1, 1, 1, 0]), [[1, 1, 1, 0], [1, 0, 1, 1], [1, 0, 0, 1]]);
});

test("lab challenge product-complement: (xy)' and x'y' differ on rows 01 and 10", () => {
  const diff = P.truthTable(2, () => 0).filter(({ bits: [x, y] }) => Number(!(x && y)) !== Number(!x && !y)).map(r => r.bits.join(""));
  assert.deepEqual(diff, ["01", "10"]);
});

test("practice 15: f=x is monotone and affine; only constants and single variables are both", () => {
  const rows = 8; let count = 0;
  for (let f = 0; f < 256; f++) {
    const val = i => (f >> i) & 1;
    let mono = true;
    for (let a = 0; a < rows; a++) for (let b = 0; b < rows; b++) if ((a & b) === a && val(a) > val(b)) mono = false;
    const c = P.toAnf(Array.from({ length: rows }, (_, i) => val(i)));
    const affine = [3, 5, 6, 7].every(i => !c[i]);
    if (mono && affine) count++;
  }
  assert.equal(count, 5);
});
