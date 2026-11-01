/* APDR Chapter 4 floating-point calculations, shared by the lab and tests. */
(function (root) {
  function binaryValue(text) {
    var bits = String(text).trim();
    if (!/^[01]+(?:\.[01]+)?$/.test(bits)) throw new RangeError("enter a binary numeral");
    var parts = bits.split("."), whole = parseInt(parts[0], 2), fraction = 0;
    if (parts[1]) for (var i = 0; i < parts[1].length; i++) fraction += Number(parts[1][i]) * Math.pow(2, -(i + 1));
    return whole + fraction;
  }

  function fractionValue(text) {
    var bits = String(text).trim();
    if (!/^(?:[01]+)?\.[01]+$/.test(bits)) throw new RangeError("enter a binary fraction such as 0.101");
    return binaryValue(bits);
  }

  function fractionBits(value, limit) {
    var n = Number(value), max = Number(limit || 24);
    if (!Number.isFinite(n) || n < 0 || n >= 1 || !Number.isInteger(max) || max < 1 || max > 64) {
      throw new RangeError("fraction must be from 0 up to 1 and bit limit from 1 to 64");
    }
    var bits = "", rest = n;
    for (var i = 0; i < max && rest !== 0; i++) {
      rest *= 2;
      var bit = Math.floor(rest);
      bits += bit;
      rest -= bit;
    }
    return { bits: bits, exact: rest === 0, remainder: rest };
  }

  function spacing(exponent, precision) {
    var e = Number(exponent), p = Number(precision);
    if (!Number.isInteger(e) || !Number.isInteger(p) || p < 1 || p > 53) throw new RangeError("use an integer exponent and precision from 1 to 53");
    return Math.pow(2, e - p + 1);
  }

  function scientificParts(value) {
    if (value === 0) return { significand: 0, exponent: 0, text: "0" };
    var text = Number(value).toExponential(), pieces = text.split("e");
    return { significand: Number(pieces[0]), exponent: Number(pieces[1]), text: text };
  }

  function scientificOperation(m1, e1, m2, e2, operation, precision) {
    var a = Number(m1), b = Number(m2), x = Number(e1), y = Number(e2), p = Number(precision);
    if (![a, b, x, y, p].every(Number.isFinite) || a < 0 || b < 0 || !Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(p) || p < 1 || p > 15) {
      throw new RangeError("use non-negative significands, integer exponents, and 1 to 15 significant digits");
    }
    if (operation !== "add" && operation !== "multiply") throw new RangeError("operation must be add or multiply");
    var exact, aligned = null, exponent = null;
    if (operation === "add") {
      exponent = Math.max(x, y);
      aligned = [a * Math.pow(10, x - exponent), b * Math.pow(10, y - exponent)];
      exact = (aligned[0] + aligned[1]) * Math.pow(10, exponent);
    } else {
      exact = (a * b) * Math.pow(10, x + y);
    }
    var rounded = Number(exact.toPrecision(p));
    return { exact: exact, rounded: rounded, exactScientific: scientificParts(exact), roundedScientific: scientificParts(rounded), aligned: aligned, exponent: exponent };
  }

  function float32(value) {
    var n = Number(value);
    if (Number.isNaN(n)) throw new RangeError("enter a valid number");
    var buffer = new ArrayBuffer(4), view = new DataView(buffer);
    view.setFloat32(0, n, false);
    var word = view.getUint32(0, false), sign = word >>> 31, exponent = (word >>> 23) & 255, fraction = word & 0x7fffff;
    return {
      value: view.getFloat32(0, false),
      hex: word.toString(16).toUpperCase().padStart(8, "0"),
      sign: String(sign),
      exponent: exponent.toString(2).padStart(8, "0"),
      fraction: fraction.toString(2).padStart(23, "0"),
      significand: exponent === 0 ? "0." + fraction.toString(2).padStart(23, "0") : "1." + fraction.toString(2).padStart(23, "0"),
      classification: classifySingle(sign, exponent, fraction),
    };
  }

  function classifySingle(sign, exponent, fraction) {
    var s = Number(sign), e = typeof exponent === "string" ? parseInt(exponent, 2) : Number(exponent), f;
    if (typeof exponent === "string" && !/^[01]{8}$/.test(exponent)) throw new RangeError("exponent must be eight bits");
    if (typeof fraction === "string") {
      if (!/^[01]{23}$/.test(fraction)) throw new RangeError("fraction must be 23 bits");
      f = parseInt(fraction, 2);
    } else f = Number(fraction);
    if ((s !== 0 && s !== 1) || !Number.isInteger(e) || e < 0 || e > 255 || !Number.isInteger(f) || f < 0 || f > 0x7fffff) {
      throw new RangeError("invalid single-precision fields");
    }
    if (e === 0) return f === 0 ? (s ? "negative zero" : "positive zero") : "subnormal";
    if (e === 255) return f === 0 ? (s ? "negative infinity" : "positive infinity") : "NaN";
    return "normalised";
  }

  function decodeSingle(hex) {
    var h = String(hex).trim().replace(/^0x/i, "");
    if (!/^[0-9a-f]{8}$/i.test(h)) throw new RangeError("enter exactly eight hexadecimal digits");
    var word = parseInt(h, 16), sign = word >>> 31, exponent = (word >>> 23) & 255, fraction = word & 0x7fffff,
      buffer = new ArrayBuffer(4), view = new DataView(buffer);
    view.setUint32(0, word, false);
    return {
      value: view.getFloat32(0, false),
      hex: h.toUpperCase(),
      sign: String(sign),
      exponent: exponent.toString(2).padStart(8, "0"),
      fraction: fraction.toString(2).padStart(23, "0"),
      significand: exponent === 0 ? "0." + fraction.toString(2).padStart(23, "0") : "1." + fraction.toString(2).padStart(23, "0"),
      classification: classifySingle(sign, exponent, fraction),
    };
  }

  function normalizedBinary(value, limit) {
    var n = Number(value), max = Number(limit || 24);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(max) || max < 1 || max > 64) throw new RangeError("use a positive finite number and a bit limit from 1 to 64");
    var exponent = Math.floor(Math.log2(n)), significand = n / Math.pow(2, exponent), fraction = fractionBits(significand - 1, max);
    return { significand: "1." + fraction.bits, exponent: exponent, exact: fraction.exact };
  }

  function singleAdd(left, right) {
    var a = float32(left), b = float32(right);
    if (a.classification !== "normalised" || b.classification !== "normalised" || a.sign !== "0" || b.sign !== "0") {
      throw new RangeError("IEEE addition sandbox needs positive normalised single-precision operands");
    }
    var ea = parseInt(a.exponent, 2) - 127, eb = parseInt(b.exponent, 2) - 127,
      ma = binaryValue("1." + a.fraction), mb = binaryValue("1." + b.fraction), exponent = Math.max(ea, eb),
      aligned = [ma * Math.pow(2, ea - exponent), mb * Math.pow(2, eb - exponent)],
      sum = aligned[0] + aligned[1], normalized = normalizedBinary(sum, 24), result = float32(a.value + b.value);
    return { left: a, right: b, exponentDifference: Math.abs(ea - eb), exponent: exponent, aligned: aligned, sum: sum,
      significand: normalized.significand, result: result, exactSum: a.value + b.value };
  }

  var api = {
    binaryValue: binaryValue,
    fractionValue: fractionValue,
    fractionBits: fractionBits,
    spacing: spacing,
    scientificParts: scientificParts,
    scientificOperation: scientificOperation,
    float32: float32,
    decodeSingle: decodeSingle,
    classifySingle: classifySingle,
    normalizedBinary: normalizedBinary,
    singleAdd: singleAdd,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR4 = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
