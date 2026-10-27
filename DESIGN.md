---
name: Wegweiser
description: A systematic wayfinding sign system for a whole engineering degree at FAU, semester by semester, with FAU-blue sign fields, subject colour-family code squares and line-form state.
colors:
  fau-blue: "#04316a"
  fau-deep: "#021d40"
  fau-tint: "#dce5f1"
  on-fau: "#ffffff"
  on-fau-soft: "#c9d6ea"
  paper: "#ffffff"
  paper-2: "#eef2f7"
  ink: "#0b1b33"
  muted: "#45556d"
  line: "#d3dbe6"
  apdr-1: "#bcb2ff"
  apdr-2: "#a497ea"
  apdr-3: "#8c7ed0"
  mei-1: "#bde892"
  mei-2: "#a4cd79"
  mei-3: "#8cb460"
  eei-1: "#e6b55d"
  eei-2: "#cc9c42"
  eei-3: "#b28324"
  matlab-1: "#80ecf1"
  matlab-2: "#64d1d7"
  matlab-3: "#48b7bd"
  dark-fau-deep: "#021530"
  dark-fau-tint: "#15305a"
  dark-fau-mark: "#3a68ad"
  dark-band-overdue: "#2b5797"
  dark-paper: "#0c1a30"
  dark-paper-2: "#07111f"
  dark-ink: "#e6ecf5"
  dark-muted: "#a6b4c9"
  dark-line: "#233653"
  dark-action: "#a9c4ec"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.6rem, 1.6rem + 4.2vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1
  chip:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1
  code-sign:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  numeral:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
rounded:
  none: "0px"
spacing:
  xs: "10px"
  sm: "14px"
  md: "18px"
  lg: "24px"
  xl: "28px"
  section: "clamp(48px, 6vw, 80px)"
components:
  button-primary:
    backgroundColor: "{colors.fau-blue}"
    textColor: "{colors.on-fau}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.fau-deep}"
    textColor: "{colors.on-fau}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.fau-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.fau-tint}"
    textColor: "{colors.fau-blue}"
  code-sign-apdr:
    backgroundColor: "{colors.apdr-1}"
    textColor: "{colors.ink}"
    typography: "{typography.code-sign}"
    rounded: "{rounded.none}"
    height: "2.75em"
  code-sign-mei:
    backgroundColor: "{colors.mei-1}"
    textColor: "{colors.ink}"
    typography: "{typography.code-sign}"
    rounded: "{rounded.none}"
    height: "2.75em"
  code-sign-eei:
    backgroundColor: "{colors.eei-1}"
    textColor: "{colors.ink}"
    typography: "{typography.code-sign}"
    rounded: "{rounded.none}"
    height: "2.75em"
  code-sign-matlab:
    backgroundColor: "{colors.matlab-1}"
    textColor: "{colors.ink}"
    typography: "{typography.code-sign}"
    rounded: "{rounded.none}"
    height: "2.75em"
  sign-field:
    backgroundColor: "{colors.fau-blue}"
    textColor: "{colors.on-fau}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
    padding: "28px 32px 30px"
  semester-jump:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "52px"
  semester-jump-hover:
    backgroundColor: "{colors.fau-tint}"
    textColor: "{colors.ink}"
  part-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.chip}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  part-chip-has:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  review-row-overdue:
    backgroundColor: "{colors.fau-blue}"
    textColor: "{colors.on-fau}"
    padding: "16px 28px"
  review-row-due:
    backgroundColor: "{colors.fau-tint}"
    textColor: "{colors.ink}"
    padding: "16px 28px"
  review-row-fresh:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "16px 28px"
  formula-panel:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
  table-header:
    backgroundColor: "{colors.fau-blue}"
    textColor: "{colors.on-fau}"
    padding: "9px 12px"
  review-panel:
    backgroundColor: "{colors.fau-tint}"
    textColor: "{colors.ink}"
    padding: "18px 20px"
  contents-link-current:
    backgroundColor: "{colors.fau-blue}"
    textColor: "{colors.on-fau}"
    padding: "9px 10px"
---

# Design System: Wegweiser

## Overview

**Creative North Star: "The Semester Sign System"**

Wegweiser reads like an Ulm-school wayfinding system (the Aicher-era airport and Olympic signage) applied to a whole engineering degree, semester by semester. FAU blue enamel fields own the top of every page and every section opener; white and pale blue-grey paper carries the content underneath. Subjects are named by solid code squares in their own colour family, the same way a terminal names its gates, and semesters are numbered blue squares, the way it numbers its halls. The reader should always know where they are and what is due next.

