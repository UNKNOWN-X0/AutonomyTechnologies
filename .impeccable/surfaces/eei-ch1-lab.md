---
version: 1
slug: "eei-ch1-lab"
primary_target: "eei/ch1-electrostatic-fields-lab.html"
related_targets: ["css/lab.css", "js/lab.js", "js/eei-ch1-lab.js", "eei/ch1-electrostatic-fields.html", "index.html"]
---

# EEI Chapter 1 lab: Electrostatic Fields

Confirmed with the owner on 2026-10-28 (shape: scope, interaction, format, hub integration).

**Job and audience:** the owner and classmates, arriving from the guide, the hub's Lab button, or a "Try it in the lab" link in a guide section. Mode: Operate (finish a challenge, understand why). The lab is step 3 of the study loop: predict the result before looking. Grounded in the ultimate-study skill: generation (attempt before being shown; wrong attempts still help) and calibration (compare confidence with objective evidence).

**Outcome:** each experiment opens with challenges. The student predicts (choice or marker), rates confidence (sure / think so / guessing), then the simulation plays the reveal and a short "why" links to the guide section. A free sandbox unlocks after the challenges. A per-experiment calibration summary flags "sure but wrong" answers as topics to revisit, with links to guide sections and practice problems. Physics uses the notes' conventions (U12 = φ1 − φ2, external work W_e, σ_A, ϱ_V) and the guide's constants; simulated numbers are unit-tested against the guide's worked answers.

**Direction:** the site's existing sign system, unchanged: FAU-blue sign header, square corners, subject colour accents, a contents rail listing the five experiments. Signature moment: the reveal animates from the starting state to the true result and leaves the student's prediction as a ghost marker.

**Scope (one page, in chapter order; each experiment is titled with its section numbers and topic):**

| Experiment | Sections | Controls | Shows |
|---|---|---|---|
| 1.2–1.9 Point charges: field, potential and work | 1.2–1.4, 1.7–1.9 | up to 4 charges (sign, size), drag; probe | E vectors, field lines, equipotentials, probe force, potential, work along a dragged path |
| 1.10 Gauss’s law: a charged cylinder | 1.10 | radius a, ϱ_V, Gaussian ρ, ε_r | enclosed charge, live D(ρ) plot with marker, E = D/ε |
| 1.11 Interface conditions: field refraction | 1.11 | incoming E and angle, ε1, ε2, surface charge σ | component split, refracted line, values both sides |
| 1.12–1.14 Plate capacitor: gap, dielectric and energy | 1.11.4, 1.12–1.14 | area, gap, slab (none / dielectric / metal) and thickness, isolated vs connected | field-line density, E in gap and slab, U, Q, C, W, energy density |
| 1.13 Capacitor networks: series and parallel | 1.13.3 | 2–3 capacitors in series or parallel, source U | Q and U per capacitor as bars, total C |

Out of scope: charge densities, dipole torque, multilayer and variable capacitors (guide only).

**Hub integration (owner's choice):** each experiment is a lab skill. Finishing an experiment's challenges ticks `lab-<experiment>` in the chapter's existing `eei1-ch1-checks` store and logs a review day in `eei1-ch1-log`. The hub chapter row gets a Lab button, and its `data-total` becomes guide checklist items + 5. The guide's own self-check still counts only its own boxes.

**States:** first visit (experiment 1's first challenge ready), mid-challenge, revealed, sandbox, all done (calibration summary), reset per experiment; results saved under `eei1-ch1-lab`; without JavaScript a note and the guide link.

**Interaction and layout:** phone: challenge card, then stage, then controls; desktop: stage and controls side by side under the card. Pointer and touch drag; charges also move with arrow keys. Tabular readouts with units. Motion per DESIGN.md (purposeful; reduced motion swaps the reveal instantly and keeps the ghost marker). The 2D field view is labelled as a slice through the 3D field (1/r² law).

**Constraints:** vanilla HTML, CSS, JS, no dependencies, offline, GitHub Pages. Canvas for fields and heatmaps, SVG for markers and plots; precompute grids, redraw on change, smooth on phones. Files: `css/lab.css` and `js/lab.js` (shared challenge, confidence and summary engine), `js/eei-ch1-lab.js` (this lab), a physics test. Integration: hub Lab button, guide "Try it in the lab" links, BrowserTests smoke entry, a lab section in GUIDE-STANDARD.md with checker support.

**Build order:** challenge engine + Field playground, then Capacitor bench, Networks, Interface, Gauss cylinder.
