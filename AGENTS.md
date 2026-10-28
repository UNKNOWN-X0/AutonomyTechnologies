# Project instructions

This file follows the [Project AGENTS standard](../../STANDARDS.md#project-agents-standard)
and supplements the shared rules in [workspace AGENTS.md](../../AGENTS.md). It records
verified project-specific facts. See [ADD-ONS.md](../../ADD-ONS.md)
for the complete workspace add-on inventory and upkeep notes; it is a catalog,
not a separate workflow guide.

## Project data

- **Graphify:** This repository has a persistent index at `graphify-out/graph.json`. Follow the workspace [Graphify graph standard](../../STANDARDS.md#graphify-graph-standard).
- **Archify:** Diagrams for this repository belong in its `.archify/` folder. Follow the workspace [Archify diagram standard](../../STANDARDS.md#archify-diagram-standard); HTML diagrams are snapshots.
- **Study guides and labs:** every chapter guide follows [docs/GUIDE-STANDARD.md](docs/GUIDE-STANDARD.md) and every lab [docs/LAB-STANDARD.md](docs/LAB-STANDARD.md). The HTML is the single source; regenerate the `.tex` and `.pdf` with `tools/guide-to-tex.py` and check with `tools/check-guide.py`, which must exit 0.
