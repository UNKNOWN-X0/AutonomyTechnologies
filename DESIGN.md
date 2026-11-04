---
name: From Fundamentals to AI Apocalypse
description: A systematic wayfinding sign system for a whole engineering degree at FAU, semester by semester, with FAU-blue sign fields, subject colour-family code squares and line-form state, lit by a forward signal line that traces the route from fundamentals to AI.
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
  signal-a: "#80ecf1"
  signal-b: "#9be34a"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(1.9rem, 1rem + 4.8vw, 4.75rem)"
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

# Design System: From Fundamentals to AI Apocalypse

## Overview

**Creative North Star: "The Semester Sign System"**

From Fundamentals to AI Apocalypse reads like an Ulm-school wayfinding system (the Aicher-era airport and Olympic signage) applied to a whole engineering degree, semester by semester. FAU blue enamel fields own the top of every page and every section opener; white and pale blue-grey paper carries the content underneath. Subjects are named by solid code squares in their own colour family, the same way a terminal names its gates, and semesters are numbered blue squares, the way it numbers its halls. The reader should always know where they are and what is due next.

The system is flat, square and typographic. There are no rounded corners and no shadows, and motion only ever explains a state change, a jump or progress. One grotesque family at heavy weights does all the signing. State is never carried by a new hue: urgency is a tonal band of the same blue (deep for overdue, tint for due, paper for fresh), and progress is carried by line form (dashed for not yet, solid for done or present). Density is calm and generous on the hub, and denser in the guides, where the formulas and problems carry the page. The system is built to grow: a new semester is one more section and one more jump tile, a follow-on course is the next step of its subject's colour family.

The world rejects the card-grid docs template and the hero-plus-cards hub. The hub is a sign field with a review board pinned across its lower edge, followed by ruled semester sections of subject rows; the guide is a single reading column with a contents rail.

