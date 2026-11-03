# Plan: "The Sweep" motion layer

Implementation plan for the third motion pass, written 2026-11-03 for an implementing agent. It builds on the Route Ahead layer (commit `3a3d44e`, plan in [ROUTE-AHEAD-PLAN.md](ROUTE-AHEAD-PLAN.md)). Work through the tasks in order. Each task can ship on its own: finish it, verify it, report, and wait for the go-ahead before starting the next one.

## The idea

A sensor sweeping a scene is the core image of an autonomous system. The site's signature motion becomes **the sweep**: a 2px signal line (`var(--signal)`) passing once across something, with content resolved where the line has passed. It is used in a few named places only. Everything else stays still or keeps its current motion.

Motion that teaches comes second: stepping through worked examples, tracing a symbol through a section, and showing direction in the concept map.

## Before you start

1. Read `AGENTS.md` (project and workspace), `PRODUCT.md`, `DESIGN.md` in full, then this plan.
2. Read the sections **"Rules that apply to every task"** and **"Verification for every task"** in [ROUTE-AHEAD-PLAN.md](ROUTE-AHEAD-PLAN.md). They apply here unchanged, with one correction: the real browser test run is `npm test` in `/Users/thanate/Developer/BrowserTests` (`scripts/test-all.sh` prints nothing). The baseline is 43 passed, 2 skipped, and 76 detector findings.
3. Run `/Users/thanate/.claude/skills/impeccable/scripts/impeccable context` once from this folder. Read `/Users/thanate/.claude/skills/impeccable/reference/craft-floor.md` and `reference/animate.md` before the first UI edit.
4. `git status` should be clean apart from this file.
5. Do not commit, push or deploy unless the user asks.

## Extra rules for this plan

- **The sweep is a line, never a wash.** It is a 2px `var(--signal)` line. Nothing behind it is tinted, and it has no glow, blur or trail.
- **Never make anyone wait.** Content is readable from the first frame. Sweeps are overlays or clip reveals of 350–600ms, and none of them blocks input.
- **One sweep per moment.** Do not chain sweeps on the same screen.
- **Reduced motion:** the sweep line is not drawn. Clip reveals become a 120–150ms opacity fade, and state changes still show.
- **No guide HTML edits.** Every task enhances existing markup from shared JS and CSS, so no TeX or PDF regeneration is needed. If a task seems to need HTML changes, stop and ask.
- **DESIGN.md:** after each task, add or update one bullet under Motion → Authored moments describing what was built, in the style of the existing bullets. Update the Do/Don't list only if the task adds a rule.

---

## Task 1: Page transitions sweep

Where: `css/system.css`, the `@view-transition` block (around line 476).

- Replace the root `vt-out` and `vt-in` pair with a sweep:
  - The old page stays put and fades over 200ms.
  - The new page is revealed top to bottom with `clip-path: inset(0 0 100% 0)` → `inset(0)` over 360ms, using `var(--ease)`.
  - A 2px signal line rides the reveal edge. The view-transition pseudo-elements cannot have children, so the line needs its own layer: for example a `background` on `::view-transition-group(root)` animated in step with the clip, or a small fixed element with its own `view-transition-name`. Use pure CSS (cross-document transitions give no JS hook on the old page), pick the simplest approach that works in both Chromium and WebKit, and record the choice in a comment.
