# Graph Report - AutonomyTechnologies  (2026-11-03)

## Corpus Check
- 51 files · ~161,235 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 4, (none) 2)

## Summary
- 758 nodes · 1425 edges · 35 communities (29 shown, 6 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 185 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c780e3aa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- capacitorBench() / paint()
- Components / Design System: From Fundamentals to AI Apocalypse
- guide-to-tex.py / Conv
- ch3-lab.js
- ch12-lab.js
- mei/ch1-lab.js
- ch12-physics.js
- Lab standard
- steps / jekyll-docker.yml
- lab.js / .show()
- ch2-lab.js
- Computers, Algorithms, and Boolean Logic · APDR Chapter 2
- Boolean laws / Boolean expressions
- index.js / ago()
- ch4-lab.js
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
- ch4-physics.js
- ch3-physics.js
- ch34-lab.js
- mei/ch2-lab.js
- lab-challenges.test.js
- ch5-lab.js
- mei/ch2-physics.js
- mei/ch1-physics.js
- mei/ch3-lab.js
- mei/ch3-physics.js

## God Nodes (most connected - your core abstractions)
1. `fieldPlayground()` - 28 edges
2. `capacitorBench()` - 22 edges
3. `paint()` - 21 edges
4. `Components` - 20 edges
5. `networks()` - 18 edges
6. `draw()` - 18 edges
7. `interfaceBench()` - 17 edges
8. `queue()` - 16 edges
9. `check()` - 15 edges
10. `css()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Stage and interaction` --references--> `fmt()`  [INFERRED]
  docs/LAB-STANDARD.md → js/eei/ch1-physics.js
- `draw()` --indirect_call--> `guess()`  [INFERRED]
  js/mei/ch1-lab.js → js/mei/ch2-lab.js
- `answers_of()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `find()`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py
- `check()` --calls--> `Node`  [INFERRED]
  tools/check-guide.py → tools/guide-to-tex.py

## Import Cycles
- None detected.

## Communities (35 total, 6 thin omitted)

### Community 0 - "capacitorBench() / paint()"
Cohesion: 0.05
Nodes (76): capacitorBench(), charged(), circuit(), draw(), grow(), guessOn(), nice(), paint() (+68 more)

### Community 1 - "Components / Design System: From Fundamentals to AI Apocalypse"
Cohesion: 0.05
Nodes (39): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part chips, Dark mode (+31 more)

### Community 2 - "guide-to-tex.py / Conv"
Cohesion: 0.07
Nodes (21): all_nodes(), answers_of(), check(), check_lab(), direct(), items(), main(), Report (+13 more)

### Community 3 - "ch3-lab.js"
Cohesion: 0.11
Nodes (43): animate(), arrow(), box(), colours(), columnsShown(), decodeStep(), digits(), drawBases() (+35 more)

### Community 4 - "ch12-lab.js"
Cohesion: 0.12
Nodes (34): animate(), arrow(), box(), colours(), drawAnf(), drawGraph(), drawHazard(), drawIdentity() (+26 more)

### Community 5 - "mei/ch1-lab.js"
Cohesion: 0.10
Nodes (32): bindStagePointer(), choose(), coords(), bit(), count(), domainRows(), domainStage(), drawSlider() (+24 more)

### Community 6 - "ch12-physics.js"
Cohesion: 0.18
Nodes (12): anfSteps(), bit(), evalAnf(), minimize(), cover(), generate(), obdd(), build() (+4 more)

### Community 7 - "Lab standard"
Cohesion: 0.09
Nodes (19): Acceptance, Challenges, Experiments, Files, Lab standard, Layout, Links to and from the guide, Motion (+11 more)

### Community 8 - "steps / jekyll-docker.yml"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 9 - "lab.js / .show()"
Cohesion: 0.32
Nodes (11): complete(), Experiment(), guideLink(), h(), read(), refresh(), runSetup(), stamp() (+3 more)

### Community 10 - "ch2-lab.js"
Cohesion: 0.21
Nodes (24): bits(), box(), colours(), drawAlgorithm(), drawEquivalent(), drawLogic(), drawNand(), drawTiming() (+16 more)

### Community 11 - "Computers, Algorithms, and Boolean Logic · APDR Chapter 2"
Cohesion: 0.67
Nodes (3): APDR lecture slides: Algorithms, programming and data representation; Boolean algebra and logic, Bernhard Kainz, Computers, Algorithms, and Boolean Logic · APDR Chapter 2

### Community 12 - "Boolean laws / Boolean expressions"
Cohesion: 0.20
Nodes (11): Algorithm, Boolean expressions, Boolean laws, De Morgan's laws, Logic gates, NAND, Physical circuits, Program language (+3 more)

### Community 13 - "index.js / ago()"
Cohesion: 0.22
Nodes (3): ago(), ticksHTML(), when()

### Community 14 - "ch4-lab.js"
Cohesion: 0.14
Nodes (26): animate(), arithmeticResult(), arrow(), box(), challenge(), colours(), drawArithmetic(), drawFraction() (+18 more)

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
Cohesion: 0.06
Nodes (37): Project data, Project instructions, Acceptance, Content rules, Files, Labs, Markup, Page structure (+29 more)

### Community 26 - "ch4-physics.js"
Cohesion: 0.23
Nodes (10): binaryValue(), classifySingle(), decodeSingle(), float32(), fractionBits(), fractionValue(), normalizedBinary(), scientificOperation() (+2 more)

### Community 27 - "ch3-physics.js"
Cohesion: 0.26
Nodes (10): columnSubtract(), convert(), decodeInteger(), decodeTwos(), negatePattern(), parseBase(), parseBits(), toBase() (+2 more)

### Community 28 - "ch34-lab.js"
Cohesion: 0.19
Nodes (12): challenge(), colors(), draw(), drawColumns(), drawFields(), drawLine(), x(), mount() (+4 more)

### Community 29 - "mei/ch2-lab.js"
Cohesion: 0.21
Nodes (20): binaryDraw(), bindSlider(), boundsDraw(), box(), distanceDraw(), guess(), inductionDraw(), line() (+12 more)

### Community 31 - "lab-challenges.test.js"
Cohesion: 0.06
Nodes (15): nand(), nandAnd(), nandCircuit(), nandOr(), moduleConfiguration(), rowsToBytes(), row(), rows() (+7 more)

### Community 32 - "ch5-lab.js"
Cohesion: 0.38
Nodes (9): box(), challenge(), colours(), draw(), fit(), label(), line(), mount() (+1 more)

### Community 34 - "mei/ch1-physics.js"
Cohesion: 0.18
Nodes (6): complement(), formatInterval(), intersect(), interval(), member(), setOp()

### Community 35 - "mei/ch3-lab.js"
Cohesion: 0.21
Nodes (21): bindSlider(), compositionDraw(), elementaryDraw(), X(), Y(), graphDraw(), line(), mappingDraw() (+13 more)

### Community 39 - "mei/ch3-physics.js"
Cohesion: 0.14
Nodes (4): discriminant(), relationValues(), roots(), squarePreimages()

## Knowledge Gaps
- **10 isolated node(s):** `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Bernhard Kainz` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 246 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lab standard` connect `Lab standard` to `Study Pages project guide`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `eei/ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `capacitorBench() / paint()` be split into smaller, more focused modules?**
  _Cohesion score 0.05471956224350205 - nodes in this community are weakly interconnected._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `eei/ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Components / Design System: From Fundamentals to AI Apocalypse` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Are the 5 inferred relationships involving `paint()` (e.g. with `draw()` and `draw()`) actually correct?**
  _`paint()` has 5 INFERRED edges - model-reasoned connections that need verification._