**Second layer: "The Route Ahead" (owner's request, 2026-11-03).** The degree is a route from fundamentals to AI, and the site should feel like it points forward, not like an archive. The sign system stays the ground; on top of it runs one **signal line**: the cyan-to-green gradient already inside the site mark, drawn as thin lines and fills that light up as the student moves forward. It traces the route through the semesters on the hub, fills as skills are mastered, and answers the student in the labs, where values move like instrument readouts. Modern here means precise, alive and responsive to what the student does; it never means decoration, glass, glow or page-load spectacle. Reading surfaces stay calm: the signal lives at the edges (route, progress, feedback), never inside the maths.

**Key Characteristics:**
- FAU blue (#04316A) sign fields for the hub masthead, guide headers and table headers.
- Solid subject code squares in one OKLCH hue per subject (APDR violet, MEI green, EEI amber, MATLAB cyan), stepped lighter to darker for courses I, II and III, holding short codes in Hanken Grotesk 800.
- Numbered blue squares for semesters and the study loop.
- Square corners everywhere, flat surfaces, hairline and 2px ink rules instead of shadows.
- Urgency as a tonal blue band; checklist, tick-bar and course-part state as dashed versus solid line form.
- The action colour is reserved for things you can click.
- A cyan-to-green signal line for forward progress: the route through the degree, mastery, and the answer moment in labs.
- Interfaces that respond: values tween, lines draw, rows settle into place, always as the result of something the student did or reached.

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

### Signal
- **Forward Signal** (signal-a to signal-b, `linear-gradient(90deg, #80ECF1, #9BE34A)`): the colour of moving forward, taken from the site mark's outer orbit. It appears only as lines (1 to 4px), small fills (a tick segment, a route node) and the drawn edge of something just reached: the hub route line up to the furthest chapter studied, a ticked skill's square on its way to the bar, a fully mastered chapter's tick bar, the reading-progress bar, and the lab's prediction-versus-truth marker. It reads on both FAU blue and dark paper; on white paper it is always a line or fill next to ink, never behind text.

### Named Rules
**The Signal Is Forward Rule.** The signal gradient means "reached" or "moving forward", nothing else. It is not an action colour (nothing is clickable because it is signal-coloured), not schedule state (urgency stays the one-hue blue band) and not a subject colour. Never set text in it, never use it as a panel background, and keep any glow soft: the one shared `--glow` shadow (6px, or 8px in dark mode) on signal lines and marks, never a blur halo, neon text or glowing panel. (Soft glow allowed at the owner's request, 2026-11-04.)

**The Clickable Blue Rule.** The action colour (`--act`) is spent only on things you can click: buttons, the guide's home links, the answer-key toggle and focus rings. Signs, bands and markers use the field blue tokens (`--fau`, `--fau-mark`, `--band-overdue`), which share a hex with the action colour in light mode and separate from it in dark mode.

**The Subject Fill Rule.** Subject colours are fills only: code squares, part-chip markers and sign-header squares, always with dark ink text on them. Never set a subject colour as text, border or line colour.

**The One Hue Per Subject Rule.** A subject keeps its hue for the whole degree; a follow-on course takes the next lightness step of that hue, never a new hue. A new subject gets its own hue, picked to keep the 4.9:1 ink contrast and the 0.08 colour-blind separation from every existing family.

**The One Hue Urgency Rule.** Urgency is a tonal band of the same blue: deep field blue for overdue, tint for due, paper for fresh or new. Never introduce red, amber or green for schedule state; amber and green belong to subjects.

## Typography

**Display Font:** Hanken Grotesk (with system-ui, -apple-system, Segoe UI, sans-serif), loaded from Google Fonts at weights 400, 500, 600, 700 and 800.
**Body Font:** Hanken Grotesk, the same family.

**Character:** a single geometric-leaning grotesque used like sign lettering: heavy 800 for anything that names a place, 700 for things you act on, 600 for status chips, 500 for annotation, 400 for reading. Large sizes tighten their tracking; small labels stay at normal tracking and sentence case.

### Hierarchy
- **Display** (800, clamp up to 4.75rem, line-height 0.95): the hub masthead "From Fundamentals to AI Apocalypse" only.
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

State uses line form: a dashed 2px outline means not yet, a solid line or fill means done or present. This holds for checklist boxes (dashed muted outline to solid blue with a white check), course-part chips (dashed hairline outline with muted text when there is no material yet, solid ink outline and ink text once there is), and subjects with no material yet (their code square becomes a 2px dashed outline in the subject colour). Tick bars are the one exception: dashed bars read as missing glyphs at 7px wide, so not-yet is a faint solid fill (16% opacity) and done is full opacity.

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
A row of 7px by 22px bars, one per exam-checklist skill, gapped by 3px and drawn in the current text colour. A faint fill (16% opacity) is not yet; full opacity is ticked. A visible count follows the bars ("3/23" on hub chapter rows, "n / 14 skills" on review rows). When every skill is ticked, the bar takes a 2px signal-line underline: the chapter is mastered.

### Folding the rail

On screens wider than 900px a 36px arrow button at the top right of the contents rail (`js/nav.js`) folds the rail to a 36px strip holding only the arrow; the reading panel takes the width, its column stays centred, and headings refit. The choice saves as `rail-folded` and `js/settings.js` applies it in `<head>`. Phones keep the Contents bar instead.

### Site pages

`about/how-to-use.html` explains the session loop, the hub, guides, labs, ticks and settings; `about/version-log.html` lists releases newest first (version number, date, what changed). Both use the guide layout with the signal-green tile (`.s-site`) and are linked from the hub footer and the settings panel. Add a version entry whenever a release changes what students see.

### Settings
- **Where:** a 44px square gear button (drawn SVG, action colour) beside **All semesters** in the guide and lab rail, and beside the semester jump on the hub (in on-FAU white there). It opens a modal `<dialog>` with a 4px FAU-mark top rule, square corners and no shadow.
- **Inside:** three segmented controls in the action colour, the chosen half solid: **Theme** (System, Light, Dark), **Motion** (System, Reduced) and **Text size** (Default, Large). Changes apply at once; **Done**, Escape or a click on the backdrop closes it.
- **How:** `js/settings.js` loads in every page's `<head>` right after `system.css`, so a chosen theme never flashes the other first. It sets `data-theme` (the dark tokens already answer to it), `data-motion="reduced"` (stops every animation and transition, page transitions included; every script asks `siteReduceMotion()`, which counts both this and the device setting) and `data-text="large"` (root size 112.5%). Saved in `localStorage` (`site-settings`); System removes the key.

### Hub folding
- **Subjects:** each subject with chapters gets a quiet action-colour text button under its module line ("7 chapters", with a chevron) that folds its chapter list. Until any chapter is started every subject is open; after that a subject with a started chapter opens by default and the rest start folded; a subject opened or folded by hand stays that way (`localStorage` `hub-folds`). When the furthest started chapter sits in a folded subject, the route stops at that subject's tile. Opening a list uncovers it top-down (240ms; none on page load or under reduced motion).
- **Review board:** when something is due, only the due and overdue rows show, with a full-width **Show all N chapters** row under them; when nothing is due, the fresh rows show and only the new ones fold.
- Print shows every list and row.

### The route (hub)
A 2px vertical line down the left edge of the semester sections, joining every chapter's number like stops on a transit line, and ending at a dashed open node labelled "Continue on the route to automation" (wording chosen by the owner, 2026-11-03). The stretch up to the furthest chapter with any ticks is drawn in the signal gradient; the rest is a dashed hairline (line form: not yet). Chapter numbers sit on the line as stops: a filled square once started, an outlined square before. It grows by itself as semesters are added and carries no extra copy. Under 760px it stays as a 2px line at the left gutter.

### Study loop
Four numbered blue squares (3rem, 800 numerals) each followed by one sentence of method, under a ruled heading.

### Navigation (guide contents rail)
- **Site mark (the Singularity):** a square deep-blue tile (FAU blue to FAU deep) with two tilted orbits, one in a cyan-to-green gradient and one in pale blue, around a glowing white-green core; a white charge travels the outer orbit. The orbits precess (24s and 36s), the charge circles every 6s, the core pulses every 3.2s, and all motion stops under `prefers-reduced-motion`. The same tile is used on the hub masthead and in the guide rail; the favicon is a still frame. Markup and gradients are inline in each page; the motion lives in `css/system.css`.
- **Brand:** 38px square mark plus "From Fundamentals to AI Apocalypse" at 800.
- **Home links:** full-width 40px outline plates in the action colour, Sign Tint on hover.
- **Section list:** opens with a 2px ink rule, each item divided by a hairline, muted 500 text, ink on a paper fill on hover. The current section fills with FAU blue and white 700 text.
- **Reading position (js/nav.js, guides and labs):** the section being read fills with FAU blue; one 3px signal line runs unbroken down the rail's left edge from the top to the current entry (the route, in miniature). In a rail taller than the window, the current entry is kept in view by scrolling the rail itself, never the page.
- **Folding and chapters (js/nav.js):** the group headings in the rail (Sections, Practise, Experiments) are buttons that fold the entries below them. The group being read is always open, the others start closed, and one you open yourself stays open. A **Chapters** fold under the Guide/Lab switch lists every chapter of the hub, grouped by subject, with the current one in FAU blue; choosing one opens the same view (guide or lab) of that chapter. The list is read from index.html, so adding a chapter there is enough. A pager at the end of each page links to the previous and next chapter of the same subject. The Guide/Lab switch holds only those two links.
- **Mobile:** below 900px the rail becomes a wrapping top bar and the section list is hidden. Once that block has scrolled away, a 48px bar fixes to the top of the page showing a blue square, the current section's name and **Contents**; it slides in over 220ms (no movement under reduced motion). Opening it drops a full-width list of the same entries (44px rows, the current one in FAU blue) that closes on choosing an entry, on Escape or on tapping outside. Sections keep 64px of scroll margin so a jump never lands under the bar. Print hides both.

### Section opener (guide h2)
A 2px ink rule above, 18px top padding, then a 14px solid blue square before the heading in Title type.

### Formula panels and tables
- **Formula panel:** Cool Paper fill, 16px by 20px padding, no horizontal scroll: a formula too wide for the card wraps (see Formula typography), no border. The bold title sits 8px above the formulas; each relation takes its own line (line-height 1.6, no gap between lines), and the `eq-note` is set apart 12px below by a 1px `--line` hairline with 10px above its text.
- **Formula typography:** equations use a math-capable serif fallback (`Cambria Math`, `STIX Two Math`, `Times New Roman`, serif), centered on wide screens and allowed to wrap at spaces on narrow screens; key ratios use stacked fractions. Variables (`<var>`) are italic with a 0.04em trailing space so a following bracket does not collide; function names, units and numbers stay upright. Formula lines never scroll sideways: `js/hud.js` cuts each `.formula` into segments at its top-level relations (= ≤ → ⇔ and the like, never inside brackets, fractions or stacked limits) and after list commas; a segment stays whole, so a long formula breaks just before a relation sign, and the lines are balanced. Only a segment wider than the card by itself (a worded chain) wraps at its spaces. Superscripts and subscripts are 80% of the surrounding size (85% when nested), stacked limits 72%, so exponents such as f⁻¹ stay legible. The browser sets signs flush where TeX would space them, so `js/hud.js` adds the spacing on screen: a set or relation sign written without spaces (∈ ⊂ ⊆ × ∘ ∪ ∩ → = ≤ and a set-builder colon) gets 0.22em either side, a comma gets 0.22em after it, an italic letter gets 0.08em before a bracket, and an exponent sits 0.06em off its letter; indices, stacked limits and anything already spaced are left alone. Notes under formulas get only the set and relation signs spaced.
- **Big operators:** sums and products stack top limit, sign (1.3em) and bottom limit, centered; integrals set a 1.7em sign with the top limit over the bottom one on its right. Limits are 0.64em. The PDF uses `\sum`, `\prod` and `\int`, which stack in display formulas and sit beside the sign in running text.
- **Table:** full width, collapsed, 1px hairline under each row, 9px by 12px cells, tabular figures. The header row is an FAU-blue band with white 700 labels at 0.85rem.

### Motion
Motion is how the route answers the student. Each authored moment below responds to an action or to reaching something; none plays just because a page loaded, and every one respects `prefers-reduced-motion` (movement removed, colour and opacity changes kept). Ease is the system ease-out `cubic-bezier(0.16, 1, 0.3, 1)` throughout.

- **Authored moments (owner's request, 2026-11-03):**
  - **Lab reveal measures the prediction.** Challenges are multiple choice, and the verdict replaces the question block on Reveal, so the marks sit on the verdict. What you said is underlined with a 3px signal line (400ms) when right, and with a dashed ink line when wrong (500ms); a wrong pick then underlines the correct answer in signal (400ms, after the first line). The verdict badge carries the calibration as a signal line under it: full length for Correct and Sure, half for Correct and Think so or Guessing, none when wrong. A confident miss (wrong and Sure) draws the badge's dashed outline in ink. Reduced motion shows the final marks without drawing.
  - **Tick travels to progress.** Guide sign headers carry a tick bar under the review meta line (white on the blue field); lab headers carry the same bar for guide skills then lab experiments, and the checklist has one above its list and one in the review panel beneath it. Ticking a checklist skill sends a small signal-coloured square from the box to the segment it fills, on the nearest bar that is on screen (about 450ms on a curved path); the segment fills when the square lands. If no bar is on screen, or under reduced motion, the segment just fills. Unticking never animates. Reaching the last skill draws the mastered signal underline on every bar.
  - **Answer key in steps.** After the commit step, the answer lines appear one after another (200ms each, 40ms apart, capped at 8 steps), so the eye compares them with its own working in order. The list itself holds still; reduced motion keeps the plain fade; print shows every answer open at full opacity.
  - **Concept map traces dependencies.** Selecting a node (click, tap or keyboard) draws a 3px signal-gradient curve from it to each idea it directly rests on, kept inside the gap between columns (300ms stroke draw), then a 6px signal square runs along each line from the idea to the selected node (500ms), showing the direction of "builds on"; it is cancelled by a new selection or a redraw and never plays on the default selection, under reduced motion or under 760px. Ideas it rests on indirectly keep their existing highlight and get no line, and unrelated nodes dim as before. A node selected by default on load shows its lines at once without drawing. The lines are one decorative SVG layer (`aria-hidden`, no pointer events) that redraws on resize; under 760px, where the columns stack, only the highlights are used, and print hides the lines.
  - **The board settles.** When a review moves a chapter from due to fresh, its row moves to its new place in the list (FLIP, 400ms) and its gap value counts up to the new interval. The hub remembers the last order in `sessionStorage` (`board-last`), so it plays on the next visit after a review, never on a first load; reduced motion skips both.
  - **Worked examples step through.** Every worked example with two or more steps has a quiet outline button under its steps. Pressed, it shows the first step only and then **Next step (2 of 5)** brings each one in (260ms left-to-right uncovering, with a 2px signal underline that draws across and fades). After the last step the button reads **Show all again**. Hidden steps use `hidden`, so Find-in-page and screen readers see what is shown. Until the button is pressed, without script, and in print, every step is visible. Under reduced motion a step simply fades in.
  - **Symbols trace.** With a mouse (hover and a fine pointer only), hovering a variable underlines the same symbol everywhere in its section with a 2px signal line drawn left to right, staggered 30ms in reading order and capped at 12 steps. A symbol is the variable plus a subscript directly after it, so *E* and *E*₁ are different. Nothing happens when a symbol appears only once, in the concept map or in answer keys. It fades out 150ms after the pointer leaves, shows without drawing under reduced motion, and is hidden in print. It carries no information the page lacks, so it needs no keyboard equivalent.
  - **The hub sweeps once.** On the first hub visit of a browser session, a 2px signal line crosses the screen once (600ms, linear, over the content, never blocking it). The route stops of started chapters wait empty and fill (150ms) as the line reaches them, or, when they sit below the fold, the first time they scroll into view. Coming from another page waits 450ms so it never overlaps the page-transition sweep. Later visits in the same session, reduced motion and a scrolled page show the final state with no line.
  - **Perpetual signals (owner's request, 2026-11-04).** Besides the site mark's orbits, two quiet loops mark where you are and where the route goes: a 2px signal ring keeps widening and fading (2.4s) from the furthest chapter reached on the hub and from the section being read at the end of the rail's route line, and a 6px signal square keeps travelling down the unlit stretch of the hub route toward "Continue on the route to automation" (4.8s). They sit on lines, never behind text, and they stop under reduced motion (device or site setting) and in print.
  - **HUD layer (owner's request, 2026-11-04: "futuristic").** Three pieces, in `js/hud.js` (loaded by `js/settings.js`, so pages need no extra tag), `js/index.js` and the CSS:
    - **Radar:** behind the hub's sign field, inline-SVG range rings, crosshairs and a rim of bearing ticks with a sweep turning every 6s. Each started chapter is a 6px signal square: its bearing is its subject (one sector each, in hub order) and its range how far into that subject it sits; the furthest chapter in each semester is ringed. A contact flares as the sweep crosses it. It sits under the title at low contrast and is decorative (`aria-hidden`). Reduced motion stops the sweep and shows the contacts still.
    - **Decode:** the first time a heading (`h1`, `main h2`) comes into view, a 2px signal line sweeps across it (about 400 to 640ms, longer for wider headings) and every letter it has passed settles from a random glyph into the real word, on all lines at once, so a two-line heading resolves as one scan.
    - **Fitted headings:** a section heading that would fit on one line at 84% of its size or more is set just small enough to fit; a heading that is far too long keeps its size and wraps, balanced. The heading's height is held so nothing shifts, its real text is its `aria-label` meanwhile, and it starts after the page scripts have read the headings. Off under reduced motion.
    - **HUD frame:** guide and lab section headings keep their plain 2px rule (a tick ruler under it was removed on 2026-11-04: it carried no information), and while you read a section whose heading has scrolled away, a reading chip pinned under the progress bar at the column's right edge shows its number, a fill bar, the minutes left in it (200 words a minute over the words still ahead) and its place in the guide (`5 of 12`). Wide screens only; phones have the Contents bar. Formula cards carry four corner brackets; worked examples and recall checks carry the two bottom ones. The marks use `--hud-c`: FAU blue on light paper, signal cyan in dark mode. Print drops all of it.
  - **The route draws.** On the hub, the lit stretch of the route line draws down to the furthest chapter reached as it scrolls into view (scroll timeline; still and fully drawn where unsupported).
- **Signature moment:** progress draws itself. Ticked bars on the hub fill bottom-up, one after another (420ms each, 28ms stagger, capped by the 16 bars). Ticking a skill in a guide pops the box (260ms) and lights the "skills ticked" line with the subject colour (900ms fade).
- **Continuity:** opening an answer key unfolds its content with a clip and short drop (320ms; a plain fade under reduced motion). In-page jumps scroll smoothly and the target section's blue square is locked onto: four 2px signal corners wait for the scroll to arrive, close in over about 600ms with a gentle ease, hold, then fade (1.8s in all; under reduced motion they appear in place and fade). The contents rail tracks the section being read.
- **Continuity (labs):** stepping to the next challenge (Next or Replay) brings the new question in from the right: 12px and fade, 260ms, prompt then options staggered 30ms. It never plays on page load, and under reduced motion it is a 150ms fade.
- **Between pages (the sweep):** cross-document view transitions. The old page fades out in 200ms while the new one is uncovered from top to bottom (420ms, a gentler ease than the system ease, which would finish before the eye could follow) and a 2px signal line rides the uncovering edge. The line is a fixed layer parked above the viewport that only the transition ever carries into view. The contents rail and Guide/Lab switch hold their place. Reduced motion shortens every part to 120ms and draws no line; browsers without view transitions navigate normally.
- **Reading progress:** a 4px bar in the signal gradient along the top of guides and labs fills with the page scroll (scroll timeline; absent where unsupported and in print).
- **Arrival on scroll:** guide sections, lab experiments and hub subjects rise 28px and unclip as they enter the viewport; a section's sign square grows and turns into place; hub chapter rows follow from the left in order. View timelines only, so unsupported browsers and reduced motion show content still.
- **Feedback:** links thicken their underline and buttons change fill in 150ms; buttons and lab answer options press down 1px.
- **Site mark:** see Navigation.

### Widths and boxes in guides and labs
- **Two widths only.** Everything read (paragraphs, lists, formula cards, notes, worked examples, recall checks, answer keys, lab links, the source note) sits on one measure, `--measure: 46rem` (widened from 42rem on 2026-11-04 so the reading panel is used on a laptop). Section headings and their rule and ruler stop at the same measure, so every line in a section ends at one edge. Tables and the lab bench use the full column.
- **One box form.** Every panel pads its text 18px by 20px, the same above the first line as below the last,, so text in all boxes starts on the same line. Worked examples and lab challenges carry a 3px subject-colour rule on cool paper; recall checks are open with a 3px action-blue rule; notes and formula cards are plain cool-paper fields. No side stripes.
- The first section after the intro starts 34px below it on every page.

### Chapter switcher and tick groups
- **Guide | Lab switcher:** in the contents rail of every guide and lab, under "All semesters": a 2px action-blue frame split in two, the current page solid. Same height (40px) and type as the home link, so the rail reads as one set of signs. Contents lists group with small uppercase labels (Sections, Practise, Experiments).
- **Tick groups:** a chapter's tick bar shows its guide skills first and its lab experiments after a 7px gap, with a tooltip naming both counts. Guide and lab headers show the same line: "x of 16 guide skills · y of 5 lab experiments".
- **One button family:** every action is a `.btn` (outlined) or `.btn.primary` (solid), including downloads; `.btn.small` only inside lab controls.

### Tooltip
A small FAU-blue sign with white Hanken Grotesk 600 at 0.82rem, square corners, a 10px rotated-square pointer and no shadow. It sits above its target (below when there is no room), appears after 350ms of hover or at once on keyboard focus, and closes on leave, blur, scroll or Escape. Driven by `js/tooltip.js` from `data-tip` attributes; guides generate them for contents entries (full section titles), section references (now jump links) and the subject code, the hub for subject codes, course-part chips, tick bars and the semester jump list.

### Answer key
A `details` frame with a 2px action-colour border and a 48px action-colour summary line. The first press asks for a commitment: the whole closed frame fills with the action colour and the summary reads "Written your answer down? Open the answers"; the second press opens it and restores the normal label. Without JavaScript it opens on the first press. Opening it draws a hairline under the summary. In print it is always open and frameless.

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
- **Do** use motion to acknowledge an action, explain a state change, show where a jump landed or show progress along the route, with the system ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`): 100–150ms feedback, 200–320ms reveals, up to 600ms for the authored moments listed under Motion. Under `prefers-reduced-motion` remove movement but keep colour and opacity changes.
- **Do** use the signal gradient for forward progress only: the route, mastery, reading progress and the lab answer moment, as lines and small fills.
- **Do** let lab readouts behave like instruments: tabular figures, values that tween to their new state, units always shown.
- **Do** add hover tooltips with `data-tip` for short, supplementary facts (full titles, what a state means, where a link goes); never put information only in a tooltip.
- **Do** keep the legacy token names (--bg, --surface, --hl, --accent, --link, --course) in system.css, because css/guide.css reads them.
- **Do** strip fills to ink text and rules in print.

### Don't:
- **Don't** leave a measure-capped block left-aligned in a wider panel: everything capped at `--measure` is centred (`margin-left/right: auto`, or the `main > :not(.sign):not(section)` rule), so the space on each side is equal. A component rule must not reset that with a `margin: X 0` shorthand; set `margin-top` and `margin-bottom` instead. (Owner's feedback, 2026-11-04: "symmetrical of empty space is really bad".)
- **Don't** give a box more space at one end than the other: padding is equal top and bottom (and left and right), and the last child's bottom margin is 0.
- **Don't** make formula cards scroll sideways or set formulas `nowrap`; long formulas break before a relation sign (see Formula typography).
- **Don't** put injected UI inside a heading (scripts read heading text), and don't hang live information on a heading, which scrolls away as soon as reading starts; pin it instead, as the reading chip does.
- **Don't** use `box-shadow` for an accent line; use a border.
- **Don't** position an element without checking what overlaps it: `position: relative` paints it over later non-positioned siblings, so the overlapping element (the hub's review board over the sign field) needs `position: relative` and a higher `z-index`.
- **Don't** put a kicker or eyebrow label above a heading; context lines go under the heading.
- **Don't** add rounded corners or shadows.
- **Don't** signal state with a new hue: no red, amber or green for overdue, due or done.
- **Don't** use a subject colour as text, border or line colour; it is a fill behind dark ink.
- **Don't** give a follow-on course a new hue.
- **Don't** colour a non-clickable element with the action colour token.
- **Don't** add decorative motion: no parallax, hover lifts, looping effects outside the site mark and the loops listed under Motion, or page-load choreography that delays reading. Scroll-linked motion is allowed only as listed under Motion, and content must be visible without it.
- **Don't** read "modern" as glassmorphism, neon glow beyond the soft `--glow`, gradient text, blurred blobs, 3D tilt cards or a dark-by-default sci-fi skin. The future is shown by the route and the signal line, not by costume.
- **Don't** put the signal gradient behind text, on clickable controls or inside formula panels.
- **Don't** use the FAU logo; the site mark is its own square sign.
- **Don't** build a card grid or a hero-plus-cards hub.
