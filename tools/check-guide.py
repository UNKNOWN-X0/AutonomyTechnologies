"""Check a study guide against GUIDE-STANDARD.md.

Usage: python3 -I tools/check-guide.py eei/ch1-electrostatic-fields.html [more guides...]
Prints every problem found and exits 1 if any errors remain. Warnings do not fail the check.
"""
import importlib.util
import os
import re
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("g2t", os.path.join(ROOT, "tools", "guide-to-tex.py"))
g2t = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g2t)
Node, Tree, find = g2t.Node, g2t.Tree, g2t.find

REQUIRED = ["cold-start", "plan", "route", "formula-map", "derivations", "explain", "practice", "exam", "checklist"]
MIN_PROBLEMS, MIN_EXPLAIN, MIN_EXAM, MIN_COLD = 20, 6, 2, 4


def all_nodes(node, pred):
    out = []
    for k in node.kids:
        if isinstance(k, Node):
            if pred(k):
                out.append(k)
            out.extend(all_nodes(k, pred))
    return out


def direct(node, tag):
    return [k for k in node.kids if isinstance(k, Node) and k.tag == tag]


def items(node):
    return direct(node, "li") if node else []


def answers_of(node):
    det = find(node, lambda n: n.tag == "details" and "answers" in n.cls)
    return items(find(det, lambda n: n.tag == "ol")) if det else None


