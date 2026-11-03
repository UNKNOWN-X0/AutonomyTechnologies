// MEI Chapter 2 experiment math and representative guide claims.
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/mei/ch2-physics.js");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Runs the real lab script with a stand-in DOM and returns its challenge data.
function labChallenges() {
  const fake = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : fake()), apply: () => fake(), set: () => true });
  const defs = [];
  const ctx = vm.createContext({ document: fake(), getComputedStyle: fake(), Lab: { experiment: (d) => defs.push(d), tween: () => Promise.resolve() }, MEI2: P });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/mei/ch2-lab.js"), "utf8"), ctx);
  return defs.flatMap((d) => d.challenges);
}

test("the lab has 20 challenges", () => assert.equal(labChallenges().length, 20));
for (const c of labChallenges()) {
  test("lab challenge " + c.id + ": answer key is computed, not typed", () => assert.equal(c.solve(), c.answer));
}

test("practice 3 and 22: sum of squares and a telescoping sum", () => {
  for (let n = 1; n <= 30; n++) {
    let squares = 0, tele = 0;
    for (let k = 1; k <= n; k++) { squares += k * k; tele += 1 / (k * (k + 1)); }
    assert.equal(squares, n * (n + 1) * (2 * n + 1) / 6);
    assert.ok(Math.abs(tele - n / (n + 1)) < 1e-12);
  }
});

test("binary place values", () => {
  assert.equal(P.binaryValue("101101"), 45);
  assert.equal(P.binaryValue("00000"), 0);
});

test("rational bounds approach sqrt(2) from opposite sides", () => {
  for (let places = 0; places <= 6; places++) {
    const { lower, upper } = P.sqrt2Bounds(places);
    assert.ok(lower * lower < 2);
    assert.ok(upper * upper > 2);
    assert.ok(upper - lower <= 1);
  }
});

test("absolute value distance interval", () => {
  assert.deepEqual(P.distanceInterval(2, 3), [-1, 5]);
  assert.equal(Math.abs(-1 - 2), 3);
  assert.equal(Math.abs(5 - 2), 3);
});

test("binomial coefficients and Pascal rows", () => {
  assert.deepEqual(P.pascalRow(4), [1, 4, 6, 4, 1]);
  assert.equal(P.choose(5, 2), 10);
  assert.equal(P.choose(3, 1) * 2, 6); // coefficient of x² in (x+2)³
});

test("Bernoulli and sum induction examples", () => {
  assert.deepEqual(P.bernoulli(4, 0.5), { left: 5.0625, right: 3 });
  for (let n = 1; n <= 20; n++) {
    assert.equal(P.sumFormula(n), P.sumFormula(n - 1) + n);
    assert.equal(P.sumFormula(n), n * (n + 1) / 2);
  }
});
