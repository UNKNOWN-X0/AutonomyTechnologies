// Chapter 3 calculations follow the supplied number and data representation guide.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const P = require("../js/apdr/ch3-physics.js");

test("the five Chapter 3 experiments each have four challenges", () => {
  const source = fs.readFileSync(path.join(__dirname, "../js/apdr/ch3-lab.js"), "utf8");
  for (const id of ["bases", "encodings", "characters", "unsigned", "signed"]) {
    const start = source.indexOf(`Lab.experiment({ id: "${id}"`);
    const end = source.indexOf("\n      ] });", start);
    assert.notEqual(start, -1, `${id} experiment is registered`);
    assert.notEqual(end, -1, `${id} challenge list is closed`);
    assert.equal([...source.slice(start, end).matchAll(/\bchallenge\(/g)].length, 4, `${id} has four challenges`);
  }
});

test("§3.1 worked conversion: decimal 45 is binary 101101", () => {
  assert.equal(P.convert("45", 10, 2).result, "101101");
  assert.equal(P.parseBase("1100010", 2), 98);
  assert.equal(P.convert("101101", 2, 8).result, "55");
  assert.equal(P.convert("11001010", 2, 16).result, "CA");
  assert.throws(() => P.parseBase("102", 2), RangeError);
});

test("§3.2 worked encodings distinguish the same four-bit pattern", () => {
  assert.equal(P.decodeInteger("1111", "unsigned"), 15);
  assert.equal(P.decodeInteger("1111", "sign-magnitude"), -7);
  assert.equal(P.decodeInteger("1111", "ones-complement"), -0);
  assert.equal(P.decodeInteger("1111", "twos-complement"), -1);
  assert.equal(P.decodeInteger("0111", "excess", 8), -1);
  assert.equal(P.encodeBcd(59), "0101 1001");
});

test("§3.3 worked ASCII example decodes 46 72 65 64 as Fred", () => {
  assert.equal(P.decodeAsciiHex("46 72 65 64"), "Fred");
  assert.equal(P.decodeAsciiHex("0x41"), "A");
  assert.throws(() => P.decodeAsciiHex("FF"), RangeError);
});

test("§3.4 worked addition preserves the carry-column result", () => {
  assert.deepEqual(P.unsignedArithmetic("111011", "101010", "add"), { value: 101, bits: "1100101" });
  assert.deepEqual(P.unsignedArithmetic("11101", "101", "divide"), { quotient: 5, remainder: 4, quotientBits: "101", remainderBits: "100" });
  assert.equal(P.unsignedArithmetic("101", "11", "multiply").bits, "1111");
});

test("§3.5 worked example detects signed overflow after fixed-width addition", () => {
  assert.deepEqual(P.twosArithmetic("1001", "1010", "add"), {
    exact: -13, pattern: "0011", decoded: 3, overflow: true, carryOut: true, min: -8, max: 7,
  });
  assert.equal(P.twosArithmetic("1011", "0011", "subtract").pattern, "1000");
  assert.equal(P.twosArithmetic("1011", "0011", "subtract").overflow, false);
  const negatedMinimum = P.twosArithmetic("0000", "1000", "subtract");
  assert.equal(negatedMinimum.pattern, "1000");
  assert.equal(negatedMinimum.decoded, -8);
  assert.equal(negatedMinimum.overflow, true);
  assert.throws(() => P.twosArithmetic("111", "0011", "add"), RangeError);
});
