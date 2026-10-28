# Graph Report - AutonomyTechnologies  (2026-10-28)

## Corpus Check
- 21 files · ~62,718 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 4, (none) 2, .tex 1)

## Summary
- 311 nodes · 507 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c83d73c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- below
- .block
- guide.js
- Components
- check
- GitHub Pages Workflow
- Course Home and Docs
- Study guide standard
- tooltip.js
- Site Preview Artwork
- paint
- lab.js
- Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?
- Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?
- eei-ch1-physics.js
- fieldPlayground
- index.js
- Study Pages: hub, guides and lab chrome
- eei-ch1-lab.md

## God Nodes (most connected - your core abstractions)
1. `fieldPlayground()` - 28 edges
2. `capacitorBench()` - 22 edges
3. `paint()` - 21 edges
4. `Components` - 20 edges
5. `networks()` - 18 edges
6. `draw()` - 18 edges
7. `interfaceBench()` - 17 edges
8. `check()` - 15 edges
9. `css()` - 14 edges
10. `Conv` - 12 edges

## Surprising Connections (you probably didn't know these)
- `answers_of()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `Node`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `Tree`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check_lab()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py

## Import Cycles
- None detected.

## Communities (19 total, 5 thin omitted)

### Community 1 - ".block"
Cohesion: 0.10
Nodes (12): Conv, est(), find(), inline(), main(), math(), math_text(), math_wrap() (+4 more)

### Community 2 - "guide.js"
Cohesion: 0.70
Nodes (3): logToday(), render(), stamp()

### Community 3 - "Components"
Cohesion: 0.05
Nodes (39): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part chips, Dark mode (+31 more)

### Community 4 - "check"
Cohesion: 0.20
Nodes (8): all_nodes(), answers_of(), check(), check_lab(), direct(), items(), main(), Report

### Community 5 - "GitHub Pages Workflow"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 6 - "Course Home and Docs"
Cohesion: 0.20
Nodes (13): Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Active-recall study workflow, Electrical Engineering I, Electrostatic Fields interactive lab, Electrostatic Fields study guide, GitHub Pages hosting (+5 more)

### Community 7 - "Study guide standard"
Cohesion: 0.07
Nodes (24): Project data, Project instructions, Acceptance, Content rules, Files, Labs, Markup, Page structure (+16 more)

### Community 10 - "paint"
Cohesion: 0.07
Nodes (50): capacitorBench(), charged(), circuit(), draw(), grow(), guessOn(), nice(), paint() (+42 more)

### Community 11 - "lab.js"
Cohesion: 0.35
Nodes (10): complete(), Experiment(), guideLink(), h(), read(), refresh(), stamp(), tween() (+2 more)

### Community 12 - "Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?, Source Nodes

### Community 13 - "Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?, Source Nodes

### Community 14 - "eei-ch1-physics.js"
Cohesion: 0.11
Nodes (6): bench(), contributions(), field(), lineWork(), plate(), src2

### Community 15 - "fieldPlayground"
Cohesion: 0.14
Nodes (26): fieldPlayground(), arrowHead(), clamp(), cm(), draw(), equipotentials(), fieldLines(), focusAfter() (+18 more)

### Community 17 - "index.js"
Cohesion: 0.22
Nodes (3): ago(), ticksHTML(), when()

## Knowledge Gaps
- **4 isolated node(s):** `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 126 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design System: From Fundamentals to AI Apocalypse` connect `Components` to `Study guide standard`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `eei-ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.block` be split into smaller, more focused modules?**
  _Cohesion score 0.10241820768136557 - nodes in this community are weakly interconnected._
- **Why does `fieldPlayground()` connect `fieldPlayground` to `paint`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `eei-ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._