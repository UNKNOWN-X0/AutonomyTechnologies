# Plan: "The Route Ahead" layer

Implementation plan for the second design layer described in [DESIGN.md](../DESIGN.md) (Overview → "Second layer: The Route Ahead", Colors → Signal, Components → The route (hub), Motion → Authored moments). Written 2026-11-03 for an implementing agent. Work through the tasks in order. Each task is independently shippable: finish it, verify it, report, and wait before starting the next one.

## Before you start

1. Read, in this order: `AGENTS.md` (project and workspace), `PRODUCT.md`, `DESIGN.md` in full, then this plan.
2. Run `/Users/thanate/.claude/skills/impeccable/scripts/impeccable context` once from this folder and follow it. Read `/Users/thanate/.claude/skills/impeccable/reference/craft-floor.md` and `reference/animate.md` before the first UI edit.
3. `git status` must be clean apart from `DESIGN.md`, `.impeccable/design.json` and this file. Those three are the approved direction. Commit them first, as their own commit, only if the user asks you to commit.
4. Do not commit, push or deploy unless the user asks.

## Rules that apply to every task

- **No build step.** Plain ES5-style JS in an IIFE, matching `js/guide.js`, `js/index.js` and `js/lab.js`: `var`, `function`, no modules, no libraries, no CDN. Comment density should match the surrounding code: one short comment per block that says why.
- **Tokens.** Add the signal colours once, in `css/system.css` `:root`, as `--signal-a: #80ecf1; --signal-b: #9be34a; --signal: linear-gradient(90deg, var(--signal-a), var(--signal-b));`. They stay the same in dark mode. Never hard-code the hex values anywhere else.
- **The Signal Is Forward Rule (DESIGN.md).** The signal appears only as lines (1–4px) and small fills. It never sits behind text, never colours a clickable control, never appears inside formula panels, and never glows: no blur and no `box-shadow` halo.
- **Motion.** Use the system ease, `var(--ease)` (`cubic-bezier(0.16, 1, 0.3, 1)`), and the durations given in DESIGN.md. Wrap all movement in `@media (prefers-reduced-motion: no-preference)` in CSS, and check `window.matchMedia("(prefers-reduced-motion: reduce)")` in JS. Under reduced motion, keep colour and opacity changes but remove movement. Nothing plays on page load.
- **Progressive enhancement.** Every page must read and work fully without JS, without `animation-timeline` support, and in print. Print hides decorative signal lines; the existing `@media print` blocks show the pattern.
- **Square corners, no shadows.** Keep the existing two widths (`--measure` versus the full column).
- **Accessibility.** Purely decorative new elements get `aria-hidden="true"`. Anything that carries information needs a text equivalent; the progress counts already exist, so reuse them. Focus order and keyboard behaviour must not change.
- **Every page at once.** Changes go in the shared CSS and JS (`css/system.css`, `css/index.css`, `css/guide.css`, `css/lab.css`, `js/*.js`). Only edit HTML pages if a task explicitly says so.
- **Guide HTML is the source for the PDFs.** If you touch guide HTML, regenerate the TeX and PDF as AGENTS.md says and make sure `python3 -I tools/check-guide.py <guide>.html` exits 0. None of the tasks below should need guide HTML changes.

## Verification for every task

Run all of these before reporting a task done:

1. Serve locally: `python3 -m http.server 8765 --bind 127.0.0.1` (background it; stop it when finished).
2. Look at the result with Playwright from `/Users/thanate/Developer/BrowserTests` (`require('/Users/thanate/Developer/BrowserTests/node_modules/playwright')`). Put scripts and screenshots in the session scratchpad, not the repo.
   - Check both **Chromium and WebKit**, because the owner browses in Safari.
   - Check at 390px and 1440px, in light and dark mode (`colorScheme`).
   - Run once with `reducedMotion: 'reduce'`.
   - Check that `document.documentElement.scrollWidth` equals the viewport width.
   - Seed progress through `localStorage` where needed. A hub chapter's keys are `<data-key>-checks` (object of ticked skill ids) and `<data-key>-log` (`{days:["YYYY-MM-DD"]}`).
