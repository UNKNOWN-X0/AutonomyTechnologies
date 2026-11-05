// Chapter 2 lab arithmetic and answer data cross-checks against the guide's worked examples.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const P = require("../js/eei/ch2-physics.js");

const close = (actual, expected, rel = 0.005) => assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * rel), `${actual} is not within ${rel * 100}% of ${expected}`);

test("current, surface projection, drift, conductivity, wire, and tolerance match Chapter 2 examples", () => {
  close(P.current(3.6, 9), 0.4);
  close(P.throughSurface(8, 2, 60), 8);
  close(P.drift(4.12e-3, 0.2), -8.24e-4);
  close(P.conductivity(8.5e28, 4.12e-3, 0, 3.9e-3), 56.2e6, 0.01);
  close(P.conductivity(8.5e28, 4.12e-3, 100, 3.9e-3) / P.conductivity(8.5e28, 4.12e-3, 0, 3.9e-3), 1 / 1.39);
  close(P.wire(56e6, 8, 3.14e-6), 0.0455, 0.01);
  close(P.tolerance(100, 0.1).low, 90);
  close(P.tolerance(100, 0.1).high, 110);
});

test("conductivity-interface worked values and resistor power/energy agree", () => {
  const v = P.interface(2, 8, 4, 3);
  close(v.Jn2, 4);
  close(v.Jt1, 6);
  close(v.Jt2, 24);
  close((v.alpha2 * 180) / Math.PI, 80.5, 0.002);
  const p = P.power(12, 0.5, 24);
  close(p.P, 6);
  close(p.fromU, 6);
  close(p.fromI, 6);
  close(P.energy(p.P, 180), 1080);
  const density = P.powerDensity(6, 100, 0.01);
  close(density.density, 600);
  close(density.total, p.P);
});

function fake() {
  return new Proxy(function () {}, {
    get: (t, p) => (p === Symbol.toPrimitive ? () => "" : p === "forEach" ? () => {} : p === "length" ? 0 : fake()),
    apply: () => fake(), construct: () => fake(), set: () => true,
  });
}
function definitions() {
  const root = path.join(__dirname, "..");
  const doc = new Proxy(fake(), { get: (t, p) => p === "querySelectorAll" ? (s) => s.includes("data-experiment=") ? [fake()] : [] : t[p] });
  const defs = [], window = { document: doc, EEI2: P, getComputedStyle: fake(), matchMedia: fake(), requestAnimationFrame() {}, addEventListener() {}, ResizeObserver: fake(), console, Lab: { experiment: (d) => (defs.push(d), {}), tween: () => Promise.resolve(), reduce: true } };
  window.window = window;
  const html = fs.readFileSync(path.join(root, "eei/ch2-stationary-currents-lab.html"), "utf8");
  const src = [...html.matchAll(/<script src="\.\.\/(js\/[^\"]+)"/g)].map((m) => m[1]).filter((s) => s === "js/eei/ch2-lab.js");
  const context = vm.createContext(window);
  src.forEach((file) => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context));
  return defs;
}

test("all 24 fixed answer keys match their calculated challenge predictions", () => {
  const defs = definitions();
  assert.strictEqual(defs.length, 6);
  assert.strictEqual(defs.reduce((n, d) => n + d.challenges.length, 0), 24);
  for (const d of defs) for (const c of d.challenges) {
    assert.ok(c.options.some((o) => o[0] === c.answer), `${d.id}/${c.id} answer option exists`);
    close(c.guesses[c.answer], c.expected, 0.006);
  }
  const byId = Object.fromEntries(defs.map((d) => [d.id, d]));
  close(byId.current.challenges[0].expected, P.current(6, 0.5));
  close(byId.current.challenges[1].expected, P.throughSurface(8, 2, 60));
  close(byId.drift.challenges[1].expected, P.drift(4.12e-3, 0.2));
  close(byId.wire.challenges[2].expected, 12 / P.wire(56e6, 2, 0.001488e-6));
  close(byId.tolerance.challenges[0].expected, P.tolerance(100, 0.1).high);
  close(byId.interface.challenges[3].expected, (P.interface(2, 8, 4, 3).alpha2 * 180) / Math.PI);
  close(byId.power.challenges[0].expected, P.power(12, 0.5, 24).P);
  close(byId.power.challenges[3].expected, P.powerDensity(6, 100, 0.01).total);
});

test("every generated challenge has one labelled answer equal to its computed value", () => {
  for (const d of definitions()) {
    assert.equal(typeof d.generate, "function", `${d.id} offers fresh numerical practice`);
    for (let i = 0; i < 300; i++) {
      const c = d.generate();
      assert.ok(c.id.startsWith("gen-"));
      assert.equal(c.options.filter((o) => o[0] === c.answer).length, 1);
      const label = c.options.find((o) => o[0] === c.answer)[1].replace("−", "-");
      const actual = Number.parseFloat(label.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i)[0]);
      close(actual, c.expected, 0.006);
    }
  }
});
