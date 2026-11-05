// The MEI labs' expression parser: values, precedence, implicit multiplication, domains and error messages.
const test = require("node:test");
const assert = require("node:assert");
const E = require("../js/mei/expr.js");

const at = (s, x) => E.compile(s).fn(x);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, a + " ≈ " + b);

test("arithmetic and precedence", () => {
  near(at("2x+3", 4), 11);
  near(at("x^2 - 1", 3), 8);
  near(at("-x^2", 2), -4); // unary minus binds looser than ^
  near(at("2^-1", 0), 0.5);
  near(at("2^3^2", 0), 512); // right associative
  near(at("(x+1)(x-1)", 3), 8);
  near(at("1/2x", 4), 2); // implicit multiplication after division: (1/2)·x
});

test("functions, constants and unicode", () => {
  near(at("sqrt(9)", 0), 3);
  near(at("√x", 16), 4);
  near(at("x²−2x−3", 3), 0);
  near(at("sin(pi/2)", 0), 1);
  near(at("cos x", 0), 1);
  near(at("2π", 0), 2 * Math.PI);
  near(at("e^x", 1), Math.E);
  near(at("ln(e)", 0), 1);
  near(at("|x - 3|", 1), 2);
  near(at("x sin x", Math.PI / 2), Math.PI / 2);
});

test("outside the domain is NaN, not an error", () => {
  assert.ok(Number.isNaN(at("sqrt(x)", -1)));
  assert.ok(Number.isNaN(at("ln x", 0)));
  assert.ok(Number.isNaN(at("1/x", 0)));
});

test("bad input gives a readable message", () => {
  assert.match(E.compile("x +").error, /ends too early/);
  assert.match(E.compile("(x+1").error, /bracket/);
  assert.match(E.compile("foo(x)").error, /unknown name/);
  assert.match(E.compile("").error, /type a rule/);
  assert.match(E.compile("x $ 2").error, /unexpected/);
});

test("logic formulas", () => {
  const L = (s, v) => E.logic(s).fn(v);
  assert.strictEqual(L("A ⇒ B", { A: true, B: false }), false);
  assert.strictEqual(L("A -> B", { A: false, B: false }), true);
  assert.strictEqual(L("not (A and B) <-> !A | !B", { A: true, B: true }), true); // De Morgan, as one formula
  assert.strictEqual(L("A ⇒ B ⇒ C", { A: true, B: false, C: false }), true); // right to left: A ⇒ (B ⇒ C)
  assert.strictEqual(L("A ⊕ B", { A: true, B: true }), false);
  assert.deepStrictEqual(E.logic("A ∧ C").vars, ["A", "C"]);
  assert.match(E.logic("A ∧").error, /ends too early/);
  assert.match(E.logic("A ? B").error, /unexpected/);
});

test("set expressions read as membership logic", () => {
  const S = (s, v) => E.logic(s).fn(v);
  assert.strictEqual(S("(A ∪ B)ᶜ", { A: false, B: false }), true);
  assert.strictEqual(S("A \\ B", { A: true, B: true }), false);
  assert.strictEqual(S("A ∩ B'", { A: true, B: false }), true);
});

test("APDR Boolean notation: juxtaposition, primes and own variable names", () => {
  const B = (s, n, ...v) => E.bool(s, n).fn(...v);
  assert.strictEqual(B("x + x′y", "xy", 0, 1), 1);
  assert.strictEqual(B("(xy)'", "xy", 1, 1), 0);
  assert.strictEqual(B("C'(W+R)", "cwr", 0, 1, 0), 1); // upper-case names work too
  assert.strictEqual(B("C'(W+R)", "cwr", 1, 1, 1), 0);
  assert.strictEqual(B("A ⊕ B ⊕ C", "abc", 1, 1, 1), 1);
  assert.match(E.bool("x + z", "xy").error, /“z” is not allowed/);
  assert.match(E.bool("", "xy").error, /type an expression/);
});
