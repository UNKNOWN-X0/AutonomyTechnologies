/* APDR Chapter 5 memory capacity, byte order, module sizing, and interleaving rules. */
(function (root) {
  function capacityForAddressBits(addressBits, bytesPerAddress) {
    var n = Number(addressBits), unit = Number(bytesPerAddress == null ? 1 : bytesPerAddress);
    if (!Number.isInteger(n) || n < 1 || n > 64 || !Number.isSafeInteger(unit) || unit < 1) {
      throw new RangeError("use 1–64 address bits and a positive whole-byte address unit");
    }
    return (2n ** BigInt(n)) * BigInt(unit);
  }

  function rowsToBytes(rows, bitsPerRow) {
    var r = Number(rows), w = Number(bitsPerRow);
    if (!Number.isSafeInteger(r) || r < 1 || !Number.isInteger(w) || w < 8 || w % 8 !== 0) {
      throw new RangeError("use a positive whole number of rows and a row width in whole bytes");
    }
    return (BigInt(r) * BigInt(w)) / 8n;
  }

  function endianBytes(hex, order) {
    var h = String(hex).trim().replace(/^0x/i, "").toUpperCase();
    if (!/^(?:[0-9A-F]{2}){1,8}$/.test(h)) throw new RangeError("enter an even number of hexadecimal digits (1–8 bytes)");
    if (order !== "big" && order !== "little") throw new RangeError("byte order must be big or little");
    var bytes = h.match(/.{2}/g);
    return order === "big" ? bytes : bytes.reverse();
  }

  function moduleConfiguration(rows, chipWidth, chipsPerModule, moduleCount) {
    var r = Number(rows), w = Number(chipWidth), c = Number(chipsPerModule), m = Number(moduleCount);
    if (!Number.isSafeInteger(r) || r < 1 || ![8, 16].includes(w) || !Number.isInteger(c) || c < 1 || c > 4 || !Number.isInteger(m) || m < 1 || m > 4) {
      throw new RangeError("use positive rows, 8- or 16-bit chips, and 1–4 chips and modules");
    }
    var rowWidth = w * c, moduleBytes = rowsToBytes(r, rowWidth);
    return { rows: r, chipWidth: w, chipsPerModule: c, moduleCount: m, rowWidth: rowWidth, moduleBytes: moduleBytes, totalBytes: moduleBytes * BigInt(m) };
  }

  function interleave(address, addressBits, moduleCount, scheme) {
    var a = Number(address), bits = Number(addressBits), modules = Number(moduleCount);
    if (!Number.isSafeInteger(a) || !Number.isInteger(bits) || bits < 1 || bits > 52 || a < 0 || a >= 2 ** bits) {
      throw new RangeError("address must fit within 1–52 address bits");
    }
    if (!Number.isInteger(modules) || modules < 2 || modules > 16 || (modules & (modules - 1)) !== 0 || modules > 2 ** bits) {
      throw new RangeError("module count must be a power of two within the address width");
    }
    if (scheme !== "high" && scheme !== "low") throw new RangeError("scheme must be high or low");
    var moduleBits = Math.log2(modules), rowBits = bits - moduleBits, rowsPerModule = 2 ** rowBits;
    if (scheme === "low") return { module: a % modules, row: Math.floor(a / modules), moduleBits: moduleBits, rowBits: rowBits };
    return { module: Math.floor(a / rowsPerModule), row: a % rowsPerModule, moduleBits: moduleBits, rowBits: rowBits };
  }

  var api = { capacityForAddressBits: capacityForAddressBits, rowsToBytes: rowsToBytes, endianBytes: endianBytes, moduleConfiguration: moduleConfiguration, interleave: interleave };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR5 = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
