# Graph Report - AutonomyTechnologies  (2026-10-28)

## Corpus Check
- 14 files · ~38,819 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 3, (none) 2, .tex 1)

## Summary
- 170 nodes · 227 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7912d5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Design System: Study Pages
- .block
- guide.js
- guide-to-tex.py
- check
- GitHub Pages Workflow
- Course Home and Docs
- Study guide standard
- Site Preview Artwork
- Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?
- Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?
- Components
- Product
- index.js
- Study Pages: hub, guides and lab chrome

## God Nodes (most connected - your core abstractions)
1. `Components` - 16 edges
2. `check()` - 14 edges
3. `Conv` - 12 edges
4. `Study guide standard` - 11 edges
5. `Node` - 10 edges
6. `Product` - 10 edges
7. `Tree` - 9 edges
8. `Design System: Wegweiser` - 9 edges
9. `find()` - 7 edges
10. `inline()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `check()` --calls--> `Node`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `Tree`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `answers_of()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `Electrical Engineering I study cards` --references--> `Electrical Engineering I`  [EXTRACTED]
  index.html → README.md

## Import Cycles
- None detected.

## Communities (15 total, 3 thin omitted)

### Community 0 - "Design System: Study Pages"
Cohesion: 0.11
Nodes (19): Colors, Dark mode, Design System: Wegweiser, Do:, Do's and Don'ts, Don't:, Elevation & Depth, Hierarchy (+11 more)

### Community 1 - ".block"
Cohesion: 0.25
Nodes (3): Conv, est(), inline()

### Community 2 - "guide.js"
Cohesion: 0.70
Nodes (3): logToday(), render(), stamp()

### Community 3 - "guide-to-tex.py"
Cohesion: 0.15
Nodes (8): main(), math(), math_text(), math_wrap(), Node, tex_text(), Tree, var_math()

### Community 4 - "check"
Cohesion: 0.21
Nodes (8): all_nodes(), answers_of(), check(), direct(), items(), main(), Report, find()

### Community 5 - "GitHub Pages Workflow"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 6 - "Course Home and Docs"
Cohesion: 0.20
Nodes (13): Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Active-recall study workflow, Electrical Engineering I, Electrostatic Fields interactive lab, Electrostatic Fields study guide, GitHub Pages hosting (+5 more)

### Community 7 - "Study guide standard"
Cohesion: 0.18
Nodes (11): Acceptance, Content rules, Files, Markup, Page structure, PDF, Practice and testing, Principles (+3 more)

### Community 12 - "Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?, Source Nodes

### Community 13 - "Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?, Source Nodes

### Community 15 - "Components"
Cohesion: 0.12
Nodes (16): Answer key, Buttons, Components, Course code square, Course-part chips, Exam checklist, Formula panels and tables, Navigation (guide contents rail) (+8 more)

### Community 16 - "Product"
Cohesion: 0.12
Nodes (12): Project data, Project instructions, Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform (+4 more)

## Knowledge Gaps
- **4 isolated node(s):** `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 91 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design System: Wegweiser` connect `Design System: Study Pages` to `Product`, `Components`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `check()` (e.g. with `.err()` and `.warn()`) actually correct?**
  _`check()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Design System: Study Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `Components` connect `Components` to `Design System: Study Pages`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `guide-to-tex.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._
- **Why does `Study Pages project guide` connect `Course Home and Docs` to `Product`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._