const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const P = require("../js/apdr/ch4-physics.js");

test("the five Chapter 4 experiments each have four stable challenges", () => {
  const source = fs.readFileSync(path.join(__dirname, "../js/apdr/ch4-lab.js"), "utf8");
  for (const id of ["spacing", "fractions", "arithmetic", "ieee", "special"]) {
    const block = source.match(new RegExp(`mount\\("${id}"[\\s\\S]*?\\], read`, "m"));
    assert.ok(block, `${id} experiment is registered`);
    assert.equal([...block[0].matchAll(/\{ id: "[^"]+"/g)].length, 4, `${id} has four challenges`);
  }
});

test("§4.2 binary-fraction examples convert in both directions", () => {
  assert.equal(P.fractionValue("0.01101"), 0.40625);
  assert.equal(P.fractionBits(0.6875).bits, "1011");
  assert.equal(P.fractionBits(0.6875).exact, true);
  assert.equal(P.fractionBits(0.1, 24).exact, false);
  assert.throws(() => P.fractionValue("0.102"), RangeError);
});

test("§4.1 significand precision controls spacing within a binade", () => {
  assert.equal(P.spacing(3, 4), 1);
  assert.equal(P.spacing(4, 4), 2);
  assert.equal(P.spacing(3, 5), 0.5);
  assert.throws(() => P.spacing(3, 0), RangeError);
});

test("§4.3 multiplication and addition align, normalise, and round", () => {
  const product = P.scientificOperation(2.6, 3, 5.4, -2, "multiply", 4);
  assert.equal(product.rounded, 140.4);
  assert.equal(product.roundedScientific.text, "1.404e+2");
  const sum = P.scientificOperation(4.5, 3, 6.7, 2, "add", 2);
  assert.deepEqual(sum.aligned, [4.5, 0.67]);
  assert.equal(sum.rounded, 5200);
  const lost = P.scientificOperation(3.4, 4, 5.6, 2, "add", 2);
  assert.equal(lost.exact, 34560);
  assert.equal(lost.rounded, 35000);
});

test("§4.4 IEEE single-precision worked examples encode and decode", () => {
  assert.equal(P.float32(42.6875).hex, "422AC000");
  assert.equal(P.decodeSingle("BEC00000").value, -0.375);
  assert.equal(P.float32(13.25).hex, "41540000");
  assert.throws(() => P.decodeSingle("BEC0000"), RangeError);
});

test("§4.4 IEEE addition restores hidden bits, aligns exponents, and rounds", () => {
  const result = P.singleAdd(42.6875, 0.375);
  assert.equal(result.exponentDifference, 7);
  assert.equal(result.significand, "1.010110001");
  assert.equal(result.exactSum, 43.0625);
  assert.equal(result.result.value, 43.0625);
});

test("§4.5 exponent and fraction fields classify special values", () => {
  assert.equal(P.classifySingle(0, "00000000", "00000000000000000000000"), "positive zero");
  assert.equal(P.classifySingle(1, "00000000", "00000000000000000000001"), "denormalised");
  assert.equal(P.classifySingle(0, "10000001", "00000000000000000000000"), "normalised");
  assert.equal(P.classifySingle(0, "11111111", "00000000000000000000000"), "positive infinity");
  assert.equal(P.classifySingle(1, "11111111", "00000000000000000000001"), "NaN");
});

test("lab challenge fraction-repeat: 0.1 repeats from remainder 0.2", () => {
  const r = P.remainderSteps(1, 10);
  assert.deepEqual(r.steps.map((s) => s.bit), [0, 0, 0, 1, 1]);
  assert.deepEqual(r.steps.map((s) => s.remainder), [0.1, 0.2, 0.4, 0.8, 0.6]);
  assert.equal(r.repeatsFrom, 1);
  assert.equal(P.remainderSteps(11, 16).repeatsFrom, null);
});

test("binary sandbox accepts a missing whole part and rejects bad digits", () => {
  assert.equal(P.fractionValue(".101"), 0.625);
  assert.equal(P.fractionValue("1.101"), 1.625);
  assert.throws(() => P.fractionValue("0.102"), RangeError);
});

test("decimal mode labels exact values without binary noise", () => {
  assert.equal(P.scientificOperation(1.1, 0, 2.2, 0, "add", 3).exactScientific.text, "3.3e+0");
  assert.equal(P.scientificOperation(2.6, 3, 5.4, -2, "multiply", 4).exactScientific.text, "1.404e+2");
});

test("IEEE addition names operands by exponent and carries into the exponent", () => {
  const r = P.singleAdd(0.375, 42.6875);
  assert.equal(r.larger.value, 42.6875);
  assert.equal(r.larger.significand, "1.010101011");
  assert.equal(r.smaller.significand, "1.1");
  assert.equal(r.resultExponent, 5);
  const carry = P.singleAdd(1.5, 1.5);
  assert.equal(carry.significand, "1.1");
  assert.equal(carry.resultExponent, 1);
  assert.equal(P.singleAdd(1, 1).significand, "1.0");
  assert.equal(P.singleAdd(1, 1).smaller.significand, "1.0");
  assert.equal(P.singleAdd(13.25, 0.375).significand, "1.101101");
});

test("practice 27, 28 and exam 2 single-precision words", () => {
  assert.equal(P.float32(0.375).hex, "3EC00000");
  assert.equal(P.decodeSingle("C1540000").value, -13.25);
  assert.equal(P.float32(43.0625).hex, "422C4000");
  assert.equal(P.float32(13.625).hex, "415A0000");
});

test("encode input rejects blank and hexadecimal text", () => {
  assert.throws(() => P.parseDecimal(""), RangeError);
  assert.throws(() => P.parseDecimal("0x10"), RangeError);
  assert.equal(P.parseDecimal("-1.5e2"), -150);
  assert.equal(P.parseDecimal("Infinity"), Infinity);
});
