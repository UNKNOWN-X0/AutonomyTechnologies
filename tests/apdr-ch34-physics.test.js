// Chapter 34a combined lab calculations and one guide example per experiment.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const P = require("../js/apdr/ch34-physics.js");

test("the six combined experiments each register four prediction challenges", () => {
  const source = fs.readFileSync(require.resolve("../js/apdr/ch34-lab.js"), "utf8");
  for (const id of ["integers", "arithmetic", "fractions", "spacing", "ieee", "stability"]) {
    const start = source.indexOf(`mount("${id}"`);
    const end = source.indexOf("], { heading:", start);
    assert.notEqual(start, -1, `${id} experiment is registered`);
    assert.notEqual(end, -1, `${id} challenge list is closed`);
    assert.equal([...source.slice(start, end).matchAll(/\bspec\("/g)].length, 4, `${id} has four challenges`);
  }
});

test("3.1–3.2 guide examples convert bases, decode bias, and encode BCD", () => {
  assert.equal(P.convert("53", 10, 2).result, "110101");
  assert.equal(P.decodeInteger("001", "excess", 4), -3);
  assert.equal(P.encodeBcd(42), "0100 0010");
});

test("3.4–3.5 guide arithmetic distinguishes exact result and overflow", () => {
  assert.deepEqual(P.unsignedArithmetic("11101", "00101", "divide"), {
    quotient: 5, remainder: 4, quotientBits: "101", remainderBits: "100",
  });
  assert.equal(P.twosArithmetic("0101", "0011", "add").overflow, true);
  assert.equal(P.twosArithmetic("1011", "0011", "add").decoded, -2);
  assert.equal(P.twosArithmetic("0110", "0011", "add").decoded, -7); // practice 35
  assert.equal(P.twosArithmetic("0110", "0011", "add").overflow, true);
  assert.equal(P.unsignedArithmetic("1101", "101", "multiply").bits, "1000001"); // worked multiplication
  assert.deepEqual(P.unsignedArithmetic("10111", "11", "divide"), { quotient: 7, remainder: 2, quotientBits: "111", remainderBits: "10" }); // worked division
});

test("lab challenge carry-no-overflow has a carry-out and no overflow", () => {
  const r = P.twosArithmetic("1011", "0111", "add");
  assert.deepEqual([r.pattern, r.decoded, r.carryOut, r.overflow], ["0010", 2, true, false]);
  assert.equal(P.twosArithmetic("0101", "0011", "add").carryOut, false);
  assert.equal(P.addColumns("1011", "0111").carryOut, 1);
  assert.equal(P.addColumns("1011", "0111").sum.join(""), "0010");
  assert.deepEqual(P.addColumns("0101", "0011").carries, [1, 1, 1, 0]);
});

test("4.2 guide examples convert terminating fractions and identify repeating fractions", () => {
  assert.equal(P.fractionValue("0.01101"), 0.40625);
  assert.deepEqual(P.fractionBits(0.6875, 8), { bits: "1011", exact: true, remainder: 0 });
  assert.equal(P.fractionBits(0.1, 24).exact, false);
});

test("4.1 guide spacing and machine epsilon scale with precision and exponent", () => {
  assert.equal(P.spacing(0, 24), 2 ** -23);
  assert.equal(P.spacing(3, 24), 2 ** -20);
  assert.equal(P.spacing(0, 53), 2 ** -52);
  assert.equal(P.decodeSingle("00000001").value, 2 ** -149); // sandbox subnormal
});

test("4.4 guide examples decode normal, infinity, and NaN fields", () => {
  assert.equal(P.decodeSingle("3F800000").value, 1);
  assert.equal(P.decodeSingle("C1200000").value, -10);
  assert.equal(P.decodeSingle("7F800000").classification, "positive infinity");
  assert.equal(P.decodeSingle("7FC00000").classification, "NaN");
});

test("4.5 guide examples quantify cancellation, Sterbenz subtraction, and stable roots", () => {
  assert.ok(Math.abs(P.cancellation().relativeError - 0.800180018) < 1e-8);
  assert.equal(P.subtractExactBySterbenz(1.5, 1), 0.5);
  assert.deepEqual(P.stableQuadratic(1, 0, -1).roots, [-1, 1]);
  assert.ok(Math.abs(P.stableQuadratic(1, 1e8, 1).roots[1] + 1e-8) < 1e-15);
  assert.throws(() => P.stableQuadratic(1, 0, 1), RangeError);
});

test("4.5 stable roots scale coefficients before forming the discriminant", () => {
  const large = P.stableQuadratic(1, 1e200, 1).roots;
  assert.ok(large.every(Number.isFinite));
  assert.ok(Math.abs(large[0] / -1e200 - 1) < 1e-15);
  assert.ok(Math.abs(large[1] / -1e-200 - 1) < 1e-15);
  assert.deepEqual(P.stableQuadratic(1e-200, 2e-200, 0.75e-200).roots, [-1.5, -0.5]);
  assert.match(String(P.stableQuadratic(1e-200, 2e-200, 0.75e-200).discriminant), /×/);
  const tinyRoots = P.stableQuadratic(1e308, 0, -1e-308);
  assert.ok(Math.abs(tinyRoots.roots[0] / -1e-308 - 1) < 1e-15);
  assert.ok(Math.abs(tinyRoots.roots[1] / 1e-308 - 1) < 1e-15);
  assert.ok(tinyRoots.discriminant > 0);
  assert.throws(() => P.stableQuadratic(1e308, 1e-308, 1e-308), RangeError);
});

test("combined lab experiments follow chapter order", () => {
  const html = fs.readFileSync(require.resolve("../apdr/ch34a-integer-and-floating-point-lab.html"), "utf8");
  const order = ["integers", "arithmetic", "spacing", "fractions", "ieee", "stability"];
  assert.deepEqual([...html.matchAll(/<section id="exp-([^"]+)"/g)].map(m => m[1]), order);
  assert.ok(html.indexOf('href="#exp-spacing"') < html.indexOf('href="#exp-fractions"'));
  const source = fs.readFileSync(require.resolve("../js/apdr/ch34-lab.js"), "utf8");
  assert.deepEqual([...source.matchAll(/mount\("(integers|arithmetic|spacing|fractions|ieee|stability)"/g)].map(m => m[1]), order);
});
