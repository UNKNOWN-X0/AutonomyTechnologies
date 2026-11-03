// MEI Chapter 3 lab answer keys and representative guide claims.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const P = require("../js/mei/ch3-physics.js");

function challenges() {
  const fake = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : fake()), apply: () => fake(), set: () => true });
  const defs = [];
  const ctx = vm.createContext({ document: fake(), getComputedStyle: fake(), Lab: { experiment: d => defs.push(d), tween: () => Promise.resolve() }, MEI3: P });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/mei/ch3-lab.js"), "utf8"), ctx);
  return defs;
}

test("five Chapter 3 experiments each register four solved challenges", () => {
  const defs = challenges();
  assert.deepEqual(defs.map(d => d.id), ["mappings", "inverse", "composition", "elementary", "polar"]);
  for (const def of defs) {
    assert.equal(def.challenges.length, 4, def.id);
    for (const c of def.challenges) assert.equal(c.solve(), c.answer, c.id);
  }
});

test("mapping image and type depend on the stated codomain", () => {
  assert.deepEqual(P.mapping("square").image, [0, 1, 4]);
  assert.equal(P.mapping("square").injective, false);
  assert.equal(P.mapping("square").surjective, true);
  assert.equal(P.mapping("square-gap").surjective, false);
  assert.equal(P.mapping("shift").injective && P.mapping("shift").surjective, true);
});

test("inverse examples preserve their restricted domains", () => {
  assert.equal(P.inverseAffine(2, 3, 11), 4);
  assert.equal(P.inverseSquare(9), 3);
  assert.ok(Number.isNaN(P.inverseSquare(-1)));
});

test("composition order and domain checks match the guide", () => {
  assert.equal(P.composition(2, "gof"), 25);
  assert.equal(P.composition(2, "fog"), 9);
  assert.equal((0.5 - 1) < 0, true);
});

test("elementary function checks match the guide", () => {
  assert.equal(P.discriminant(1, -2, -3), 16);
  assert.deepEqual(P.roots(1, -2, -3), [-1, 3]);
  assert.equal(P.logDefined(-1), false);
  assert.equal(P.tanUndefined(Math.PI / 2), true);
});

test("polar conversions handle quadrants, components, and the origin", () => {
  const q3 = P.cartesianToPolar(-1, -Math.sqrt(3));
  assert.ok(Math.abs(q3.r - 2) < 1e-12);
  assert.ok(Math.abs(q3.phi - 4 * Math.PI / 3) < 1e-12);
  const xy = P.polarToCartesian(4, Math.PI / 3);
  assert.ok(Math.abs(xy.x - 2) < 1e-12);
  assert.ok(Math.abs(xy.y - 2 * Math.sqrt(3)) < 1e-12);
  assert.equal(P.cartesianToPolar(0, 0).phi, null);
});