3. Check text contrast with a script that walks text nodes and computes WCAG ratios against the resolved background; nothing new may be below 4.5:1. A working example is in the earlier session at `scratchpad/c.cjs`; if you don't have it, re-create it.
4. Run `/Users/thanate/.claude/skills/impeccable/scripts/impeccable detect --json index.html apdr mei eei` and make sure the task adds no new findings. The existing math-font, em-dash-placeholder and `.stage` padding findings are known false positives.
5. Run `../../scripts/test-all.sh Education/AutonomyTechnologies`. It currently exits 0 with no output, so also run the smoke spec (`npx playwright test tests/smoke.spec.js` from `../../BrowserTests`; check that folder's README for the exact command).
6. Run `../../scripts/refresh-graph.sh --changed` from the Developer root.
7. Report which files changed, what you checked, the screenshot paths, and anything you could not verify.

---

## Task 1: Signal tokens, reading progress and the mastered underline

Small and foundational. It proves the token works across every surface.

- **`css/system.css`:**
  - Add the three tokens (see Rules).
  - The reading-progress bar (`body:has(nav.toc)::after`, around line 470) changes its `background` from `var(--course, var(--act))` to `var(--signal)`.
- **`css/system.css` tick bar:** add a `.ticks.mastered` state that draws a 2px `var(--signal)` line under the segments, for example `background: var(--signal) bottom / 100% 2px no-repeat; padding-bottom: 5px;`.
  - Hide that line in print.
  - Make sure the visible count (`.ticks b`) does not sit on the line awkwardly.
- **`js/index.js`:** when `item.done === item.total && total > 0`, add the class `mastered` to every `.ticks` element for that chapter. That means both the catalogue row (set in the `chapters` map) and the board row (the `rows.innerHTML` template).
- **Acceptance:**
  - With a chapter seeded as fully ticked, both of its tick bars show the signal underline in light and dark mode.
  - The reading-progress bar shows the gradient on a guide and on a lab.
  - Nothing changes for chapters that aren't complete.

## Task 2: The hub route line

The most visible part of the layer. Spec: DESIGN.md → Components → The route (hub).

- **Structure:**
  - Chapters live in `li.subject > ol.chapters > li.chapter` (each with `span.no`) inside `section.semester > ul.subjects`. Read `index.html` and `css/index.css` (`.subject`, `.chapter` grid around lines 250–330) first.
  - Draw the route with CSS only, on `section.semester`, using pseudo-elements and backgrounds. Do not add markup per chapter.
  - Place the line so it runs through the chapter number column (`.chapter .no`). Each `.no` becomes a stop: a small square on the line, outlined by default and filled once the chapter has any ticks.
- **State from JS (`js/index.js`):**
  - Mark a started chapter with `li.chapter.started` (`done > 0` or any logged day).
  - Work out the furthest started chapter in document order, and set a custom property on its semester section: `--route-lit`, the pixel offset from the section's top to that chapter's `.no` centre. Use `getBoundingClientRect` relative to the section, and recompute it on `resize`, throttled with `requestAnimationFrame`.
  - The lit stretch (0 → `--route-lit`) is `var(--signal)`. Everything after it is a dashed hairline in `var(--line)`.
- **End of the route:**
  - After the last semester section, add one static element to `index.html`: `<p class="route-end">` with a hollow square stop and the text "Next: Semester 2, and on to AI".
  - Only add that text with the user's approval of the wording. Ask, and suggest that line.
  - It must not be a kicker (DESIGN.md No Kicker Rule): it is a stop label beside the line.
- **Phones:** under 760px, keep the line at the left gutter at 2px. Chapter rows already go to `grid-template-columns: 2.75rem 1fr` there; check that the line still passes through `.no`.
- **Motion:**
  - Inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`, the lit stretch draws downward as the semester scrolls into view: animate `transform: scaleY(0→1)` with `transform-origin: top` on the lit pseudo-element, `animation-range: entry 0% cover 40%`.
  - Without support, it is shown fully drawn.
- **Must not break:**
  - the existing `chapter-in` and `arrive` scroll animations;
  - the subject code squares;
  - print, where the route is hidden;
  - the empty MATLAB subject, which has no chapters, so the line simply passes it.
- **Acceptance:**
  - With nothing seeded, the whole route is a dashed hairline with outlined stops.
  - Seeded on APDR 12a only, the route is lit from the top to the 12a stop, and that stop is filled.
  - Seeded on EEI ch1, the route is lit through all APDR and MEI stops to EEI's.
  - Correct in Chromium and WebKit, 390 and 1440, light and dark.

## Task 3: Lab reveal measures the prediction

Spec: DESIGN.md → Motion → "Lab reveal measures the prediction".

Lab challenges are multiple choice (`c.options` is a list of `[key, label]` pairs, and `c.answer` is the right key). DESIGN.md already describes the multiple-choice version below.

- **Where:** `js/lab.js`, `Experiment.prototype.show`, inside the `go` click handler's `.then`, after `c.reveal(choice)` resolves (around lines 194–230). Shared CSS goes in `css/lab.css`.
- **Behaviour after reveal:**
  - The chosen option and the correct option are already disabled buttons in `opts`.
  - **Correct:** the chosen option gets a 3px `var(--signal)` line drawn under it from left to right (`clip-path` or `scaleX`, 400ms).
  - **Wrong:** a connector draws from the chosen option to the correct option: a 2px dashed ink line, 500ms. Use one absolutely positioned SVG overlay inside `opts`, sized from `getBoundingClientRect`, with `aria-hidden="true"`. The correct option then gets the signal underline.
  - **Confidence:** the verdict's "You said … (sure)" text stays. In addition, the `.ch-mark` badge carries the calibration as a class: `right sure` (full signal line under the badge), `right think` or `right guess` (half-length line), and `wrong sure` (dashed ink outline on the badge, which the CSS already roughly does).
- **Card height:** the card must not change height, so keep the existing `swap.style.minHeight` logic. Overlays must not affect layout.
- **Lab-specific reveals:** challenges in `js/<subject>/chN-lab.js` call `Lab.tween(...)` in their own `reveal`. Don't change any per-lab file.
- **Reduced motion:** no drawing; lines appear in their final state.
- **Acceptance:**
  - In `mei/ch3-mappings-lab.html` and `eei/ch1-electrostatic-fields-lab.html`, run one challenge correct with Sure and one wrong with Guessing. Screenshot both in Chromium and WebKit, light and dark, at 390 and 1440.
  - Replay and Next still work.
  - `node --test tests/lab-challenges.test.js` and the other tests in `tests/` still pass.

## Task 4: Tick travels to progress

Spec: DESIGN.md → Motion → "Tick travels to progress".

Guide sign headers have no tick bar today, only the text line `#review-meta` that `js/guide.js` `render()` fills. DESIGN.md now specifies one. Do this in two parts:

1. **Header tick bar.** In `js/guide.js`, insert a `span.ticks` (`aria-hidden="true"`) into `header.sign` after `#review-meta`, built the same way as `ticksHTML` in `js/index.js`. Guide skills come first, then lab experiments after the `lab-start` gap. Use `boxes`, `saved` and `document.body.dataset.lab`. `render()` re-renders it. It sits on FAU blue, so its colour is `var(--on-fau)`, and it uses the mastered underline from Task 1 when everything is ticked. Do the same on lab pages only if `js/lab.js` already has a header meta line; check first, and skip it otherwise.
2. **Travel.** On a checkbox `change` to checked, create one fixed-position 10px square at the checkbox's rect, filled with `var(--signal)` and marked `aria-hidden`. Animate it to the rect of the segment that is about to fill, using the Web Animations API (`el.animate([...], {duration: 450, easing: "cubic-bezier(0.16,1,0.3,1)"})`) on a curved path (keyframes at 0, 50% and 100%, with the 50% point raised), then remove it.
   - If the header is off-screen (`rect.bottom < 0`), skip the travel and only fill the segment.
   - Unticking never animates.
   - Under reduced motion there is no travel.
- **Acceptance:**
  - Ticking a skill mid-page, with the header visible, shows the square travelling and the segment filling.
  - Ticking with the header scrolled away just fills the segment.
  - Ticking the last skill draws the mastered underline.
  - The existing `tick-pop` and `meta-lit` effects still play.

## Task 5: Answer key in steps

Spec: DESIGN.md → Motion → "Answer key in steps". CSS only, in `css/guide.css`.

- The unfold animation lives in the `/* Motion: answers unfold … */` block, around lines 640–700.
- Add a stagger to the list items of an opened key: `details.answers[open] > ol > li { animation: answers-fade 200ms var(--ease) both; animation-delay: calc(var(--n, 0) * 40ms); }`. Set `--n` per item from `js/guide.js`: in the existing `details.answers` loop, number each `ol > li` when the key opens.
- Cap the delay at about 8 items (320ms), so long practice keys don't drag.
- Under reduced motion, keep the existing plain fade with no stagger.
- **Acceptance:**
  - The cold-start key, one recall key and the mixed-practice key all reveal in steps.
  - The commit step from the earlier work still comes first.
  - Print still shows every answer open, at full opacity.

## Task 6: Concept map traces dependencies

Spec: DESIGN.md → Motion → "Concept map traces dependencies".

**Difference from DESIGN.md.** The concept map (`js/concept-map.js`) has no lines today. Selecting a node toggles the classes `on`, `base`, `direct` and `dim` on `li.cm-node`. Read `css/guide.css` for `.cmap` first.

- On `select(id)`, draw lines from the selected node to each direct dependency (`direct`) in one SVG overlay inside `.cmap`:
  - `aria-hidden="true"`, `pointer-events: none`;
  - straight or single-elbow paths between the nodes' edge midpoints, measured with `getBoundingClientRect` relative to `.cmap`;
  - stroke `url(#signal)`, a `<linearGradient>` defined once in the overlay with `--signal-a` and `--signal-b`, read through `getComputedStyle`;
  - width 2px, drawn with `stroke-dasharray` and `stroke-dashoffset` over 300ms.
- Indirect dependencies (`base`) get no line. They keep their existing highlight.
- Redraw on resize, throttled with `requestAnimationFrame`. Clear the overlay when the selection is cleared.
- The default selection on load (`gauss` in EEI) shows its lines immediately, with no drawing animation on load.
- On phones the columns stack. Check that the lines still make sense there; if they don't, skip the lines under 760px and keep the class highlights.
- **Acceptance:**
  - EEI ch1 and MEI ch3 concept maps, keyboard (Tab plus Enter) and click.
  - Lines appear and draw, and the detail panel still updates.
  - Chromium and WebKit at 1440 and 390.

## Task 7: The board settles

Spec: DESIGN.md → Motion → "The board settles". This one is optional. Ask the user before starting it.

The hub board only re-sorts on page load, because a review is logged on the guide, not on the hub. Implement it like this:

- In `js/index.js`, store the board order and the gap labels in `sessionStorage` (`board-last`) after rendering.
- On the next render, if a chapter's state changed from `due` or `overdue` to `fresh` since the stored order, run a FLIP animation:
  - render the rows in the new order;
  - apply an inverse `transform` to each moved row from its stored position;
  - animate it to zero over 400ms;
  - count the changed row's gap value up to its new number over the same time.
- Guard every `sessionStorage` access with try/catch.
- Reduced motion: no FLIP and no count-up.
- **Acceptance:** seed a chapter as due, then log a review in its guide and go back to the hub. The row slides to its new place, and the value counts up to "in 7 d".

---

## Out of scope

Do not do any of these as part of this plan:

- changing fonts or colours other than the signal tokens;
- adding shadows, radii, glass or glow;
- adding a dark-by-default theme;
- redesigning the guide reading column;
- editing guide content;
- adding libraries.

If a task seems to need any of these, stop and ask.
