# Graph Report - AutonomyTechnologies  (2026-10-29)

## Corpus Check
- 29 files · ~108,136 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .tex 5, .css 4, (none) 2)

## Summary
- 405 nodes · 660 edges · 25 communities (20 shown, 5 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4a5ecf8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- capacitorBench() / paint()
- Components / Design System: From Fundamentals to AI Apocalypse
- guide-to-tex.py / Conv
- Study guide standard
- capacitorBench
- eei/ch1-physics.js / eei-ch1-physics.test.js
- check() / check-guide.py
- mei/ch1-lab.js
- steps / jekyll-docker.yml
- lab.js / .show()
- ch2-lab.js
- Computers, Algorithms, and Boolean Logic · APDR Chapter 2
- Boolean laws / Boolean expressions
- index.js / ago()
- eei-ch1-physics.test.js
- Autonomy Course Site / SKILL.md
- Q: How are the static study pages hosted, and what GitHub Pages and Jeky
- Q: Does the graph cover the learner journey from the course home through
- guide.js / logToday()
- tooltip.js / place()
- From Fundamentals to AI Apocalypse: hub and guide shell / index-html.md
- below() / concept-map.js
- eei-ch1-lab.md / EEI Chapter 1 lab: Electrostatic Fields
- Study Pages preview showing Electrical Engineering 1 and Mathematics for
- Study Pages project guide

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
- `Challenges` --references--> `stage()`  [INFERRED]
  docs/LAB-STANDARD.md → js/mei/ch1-lab.js
- `Stage and interaction` --references--> `fmt()`  [INFERRED]
  docs/LAB-STANDARD.md → js/eei/ch1-physics.js
- `check()` --calls--> `Node`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `Tree`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check_lab()` --calls--> `Tree`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py

## Import Cycles
- None detected.

## Communities (25 total, 5 thin omitted)

### Community 0 - "capacitorBench() / paint()"
Cohesion: 0.08
Nodes (49): fieldPlayground(), arrowHead(), clamp(), cm(), draw(), endDrag(), equipotentials(), fieldLines() (+41 more)

### Community 1 - "Components / Design System: From Fundamentals to AI Apocalypse"
Cohesion: 0.05
Nodes (39): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part chips, Dark mode (+31 more)

### Community 2 - "guide-to-tex.py / Conv"
Cohesion: 0.10
Nodes (11): Conv, est(), inline(), main(), math(), math_text(), math_wrap(), Node (+3 more)

### Community 3 - "Study guide standard"
Cohesion: 0.17
Nodes (12): Acceptance, Content rules, Files, Labs, Markup, Page structure, PDF, Practice and testing (+4 more)

### Community 4 - "capacitorBench"
Cohesion: 0.12
Nodes (27): capacitorBench(), charged(), circuit(), draw(), grow(), guessOn(), nice(), paint() (+19 more)

### Community 5 - "eei/ch1-physics.js / eei-ch1-physics.test.js"
Cohesion: 0.09
Nodes (19): Acceptance, Challenges, Experiments, Files, Lab standard, Layout, Links to and from the guide, Motion (+11 more)

### Community 6 - "check() / check-guide.py"
Cohesion: 0.19
Nodes (9): all_nodes(), answers_of(), check(), check_lab(), direct(), items(), main(), Report (+1 more)

### Community 7 - "mei/ch1-lab.js"
Cohesion: 0.20
Nodes (11): bindStagePointer(), choose(), coords(), drawSlider(), initial(), register(), update(), stage() (+3 more)

### Community 8 - "steps / jekyll-docker.yml"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 9 - "lab.js / .show()"
Cohesion: 0.35
Nodes (10): complete(), Experiment(), guideLink(), h(), read(), refresh(), stamp(), tween() (+2 more)

### Community 10 - "ch2-lab.js"
Cohesion: 0.20
Nodes (25): bits(), box(), colours(), drawAlgorithm(), drawEquivalent(), drawLogic(), drawNand(), drawTiming() (+17 more)

### Community 11 - "Computers, Algorithms, and Boolean Logic · APDR Chapter 2"
Cohesion: 0.67
Nodes (3): APDR lecture slides: Algorithms, programming and data representation; Boolean algebra and logic, Bernhard Kainz, Computers, Algorithms, and Boolean Logic · APDR Chapter 2

### Community 12 - "Boolean laws / Boolean expressions"
Cohesion: 0.20
Nodes (11): Algorithm, Boolean expressions, Boolean laws, De Morgan's laws, Logic gates, NAND, Physical circuits, Program language (+3 more)

### Community 13 - "index.js / ago()"
Cohesion: 0.22
Nodes (3): ago(), ticksHTML(), when()

### Community 15 - "eei-ch1-physics.test.js"
Cohesion: 0.10
Nodes (6): nand(), nandAnd(), nandOr(), member(), setOp(), src2

### Community 16 - "Autonomy Course Site / SKILL.md"
Cohesion: 0.33
Nodes (5): APDR content rule, Autonomy Course Site, Before changing the site, Boundaries, Study materials

### Community 17 - "Q: How are the static study pages hosted, and what GitHub Pages and Jeky"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?, Source Nodes

### Community 18 - "Q: Does the graph cover the learner journey from the course home through"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?, Source Nodes

### Community 19 - "guide.js / logToday()"
Cohesion: 0.70
Nodes (3): logToday(), render(), stamp()

### Community 25 - "Study Pages project guide"
Cohesion: 0.08
Nodes (25): Project data, Project instructions, Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints (+17 more)

## Knowledge Gaps
- **10 isolated node(s):** `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Bernhard Kainz` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lab standard` connect `eei/ch1-physics.js / eei-ch1-physics.test.js` to `Study Pages project guide`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `eei/ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `capacitorBench() / paint()` be split into smaller, more focused modules?**
  _Cohesion score 0.07946127946127945 - nodes in this community are weakly interconnected._
- **Why does `Design System: From Fundamentals to AI Apocalypse` connect `Components / Design System: From Fundamentals to AI Apocalypse` to `Study Pages project guide`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `eei/ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Components / Design System: From Fundamentals to AI Apocalypse` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._