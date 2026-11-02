// Every lab's challenge data, read by running the real chapter scripts against a stand-in DOM.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

// An object that answers any property, call or construction, so draw code loads without a browser.
function fake() {
  return new Proxy(function () {}, {
    get: (t, p) => (p === Symbol.toPrimitive ? () => "" : p === "forEach" ? () => {} : p === "length" ? 0 : fake()),
    apply: () => fake(),
    construct: () => fake(),
    set: () => true,
  });
}

function context(extra) {
  // EEI finds its experiments with querySelectorAll, so those selectors must return one element each.
  const document = new Proxy(fake(), { get: (t, p) => (p === "querySelectorAll" ? (sel) => (sel.includes("data-experiment=") ? [fake()] : []) : t[p]) });
  const w = { document, getComputedStyle: fake(), matchMedia: fake(), requestAnimationFrame: () => {}, addEventListener: () => {}, ResizeObserver: fake(), console, ...extra };
  w.window = w;
  return vm.createContext(w);
}

function labPages() {
  return ["apdr", "eei", "mei"].flatMap((dir) =>
    fs
      .readdirSync(path.join(ROOT, dir))
      .filter((f) => f.endsWith("-lab.html"))
      .map((f) => dir + "/" + f),
  );
}

function loadExperiments(page) {
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const scripts = [...html.matchAll(/<script src="\.\.\/(js\/[^"]+)"/g)].map((m) => m[1]).filter((s) => s !== "js/lab.js" && s !== "js/tooltip.js");
  const defs = [];
  const ctx = context({ Lab: { experiment: (d) => (defs.push(d), {}), tween: () => Promise.resolve(), reduce: true } });
  for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(ROOT, s), "utf8"), ctx);
  return defs;
}

function problems(defs) {
  const out = [];
  const seen = new Set();
  for (const d of defs) {
    if (seen.has(d.id)) out.push("duplicate experiment id " + d.id);
    seen.add(d.id);
    const ids = new Set();
    for (const c of d.challenges) {
      const where = d.id + "/" + c.id;
      if (ids.has(c.id)) out.push(where + ": duplicate challenge id");
      ids.add(c.id);
      if (c.options.length < 2 || c.options.length > 4) out.push(where + ": " + c.options.length + " options, needs 2-4");
      if (!c.options.every((o) => Array.isArray(o) && o.length === 2)) out.push(where + ": options must be [key, label] pairs");
      if (new Set(c.options.map((o) => o[0])).size !== c.options.length) out.push(where + ": duplicate option keys");
      if (c.options.filter((o) => o[0] === c.answer).length !== 1) out.push(where + ": answer is not exactly one option");
      if (typeof c.stage !== "function") out.push(where + ": no stage()");
    }
  }
  return out;
}

for (const page of labPages()) {
  test("challenge data: " + page, (t) => {
    const defs = loadExperiments(page);
    assert.ok(defs.length, "no experiments registered");
    const all = defs.flatMap((d) => d.challenges);
    const first = all.filter((c) => c.options[0] && c.options[0][0] === c.answer).length;
    t.diagnostic("answer is option 1 in " + first + " of " + all.length);
    const found = problems(defs);
    assert.strictEqual(found.length, 0, found.length + " problems:\n" + found.join("\n"));
  });
}

function runEngine(challenge, setup) {
  const errors = [];
  const ctx = context({ console: { error: (m) => errors.push(m) } });
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/lab.js"), "utf8"), ctx);
  ctx.window.Lab.experiment({ id: "x", title: "X", card: fake(), lock() {}, setup, sandbox() {}, challenges: [{ id: "c", short: "", ref: "1.1", prompt: "", options: [], answer: "a", why: "", ...challenge }] });
  return errors;
}

test("engine guard stays quiet when setup calls stage once", () => {
  let calls = 0;
  const errors = runEngine({ stage: () => calls++ }, (c) => c.stage());
  assert.deepStrictEqual([calls, errors], [1, []]);
});

test("engine guard reports a setup that skips stage, without calling it", () => {
  let calls = 0;
  const errors = runEngine({ stage: () => calls++ }, () => {});
  assert.strictEqual(calls, 0);
  assert.match(errors[0], /x\/c: setup did not call/);
});

test("engine guard reports a challenge with no stage", () => {
  assert.match(runEngine({}, () => {})[0], /x\/c: challenge has no stage/);
});
