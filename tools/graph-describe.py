#!/usr/bin/env python3
"""Plain-English notes for every node on the Graphify page (graphify-out/graph.html).

Graphify names nodes after functions and headings ("syncList()", "Part B: labs"), which mean little to a
reader who did not write the code. This script gives each node one or two sentences: what it does (from the
code comment above it when there is one, otherwise from its name) and where it lives (from a hand-written
description of each file). The notes are written to graphify-out/node-notes.json and patched into
graph.html: they appear on hover and as "What it is" in the node panel.

Run after every graph refresh (scripts/refresh-graph.sh does this for this project):
    python3 -I tools/graph-describe.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "graphify-out"

# Where each file sits in the site, in words. Keys are graph source_file values.
FILES = {
    "js/lab.js": "the lab engine shared by every lab (challenge cards, Explore freely, New challenge, custom dropdowns, bit cells)",
    "js/guide.js": "the study-guide page script (worked steps, diagrams, symbol highlights)",
    "js/nav.js": "the contents rail and chapter navigation on every page",
    "js/hud.js": "the heading effects, formula fitting and reading chip",
    "js/settings.js": "the Settings panel (theme, motion, text size)",
    "js/tooltip.js": "the hover tooltips",
    "js/index.js": "the home page (review board, semesters, route line, radar)",
    "js/concept-map.js": "the concept map at the top of each guide",
    "js/mei/expr.js": "the typed-formula reader used by the MEI and APDR labs",
    "js/eei/ch1-lab.js": "the EEI Chapter 1 lab page (electrostatic fields)",
    "js/eei/ch1-physics.js": "the EEI Chapter 1 formulas (fields, potential, capacitors)",
    "js/eei/ch2-lab.js": "the EEI Chapter 2 lab page (stationary currents)",
    "js/eei/ch2-physics.js": "the EEI Chapter 2 formulas (current density, Ohm's law, resistance, power)",
    "docs/EXERCISE-SOLUTIONS-STANDARD.md": "the worked-exercise standard",
    "docs/TOOLING-STANDARD.md": "the standard for the converter, checker, tests and site checks",
    "tools/stack-fractions.py": "the tool that turns quotients written with a slash into stacked fractions",
    ".impeccable/surfaces/eei-ch2-lab.md": "the design brief for the EEI Chapter 2 lab",
    "js/mei/ch1-lab.js": "the MEI Chapter 1 lab page (logic and sets)",
    "js/mei/ch1-physics.js": "the MEI Chapter 1 formulas (logic, sets, intervals)",
    "js/mei/ch2-lab.js": "the MEI Chapter 2 lab page (real numbers)",
    "js/mei/ch2-physics.js": "the MEI Chapter 2 formulas (binary, distance, binomials)",
    "js/mei/ch3-lab.js": "the MEI Chapter 3 lab page (mappings)",
    "js/mei/ch3-physics.js": "the MEI Chapter 3 formulas (mappings, inverses, polar coordinates)",
    "js/apdr/ch2-lab.js": "the APDR Chapter 2 lab page (computers and Boolean logic)",
    "js/apdr/ch2-physics.js": "the APDR Chapter 2 rules (square-root steps, logic gates)",
    "js/apdr/ch3-lab.js": "the APDR Chapter 3 lab page (number formats)",
    "js/apdr/ch3-physics.js": "the APDR Chapter 3 rules (bases, encodings, binary arithmetic)",
    "js/apdr/ch4-lab.js": "the APDR Chapter 4 lab page (floating point)",
    "js/apdr/ch4-physics.js": "the APDR Chapter 4 rules (binary fractions, IEEE 754)",
    "js/apdr/ch5-lab.js": "the APDR Chapter 5 lab page (memory organisation)",
    "js/apdr/ch5-physics.js": "the APDR Chapter 5 rules (addresses, byte order, interleaving)",
    "js/apdr/ch12-lab.js": "the APDR Chapter 12a lab page (Boolean algebra)",
    "js/apdr/ch12-physics.js": "the APDR Chapter 12a rules (truth tables, Karnaugh maps, OBDDs, ANF)",
    "js/apdr/ch34-lab.js": "the APDR Chapter 34a lab page (integers and floating point)",
    "js/apdr/ch34-physics.js": "the APDR Chapter 34a rules (column arithmetic, numerical stability)",
    "tools/guide-to-tex.py": "the tool that turns a guide page into LaTeX and PDF",
    "tools/check-guide.py": "the tool that checks a guide and its lab against the standards",
    "tools/graph-describe.py": "this script, which writes these notes",
    "tools/graph-orb.py": "the script that lays this graph out in 3D for the home page orb",
    "js/orb.js": "the turning orb at the bottom of the home page (this graph in 3D)",
    "tests/lab-challenges.test.js": "the tests that load every lab and check its challenges",
    "tests/lab-generators.test.js": "the tests that check every New challenge generator",
    "tests/mei-expr.test.js": "the tests for the typed-formula reader",
    "DESIGN.md": "the design rules (colours, type, components)",
    "PRODUCT.md": "the product brief (who the site is for and why)",
    "README.md": "the project read-me",
    "AGENTS.md": "the working rules for AI agents in this project",
    "index.html": "the home page",
    "docs/GUIDE-STANDARD.md": "the study-guide standard",
    "docs/LAB-STANDARD.md": "the lab standard",
    "docs/DIAGRAM-AND-LAB-PLAN.md": "the plan for diagrams and freer labs",
    "apdr/ch2-computers.html": "the APDR Chapter 2 study guide",
    ".github/workflows/jekyll-docker.yml": "the GitHub workflow that builds the site",
    ".agents/skills/autonomy-course-site/SKILL.md": "the agent skill notes for this site",
    ".impeccable/surfaces/index-html.md": "the design brief for the home page",
    ".impeccable/surfaces/eei-ch1-lab.md": "the design brief for the EEI lab",
    "assets/preview.png": "the site's preview picture",
}


# Hand-written notes for well-connected nodes whose name and comment say too little. Keys are graph node ids;
# an id that disappears after a code change is simply ignored.
OVERRIDES = {
    "tools_guide_to_tex_conv": "The converter: walks a guide page and writes the matching LaTeX, block by block",
    "tools_guide_to_tex_conv_block": "Converts one block of the guide (a paragraph, formula card, list, table or diagram) to LaTeX",
    "tools_guide_to_tex_conv_blocks": "Converts a run of blocks, one after another",
    "tools_guide_to_tex_conv_chunks": "Splits a section into the pieces the converter handles separately",
    "tools_guide_to_tex_conv_keep": "Decides whether a page element belongs in the PDF (the web-only parts are dropped)",
    "tools_guide_to_tex_conv_li": "Converts one list item",
    "tools_guide_to_tex_conv_table": "Converts a table",
    "tools_guide_to_tex_conv_items": "Converts the items of a list",
    "tools_guide_to_tex_conv_all": "Converts every child of an element",
    "tools_guide_to_tex_node": "One element of the guide page as the converter sees it (tag, attributes, children)",
    "tools_guide_to_tex_node_cls": "Reads an element's CSS classes",
    "tools_guide_to_tex_tree": "Reads the guide's HTML into a tree of elements",
    "tools_guide_to_tex_tree_handle_starttag": "Opens a new element while reading the HTML",
    "tools_guide_to_tex_tree_handle_endtag": "Closes the current element while reading the HTML",
    "tools_guide_to_tex_tree_handle_startendtag": "Adds a self-closing element while reading the HTML",
    "tools_guide_to_tex_tree_handle_data": "Adds text while reading the HTML",
    "tools_guide_to_tex_find": "Finds the first element that matches a test",
    "tools_guide_to_tex_inline": "Converts running text with its bold, italics, symbols and sub- and superscripts",
    "tools_guide_to_tex_math": "Converts a formula into LaTeX maths",
    "tools_guide_to_tex_math_text": "Converts the text parts inside a formula",
    "tools_guide_to_tex_math_wrap": "Wraps a long formula so it fits the PDF page",
    "tools_guide_to_tex_tex_text": "Escapes plain text for LaTeX",
    "tools_guide_to_tex_var_math": "Writes a variable (an italic letter) in LaTeX maths",
    "tools_guide_to_tex_big_op": "Writes a big operator (integral, sum) with its limits",
    "tools_guide_to_tex_viz_tikz": "Turns a guide diagram (number line, Venn, wave, K-map, field lines …) into a TikZ drawing",
    "tools_guide_to_tex_amap_tikz": "Turns an arrow diagram (a mapping from one set to another) into a TikZ drawing",
    "tools_guide_to_tex_amap_label": "Writes a label in an arrow diagram",
    "tools_guide_to_tex_dipole_lines": "Traces dipole field lines for the PDF version of the field diagram",
    "tools_guide_to_tex_arrow_t": "Writes an arrow in a TikZ drawing",
    "tools_guide_to_tex_est": "Estimates how wide a piece of text will be, to decide where to break a line",
    "tools_guide_to_tex_p": "Formats a point for a TikZ drawing",
    "tools_guide_to_tex_t": "Formats a number for a TikZ drawing",
    "tools_check_guide_check": "Runs every check on one guide and its lab, and reports errors and warnings",
    "tools_check_guide_report": "Collects the errors and warnings of a check run",
    "tools_check_guide_report_err": "Records an error (the check fails)",
    "tools_check_guide_report_warn": "Records a warning (the check still passes)",
    "tools_check_guide_all_nodes": "Lists every element of the page for the checks",
    "tools_check_guide_answers_of": "Finds the answers that belong to a practice problem",
    "tools_check_guide_items": "Lists the items of a list for the checks",
    "tools_check_guide_direct": "Lists an element's direct children",
    "js_mei_expr_compile": "Turns a typed rule such as x² − 1 into something the lab can evaluate (without eval)",
    "js_mei_expr_compile_expr": "Reads a sum or difference (the loosest level of a formula)",
    "js_mei_expr_compile_term": "Reads a product or quotient, including 2x-style multiplication",
    "js_mei_expr_compile_unary": "Reads a leading minus or plus sign",
    "js_mei_expr_compile_power": "Reads a power (x^2)",
    "js_mei_expr_compile_atom": "Reads the smallest piece of a formula: a number, x, a bracket, |x| or a function",
    "js_mei_expr_compile_take": "Uses up the expected next symbol, or reports that it is missing",
    "js_mei_expr_logic_imp": "Reads an implication A ⇒ B (right to left)",
    "js_mei_expr_logic_not": "Reads a negation ¬A or a set complement",
    "js_mei_expr_logic_bin": "Builds the reader for one level of logic operators (∧, ⊕, ∨, ⇔)",
    "js_mei_expr_normalise": "Rewrites typed symbols (², −, ×, √, π) into plain ones before reading",
    "js_mei_expr_tokenize": "Splits a typed formula into numbers, names and symbols",
    "js_lab_experiment": "One experiment on a lab page: its challenge card, sandbox and progress",
    "js_lab_experiment_done": "Shows the finished card (score, Explore freely, New challenge) after the last challenge",
    "js_lab_experiment_practice": "Shows a newly generated practice challenge",
    "js_lab_experiment_explore": "Opens the sandbox while keeping your place in the challenges",
    "js_lab_experiment_next": "Moves on to the next challenge",
    "js_lab_refresh": "Updates the results summary at the end of the lab",
    "js_lab_complete": "Saves that an experiment's challenges are finished and ticks its skill",
    "js_lab_enhanceselect": "Replaces a plain dropdown with the site's own list (keyboard and screen-reader friendly)",
    "js_lab_enhanceall": "Upgrades every dropdown and bit field on the page when it loads",
    "js_lab_guidelink": "Builds the “Guide §…” link under a challenge's explanation",
    "js_lab_write": "Saves lab progress in this browser",
    "js_lab_stamp": "Stamps the date of a finished experiment",
    "js_lab_chevron": "Draws the small arrow on a dropdown",
    "js_lab_bitcells_wanted": "Decides whether to show clickable bit cells under a field",
    "js_lab_tween_frame": "One frame of a reveal animation",
    "js_nav_spy": "Watches which section you are reading and lights it in the contents rail",
    "js_nav_fold": "Folds or opens a group in the contents rail",
    "js_index_route": "Draws the green route line on the home page up to your furthest chapter",
    "js_index_light": "Lights the chapters you have started on the home page",
    "js_index_ago": "Writes how long ago something happened (“3 d ago”)",
    "js_index_when": "Writes when the next review is due",
    "js_hud_segmentformula": "Splits a long formula into pieces that can wrap onto the next line",
    "js_hud_spaceformula": "Adds thin spaces around operators so a formula is easier to read",
    "js_hud_start_relayout": "Re-fits headings and formulas after the window changes size",
    "js_guide_logtoday": "Saves today's review of the chapter and schedules the next one",
    "js_guide_stamp": "Shows when the chapter was last reviewed",
    "js_concept_map_select": "Selects a topic on the concept map and draws what it builds on",
    "js_concept_map_below": "Finds the topics a selected topic builds on",
    "js_settings_gear": "Puts the Settings gear button on the page",
    "js_eei_ch1_lab_css": "Reads a colour or size from the page's style sheet so the drawing matches the theme",
    "js_mei_ch3_lab_node": "Creates an SVG drawing element for the stage",
    "js_mei_ch2_lab_node": "Creates an SVG drawing element for the stage",
    "js_mei_ch3_lab_prediction": "Shows your prediction on the stage before the reveal",
    "js_mei_ch3_lab_reset": "Clears the stage drawing before it is redrawn",
    "js_mei_ch2_lab_reset": "Clears the stage drawing before it is redrawn",
    "js_apdr_ch2_physics_nand": "The NAND gate: 1 unless both inputs are 1",
    "js_apdr_ch2_physics_umbrella": "The umbrella rule U = C′·(W + R) from the chapter",
    "js_apdr_ch2_lab_bits": "Reads the 0/1 inputs chosen in the controls",
    "js_apdr_ch3_lab_standard": "Builds a standard challenge card for this lab",
    "js_apdr_ch4_lab_field": "Draws one IEEE field (sign, exponent or fraction) as a labelled box",
    "htmlparser": "Python's built-in HTML reader, which the PDF converter builds on",
    "js_apdr_ch12_physics_hazard": "The two product paths of f = xy + x′z while x switches, to show a static-1 glitch",
    "js_apdr_ch12_physics_minimize": "Finds the smallest sum of products for a set of minterms (the Karnaugh-map answer)",
    "js_apdr_ch12_physics_minimize_generate": "Builds every group (prime implicant) that could cover the minterms",
    "js_apdr_ch12_physics_op": "Evaluates one Boolean operator by name (AND, OR, XOR, NAND …)",
    "js_apdr_ch12_physics_shannon": "Shannon expansion: picks the A=1 or A=0 cofactor",
    "js_apdr_ch2_lab_nandcircuit_node": "Reads one part of a typed NAND circuit: an input, a constant or a nested NAND(x, y)",
}


def file_phrase(path):
    if path in FILES:
        return FILES[path]
    m = re.match(r"tests/(\w+)-ch(\w+)-physics\.test\.js$", path)
    if m:
        return f"the tests for the {m.group(1).upper()} Chapter {m.group(2)} formulas"
    if path.startswith("graphify-out/memory/"):
        return "a question saved from an earlier graph search"
    return path or "the project"


# Small helpers that appear in many files and always do the same job.
GENERIC = {
    "show": "redraws the stage with the current state",
    "queue": "asks the browser to redraw the stage on the next frame",
    "paint": "paints the stage canvas",
    "draw": "draws the stage picture",
    "text": "writes a line of text on the stage",
    "box": "draws a labelled box on the stage",
    "line": "draws a line on the stage",
    "arrow": "draws an arrow on the stage",
    "label": "writes a label on the stage",
    "colours": "reads the theme colours so the stage matches light or dark mode",
    "challenge": "builds one challenge card (prompt, options, answer, explanation)",
    "lock": "locks or unlocks the controls while a challenge is open",
    "mix": "shuffles a list (used to shuffle answer options)",
    "shuffle": "shuffles a list (used to shuffle answer options)",
    "rnd": "picks a random whole number",
    "pick": "picks the right answer plus distinct wrong ones for a generated question",
    "three": "picks the right answer plus two distinct wrong ones",
    "resize": "fits the stage to its box when the window changes size",
    "wrap": "breaks long text into lines that fit",
    "fit": "shrinks text until it fits",
    "set": "applies a chosen setting and redraws",
    "choose": "applies the option picked in a dropdown",
    "syncControls": "keeps the controls showing the current values",
    "register": "registers one experiment with the lab engine",
    "mount": "puts one experiment on the page and wires up its controls",
    "readForm": "reads the values from the experiment's controls",
    "read": "reads the values from the controls",
    "update": "recomputes and redraws after a change",
    "start": "resets to a starting state",
    "sandbox": "sets up the free-play sandbox",
    "setup": "prepares a challenge",
    "stage": "sets the stage for a challenge",
    "own": "reads a value you typed yourself",
    "ownMsg": "shows a message about what you typed",
    "say": "shows a short message",
    "tok": "splits typed text into tokens",
    "peek": "looks at the next token without using it",
    "calculate": "works out the result for the current inputs",
    "live": "recomputes the result as you type",
    "liveAction": "runs the experiment's calculation on every edit, instead of a button",
    "now": "works out the values for the current state",
    "fixScale": "chooses a scale for the gauges",
    "animate": "plays the reveal animation",
    "render": "draws the picture",
    "build": "builds the page element",
    "sup": "writes a number as superscript digits",
    "num": "formats a number without trailing zeros",
    "minus": "writes a proper minus sign",
    "X": "turns a model x-coordinate into a screen position",
    "Y": "turns a model y-coordinate into a screen position",
    "x": "turns a value into a horizontal screen position",
    "h": "creates a page element",
    "el": "creates a page element",
    "svg": "creates an SVG drawing element",
    "esc": "escapes text so it is safe to show",
    "main": "runs the tool from the command line",
    "fake": "a stand-in browser object for the tests",
    "context": "builds a fake browser for the tests",
    "fmt": "formats a number with its unit for display",
    "clamp": "keeps a value inside its allowed range",
    "nearest": "finds the object closest to the pointer",
    "grab": "starts dragging the object under the pointer",
    "endDrag": "finishes a drag",
    "pointerPx": "turns a pointer position into stage coordinates",
    "coords": "turns a pointer position into stage coordinates",
    "readouts": "updates the number readouts beside the stage",
    "rescale": "chooses new gauge scales",
    "snapshot": "stores the current values so later readouts can show ×2, ×½ …",
    "nice": "rounds a scale to a tidy number",
    "guessOn": "shows your guess on one of the gauges",
    "bindSlider": "connects a slider drawn on the stage to its value",
    "bindStagePointer": "lets you drag on the stage",
    "slider": "draws a slider on the stage",
    "point": "draws a point on the stage",
    "guess": "shows your prediction on the stage",
    "guessLine": "writes your prediction as a line on the stage",
    "end": "finishes a drag",
    "frame": "one frame of the animation",
    "glyph": "picks a random character for the decode effect",
    "flush": "ends the current piece of the formula",
    "decode": "turns a byte pattern back into text",
    "spec": "builds one challenge from a short description",
    "specs": "lists this experiment's challenges",
    "defaults": "fills in sensible starting values when the task changes",
    "bitsOf": "writes a number as a fixed number of bits",
    "signedText": "writes a signed number with a proper minus sign",
    "stageFor": "picks the right drawing for this experiment",
    "wire": "draws a wire between two gates",
    "hx": "writes a number in hexadecimal",
    "out": "writes the result line",
    "abs": "absolute value",
    "chosen": "applies the minterms picked in the dropdown",
    "prepare": "sets up a Karnaugh map whose cover is revealed step by step",
    "inCube": "tells whether a cell lies inside a K-map group",
    "cubeText": "writes a K-map group as a product such as AB′",
    "anfText": "writes ANF coefficients as a formula such as A ⊕ B",
    "boolABC": "reads a typed Boolean formula in A, B and C",
    "boolXY": "reads a typed Boolean formula in x and y",
    "delay": "reads a path delay typed in the hazard controls",
    "setLaw": "shows the identity chosen in the dropdown",
    "inputs": "sets the fixed inputs for a hazard challenge",
    "split": "shows the Shannon split view",
    "graph": "shows the OBDD view",
    "charge": "animates charge flowing onto the capacitors",
    "circuit": "draws the circuit",
    "today": "today's date as a day number",
    "step": "one step of the count-up animation",
    "bars": "draws the tick bars",
    "tickTip": "writes the tooltip for a tick bar",
    "reach": "finds how far into a subject you have got",
    "reroute": "redraws the route line",
    "go": "jumps to a semester",
    "groupOf": "finds the contents group a link belongs to",
    "idOf": "reads the section id a link points to",
    "href": "builds a link address",
    "chapterLabel": "writes a chapter's short name",
    "parse": "reads the address of the current page",
    "sync": "keeps the contents rail in step with the page",
    "open": "opens the list",
    "close": "closes the list",
    "place": "positions the tooltip next to its target",
    "hide": "hides the tooltip",
    "target": "finds the element the pointer is over",
    "pulse": "plays the small pulse along a concept-map line",
    "redraw": "redraws the concept-map lines",
    "apply": "applies the chosen settings to the page",
    "button": "builds one settings button",
    "head": "builds a section heading",
    "symbol": "highlights a symbol everywhere it appears in the section",
    "untrace": "removes the symbol highlight",
    "row": "one row of a truth table",
    "rows": "all rows of a truth table",
    "V": "shorthand for a truth value in the tests",
    "cube": "a K-map group used in the tests",
    "challenges": "the challenges checked by the test",
    "plate": "a plate-capacitor case used in the tests",
    "straight": "the straight-line route used in the tests",
    "detour": "the detour route used in the tests",
    "colors": "reads the theme colours",
    "distinct": "keeps only distinct options",
    "gap": "the gap between two drawn items",
    "nums": "reads a list of numbers",
    "option": "builds one dropdown option",
    "numOpts": "builds dropdown options from a list of numbers",
    "ch": "reads a typed character",
    "sub": "writes a subscript",
    "union": "the union of two sets",
    "count": "counts the members of a set",
    "even": "tells whether a number is even",
    "square": "squares a number",
    "list": "reads a typed list",
    "highlight": "highlights a truth-table row",
    "fill": "fills a shape to show a truth value",
    "shape": "draws a shape on the stage",
    "drawSlider": "draws a slider on the stage",
    "lineStage": "draws a number-line stage",
    "stepStage": "draws a step-by-step stage",
    "domainStage": "draws the domain picture",
    "setStage": "draws a set picture",
    "setCaption": "writes the caption under a set picture",
    "numberLine": "draws a number line",
    "lines": "draws several lines of text",
    "bit": "reads a value as a 0/1 bit",
    "at": "finds the value at a position",
    "move": "moves a dragged point",
    "rule": "reads the typed rule",
    "curve": "draws a curve",
    "sweep": "animates a sweep across the stage",
    "comp": "draws one field component",
    "arrowTo": "draws an arrow to a point",
    "arrowHead": "draws an arrowhead",
    "tick": "draws a tick mark",
    "signs": "draws the + and − signs on the plates",
    "cm": "turns metres into centimetres for display",
    "vec": "draws a vector arrow",
    "run": "runs the animation",
    "savedLayout": "reads the charge layout saved in this browser",
    "startWork": "starts measuring the work done while you move the probe",
    "sci": "writes a number in scientific notation",
    "digits": "the digits of a number in a given base",
    "columnsShown": "how many columns of the sum are revealed",
    "pairs": "groups bits in pairs or fours",
    "drawBits": "draws a row of bit cells",
    "experiment": "sets up an experiment",
    "charged": "the charge a capacitor holds when charged to 100 V",
    "resultText": "writes a result with up to eight significant digits",
    "cells": "reads the typed minterms or don't-cares",
    "boolean": "evaluates one gate (NOT, AND or OR)",
    "spacing": "the gap between neighbouring floating-point numbers, 2^(e−p+1)",
    "convert": "converts a number from one base to another",
    "n": "formats one interval endpoint",
    "intersect": "the intersection of two sets",
    "member": "tells whether a value belongs to a set",
    "product": "the Cartesian product of two sets",
    "quantifier": "evaluates “for all” or “there exists” over a set",
    "bernoulli": "checks Bernoulli's inequality (1 + x)^n ≥ 1 + nx",
    "composition": "composes two mappings, g after f",
    "discriminant": "the discriminant b² − 4ac of a quadratic",
    "mapping": "classifies a mapping as injective, surjective or bijective",
    "roots": "the real roots of a quadratic",
    "cover": "the smallest sum of products for a set of minterms",
    "interleave": "which memory module and row an address falls in",
    "cancellation": "the error left after subtracting two nearly equal numbers",
    "clear": "clears the highlighted row",
}

WORDS = {
    "kmap": "Karnaugh map", "anf": "algebraic normal form", "obdd": "ordered binary decision diagram", "nand": "NAND",
    "bcd": "BCD", "ieee": "IEEE", "eei": "EEI", "mei": "MEI", "apdr": "APDR", "tex": "LaTeX", "pdf": "PDF",
    "svg": "SVG", "hud": "heading", "ui": "interface", "dom": "page", "rpc": "call", "qs": "selector",
    "bits": "bits", "dist": "distance", "calc": "calculation", "cfg": "settings", "init": "set-up",
    "venn": "Venn diagram", "polar": "polar coordinates", "dipole": "dipole", "gauss": "Gauss surface",
}

VERBS = {
    "draw": "draws", "paint": "paints", "render": "draws", "show": "shows", "hide": "hides", "set": "sets",
    "get": "gets", "make": "makes", "build": "builds", "read": "reads", "parse": "reads", "update": "updates",
    "check": "checks", "is": "tells whether it is", "has": "tells whether it has", "to": "converts to",
    "calc": "works out", "compute": "works out", "count": "counts", "find": "finds", "fmt": "formats",
    "format": "formats", "sync": "keeps in step:", "gen": "makes a new", "generate": "makes a new",
    "on": "reacts to", "toggle": "switches", "fit": "fits", "add": "adds", "remove": "removes",
    "load": "loads", "save": "saves", "apply": "applies", "mount": "puts on the page:", "start": "starts",
    "stop": "stops", "open": "opens", "close": "closes", "bind": "connects", "decode": "decodes",
    "encode": "encodes", "convert": "converts", "split": "splits", "join": "joins", "fill": "fills",
    "pick": "picks", "choose": "chooses", "place": "places", "move": "moves", "drag": "drags",
    "reset": "resets", "clear": "clears", "run": "runs", "play": "plays", "reveal": "reveals",
    "preview": "previews", "test": "tests", "list": "lists", "label": "labels", "mark": "marks",
    "highlight": "highlights", "measure": "measures", "scale": "scales", "sort": "sorts", "track": "tracks",
    "enhance": "upgrades", "negate": "negates", "normalize": "normalises", "normalise": "normalises",
    "classify": "classifies", "minimize": "minimises", "simplify": "simplifies", "solve": "solves",
}


def words(name):
    name = re.sub(r"[()._]", " ", name)
    parts = re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+", name)
    return [WORDS.get(p.lower(), p.lower()) for p in parts]


def from_name(name, path):
    """A phrase built from a function name: experimentKmap -> sets up the Karnaugh map experiment."""
    bare = name.strip(".").replace("()", "")
    if bare == "__init__":
        return "sets up a new object of this kind"
    if bare in GENERIC:
        return GENERIC[bare]
    w = words(bare)
    if not w:
        return None
    if w[0] == "draw" and len(w) > 1:
        return f"draws the {' '.join(w[1:])} picture on the stage"
    if len(w) > 1 and w[-1] == "draw":
        return f"draws the {' '.join(w[:-1])} experiment's stage"
    if len(w) > 1 and w[-1] == "result":
        return f"works out the result shown for the {' '.join(w[:-1])} experiment"
    if w[0] == "experiment" and len(w) > 1:
        return f"sets up the {' '.join(w[1:])} experiment"
    if w[0] == "own" and len(w) > 1:
        return f"handles your own typed {' '.join(w[1:])}"
    if w[0] == "sync" and len(w) > 1:
        return f"keeps the {' '.join(w[1:])} up to date"
    if w[0] in VERBS and len(w) > 1:
        verb = VERBS[w[0]].rstrip(":")
        joiner = " " if w[0] in ("is", "has", "to", "gen", "generate") else " the "
        return f"{verb}{joiner}{' '.join(w[1:])}"
    if "physics" in path or path.endswith("expr.js"):
        return f"works out the {' '.join(w)}"
    if path.startswith("tests/"):
        return f"helper for the tests: {' '.join(w)}"
    return f"handles the {' '.join(w)}"


def comment_above(path, loc, cache={}):
    m = re.match(r"L(\d+)", loc or "")
    if not m or not path:
        return None
    if path not in cache:
        try:
            cache[path] = (ROOT / path).read_text(encoding="utf-8").split("\n")
        except OSError:
            cache[path] = None
    lines = cache[path]
    if not lines:
        return None
    i, out = int(m.group(1)) - 2, []
    while i >= 0 and re.match(r"\s*(//|\*|/\*|#)", lines[i]) and len(out) < 4:
        out.insert(0, lines[i])
        i -= 1
    text = " ".join(re.sub(r"^\s*(/\*+|\*+/?|//+|#+)\s*|\s*\*+/\s*$|-{3,}", " ", l) for l in out)
    text = re.sub(r"\s+", " ", text).strip(" -")
    return text[:220] if len(text) > 8 else None


def describe(n):
    label, path = n.get("label", ""), n.get("source_file") or ""
    where = file_phrase(path)
    kind, ftype = n.get("node_kind"), n.get("file_type")
    if n.get("id", "").startswith("ref_"):
        return f"An outside module the tests load: {label.replace('ref_node_', '').replace('ref_', '')}."
    if n.get("id") in OVERRIDES:
        line = re.match(r"L(\d+)", n.get("source_location") or "")
        return f"{OVERRIDES[n['id']]}. Part of {where}" + (f", line {line.group(1)}." if line else ".")
    if path and (label in (Path(path).name, path) or path.endswith("/" + label) or path.endswith(label)):
        return f"The file {path}: {where}."
    if ftype == "document" and kind == "heading":
        return f"A section titled “{label}” in {where}."
    if ftype == "document":
        return f"The document {path}: {where}."
    if ftype in ("concept", "rationale"):
        return f"An idea or decision recorded in {where}: “{label}”."
    if path.endswith((".yml", ".yaml")):
        return f"The setting “{label}” in {where}."
    if ftype == "image":
        return f"The picture {path}."
    parent = PARENTS.get(n.get("id"))
    note = comment_above(path, n.get("source_location"))
    what = from_name(label, path) if (n.get("_callable") or ftype == "code") else None
    if note and what and not what.startswith("handles the"):
        first = f"{what[0].upper()}{what[1:]}: {note[0].lower()}{note[1:]}"
    elif note:
        first = note[0].upper() + note[1:]
    elif what:
        first = what[0].upper() + what[1:]
    else:
        first = f"“{label}”"
    first = first.rstrip(".")
    line = re.match(r"L(\d+)", n.get("source_location") or "")
    inside = f" Used inside {parent}." if parent and not note else ""
    return f"{first}.{inside} Part of {where}" + (f", line {line.group(1)}." if line else ".")


PARENTS = {}


def find_parents(nodes):
    """Nested helpers have ids that extend their parent's id (js_eei_ch1_lab_fieldplayground_grab)."""
    by_id = {n["id"]: n for n in nodes}
    for n in nodes:
        parts = n["id"].split("_")
        for k in range(len(parts) - 1, 1, -1):
            pid = "_".join(parts[:k])
            p = by_id.get(pid)
            if p and p.get("_callable") and p.get("source_file") == n.get("source_file"):
                PARENTS[n["id"]] = p["label"]
                break


