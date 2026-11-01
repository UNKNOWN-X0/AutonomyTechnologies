// Check the APDR Chapter 2 lab rules against the worked guide examples.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const P = require("../js/apdr/ch2-physics.js");

test("the four Chapter 2 lab experiments each register four challenges", () => {
  const source = fs.readFileSync(require.resolve("../js/apdr/ch2-lab.js"), "utf8");
  for (const id of ["algorithm", "logic", "nand", "timing"]) {
    const start = source.search(new RegExp(`Lab\\.experiment\\(\\s*\\{\\s*id:\\s*[\"']${id}[\"']`));
    assert.notEqual(start, -1, `${id} experiment is registered`);
    const challenges = source.slice(start).match(/challenges:\s*\[([\s\S]*?)\]\s*,?\s*\}\s*\);/);
    assert.ok(challenges, `${id} challenge list is present`);
    assert.equal([...challenges[1].matchAll(/\bid\s*:\s*["']|challenge\(\s*["']/g)].length, 4, `${id} has four challenges`);
  }
});

test("guide sections 2.4–2.6 link to their shared Boolean lab experiment", () => {
  const guide = fs.readFileSync(require.resolve("../apdr/ch2-computers.html"), "utf8");
  for (const sectionId of ["sec-24", "sec-25", "sec-26"]) {
    const start = guide.indexOf(`<section id="${sectionId}"`);
    const end = guide.indexOf("</section>", start);
    assert.notEqual(start, -1, `${sectionId} guide section exists`);
    assert.notEqual(end, -1, `${sectionId} guide section closes`);
    assert.match(guide.slice(start, end), /href="ch2-computers-lab\.html#exp-logic"/);
  }
});

test("§2.1 square-root worked example updates the guess and reaches tolerance", () => {
  const first = P.squareRootStep(16, 3);
  assert.ok(Math.abs(first.next - 4.1666667) < 1e-6);
  const second = P.squareRootStep(16, first.next);
  assert.ok(Math.abs(second.next - 4.0033333) < 1e-6);
  assert.ok(second.residual > 0.01);
  const third = P.squareRootStep(16, second.next);
  assert.ok(third.residual < 0.01);
  assert.throws(() => P.squareRootStep(16, 0), RangeError);
});

test("§2.4 umbrella example matches the guide's Boolean rule", () => {
  assert.equal(P.umbrella(false, false, false), false);
  assert.equal(P.umbrella(false, true, false), true);
  assert.equal(P.umbrella(false, false, true), true);
  assert.equal(P.umbrella(true, true, true), false);
});

test("§2.7 NAND examples reproduce NOT, AND, and OR for every input", () => {
  for (const a of [false, true]) {
    assert.equal(P.nand(a, a), !a);
    for (const b of [false, true]) {
      assert.equal(P.nandAnd(a, b), a && b);
      assert.equal(P.nandOr(a, b), a || b);
    }
  }
});

test("§2.8 switching-time example preserves the old output until its symbolic delay", () => {
  assert.equal(P.delayedOutput(false, true, 0, 1), false);
  assert.equal(P.delayedOutput(false, true, 0.5, 1), false);
  assert.equal(P.delayedOutput(false, true, 1, 1), true);
  assert.throws(() => P.delayedOutput(false, true, 0, -1), RangeError);
});
