/* APDR Chapter 2 lab rules. Pure functions only; loaded by the page and node tests. */
(function (root) {
  function squareRootStep(x, guess) {
    if (!Number.isFinite(x) || x <= 0 || !Number.isFinite(guess) || guess <= 0) {
      throw new RangeError("x and guess must be positive finite numbers");
    }
    var next = (guess + x / guess) / 2;
    return { next: next, residual: Math.abs(next * next - x) };
  }

  function boolean(op, a, b) {
    if (op === "not") return !a;
    if (op === "and") return a && b;
    if (op === "or") return a || b;
    throw new RangeError("op must be not, and, or");
  }

  function umbrella(car, badForecast, rain) {
    return !car && (badForecast || rain);
  }

  function nand(a, b) {
    return !(a && b);
  }

  function nandAnd(a, b) {
    var out = nand(a, b);
    return nand(out, out);
  }

  function nandOr(a, b) {
    return nand(nand(a, a), nand(b, b));
  }

  function delayedOutput(before, after, time, delay) {
    if (!Number.isFinite(time) || !Number.isFinite(delay) || delay < 0) {
      throw new RangeError("time and delay must be finite; delay cannot be negative");
    }
    return time < delay ? before : after;
  }

  var api = {
    squareRootStep: squareRootStep,
    boolean: boolean,
    umbrella: umbrella,
    nand: nand,
    nandAnd: nandAnd,
    nandOr: nandOr,
    delayedOutput: delayedOutput,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR2 = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
