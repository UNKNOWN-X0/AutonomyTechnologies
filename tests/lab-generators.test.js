// Endless practice: every experiment's generate() must give well-formed challenges with exactly one correct option,
// every time. Runs the real lab scripts against a stand-in DOM, as tests/lab-challenges.test.js does.
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

function defsOf(page) {
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const scripts = [...html.matchAll(/<script src="\.\.\/(js\/[^"]+)"/g)].map((m) => m[1]).filter((s) => s !== "js/lab.js" && s !== "js/tooltip.js");
  const defs = [];
  const ctx = context({ Lab: { experiment: (d) => (defs.push(d), {}), tween: () => Promise.resolve(), reduce: true } });
  for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(ROOT, s), "utf8"), ctx);
  return defs;
}

const labs = ["apdr", "eei", "mei"].flatMap((d) => fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith("-lab.html")).map((f) => d + "/" + f));

for (const page of labs) {
  test("generated challenges are well formed: " + page, () => {
    for (const d of defsOf(page)) {
      if (typeof d.generate !== "function") continue;
      for (let n = 0; n < 300; n++) {
        const c = d.generate();
        const where = d.id + " #" + n + ": " + c.prompt;
        assert.ok(c.prompt && c.why, where + " needs a prompt and an explanation");
        assert.ok(c.options.length >= 2 && c.options.length <= 4, where + " has " + c.options.length + " options");
        assert.strictEqual(new Set(c.options.map((o) => o[0])).size, c.options.length, where + " repeats an option");
        assert.strictEqual(c.options.filter((o) => o[0] === c.answer).length, 1, where + " answer is not exactly one option");
      }
    }
  });
}

test("MEI 2 binary practice answers are the place-value sums", () => {
  const d = defsOf("mei/ch2-real-numbers-lab.html").find((x) => x.id === "binary");
  for (let n = 0; n < 200; n++) {
    const c = d.generate(), bits = /\[([01]+)\]/.exec(c.prompt)[1];
    assert.strictEqual(c.answer, String(parseInt(bits, 2)), c.prompt);
  }
});

test("APDR 3 practice answers are computed correctly", () => {
  const defs = defsOf("apdr/ch3-data-representation-lab.html"), by = (id) => defs.find((x) => x.id === id);
  for (let n = 0; n < 200; n++) {
    let c = by("bases").generate();
    assert.strictEqual(parseInt(c.answer, 2), Number(/decimal (\d+)/.exec(c.prompt)[1]), c.prompt);
    c = by("encodings").generate();
    const bits = /Decode (\d+)/.exec(c.prompt)[1];
    assert.strictEqual(c.answer.replace("−", "-"), String(parseInt(bits, 2) - 16), c.prompt);
    c = by("characters").generate();
    assert.strictEqual(c.answer, String.fromCharCode(parseInt(/code ([0-9A-F]+)/.exec(c.prompt)[1], 16)), c.prompt);
    c = by("unsigned").generate();
    const [x, y] = [...c.prompt.matchAll(/([01]+)₂/g)].map((m) => parseInt(m[1], 2));
    assert.strictEqual(parseInt(c.answer, 2), x + y, c.prompt);
    c = by("signed").generate();
    const [p, q] = [...c.prompt.matchAll(/([01]{4})/g)].map((m) => parseInt(m[1], 2)).map((u) => (u >= 8 ? u - 16 : u));
    assert.strictEqual(c.answer, p + q < -8 || p + q > 7 ? "yes" : "no", c.prompt);
  }
});
