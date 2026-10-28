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

const mm = 1e-3;
const plate = (o) => Object.assign({ A: 0.01, d: 4 * mm, slab: "none", t: 0, er: 1 }, o);

test("plate capacitor: practice 31, εr = 2, 0.020 m², 1.0 mm is 354 pF", () => {
  close(P.plate(plate({ A: 0.02, d: 1 * mm, slab: "dielectric", t: 1 * mm, er: 2 })), 3.54e-10);
});

test("slabs at fixed charge: practice 10, empty 4.0 V, metal 3.0 V, εr = 5 gives 3.2 V", () => {
  const Q = P.bench(plate({}), "connected", 4).Q; // 1000 V/m across 4 mm
  close(P.bench(plate({}), "isolated", Q).U, 4.0);
  close(P.bench(plate({ slab: "metal", t: 1 * mm }), "isolated", Q).U, 3.0);
  close(P.bench(plate({ slab: "dielectric", t: 1 * mm, er: 5 }), "isolated", Q).U, 3.2);
});

test("dielectric fills the gap: practice 23, 10 nF at 100 V then εr = 4", () => {
  // choose A so that the empty capacitor is 10 nF
  const A = (10e-9 * 4 * mm) / P.EPS0;
  const empty = P.bench(plate({ A }), "connected", 100);
  close(empty.C, 10e-9);
  close(empty.W, 50e-6);
  const filled = plate({ A, slab: "dielectric", t: 4 * mm, er: 4 });
  const off = P.bench(filled, "isolated", empty.Q);
  close(off.U, 25);
  close(off.W, 12.5e-6);
  const on = P.bench(filled, "connected", 100);
  close(on.Q, 4e-6);
  close(on.W, 200e-6);
});

test("lab challenges: gap doubled at fixed Q doubles U; at fixed U halves Q", () => {
  const start = P.bench(plate({}), "connected", 100);
  close(P.bench(plate({ d: 8 * mm }), "isolated", start.Q).U, 200);
  close(P.bench(plate({ d: 8 * mm }), "connected", 100).Q, start.Q / 2);
});

test("lab challenge: 2 mm slab in a 4 mm gap at fixed Q, dielectric 62.5 V, metal 50 V", () => {
  const Q = P.bench(plate({}), "connected", 100).Q;
  close(P.bench(plate({ slab: "dielectric", t: 2 * mm, er: 4 }), "isolated", Q).U, 62.5);
  close(P.bench(plate({ slab: "metal", t: 2 * mm }), "isolated", Q).U, 50);
});

const uF = 1e-6;
test("networks: practice 20, 6 μF and 3 μF are 9 μF parallel, 2 μF series", () => {
  close(P.network([6 * uF, 3 * uF], "parallel", 12).C, 9 * uF);
  close(P.network([6 * uF, 3 * uF], "series", 12).C, 2 * uF);
});

test("networks: worked example 1.13, series at 12 V gives 24 μC, 4 V and 8 V", () => {
  const n = P.network([6 * uF, 3 * uF], "series", 12);
  close(n.Q, 24e-6);
  close(n.parts[0].U, 4);
  close(n.parts[1].U, 8);
  close(n.parts[0].Q, n.parts[1].Q);
});

test("networks: practice 8, 2 μF and 8 μF in series at 10 V, 16 μC, 8 V and 2 V", () => {
  const n = P.network([2 * uF, 8 * uF], "series", 10);
  close(n.Q, 16e-6);
  close(n.parts[0].U, 8);
  close(n.parts[1].U, 2);
});

test("networks: energy adds up to ½ C_total U²", () => {
  for (const how of ["series", "parallel"]) {
    const n = P.network([1 * uF, 2 * uF, 4 * uF], how, 7);
    close(n.parts.reduce((s, p) => s + p.W, 0), 0.5 * n.C * 49);
  }
});

test("interface: worked example 1.11, 100 V/m at 45° into εr = 4", () => {
  const r = P.interface(100, 45, 1, 4, 0);
  close(r.Et, 70.71);
  close(r.En2, 17.68);
  close(r.E2, 72.89);
  close(r.a2, 75.96);
});

test("interface: practice 25, 200 V/m at 30° from εr 2 into εr 6", () => {
  const r = P.interface(200, 30, 2, 6, 0);
  close(r.En1, 173.2);
  close(r.En2, 57.74);
  close(r.E2, 115.5);
  close(r.a2, 60);
});

test("interface: practice 6, ε1 = 2ε0, ε2 = 4ε0, En1 = 100 V/m gives En2 = 50 V/m", () => {
  const r = P.interface(100, 0, 2, 4, 0);
  close(r.En2, 50);
  close(r.Dn1, r.Dn2);
});

test("interface: positive surface charge raises normal D on side 2 by σ", () => {
  const r = P.interface(100, 45, 1, 1, 0.885e-9);
  close(r.Dn2 - r.Dn1, 0.885e-9);
  assert.ok(r.a2 < 45, "the line bends toward the normal");
});

test("cylinder: practice 24, ρv = 4 μC/m³, a = 0.10 m, D(0.05 m) = 1.0e-7 C/m²", () => {
  close(P.cylinder(4e-6, 0.1, 0.05, 1).D, 1e-7);
});

test("cylinder: inside ρv ρ/2, outside ρv a²/(2ρ), equal at ρ = a (practice 12)", () => {
  const rv = 4e-6, a = 0.1;
  close(P.cylinder(rv, a, 0.03, 1).D, (rv * 0.03) / 2);
  close(P.cylinder(rv, a, 0.25, 1).D, (rv * a * a) / (2 * 0.25));
  close(P.cylinder(rv, a, a, 1).D, (rv * a) / 2);
});

test("cylinder: lab challenges, D halves from a to 2a, a/2 encloses a quarter, εr changes E not D", () => {
  const rv = 4e-6, a = 0.1;
  close(P.cylinder(rv, a, 2 * a, 1).D, P.cylinder(rv, a, a, 1).D / 2);
  close(P.cylinder(rv, a, a / 2, 1).q, P.cylinder(rv, a, a, 1).total / 4);
  close(P.cylinder(rv, a, 0.2, 4).D, P.cylinder(rv, a, 0.2, 1).D);
  close(P.cylinder(rv, a, 0.2, 4).E, P.cylinder(rv, a, 0.2, 1).E / 4);
});

test("lab challenge: midway between +1 nC and −1 nC 14 cm apart, E = 3.67 kV/m toward the − charge", () => {
  const [ex, ey] = P.field([{ x: -0.07, y: 0, q: 1e-9 }, { x: 0.07, y: 0, q: -1e-9 }], 0, 0);
  close(ex, 3669);
  assert.ok(Math.abs(ey) < 1e-6);
});
