# Graph Report - AutonomyTechnologies  (2026-10-27)

## Corpus Check
- 11 files · ~14,689 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .css 3, (none) 2)

## Summary
- 104 nodes · 102 edges · 13 communities (9 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9672ff7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Design System: Study Pages
- Colors
- guide.js
- GitHub Pages Workflow
- Course Home and Docs
- Site Preview Artwork
- Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?
- Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?
- Project instructions
- Components
- Product
- index.js
- Study Pages: hub, guides and lab chrome

## God Nodes (most connected - your core abstractions)
1. `Components` - 16 edges
2. `Product` - 10 edges
3. `Design System: Study Pages` - 9 edges
4. `Colors` - 6 edges
5. `Study Pages project guide` - 6 edges
6. `steps` - 4 edges
7. `Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?` - 4 edges
8. `Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?` - 4 edges
9. `build` - 3 edges
10. `stamp()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Electrical Engineering I study cards` --references--> `Electrical Engineering I`  [EXTRACTED]
  index.html → README.md
- `Mathematics for Engineers I study cards` --references--> `Mathematics for Engineers I`  [EXTRACTED]
  index.html → README.md
- `Study Pages home page` --references--> `GitHub Pages hosting`  [EXTRACTED]
  index.html → README.md

## Import Cycles
- None detected.

## Communities (13 total, 4 thin omitted)

### Community 0 - "Design System: Study Pages"
Cohesion: 0.14
Nodes (13): Design System: Study Pages, Do:, Do's and Don'ts, Don't:, Elevation & Depth, Hierarchy, Layout, Named Rules (+5 more)

### Community 1 - "Colors"
Cohesion: 0.33
Nodes (6): Colors, Dark mode, Named Rules, Neutral, Primary, Secondary: subject colour families

### Community 2 - "guide.js"
Cohesion: 0.70
Nodes (3): logToday(), render(), stamp()

### Community 5 - "GitHub Pages Workflow"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 6 - "Course Home and Docs"
Cohesion: 0.20
Nodes (13): Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Active-recall study workflow, Electrical Engineering I, Electrostatic Fields interactive lab, Electrostatic Fields study guide, GitHub Pages hosting (+5 more)

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
Cohesion: 0.18
Nodes (10): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Product, Product Principles (+2 more)

## Knowledge Gaps
- **4 isolated node(s):** `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 67 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design System: Study Pages` connect `Design System: Study Pages` to `Colors`, `Components`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Design System: Study Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `Components` connect `Components` to `Design System: Study Pages`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `GitHub Pages Workflow` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `Colors` connect `Colors` to `Design System: Study Pages`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Components` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._