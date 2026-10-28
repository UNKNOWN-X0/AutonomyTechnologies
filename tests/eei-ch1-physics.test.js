// Checks the lab's physics against answers worked in the Chapter 1 guide. Run: node --test tests/
const test = require("node:test");
const assert = require("node:assert");
const P = require("../js/eei-ch1-physics.js");

const close = (actual, expected, rel = 0.005) =>
  assert.ok(Math.abs(actual - expected) <= Math.abs(expected) * rel, `${actual} is not within ${rel * 100}% of ${expected}`);
const nC = 1e-9;

test("field of a point charge: practice 7, 899 V/m at 0.20 m from −4 nC", () => {
  const [ex, ey] = P.field([{ x: 0, y: 0, q: -4 * nC }], 0.2, 0);
  close(Math.hypot(ex, ey), 899);
  assert.ok(ex < 0, "the field points toward a negative charge");
});

test("superposition: practice 13, 1.29e4 V/m along +x", () => {
  const [ex, ey] = P.field([{ x: 0, y: 0, q: 3 * nC }, { x: 0.06, y: 0, q: -3 * nC }], 0.03, 0.04);
  close(ex, 1.294e4);
  assert.ok(Math.abs(ey) < 1e-6);
});

test("superposition: worked example 1.4, 1.15e4 V/m along +x", () => {
  const [ex, ey] = P.field([{ x: 0, y: 0.03, q: 2 * nC }, { x: 0, y: -0.03, q: 2 * nC }], 0.04, 0);
  close(ex, 1.15e4, 0.01);
  assert.ok(Math.abs(ey) < 1e-6);
});

test("potential: practice 9, 89.9 V at 0.30 m from +3 nC", () => {
  close(P.potential([{ x: 0, y: 0, q: 3 * nC }], 0.3, 0), 89.9);
});

test("work: worked example 1.8, bringing +1 nC to 0.10 m from +2 nC costs 1.8e-7 J", () => {
  const src = [{ x: 0, y: 0, q: 2 * nC }];
  close(P.work(1 * nC, 0, P.potential(src, 0.1, 0)), 1.798e-7);
});

test("work: practice 19, −2 nC from 0.20 m to 0.10 m from +5 nC is −0.45 μJ", () => {
  const src = [{ x: 0, y: 0, q: 5 * nC }];
  close(P.work(-2 * nC, P.potential(src, 0.2, 0), P.potential(src, 0.1, 0)), -4.494e-7);
});

test("lab challenge: pulling −1 nC from 10 cm to 20 cm away from +2 nC costs +89.9 nJ", () => {
  const src = [{ x: 0, y: 0, q: 2 * nC }];
  close(P.work(-1 * nC, P.potential(src, 0.1, 0), P.potential(src, 0.2, 0)), 8.988e-8);
});

test("null point: practice 37, 12.4 cm from +Q toward +2Q at 30 cm", () => {
  const x = P.nullPoint(1, 2, 0.3);
  close(x, 0.1243);
  const [ex] = P.field([{ x: 0, y: 0, q: 1 * nC }, { x: 0.3, y: 0, q: 2 * nC }], x, 0);
  assert.ok(Math.abs(ex) < 1e-6);
});

test("fmt uses SI prefixes and a true minus sign", () => {
  assert.strictEqual(P.fmt(1150, "V/m"), "1.15 kV/m");
  assert.strictEqual(P.fmt(-4.494e-7, "J"), "−449 nJ");
  assert.strictEqual(P.fmt(0, "J"), "0 J");
});