- Keep the `rail` and `switch` groups holding their place, as they do now.
- Reduced motion keeps the existing 120ms block and draws no line.
- **Acceptance:** guide → lab → hub navigation in Chromium and WebKit (WebKit 18.2+ supports cross-document view transitions, so check what Playwright's WebKit does and report it). The line is visible mid-transition in a screenshot taken about 150ms after the click. No horizontal scroll. Browsers without view-transition support navigate normally.

## Task 2: Hub first-load sweep

Where: `js/index.js`, `css/index.css`.

- On the first hub load of a browser session (`sessionStorage` key `hub-swept`, guarded with try/catch), one horizontal signal line travels down the visible board once (600ms, `var(--ease)`, `position: fixed`, `aria-hidden`, `pointer-events: none`, removed when finished).
- As the line passes each **started** chapter's route stop (`li.chapter.started::before`), that stop fills. Implement it by giving the stops a short fill transition, with a delay computed from each stop's viewport `top` against the line's travel. Stops below the viewport fill at once.
- Content is never hidden. Only the stop fill and the line are animated.
- Later loads in the same session, and reduced motion, show the final state with no line.
- It must not fight the existing scroll-driven `route-draw` (Task 2 of the Route Ahead plan) or the board's FLIP (Task 7). Run the sweep only when the page is scrolled to the top.
- **Acceptance:** seed two started chapters. The first load shows the line and the stops filling in order. A reload in the same tab shows no line, and a new context shows it again.

## Task 3: In-page jumps lock on

Where: `css/guide.css` (the `section:target > h2::before`, `h3::before`, `.flash::before` rules and `@keyframes sign-flash`, around lines 660–710). First find out where `.flash` is added (it is not in `js/guide.js`; check `js/tooltip.js` and the lab and hub scripts) so every trigger still works.

- Replace the flash with a lock-on: four 2px signal corner brackets close in from about 10px outside the heading's blue square onto its edges (300ms), hold for 300ms, then fade (200ms).
- Draw the corners on the existing square's pseudo-element with `background` gradients (four corner pieces) or an `outline`-free `::after`. Do not add DOM nodes.
- Reduced motion: the brackets appear in place and fade, with no closing-in movement.
- **Acceptance:** clicking a contents link in a guide and in a lab shows the lock-on on the target. Arriving at `page.html#sec-13` from another page does the same. Print shows no brackets.

## Task 4: Worked examples step by step

Where: `js/guide.js`, `css/guide.css`. Markup already exists: `div.worked > ol.method-list > li` (EEI Chapter 1 has 10).

- Each `.worked` that has two or more steps gets one quiet text button after its title: **Step through**. Use the existing `.btn` style; it is a control, so no signal colour.
- Pressing it hides every step after the first and turns the button into **Next step**, which reveals one step at a time. The revealed step enters with a left-to-right clip reveal (240ms) and a 2px signal underline that draws across it and then fades (400ms).
- After the last step the button reads **Show all again** and resets the example to its normal, all-visible state.
- Default state is unchanged: every step visible. Without JS and in print, all steps show.
- Hidden steps use `hidden`, so screen readers and Find-in-page match what is visible. After a reveal, move focus to nothing; announce the step count in the button text, for example "Next step (3 of 5)".
- **Acceptance:** step through a whole example with the mouse and the keyboard in both engines. Reduced motion reveals steps with a fade only. A 390px screenshot shows the button fits.

## Task 5: Symbol tracing

Where: `js/guide.js`, `css/guide.css`.

- Only on devices with `(hover: hover) and (pointer: fine)`. Hovering a `var` inside a guide `section` underlines every `var` in that same section with the same text content and the same following `sub` (so *E* and *E*<sub>0</sub> are different symbols).
- The underline is a 2px signal line under each match, drawn left to right, staggered 30ms in document order and capped at 12 matches. It clears on mouseleave, with a 150ms fade.
- Skip `var` elements inside `.cmap`, `details.answers` and `.formula` that has fewer than two matches in the section (a single match is noise).
- This is a decorative aid: it carries no information that is not already on the page, so it needs no keyboard equivalent and no ARIA.
- **Acceptance:** hover *E* in EEI §1.3 and *ε*<sub>0</sub>; the matches light in order and clear. No effect on touch emulation (`hasTouch: true`) or at 390px.

## Task 6: Concept-map direction pulse

Where: `js/concept-map.js` (from Route Ahead Task 6).

- After a selected node's lines finish drawing, one 6px square signal fill travels along each line from the dependency to the selected node (the direction of "builds on"), 500ms, using `getPointAtLength` driven by `requestAnimationFrame`, then disappears.
- Only on an animated selection: not on the quiet default selection, not under reduced motion, not under 760px.
- Cancel any running pulse when the selection changes or the map redraws.
- **Acceptance:** select Polar conversion (MEI Chapter 3) and Stored energy (EEI Chapter 1); each line gets one pulse moving toward the selected node. Rapid re-selection leaves no stray squares.

## Task 7 (optional, ask first): Section checked

Recall checks have no tick boxes, so "cleared" can only mean "every answer key in this section has been opened". Ask the user whether that meaning is acceptable before building it.

If approved:
- Store opened answer keys per guide in `localStorage` (`<data-key>-seen`, an object of section ids, guarded with try/catch).
- When every `details.answers` in a section has been opened at least once, that section's entry in the contents rail gains a small signal square and its heading square fills, with a single lock-on (Task 3) the first time.
- Add a text equivalent: the rail link gets `aria-label` "… (checked)".

---

## Dropped from the brainstorm

- **Lab prediction gauge.** Every lab challenge is multiple choice (`options` and `answer` keys), so there is no number to place on a scale.
- **Derivation term morphing.** The "Derive it cold" sections are prompts, not written-out steps; Task 4 covers the worked examples instead.

## Out of scope

As in ROUTE-AHEAD-PLAN.md: no new fonts or colours, no shadows, radii, glass or glow, no dark-by-default theme, no redesign of the reading column, no guide content edits and no libraries. Also: no parallax, particles, 3D tilt, cursor trails or looping background motion. If a task seems to need any of these, stop and ask.
