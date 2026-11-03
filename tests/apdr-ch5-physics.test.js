const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const P = require("../js/apdr/ch5-physics.js");

test("Chapter 5 experiments each register four stable challenges", () => {
  const source = fs.readFileSync(path.join(__dirname, "../js/apdr/ch5-lab.js"), "utf8");
  for (const id of ["hierarchy", "sram-dram", "addressing", "endian", "modules", "interleave"]) {
    const start = source.indexOf(`mount("${id}"`);
    const end = source.indexOf('\n  mount(', start + 1);
    const block = source.slice(start, end < 0 ? source.length : end);
    assert.ok(start >= 0, `${id} experiment is registered`);
    assert.equal((block.match(/^\s+\["/gm) || []).length, 4, `${id} has four challenges`);
  }
});

test("byte and word address widths count the selected units", () => {
  assert.equal(P.capacityForAddressBits(32), 4_294_967_296n);
  assert.equal(P.capacityForAddressBits(22, 4), 16_777_216n);
  assert.throws(() => P.capacityForAddressBits(0), RangeError);
  assert.throws(() => P.capacityForAddressBits(8, 1.5), RangeError);
});

test("RAM row and chip widths produce byte capacities", () => {
  assert.equal(P.rowsToBytes(256 * 1024 * 1024, 32), 1_073_741_824n);
  assert.equal(P.rowsToBytes(128 * 1024 * 1024, 32), 536_870_912n);
  assert.throws(() => P.rowsToBytes(3, 9), RangeError);
});

test("big-endian and little-endian reverse byte order only", () => {
  assert.deepEqual(P.endianBytes("54BCFE30", "big"), ["54", "BC", "FE", "30"]);
  assert.deepEqual(P.endianBytes("54BCFE30", "little"), ["30", "FE", "BC", "54"]);
  assert.deepEqual(P.endianBytes("4A494D", "little"), ["4D", "49", "4A"]);
  assert.throws(() => P.endianBytes("F", "big"), RangeError);
  assert.throws(() => P.endianBytes("54", "middle"), RangeError);
});

test("the four slide module configurations all build 1 GiB", () => {
  const configs = [
    P.moduleConfiguration(128 * 1024 * 1024, 16, 2, 2),
    P.moduleConfiguration(128 * 1024 * 1024, 8, 4, 2),
    P.moduleConfiguration(64 * 1024 * 1024, 16, 2, 4),
    P.moduleConfiguration(64 * 1024 * 1024, 8, 4, 4),
  ];
  assert.deepEqual(configs.map((c) => c.totalBytes), Array(4).fill(1_073_741_824n));
  assert.equal(P.moduleConfiguration(128 * 1024 * 1024, 8, 4, 2).rowWidth, 32);
  assert.throws(() => P.moduleConfiguration(10, 12, 2, 2), RangeError);
});

test("high-order and low-order interleaving map the lecture examples", () => {
  assert.deepEqual(P.interleave(3, 22, 4, "high"), { module: 0, row: 3, moduleBits: 2, rowBits: 20 });
  assert.deepEqual(P.interleave(2 ** 20, 22, 4, "high"), { module: 1, row: 0, moduleBits: 2, rowBits: 20 });
  assert.deepEqual(P.interleave(15, 22, 4, "low"), { module: 3, row: 3, moduleBits: 2, rowBits: 20 });
  assert.throws(() => P.interleave(16, 4, 3, "low"), RangeError);
  assert.throws(() => P.interleave(16, 4, 4, "center"), RangeError);
});

// Independent arithmetic checks for facts used in the guide and challenge answers.
test("practice 17 and exam 1 module sizing agree independently", () => {
  assert.equal(256 * 1024 * 1024 * 32 / 8, 1_073_741_824);
  assert.equal(P.moduleConfiguration(128 * 1024 * 1024, 8, 4, 2).totalBytes, 1_073_741_824n);
});

test("each lab experiment maps to a worked or practice answer in the guide", () => {
  const guide = fs.readFileSync(path.join(__dirname, "../apdr/ch5-memory-organisation.html"), "utf8");
  for (const fact of [
    "Registers; the slide gives under 1 ns",
    "SRAM is faster, less dense, lower power",
    "4 GiB=2<sup>32</sup> bytes",
    "30 FE BC 54",
    "256M×32÷8=1,024M bytes=1 GiB",
    "Modules 0, 1, 2, 3, each at row 0",
  ]) assert.ok(guide.includes(fact), `guide includes answer: ${fact}`);
  assert.deepEqual(P.endianBytes("54BCFE30", "little"), ["30", "FE", "BC", "54"]);
  assert.equal(P.capacityForAddressBits(32), 4_294_967_296n);
  assert.equal(P.interleave(3, 22, 4, "low").module, 3);
});
