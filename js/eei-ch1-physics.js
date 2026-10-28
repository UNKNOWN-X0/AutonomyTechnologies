/* EEI Chapter 1 physics for the lab, in SI units with the notes' conventions.
   Charges are { x, y, q } with x, y in metres and q in coulombs. Loaded by the lab page and by tests/ in node. */
(function (root) {
  var EPS0 = 8.854e-12,
    K = 1 / (4 * Math.PI * EPS0);

  // Field of point charges at (x, y): E = (1 / 4πε0) Σ Q_i r_i / r_i³, r_i from charge to point.
  function field(charges, x, y) {
    var ex = 0,
      ey = 0;
    for (var i = 0; i < charges.length; i++) {
      var c = charges[i],
        dx = x - c.x,
        dy = y - c.y,
        r2 = dx * dx + dy * dy;
      if (r2 < 1e-10) continue;
      var f = (K * c.q) / (r2 * Math.sqrt(r2));
      ex += f * dx;
      ey += f * dy;
    }
    return [ex, ey];
  }

  // Potential with the reference at infinity: φ = (1 / 4πε0) Σ Q_i / r_i.
  function potential(charges, x, y) {
    var phi = 0;
    for (var i = 0; i < charges.length; i++) {
      var c = charges[i],
        r = Math.hypot(x - c.x, y - c.y);
      phi += (K * c.q) / Math.max(r, 1e-5);
    }
    return phi;
  }

  // Externally supplied work to move charge q from potential phiStart to phiEnd: W_e = q (φ_end − φ_start).
  function work(q, phiStart, phiEnd) {
    return q * (phiEnd - phiStart);
  }

  // Zero-field point between two like charges q1 and q2 a distance d apart, measured from q1.
  function nullPoint(q1, q2, d) {
    return d / (1 + Math.sqrt(q2 / q1));
  }

  // Engineering format with SI prefixes and a true minus sign, e.g. fmt(1150, "V/m") → "1.15 kV/m".
  var PREFIX = [
    [1e9, "G"],
    [1e6, "M"],
    [1e3, "k"],
    [1, ""],
    [1e-3, "m"],
    [1e-6, "μ"],
    [1e-9, "n"],
    [1e-12, "p"],
  ];
  function fmt(v, unit, digits) {
    digits = digits || 3;
    if (!isFinite(v)) return "—";
    var a = Math.abs(v);
    if (a < 1e-15) return "0 " + unit;
    var p = PREFIX[PREFIX.length - 1];
    for (var i = 0; i < PREFIX.length; i++) {
      if (a >= PREFIX[i][0] * 0.9995) {
        p = PREFIX[i];
        break;
      }
    }
    var s = (a / p[0]).toPrecision(digits);
    if (s.indexOf("e") !== -1) s = String(Math.round(a / p[0]));
    return (v < 0 ? "−" : "") + s + " " + p[1] + unit;
  }

  var api = { EPS0: EPS0, K: K, field: field, potential: potential, work: work, nullPoint: nullPoint, fmt: fmt };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.EEI1 = api;
})(this);
