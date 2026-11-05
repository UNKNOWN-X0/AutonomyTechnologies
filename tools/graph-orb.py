#!/usr/bin/env python3
"""Lay the project's own Graphify graph out in 3D for the turning "orb" at the bottom of the home page.

Reads graphify-out/graph.json, runs a small force layout (springs along edges, repulsion between all nodes,
each community pulled towards its own point on a sphere), and writes assets/graph-orb.json: whole-number
coordinates, a subject per node (apdr, mei, eei or shared) and the edge list. js/orb.js draws it.

The layout uses a fixed seed, so the file only changes when the graph does.
Run after a graph refresh (scripts/refresh-graph.sh does this for this project):
    python3 tools/graph-orb.py   (no -I: numpy lives in the user site-packages)
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent


def subject(path):
    for s in ("apdr", "mei", "eei"):
        if f"/{s}/" in f"/{path}" or path.startswith(f"{s}/") or f"-{s}-" in path or f"{s}-ch" in path:
            return s
    return "shared"


def main():
    g = json.loads((ROOT / "graphify-out/graph.json").read_text(encoding="utf-8"))
    nodes = [n for n in g["nodes"] if n.get("source_file") and not n["id"].startswith("ref_")]
    index = {n["id"]: i for i, n in enumerate(nodes)}
    edges = sorted({tuple(sorted((index[l["source"]], index[l["target"]])))
                    for l in g["links"] if l["source"] in index and l["target"] in index and l["source"] != l["target"]})
    n = len(nodes)
    comms = sorted({c["community"] for c in nodes})
    cidx = np.array([comms.index(c["community"]) for c in nodes])

    # Community anchors spread evenly over a sphere (Fibonacci points), bigger groups first.
    k = len(comms)
    golden = np.pi * (3 - np.sqrt(5))
    t = np.arange(k)
    y = 1 - 2 * (t + 0.5) / k
    r = np.sqrt(1 - y * y)
    anchors = np.stack([r * np.cos(golden * t), y, r * np.sin(golden * t)], 1)

    rng = np.random.default_rng(7)
    pos = anchors[cidx] + rng.normal(0, 0.08, (n, 3))
    E = np.array(edges) if edges else np.zeros((0, 2), int)
    for step in range(260):
        d = pos[:, None, :] - pos[None, :, :]
        dist2 = (d ** 2).sum(-1) + 1e-3
        force = (d / dist2[..., None] ** 1.5).sum(1) * 0.0009          # repulsion
        if len(E):
            v = pos[E[:, 1]] - pos[E[:, 0]]
            pull = v * 0.06                                              # springs along edges
            np.add.at(force, E[:, 0], pull)
            np.add.at(force, E[:, 1], -pull)
        force += (anchors[cidx] - pos) * 0.05                            # keep each group together
        cool = 1 - step / 300
        pos += np.clip(force, -0.05, 0.05) * cool
    pos -= pos.mean(0)
    pos /= np.abs(pos).max()
    q = np.round(pos * 1000).astype(int)

    out = {
        "nodes": len(nodes),
        "groups": k,
        "xyz": q.flatten().tolist(),
        "subject": "".join({"apdr": "a", "mei": "m", "eei": "e", "shared": "s"}[subject(x["source_file"])] for x in nodes),
        "edges": [i for e in edges for i in e],
    }
    path = ROOT / "assets/graph-orb.json"
    path.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(f"graph-orb: {len(nodes)} nodes, {len(edges)} edges, {k} groups, {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
