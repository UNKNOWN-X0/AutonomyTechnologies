# Study guide standard

What "done" means for a study guide on this site: one chapter of one subject, written from the lecture notes, as a web page with a generated PDF. It complements [DESIGN.md](DESIGN.md), which covers the visual system, and [PRODUCT.md](PRODUCT.md), which covers who the site is for.

**Reference guide:** [EEI Chapter 1, Electrostatic Fields](eei/ch1-electrostatic-fields.html). Copy its structure and markup, not its physics.

**Sections:** [Principles](#principles) · [Files](#files) · [Page structure](#page-structure) · [Topic sections](#topic-sections) · [Practice](#practice-and-testing) · [Content](#content-rules) · [Markup](#markup) · [PDF](#pdf) · [Labs](#labs) · [Acceptance](#acceptance) · [Updating](#updating-a-guide)

## Principles

Each rule below serves one of these study principles, taken from the ultimate-study skill (Make It Stick, A Mind for Numbers, How to Become a Straight-A Student, The Study Skills Handbook).

| Principle | What it means for a guide |
|---|---|
| Retrieve, don't reread | The guide asks questions before it explains, and every section ends with a recall check whose answers stay hidden until asked. |
| Space it out | The study plan schedules returns on day 1, day 3, about day 7, and about two weeks later. Self-check ticks only count when done on a later day. |
| Mix it up | Practice problems are shuffled across sections, so the student has to choose the method, not just apply the last one read. |
| Calibrate | Every answer names the section to revisit. The self-check ties each skill to concrete problems, so a tick has evidence behind it. |
| Chunk and solve cold | Derivations are listed for rebuilding on blank paper. Worked examples show why each step comes next, and the guide says to attempt problems before looking. |
| Desirable difficulty | Exam-style problems chain several sections under time pressure. Hints reveal one step at a time, not whole solutions. |

## Files

| Item | Rule |
|---|---|
| Location | `<subject>/ch<N>-<topic>.html`, with `<subject>` the lower-case subject code (`eei`, `mei`, `apdr`, `matlab`) and `<topic>` a short kebab-case slug. The `.pdf` and `.tex` sit beside it with the same stem. |
| Storage key | `<body data-key="<subject><course number>-ch<N>">`, for example `eei1-ch1`. Never change it once published, because saved ticks and review days live under it. |
| Subject class | `<body class="s-<subject>-<course number>">`, matching the hub entry. |
| Shared assets | Load `../css/system.css`, `../css/guide.css`, `../js/guide.js` and `../js/tooltip.js`. Add a hover tooltip to any element with a `data-tip` attribute; keep it short and supplementary, never the only place information lives. Put chapter-specific styling into `css/guide.css` only if every guide can use it; there are no per-chapter stylesheets. |
| Hub entry | One `<li class="chapter">` in the subject's list in `index.html`, with `data-key` equal to the guide's key, `data-total` equal to its number of checklist items plus the number of lab experiments, and a link to the guide (and the lab, when there is one). |
| Generated files | The `.tex` and `.pdf` are generated from the HTML by `tools/guide-to-tex.py` and LaTeX. Never edit them by hand. |
| Browser test | Add the guide to `staticPages` in the workspace's `BrowserTests/tests/smoke.spec.js`. |

## Page structure

The page contains these blocks in this order. Ids are fixed because the contents rail, the checker and the PDF converter rely on them.

| Order | Block | Id | Required content |
|---|---|---|---|
| 1 | Sign header | — | Subject code, chapter title as `h1`, course line `Subject · Module <number> · Chapter <N>`, empty review meta line. |
| 2 | Standfirst and downloads | — | One or two sentences on what the chapter builds; links to the PDF and the LaTeX source. |
| 3 | Start from memory | `cold-start` | At least 4 prompts the student answers before reading, with short answers hidden in a `details.answers`. |
| 4 | How to use this guide | `plan` | The dated study plan (day 0, 1, 3, about 7, about 14 and before the exam), each step naming the parts of this guide to use; plus the "when stuck" rule. |
| 5 | How the chapter fits together | `route` | A concept map (`div.cmap[data-cmap]`, loaded with `../js/concept-map.js`): the chapter's ideas in three columns (measured, defined, derived), each `li.cm-node` with `data-id`, `data-deps` (the ids it rests on), `data-sec`, a title with its section, a formula, and a `.cm-why` line "Rests on: …" plus the reason. Then a table matching question types to the tool that answers them. Without JavaScript and in the PDF every node shows its "Rests on" line. |
| 6 | Topic sections | `sec-<N><M>` | One per numbered section of the notes (`sec-11` for 1.1, `sec-110` for 1.10), in the notes' order. See [Topic sections](#topic-sections). |
| 7 | Formula map and units | `formula-map` | Every core relation with its SI unit, then a "Check every answer" box covering units, signs and limiting cases. |
| 8 | Derive it cold | `derivations` | The chapter's derivations as a list, each ending with a `sec-ref` to where it is worked. |
| 9 | Explain it | `explain` | At least 6 "why" questions answered aloud, with model answers hidden. |
| 10 | Mixed practice | `practice` | See [Practice and testing](#practice-and-testing). |
| 11 | Exam-style problems | `exam` | At least 2 multi-part problems, each with its own hidden worked answer. |
| 12 | Slips in the notes | `slips` | Only when verified slips exist. See [Content rules](#content-rules). |
| 13 | Self-check | `checklist` | See [Practice and testing](#practice-and-testing). |
| 14 | Source note | — | "Personal study guide based on … written in my own words; no lecture pages or figures are reproduced. Not an official FAU publication; check course details against the current notes." |

The contents rail (`nav.toc`) lists blocks 4 and 6–13 in the same order, once in the desktop list and once in the mobile `details.mobile-toc`. The two lists must be identical.

## Topic sections

Each topic section is self-contained, and its parts appear in this order:

1. **`h2` with the notes' number and title**, for example `1.9 Voltage`.
2. **Why it matters**, in one or two sentences, connecting to the previous section where possible.
3. **Formula cards** (`div.eq`) for every relation the student must know, each with a bold title, the formula and an `eq-note` giving conditions, units or sign conventions. A table of relations also counts.
4. **Explanation** in short paragraphs or lists. When the notes derive a result, show the derivation as numbered steps; it also appears in the derivation list.
5. **At least one worked example** for any section with calculations: numbered steps, numbers carried with units, and a sanity check at the end.
6. **Traps** (`p.method` starting **Trap:**, **Sign check:** or **Memory hook:**) for the mistakes students typically make in this section.
7. **Recall check** (`div.recall`) as the last block: at least 2 questions about this section only, answered from memory, with one hidden answer per question.

Long sections split into subtopics with `h3`. In the PDF each subtopic moves to the next page whole if it does not fit, so keep each subtopic shorter than a page.

## Practice and testing

| Part | Rule |
|---|---|
| Mixed practice: size | At least 20 problems, and at least one for every topic section with exercisable content. The intro states the number. |
| Mixed practice: order | Interleaved. At most two problems in a row from the same section; a new problem type never comes straight after its worked example. |
| Mixed practice: variety | Mix numeric problems, sign and direction questions, "what happens if" scaling questions, limit and consistency checks, and short conceptual questions. Avoid reusing a worked example's numbers. |
| Mixed practice: answers | One hidden answer per problem, in the same order. Each answer gives the key working (not just the number), states direction or sign where relevant, and ends with a `span.sec-ref` naming the section or sections to revisit. |
| Numbers | Use the constants stated in the practice intro. Re-derive every answer independently before publishing, and round to three significant figures unless the data justify more. |
| Explain it | Questions start with "Why" or "When" and test understanding, not recall of a formula. Model answers are two or three sentences. |
| Exam-style problems | Each chains at least two sections, has 3–5 parts that build on each other, carries a time budget (about 20 minutes), and its worked answer has one numbered step per part. |
| Self-check | One checkbox per skill (about 12–18 per chapter). Each item names the practice problems that prove the skill, as `(3, 18, 29)`, plus one item for the derivation list and one for the exam problems. `data-k` values are short, unique and never renamed. |

## Content rules

- **Source.** The current lecture notes are the authority for scope, notation, sign conventions and symbols. Write in your own words; do not copy text passages, figures or exercise sheets.
- **Going beyond the notes.** A result the notes do not state, such as the field-line refraction rule in EEI 1.11, may be added only when it follows directly from the notes' own relations. Say so in the text: "(This rule follows directly from …; the notes only mention …)".
- **Notation.** Use the notes' symbols (σ<sub>A</sub>, ϱ<sub>V</sub>, φ<sub>e</sub>, <var>U</var><sub>12</sub> = φ<sub>1</sub> − φ<sub>2</sub>). Where the notes are inconsistent, follow the definition and point to the slips list.
- **Slips list.** List only issues checked against the notes, with printed page numbers. Word uncertain ones as uncertain ("probably", "reads as … ; for the next step to follow it must be …"). Distinguish errors from notation clashes. Never list a slip found only by text extraction without checking the rendered page.
- **Honesty.** No invented statistics, exam claims or "this always comes up". The self-check is framed as chapter learning goals, not an exam specification.
- **Language.** Plain, direct English for a first-semester student. Define each symbol on first use, keep sentences short, and prefer "you" for instructions. Use British spelling consistently within a guide.

## Markup

The PDF converter understands only this markup, so use it for all maths and structure:

| Purpose | Markup |
|---|---|
| Variable | `<var>E</var>`; vectors are plain variables in this course's HTML |
| Index, power | `<sub>…</sub>`, `<sup>…</sup>` (no Unicode superscript digits) |
| Fraction | `<span class="frac"><span>numerator</span><span>denominator</span></span>` |
| Formula card | `<div class="eq"><strong>Title</strong><span class="formula">…</span><span class="eq-note">…</span></div>` |
| Worked example, recall check | `<div class="worked">` or `<div class="recall">`, first child `<p class="worked-title">` or `<p class="recall-title">` |
| Hidden answers | `<details class="answers"><summary>…</summary><ol>…</ol></details>` |
| Note, trap, hook | `<p class="method"><strong>Trap:</strong> …</p>` |
| Table | `<div class="tw"><table>…</table></div>` with a `thead` row |
| Section reference | `<span class="sec-ref">§1.4</span>` |

Use real Unicode symbols (−, ×, ·, ≈, ε, ∫, ∮, ∯) rather than ASCII stand-ins. Do not use KaTeX, MathJax, images of formulas or external scripts. Formulas must read correctly with JavaScript off and in print.

## PDF

Generate the PDF; never hand-edit it or its `.tex`:

```sh
python3 -I tools/guide-to-tex.py eei/ch1-electrostatic-fields.html eei/ch1-electrostatic-fields.tex
cd eei && latexmk -xelatex ch1-electrostatic-fields.tex && latexmk -c ch1-electrostatic-fields.tex
```

The converter guarantees:
- All hidden answers move to an Answers section at the end, grouped by origin.
- Boxes, short lists, tables and headings never split across pages.
- A section that fits on a page is never split, and longer sections break only between `h3` subtopics.

It needs TeX Live with the New Computer Modern fonts, `environ` and `tcolorbox`.

## Labs

A chapter may have a lab beside its guide: `<subject>/ch<N>-<topic>-lab.html`, built on the shared engine. The reference lab is [EEI Chapter 1](eei/ch1-electrostatic-fields-lab.html); its design brief is `.impeccable/surfaces/eei-ch1-lab.md`.

| Part | Rule |
|---|---|
| Purpose | Predict, then reveal. Every experiment opens with 4 challenges: the student picks an answer and a confidence (sure / think so / guessing), the simulation plays the true result and keeps the guess visible, and a short "why" links to the guide section. The sandbox opens only after the challenges. |
| Naming and order | Title each experiment like a guide section: its section numbers, then the topic and what it shows, e.g. "1.10 Gauss’s law: a charged cylinder". The contents rail uses the short form ("1.10 Gauss’s law"). Experiments follow the chapter order. |
| Page | Same shell as the guide: `<body class="s-<subject>-<n> lab" data-key="<guide key>" data-guide="<guide file>">`. Load `../css/lab.css`, `../js/lab.js`, the chapter's physics and experiment scripts, and `../js/tooltip.js`. One `<section class="experiment" id="exp-<name>" data-experiment="<name>">` per experiment, each with `.stage`, `.challenge` and `.controls`, and a `#lab-results` section. |
| Progress | Finishing an experiment's challenges ticks `lab-<id>` in the guide's `<key>-checks` and logs a review day, so the hub counts it. "Sure but wrong" answers are listed in the results with guide links. |
| Physics | Formulas live in a plain module (`js/<subject>-ch<N>-physics.js`) that the browser and `node --test tests/` both load. Every challenge's numbers and at least one worked answer from the guide per experiment are tested. Use the notes' conventions and the guide's constants. |
| Interaction | Charges, probes and other draggable objects are picked by distance on the stage element, never by the redrawn shapes, so a drag survives redraws in Safari. Everything draggable also moves with the arrow keys. Readouts carry units and SI prefixes. |
| Layout | Nothing is pinned. On a narrow screen the challenge card, the stage and the controls stack in that order, and the stage scrolls into view when the reveal starts; with more room the card sits beside the stage so question, buttons and reveal are visible together, and the controls run underneath in columns. The challenge card stays compact: options as a list, the confidence switch and Reveal on one row, and after the reveal a short "You said … · Answer …" line and the explanation replace the question block. Sandbox controls are hidden until the challenges are done. |
| Motion | The reveal is the authored moment: it animates from the starting state to the result, and the picture shows the mechanism, not just the numbers (field components at a boundary, charge flowing in the wires, signs building up on plates, enclosed charge). Under reduced motion it jumps straight to the result and keeps the guess marker. |
| Links | Each matching guide section ends, just before its recall check, with `<p class="lab-link">` pointing at its experiment. The PDF converter drops these links. |
| Testing | Play every challenge and use the sandbox in Playwright Chromium and WebKit, at desktop and phone width, light and dark. Read values only after a frame has settled. |

## Acceptance

A guide is done when all of the following hold:

1. `python3 -I tools/check-guide.py <guide>.html` exits 0. It checks the structure, recall and answer counts, section references, interleaving, contents links, local links, the hub's `data-total`, and whether the `.tex` is current. Review its warnings; each one either gets fixed or has a reason.
2. The `.tex` and `.pdf` are regenerated, and the LaTeX log shows no errors, `Missing character` lines or overfull boxes.
3. A contact sheet of every PDF page (Ghostscript at 40 dpi) shows no split boxes, no stranded headings, and no page holding only a line or two.
4. The page opens in Chromium at 1280 px and at 390 px wide with no console errors and no horizontal page scroll; tables scroll inside their frame. The recall, worked and answer blocks are inspected at both widths, in light and dark mode.
5. The guide (and its lab) is listed in the BrowserTests smoke suite, that suite passes, and `node --test tests/` passes.
6. Every practice answer, worked example and exam answer has been re-derived independently, and every slip claim has been checked against the rendered notes.
7. After code changes, `scripts/refresh-graph.sh --changed` from the workspace root has run.

## Updating a guide

- **Notes change** (new term, renumbered sections, corrected formulas): update the affected topic sections, practice answers and slips list, then rerun the acceptance steps. Keep every `data-k` and the storage key unchanged.
- **Adding problems:** append them to the end of the list so existing problem numbers stay valid, then update the count in the intro, the study plan and the self-check references.
- **Adding or removing a checklist item:** update `data-total` in `index.html` in the same change. The checker fails until the two match.
