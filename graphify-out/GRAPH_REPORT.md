# Graph Report - AutonomyTechnologies  (2026-11-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1108 nodes · 2138 edges · 56 communities (44 shown, 12 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 260 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5608bf2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EEI 1 lab: fields and capacitors
- Site look: design rules
- Guide checker
- APDR 3 lab: number formats
- APDR 12a lab: Boolean algebra
- MEI 1 lab: logic and sets
- Lab rules and APDR 12a formulas
- EEI 1 formulas
- Website publishing
- Lab engine (all labs)
- APDR 2 lab: computers and logic
- APDR 2 guide: lecture source
- APDR 2 guide: topics
- Home page and guide rules
- APDR 4 lab: floating point
- MEI expression parser
- Helper notes for AI agents
- Saved question: hosting
- Saved question: learner journey
- Guide diagrams
- Hover tooltips
- Home page design brief
- Concept map
- EEI lab design brief
- Site preview picture
- Project overview and standards
- APDR 4 formulas
- APDR 3 formulas
- APDR 34a lab: integers and floats
- MEI 2 lab: real numbers
- Contents rail and page navigation
- APDR 5 lab: memory
- Settings panel
- MEI 1 formulas
- MEI 3 lab: mappings
- Heading effects and reading chip
- Lab question and MEI tests
- MEI 2 formulas
- MEI 3 formulas
- PDF converter: 3D coordinate pictures
- EEI 2 lab: currents and resistance
- APDR 5 formulas
- EEI 1 formula tests
- PDF converter: drawing helpers
- PDF converter: page blocks
- PDF converter: maths and formula layout
- Graph node notes script
- PDF converter: reading the page
- Home page orb
- Lab challenge tests
- Diagram and lab plan
- EEI 2 formulas
- Lab question generator tests
- EEI 2 formula tests
- APDR 2 formula tests

## God Nodes (most connected - your core abstractions)
1. `fieldPlayground()` - 30 edges
2. `Components` - 25 edges
3. `capacitorBench()` - 22 edges
4. `paint()` - 21 edges
5. `draw()` - 18 edges
6. `networks()` - 18 edges
7. `queue()` - 18 edges
8. `update()` - 18 edges
9. `interfaceBench()` - 17 edges
10. `check()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Markup` --references--> `tick()`  [INFERRED]
  docs/GUIDE-STANDARD.md → js/eei/ch1-lab.js
- `Markup` --references--> `cap()`  [INFERRED]
  docs/GUIDE-STANDARD.md → js/eei/ch1-lab.js
- `Local workflow` --references--> `route()`  [INFERRED]
  AGENTS.md → js/index.js
- `Generated challenges (New challenge)` --references--> `three()`  [INFERRED]
  docs/LAB-STANDARD.md → js/apdr/ch3-lab.js
- `Challenges` --references--> `reveal()`  [INFERRED]
  docs/LAB-STANDARD.md → js/nav.js

## Import Cycles
- None detected.

## Communities (56 total, 12 thin omitted)

### Community 0 - "EEI 1 lab: fields and capacitors"
Cohesion: 0.05
Nodes (77): capacitorBench(), charged(), circuit(), draw(), grow(), guessOn(), nice(), paint() (+69 more)

### Community 1 - "Site look: design rules"
Cohesion: 0.04
Nodes (45): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part switch, Dark mode (+37 more)

### Community 2 - "Guide checker"
Cohesion: 0.17
Nodes (12): all_nodes(), answers_of(), check(), check_appendix(), check_exercise(), check_files(), check_lab(), direct() (+4 more)

### Community 3 - "APDR 3 lab: number formats"
Cohesion: 0.11
Nodes (47): animate(), arrow(), box(), colours(), columnsShown(), decodeStep(), digits(), drawBases() (+39 more)

### Community 4 - "APDR 12a lab: Boolean algebra"
Cohesion: 0.10
Nodes (48): animate(), arrow(), boolABC(), boolXY(), box(), colours(), drawAnf(), drawGraph() (+40 more)