PATCH_MARK = "/* graph-describe notes */"


def patch_html(notes):
    page = OUT / "graph.html"
    html = page.read_text(encoding="utf-8")
    if PATCH_MARK in html:  # an earlier run's patch: drop it and apply the fresh notes
        html = re.sub(r"<script>/\* graph-describe notes \*/.*?</script>\n?", "", html, flags=re.S)
        html = html.replace("html += (window.NODE_NOTES && NODE_NOTES[nodeId] ? `<div class=\"field\" style=\"margin:4px 0 8px;line-height:1.45\">What it is: ${esc(NODE_NOTES[nodeId])}</div>` : '');\n  ", "")
    anchor = "html += `<div class=\"field\">Community:"
    if anchor not in html or "</body>" not in html:
        print("graph-describe: graph.html layout changed; notes written to node-notes.json but not shown on the page", file=sys.stderr)
        return False
    html = html.replace(anchor, "html += (window.NODE_NOTES && NODE_NOTES[nodeId] ? `<div class=\"field\" style=\"margin:4px 0 8px;line-height:1.45\">What it is: ${esc(NODE_NOTES[nodeId])}</div>` : '');\n  " + anchor, 1)
    data = json.dumps(notes, ensure_ascii=False).replace("</", "<\\/")
    script = (f"<script>{PATCH_MARK}\nwindow.NODE_NOTES = {data};\n"
              "nodesDS.update(Object.keys(NODE_NOTES).filter(id => nodesDS.get(id)).map(id => "
              "({ id: id, title: nodesDS.get(id).label + '\\n' + NODE_NOTES[id] })));\n</script>\n")
    html = html.replace("</body>", script + "</body>", 1)
    page.write_text(html, encoding="utf-8")
    return True


def main():
    graph = json.loads((OUT / "graph.json").read_text(encoding="utf-8"))
    find_parents(graph["nodes"])
    notes = {n["id"]: describe(n) for n in graph["nodes"]}
    (OUT / "node-notes.json").write_text(json.dumps(notes, ensure_ascii=False, indent=1), encoding="utf-8")
    shown = patch_html(notes)
    unknown = sorted({n.get("source_file") for n in graph["nodes"] if n.get("source_file") and file_phrase(n["source_file"]) == n["source_file"]})
    print(f"graph-describe: {len(notes)} node notes" + (", shown in graph.html" if shown else ""))
    if unknown:
        print("graph-describe: add a plain description to FILES for: " + ", ".join(unknown))


if __name__ == "__main__":
    main()
