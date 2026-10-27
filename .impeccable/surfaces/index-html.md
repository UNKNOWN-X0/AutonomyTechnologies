---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["css/guide.css"]
---

# Wegweiser: hub and guide shell

**Scope:** `index.html` (hub, Read mode) and the reusable guide shell `css/guide.css` + `js/guide.js` (Read mode). The first EE and Maths guides and labs were deleted on 2026-10-27; new guides and labs will be designed later with the ultimate-study skill and inherit this world.

**Audience and job:** the owner and classmates in the FAU Autonomy Technologies programme, across all semesters. They work on a laptop, phone, tablet and paper. The hub answers "what should I study now?", the guide is read in order and used to self-test, and the lab is used to predict and then check.

**Hub content:** a "Review today" board built from each guide's saved ticks (`<key>-checks`) and review days (`<key>-log`). Rows are sorted by how overdue they are against the 1-day, 1-week and 1-month gaps. Under the board come the four-step study loop and one section per semester; each subject row shows its colour-family code square, module number, course parts (dashed = no material yet, solid = has material) and, later, its chapters. The page stays honest: no fake progress, and the empty state says "not started".

## Direction contract

THESIS: The site is a systematic wayfinding sign system for the whole degree, so the reader always knows where they are and what is due next. It refuses the card-grid docs template and the hero-plus-cards hub.

OWN-WORLD: FAU blue #04316A enamel sign fields own the masthead and openers. White and #EEF2F7 paper carries content. Subject codes are solid squares in each subject's colour family (one OKLCH hue per subject, steps I to III by lightness: APDR violet, MEI green, EEI amber, MATLAB cyan) holding short codes in Hanken Grotesk 800, on a strict 8-column grid with square corners. Urgency is a tonal band of blue (deep = overdue, mid = due, paper = fresh). Checklist state is shown by line form, not hue.

STORY: Open the hub → see the most overdue chapter on the deepest blue row → open its guide → recall, check, tick → the row moves down the band.

FIRST VIEWPORT: A full-width FAU-blue field (mark, "Wegweiser" at about 76px, one-line purpose, course code signs on the right). The Review today board overlaps the field's bottom edge, with rows of gap, course code, chapter, 14 tick bars and Guide/Lab, and the primary action is the Guide button in the top row. The four-step loop sits as numbered blue sign squares below.

FORM: Ulm school systematic signage (Aicher-era airport and Olympic sign systems), candidate 6 of 7 on the re-rolled grounded list. seed:88b4c59ebceb2ca1

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

**Signature interaction:** ticking a checklist item in a guide redraws its tick bar from a gapped outline to solid, and the guide's sign-field header shows "last reviewed today". On the hub, rows re-sort by urgency band.

**Motion grammar:** none decorative. Only state changes (a tick filling, a row's band changing) use a short 150 ms ease-out. Motion is disabled under prefers-reduced-motion.

**Unresolved:** dark-mode mapping of the blue fields (inverting to deep navy ground with lighter blue fields) is decided at build time.