class Report:
    def __init__(self, name):
        self.name, self.errors, self.warnings = name, [], []

    def err(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warnings.append(msg)


def check(path):
    rep = Report(os.path.relpath(path, ROOT))
    html = open(path, encoding="utf-8").read()
    t = Tree()
    t.feed(html)
    root = t.root
    page_dir = os.path.dirname(os.path.abspath(path))

    # --- files and naming
    rel = os.path.relpath(path, ROOT)
    m = re.fullmatch(r"([a-z]+)/ch(\d+)-[a-z0-9-]+\.html", rel)
    if not m:
        rep.err("file must live at <subject>/ch<N>-<topic>.html, got %s" % rel)
    stem = os.path.splitext(path)[0]

    # --- head and shell
    for need in ('<html lang="en">', 'name="viewport"', 'name="description"', "<title>"):
        if need not in html:
            rep.err("head is missing %s" % need)
    for asset in ("../css/system.css", "../css/guide.css", "../js/guide.js", "../js/tooltip.js"):
        if asset not in html:
            rep.err("page does not load %s" % asset)
    if re.search(r'<script[^>]+src="https?://', html) or "katex" in html.lower():
        rep.err("external scripts or KaTeX found; formulas must be plain HTML")
    body = find(root, lambda n: n.tag == "body")
    key = body.attrs.get("data-key", "") if body else ""
    if not body or not re.search(r"\bs-[a-z]+-\d\b", body.attrs.get("class", "")):
        rep.err('<body> needs a subject class such as class="s-eei-1"')
    if not re.fullmatch(r"[a-z]+\d-ch\d+", key):
        rep.err('<body data-key> must look like "eei1-ch1", got "%s"' % key)

    main = find(root, lambda n: n.tag == "main")
    head = find(main, lambda n: n.tag == "header" and "sign" in n.cls)
    for part in ("h1", "code", "course"):
        if not head or not find(head, lambda n: n.tag == part or part in n.cls):
            rep.err("sign header is missing its %s" % part)

    # --- sections and navigation
    sections = {s.attrs.get("id"): s for s in all_nodes(main, lambda n: n.tag == "section")}
    for sid in REQUIRED:
        if sid not in sections:
            rep.err("missing required section #%s" % sid)
    topic = [s for sid, s in sections.items() if sid and sid.startswith("sec-")]
    if not topic:
        rep.err("no topic sections (#sec-…) found")
    navs = all_nodes(root, lambda n: n.tag == "nav")
    if navs:
        lists = [o for o in all_nodes(navs[0], lambda n: n.tag == "ol")]
        targets = [[a.attrs.get("href") for a in all_nodes(o, lambda n: n.tag == "a")] for o in lists]
        if len(targets) == 2 and targets[0] != targets[1]:
            rep.err("the mobile and desktop contents lists differ")
        for href in set(sum(targets, [])):
            if href.startswith("#") and href[1:] not in sections:
                rep.err("contents link %s has no target" % href)
        linked = {h[1:] for h in sum(targets, []) if h.startswith("#")}
        for sid in list(sections):
            if sid and sid not in linked and sid not in ("cold-start", "route"):
                rep.warn("section #%s is not in the contents" % sid)

    # --- cold start
    cold = sections.get("cold-start")
    if cold:
        qs = items(find(cold, lambda n: n.tag == "ol"))
        ans = answers_of(cold)
        if len(qs) < MIN_COLD:
            rep.err("cold start has %d prompts, needs at least %d" % (len(qs), MIN_COLD))
        if ans is None or len(ans) != len(qs):
            rep.err("cold start needs a hidden answer for every prompt")

    # --- topic sections
    numbers = {}
    for s in topic:
        h2 = find(s, lambda n: n.tag == "h2")
        title = h2.text().strip() if h2 else s.attrs.get("id")
        mnum = re.match(r"(\d+\.\d+)\s", title)
        if not mnum:
            rep.err("topic heading must start with its number: %r" % title)
        else:
            numbers[mnum.group(1)] = s
        recall = [k for k in s.kids if isinstance(k, Node) and "recall" in k.cls]
        has_content = len(s.text()) > 900
        if not recall and has_content:
            rep.err("%s has no recall check" % title)
        for r in recall:
            qs = items(find(r, lambda n: n.tag == "ol"))
            ans = answers_of(r)
            if len(qs) < 2:
                rep.err("%s: recall check needs at least 2 questions" % title)
            if ans is None or len(ans) != len(qs):
                rep.err("%s: recall check answers (%s) do not match questions (%d)" % (title, None if ans is None else len(ans), len(qs)))
            if s.kids and [k for k in s.kids if isinstance(k, Node)][-1] is not r:
                rep.warn("%s: recall check should be the last block of the section" % title)
        if not all_nodes(s, lambda n: "eq" in n.cls or "tw" in n.cls) and has_content:
            rep.warn("%s has no formula card" % title)
        for eq in all_nodes(s, lambda n: "eq" in n.cls):
            if not find(eq, lambda n: "formula" in n.cls):
                rep.err("%s: formula card without a .formula" % title)

    # --- practice
    prac = sections.get("practice")
    probs = items(find(prac, lambda n: n.tag == "ol" and "problems" in n.cls)) if prac else []
    if prac:
        ans = answers_of(prac) or []
        if len(probs) < MIN_PROBLEMS:
            rep.err("practice has %d problems, needs at least %d" % (len(probs), MIN_PROBLEMS))
        if len(ans) != len(probs):
            rep.err("practice has %d problems but %d answers" % (len(probs), len(ans)))
        if str(len(probs)) not in prac.text():
            rep.warn("the practice intro does not state the problem count (%d)" % len(probs))
        refs = []
        for i, a in enumerate(ans, 1):
            ref = find(a, lambda n: "sec-ref" in n.cls)
            if not ref:
                rep.err("practice answer %d has no section reference" % i)
                refs.append(set())
                continue
            nums = set(re.findall(r"\d+\.\d+", ref.text()))
            for n in nums:
                if n not in numbers:
                    rep.err("practice answer %d points to unknown section %s" % (i, n))
            refs.append(nums)
        run = 1
        for i in range(1, len(refs)):
            run = run + 1 if refs[i] and refs[i] & refs[i - 1] else 1
            if run > 2:
                rep.err("practice problems %d–%d all come from §%s; interleave them" % (i - 1, i + 1, "/".join(sorted(refs[i]))))
        covered = set().union(*refs) if refs else set()
        for n in numbers:
            if n not in covered:
                rep.warn("no practice problem exercises §%s" % n)

    # --- explain, exam, derivations
    exp = sections.get("explain")
    if exp:
        qs = items(find(exp, lambda n: n.tag == "ol"))
        ans = answers_of(exp)
        if len(qs) < MIN_EXPLAIN:
            rep.err("explain has %d questions, needs at least %d" % (len(qs), MIN_EXPLAIN))
        if ans is None or len(ans) != len(qs):
            rep.err("every explain question needs a model answer")
    exam = sections.get("exam")
    if exam:
        heads = direct(exam, "h3")
        if len(heads) < MIN_EXAM:
            rep.err("exam has %d problems, needs at least %d" % (len(heads), MIN_EXAM))
        lists = [k for k in exam.kids if isinstance(k, Node) and k.tag == "ol"]
        dets = [k for k in exam.kids if isinstance(k, Node) and k.tag == "details"]
        if len(lists) != len(dets):
            rep.err("each exam problem needs its own worked answer")
        for ol, det in zip(lists, dets):
            if len(items(ol)) != len(items(find(det, lambda n: n.tag == "ol"))):
                rep.err("an exam problem's parts and answers do not match")
    der = sections.get("derivations")
    if der:
        for li in items(find(der, lambda n: n.tag == "ol")):
            if not find(li, lambda n: "sec-ref" in n.cls):
                rep.err("derivation %r lacks a section reference" % li.text()[:40])

    # --- checklist and hub
    boxes = all_nodes(sections.get("checklist", Node("x", {})), lambda n: n.tag == "input")
    keys = [b.attrs.get("data-k") for b in boxes]
    if len(keys) != len(set(keys)) or None in keys:
        rep.err("checklist data-k values must be present and unique")
    for li in all_nodes(sections.get("checklist", Node("x", {})), lambda n: n.tag == "li" and "check" in n.cls):
        nums = re.findall(r"\((\d+(?:, \d+)*)\)", li.text())
        for group in nums:
            for n in group.split(", "):
                if int(n) > len(probs):
                    rep.err("checklist item points to practice problem %s, which does not exist" % n)
    lab_path = stem + "-lab.html"
    lab_count = check_lab(lab_path, key, rep) if os.path.exists(lab_path) else 0
    hub = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    entry = re.search(r'<li class="chapter" data-key="%s" data-total="(\d+)"[^>]*>(.*?)</li>' % re.escape(key), hub, re.S)
    if not entry:
        rep.err("index.html has no chapter entry with data-key=%s" % key)
    else:
        want = len(boxes) + lab_count
        if int(entry.group(1)) != want:
            rep.err("index.html data-total is %s but the checklist has %d items and the lab %d experiments (%d)" % (entry.group(1), len(boxes), lab_count, want))
        dl = re.search(r'data-key="%s"[^>]*data-lab="(\d+)"' % re.escape(key), hub)
        if lab_count and (not dl or int(dl.group(1)) != lab_count):
            rep.err("index.html chapter entry needs data-lab=\"%d\" (lab experiments)" % lab_count)
        if lab_count and 'href="%s"' % os.path.relpath(lab_path, ROOT) not in entry.group(2):
            rep.err("index.html chapter entry does not link to the lab")
        if 'href="%s"' % rel not in entry.group(2):
            rep.err("index.html chapter entry does not link to %s" % rel)

    # --- links and downloads
    for a in all_nodes(root, lambda n: n.tag in ("a", "link", "script")):
        ref = a.attrs.get("href") or a.attrs.get("src")
        if not ref or re.match(r"(https?:|data:|#|mailto:)", ref):
            continue
        target = os.path.normpath(os.path.join(page_dir, ref.split("#")[0]))
        if not os.path.exists(target):
            rep.err("broken local link: %s" % ref)
    base = os.path.basename(stem)
    for ext in (".pdf", ".tex"):
        if 'href="%s%s"' % (base, ext) not in html:
            rep.err("download link to %s%s missing" % (base, ext))
    tex, pdf = stem + ".tex", stem + ".pdf"
    if os.path.exists(tex):
        with tempfile.TemporaryDirectory() as d:
            fresh = os.path.join(d, "fresh.tex")
            g2t.main(path, fresh)
            if open(fresh, encoding="utf-8").read() != open(tex, encoding="utf-8").read():
                rep.err("%s is stale: regenerate it with tools/guide-to-tex.py" % os.path.relpath(tex, ROOT))
    if os.path.exists(pdf) and os.path.exists(tex) and os.path.getmtime(pdf) < os.path.getmtime(tex) - 1:
        rep.err("%s is older than its .tex: rebuild the PDF" % os.path.relpath(pdf, ROOT))

    if not find(main, lambda n: "source-note" in n.cls):
        rep.err("missing the source note (personal material, not an official FAU publication)")
    if not sections.get("slips"):
        rep.warn("no #slips section; add one only if you found verified slips in the notes")
    return rep


def check_lab(path, key, rep):
    """Labs (GUIDE-STANDARD.md, Labs): same key as the guide, the shared engine, one section per experiment."""
    html = open(path, encoding="utf-8").read()
    t = Tree()
    t.feed(html)
    body = find(t.root, lambda n: n.tag == "body")
    name = os.path.relpath(path, ROOT)
    if not body or body.attrs.get("data-key") != key:
        rep.err("%s must share the guide's data-key %s" % (name, key))
    if body and body.attrs.get("data-guide") != os.path.basename(path).replace("-lab.html", ".html"):
        rep.err("%s needs data-guide pointing at its guide" % name)
    for asset in ("../css/lab.css", "../js/lab.js", "../js/tooltip.js"):
        if asset not in html:
            rep.err("%s does not load %s" % (name, asset))
    exps = all_nodes(t.root, lambda n: n.tag == "section" and "experiment" in n.cls)
    if not exps:
        rep.err("%s has no experiment sections" % name)
    for x in exps:
        sid = x.attrs.get("id", "")
        if not sid.startswith("exp-") or not x.attrs.get("data-experiment"):
            rep.err("%s: experiment needs id exp-<name> and data-experiment" % name)
        for part in ("challenge", "stage", "controls"):
            if not find(x, lambda n, p=part: p in n.cls):
                rep.err("%s: #%s has no .%s" % (name, sid, part))
    if not find(t.root, lambda n: n.attrs.get("id") == "lab-results"):
        rep.err("%s has no #lab-results" % name)
    guide = open(path.replace("-lab.html", ".html"), encoding="utf-8").read()
    for x in exps:
        if "#%s" % x.attrs.get("id") not in guide:
            rep.warn("no guide section links to the lab's #%s" % x.attrs.get("id"))
    return len(exps)


def main(paths):
    failed = False
    for p in paths:
        rep = check(p)
        print("%s: %d errors, %d warnings" % (rep.name, len(rep.errors), len(rep.warnings)))
        for e in rep.errors:
            print("  error   " + e)
        for w in rep.warnings:
            print("  warning " + w)
        failed |= bool(rep.errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or [os.path.join(ROOT, p) for p in []]))