### Community 5 - "MEI 1 lab: logic and sets"
Cohesion: 0.06
Nodes (54): New kinds needed, Part A: diagrams by chapter, Where, chapter by chapter, Markup, Signs, cells(), ownMap(), bits() (+46 more)

### Community 6 - "Lab rules and APDR 12a formulas"
Cohesion: 0.08
Nodes (27): Acceptance, Challenges, Experiments, Files, Generated challenges (New challenge), Lab standard, Layout, Links to and from the guide (+19 more)

### Community 7 - "EEI 1 formulas"
Cohesion: 0.19
Nodes (5): bench(), contributions(), field(), lineWork(), plate()

### Community 8 - "Website publishing"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 9 - "Lab engine (all labs)"
Cohesion: 0.17
Nodes (20): bitCells(), render(), wanted(), chevron(), complete(), enhanceAll(), enhanceSelect(), choose() (+12 more)

### Community 10 - "APDR 2 lab: computers and logic"
Cohesion: 0.16
Nodes (32): box(), colours(), drawAlgorithm(), drawEquivalent(), drawLogic(), drawNand(), drawTiming(), experimentAlgorithm() (+24 more)

### Community 11 - "APDR 2 guide: lecture source"
Cohesion: 0.67
Nodes (3): APDR lecture slides: Algorithms, programming and data representation; Boolean algebra and logic, Bernhard Kainz, Computers, Algorithms, and Boolean Logic · APDR Chapter 2

### Community 12 - "APDR 2 guide: topics"
Cohesion: 0.20
Nodes (11): Algorithm, Boolean expressions, Boolean laws, De Morgan's laws, Logic gates, NAND, Physical circuits, Program language (+3 more)

### Community 13 - "Home page and guide rules"
Cohesion: 0.06
Nodes (25): Acceptance, Appendix pages, Content rules, Files, Labs, Page structure, PDF, Practice and testing (+17 more)

### Community 14 - "APDR 4 lab: floating point"
Cohesion: 0.11
Nodes (29): animate(), arithmeticResult(), arrow(), box(), challenge(), colours(), drawArithmetic(), drawFraction() (+21 more)

### Community 15 - "MEI expression parser"
Cohesion: 0.24
Nodes (15): bool(), compile(), atom(), expr(), power(), startsAtom(), take(), term() (+7 more)

### Community 16 - "Helper notes for AI agents"
Cohesion: 0.33
Nodes (5): APDR content rule, Autonomy Course Site, Before changing the site, Boundaries, Study materials

### Community 17 - "Saved question: hosting"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?, Source Nodes

### Community 18 - "Saved question: learner journey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?, Source Nodes

### Community 19 - "Guide diagrams"
Cohesion: 0.12
Nodes (25): svg(), arrow(), charge(), COORD(), add(), arc(), axis(), dot() (+17 more)

### Community 22 - "Concept map"
Cohesion: 0.46
Nodes (7): below(), box(), draw(), pulse(), redraw(), select(), stopPulses()

### Community 25 - "Project overview and standards"
Cohesion: 0.06
Nodes (34): Acceptance, Exercise solutions standard, Files and source, Learning sequence, Page frame, Acceptance, Normal authoring workflow, Source and generated files (+26 more)

### Community 26 - "APDR 4 formulas"
Cohesion: 0.23
Nodes (10): binaryValue(), classifySingle(), decodeSingle(), float32(), fractionBits(), fractionValue(), normalizedBinary(), scientificOperation() (+2 more)

### Community 27 - "APDR 3 formulas"
Cohesion: 0.26
Nodes (10): columnSubtract(), convert(), decodeInteger(), decodeTwos(), negatePattern(), parseBase(), parseBits(), toBase() (+2 more)

### Community 28 - "APDR 34a lab: integers and floats"
Cohesion: 0.14
Nodes (16): challenge(), colors(), draw(), drawColumns(), drawFields(), drawLine(), x(), mix() (+8 more)

### Community 29 - "MEI 2 lab: real numbers"
Cohesion: 0.16
Nodes (26): binaryDraw(), bindSlider(), boundsDraw(), box(), distanceDraw(), distinct(), guess(), inductionDraw() (+18 more)

