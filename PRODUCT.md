# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** the site owner, an engineering student in the Autonomy Technologies programme at FAU Erlangen-Nürnberg, using the site for the whole degree, semester after semester.
- **Secondary:** classmates on the same courses who get the link.
- Job: understand each subject's lecture, exercise and tutorial material, practise it, and prepare for the exams, across every semester.

## Product Purpose

Personal study material written from the lecture notes. Each chapter has a condensed **study guide** (key formulas, worked methods, about 20 practice problems with an answer key, and an exam checklist) and an **interactive lab** where the student changes inputs and sees the maths or physics respond. Success means the material is understood and recalled in the exam, not just read.

## Operating Context

- Used in four settings: long revision sessions on a laptop (often a guide and lab side by side with notes), quick checks on a phone on the go, reading and annotating on a tablet, and printed guides for annotation and exam prep.
- Intended study loop (README): read a section → write the formulas from memory → do the practice problems → check the answer key → predict a result in the lab before looking → tick the exam checklist.
- Content comes from the owner's LaTeX sources (kept in the claude.ai project *Focus - Classes*), converted with pandoc, with the maths pre-rendered by KaTeX.

## Capabilities and Constraints

- Structure: **semester → subject → course parts → chapters**. Semester 1 subjects: 92313 Algorithms, programming, and data representation (APDR: lecture, blackboard exercise, computer exercise); 62765 Mathematics for Engineers I (MEI: lecture, exercise); 92315 Electrical Engineering I (EEI: lecture, exercise, tutorial); 92317 Introduction to MATLAB (course, not started yet). Later semesters add sections, and some subjects continue as II and III.
- Static HTML, CSS and JS with no build step, published by GitHub Pages (Jekyll, `main` branch, root folder). The repository must stay public.
- Pages: hub `index.html`, plus study guides and labs per subject once they exist. Their format will be redesigned with the ultimate-study skill; the current guide shell is `css/guide.css` and `js/guide.js`.
- Guides with maths pre-render it with KaTeX, so it shows without JavaScript.
- Exam-checklist ticks are saved in the browser.
- Must work on phone and desktop, follow the system's light or dark mode, and print cleanly (side menu hidden in print).
- The site is long-term: new semesters, subjects and chapters are added throughout the degree (see README "Adding pages").
- Not an official FAU publication. The FAU logo must not be used, because it is a protected trademark.

## Brand Commitments

- **FAU university blue `#04316A` is the main colour** of the site. (Confirmed 2026-10-27, steer on the first direction round.)
- **Subject colour families:** each subject owns one hue, and its follow-on courses (I, II, III) use lighter-to-darker steps of that hue: APDR violet, MEI green, EEI amber, MATLAB cyan. Values live in `css/system.css` (chosen with the Color Expert skill in OKLCH and checked for ink-label contrast and colour-blind separation). (Confirmed 2026-10-27; replaces the earlier faculty colour coding.)
- Disclaimer stays: personal material, check anything exam-relevant against the official course materials.

## Evidence on Hand

- Real content: none yet. The first EE and Maths guides and labs were deleted on 2026-10-27; new material will be designed later with the ultimate-study skill. Reusable shells remain: `css/guide.css` and `js/guide.js`. `assets/preview.png` is a screenshot of the hub.
- No testimonials, usage statistics or endorsements exist. Do not invent any.

## Product Principles

1. **Study is retrieval, not reading.** Design must make self-testing (cover, recall, check) easier than passive rereading.
2. **Content first.** Formulas, problems and labs carry the page, and chrome stays out of the way of the maths.
3. **Every context works:** desk, phone, tablet and paper are all first-class.
4. **Growable:** adding a chapter or course should be copy-a-block simple.
5. **Honest:** it is personal study material, never presented as official.

## Accessibility & Inclusion

No product-specific standard was confirmed. Keep readable contrast in both colour schemes (subject colours are fills behind dark ink labels, never text colours), and keep the pages usable with a keyboard and in print.
