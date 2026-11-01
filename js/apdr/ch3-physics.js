/* APDR Chapter 3 conversions and arithmetic. Pure functions shared by the lab and node tests. */
(function (root) {
  var DIGITS = "0123456789ABCDEF";

  function parseBase(text, base) {
    var value = String(text).trim().toUpperCase();
    if (!Number.isInteger(base) || base < 2 || base > 16 || !value || !Array.from(value).every(function (d) { return DIGITS.slice(0, base).includes(d); })) {
      throw new RangeError("value must contain digits valid for a base from 2 to 16");
    }
    var n = parseInt(value, base);
    if (!Number.isSafeInteger(n)) throw new RangeError("value is too large");
    return n;
  }

  function toBase(value, base) {
    if (!Number.isSafeInteger(value) || value < 0 || !Number.isInteger(base) || base < 2 || base > 16) {
      throw new RangeError("value must be a non-negative safe integer and base must be from 2 to 16");
    }
    return value.toString(base).toUpperCase();
  }

  function convert(text, fromBase, toBaseValue) {
    return { value: parseBase(text, fromBase), result: toBase(parseBase(text, fromBase), toBaseValue) };
  }

  function parseBits(bits) {
    var value = String(bits).replace(/\s+/g, "");
    if (!/^[01]+$/.test(value) || value.length > 30) throw new RangeError("bits must be a binary pattern of at most 30 bits");
    return parseInt(value, 2);
  }

  function decodeInteger(bits, encoding, bias) {
    var compact = String(bits).replace(/\s+/g, ""), unsigned = parseBits(compact), width = compact.length,
      sign = compact[0] === "1", modulus = Math.pow(2, width);
    if (encoding === "unsigned") return unsigned;
    if (encoding === "sign-magnitude") return sign ? -(unsigned % Math.pow(2, width - 1)) : unsigned;
    if (encoding === "ones-complement") return sign ? -((modulus - 1) - unsigned) : unsigned;
    if (encoding === "twos-complement") return sign ? unsigned - modulus : unsigned;
    if (encoding === "excess") {
      if (!Number.isInteger(bias) || bias < 0 || bias >= modulus) throw new RangeError("bias must fit the bit width");
      return unsigned - bias;
    }
    throw new RangeError("unknown integer encoding");
  }

  function encodeBcd(value) {
    if (!Number.isInteger(value) || value < 0 || value > 999999) throw new RangeError("BCD value must be a whole number from 0 to 999999");
    return String(value).split("").map(function (digit) { return Number(digit).toString(2).padStart(4, "0"); }).join(" ");
  }

  function decodeAsciiHex(hex) {
    var tokens = String(hex).trim().split(/\s+/).filter(Boolean);
    if (!tokens.length || tokens.some(function (t) { return !/^(?:0x)?[0-7][0-9a-f]$/i.test(t); })) {
      throw new RangeError("enter one or more two-digit ASCII-range hexadecimal bytes");
    }
    return tokens.map(function (token) {
      var code = parseInt(token.replace(/^0x/i, ""), 16);
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : "[" + code + "]";
    }).join("");
  }

  function unsignedArithmetic(left, right, operation) {
    var a = parseBits(left), b = parseBits(right), value;
    if (operation === "add") value = a + b;
    else if (operation === "subtract") value = a - b;
    else if (operation === "multiply") value = a * b;
    else if (operation === "divide") {
      if (b === 0) throw new RangeError("divisor cannot be zero");
      return { quotient: Math.floor(a / b), remainder: a % b, quotientBits: toBase(Math.floor(a / b), 2), remainderBits: toBase(a % b, 2) };
    } else throw new RangeError("unknown unsigned operation");
    return { value: value, bits: value < 0 ? "−" + toBase(-value, 2) : toBase(value, 2) };
  }

  function decodeTwos(bits) {
    var compact = String(bits).replace(/\s+/g, ""), value = parseBits(compact), modulus = Math.pow(2, compact.length);
    return compact[0] === "1" ? value - modulus : value;
  }

  function twosArithmetic(left, right, operation) {
    var aBits = String(left).replace(/\s+/g, ""), bBits = String(right).replace(/\s+/g, "");
    if (aBits.length !== bBits.length) throw new RangeError("operands must have the same fixed width");
    var width = aBits.length, a = decodeTwos(aBits), b = decodeTwos(bBits),
      unsignedSum = parseBits(aBits) + parseBits(bBits), exact;
    if (operation === "add") exact = a + b;
    else if (operation === "subtract") exact = a - b;
    else throw new RangeError("operation must be add or subtract");
    var modulus = Math.pow(2, width), stored = ((exact % modulus) + modulus) % modulus,
      min = -Math.pow(2, width - 1), max = Math.pow(2, width - 1) - 1,
      pattern = toBase(stored, 2).padStart(width, "0");
    return { exact: exact, pattern: pattern, decoded: decodeTwos(pattern), overflow: exact < min || exact > max,
      carryOut: operation === "add" && unsignedSum >= modulus, min: min, max: max };
  }

  var api = {
    parseBase: parseBase,
    toBase: toBase,
    convert: convert,
    parseBits: parseBits,
    decodeInteger: decodeInteger,
    encodeBcd: encodeBcd,
    decodeAsciiHex: decodeAsciiHex,
    unsignedArithmetic: unsignedArithmetic,
    decodeTwos: decodeTwos,
    twosArithmetic: twosArithmetic,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR3 = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
