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
    // generated practice challenges (ids "gen-…") are extra and not counted
    assert.equal([...source.slice(start, end).matchAll(/\bchallenge\((?!"gen-)/g)].length, 4, `${id} has four challenges`);
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

test("every lab challenge: the keyed answer follows from the calculations", () => {
  const source = fs.readFileSync(path.join(__dirname, "../js/apdr/ch3-lab.js"), "utf8");
  const u = (a, b, op) => P.unsignedArithmetic(a, b, op).bits;
  const dec = (bits, enc, bias) => String(P.decodeInteger(bits, enc, bias)).replace("-", "−");
  const over = (a, b, op) => (P.twosArithmetic(a, b, op).overflow ? "yes" : "no");
  const table = {
    "decimal-binary": [P.convert("46", 10, 2).result, "101110"],
    "binary-decimal": [P.convert("1100010", 2, 10).result, "98"],
    "binary-octal": [P.convert("101101", 2, 8).result, "55"],
    "binary-hex": [P.convert("11001010", 2, 16).result, "CA"],
    "unsigned-pattern": [dec("0111", "excess", 8), "−1"],
    "sign-magnitude": [dec("1101", "sign-magnitude"), "−5"],
    "twos-pattern": [dec("1011", "twos-complement"), "−5"],
    "bcd-digits": [P.encodeBcd(59), "0101 1001"],
    "ascii-f": [P.decodeAsciiHex("46"), "F"],
    "ascii-d": [P.decodeAsciiHex("64"), "d"],
    "ascii-word": [P.decodeAsciiHex("46 72 65 64"), "Fred"],
    "ascii-unicode": [P.decodeAsciiHex("41"), "A"],
    "binary-add": [u("111011", "101010", "add"), "1100101"],
    "binary-multiply": [u("101", "11", "multiply"), "1111"],
    "binary-divide": [P.unsignedArithmetic("11101", "101", "divide").quotientBits + "/" + P.unsignedArithmetic("11101", "101", "divide").remainderBits, "101/100"],
    "binary-subtract": [u("11010", "01101", "subtract"), "1101"],
    "positive-overflow": [over("0101", "0011", "add"), "yes"],
    "negative-overflow": [over("1001", "1010", "add"), "yes"],
    "mixed-sign": [over("1110", "1011", "add"), "no"],
    "lower-bound": [over("0000", "1000", "subtract"), "yes"],
  };
  assert.equal(Object.keys(table).length, 20);
  for (const [id, [got, want]] of Object.entries(table)) {
    assert.equal(got, want, id);
    assert.ok(source.includes(`challenge("${id}"`), `${id} is a lab challenge`);
  }
  assert.equal([...source.matchAll(/challenge\("(?!gen-)[^\n]*Does it overflow\?/g)].length, 4); // fixed challenges only
});

test("lab challenge mixed-sign: carry out without overflow", () => {
  const r = P.twosArithmetic("1110", "1011", "add");
  assert.deepEqual([r.pattern, r.decoded, r.carryOut, r.overflow], ["1001", -7, true, false]);
});

test("subtraction carry comes from the adder, A plus the negated subtrahend", () => {
  assert.equal(P.twosArithmetic("1011", "0011", "subtract").carryOut, true);
  assert.equal(P.twosArithmetic("0000", "1000", "subtract").carryOut, false);
  assert.equal(P.negatePattern("1000"), "1000");
  assert.equal(P.negatePattern("0011"), "1101");
  assert.equal(P.negatePattern("0000"), "0000");
});

test("slide 36 rule and the §3.5 addition rule match the exact range at every width", () => {
  for (const n of [3, 4, 5, 8]) {
    const limit = 2 ** n, bits = (v) => v.toString(2).padStart(n, "0");
    for (let i = 0; i < limit; i++) for (let j = 0; j < limit; j++) {
      const a = bits(i), b = bits(j);
      const add = P.twosArithmetic(a, b, "add"), sub = P.twosArithmetic(a, b, "subtract");
      assert.equal(a[0] === b[0] && add.pattern[0] !== a[0], add.overflow);
      assert.equal(a[0] !== b[0] && sub.pattern[0] === b[0], sub.overflow);
    }
  }
});

test("column helpers: §3.4 worked examples", () => {
  const add = P.columnAdd("111011", "101010");
  assert.equal(add.sum, "1100101");
  assert.deepEqual(add.carries, [0, 0, 1, 0, 1, 1, 1]);
  assert.equal(P.columnSubtract("1000101", "10011").diff, "0110010");
  assert.equal(P.columnSubtract("1010101", "11100").diff, "0111001"); // slide 28
  assert.throws(() => P.columnSubtract("1", "10"), RangeError);
  assert.deepEqual(P.partialProducts("11101", "111"), ["11101", "111010", "1110100"]);
  assert.equal(P.unsignedArithmetic("1111", "111", "multiply").bits, "1101001");
  assert.equal(P.unsignedArithmetic("11101", "111", "multiply").bits, "11001011"); // slide 29
  const d = P.unsignedArithmetic("110101", "101", "divide");
  assert.deepEqual([d.quotientBits, d.remainderBits], ["1010", "11"]);
});

test("guide answers: practice 8, 14, 17, 18, 21, 22, 24, 25, 26", () => {
  assert.equal(P.convert("110111", 2, 8).result, "67");
  assert.equal(P.encodeBcd(83), "1000 0011");
  assert.equal(P.convert("83", 10, 2).result, "1010011");
  assert.equal(P.unsignedArithmetic("110", "101", "multiply").bits, "11110");
  assert.equal(P.twosArithmetic("0110", "0011", "add").decoded, -7);
  assert.equal(P.unsignedArithmetic("1001010", "10111", "subtract").bits, "110011");
  const p22 = P.twosArithmetic("11111100", "11111001", "add");
  assert.deepEqual([p22.pattern, p22.decoded, p22.carryOut, p22.overflow], ["11110101", -11, true, false]);
  assert.equal(P.unsignedArithmetic("1011", "111", "multiply").bits, "1001101");
  assert.equal(P.negatePattern("00001111"), "11110001");
  const p26 = P.twosArithmetic("0011", "1000", "subtract");
  assert.deepEqual([p26.pattern, p26.decoded, p26.overflow], ["1011", -5, true]);
});

test("guide worked and exam examples: §3.5 and exam 2, 3", () => {
  const w = P.twosArithmetic("11111110", "11111011", "add");
  assert.deepEqual([w.pattern, w.decoded, w.carryOut, w.overflow], ["11111001", -7, true, false]);
  const e2 = P.twosArithmetic("1100", "0110", "add");
  assert.deepEqual([e2.pattern, e2.decoded, e2.carryOut, e2.overflow], ["0010", 2, true, false]);
  const a = P.convert("C8", 16, 2).result, b = P.convert("9C", 16, 2).result;
  assert.deepEqual([P.parseBits(a), P.parseBits(b)], [200, 156]);
  const sum = P.twosArithmetic(a, b, "add"), diff = P.twosArithmetic(a, b, "subtract");
  assert.deepEqual([sum.pattern, sum.exact, sum.overflow], ["01100100", -156, true]);
  assert.deepEqual([diff.pattern, diff.exact, diff.carryOut, diff.overflow], ["00101100", 44, true, false]);
});
