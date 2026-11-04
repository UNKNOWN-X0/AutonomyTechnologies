/* A small, safe expression parser for the MEI labs: f(x) typed by the student, compiled to a JavaScript function
   without eval. Supports + − × ÷ ^, brackets, |x|, implicit multiplication (2x, 2(x+1), x sin x), the functions
   sqrt, abs, sin, cos, tan, exp, ln, log (base 10) and the constants pi and e. Unicode ² ³ − × · ÷ √ π are accepted.
   Outside a function's domain (√ of a negative, ln of 0) the result is NaN, which the labs show as "undefined".
   Loaded by the lab page (window.Expr) and by tests/ in node. */
(function (root) {
  var FUNCS = { sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, ln: Math.log, log: Math.log10 || function (v) { return Math.log(v) / Math.LN10; } };
  var CONSTS = { pi: Math.PI, e: Math.E };

  function normalise(s) {
    return String(s)
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .replace(/[−–]/g, "-")
      .replace(/[×·]/g, "*")
      .replace(/÷/g, "/")
      .replace(/√/g, "sqrt")
      .replace(/π/g, "pi");
  }
  function tokenize(s) {
    var out = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)))) { out.push({ t: "num", v: parseFloat(m[1]) }); i += m[1].length; continue; }
      if ((m = /^[a-z]+/i.exec(s.slice(i)))) {
        var w = m[0].toLowerCase(), j = 0;
        // split runs like "xsinx" or "2pix" into known words and single x's
        while (j < w.length) {
          var hit = null;
          ["sqrt", "abs", "sin", "cos", "tan", "exp", "log", "ln", "pi", "e", "x"].some(function (k) {
            if (w.substr(j, k.length) === k) { hit = k; return true; }
            return false;
          });
          if (!hit) throw new Error("unknown name “" + w.slice(j) + "”: use x, sqrt, abs, sin, cos, tan, exp, ln, log, pi or e");
          out.push(FUNCS[hit] ? { t: "fn", v: hit } : CONSTS[hit] !== undefined ? { t: "num", v: CONSTS[hit] } : { t: "x" });
          j += hit.length;
        }
        i += w.length;
        continue;
      }
      if ("+-*/^()|".indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
      throw new Error("unexpected “" + c + "”");
    }
    return out;
  }
  function compile(text) {
    var toks;
    try { toks = tokenize(normalise(text)); } catch (err) { return { error: err.message }; }
    if (!toks.length) return { error: "type a rule, for example x^2 − 1" };
    var p = 0, bars = 0;
    function peek() { return toks[p]; }
    function take(t) { var k = toks[p]; if (!k || k.t !== t) throw new Error(t === ")" ? "a bracket is not closed" : "expected “" + t + "”"); p++; return k; }
    function startsAtom(k) { return k && (k.t === "num" || k.t === "x" || k.t === "fn" || k.t === "(" || (k.t === "|" && bars === 0)); }
    function expr() {
      var f = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) {
        var op = toks[p++].t, g = term(), a = f;
        f = op === "+" ? (function (a, g) { return function (x) { return a(x) + g(x); }; })(a, g) : (function (a, g) { return function (x) { return a(x) - g(x); }; })(a, g);
      }
      return f;
    }
    function term() {
      var f = unary();
      for (;;) {
        var k = peek();
        if (k && (k.t === "*" || k.t === "/")) {
          p++;
          var g = unary(), a = f;
          f = k.t === "*" ? (function (a, g) { return function (x) { return a(x) * g(x); }; })(a, g) : (function (a, g) { return function (x) { return a(x) / g(x); }; })(a, g);
        } else if (startsAtom(k)) {
          var h = unary(), b = f;
          f = (function (b, h) { return function (x) { return b(x) * h(x); }; })(b, h);
        } else return f;
      }
    }
    function unary() {
      if (peek() && peek().t === "-") { p++; var f = unary(); return function (x) { return -f(x); }; }
      if (peek() && peek().t === "+") { p++; return unary(); }
      return power();
    }
    function power() {
      var base = atom();
      if (peek() && peek().t === "^") {
        p++;
        var ex = unary();
        return function (x) { return Math.pow(base(x), ex(x)); };
      }
      return base;
    }
    function atom() {
      var k = toks[p++];
      if (!k) throw new Error("the rule ends too early");
      if (k.t === "num") { var v = k.v; return function () { return v; }; }
      if (k.t === "x") return function (x) { return x; };
      if (k.t === "(") { var f = expr(); take(")"); return f; }
      if (k.t === "|") { bars++; var g = expr(); take("|"); bars--; return function (x) { return Math.abs(g(x)); }; }
      if (k.t === "fn") {
        var fn = FUNCS[k.v], arg = peek() && peek().t === "(" ? (p++, (function () { var a = expr(); take(")"); return a; })()) : power();
        return function (x) { return fn(arg(x)); };
      }
      throw new Error("unexpected “" + k.t + "”");
    }
    try {
      var f = expr();
      if (p < toks.length) throw new Error("unexpected “" + (toks[p].t === "num" ? toks[p].v : toks[p].t) + "”");
      return { fn: function (x) { var y = f(x); return isFinite(y) ? y : NaN; } };
    } catch (err) {
      return { error: err.message };
    }
  }
  var api = { compile: compile };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Expr = api;
})(this);
