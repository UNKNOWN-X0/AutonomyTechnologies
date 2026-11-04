# Plan: more diagrams, freer labs

Written 2026-11-04 after the owner asked for (1) a chapter-by-chapter check of where guides need more diagrams and (2) a review of the labs, which feel fixed and have bugs. Nothing here is built yet. Work through the phases in order; each can ship on its own.

## Part A: diagrams by chapter

The guides already use the `figure.viz` kinds `venn`, `numline`, `bits`, `circle`, `field` and `ladder`, plus `figure.amap` arrow diagrams (see docs/GUIDE-STANDARD.md). A diagram is proposed only where the idea has a shape: sets, intervals, bit layouts, geometry, fields, flows, graphs of functions. **New** marks a kind that needs a renderer in both `js/guide.js` and `tools/guide-to-tex.py`.

### New kinds needed

| Kind | Draws | Used by |
|---|---|---|
| `plot` | Axes, one or two function graphs, a shaded region, marked points, an optional horizontal or vertical test line | MEI 3.1, 3.3, 3.5; EEI 1.8, 1.14 |
| `wheel` | A circle of the 2<sup>n</sup> bit patterns of an n-bit number, with unsigned and two’s-complement values, and an arc for an addition | APDR 3.5 / 34a 3.5 |
| `kmap` | A Karnaugh grid in Gray-code order with coloured groups, including wrap-around | APDR 12a 1.4 |
| `wave` | Signal timelines (0/1 levels) with a delay and a highlighted glitch | APDR 2.8, 12a 1.6 |
| `flow` | Boxes and arrows in a row or loop, with one decision diamond | APDR 2.1, 2.2, 2.3 |
| `nest` | Nested labelled boxes (sets inside sets) | MEI 2.1 |
| `cells` | Memory boxes with addresses, and arrows from a pointer or a name to a box | APDR 34a 5.1, 5.2 |
| `venn` shades `nor`, `nand`, `imp` | Complement of a union, of an intersection, and the region where A ⇒ B is true | APDR 2.6, MEI 1.1, 1.2 |
| `field` variants `pair`, `dipole`, `surface`, `slab`, `equipot` | Two charges with force arrows; dipole field lines computed from E; a Gaussian surface; a dielectric slab of aligned dipoles; equipotential circles | EEI 1.2, 1.7, 1.8, 1.10, 1.12 |

### Where, chapter by chapter

**MEI 1**
- 1.1: Venn `imp` (A ⇒ B is false only in A \ B).
- 1.2: Venn `nor` and `nand` beside the De Morgan card, so the two laws are seen as the same pictures; `numline` for [1, 3) next to the interval notation.

**MEI 2**
- 2.1: `nest` ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ, with one example number in each ring (2, −3, 1/2, √2).
- 2.4: `bits`-style grid or a small Pascal triangle (can reuse `bits` rows) beside the Pascal identity card.
- 2.5: `flow` of the domino chain: base case → step → every n.

**MEI 3**
- 3.1: `plot` with the vertical-line test (a graph that passes and a sideways parabola that fails).
- 3.3: `plot` of f and f<sup>−1</sup> reflected in y = x (x<sup>2</sup> on [0, ∞) and √x).
- 3.5: `plot` of a quadratic with Δ &gt; 0, = 0, &lt; 0; `plot` of e<sup>x</sup> and ln x as mirror images.

**APDR 2**
- 2.1: `flow` of an iteration with its stopping test ("close enough?").
- 2.2: `flow` of the stored-program machine: memory → control unit → registers/logic → output.
- 2.3: `flow` of the three checks: syntax → static semantics → semantics.
- 2.6: Venn `nor` and `nand` for De Morgan.
- 2.8: `wave` of an input step and the delayed output.

**APDR 12a**
- 1.4: `kmap` with a group of four and a wrap-around pair.
- 1.5: `amap`-style tree or a small decision diagram for Shannon expansion (A, then B or C).
- 1.6: `wave` of the static-1 hazard and the consensus term closing it.

**APDR 3 and 34a (3.x)**
- 3.3: `bits` of 'A' = 0100 0001 = 65.
- 3.4: `bits` rows for a column addition with its carry row.
- 3.5: `wheel` of 4-bit two’s complement, showing 7 + 1 wrapping to −8.

**APDR 4 and 34a (4.x)**
- 4.1: `numline` of the representable values in two binary zones, showing the gap doubling.
- 4.3: `bits` rows for aligning exponents before an addition.
- 4.5: `bits` patterns for +0, −0, +∞ and NaN.

**APDR 34a (5.x)**
- 5.1: `cells` for `int x = 10; int *p = &x;` and for `a[i] = *(a + i)`.
- 5.2: `cells` for two names bound to one list, before and after `a += [3]`.

**APDR 5**
- 5.2: `bits` of a 16-bit address beside "2<sup>16</sup> rows".
- 5.4: a grid of chips side by side (width) and in rows (depth), as `flow` boxes.