The system is flat, square and typographic. There are no rounded corners, no shadows and no decorative motion. One grotesque family at heavy weights does all the signing. State is never carried by a new hue: urgency is a tonal band of the same blue (deep for overdue, tint for due, paper for fresh), and progress is carried by line form (dashed for not yet, solid for done or present). Density is calm and generous on the hub, and denser in the guides, where the formulas and problems carry the page. The system is built to grow: a new semester is one more section and one more jump tile, a follow-on course is the next step of its subject's colour family.

The world rejects the card-grid docs template and the hero-plus-cards hub. The hub is a sign field with a review board pinned across its lower edge, followed by ruled semester sections of subject rows; the guide is a single reading column with a contents rail.

**Key Characteristics:**
- FAU blue (#04316A) sign fields for the hub masthead, guide headers and table headers.
- Solid subject code squares in one OKLCH hue per subject (APDR violet, MEI green, EEI amber, MATLAB cyan), stepped lighter to darker for courses I, II and III, holding short codes in Hanken Grotesk 800.
- Numbered blue squares for semesters and the study loop.
- Square corners everywhere, flat surfaces, hairline and 2px ink rules instead of shadows.
- Urgency as a tonal blue band; checklist, tick-bar and course-part state as dashed versus solid line form.
- The action colour is reserved for things you can click.

## Colors

One institutional blue does the signing, four subject colour families do the naming, and cool blue-grey neutrals carry everything else.

### Primary
- **FAU Enamel Blue** (fau-blue): the main colour of the site. Hub masthead field, guide sign headers, table header rows, the current contents link, the overdue review band, the h2 opener squares, the numbered loop, semester and jump-tile squares, the checked checklist box, text selection and native control accents. In light mode it is also the action colour (`--act`) for buttons, the answer-key frame and focus rings.
- **Night Enamel** (fau-deep): primary button hover and the hover ground of buttons sitting on an overdue row.
- **Sign Tint** (fau-tint): the "due" review band, the review panel under the checklist, and the hover fill of outline buttons, home links and semester jump tiles.
- **White On Blue** (on-fau) and **Mist On Blue** (on-fau-soft): primary and secondary text on any blue field. Mist carries the hub purpose line, the course line and the review meta line inside sign headers.

### Secondary: subject colour families
Each subject owns one OKLCH hue. Steps I, II and III walk down in lightness (L 0.84, 0.76, 0.68), offset by ±0.04 per subject so neighbouring subjects never share a lightness: APDR and EEI sit at 0.80 / 0.72 / 0.64, MEI and MATLAB at 0.88 / 0.80 / 0.72. Chroma is 0.12 (0.10 for cyan). Step I names the first course of a subject; a follow-on course II or III takes the next step. The values were chosen with the Color Expert skill: ink labels (#0B1B33) reach at least 4.9:1 on every step, and the four subjects stay at least 0.08 apart in OKLab under simulated deutan, protan and tritan vision.
- **APDR Violet** (apdr-1, apdr-2, apdr-3; hue 290): Algorithms, programming, and data representation.
- **MEI Green** (mei-1, mei-2, mei-3; hue 130): Mathematics for Engineers.
- **EEI Amber** (eei-1, eei-2, eei-3; hue 80): Electrical Engineering.
- **MATLAB Cyan** (matlab-1, matlab-2, matlab-3; hue 200): Introduction to MATLAB.

A subject class (`s-<code>-<step>`, such as `s-mei-1`) sets `--course`; the code square, the course-part chip marker and the guide's sign-header square all fill with `var(--course)`. Code-square text is always `--code-ink` (#0B1B33), in both colour schemes.

### Neutral
- **Paper** (paper): the hub ground, the review board, the semester jump tiles and the guide's reading column.
- **Cool Paper** (paper-2): the guide page ground behind the reading column, formula panels, and the default `--course` fill before a subject class is set.
- **Signal Ink** (ink): body text, headings, the 8px rule across the top of the review board, the 2px rules under hub section headings and above guide openers, and the solid outline of a course part with material. Also the text colour inside every code square.
- **Slate Muted** (muted): secondary text, module numbers, unvisited contents links, dashed checklist boxes, empty course-part labels and the review-board rule line.
- **Hairline** (line): 1px row dividers, table rules, the outline around the board and reading column, and the dashed outline of an empty course part.

### Dark mode
Dark mode follows `prefers-color-scheme` and can be forced with `data-theme`. The masthead and sign fields keep FAU Enamel Blue (#04316A) on a near-black navy ground (dark-paper-2, dark-paper). The h2, loop, semester and jump-tile squares lift to a lighter sign blue (dark-fau-mark), the overdue band lifts to dark-band-overdue so it separates from the ground, and the action colour inverts to a pale sky blue (dark-action) with dark text. Subject colour families keep the same values in dark mode, and their labels stay dark ink.

### Named Rules
**The Clickable Blue Rule.** The action colour (`--act`) is spent only on things you can click: buttons, the guide's home links, the answer-key toggle and focus rings. Signs, bands and markers use the field blue tokens (`--fau`, `--fau-mark`, `--band-overdue`), which share a hex with the action colour in light mode and separate from it in dark mode.

**The Subject Fill Rule.** Subject colours are fills only: code squares, part-chip markers and sign-header squares, always with dark ink text on them. Never set a subject colour as text, border or line colour.

**The One Hue Per Subject Rule.** A subject keeps its hue for the whole degree; a follow-on course takes the next lightness step of that hue, never a new hue. A new subject gets its own hue, picked to keep the 4.9:1 ink contrast and the 0.08 colour-blind separation from every existing family.

**The One Hue Urgency Rule.** Urgency is a tonal band of the same blue: deep field blue for overdue, tint for due, paper for fresh or new. Never introduce red, amber or green for schedule state; amber and green belong to subjects.

## Typography

**Display Font:** Hanken Grotesk (with system-ui, -apple-system, Segoe UI, sans-serif), loaded from Google Fonts at weights 400, 500, 600, 700 and 800.
**Body Font:** Hanken Grotesk, the same family.

**Character:** a single geometric-leaning grotesque used like sign lettering: heavy 800 for anything that names a place, 700 for things you act on, 600 for status chips, 500 for annotation, 400 for reading. Large sizes tighten their tracking; small labels stay at normal tracking and sentence case.

### Hierarchy
- **Display** (800, clamp up to 4.75rem, line-height 0.95): the hub masthead "Wegweiser" only.
- **Headline** (800, clamp(1.9rem … 3rem), line-height 1.05): the chapter title inside guide sign headers. Balanced wrapping.
- **Title** (800, 1.65rem, line-height 1.2): guide section openers (h2). The hub uses the same weight at 1.6rem for "Review today" and 1.35rem for the loop and semester headings.
- **Subtitle** (700, 1.2rem, line-height 1.25 to 1.3): h3 in guides; subject names on the hub and chapter names on review rows at 1.25rem; hub chapter names at 1.1rem.
- **Body** (400, 1.0625rem, line-height 1.65 in guides, 1.55 on the hub): reading text. Paragraphs and lists in guides are capped at 68ch; hub chapter descriptions at 60ch, the footer at 70ch.
- **Label** (700, 0.95rem, line-height 1): buttons, home links, the answer-key summary, the sign header course line. Semester jump labels use 700 at 1rem. Contents rail links use 500 at 0.95rem.
- **Chip** (600, 0.9rem, line-height 1): course-part chips.
- **Code sign** (800, 0.95rem, tracking 0.01em): the short subject codes inside code squares ("APDR", "MEI", "EEI", "MATLAB"); 1.1rem in hub subject rows, 1.15rem inside sign headers.
- **Numeral** (800, 1.85rem, tabular): the gap value on review rows ("due", "in 30 d", "3 d"). Semester and loop numbers are 800 at 1.2 to 1.3rem. Tabular figures are used wherever numbers stack: gap values, tick counts, module numbers, chapter numbers and table cells.

### Named Rules
**The No Kicker Rule.** Nothing sits above a heading as a small label. Context lines (course, module number, part, notes reference) go under the heading they belong to, at Label, 600 or regular weight in a muted or Mist colour, sentence case and normal tracking. The guide sign header puts the h1 first, then the course line, then the meta line.

**The Weight Signs Rule.** Weight, not size, separates sign from text: 800 names, 700 acts, 600 marks status, 500 annotates, 400 reads.

## Layout

The hub sits on a 1280px container with fluid side padding (16px to 56px). The masthead is a three-column grid: mark, title block, and on the right a semester jump list, one 52px tile per semester (a blue number square plus a paper label). The Review today board pulls up over the field's lower edge with a negative top margin (about -64px to -88px), so the board reads as a sign plate bolted to the field. Below it come the study loop and then one section per semester, all separated by a large fluid gap (spacing.section).

Review rows are a five-column grid (gap value, code square, chapter, tick bar with count, Guide and Lab buttons) with 24px gaps and 16px by 28px padding. Subject rows are a three-column grid (a 7rem code square, the name block, the course-part chips aligned right) with 16px by 28px gaps and 22px vertical padding, divided by hairlines; a subject's chapter list spans the name and parts columns underneath and is hidden while empty. Chapter rows are a four-column grid (number, title, tick bar, buttons). At 1080px the tick count drops under the chapter name and the loop becomes two columns; at 760px the semester list wraps under the title, review rows stack into gap value and code on one line then chapter, count and full-width buttons, subject rows shrink their square to 5.5rem and drop the chips onto their own left-aligned line, and the loop becomes one column.

The guide shell uses a 1240px grid with a 250px sticky contents rail and a fluid reading column (gap 24px to 48px). The reading column sits on paper, outlined by a hairline, with its content inset 18px to 56px. At 900px the rail collapses into a top bar holding the brand and home links, and the section list is hidden.

Spacing steps recur at 10, 14, 18, 24 and 28px, with larger fluid steps between sections. In print, sign fields and bands drop their fills to ink text with a 3px ink rule, the contents rail and the review buttons disappear, and the answer key prints open.

## Elevation & Depth

The system is flat. There is no box-shadow anywhere in the shared stylesheets. Depth comes from tone and rule weight: blue fields sit above paper, paper sits on cool paper, and hierarchy is drawn with an 8px ink bar on the review board, 2px ink rules under hub section headings and over guide openers and the contents list, and 1px hairlines between rows. The only overlap is structural: the review board crossing the masthead's lower edge.

### Named Rules
**The Rule Not Shadow Rule.** When something needs to stand forward, give it a heavier ink rule or a blue field, never a shadow.

## Shapes

Every corner is square (0px): buttons, code squares, semester squares, part chips, sign fields, panels and checklist boxes, and even the rect of the site mark. The recurring silhouette is the solid square: the subject code square, the 10px subject marker inside each part chip, the 14px blue square that precedes every guide h2, the 2.5rem semester number square and the 3rem numbered loop squares. Borders are 2px for interactive and status outlines (buttons, home links, answer key, checklist boxes, part chips) and 1px for structure.

State uses line form: a dashed 2px outline means not yet, a solid line or fill means done or present. This holds for checklist boxes (dashed muted outline to solid blue with a white check), tick bars (7px by 22px dashed bars at 55% opacity to solid bars at full opacity) and course-part chips (dashed hairline outline with muted text when there is no material yet, solid ink outline and ink text once there is).

### Named Rules
**The Square Corner Rule.** Radius is always 0.

**The Line Form Rule.** Progress and presence are shown by dashed versus solid, never by a change of hue alone.

## Components

### Buttons
Tactile sign plates: square, bold, 44px tall.
- **Shape:** square corners (0px), 2px solid border in the action colour, minimum height 44px, 18px side padding, label type.
- **Primary:** action-colour fill with white text (dark mode: pale sky fill with near-black text). Used for the one most useful next step, such as Guide on a review row or "Log today's review".
- **Hover / Focus:** primary darkens to Night Enamel; outline buttons fill with Sign Tint. Colour transitions take 150ms with the system ease-out. Focus shows a 3px action-colour outline offset by 2px.
- **Secondary (outline):** transparent fill, action-colour text and border. Used for Lab beside Guide.
- **On an overdue band:** outline buttons switch to white text and border, and the primary inverts to a white plate with blue text.
- **Disabled:** 45% opacity, not-allowed cursor. The review button disables itself and reads "Reviewed today" once today is logged.

### Course code square
The system's signature naming device. A solid square (min 2.75em) filled with `var(--course)` and holding the short subject code in Code sign type and ink colour. The colour comes from a subject class on the square, on its row, or on the guide's `<body>`. It appears at 7rem by 4.25rem in hub subject rows (5.5rem by 3.5rem on phones), in review rows, and at 64px (48px on phones) in guide sign headers.

### Sign field header
The FAU-blue header of every guide: the code square spanning two rows on the left, then the chapter title in Headline type, then the course line in Mist, then the review meta line in Mist ("9 of 14 exam skills ticked · last reviewed 15 days ago · 2 reviews"), which the guide script fills and hides when empty. Padding 28px by 32px (22px by 18px under 560px).

### Semester jump list
The masthead's right-hand column: one link per semester, each a 52px paper tile with ink 700 text, led by a 52px FAU-blue number square (white 800 numeral, 2px paper inner outline). Hover fills the tile with Sign Tint. Under 760px the list moves under the title and spans the field.

### Semester section
A ruled heading (1.35rem 800 with a 2px ink rule beneath) led by a 2.5rem blue number square, then a list of subject rows.

### Subject row
One row per subject: the code square in the subject's colour family, then the name (h3, 700 1.25rem) with the module number under it in muted tabular type ("Module 62765 · no material yet"), then the course-part chips. A subject's chapter list follows under the row and is hidden while empty; each chapter row carries its number, title, one-line description, tick bar and Guide and Lab buttons.

### Course-part chips
A wrapping row of 36px square chips, one per course part (lecture, exercise, tutorial). Each opens with a 10px square in the subject colour, then the part name in Chip type. No material yet: 2px dashed hairline outline with muted text. Has material: 2px solid ink outline with ink text.

### Review board
A paper plate under an 8px ink bar, overlapping the masthead. Its head pairs "Review today" with the gap rule ("Gaps grow with each review: 1 day, then 1 week, then 1 month."). Rows are sorted by state (overdue, due, not started, fresh) and then by how far past their gap they are. A chapter's gap widens with each logged review day: 1 day after the first, 7 after the second, 30 after the third and beyond. A row is overdue once the time since its last review reaches twice its gap, due at one gap, fresh before that; ticks without any logged review count as due. Before any study, the board shows a single empty-state paragraph instead of rows. Rows change band with a 150ms background transition.

### Tick bar
A row of 7px by 22px bars, one per exam-checklist skill, gapped by 3px and drawn in the current text colour. Dashed outline at 55% opacity is not yet; solid fill is ticked. Shown on review rows next to an "n / 14 skills" count, and on hub chapter rows.

### Study loop
Four numbered blue squares (3rem, 800 numerals) each followed by one sentence of method, under a ruled heading.

### Navigation (guide contents rail)
- **Brand:** 38px square mark plus "Wegweiser" at 800.
- **Home links:** full-width 40px outline plates in the action colour, Sign Tint on hover.
- **Section list:** opens with a 2px ink rule, each item divided by a hairline, muted 500 text, ink on a paper fill on hover. The current section fills with FAU blue and white 700 text.
- **Mobile:** below 900px the rail becomes a wrapping top bar and the section list is hidden.

### Section opener (guide h2)
A 2px ink rule above, 18px top padding, then a 14px solid blue square before the heading in Title type.

### Formula panels and tables
- **Formula panel:** Cool Paper fill, 16px by 20px padding, horizontal scroll for wide KaTeX, no border.
- **Table:** full width, collapsed, 1px hairline under each row, 9px by 12px cells, tabular figures. The header row is an FAU-blue band with white 700 labels at 0.85rem.

### Answer key
A `details` frame with a 2px action-colour border and a 48px action-colour summary line. Opening it draws a hairline under the summary. In print it is always open and frameless.

### Exam checklist
Each item is a full-width label row divided by hairlines. The box is a 22px square: 2px dashed muted outline when not yet, solid FAU-blue fill with a white check when done (150ms transition). A ticked item's text turns muted. Ticks save in the browser under the guide's `data-key` and log today as a review day. Under the list, the review panel (Sign Tint, 18px by 20px, max 68ch) repeats the review meta line beside the primary "Log today's review" button.

## Do's and Don'ts

### Do:
- **Do** use FAU blue (#04316A) as the main colour, in full-width sign fields for mastheads and headers.
- **Do** name a subject with its solid code square in its colour family (`s-<code>-<step>`), ink text, 800 weight.
- **Do** give a follow-on course (II, III) the next lightness step of its subject's hue.
- **Do** check any new subject hue for at least 4.9:1 ink-label contrast on all three steps and at least 0.08 OKLab separation from every other subject under deutan, protan and tritan simulation.
- **Do** keep every corner square (0px radius).
- **Do** show not-yet as a dashed outline and done or present as a solid line or fill.
- **Do** spend the action colour only on clickable things: buttons, home links, the answer-key toggle and focus rings.
- **Do** put the guide's subject class and `data-key` on its `<body>`.
- **Do** keep motion to 150ms state changes with the system ease-out, and turn it off under prefers-reduced-motion.
- **Do** keep the legacy token names (--bg, --surface, --hl, --accent, --link, --course) in system.css, because css/guide.css reads them.
- **Do** strip fills to ink text and rules in print.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading; context lines go under the heading.
- **Don't** add rounded corners or shadows.
- **Don't** signal state with a new hue: no red, amber or green for overdue, due or done.
- **Don't** use a subject colour as text, border or line colour; it is a fill behind dark ink.
- **Don't** give a follow-on course a new hue.
- **Don't** colour a non-clickable element with the action colour token.
- **Don't** add decorative motion.
- **Don't** use the FAU logo; the site mark is its own square sign.
- **Don't** build a card grid or a hero-plus-cards hub.
