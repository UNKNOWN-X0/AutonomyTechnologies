# From Fundamentals to AI Apocalypse

Study guides and interactive labs for the Autonomy Technologies programme at FAU Erlangen-Nürnberg, built up semester by semester for the whole degree.

**[Open the site →](https://unknown-x0.github.io/AutonomyTechnologies/)**

![From Fundamentals to AI Apocalypse hub](assets/preview.png)

> Personal study material written from the lecture notes. Not an official FAU publication; check anything exam-relevant against your course materials.

## What's inside

The home page has one section per semester. Each subject shows its module number, its course parts and, once they exist, its chapters with a study guide and a lab.

| Semester | Code | Subject | Module | Course parts | Material |
| --- | --- | --- | --- | --- | --- |
| 1 | APDR | Algorithms, programming, and data representation | 92313 | Lecture, blackboard exercise, computer exercise | Lecture 1 welcome; Chapter 2 guide and lab; Chapters 1+2 and 3 study guides and PDFs |
| 1 | MEI | Mathematics for Engineers I | 62765 | Lecture, exercise | Chapter 1: Statements, Logic, and Sets study guide and PDF |
| 1 | EEI | Electrical Engineering I | 92315 | Lecture, exercise, tutorial | Chapter 1: Electrostatic Fields guide, PDF and LaTeX source |
| 1 | MATLAB | Introduction to MATLAB | 92317 | Course (not started yet) | none yet |

The earlier Electrical Engineering and Mathematics pages were removed on 2026-10-27. The MEI Chapter 1 guide is based on the supplied lecture notes. The current EEI Chapter 1 guide is a new summary based on the supplied WS 2026/27 lecture notes; the earlier guide and lab remain in git history.

## How to study with it

1. Read one section of a guide, then cover its formulas and write them out from memory.
2. Do the matching practice problems, then open **Show answer key** to check.
3. Try the same idea in the matching lab: change one input and predict the result before you look.
4. Tick the exam checklist as each skill sticks, or press **Log today's review** under the checklist. Ticks and review days are saved in your browser.
5. Start each session on the home page: **Review today** lists every chapter you have started, most overdue first. The gap before a chapter is due again grows with each review: 1 day, then 1 week, then 1 month.

Every page works on phone and desktop and follows your system's light or dark mode. The study guides also print cleanly (the side menu is hidden in print).

## Repository layout

```
index.html              Home page: review schedule, semesters, subjects
eei/                    Electrical Engineering I chapter materials
  ch1-electrostatic-fields.html      Chapter 1 study guide (the single source)
  ch1-electrostatic-fields.pdf/.tex  Print version, generated from the guide
  ch1-electrostatic-fields-lab.html  Chapter 1 lab: predict-then-reveal experiments
mei/                    Mathematics for Engineers I chapter materials
  ch1-statements-logic-sets.html     MEI Chapter 1 guide (the single source)
  ch1-statements-logic-sets.pdf/.tex Print version and generated LaTeX source
apdr/                   Algorithms, Programming, and Data Representation materials
  ch2-computers.html             Lecture 2 study guide (the single source)
  ch2-computers.pdf/.tex         Print version and generated LaTeX source
  ch2-computers-lab.html         Chapter 2 predict-then-reveal lab
  ch1-2-boolean-algebra.html Boolean algebra study guide for Chapters 1+2
  ch1-2-boolean-algebra.pdf/.tex Print version and generated LaTeX source
  ch3-data-representation.html Chapter 3 study guide (the single source)
  ch3-data-representation.pdf/.tex Print version and generated LaTeX source
css/
  system.css            Shared sign system: tokens, subject colours, code squares, buttons, tooltip
  index.css             Home page layout
  guide.css             Guide and lab shell: contents rail, header, boxes, answers, checklist, concept map
  lab.css               Lab: challenge card, stage, controls, analogy cards
js/
  index.js              Review today board
  guide.js              Guide: saved ticks, review log, contents highlight, section links
  concept-map.js        Guide: the clickable "How the chapter fits together" map
  lab.js                Lab engine: challenges, confidence, verdict, results, progress
  tooltip.js            Hover and focus tooltips from data-tip
  eei/ch1-physics.js    Chapter 1 formulas (no DOM; also loaded by the tests)
  eei/ch1-lab.js        Chapter 1 experiments
  apdr/ch2-physics.js   APDR Chapter 2 rules and calculations
  apdr/ch2-lab.js       APDR Chapter 2 experiments
tests/                  Physics tests: node --test
tools/
  guide-to-tex.py       Converts a guide page into its LaTeX file
  check-guide.py        Checks a guide and its lab against the standards
docs/
  GUIDE-STANDARD.md     What a finished study guide contains and how it is checked
  LAB-STANDARD.md       What a finished lab contains and how it is checked
assets/preview.png      Screenshot used in this README
```

No build step for the site. Fonts load from Google Fonts; formulas are plain HTML.

### Regenerating a guide's PDF

The HTML guide is the single source. After editing it, regenerate the LaTeX and PDF (needs TeX Live with the New Computer Modern fonts):

```sh
python3 -I tools/guide-to-tex.py eei/ch1-electrostatic-fields.html eei/ch1-electrostatic-fields.tex
cd eei && latexmk -xelatex ch1-electrostatic-fields.tex && latexmk -c ch1-electrostatic-fields.tex
```

For the MEI Chapter 1 guide, run:

```sh
python3 -I tools/guide-to-tex.py mei/ch1-statements-logic-sets.html mei/ch1-statements-logic-sets.tex
cd mei && latexmk -xelatex ch1-statements-logic-sets.tex && latexmk -c ch1-statements-logic-sets.tex
```

For the APDR Lecture 2 guide, run:

```sh
python3 -I tools/guide-to-tex.py apdr/ch2-computers.html apdr/ch2-computers.tex
cd apdr && latexmk -xelatex ch2-computers.tex && latexmk -c ch2-computers.tex
```

For the APDR Chapters 1+2 Boolean algebra guide, run:

```sh
python3 -I tools/guide-to-tex.py apdr/ch1-2-boolean-algebra.html apdr/ch1-2-boolean-algebra.tex
cd apdr && latexmk -xelatex ch1-2-boolean-algebra.tex && latexmk -c ch1-2-boolean-algebra.tex
```

For the APDR Chapter 3 number and data representation guide, run:

```sh
python3 -I tools/guide-to-tex.py apdr/ch3-data-representation.html apdr/ch3-data-representation.tex
cd apdr && latexmk -xelatex ch3-data-representation.tex && latexmk -c ch3-data-representation.tex
```

In the PDF, every answer block moves to an Answers section at the end, so the questions can be tried first.

## Design

The pages follow one sign system, modelled on German systematic signage: solid colour fields, square code signs, a strict grid. The rules live in `css/system.css`, which every page loads first. `DESIGN.md` documents the full system.

- **Main colour:** FAU blue `#04316A` for page headers, section markers, buttons and the most overdue review row. Only things you can click use the action colour.
- **Subject colours:** each subject owns one hue, and its follow-on courses use the next step of that hue, lighter to darker (I, II, III). The labels on top are always dark ink.

  | Subject | I | II | III |
  | --- | --- | --- | --- |
  | APDR (violet) | `#BCB2FF` | `#A497EA` | `#8C7ED0` |
  | MEI (green) | `#BDE892` | `#A4CD79` | `#8CB460` |
  | EEI (amber) | `#E6B55D` | `#CC9C42` | `#B28324` |
  | MATLAB (cyan) | `#80ECF1` | `#64D1D7` | `#48B7BD` |

  They were built in OKLCH: the label contrast is at least 4.9:1 on every step, and the four subjects stay apart under simulated red-green and blue-yellow colour blindness. Use a subject with the class `s-<code>-<step>`, e.g. `s-mei-2` for Mathematics for Engineers II.
- **State is shown by line form:** dashed outline means not yet (an unticked skill, a course part with no material), solid means done or available.
- **Font:** Hanken Grotesk (SIL Open Font License, via Google Fonts).
- **Site mark:** an original animated icon, the Singularity: two orbits precess around a glowing core while a charge travels the outer orbit, from fundamentals to AI. Motion stops for visitors who prefer reduced motion, and the favicon is a still version. The FAU logo is not used; it is a protected university trademark.
- **Light and dark** follow your system setting. Pages print without the colour fields.

## Adding pages

- **A new semester:** in `index.html`, copy the `<section class="semester">` block, change its id (`sem-2`) and heading, and add a matching link in the header's semester list.
- **A new subject:** copy an `<li class="subject">` block. Give it the subject's class (`s-apdr-1`, `s-mei-2`, …); a brand-new subject also needs its colour family added to `css/system.css`.
- **A course part that has material:** add the class `has` to its `<li>`, so it turns from dashed to solid.
- **A study guide:** follow [docs/GUIDE-STANDARD.md](docs/GUIDE-STANDARD.md) and copy the structure of `eei/ch1-electrostatic-fields.html`. Put it in the subject's folder as `<code>/ch<N>-<topic>.html` (e.g. `mei/ch1-sequences.html`). Load `../css/system.css`, then `../css/guide.css`, then `../js/guide.js`, and link home with `../index.html`; give the `<body>` the subject class and a storage key, e.g. `<body class="s-mei-1" data-key="mei1-ch1">`. Then add a `<li class="chapter">` to the subject's chapter list (the template is in a comment in `index.html`), with `data-key` matching the guide and `data-total` set to the number of checklist items, so the review board can read its progress. Run `python3 -I tools/check-guide.py <guide>.html` before committing.
- **A lab:** follow [docs/LAB-STANDARD.md](docs/LAB-STANDARD.md) and copy `eei/ch1-electrostatic-fields-lab.html`. The chapter's formulas go in `js/<code>/ch<N>-physics.js` with tests in `tests/`, its experiments in `js/<code>/ch<N>-lab.js`. On the hub, add a Lab button and set `data-lab` (experiments) and `data-total` (checklist + experiments).
- Commit. GitHub Pages updates the site within a minute or two.

## Hosting

The site is published by **GitHub Pages with Jekyll**, straight from the `main` branch. Every commit to `main` starts GitHub's automatic **pages-build-deployment** run (see the **Actions** tab), which builds the site and publishes it within a minute or two. Each run links to the live site.

- The pages have no Jekyll front matter, so Jekyll publishes them exactly as uploaded.
- `index.html` is the homepage. `README.md` stays on GitHub and is not used as the start page.
- `.github/workflows/jekyll-docker.yml` (**Jekyll site CI**) is a separate check: it builds the site in a Jekyll container on every push and pull request, so a broken build shows up as a failed run. It does not publish anything.

Setup (once): **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. The repository must stay public for free Pages hosting.

## Module map

- `index.html`: the hub. `<subject>/`: each subject's chapter guides (with their PDF and LaTeX) and labs.
- `js/` and `css/`: shared by every page of a kind; chapter-specific scripts live in `js/<subject>/`.
- `docs/`: the guide and lab standards. `DESIGN.md` and `PRODUCT.md` stay at the root, where the design tooling reads them.
- `tools/` and `tests/`: offline helpers and checks, not loaded by the site.
- `assets/`: images.

Upload the HTML **and** its `css/` and `js/` directories together; the HTML files are not self-contained.
