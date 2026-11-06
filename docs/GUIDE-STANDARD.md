# Study guide standard

What "done" means for a study guide on this site: one chapter of one subject, written from the lecture notes, as a web page with a generated PDF. It complements [DESIGN.md](../DESIGN.md), which covers the visual system, and [PRODUCT.md](../PRODUCT.md), which covers who the site is for.

**Reference guide:** [EEI Chapter 1, Electrostatic Fields](../eei/ch1-electrostatic-fields.html). Copy its structure and markup, not its physics.

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

Chapter numbers may include a lowercase letter suffix (for example, `12a` or `34a`); use that label consistently in filenames.

| Item | Rule |
|---|---|
| Location | `<subject>/ch<N>-<topic>.html`, with `<subject>` the lower-case subject code (`eei`, `mei`, `apdr`, `matlab`) and `<topic>` a short kebab-case slug. The `.pdf` and `.tex` sit beside it with the same stem. |
| Storage key | `<body data-key="<subject><course number>-ch<N>">`, for example `eei1-ch1`. Never change it once published, because saved ticks and review days live under it. |
| Subject class | `<body class="s-<subject>-<course number>">`, matching the hub entry. |
| Shared assets | Load `../css/system.css`, `../css/guide.css`, `../js/guide.js` and `../js/tooltip.js`. Add a hover tooltip to any element with a `data-tip` attribute; keep it short and supplementary, never the only place information lives. Put chapter-specific styling into `css/guide.css` only if every guide can use it; there are no per-chapter stylesheets. |
| Hub entry | One `<li class="chapter">` in the subject's list in `index.html`, with `data-key` equal to the guide's key, `data-total` equal to its number of checklist items plus the number of lab experiments, and a link to the guide (and the lab, when there is one). |
| Generated files | The `.tex` and `.pdf` are generated from the HTML by `tools/guide-to-tex.py` and LaTeX. Never edit them by hand. The converter adds a faint diagonal "Made by Thanate Amornjiraporn (Focus)" watermark to every PDF page. |
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
| 12 | Slips in the notes | `slips` | Only when verified slips exist, headed exactly "Slips in the notes". See [Content rules](#content-rules). |
| 13 | Self-check | `checklist` | See [Practice and testing](#practice-and-testing). |
| 14 | Source note | — | "Personal study guide based on … written in my own words; no lecture pages or figures are reproduced. Not an official FAU publication; check course details against the current notes. Made by <strong>Thanate Amornjiraporn (Focus)</strong>." The lab carries the same note. |

The contents rail (`nav.toc`) lists blocks 4 and 6–13 in the same order, once in the desktop list and once in the mobile `details.mobile-toc`. The two lists must be identical.

## Topic sections

Each topic section is self-contained, and its parts appear in this order:

1. **`h2` with the notes' number and title**, for example `1.9 Voltage`.
2. **Why it matters**, in one or two sentences, connecting to the previous section where possible.
3. **In plain words** (`p.plain`, starting **In plain words:**): two to four sentences with an everyday picture of the idea, before any symbols. Name the new terms in bold here, in words only, so the formula cards that follow put symbols on ideas the student already holds. (Added 2026-11-04 after the owner found the guides hard to follow without another book.)
4. **Formula cards** (`div.eq`) for every relation the student must know, each with a bold title, the formula and an `eq-note` giving conditions, units or sign conventions. The note of every card that introduces notation starts with a **Read it as** line (`span.say`), saying the formula aloud in words: “the image of f is the set of all f(x) as x runs through X”. A table of relations also counts.
5. **Explanation** in short paragraphs or lists. Where the idea is about how elements of sets are paired (mappings, injective and surjective, inverses, composition), add arrow diagrams (`div.arrows`, one `figure.amap` per case) right after the cards: one case that has the property and one that just fails it, each with a caption naming what to look at. Give every topic that has a picture a picture diagram (`div.figs`) after its card: sets as Venn diagrams, intervals and bounds on a number line, bit patterns as labelled cells, angles on the unit circle, fields as field lines, hierarchies as a ladder. The caption names what to look at; the picture never carries a fact the text does not. When the notes derive a result, show the derivation as numbered steps; it also appears in the derivation list.
6. **At least one worked example** for any section with calculations: numbered steps, numbers carried with units, and a sanity check at the end.
7. **Traps** (`p.method` starting **Trap:**, **Sign check:** or **Memory hook:**) for the mistakes students typically make in this section, and one **Near miss:** an example that almost satisfies the definition or rule and fails, with the reason and the fix.
8. **Recall check** (`div.recall`) as the last block: at least 2 questions about this section only, answered from memory, with one hidden answer per question.

Long sections split into subtopics with `h3`. In the PDF each subtopic moves to the next page whole if it does not fit, so keep each subtopic shorter than a page.

## Practice and testing

| Part | Rule |
|---|---|
| Mixed practice: size | At least 20 problems, and at least one for every topic section with exercisable content. The intro states the number. |
| Mixed practice: order | Interleaved. At most two problems in a row from the same section; a new problem type never comes straight after its worked example. |
| Mixed practice: variety | Mix numeric problems, sign and direction questions, "what happens if" scaling questions, limit and consistency checks, and short conceptual questions. Avoid reusing a worked example's numbers. |
| Mixed practice: answers | One hidden answer per problem, in the same order. Each answer gives the key working (not just the number), states direction or sign where relevant, and ends with a `span.sec-ref` naming the section or sections to revisit. Problems themselves carry no `sec-ref`, because that would give away the method. |
| Numbers | Use the constants stated in the practice intro. Re-derive every answer independently before publishing, and round to three significant figures unless the data justify more. |
| Explain it | Questions start with "Why" or "When" and test understanding, not recall of a formula. Model answers are two or three sentences. |
| Exam-style problems | Each chains at least two sections, has 3–5 parts that build on each other, carries a time budget (about 20 minutes), and its worked answer, in a `details.answers`, has one numbered step per part and names the sections it chains in `span.sec-ref`s. |
| Self-check | One checkbox per skill (about 12–18 per chapter). Each item names the practice problems that prove the skill, as `(3, 18, 29)`, plus one item for the derivation list and one for the exam problems. `data-k` values are short, unique and never renamed. |

## Content rules

- **Source.** The current lecture notes are the authority for scope, notation, sign conventions and symbols. Write in your own words; do not copy text passages, figures or exercise sheets.
- **Going beyond the notes.** A result the notes do not state, such as the field-line refraction rule in EEI 1.11, may be added only when it follows directly from the notes' own relations. Say so in the text: "(This rule follows directly from …; the notes only mention …)".
- **Notation.** Use the notes' symbols (σ<sub>A</sub>, ϱ<sub>V</sub>, φ<sub>e</sub>, <var>U</var><sub>12</sub> = φ<sub>1</sub> − φ<sub>2</sub>). Where the notes are inconsistent, follow the definition and point to the slips list.
- **Slips list.** List only issues checked against the notes, with printed page numbers. Every place where the guide silently corrects the notes gets an entry. Word uncertain ones as uncertain ("probably", "reads as … ; for the next step to follow it must be …"). Distinguish errors from notation clashes. Never list a slip found only by text extraction without checking the rendered page.
- **Honesty.** No invented statistics, exam claims or "this always comes up". The self-check is framed as chapter learning goals, not an exam specification.
- **Language.** Plain, direct English for a first-semester student. Define each symbol on first use, keep sentences short, and prefer "you" for instructions. Use British spelling consistently within a guide.

## Markup

The PDF converter understands only this markup, so use it for all maths and structure:

| Purpose | Markup |
|---|---|
| Variable | `<var>E</var>`; vectors are plain variables in this course's HTML |
| Index, power | `<sub>…</sub>`, `<sup>…</sup>` (no Unicode superscript digits) |
| Fraction | `<span class="frac"><span>numerator</span><span>denominator</span></span>` |
| Sum, product | `<span class="op op-sum"><span class="op-sym">∑</span><sub>k=1</sub><sup>n</sup></span>` (∏ for products, ⋃ and ⋂ for indexed unions and intersections). The site stacks the top limit, sign and bottom limit; the PDF typesets `\sum`/`\prod` |
| Integral | `<span class="op op-int"><span class="op-sym">∫</span><sub>a</sub><sup>b</sup></span>` (also ∮, ∬, ∯). The limits sit on the sign's right, top over bottom; a closed-path or surface integral may carry only `<sub>` |
| Formula card | `<div class="eq"><strong>Title</strong><span class="formula">…</span><span class="eq-note">…</span></div>`, with one `span.formula` per relation |
| Worked example, recall check | `<div class="worked">` or `<div class="recall">`, first child `<p class="worked-title">` or `<p class="recall-title">` |
| Hidden answers | `<details class="answers"><summary>…</summary><ol>…</ol></details>` |
| Note, trap, hook, near miss | `<p class="method"><strong>Trap:</strong> …</p>` (also **Near miss:**) |
| In plain words | `<p class="plain"><strong>In plain words:</strong> …</p>` right after `p.why`; the PDF sets it in a ruled box |
| Read it as | `<span class="eq-note"><span class="say">Read it as: “…”.</span> rest of the note</span>` |
| Arrow diagram | `<div class="arrows"><figure class="amap" data-sets="X: 1, 2, 3 \| Y: a, b, c" data-map="1>a 2>b 3>c"><figcaption><strong>Bijective.</strong> …</figcaption></figure>…</div>`. `|` separates sets and the arrow groups between them (three sets for a composition); `data-rev` draws the arrows backwards for an inverse. `js/guide.js` draws it, `tools/guide-to-tex.py` draws the same data in TikZ; an input without exactly one arrow and an output reached twice are highlighted, an output never reached is greyed |
| Picture diagram | `<div class="figs"><figure class="viz" data-kind="…" …><figcaption><strong>Name.</strong> what to look at</figcaption></figure>…</div>`, right after the card it illustrates. Kinds: `venn` (`data-shade` = union, inter, diff, comp, a or b; `data-labels="A B X"`), `numline` (`data-range="lo hi"`, `data-ticks="0 1 2"` or `"1.57:π/2"`, `data-seg="lo hi ends"` with ends `o` open or `c` closed and `-inf`/`inf` for rays, `data-marks="v:label;…"`), `bits` (`data-cells="inside\|below\|width\|above;…"`, a leading `*` marks a cell), `circle` (`data-angle` in degrees, `data-labels="horizontal\|vertical\|radius\|angle"`), `field point+` or `field point-` (optional `data-extra` = equipot or surface), `field plates`, `field slab`, `field pair` (`data-signs="+ -"`), `field vectors`, `field dipole` (lines traced from E), `shape cylinder`, `shape hemisphere`, `shape loop`, `shape axis-pair`, `shape diamond` (exercise geometry), `plot` (`data-xr`, `data-yr`, `data-lines="x,y x,y;…"` with the first line in the action colour, `data-shade`, `data-marks`, `data-xticks`, `data-xlabel`, `data-ylabel`), `nest` (`data-rings="ℕ: 2|ℤ: −3|…"`, innermost first), `flow` (`data-steps="Title / detail|…"`), `pascal` (`data-rows`, `data-sum="r:k"`), `wave` (`data-signals="label:0011…;…"`, `data-mark` slot), `kmap` (`data-cells="0 0 1 1 / …"`, `data-groups="r0-1,c2-3;…"`, a column range may wrap), `wheel` (`data-bits`, `data-from`, `data-to`), `cells` (`data-cells="name\|address\|value;…"`, `data-arrows="p>x"`), venn shades `nor`, `nand`, `imp`, and `ladder` (`data-levels="top;…;bottom"`, `data-top`, `data-bottom`). `js/guide.js` and `tools/guide-to-tex.py` draw them from the same coordinates |
| Table | `<div class="tw"><table>…</table></div>` with a `thead` row |
| Section reference | `<span class="sec-ref">§1.4</span>` |

Write formulas so they read as maths at a glance:

- **One relation per line.** Give each relation its own `span.formula`; do not chain them with semicolons or `, &nbsp;`. A connected statement ("∮ <var>E</var> · d<var>s</var> = 0 and therefore …") stays on one line.
- **Variables in `<var>`.** Mark every variable, including single letters in sub- and superscripts (<var>a</var><sub><var>k</var></sub>) and each letter of a product (<var>x</var><var>y</var>). Function names (sin, ln, log, Im), units (C, V, m, A s), roman numerals, words, hyphenated labels ("Excess-B") and code stay upright.
- **Space the relations.** Put a space either side of =, ≠, ≈, ≤, ≥, <, >, ⇒ and ⇔ at the top level of a formula. Keep limits and indices tight: <sub>k=1</sub>.
- **Space the operators in a formula card too.** In a `span.formula`, put a space either side of top-level +, −, · and × and around an ellipsis: <var>a</var><sub><var>m</var></sub> + … + <var>a</var><sub><var>n</var></sub>, never <var>a</var><sub><var>m</var></sub>+…+<var>a</var><sub><var>n</var></sub>. Inline prose such as “1+2+…+n” may stay compact. After the edit, regenerate the `.tex` and `.pdf`.
- **Every sum and integral states its limits** unless the range is genuinely implicit (a closed path ∮). Write ∑<sub>i=0</sub><sup>k</sup> <var>d</var><sub><var>i</var></sub><var>b</var><sup><var>i</var></sup>, never a bare Σ <var>d</var><sub><var>i</var></sub><var>b</var><sup><var>i</var></sup>. Use the n-ary signs ∑ and ∏ for operators, not the Greek letters Σ and Π. Minterm notation Σm(…) is a name, not an operator, and stays as written.
- **Code is not a formula.** C or MATLAB lines in a card keep their own spelling and are never italicised or respaced.

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

A chapter may have a lab beside its guide: predict-then-reveal experiments built on the shared engine. Labs follow [LAB-STANDARD.md](LAB-STANDARD.md). Two things touch the guide itself: each matching section ends, before its recall check, with a `<p class="lab-link">` to its experiment, and the hub's `data-total` counts the lab's experiments as well as the checklist.

## Acceptance

A guide is done when all of the following hold:

1. `python3 -I tools/check-guide.py <guide>.html` exits 0. It checks the structure and block order, recall and answer counts, section references, interleaving, contents links, local links, the hub's `data-total`, and whether the `.tex` is current. Review its warnings; each one either gets fixed or has a reason.
2. The `.tex` and `.pdf` are regenerated, and the LaTeX log shows no errors, `Missing character` lines or overfull boxes.
3. A contact sheet of every PDF page (Ghostscript at 40 dpi) shows no split boxes, no stranded headings, and no page holding only a line or two.
4. The page opens in Chromium at 1280 px and at 390 px wide with no console errors and no horizontal page scroll; tables scroll inside their frame. The recall, worked and answer blocks are inspected at both widths, in light and dark mode.
5. The guide (and its lab) is listed in the BrowserTests smoke suite, that suite passes, and `node --test` passes.
6. Every practice answer, worked example and exam answer has been re-derived independently, and every slip claim has been checked against the rendered notes.
7. After code changes, `scripts/refresh-graph.sh --changed` from the workspace root has run.

## Updating a guide

- **Notes change** (new term, renumbered sections, corrected formulas): update the affected topic sections, practice answers and slips list, then rerun the acceptance steps. Keep every `data-k` and the storage key unchanged.
- **Adding problems:** append them to the end of the list so existing problem numbers stay valid, then update the count in the intro, the study plan and the self-check references.
- **Adding or removing a checklist item:** update `data-total` in `index.html` in the same change. The checker fails until the two match.
