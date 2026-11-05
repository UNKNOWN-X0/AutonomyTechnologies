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
| Explore any time | Every challenge card has an **Explore freely** button that opens the sandbox straight away; **Back to challenge N** returns to the waiting challenge, and finishing all challenges still ticks the skill. (Changed 2026-11-04 at the owner’s request; the sandbox used to open only after the challenges.) |

## Files

Chapter numbers may include a lowercase letter suffix (for example, `12a` or `34a`); use that label consistently in filenames.

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
- **Engine id:** `Lab.experiment({ id, title, card, lock, setup, sandbox, challenges, generate })`. The optional `generate()` returns a fresh challenge in the same shape, with its answer computed from the chapter’s physics module; once the fixed challenges are done, the card offers **New challenge**. Generated challenges are never saved and never change the skill tick, and `tests/lab-generators.test.js` checks 300 of each for one correct option among distinct ones. The `id` becomes the hub skill `lab-<id>`; never rename it once published, because saved progress uses it.
- **Analogy card (optional):** a `<details class="analogy">` under the intro with a picture, a two-column mapping table, and "Holds:" and "Breaks:" lines. Add one only when an honest analogy exists; leave it out where none holds (capacitors in series have none).

## Challenges

| Part | Rule |
|---|---|
| Count | Exactly 4 per experiment. |
| Fields | `id` (stable), `short` (a phrase for the results list), `ref` (guide section, e.g. "1.8"), `prompt`, `options` (2–4 `[key, label]`), `answer`, `stage()`, optional `preview(choice)`, `reveal()` returning a promise, `why` (HTML). |
| Prompt | One concrete situation with numbers and a single question. Name what is held fixed (battery connected or disconnected, no surface charge). |
| Options | Short, mutually exclusive, each a plausible belief. "It gets larger / stays the same / gets smaller" style is fine when the direction is the question. Vary the correct option's position across challenges by ordering the list by hand; keep each key unchanged. |
| Setup | The experiment's `setup(c)` must call `c.stage()`; the engine does not, because each lab sets state around that call in its own order. The engine logs a console error when a challenge has no `stage()` or `setup` skips it. |
| Preview | Show the guess on the stage before the reveal (a ghost marker, a dashed direction, a label on a gauge), so it stays visible next to the result. |
| Why | Two or three sentences: the rule, the numbers that come out, and the misconception it corrects. The engine appends the link to the guide section. |
| Order | Start with the most common misconception, end with one that combines ideas. |

## Generated challenges (New challenge)

Add `generate()` wherever the question is a calculation or a classification that random values can vary; leave it out where the fixed questions are about one idea or one picture (timing limits, Gauss surfaces, numerical stability), because random versions would only repeat them. 35 of 53 experiments have one (2026-11-05).

| Part | Rule |
|---|---|
| Shape | Build the challenge with the lab's own factory (`challenge()`, `spec()`, `standard()`) so it stages, previews and reveals like a fixed one. Its `id` starts with `gen-`; count tests skip these ids. |
| Answer | Computed from the physics module (or the same rule the stage draws), never typed in. The `why` uses the generated numbers: rule, working, result. |
| Options | The right one plus up to two distinct wrong ones, shuffled (`pick`/`three`/`mix` helpers in each lab). Each wrong option is a real slip: bits read in the wrong order, averaging instead of the update rule, forgetting to normalise, the carry dropped. |
| Never two right answers | A wrong option must not also be correct. Where an answer can be written several ways (a K-map cover), take wrong options from a different function, not another form of the same one. |
| Edge cases | Re-draw values that make options collide or the question trivial: palindromic bit patterns, equal capacitors, `−0`, an exponent field of exactly 127, g² = x. |
| Stage | `stage()` sets every field the drawing reads, including the form-side values a sandbox would read, so the drawing matches the prompt. |
| Text | Plain prompts with the numbers in them; superscripts as Unicode (2⁻²³); long bit strings stay on the stage, not in the prompt. |

## Stage and interaction

