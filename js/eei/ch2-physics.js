/* EEI Chapter 2 relations in SI units. Shared by the lab and node tests. */
(function (root) {
  var E_CHARGE = 1.602e-19;

  function current(q, seconds) { return q / seconds; }
  function throughSurface(J, area, angleDeg) { return J * area * Math.cos((angleDeg * Math.PI) / 180); }
  function drift(mu, E) { return -mu * E; }
  function conductivity(n, mu, deltaT, alpha) { return (n * E_CHARGE * mu) / (1 + (alpha || 0) * (deltaT || 0)); }
  function wire(kappa, length, area) { return length / (kappa * area); }
  function tolerance(nominal, fraction) { return { low: nominal * (1 - fraction), high: nominal * (1 + fraction) }; }
  function interface_(k1, k2, Jn1, Et) {
    var Jt1 = k1 * Et, Jt2 = k2 * Et, En1 = Jn1 / k1, En2 = Jn1 / k2;
    return {
      Jn1: Jn1, Jn2: Jn1, Et1: Et, Et2: Et,
      Jt1: Jt1, Jt2: Jt2, En1: En1, En2: En2,
      alpha1: Math.atan2(Jt1, Jn1), alpha2: Math.atan2(Jt2, Jn1),
    };
  }
  function power(U, I, R) { return { P: U * I, fromU: (U * U) / R, fromI: I * I * R }; }
  function energy(P, seconds) { return P * seconds; }
  function powerDensity(E, J, volume) { return { density: E * J, total: E * J * volume }; }

  var api = {
    E_CHARGE: E_CHARGE,
    current: current,
    throughSurface: throughSurface,
    drift: drift,
    conductivity: conductivity,
    wire: wire,
    tolerance: tolerance,
    interface: interface_,
    power: power,
    energy: energy,
    powerDensity: powerDensity,
  };
  root.EEI2 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
