---
name: autonomy-course-site
description: Create or update course pages and learning materials for the AutonomyTechnologies website. Use Ultimate Study for study-guide pedagogy and the project's design and content standards for site work.
---

# Autonomy Course Site

Use this skill for the course website in this repository. For study-guide learning methods, apply the shared [Ultimate Study skill](../../../../../../.agents/skills/ultimate-study/SKILL.md). For visual direction on new or changed interfaces, use the available Frontend Design or Hallmark skill as appropriate.

## Before changing the site

- Read `AGENTS.md`, the relevant parts of `README.md`, `DESIGN.md`, and `PRODUCT.md`, and the guide or lab standard for the artifact being changed.
- Check Git status and inspect existing edits before touching files. Keep the existing HTML/CSS/JS architecture and preserve unrelated changes.
- Treat supplied lecture notes and course specifications as the source of truth. Keep personal study material distinct from official university content.

## APDR content rule

- APDR Lecture 1 is a welcome to the course. Keep it introductory; do not invent technical lecture content.
- Do not present that welcome as a study guide or lab. Do not add **Study guide** or **Lab** buttons or links for it.
- If the user asks to add a welcome page or a way to open it from the homepage, use a clearly named welcome/lecture link. Keep guide and lab actions reserved for actual materials of those types.
- Keep the course marked as having no guide/lab material until those materials exist. Do not create placeholder guide or lab pages to fill the space.

## Study materials

- A guide uses `docs/GUIDE-STANDARD.md`; its HTML is the source, and the PDF/LaTeX are generated artifacts when requested by the project workflow.
- A lab uses `docs/LAB-STANDARD.md` and must correspond to real guide concepts and experiments.
- Apply retrieval practice, spacing, interleaving, and calibration from Ultimate Study where they fit the source material. Do not force guide or lab mechanics into a welcome page.
- Only link an existing deliverable. When one is added, update the course listing and its labels together so the homepage describes what is actually available.

## Boundaries

- Do not invent course dates, requirements, lecture content, or grading rules.
- Do not commit, push, publish, or deploy unless the user explicitly asks.
- Run checks required by the relevant project standard when the user asks for implementation or verification; report any checks not run.
