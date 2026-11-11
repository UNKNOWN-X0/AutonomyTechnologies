# Project instructions

This file follows the [Project AGENTS standard](../../STANDARDS.md#project-agents-standard)
and supplements the shared rules in [workspace AGENTS.md](../../AGENTS.md). It records
verified project-specific facts. See [ADD-ONS.md](../../ADD-ONS.md)
for the complete workspace add-on inventory and upkeep notes; it is a catalog,
not a separate workflow guide.

## Project data

- **Graphify:** This repository has a persistent index at `graphify-out/graph.json`. Follow the workspace [Graphify graph standard](../../STANDARDS.md#graphify-graph-standard).
- **Archify:** Diagrams for this repository belong in its `.archify/` folder. Follow the workspace [Archify diagram standard](../../STANDARDS.md#archify-diagram-standard); HTML diagrams are snapshots.
- **Version log:** every release that changes what students see adds an entry at the top of `about/version-log.html`; `about/how-to-use.html` describes the current features.
- **Study guides, labs, and exercises:** every chapter guide follows [docs/GUIDE-STANDARD.md](docs/GUIDE-STANDARD.md), every lab [docs/LAB-STANDARD.md](docs/LAB-STANDARD.md), and every worked exercise page [docs/EXERCISE-SOLUTIONS-STANDARD.md](docs/EXERCISE-SOLUTIONS-STANDARD.md), and every appendix (reference material outside the chapters) the guide standard's [Appendix pages](docs/GUIDE-STANDARD.md#appendix-pages) section. The HTML is the single source; regenerate the `.tex` and `.pdf` with `tools/guide-to-tex.py` and check with `tools/check-guide.py`, which must exit 0.
- **Authoring tools:** follow [docs/TOOLING-STANDARD.md](docs/TOOLING-STANDARD.md) when using or changing the converter, checker, tests, or site verification workflow.

## Local workflow

Lessons from earlier work; follow them so the same mistakes do not come back.

- **Check both hub states.** Load the hub with empty storage (a first visit) and with seeded progress (`<key>-checks` in localStorage). `js/index.js` returns early when nothing is started, so a feature every visitor should see is called before that `if (!started)` return.
- **Browser checks.** Chromium and WebKit (the owner uses Safari), at 1288px (the owner's laptop), 1440px and 390px, light and dark. Measure sideways overflow and the left and right gaps of measure-capped blocks, not only screenshots.
- **Stale Safari cache.** When a change the owner reports as missing renders in Playwright WebKit, ask for a reload with ⌘⌥R before debugging further.
- **Headings and scripts.** `js/hud.js` (loaded by `js/settings.js`) runs after DOMContentLoaded, after `guide.js` and `nav.js` have read heading text. Anything that changes headings or adds UI near them stays outside the `h2` element.
- **Shared working tree.** Another agent session may be editing this repository at the same time. Before committing, read `git diff` hunk by hunk and stage only your own changes; never commit `.tex` or `.pdf` files you did not regenerate, and say what you left out.
- **Probe files.** Playwright probe scripts and their screenshots go in the session scratchpad, with absolute output paths, so nothing lands in the repository.
- **Lab engine in node.** `tests/` run `js/lab.js` and the lab scripts in a stand-in DOM without timers, so top-level code in them guards browser-only calls (`typeof setTimeout === "function"`) and must not throw when an element is missing.
- **Wrapped controls.** `js/lab.js` wraps each `.controls select` in `span.cselect`, so CSS written as `.field-row > select` or `:has(> select)` must also name `> .cselect`. Lab code keeps reading and setting the hidden native select; set `.value` and the button label follows.
- **One control style.** Control boxes are styled once in the shared block at the end of `css/lab.css`; an older, more specific rule (such as `.controls .own input`) silently wins over it, so delete old box styles instead of adding overrides.
- **Graph community names.** Community names in `graphify-out/.graphify_labels.json` are written by hand in plain words ("EEI 1 lab: fields and capacitors"), because the owner reads the graph page. They survive refreshes while a community keeps most of its members; a new or reshaped community falls back to a file or function name. After a refresh, name any such community in that file and run `graphify cluster-only .` (no LLM labelling: it would need a paid backend), then `python3 -I tools/graph-describe.py`.
- **Graph node notes.** `tools/graph-describe.py` gives every node a plain-English note on graph.html (hover and the node panel), from the code comment above it, its name, and a hand-written description of its file; `scripts/refresh-graph.sh` runs it after each update. When it prints "add a plain description to FILES", add the new file to its `FILES` table; a well-connected node with a vague note gets a line in `OVERRIDES`. A clear comment above a new function is the best source.
- **Hub route stops.** Route stops are pseudo-elements on each row's `.no` (number), not on the row, so they stay level with the number when a phone row stacks its buttons; `route()` ends the lit stretch on that number too. The lit line is `.subjects::after`, which paints after every child, so anything that must sit on top of it (the `.route-stop` at a subject tile) needs its own `z-index`. A row type added to a subject's panels (like `.part-item`) gets `.no::before` stops in the same selector list as chapters.
- **Hub tabs and folding.** `js/index.js` builds the course-part tabs first, then the subject folds, which fold `.part-panels` (whatever tab is open) and relabel on the `parttab` event. Only subjects with more than one part get tabs. Exercise rows use `li.part-item`, never `li.chapter`: progress, the radar and the route count every `li.chapter`.
- **Rail Chapters list.** `js/nav.js` reads the hub and builds the list as nested `details`: this page's subject first and open, one fold per kind (`chapter` shows as Lectures, then each `data-tab` kind) with a count, and only the fold holding this page open. Open folds are saved in localStorage `nav-folds` only when the reader toggles them (opening a fold in code fires its own `toggle`, which is skipped), and `reveal()` scrolls the rail or sheet, never the page. A field added to the parsed list needs a new `nav-chapters-<n>` cache key, or old tabs keep the stale shape.