**EEI 1**
- 1.2: `field pair` for like and unlike charges, with the force arrows.
- 1.4: a vector sum at a point (two field arrows and their resultant), part of `field pair`.
- 1.7: `field dipole` with computed lines (both renderers integrate the same E).
- 1.8: `field equipot` (equipotential circles across the radial lines); `plot` of φ ∝ 1/r against E ∝ 1/r<sup>2</sup>.
- 1.10: `field surface`: a dashed Gaussian surface around a charge.
- 1.12: `field slab`: aligned dipoles in a slab between the plates.
- 1.13: series and parallel capacitors as `flow` boxes (a circuit kind is not worth it yet).
- 1.14: `plot` of u against q with the triangle area ½ Q U shaded.

Roughly 45 diagrams. Each caption still names what to look at, and no picture carries a fact the text does not.

## Part B: labs

### What a lab is today

Every lab follows docs/LAB-STANDARD.md: each experiment has four fixed challenges (predict, rate confidence, reveal), and the sandbox opens only after all four are done. Ten labs, 53 experiments.

### Bugs found (Playwright WebKit, 1288 px, sandboxes opened)

1. **EEI 1.2–1.9 sandbox opens empty.** `sandbox()` clears the challenge charges, so the field view shows only the grid and the probe until you press a preset. Start the sandbox with one +1 nC charge.
2. **EEI 1.10, 1.11, 1.12, 1.13: sandbox controls overflow the experiment** sideways at 1288 px (the three control columns are wider than the section).
3. **MEI 2.4 Pascal:** the stage slider’s handle sits on top of the stage caption text.
4. **MEI 1.2 Venn:** the B label sits on the circle outline and the element 4 floats without context.
5. **Empty stages:** many stages fill only the top half of their 336 px (APDR 3.x, 12a 1.2–1.3, MEI 2.1). The stage should size to its content or use the space.
6. **Two controls for one thing:** MEI labs have both a slider strip drawn on the stage and a dropdown below it that do the same job.
7. **Control rows:** at desktop widths the label sits at the far left and its control far to the right, which is hard to scan.

No console errors on any lab.

### Why it feels fixed

- **Four challenges, then done.** There is no way to get a new question once the four are answered.
- **The sandbox is locked** until the challenges are finished.
- **Sandboxes are mostly presets.** MEI 1, 2 and 3 offer one dropdown per experiment; APDR 12a lets you pick a law, a function or an input pair from a list, not enter your own. APDR 3, 4, 5 and EEI are freer (typed values, sliders, drag).

### Proposed changes

**Phase 1: fix the bugs** (items 1–7 above). Small; full lab acceptance run afterwards (LAB-STANDARD §Acceptance).

**Phase 2: open the sandbox.** An **Explore freely** button on every experiment opens the sandbox at any time; the challenges stay, and finishing them still ticks the skill. Results update live as you change inputs (no Convert/Calculate button where the work is instant). This changes LAB-STANDARD’s "Explore after testing" principle, at the owner’s request.

**Phase 3: real inputs instead of presets**, lab by lab:
- **MEI 1:** type any formula in A, B, C (¬ ∧ ∨ ⇒ ⇔) and see its truth table; click Venn regions to build a set and see its formula; type interval endpoints and pick the brackets.
- **MEI 2:** click bits to toggle them; drag a and r on the number line; any Pascal row up to n = 15 with the (a + b)<sup>n</sup> expansion; test your own induction claim for n = 1 … N.
- **MEI 3:** type a rule f(x) (a small safe parser: + − × ÷ ^, √, |x|, sin, cos, exp, ln) and choose its domain; draw arrows in the mapping view by clicking an input then an output; compose two typed rules; drag a horizontal line for the inverse test; drag the polar point.
- **APDR 12a:** type both sides of an identity and compare rows; click K-map cells and see the cover; type a function for Shannon/OBDD and drag the variable order; build an ANF from a clickable truth table; set the two path delays for the hazard.
- **APDR 2:** custom input for the algorithm stepper; type a logic expression; build a small circuit from NAND gates.
- **APDR 3, 4, 34a, 5:** clickable bit cells everywhere a pattern is shown, with live results.
- **EEI:** already free; after the bug fixes, add saving and restoring a charge layout.

**Phase 4: endless practice.** After the four fixed challenges, **New challenge** generates a fresh one of the same type with random values (from the chapter’s physics module, so the answer is computed, not stored). The tests in `tests/lab-challenges.test.js` gain a generator check: every generated challenge has exactly one correct option.

### Order and checks

Phase 1, then 2, then 3 one lab at a time, then 4. Each lab change runs the LAB-STANDARD acceptance (Chromium and WebKit, 1280 and 390 px, light and dark, reduced motion, every control and drag), `node --test tests/*.test.js`, and `check-guide.py` on the guide next to it.