- **Drawing:** a canvas for fields, plots and heatmaps; an SVG overlay only for focusable handles. Redraw on change through one `requestAnimationFrame` queue, never in a loop.
- **Theme colours:** read colours from CSS tokens at draw time, using `--fau-mark` for blue (it stays readable in dark mode), `--course` for the subject colour, and `--ink`, `--muted`, `--line` and `--paper`.
- **Dragging:** the `.stage` element listens for pointer events and picks the nearest object within reach (about 30 px). The redrawn shapes never receive the pointer, so a drag survives redraws in Safari. Every draggable object also moves with the arrow keys (Shift for bigger steps) and keeps focus while it moves.
- **Readouts:** values carry units with SI prefixes through `fmt()`, in tabular figures. Where a comparison is the point, show factors against a stored state ("×2", "×½", "unchanged").
- **Sandbox state:** `sandbox()` clears every challenge-only field, and Replay re-renders the first challenge from a clean state.
- **Your own values:** where a preset list limits what can be tried, add an "Or try your own" fieldset (`fieldset.own`) with typed inputs (`data-own`), checked as you type, with a one-line message (`[data-own-msg]`) that says what is wrong and how to fix it. Typed rules go through `js/mei/expr.js` (arithmetic, logic and set expressions, no `eval`). Results update as you type and are shown as soon as the sandbox opens; keep a button only for a step the student takes on purpose (Run one step, Add a charge, Compare from here), never for a calculation that is instant. Clickable stage cells (APDR 12a K-map and ANF) mirror a typed field, so keyboard users have the same control, and the stage gets the `clicks` class for its pointer cursor.
- **Hover help:** tooltips (`data-tip`) only repeat or explain what is already visible.

## Layout

- **Nothing is pinned.** No sticky stage, so nothing can cover the buttons.
- **Narrow experiments** (container under 640 px): the challenge card, the stage and the controls stack in that order. The stage scrolls into view when Reveal is pressed.
- **Wider experiments:** the card sits beside the stage and both are the same height, before and after the reveal.
  - The question block and the verdict share one grid cell; the verdict is laid out with its longest wording, so revealing never changes the height.
  - Stages have a minimum height (about 336 px, or 448 px for stages with gauges or plots) and grow to the card.
- **The compact card:** options as a list, the confidence switch and Reveal on one row. After the reveal, a "You said … (confidence). Answer …" line and the explanation replace the question block.
- **Sandbox controls** are hidden during a challenge and appear under the stage in columns once the challenges are done or Explore freely is pressed.
- **Control boxes:** dropdowns, text and number fields share one box (2 px ink border, 40 px tall, 15em wide at most) and sit in a label column on wide screens, so a column of controls lines up. `js/lab.js` replaces every `.controls select` with its own listbox dropdown (keyboard: arrows, Home, End, Enter, Escape, type to jump); the native select stays in the page, hidden, and keeps its `value` and `change` events, so lab code reads and sets it as before.

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
2. `node --test` passes, including `tests/lab-challenges.test.js`, which checks every lab's challenge data and reports how often the answer is the first option.
3. Every challenge of every experiment is played, then replayed once, in Playwright Chromium **and WebKit**, at 1280 px and 390 px, in light and dark mode and with reduced motion. There are no console errors, the stage is on screen at every reveal, card and stage are the same height side by side with no jump at the reveal, and no page scrolls sideways.
4. Each sandbox is used: dragging with the mouse and by touch, arrow keys, and every control. Values are read only after a frame has settled.
5. Every experiment with `generate()` is played at least three times in both engines through **New challenge** and **Another challenge**, with no console errors and a verdict each time; sample prompts and explanations are read for sense, not only checked by the test.
6. The BrowserTests smoke suite passes.
7. `scripts/refresh-graph.sh --changed` from the workspace root has run.

## Updating a lab

- **New challenge:** give it a new `id`. Students who finished the experiment see it once; their lab skill stays ticked. Keep 4 per experiment by retiring one.
- **New experiment:** add its section, its contents entry, its guide link, and raise `data-lab` and `data-total` on the hub in the same change. The checker fails until they match.
- **Renamed experiment:** change titles freely; never change the experiment `id`.
