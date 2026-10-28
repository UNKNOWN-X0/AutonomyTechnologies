# Graph Report - AutonomyTechnologies  (2026-10-28)

## Corpus Check
- 22 files · ~63,948 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 4, (none) 2, .tex 1)

## Summary
- 325 nodes · 526 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b6b2f09`
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
- Product
- tooltip.js
- Site Preview Artwork
- paint
- lab.js
- Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?
- Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?
- eei-ch1-physics.js
- fieldPlayground
- Lab standard
- index.js
- Study Pages: hub, guides and lab chrome
- eei-ch1-lab.md
- Study guide standard

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
10. `Lab standard` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Stage and interaction` --references--> `fmt()`  [INFERRED]
  docs/LAB-STANDARD.md → js/eei/ch1-physics.js
- `check()` --calls--> `Node`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `Tree`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check_lab()` --calls--> `Tree`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `answers_of()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 1 - ".block"
Cohesion: 0.10
Nodes (11): Conv, est(), inline(), main(), math(), math_text(), math_wrap(), Node (+3 more)

### Community 2 - "guide.js"
Cohesion: 0.70
Nodes (3): logToday(), render(), stamp()

### Community 3 - "Components"
Cohesion: 0.05
Nodes (39): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part chips, Dark mode (+31 more)

### Community 4 - "check"
Cohesion: 0.19
Nodes (9): all_nodes(), answers_of(), check(), check_lab(), direct(), items(), main(), Report (+1 more)

### Community 5 - "GitHub Pages Workflow"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 6 - "Course Home and Docs"
Cohesion: 0.14
Nodes (15): Project data, Project instructions, Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Active-recall study workflow, Electrical Engineering I, Electrostatic Fields interactive lab (+7 more)

### Community 7 - "Product"
Cohesion: 0.20
Nodes (10): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Product, Product Principles (+2 more)

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
Cohesion: 0.12
Nodes (6): bench(), contributions(), field(), lineWork(), plate(), src2

### Community 15 - "fieldPlayground"
Cohesion: 0.14
Nodes (26): fieldPlayground(), arrowHead(), clamp(), cm(), draw(), equipotentials(), fieldLines(), focusAfter() (+18 more)

### Community 16 - "Lab standard"
Cohesion: 0.14
Nodes (14): Acceptance, Challenges, Experiments, Files, Lab standard, Layout, Links to and from the guide, Motion (+6 more)

### Community 17 - "index.js"
Cohesion: 0.22
Nodes (3): ago(), ticksHTML(), when()

### Community 20 - "Study guide standard"
Cohesion: 0.17
Nodes (12): Acceptance, Content rules, Files, Labs, Markup, Page structure, PDF, Practice and testing (+4 more)

## Knowledge Gaps
- **4 isolated node(s):** `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 136 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design System: From Fundamentals to AI Apocalypse` connect `Components` to `Course Home and Docs`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.block` be split into smaller, more focused modules?**
  _Cohesion score 0.1036036036036036 - nodes in this community are weakly interconnected._
- **Why does `Lab standard` connect `Lab standard` to `Course Home and Docs`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._