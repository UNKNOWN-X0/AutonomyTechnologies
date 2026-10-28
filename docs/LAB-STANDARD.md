# Lab standard

What "done" means for a chapter lab: a page of predict-then-reveal experiments beside the chapter's study guide. It complements [GUIDE-STANDARD.md](GUIDE-STANDARD.md), which covers the guide the lab belongs to, and [DESIGN.md](../DESIGN.md), which covers the visual system.

**Reference lab:** [EEI Chapter 1, Electrostatic Fields](../eei/ch1-electrostatic-fields-lab.html). Its design brief is `.impeccable/surfaces/eei-ch1-lab.md`.

**Sections:** [Principles](#principles) · [Files](#files) · [Page](#page) · [Experiments](#experiments) · [Challenges](#challenges) · [Stage](#stage-and-interaction) · [Layout](#layout) · [Motion](#motion) · [Physics](#physics-and-tests) · [Guide links](#links-to-and-from-the-guide) · [Acceptance](#acceptance) · [Updating](#updating-a-lab)

## Principles

| Principle | What it means for a lab |
|---|---|
| Generation | The student commits to a prediction before anything moves. A wrong guess still teaches, as long as it was a real commitment. |
| Calibration | Every prediction carries a confidence (sure / think so / guessing). "Sure but wrong" answers are collected in the results as the ideas to revisit first. |
| Show the mechanism | The reveal animates what causes the result (components at a boundary, charge flowing in wires, enclosed charge), not just the final number. |
| One idea per challenge | Each challenge isolates one misconception that a student is likely to hold. |
| Explore after testing | The sandbox opens only once the challenges are done, so free play follows the prediction work instead of replacing it. |

## Files

| Item | Rule |
|---|---|
| Page | `<subject>/ch<N>-<topic>-lab.html`, beside the guide `<subject>/ch<N>-<topic>.html`. |
| Shared engine | `js/lab.js` (challenges, confidence, verdict, results, progress) and `css/lab.css`. Never copy them into a chapter; extend them for every lab. |
| Chapter scripts | `js/<subject>/ch<N>-physics.js` (formulas only, no DOM) and `js/<subject>/ch<N>-lab.js` (the experiments). |
| Tests | `tests/<subject>-ch<N>-physics.test.js`, run with `node --test`. |
| Hub | The chapter's `<li class="chapter">` links to the lab, has `data-lab` equal to the number of experiments, and `data-total` equal to guide checklist items plus `data-lab`. |
| Smoke suite | The lab page is listed in the workspace's `BrowserTests/tests/smoke.spec.js`. |

## Page

- **Shell:** the guide's: same header sign, contents rail, Guide | Lab switcher (Lab current), and source note.
- **Body:** `<body class="s-<subject>-<n> lab" data-key="<guide key>" data-guide="<guide file>" data-skills="<guide checklist count>">`. Sharing the key makes lab progress land in the guide's store.
- **Scripts, in this order:** `../js/<subject>/ch<N>-physics.js`, `../js/lab.js`, `../js/<subject>/ch<N>-lab.js`, `../js/tooltip.js`.
- **Blocks, in this order:** standfirst; "How the lab works" (`#how`); one section per experiment; "Your results" (`#lab-results`); source note. A `<noscript>` note links to the guide.
- **Contents rail:** How the lab works, an "Experiments" group with the short names, Your results.
- **Header line:** "x of N guide skills · y of M lab experiments", the same line as the guide.

## Experiments

- **Choice:** 4–6 experiments per chapter, covering the sections where seeing something move helps most. Leave pure definitions and static facts to the guide.
- **Order:** follow the chapter.
- **Title:** the section numbers, the topic, then what it shows, e.g. "1.10 Gauss’s law: a charged cylinder". The contents rail and results use the short form ("1.10 Gauss’s law").
- **Markup:** `<section class="experiment" id="exp-<name>" data-experiment="<name>">` containing an `h2`, an intro paragraph, an optional analogy card, and a `.bench` with `.stage`, `.side > .challenge` and `.side > form.controls`.
- **Engine id:** `Lab.experiment({ id, title, card, lock, setup, sandbox, challenges })`. The `id` becomes the hub skill `lab-<id>`; never rename it once published, because saved progress uses it.
- **Analogy card (optional):** a `<details class="analogy">` under the intro with a picture, a two-column mapping table, and "Holds:" and "Breaks:" lines. Add one only when an honest analogy exists; leave it out where none holds (capacitors in series have none).

## Challenges

| Part | Rule |
|---|---|
| Count | Exactly 4 per experiment. |
| Fields | `id` (stable), `short` (a phrase for the results list), `ref` (guide section, e.g. "1.8"), `prompt`, `options` (2–4 `[key, label]`), `answer`, `stage()`, optional `preview(choice)`, `reveal()` returning a promise, `why` (HTML). |
| Prompt | One concrete situation with numbers and a single question. Name what is held fixed (battery connected or disconnected, no surface charge). |
| Options | Short, mutually exclusive, each a plausible belief. "It gets larger / stays the same / gets smaller" style is fine when the direction is the question. |
| Preview | Show the guess on the stage before the reveal (a ghost marker, a dashed direction, a label on a gauge), so it stays visible next to the result. |
| Why | Two or three sentences: the rule, the numbers that come out, and the misconception it corrects. The engine appends the link to the guide section. |
| Order | Start with the most common misconception, end with one that combines ideas. |

## Stage and interaction

- **Drawing:** a canvas for fields, plots and heatmaps; an SVG overlay only for focusable handles. Redraw on change through one `requestAnimationFrame` queue, never in a loop.
- **Theme colours:** read colours from CSS tokens at draw time, using `--fau-mark` for blue (it stays readable in dark mode), `--course` for the subject colour, and `--ink`, `--muted`, `--line` and `--paper`.
- **Dragging:** the `.stage` element listens for pointer events and picks the nearest object within reach (about 30 px). The redrawn shapes never receive the pointer, so a drag survives redraws in Safari. Every draggable object also moves with the arrow keys (Shift for bigger steps) and keeps focus while it moves.
- **Readouts:** values carry units with SI prefixes through `fmt()`, in tabular figures. Where a comparison is the point, show factors against a stored state ("×2", "×½", "unchanged").
- **Hover help:** tooltips (`data-tip`) only repeat or explain what is already visible.

## Layout

- **Nothing is pinned.** No sticky stage, so nothing can cover the buttons.
- **Narrow experiments** (container under 640 px): the challenge card, the stage and the controls stack in that order. The stage scrolls into view when Reveal is pressed.
- **Wider experiments:** the card sits beside the stage and both are the same height, before and after the reveal.
  - The question block and the verdict share one grid cell; the verdict is laid out with its longest wording, so revealing never changes the height.
  - Stages have a minimum height (about 336 px, or 448 px for stages with gauges or plots) and grow to the card.
- **The compact card:** options as a list, the confidence switch and Reveal on one row. After the reveal, a "You said … (confidence). Answer …" line and the explanation replace the question block.
- **Sandbox controls** are hidden until the challenges are done, then appear under the stage in columns.

## Motion

- **The reveal** is the authored moment: it animates from the starting state to the result in 1.2–2 s with the system ease-out, and leaves the guess on screen.
- **Reduced motion:** the reveal jumps straight to the final state, with every value, trail and marker drawn, and the guess still visible.
- **Supporting motion** stays small and meaningful: charge flowing in wires while Q changes, signs building up on plates, a verdict fading in.

## Physics and tests

- **Conventions:** the notes' (U<sub>12</sub> = φ<sub>1</sub> − φ<sub>2</sub>, external work W<sub>e</sub>, σ<sub>A</sub>, ϱ<sub>V</sub>) and the guide's constants.
- **Module:** one plain module, loaded by the browser and by node (`module.exports` or a global), with no DOM.
- **What is tested:** the numbers of every challenge, and at least one worked or practice answer from the guide for each experiment. Name the test after its source ("practice 24", "lab challenge two-paths").
- **Integration:** compute line integrals and sums numerically where the point is that they agree (straight route vs detour); test the agreement.

## Links to and from the guide

- **Guide to lab:** each matching guide section ends, just before its recall check, with `<p class="lab-link">` pointing at the experiment's anchor and naming it. The PDF converter drops these links.
- **Lab to guide:** each challenge's `ref` produces a "Guide §…" link in the verdict and in the "Sure, but wrong" list.
- **Checker:** `tools/check-guide.py` warns when an experiment has no guide link.

## Acceptance

A lab is done when all of the following hold:

1. `python3 -I tools/check-guide.py <guide>.html` exits 0. It checks the lab next to the guide: shared key, engine files, experiment sections with stage, challenge and controls, `#lab-results`, the hub's `data-lab` and `data-total`, and the guide links.
2. `node --test` passes.
3. Every challenge of every experiment is played in Playwright Chromium **and WebKit**, at 1280 px and 390 px, in light and dark mode and with reduced motion. There are no console errors, the stage is on screen at every reveal, card and stage are the same height side by side with no jump at the reveal, and no page scrolls sideways.
4. Each sandbox is used: dragging with the mouse and by touch, arrow keys, and every control. Values are read only after a frame has settled.
5. The BrowserTests smoke suite passes.
6. `scripts/refresh-graph.sh --changed` from the workspace root has run.

## Updating a lab

- **New challenge:** give it a new `id`. Students who finished the experiment see it once; their lab skill stays ticked. Keep 4 per experiment by retiring one.
- **New experiment:** add its section, its contents entry, its guide link, and raise `data-lab` and `data-total` on the hub in the same change. The checker fails until they match.
- **Renamed experiment:** change titles freely; never change the experiment `id`.
