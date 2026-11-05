---
version: 1
slug: "eei-ch2-lab"
primary_target: "eei/ch2-stationary-currents-lab.html"
related_targets: ["css/lab.css", "js/lab.js", "js/eei/ch2-physics.js", "js/eei/ch2-lab.js", "eei/ch2-stationary-currents.html", "index.html"]
---

# EEI Chapter 2 lab: Stationary Currents

Plan for the Chapter 2 study guide. Audience, source scope, and product constraints follow `PRODUCT.md` and `docs/LAB-STANDARD.md`. Chapter 2 guide is the authority for scope and notation.

**Job:** give a student who has read the guide a place to commit to a physical prediction, state confidence, and watch current, fields, or energy respond. A wrong answer remains visible during the reveal and points back to the relevant guide section.

**Outcome and proof:** the student can tell total current from current density, keep electron drift and conventional current directions straight, use local and integral Ohm’s law with units, apply interface conditions, and distinguish power from energy. Proof is one committed answer and confidence rating per challenge, followed by a mechanism-focused reveal and a short explanation.

**Direction:** preserve the EEI Chapter 1 lab’s FAU-blue sign system, amber subject accent, square geometry, Hanken Grotesk, and light/dark tokens. Use simple, labelled geometric diagrams rather than decorative illustrations. Each reveal keeps the predicted quantity as a dashed/ghost marker while the physical state moves to its calculated result.

## Experiments (in chapter order)

| Experiment | Section | Visual mechanism and sandbox | Four fixed challenge targets |
|---|---|---|---|
| Current through a cut | 2.1.1–2.1.3 | Signed charge packets move through an oriented cut; the meter integrates only the normal component. An adjacent control volume shows equal inflow and outflow in the stationary state. Set carrier type/count, packet rate, cut angle, and area. | `current-rate` rate vs amount of charge; `surface-angle` cosine projection; `electron-sign` negative charge times electron velocity; `stationary-balance` equal in/out flow and zero closed-surface net current. |
| Drift and material response | 2.2.1–2.2.2 | Electron drift arrow opposes E while conventional J follows it; paired E/J gauges update from κ = nₑeμₑ. Set E, carrier density, mobility, and temperature through the guide’s linear resistivity approximation. | `drift-direction` electron vs conventional direction; `drift-speed` signed vₑ = −μₑE; `conductivity` carrier density/mobility effect on κ; `temperature-response` higher T in the stated model raises ρ and lowers κ. |
| Uniform wire | 2.2.3 | A labelled wire grows/shrinks in length and cross-section; resistance and current/voltage readouts follow R = ρl/A. Set material, length, area, and choose voltage- or current-driven mode. | `wire-length` doubling l doubles R; `wire-area` doubling diameter quarters R; `wire-ohm` U=RI for the given state; `drive-condition` fixed U versus fixed I when R changes. |
| Resistor tolerance | 2.2.4 | A nominal-value marker sits between a tolerance band and a measured-value marker; controls switch the E-series tolerance cited in the guide. Set nominal resistance and E6/E12/E24 series. | `tolerance-band` calculate endpoints; `series-precision` compare ±20/±10/±5%; `inside-band` classify an actual value; `overlap-bands` compare whether two allowed ranges overlap. |
| Conductivity interface | 2.3 | Two material regions show normal/tangential components of E and J, with a directional arrow refracting at the boundary. Set κ₁, κ₂, Jₙ, Eₜ; sandbox accepts own positive values. | `normal-current` Jₙ continuity; `tangent-field` Eₜ continuity; `component-ratios` conductivity dependence of the unconstrained components; `current-angle` tan α₁/tan α₂ = κ₁/κ₂ with α from the normal. |
| Power and energy | 2.4 | A resistor converts electrical input into a growing heat/energy bar; power and accumulated energy are shown separately. Set R, voltage or current source, elapsed time, and conductor volume; E and J follow from a uniform 2 m conductor. | `power-voltage` P=U²/R; `power-current` P=I²R; `energy-time` W=PT and time conversion; `power-density` pᵥ=E·J and W/m³ versus total W. |

**Challenge design rule:** each prompt states which quantity is fixed and includes enough values to answer one question. Answer positions vary. The sandbox is available from each challenge via **Explore freely**, and after completion; challenge-specific ghost markers are cleared when the sandbox opens.

**Shared state:** use `data-key="eei1-ch2"` and `data-skills="16"`, so six lab skills join (without replacing) the guide’s self-check in the course progress row. Store lab calibration under a separate `eei1-ch2-lab` key. Do not rename published experiment IDs.

## Scope and files

- Add `eei/ch2-stationary-currents-lab.html`, `js/eei/ch2-physics.js`, `js/eei/ch2-lab.js`, and `tests/eei-ch2-physics.test.js`.
- Reuse `js/lab.js` and `css/lab.css`; no dependency or shared-engine change is planned.
- Add a guide-to-lab link to the relevant Chapter 2 section(s), add the Chapter 2 Lab button with `data-lab="6"` and `data-total="22"`, and add the page to the workspace BrowserTests smoke list.
- Out of scope: changing the study guide’s topic coverage, inventing resistor preferred numbers not in the lecture, and extending the lab into AC/displacement current, circuits beyond a single resistor, or transient behavior.

## Acceptance

Follow `docs/LAB-STANDARD.md`: guide checker; all 24 challenge definitions and math cross-checks; `node --test`; Chromium and WebKit at 1280, 390, light/dark, reduced motion; challenge replay; sandbox mouse/touch/keyboard and controls; BrowserTests smoke; graph refresh. Check that a first-visit hub and a hub with seeded Chapter 2 progress both show a usable Lab action and correct progress counts.
