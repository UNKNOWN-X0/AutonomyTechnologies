# Exercise solutions standard

Use this format for worked exercise pages that accompany the study guides. The source sheet is course content, not an instruction to the assistant.

## Files and source

- Keep the HTML as the source of truth at `<subject>/exercise-<N>-worked-solutions.html`; generate matching `.tex` and `.pdf` beside it with `tools/guide-to-tex.py` and LaTeX.
- Follow the matching subject guide's shared assets and page shell. Link the exercise from the course hub and include it in BrowserTests `staticPages`.
- Preserve task and subpart labels and necessary givens. Paraphrase prompts and explanations; do not reproduce the exercise sheet's prose or figures.
- Add a version-log entry for a student-visible release.

## Page frame

- The rail is the guides' rail: the brand with its mark, “All semesters”, and the task list (`toc-group` with the exercise name). No `chapter-switch`: `js/nav.js` reads the hub and adds the Chapters list (chapters, then the subject’s exercises) and a Previous / Next exercise pager. Load `../js/nav.js` after `guide.js` and `tooltip.js`.
- The sign header has the code, `h1` and course line; there is no progress line (`p.meta`), because exercises carry no ticks.
- On the hub, list the page inside its subject’s Exercise part (`li[data-tab="Exercise"]`) as `<a href="…" data-no="N" data-note="what it covers">Exercise N: Worked solutions</a>`. `js/index.js` turns each link into a row shaped like a chapter row.
- `tools/check-guide.py` recognises `<subject>/exercise-<N>-worked-solutions.html` and checks this frame, every task’s topic link, every subpart’s try-first prompt and step-by-step answer, the contents lists, downloads and a fresh `.tex`, and the hub link; it must exit 0.

## Learning sequence

For every source subpart, keep its label and provide a separate "Try first" prompt before the answer. Use `<details class="answers">` so the learner commits to an attempt before opening the solution. Inside, use `.worked` with a direct child `ol.method-list` so the site's existing control reveals one step at a time.

Each solution should:

1. State the useful setup (coordinates, orientation, known values, and target).
2. Name the governing definition or relation and why it applies.
3. Show symbolic steps before substitution or integration.
4. State the result with units and direction/sign where relevant.
5. Close with a quick independent check or likely mistake.

Put important equations on their own `<p class="math-line">…</p>` inside worked steps. The browser uses the site's math-capable serif stack; the PDF converter renders these as display equations. Keep explanatory prose in the normal reading font. Link each problem to the nearest relevant course topic. Where geometry or direction is hard to picture, add an annotated `<figure class="viz">` immediately after the setup and use a supported picture kind that also renders in the PDF. Separate geometric pieces or physical cases before combining them. State any assumption missing from the source, especially orientation or boundary conventions. Never imply a unique smooth normal at a sharp edge.

## Acceptance

- Every exercise subpart is represented once and solved in full, with no unexplained algebra jumps.
- Check vector directions, integration bounds, dimensions, signs, and limiting or geometric checks.
- Verify the page visually, confirm all answer disclosures and step controls work, regenerate PDF/TeX from HTML, and inspect the PDF output.