### Community 30 - "Contents rail and page navigation"
Cohesion: 0.13
Nodes (20): Local workflow, Project data, Project instructions, fold(), follow(), groupOf(), idOf(), instrument() (+12 more)

### Community 32 - "APDR 5 lab: memory"
Cohesion: 0.26
Nodes (12): box(), challenge(), colours(), draw(), fit(), hx(), label(), line() (+4 more)

### Community 33 - "Settings panel"
Cohesion: 0.60
Nodes (4): apply(), build(), button(), gear()

### Community 34 - "MEI 1 formulas"
Cohesion: 0.18
Nodes (6): complement(), formatInterval(), intersect(), interval(), member(), setOp()

### Community 35 - "MEI 3 lab: mappings"
Cohesion: 0.13
Nodes (35): bindSlider(), compositionDraw(), elementaryDraw(), fmt(), graphDraw(), line(), mappingDraw(), node() (+27 more)

### Community 36 - "Heading effects and reading chip"
Cohesion: 0.23
Nodes (14): decode(), frame(), decodeAll(), fit(), fitAll(), fitFormulas(), glyph(), readout() (+6 more)

### Community 39 - "MEI 3 formulas"
Cohesion: 0.14
Nodes (4): discriminant(), relationValues(), roots(), squarePreimages()

### Community 40 - "PDF converter: 3D coordinate pictures"
Cohesion: 0.32
Nodes (5): coord_pieces(), axis(), fit(), tip_label(), vec()

### Community 41 - "EEI 2 lab: currents and resistance"
Cohesion: 0.18
Nodes (18): angle(), challenge(), draw(), marker(), text(), fmt(), getControls(), mount() (+10 more)

### Community 44 - "PDF converter: drawing helpers"
Cohesion: 0.18
Nodes (13): amap_data(), amap_label(), amap_tikz(), arrow_t(), coord_tikz(), dipole_lines(), P(), scene_tikz() (+5 more)

### Community 45 - "PDF converter: page blocks"
Cohesion: 0.19
Nodes (6): Conv, est(), grow_delims(), inline(), main(), tex_text()

### Community 46 - "PDF converter: maths and formula layout"
Cohesion: 0.25
Nodes (6): big_op(), math(), math_text(), math_wrap(), sqrt_tex(), var_math()

### Community 47 - "Graph node notes script"
Cohesion: 0.19
Nodes (10): comment_above(), describe(), file_phrase(), find_parents(), from_name(), main(), patch_html(), words() (+2 more)

### Community 49 - "Home page orb"
Cohesion: 0.54
Nodes (7): draw(), frame(), kick(), load(), readColours(), reduced(), token()

### Community 50 - "Lab challenge tests"
Cohesion: 0.39
Nodes (5): context(), fake(), loadExperiments(), ROOT, runEngine()

### Community 51 - "Diagram and lab plan"
Cohesion: 0.22
Nodes (8): Bugs found (Playwright WebKit, 1288 px, sandboxes opened), Order and checks, Part B: labs, Plan: more diagrams, freer labs, Proposed changes, Status (2026-11-05), What a lab is today, Why it feels fixed

### Community 52 - "EEI 2 formulas"
Cohesion: 0.12
Nodes (5): Acceptance, EEI Chapter 2 lab: Stationary Currents, Experiments (in chapter order), Scope and files, conductivity()

### Community 53 - "Lab question generator tests"
Cohesion: 0.38
Nodes (5): context(), defsOf(), fake(), labs, ROOT

## Knowledge Gaps
- **10 isolated node(s):** `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline`, `Bernhard Kainz` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 330 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Markup` connect `MEI 1 lab: logic and sets` to `EEI 1 lab: fields and capacitors`, `PDF converter: drawing helpers`, `Home page and guide rules`?**
  _High betweenness centrality (0.457) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `eei/ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EEI 1 lab: fields and capacitors` be split into smaller, more focused modules?**
  _Cohesion score 0.053728949478749 - nodes in this community are weakly interconnected._
- **Why does `Study guide standard` connect `Home page and guide rules` to `Project overview and standards`, `MEI 1 lab: logic and sets`?**
  _High betweenness centrality (0.216) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `eei/ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Site look: design rules` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._