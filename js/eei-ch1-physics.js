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

  // Ideal plate capacitor (fringing neglected), area A, gap d, with an optional slab of thickness t
  // placed in the gap: { A, d, slab: "none" | "dielectric" | "metal", t, er }.
  // The slab is in series with the air: C = ε0 A / (d − t + t/εr); a metal slab removes t from the gap.
  function plate(p) {
    var t = p.slab === "none" ? 0 : Math.min(p.t, p.d),
      gap = p.slab === "metal" ? p.d - t : p.d - t + t / p.er;
    return (EPS0 * p.A) / gap;
  }
  // Full state for a fixed charge Q (disconnected) or a fixed voltage U (connected to a source).
  function bench(p, mode, value) {
    var C = plate(p),
      Q = mode === "connected" ? C * value : value,
      U = Q / C,
      D = Q / p.A,
      Eair = D / EPS0,
      Eslab = p.slab === "metal" ? 0 : p.slab === "dielectric" ? D / (EPS0 * p.er) : Eair;
    return {
      C: C,
      Q: Q,
      U: U,
      D: D,
      Eair: Eair,
      Eslab: Eslab,
      W: (Q * Q) / (2 * C),
      wair: 0.5 * D * Eair,
      wslab: 0.5 * D * Eslab,
    };
  }

  // Capacitors C (farads) across a source U, all in series or all in parallel.
  // Series: the same charge on each, 1/C = Σ 1/C_n. Parallel: the same voltage on each, C = Σ C_n.
  function network(Cs, how, U) {
    var total = how === "series" ? 1 / Cs.reduce(function (s, c) { return s + 1 / c; }, 0) : Cs.reduce(function (s, c) { return s + c; }, 0),
      Q = total * U;
    return {
      C: total,
      Q: Q,
      parts: Cs.map(function (c) {
        var u = how === "series" ? Q / c : U;
        return { C: c, U: u, Q: c * u, W: 0.5 * c * u * u };
      }),
    };
  }

  // Field crossing a flat boundary from medium 1 into medium 2 (normal n from 1 into 2).
  // Incoming |E1| at angle a1 (degrees) from the normal; σ is free surface charge on the boundary.
  // Tangential E is continuous; normal D jumps by σ: D_n2 = D_n1 + σ.
  function interface_(E1, a1, er1, er2, sigma) {
    var r = (a1 * Math.PI) / 180,
      En1 = E1 * Math.cos(r),
      Et = E1 * Math.sin(r),
      Dn1 = EPS0 * er1 * En1,
      Dn2 = Dn1 + (sigma || 0),
      En2 = Dn2 / (EPS0 * er2);
    return {
      En1: En1,
      Et: Et,
      Dn1: Dn1,
      Dn2: Dn2,
      En2: En2,
      E2: Math.hypot(En2, Et),
      a2: (Math.atan2(Et, En2) * 180) / Math.PI,
      Dt1: EPS0 * er1 * Et,
      Dt2: EPS0 * er2 * Et,
    };
  }

  // Infinitely long, uniformly charged cylinder (radius a, density ρv) in a medium of relative permittivity
  // εr everywhere. A coaxial Gaussian cylinder of radius ρ: enclosed charge per metre, D and E (radial).
  function cylinder(rhoV, a, rho, er) {
    var q = rhoV * Math.PI * Math.min(rho, a) * Math.min(rho, a),
      D = rho > 0 ? q / (2 * Math.PI * rho) : 0;
    return { q: q, total: rhoV * Math.PI * a * a, D: D, E: D / (EPS0 * er) };
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

  var api = { EPS0: EPS0, K: K, field: field, potential: potential, work: work, nullPoint: nullPoint, plate: plate, bench: bench, network: network, interface: interface_, cylinder: cylinder, fmt: fmt };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.EEI1 = api;
})(this);
