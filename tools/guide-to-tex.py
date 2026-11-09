"""Convert a study guide (its <main>) into a standalone LaTeX file.

Usage: python3 -I tools/guide-to-tex.py eei/ch1-electrostatic-fields.html eei/ch1-electrostatic-fields.tex
Then build the PDF with: latexmk -xelatex <file>.tex (needs TeX Live with the New Computer Modern fonts).
The title, course line and subject code come from the page header.
Answers inside <details class="answers"> are moved to an answer section at the end.
"""
import re
import sys
from html.parser import HTMLParser

VOID = {"meta", "link", "input", "br", "img", "path", "circle", "rect"}


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

    @property
    def cls(self):
        return (self.attrs.get("class") or "").split()

    def text(self):
        return "".join(k if isinstance(k, str) else k.text() for k in self.kids)


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.cur = Node("root", {})

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.kids.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def find(node, pred):
    for k in node.kids:
        if isinstance(k, Node):
            if pred(k):
                return k
            r = find(k, pred)
            if r:
                return r


# ---------- text mode ----------
TEXT_SPECIAL = {"&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_",
                "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
                "\\": r"\textbackslash{}"}
TEXT_MATH = {"⊕": r"\oplus", "∘": r"\circ", "↦": r"\mapsto", "∂": r"\partial", "∫": r"\int", "∮": r"\oint", "∯": r"\oiint", "∬": r"\iint", "∭": r"\iiint",
             "≈": r"\approx", "∝": r"\propto", "≪": r"\ll", "≤": r"\leq", "≥": r"\geq",
             "→": r"\to", "≠": r"\neq", "±": r"\pm", "∓": r"\mp", "·": r"\cdot",
             "×": r"\times", "−": "-", "√": r"\surd", "∞": r"\infty", "Σ": r"\Sigma",
             "½": r"\tfrac12", "¬": r"\neg", "∧": r"\land", "∨": r"\lor",
             "⇒": r"\Rightarrow", "⇔": r"\Leftrightarrow", "∀": r"\forall", "∃": r"\exists",
             "∈": r"\in", "∉": r"\notin", "⊂": r"\subset", "⊆": r"\subseteq", "⊊": r"\subsetneq",
             "∪": r"\cup", "∩": r"\cap", "∅": r"\emptyset", "ℕ": r"\mathbb{N}",
             "ℤ": r"\mathbb{Z}", "ℚ": r"\mathbb{Q}", "ℝ": r"\mathbb{R}", "ℂ": r"\mathbb{C}",
             "𝒫": r"\mathcal{P}", "ᶜ": r"^{c}", "<": "<", ">": ">"}


def tex_text(s):
    s = s.replace("\u00a0", "~")
    out = []
    for ch in s:
        if ch in TEXT_SPECIAL and ch != "~":
            out.append(TEXT_SPECIAL[ch])
        elif ch in TEXT_MATH:
            out.append(r"\ensuremath{%s}" % TEXT_MATH[ch])
        else:
            out.append(ch)
    return re.sub(r"\s+", " ", "".join(out))


def inline(node):
    out = []
    for k in node.kids:
        if isinstance(k, str):
            out.append(tex_text(k))
            continue
        t, c = k.tag, k.cls
        if t == "var":
            out.append(r"\textit{%s}" % inline(k))
        elif t == "sub":
            out.append(r"\textsubscript{%s}" % inline(k))
        elif t == "sup":
            out.append(r"\textsuperscript{%s}" % inline(k))
        elif t in ("strong", "b"):
            out.append(r"\textbf{%s}" % inline(k))
        elif t == "em":
            out.append(r"\emph{%s}" % inline(k))
        elif t == "span" and "op" in c:
            out.append("$%s$" % big_op(k))
        elif t == "span" and "frac" in c:
            num, den = [x for x in k.kids if isinstance(x, Node)]
            out.append(r"(%s)/(%s)" % (inline(num), inline(den)))
        elif t == "span" and "sec-ref" in c:
            out.append(r"\hfill{\small\color{FAUblue}%s}" % inline(k))
        elif t == "span" and "say" in c:
            out.append(r"\emph{%s}\par " % inline(k))
        elif t == "input":
            out.append(r"$\mdlgwhtsquare$\ ")
        else:
            out.append(inline(k))
    return "".join(out)


# ---------- math mode (formula spans) ----------
MATH_MAP = {"−": "-", "∘": r"\circ ", "↦": r"\mapsto ", "·": r"\cdot ", "×": r"\times ", "≈": r"\approx ", "½": r"\tfrac{1}{2}",
            "Σ": r"\sum", "→": r"\to ", "∝": r"\propto ", "≪": r"\ll ", "√": r"\sqrt",
            "∞": r"\infty ", "≥": r"\geq ", "≤": r"\leq ", "±": r"\pm ", "∓": r"\mp ",
            "¬": r"\neg ", "∧": r"\land ", "∨": r"\lor ", "⇒": r"\Rightarrow ", "⇔": r"\Leftrightarrow ",
            "∀": r"\forall ", "∃": r"\exists ", "∈": r"\in ", "∉": r"\notin ", "⊂": r"\subset ", "⊊": r"\subsetneq ",
            "∪": r"\cup ", "∩": r"\cap ", "∅": r"\emptyset ", "ℕ": r"\mathbb{N}", "ℤ": r"\mathbb{Z}",
            "ℚ": r"\mathbb{Q}", "ℝ": r"\mathbb{R}", "ℂ": r"\mathbb{C}", "𝒫": r"\mathcal{P}", "ᶜ": r"^{c}",
            "{": r"\{", "}": r"\}", "%": r"\%", "&": r"\&", "#": r"\#"}


OPERATOR_NAMES = {"sin", "cos", "tan", "ln", "log", "exp", "arcsin", "arccos", "arctan"}


def grow_delims(s):
    """Brackets that enclose a stacked fraction grow to fit it (\\left( … \\right)); others stay as written."""
    out, stack, i = list(s), [], 0
    while i < len(s):
        if s[i] == "\\":
            i += 2
            continue
        if s[i] in "([":
            stack.append(i)
        elif s[i] in ")]" and stack:
            j = stack.pop()
            if "([".index(s[j]) == ")]".index(s[i]) and "\\dfrac" in s[j:i]:
                out[j] = r"\left" + s[j]
                out[i] = r"\right" + s[i]
        i += 1
    return "".join(out)


def math_text(s):
    s = s.replace("\u00a0", "\x00")
    parts = re.split(r"([A-Za-z]+|\x00+| +)", s)
    out = []
    for p in parts:
        if not p:
            continue
        if p[0] == "\x00":
            out.append(r"\quad ")
        elif p[0] == " ":
            out.append(r"\, ")
        elif re.fullmatch(r"[A-Za-z]+", p):
            out.append("\\%s " % p if p in OPERATOR_NAMES else r"\text{%s}" % p if len(p) > 1 else r"\mathrm{%s}" % p)
        else:
            out.append("".join(MATH_MAP.get(ch, ch) for ch in p))
    return "".join(out)


def math(node):
    out = []
    for k in node.kids:
        if isinstance(k, str):
            out.append(math_text(k))
            continue
        t, c = k.tag, k.cls
        if t == "var":
            out.append("{" + var_math(k) + "}")
        elif t == "sub":
            out.append("_{%s}" % math(k))
        elif t == "sup":
            out.append("^{%s}" % math(k))
        elif t == "span" and "op" in c:
            out.append(big_op(k))
        elif t == "span" and "frac" in c:
            num, den = [x for x in k.kids if isinstance(x, Node)]
            out.append(r"\dfrac{%s}{%s}" % (math(num), math(den)))
        else:
            out.append(math(k))
    return "".join(out)


BIG_OPS = {"Σ": r"\sum", "∑": r"\sum", "Π": r"\prod", "∏": r"\prod", "∫": r"\int", "∮": r"\oint", "∬": r"\iint", "∯": r"\oiint", "∪": r"\bigcup", "∩": r"\bigcap", "⋃": r"\bigcup", "⋂": r"\bigcap"}


def big_op(node):
    """A <span class="op"> sum, product or integral: the sign with its <sub> and <sup> limits."""
    parts = {x.tag: x for x in node.kids if isinstance(x, Node)}
    s = BIG_OPS[parts["span"].text().strip()]
    if "sub" in parts:
        s += "_{%s}" % math(parts["sub"])
    if "sup" in parts:
        s += "^{%s}" % math(parts["sup"])
    return s + " "


def var_math(node):
    """Variables: letters stay italic, spaces become thin spaces."""
    out = []
    for k in node.kids:
        if isinstance(k, str):
            out.append(re.sub(r" +", r"\\,", k))
        else:
            out.append(math_wrap(k))
    return "".join(out)


def math_wrap(k):
    tmp = Node("span", {}, None)
    tmp.kids = [k]
    return math(tmp)


# ---------- arrow diagrams (figure.amap) ----------
def amap_data(f):
    """Sets and arrows from data-sets="X: 1, 2 | Y: a, b" and data-map="1>a 2>b | …" (one group per gap)."""
    sets = []
    for part in f.attrs.get("data-sets", "").split("|"):
        name, _, items = part.partition(":")
        sets.append((name.strip(), [x.strip() for x in items.split(",") if x.strip()]))
    maps = [[tuple(p.split(">", 1)) for p in g.split() if ">" in p] for g in f.attrs.get("data-map", "").split("|")]
    return sets, maps


def amap_label(s):
    return "$%s$" % s if re.fullmatch(r"[A-Za-z0-9−+′'.]{1,4}", s) else tex_text(s)


def amap_tikz(f):
    sets, maps = amap_data(f)
    rev = "data-rev" in f.attrs
    ROW, BW, GAP = 0.5, 0.8, 1.3
    out = [r"\begin{tikzpicture}[x=1cm,y=1cm,font=\small]"]
    pos = {}
    for si, (name, items) in enumerate(sets):
        x0 = si * (BW + GAP)
        hits = {}
        if si > 0 and si - 1 < len(maps):
            for a, b in maps[si - 1]:
                hits[b] = hits.get(b, 0) + 1
        outs = {}
        if si < len(maps):
            for a, b in maps[si]:
                outs[a] = outs.get(a, 0) + 1
        out.append(r"\draw[FAUblue!60] (%.2f,0.3) rectangle (%.2f,%.2f);" % (x0, x0 + BW, -(len(items) - 1) * ROW - 0.3))
        out.append(r"\node[above] at (%.2f,0.3) {%s};" % (x0 + BW / 2, amap_label(name)))
        for r_, it in enumerate(items):
            y = -r_ * ROW
            pos[(si, it)] = (x0, x0 + BW, y)
            style = ""
            if si > 0 and hits.get(it, 0) == 0:
                style = "text=black!40"
            elif hits.get(it, 0) > 1 or (si == 0 and si < len(maps) and outs.get(it, 0) != 1):
                style = "text=FAUblue,font=\\small\\bfseries"
            out.append(r"\node[%s] at (%.2f,%.2f) {%s};" % (style, x0 + BW / 2, y, amap_label(it)))
    for gi, group in enumerate(maps):
        for a, b in group:
            if (gi, a) not in pos or (gi + 1, b) not in pos:
                continue
            ya, yb = pos[(gi, a)][2], pos[(gi + 1, b)][2]
            x1, x2 = pos[(gi, a)][1] + 0.08, pos[(gi + 1, b)][0] - 0.08
            if rev:
                x1, x2, ya, yb = x2, x1, yb, ya
            out.append(r"\draw[-{Stealth[length=4pt]},black!75] (%.2f,%.2f) -- (%.2f,%.2f);" % (x1, ya, x2, yb))
    out.append(r"\end{tikzpicture}")
    return "\n".join(out)


# ---------- picture diagrams (figure.viz) ----------
# Same coordinates as the page renderer in js/guide.js (units of about 0.018 cm, y downwards there, upwards here).
VS = 0.018


def P(x, y):
    return "(%.3f,%.3f)" % (x * VS, -y * VS)


def T(x, y, s, size=r"\small", anchor="", italic=False, color="", halo=False):
    # "e_z" or "e_{ρ0}" sets the part after _ as a subscript, as the page does; a halo is a white backing that keeps
    # a label legible where it has to cross a line
    bits = re.split(r"_(\{[^}]+\}|[^\s_,{])", s)
    body = "".join(r"\textsubscript{%s}" % tex_text(b.strip("{}")) if i % 2 else tex_text(b) for i, b in enumerate(bits))
    if italic:
        body = r"\textit{%s}" % body
    opts = ",".join(o for o in (anchor, ("text=" + color) if color else "",
                                "fill=white,fill opacity=0.85,text opacity=1" if halo else "") if o)
    return r"\node[%s,inner sep=1pt,font=%s] at %s {%s};" % (opts, size, P(x, y), body)


def arrow_t(x1, y1, x2, y2, style="black!80"):
    return r"\draw[-{Stealth[length=4pt]},%s] %s -- %s;" % (style, P(x1, y1), P(x2, y2))


def dipole_lines(A, B):
    """Same tracing as DIPOLE_LINES in js/guide.js: 12 lines from +q, unit steps of 3 along E."""
    import math
    out = []
    for k in range(12):
        t = k * math.pi * 2 / 12 + math.pi / 12
        x, y = A[0] + 14 * math.cos(t), A[1] + 14 * math.sin(t)
        pts = [(x, y)]
        for _ in range(220):
            ax, ay, bx, by = x - A[0], y - A[1], x - B[0], y - B[1]
            ra, rb = (ax * ax + ay * ay) ** 1.5, (bx * bx + by * by) ** 1.5
            ex, ey = ax / ra - bx / rb, ay / ra - by / rb
            L = math.hypot(ex, ey)
            x += 3 * ex / L
            y += 3 * ey / L
            pts.append((x, y))
            if math.hypot(x - B[0], y - B[1]) < 13 or x < 4 or x > 256 or y < 4 or y > 176:
                break
        out.append(pts)
    return out


def smooth(pts):
    """A sampled curve as TikZ path text: four or more points become a smooth plot through every point (the page
    draws the same points as a Catmull-Rom curve); fewer stay straight segments."""
    if len(pts) < 4:
        return " -- ".join(P(x, y) for x, y in pts)
    return "plot[smooth,tension=0.5] coordinates {%s}" % " ".join(P(x, y) for x, y in pts)


def viz_tikz(f):
    import math
    a = f.attrs
    kind, _, sub = a.get("data-kind", "").partition(" ")
    out = [r"\begin{tikzpicture}[line join=round]"]
    if kind == "venn":
        shade = a.get("data-shade", "inter")
        A, B, R = (78, 68), (122, 68), 44
        circ = lambda c: r"%s circle (%.3f)" % (P(*c), R * VS)
        U = r"%s rectangle %s" % (P(4, 4), P(196, 126))
        if shade == "comp":
            out += [r"\fill[FAUblue!25] %s;" % U, r"\fill[white] %s;" % circ(A)]
        if shade in ("union", "a", "diff"):
            out.append(r"\fill[FAUblue!25] %s;" % circ(A))
        if shade in ("union", "b"):
            out.append(r"\fill[FAUblue!25] %s;" % circ(B))
        if shade == "diff":
            out.append(r"\fill[white] %s;" % circ(B))
        if shade == "inter":
            out.append(r"\begin{scope}\clip %s; \fill[FAUblue!25] %s; \end{scope}" % (circ(A), circ(B)))
        if shade in ("nor", "nand", "imp"):
            out.append(r"\fill[FAUblue!25] %s;" % U)
        if shade == "nor":
            out += [r"\fill[white] %s;" % circ(A), r"\fill[white] %s;" % circ(B)]
        if shade == "nand":
            out.append(r"\begin{scope}\clip %s; \fill[white] %s; \end{scope}" % (circ(A), circ(B)))
        if shade == "imp":
            out += [r"\fill[white] %s;" % circ(A), r"\fill[FAUblue!25] %s;" % circ(B)]
        out += [r"\draw[black!70] %s;" % U, r"\draw[black!80] %s;" % circ(A), r"\draw[black!80] %s;" % circ(B)]
        L = (a.get("data-labels") or "A B X").split(" ")
        out += [T(28, 32, L[0], italic=True), T(172, 32, L[1], italic=True)]
        if len(L) > 2:
            out.append(T(12, 116, L[2], r"\footnotesize", "anchor=west", True))
    elif kind == "numline":
        lo, hi = [float(v) for v in a["data-range"].split()]
        X0, X1, Y = 24, 256, 34
        x = lambda v: X0 + (v - lo) / (hi - lo) * (X1 - X0)
        out.append(arrow_t(X0 - 14, Y, X1 + 16, Y))
        for t in (a.get("data-ticks") or "").split():
            v, _, lab = t.partition(":")
            out.append(r"\draw[black!80] %s -- %s;" % (P(x(float(v)), Y - 5), P(x(float(v)), Y + 5)))
            if lab != "_":  # "v:_" is an unlabelled tick
                out.append(T(x(float(v)), Y + 22, lab or v, r"\footnotesize"))
        if a.get("data-seg"):
            g = a["data-seg"].split()
            pa = X0 - 12 if g[0] == "-inf" else x(float(g[0]))
            pb = X1 + 12 if g[1] == "inf" else x(float(g[1]))
            out.append(r"\draw[FAUblue,line width=2.2pt] %s -- %s;" % (P(pa, Y), P(pb, Y)))
            for val, px, end in ((g[0], pa, g[2][0]), (g[1], pb, g[2][1])):
                if "inf" in val:
                    continue
                fill = "FAUblue" if end == "c" else "white"
                out.append(r"\filldraw[draw=FAUblue,fill=%s,line width=1pt] %s circle (%.3f);" % (fill, P(px, Y), 5 * VS))
        for m in (a.get("data-marks") or "").split(";"):
            if m:
                v, _, lab = m.partition(":")
                out.append(T(x(float(v)), Y - 12, lab, r"\footnotesize", "", False, "FAUblue"))
    elif kind == "bits":
        U, X = 26, 4
        for c in a["data-cells"].split(";"):
            f4 = (c.split("|") + ["", "", "", ""])[:4]
            w = (float(f4[2]) if f4[2] else 1) * U
            hot = f4[0].startswith("*")
            v = f4[0][1:] if hot else f4[0]
            if f4[3]:
                out.append(T(X + w / 2, 14, f4[3], r"\scriptsize"))
            out.append(r"\filldraw[draw=black!50,fill=%s] %s rectangle %s;" % ("FAUblue!25" if hot else "Paperblue", P(X, 20), P(X + w, 50)))
            out.append(T(X + w / 2, 35, v, r"\small"))
            if f4[1]:
                out.append(T(X + w / 2, 66, f4[1], r"\scriptsize"))
            X += w
    elif kind == "circle":
        ang = math.radians(float(a.get("data-angle") or 40))
        R, cx, cy = 62, 84, 84
        px, py = cx + R * math.cos(ang), cy - R * math.sin(ang)
        L = (a.get("data-labels") or "cos φ|sin φ|1").split("|")
        out += [arrow_t(cx - 76, cy, cx + 82, cy), arrow_t(cx, cy + 74, cx, cy - 80),
                r"\draw[black!80] %s circle (%.3f);" % (P(cx, cy), R * VS),
                r"\draw[black!60,dashed] %s -- %s;" % (P(px, py), P(px, cy)),
                r"\draw[FAUblue,line width=2pt] %s -- %s;" % (P(cx, cy), P(px, cy)),
                r"\draw[black!85,line width=1pt] %s -- %s;" % (P(cx, cy), P(px, py)),
                r"\draw[black!80] %s arc (0:%.1f:%.3f);" % (P(cx + 20, cy), math.degrees(ang), 20 * VS),
                r"\fill[FAUblue] %s circle (%.3f);" % (P(px, py), 4 * VS),
                T(cx + 28 * math.cos(ang / 2) + 6, cy - 28 * math.sin(ang / 2) + 2, L[3] if len(L) > 3 else "φ", r"\footnotesize", "", True),
                T(cx + 4, cy + 14, L[0], r"\footnotesize", "anchor=west", False, "FAUblue", True),
                T(cx + math.sqrt(R * R - ((cy - py) / 2) ** 2) + 5, (cy + py) / 2, L[1], r"\footnotesize", "anchor=west"),
                T((cx + px) / 2 - 10, (cy + py) / 2 - 8, L[2], r"\footnotesize", "anchor=east", True),
                T(px + 8, py - 8, "P", r"\small", "anchor=west", True)]
    elif kind == "shape":
        if sub == "cylinder":
            out += [r"\filldraw[draw=black!50,fill=Paperblue] %s rectangle %s;" % (P(48, 34), P(132, 112)),
                    r"\draw[black!80] %s ellipse [x radius=%.3f,y radius=%.3f];" % (P(90, 34), 42 * VS, 14 * VS),
                    r"\draw[black!80] %s ellipse [x radius=%.3f,y radius=%.3f];" % (P(90, 112), 42 * VS, 14 * VS),
                    r"\draw[black!80] %s -- %s;" % (P(48, 34), P(48, 112)),
                    r"\draw[black!80] %s -- %s;" % (P(132, 34), P(132, 112)),
                    arrow_t(90, 24, 90, 5, "FAUblue,line width=1.5pt"),
                    arrow_t(132, 68, 160, 68, "FAUblue,line width=1.5pt"),
                    arrow_t(90, 126, 90, 151, "FAUblue,line width=1.5pt"),
                    T(100, 10, "+e_z", r"\footnotesize", "anchor=west", True, "FAUblue"),
                    T(168, 68, "+e_ρ", r"\footnotesize", "anchor=west", True, "FAUblue"),
                    T(100, 154, "−e_z", r"\footnotesize", "anchor=west", True, "FAUblue")]
        elif sub == "hemisphere":
            out += [r"\filldraw[draw=black!70,fill=Paperblue] %s ellipse [x radius=%.3f,y radius=%.3f];" % (P(120, 108), 56 * VS, 15 * VS),
                    r"\filldraw[draw=black!80,fill=FAUblue!25] %s .. controls %s and %s .. %s -- cycle;" % (P(64, 108), P(64, 42), P(176, 42), P(176, 108)),
                    r"\draw[black!80,line width=1.2pt] %s .. controls %s and %s .. %s;" % (P(64, 108), P(64, 42), P(176, 42), P(176, 108)),
                    r"\draw[black!55,dashed] %s -- %s;" % (P(120, 108), P(120, 51)),
                    r"\fill[FAUblue] %s circle (%.3f);" % (P(120, 108), 3 * VS),
                    T(125, 80, "a", r"\small", "anchor=west", True, "FAUblue"),
                    r"\draw[black!80] %s -- %s;" % (P(36, 49), P(73, 69)),
                    T(5, 38, "curved surface", r"\footnotesize", "anchor=west"),
                    r"\draw[black!80] %s -- %s;" % (P(174, 124), P(198, 139)),
                    T(202, 144, "base disk", r"\footnotesize", "anchor=west")]
        elif sub == "loop":
            cx, cy, rad = 78, 92, 48
            out += [r"\draw[black!80] %s circle (%.3f);" % (P(cx, cy), rad * VS),
                    arrow_t(100, 36, 70, 36, "FAUblue,line width=1.5pt"),
                    T(80, 22, "increasing φ", r"\footnotesize", "", False, "FAUblue"),
                    r"\draw[black!85,line width=1pt] %s -- %s;" % (P(cx, cy), P(cx + rad, cy)),
                    T((cx + cx + rad) / 2, cy - 7, "b", r"\footnotesize", "", True),
                    r"\fill[FAUblue] %s circle (%.3f);" % (P(cx + rad, cy), 4 * VS),
                    arrow_t(cx + rad, cy - 7, cx + rad, cy - 35, "FAUblue,line width=1.5pt"),
                    arrow_t(cx + rad + 5, cy, cx + rad + 34, cy),
                    T(cx + rad + 12, cy - 28, "e_φ, ds", r"\footnotesize", "anchor=west", True, "FAUblue"),
                    T(cx + rad + 38, cy, "e_ρ = e_x", r"\footnotesize", "anchor=west", True),
                    T(cx + rad + 5, cy + 14, "P", r"\footnotesize", "anchor=west", True)]
        elif sub == "axis-pair":
            out += [arrow_t(22, 96, 222, 96), arrow_t(120, 174, 120, 12),
                    r"\draw[black!55,dashed] %s -- %s;" % (P(120, 52), P(184, 75)),
                    r"\draw[black!55,dashed] %s -- %s;" % (P(120, 140), P(184, 75))]
            for x, y in ((120, 52), (120, 140)):
                out.append(r"\filldraw[draw=FAUblue,fill=FAUblue] %s circle (%.3f);" % (P(x, y), 6 * VS))
            out += [r"\fill[FAUblue] %s circle (%.3f);" % (P(184, 75), 4 * VS),
                    T(224, 101, "x", r"\footnotesize", "anchor=west", True),
                    T(111, 12, "y", r"\footnotesize", "anchor=east", True),
                    T(132, 50, "Q1", r"\footnotesize", "anchor=west"),
                    T(132, 144, "Q2", r"\footnotesize", "anchor=west"),
                    T(191, 72, "P(x,y)", r"\footnotesize", "anchor=west", True),
                    T(108, 48, "a", r"\footnotesize", "anchor=east", True),
                    T(108, 145, "−a", r"\footnotesize", "anchor=east", True)]
        elif sub == "diamond":
            out += [r"\draw[black!55,dashed] %s -- %s;" % (P(120, 29), P(120, 148)),
                    r"\draw[black!80] %s -- %s -- %s -- %s -- cycle;" %
                    (P(120, 29), P(69, 80), P(120, 131), P(171, 80)),
                    arrow_t(120, 143, 120, 10), arrow_t(120, 131, 218, 131)]
            for x, y in ((120, 29), (69, 80), (171, 80), (120, 131)):
                out.append(r"\filldraw[draw=FAUblue,fill=FAUblue] %s circle (%.3f);" % (P(x, y), 6 * VS))
            out += [T(132, 26, "Q2", r"\footnotesize", "anchor=west"),
                    T(55, 75, "Q1", r"\footnotesize", "anchor=east"),
                    T(183, 75, "Q3", r"\footnotesize", "anchor=west"),
                    T(132, 146, "Q", r"\footnotesize", "anchor=west"),
                    T(79, 57, "a", r"\footnotesize", "", True),
                    T(161, 57, "a", r"\footnotesize", "", True),
                    T(221, 136, "x", r"\footnotesize", "anchor=west", True),
                    T(111, 11, "y", r"\footnotesize", "anchor=east", True)]
        elif sub == "charged-sphere":
            out += [r"\filldraw[draw=black!75,fill=black!10] %s circle (%.3f);" % (P(112, 84), 56 * VS),
                    r"\draw[black!80,line width=1pt] %s -- %s;" % (P(112, 84), P(74, 43)),
                    r"\fill[FAUblue] %s circle (%.3f);" % (P(112, 84), 3 * VS),
                    arrow_t(151, 48, 174, 27, "FAUblue,line width=1.3pt"),
                    T(97, 52, "a", r"\footnotesize", "", True),
                    T(112, 100, "ρ_0", r"\small", "", True),
                    T(177, 88, "ρ = 0", r"\footnotesize", "anchor=west", True),
                    T(179, 22, "E_r", r"\footnotesize", "anchor=west", False, "FAUblue")]
        elif sub == "coax-cap":
            out += [r"\filldraw[draw=black!70,fill=black!20] %s rectangle %s;" % (P(53, 30), P(204, 43)),
                    r"\filldraw[draw=black!70,fill=black!20] %s rectangle %s;" % (P(53, 131), P(204, 144)),
                    r"\filldraw[draw=black!75,fill=FAUblue!18] %s rectangle %s;" % (P(82, 43), P(138, 131)),
                    r"\filldraw[draw=black!75,fill=black!8] %s rectangle %s;" % (P(138, 43), P(204, 131)),
                    arrow_t(82, 126, 82, 48),
                    arrow_t(42, 48, 42, 126), T(35, 91, "h", r"\footnotesize", "anchor=east", True),
                    arrow_t(112, 69, 112, 105, "FAUblue,line width=1.2pt"),
                    arrow_t(170, 69, 170, 105, "FAUblue,line width=1.2pt"),
                    arrow_t(220, 44, 220, 130, "FAUblue,line width=1.2pt"),
                    T(76, 23, "z", r"\footnotesize", "anchor=east", True),
                    T(110, 62, "ε1", r"\footnotesize", "", False, "FAUblue"),
                    T(170, 62, "ε0", r"\footnotesize"),
                    T(225, 91, "U10", r"\footnotesize", "anchor=west", True, "FAUblue")]
            for x, y in ((82, 159), (138, 159), (204, 181)):
                out.append(r"\draw[black!75] %s -- %s;" % (P(x, y - 6), P(x, y + 6)))
            out += [r"\draw[black!75] %s -- %s;" % (P(82, 159), P(138, 159)),
                    r"\draw[black!75] %s -- %s;" % (P(82, 181), P(204, 181)),
                    T(110, 174, "a1", r"\footnotesize", "", True),
                    T(165, 196, "a2", r"\footnotesize", "", True)]
        elif sub == "halfspace-line":
            out += [r"\fill[black!8] %s rectangle %s;" % (P(42, 25), P(226, 76)),
                    r"\fill[FAUblue!10] %s rectangle %s;" % (P(42, 76), P(226, 144)),
                    r"\draw[black!80,line width=1.1pt] %s -- %s;" % (P(42, 76), P(226, 76)),
                    arrow_t(50, 148, 50, 18), arrow_t(42, 137, 229, 137),
                    r"\draw[black!55,dashed] %s -- %s;" % (P(50, 137), P(160, 76)),
                    r"\filldraw[draw=FAUblue,fill=FAUblue] %s circle (%.3f);" % (P(50, 137), 7 * VS),
                    r"\node[text=white,font=\footnotesize\bfseries] at %s {$+$};" % P(50, 137),
                    r"\fill[FAUblue] %s circle (%.3f);" % (P(160, 76), 4 * VS),
                    arrow_t(30, 133, 30, 82),
                    T(232, 142, "x", r"\footnotesize", "anchor=west", True),
                    T(47, 15, "y", r"\footnotesize", "anchor=east", True),
                    T(82, 51, "ε_1", r"\footnotesize", "", False, "FAUblue"),
                    T(200, 108, "ε_0", r"\footnotesize"),
                    T(60, 154, "λ_0", r"\footnotesize", "anchor=west", False, "FAUblue"),
                    T(24, 110, "h", r"\footnotesize", "anchor=east", True),
                    T(168, 72, "P(x,h)", r"\footnotesize", "anchor=west", True),
                    T(159, 94, "y = h", r"\footnotesize", "anchor=west", True)]
        elif sub == "coax-layered":
            cx, cy = 122, 90
            # Nested fills expose the air cavity, inner metal, two dielectric layers, outer metal, and exterior.
            for r, fill in ((76, "black!8"), (70, "FAUblue!25"), (61, "white"),
                            (61, "black!8"), (42, "white"), (42, "FAUblue!18"),
                            (25, "FAUblue!25"), (16, "white")):
                out.append(r"\filldraw[draw=black!70,fill=%s] %s circle (%.3f);" %
                           (fill, P(cx, cy), r * VS))
            for r in (76, 70, 61, 42, 25, 16):
                out.append(r"\draw[black!70] %s circle (%.3f);" % (P(cx, cy), r * VS))
            # same placement as the page: labels in their own band or outside, haloed where they meet a ring edge
            out += [arrow_t(166, cy, 181, cy, "FAUblue,line width=1.2pt"),
                    T(cx, cy - 6, "ε_0", r"\footnotesize", "", True),
                    T(93, 72, "ε_1", r"\footnotesize", "", False, "FAUblue", True),
                    T(86, 53, "ε_2", r"\footnotesize", "", False, "", True),
                    T(44, 18, "ε_0", r"\footnotesize", "", True),
                    T(140, cy - 21, "σ_0", r"\footnotesize", "anchor=west", False, "FAUblue", True),
                    T(171, 66, "σ_2", r"\footnotesize", "anchor=west", False, "FAUblue", True),
                    T(174, cy + 13, "D_ρ", r"\footnotesize", "", True, "FAUblue", True),
                    r"\draw[black!55,dashed] %s -- %s;" % (P(cx, cy), P(cx, cy + 61))]
            for r, lab in ((25, "a_0"), (42, "a_1"), (61, "a_2")):
                out += [r"\draw[black!80] %s -- %s;" % (P(cx - 4, cy + r), P(cx + 4, cy + r)),
                        T(cx + 7, cy + r, lab, r"\footnotesize", "anchor=west", True, "", True)]
            out += [r"\draw[black!80] %s -- %s;" % (P(44, cy), P(54, cy)),
                    T(40, cy, "d", r"\footnotesize", "anchor=east", True)]
    elif kind == "plot":
        xr = [float(v) for v in (a.get("data-xr") or "0 1").split()]
        yr = [float(v) for v in (a.get("data-yr") or "0 1").split()]
        X0, X1, Y0, Y1 = 40, 244, 146, 18
        X = lambda v: X0 + (v - xr[0]) / (xr[1] - xr[0]) * (X1 - X0)
        Y = lambda v: Y0 - (v - yr[0]) / (yr[1] - yr[0]) * (Y0 - Y1)
        pts = lambda t: " -- ".join(P(X(float(p.split(",")[0])), Y(float(p.split(",")[1]))) for p in t.split())
        xy = lambda t: [(X(float(p.split(",")[0])), Y(float(p.split(",")[1]))) for p in t.split()]
        if a.get("data-shade"):
            out.append(r"\fill[FAUblue!25] %s -- cycle;" % pts(a["data-shade"]))
        ax = X(0) if xr[0] < 0 < xr[1] else X0
        ay = Y(0) if yr[0] < 0 < yr[1] else Y0
        out += [arrow_t(X0, ay, X1 + 10, ay), arrow_t(ax, Y0, ax, Y1 - 8)]
        for i, l in enumerate((a.get("data-lines") or "").split(";")):
            if not l.strip():
                continue
            style = ["FAUblue,line width=1.6pt", "black!85,line width=1pt", "black!55,dashed"][min(i, 2)]
            out.append(r"\draw[%s] %s;" % (style, smooth(xy(l))))
        for m in (a.get("data-marks") or "").split(";"):
            if m:
                q = m.split(":")
                x_, y_ = [float(v) for v in q[0].split(",")]
                lab, side = (q + ["", ""])[1:3]
                if side:  # dot at the point, label on the named side (e/w, lifted by n, dropped by s), as on the page
                    w = "w" in side
                    dy = -10 if "n" in side else 10 if "s" in side else 0
                    out.append(r"\fill[FAUblue] %s circle (%.3f);" % (P(X(x_), Y(y_)), 3.5 * VS))
                    if lab:
                        out.append(T(X(x_) + (-8 if w else 8), Y(y_) + dy, lab, r"\footnotesize",
                                     "anchor=east" if w else "anchor=west", False, "FAUblue", True))
                else:
                    out.append(T(X(x_) + 6, Y(y_) - 6, lab, r"\footnotesize", "anchor=west", False, "FAUblue"))
        out += [T(X1 + 8, ay + 16, a.get("data-xlabel") or "x", r"\footnotesize", "anchor=east", True),
                T(ax - 8, Y1 - 2, a.get("data-ylabel") if a.get("data-ylabel") is not None else "y", r"\footnotesize", "anchor=east", True)]
        for t in (a.get("data-xticks") or "").split():
            v, lab, side = (t.split(":") + ["", ""])[:3]
            out.append(r"\draw[black!80] %s -- %s;" % (P(X(float(v)), ay - 4), P(X(float(v)), ay + 4)))
            if side == "r":
                out.append(T(X(float(v)) + 4, ay + 12, lab or v, r"\footnotesize", "anchor=west"))
            else:
                out.append(T(X(float(v)), ay + 16, lab or v, r"\footnotesize"))
    elif kind == "field":
        def charge(x, y, sign):
            out.append(r"\filldraw[draw=FAUblue,fill=FAUblue] %s circle (%.3f);" % (P(x, y), 12 * VS))
            out.append(r"\node[text=white,font=\small\bfseries] at %s {%s};" % (P(x, y), "−" if sign == "-" else "+"))
        if sub == "pair":
            sg = (a.get("data-signs") or "+ +").split()
            like = sg[0] == sg[1]
            charge(70, 60, sg[0]); charge(170, 60, sg[1])
            seg = "FAUblue,line width=1.6pt"
            if like:
                out += [arrow_t(56, 60, 22, 60, seg), arrow_t(184, 60, 218, 60, seg)]
            else:
                out += [arrow_t(84, 60, 112, 60, seg), arrow_t(156, 60, 128, 60, seg)]
            out.append(T(120, 102, a.get("data-label") or ("like charges repel" if like else "unlike charges attract"), r"\footnotesize"))
        elif sub == "vectors":
            charge(40, 148, "+"); charge(200, 148, "+")
            Px, Py = 120, 84
            out += [r"\fill[FAUblue] %s circle (%.3f);" % (P(Px, Py), 3.5 * VS),
                    r"\node[font=\small] at %s {\textit{P}};" % P(Px, Py + 15),
                    arrow_t(Px, Py, Px + 40, Py - 32), arrow_t(Px, Py, Px - 40, Py - 32),
                    arrow_t(Px, Py, Px, Py - 52, "FAUblue,line width=1.6pt"),
                    r"\node[anchor=west,font=\footnotesize] at %s {$E_1$};" % P(Px + 46, Py - 30),
                    r"\node[anchor=east,font=\footnotesize] at %s {$E_2$};" % P(Px - 46, Py - 30),
                    r"\node[anchor=west,font=\footnotesize,text=FAUblue] at %s {$E = E_1 + E_2$};" % P(Px + 6, Py - 54)]
        elif sub == "dipole":
            A, B = (80, 90), (180, 90)
            for pts_ in dipole_lines(A, B):
                out.append(r"\draw[black!80] %s;" % smooth(pts_[::2] + [pts_[-1]]))
                m = len(pts_) // 2
                if len(pts_) > 4:
                    out.append(arrow_t(pts_[m - 1][0], pts_[m - 1][1], pts_[m][0], pts_[m][1]))
            charge(A[0], A[1], "+"); charge(B[0], B[1], "-")
        elif sub == "slab":
            out += [r"\fill[FAUblue!25] %s rectangle %s;" % (P(84, 26), P(116, 120)),
                    r"\draw[black!85,line width=2.5pt] %s -- %s;" % (P(46, 26), P(46, 120)),
                    r"\draw[black!85,line width=2.5pt] %s -- %s;" % (P(154, 26), P(154, 120)),
                    T(46, 13, "+"), T(154, 13, "−")]
            for k_, y in enumerate((38, 56, 74, 92, 110)):
                out.append(r"\draw[black!80] %s -- %s;" % (P(54, y), P(82, y)))
                out.append(arrow_t(118, y, 146, y))
                if k_ % 2 == 0:
                    out.append(r"\draw[black!80] %s -- %s;" % (P(82, y), P(118, y)))
            out += [T(100, 46, "−+", r"\footnotesize"), T(100, 82, "−+", r"\footnotesize"),
                    T(100, 134, a.get("data-label") or "fewer E lines inside the slab", r"\footnotesize")]
        elif sub == "plates":
            out += [r"\draw[black!85,line width=2.5pt] %s -- %s;" % (P(46, 26), P(46, 120)),
                    r"\draw[black!85,line width=2.5pt] %s -- %s;" % (P(154, 26), P(154, 120)),
                    T(46, 13, "+"), T(154, 13, "−")]
            out += [arrow_t(54, y, 146, y) for y in (38, 56, 74, 92, 110)]
            out.append(T(100, 134, a.get("data-label") or "uniform E between the plates", r"\footnotesize"))
        else:
            c, neg = 80, sub == "point-"
            if a.get("data-extra") == "equipot":
                out += [r"\draw[black!55,dashed] %s circle (%.3f);" % (P(c, c), r_ * VS) for r_ in (34, 54)]
            if a.get("data-extra") == "surface":
                out += [r"\draw[black!65,dashed,line width=1pt] %s circle (%.3f);" % (P(c, c), 46 * VS),
                        T(c + 20, c - 56, "A", r"\footnotesize", "anchor=west", True, "FAUblue")]
            for k in range(8):
                t = k * math.pi / 4
                p1 = (c + 20 * math.cos(t), c - 20 * math.sin(t))
                p2 = (c + 66 * math.cos(t), c - 66 * math.sin(t))
                out.append(arrow_t(*(p2 + p1)) if neg else arrow_t(*(p1 + p2)))
            out.append(r"\filldraw[draw=FAUblue,fill=FAUblue] %s circle (%.3f);" % (P(c, c), 13 * VS))
            out.append(r"\node[text=white,font=\small\bfseries] at %s {%s};" % (P(c, c), "−" if neg else "+"))
    elif kind == "nest":
        R = [[x.strip() for x in r.split(":")] for r in a["data-rings"].split("|")]
        for i in range(len(R) - 1, -1, -1):
            w, h = 84 + i * 60, 44 + i * 40
            x0, y0 = 136 - w / 2, 94 - h / 2
            out.append(r"\filldraw[draw=black!50,fill=%s] %s rectangle %s;" % ("FAUblue!25" if i == 0 else "Paperblue", P(x0, y0), P(x0 + w, y0 + h)))
            out.append(T(x0 + 8, y0 + 14, R[i][0], r"\small", "anchor=west"))
            if len(R[i]) > 1:
                out.append(T(x0 + w - 8, y0 + 14, R[i][1], r"\footnotesize", "anchor=east", False, "FAUblue"))
    elif kind == "flow":
        S = a["data-steps"].split("|")
        BW, G, X = 108, 24, 4
        for i, st in enumerate(S):
            lines = st.split(" / ")
            out.append(r"\filldraw[draw=black!50,fill=%s] %s rectangle %s;" % ("FAUblue!25" if i == len(S) - 1 else "Paperblue", P(X, 10), P(X + BW, 66)))
            for k_, l in enumerate(lines):
                out.append(T(X + BW / 2, 38 + (k_ - (len(lines) - 1) / 2) * 16, l, r"\small" if k_ == 0 else r"\scriptsize"))
            if i < len(S) - 1:
                out.append(arrow_t(X + BW + 2, 38, X + BW + G - 2, 38))
            X += BW + G
    elif kind == "pascal":
        n = int(a.get("data-rows") or 5)
        sm = (a.get("data-sum") or "").split(":")
        C = [[1]]
        for r_ in range(1, n + 1):
            C.append([1] + [C[r_ - 1][k_ - 1] + C[r_ - 1][k_] for k_ in range(1, r_)] + [1])
        for r_, row in enumerate(C):
            for k_, val in enumerate(row):
                x, y = 130 + (k_ - r_ / 2) * 34, 20 + r_ * 24
                hot = len(sm) == 2 and ((r_ == int(sm[0]) and k_ in (int(sm[1]), int(sm[1]) + 1)) or (r_ == int(sm[0]) + 1 and k_ == int(sm[1]) + 1))
                if hot:
                    out.append(r"\fill[FAUblue!25] %s circle (%.3f);" % (P(x, y - 2), 11 * VS))
                out.append(T(x, y - 2, str(val), r"\small", "", False, "FAUblue" if hot else ""))
    elif kind == "wave":
        S = [x.split(":") for x in a["data-signals"].split(";")]
        SW, X0, mark = 24, 64, a.get("data-mark")
        if mark not in (None, ""):
            out.append(r"\fill[FAUblue!25] %s rectangle %s;" % (P(X0 + int(mark) * SW, 4), P(X0 + (int(mark) + 1) * SW, len(S) * 34 + 8)))
        for r_, (lab, lv) in enumerate(S):
            y0 = 12 + r_ * 34
            out.append(T(X0 - 10, y0 + 11, lab, r"\footnotesize", "anchor=east", True))
            pts_ = []
            for i, b in enumerate(lv):
                y = y0 if b == "1" else y0 + 20
                pts_ += [P(X0 + i * SW, y), P(X0 + (i + 1) * SW, y)]
            out.append(r"\draw[%s] %s;" % ("FAUblue,line width=1.6pt" if r_ == len(S) - 1 else "black!85,line width=1pt", " -- ".join(pts_)))
        out.append(T(X0 + len(S[0][1]) * SW / 2, len(S) * 34 + 20, a.get("data-label") or "time →", r"\footnotesize"))
    elif kind == "kmap":
        rows = [r.split() for r in a["data-cells"].split("/")]
        C_, cw, X0, Y0 = len(rows[0]), 40, 70, 46
        rl = (a.get("data-rows") or "0 1").split()
        cl = (a.get("data-cols") or "00 01 11 10").split()
        vs = (a.get("data-vars") or "A|BC").split("|")
        out.append(r"\node[font=\footnotesize] at %s {\textit{%s} / \textit{%s}};" % (P(X0 - 30, Y0 - 22), tex_text(vs[0]), tex_text(vs[1])))
        for j, c_ in enumerate(cl):
            out.append(T(X0 + j * cw + cw / 2, Y0 - 10, c_, r"\footnotesize"))
        for i, row in enumerate(rows):
            out.append(T(X0 - 12, Y0 + i * cw + cw / 2, rl[i], r"\footnotesize", "anchor=east"))
            for j, v_ in enumerate(row):
                out.append(r"\draw[black!50,fill=Paperblue] %s rectangle %s;" % (P(X0 + j * cw, Y0 + i * cw), P(X0 + (j + 1) * cw, Y0 + (i + 1) * cw)))
                out.append(T(X0 + j * cw + cw / 2, Y0 + i * cw + cw / 2, v_))
        for g in (a.get("data-groups") or "").split(";"):
            m = re.match(r"r(\d)-(\d),c(\d)-(\d)", g.strip())
            if not m:
                continue
            r0, r1, c0, c1 = map(int, m.groups())
            for sp in ([(c0, c1)] if c1 >= c0 else [(c0, C_ - 1), (0, c1)]):
                out.append(r"\draw[FAUblue,line width=1.4pt] %s rectangle %s;" % (P(X0 + sp[0] * cw + 4, Y0 + r0 * cw + 4), P(X0 + (sp[1] + 1) * cw - 4, Y0 + (r1 + 1) * cw - 4)))
    elif kind == "wheel":
        import math
        n = int(a.get("data-bits") or 4)
        N, c, R = 2 ** n, 120, 92
        fr, to = a.get("data-from"), a.get("data-to")
        out.append(r"\draw[black!70] %s circle (%.3f);" % (P(c, c), (R - 22) * VS))
        for k_ in range(N):
            t = k_ / N * 2 * math.pi - math.pi / 2
            pat, val = format(k_, "0%db" % n), (k_ - N if k_ >= N // 2 else k_)
            hot = pat in (fr, to)
            out.append(T(c + R * math.cos(t), c + R * math.sin(t), pat, r"\scriptsize", "", False, "FAUblue" if hot else ""))
            out.append(T(c + (R - 40) * math.cos(t), c + (R - 40) * math.sin(t), str(val).replace("-", "−"), r"\footnotesize", "", False, "FAUblue" if hot else ""))
        if fr and to:
            t1 = int(fr, 2) / N * 360 - 90
            t2 = int(to, 2) / N * 360 - 90
            rr = (R - 22) * VS
            # page y runs down, TikZ y up: angles flip sign; draw the short clockwise step
            out.append(r"\draw[FAUblue,line width=1.6pt] ([shift={(%.2f:%.3f)}]%s) arc (%.2f:%.2f:%.3f);" % (-t1, rr, P(c, c)[1:-1], -t1, -t2, rr))
        out.append(T(c, 2 * c + 10, a.get("data-label") or "+1 steps clockwise", r"\scriptsize"))
    elif kind == "cells":
        C_ = [x.split("|") for x in a["data-cells"].split(";")]
        H, X, W, at = 40, 110, 96, {}
        for i, c_ in enumerate(C_):
            y = 10 + i * (H + 10)
            at[c_[0]] = y + H / 2
            out.append(T(X - 10, y + H / 2 - 6, c_[0], r"\small", "anchor=east", True))
            if len(c_) > 1 and c_[1]:
                out.append(T(X - 10, y + H / 2 + 10, c_[1], r"\scriptsize", "anchor=east"))
            out.append(r"\draw[black!50,fill=Paperblue] %s rectangle %s;" % (P(X, y), P(X + W, y + H)))
            out.append(T(X + W / 2, y + H / 2, c_[2] if len(c_) > 2 else ""))
        for k_, ar in enumerate(x for x in (a.get("data-arrows") or "").split(";") if x):
            q = ar.split(">")
            if q[0] in at and q[1] in at:
                bx = X + W + 30 + k_ * 14
                out.append(r"\draw[black!85,line width=1pt] %s -- %s -- %s;" % (P(X + W, at[q[0]]), P(bx, at[q[0]]), P(bx, at[q[1]])))
                out.append(arrow_t(bx, at[q[1]], X + W + 2, at[q[1]], "FAUblue,line width=1.6pt"))
    elif kind == "ladder":
        L = a["data-levels"].split(";")
        n, H, top = len(L), 30, 24
        out.append(T(130, 12, a.get("data-top") or "faster", r"\footnotesize"))
        for i, name in enumerate(L):
            w = 90 + i * 120 / max(1, n - 1)
            x0, y0 = 130 - w / 2, top + i * (H + 6)
            out.append(r"\filldraw[draw=black!50,fill=Paperblue] %s rectangle %s;" % (P(x0, y0), P(x0 + w, y0 + H)))
            out.append(T(130, y0 + H / 2, name))
        bottom = top + n * (H + 6) - 6
        out += [arrow_t(252, bottom, 252, top), T(130, bottom + 14, a.get("data-bottom") or "larger", r"\footnotesize")]
    out.append(r"\end{tikzpicture}")
    return "\n".join(out)


# ---------- blocks ----------
def est(n):
    """Rough height of a block in lines, for keeping blocks together."""
    text = len(n.text())
    if n.tag in ("h2", "h3"):
        return 3
    if n.tag == "p":
        return 2 + text // 95
    if n.tag in ("ol", "ul"):
        items = [x for x in n.kids if isinstance(x, Node) and x.tag == "li"]
        if len(items) > 8:
            return 4
        return sum(1 + len(x.text()) // 95 for x in items) + len(items) // 2 + 1
    if n.tag == "div":
        if "tw" in n.cls:
            rows = len(Conv().all(n, "tr"))
            return 3 + rows + text // 120
        return 5 + text // 110
    return 1


class Conv:
    def __init__(self):
        self.answers = []  # (section title, summary, latex)
        self.section = ""

    def blocks(self, node):
        kids = [k for k in node.kids if isinstance(k, Node)]
        out = []
        for i, k in enumerate(kids):
            if k.tag in ("h2", "h3", "p") and i + 1 < len(kids):
                # keep a heading or lead-in with what follows it
                need = est(k) + est(kids[i + 1])
                if k.tag in ("h2", "h3") and kids[i + 1].tag == "p" and i + 2 < len(kids):
                    need += est(kids[i + 2])
                out.append("\n\\Needspace{%d\\baselineskip}" % min(need, 32))
            out.append(self.block(k))
        return "".join(out)

    def chunks(self, sec):
        """Split a section at its h3 subtopics; each subtopic is kept whole where it fits."""
        groups, cur = [], []
        for x in sec.kids:
            if isinstance(x, Node) and x.tag == "h3" and cur:
                groups.append(cur)
                cur = []
            cur.append(x)
        groups.append(cur)
        out = []
        for i, g in enumerate(groups):
            part = Node("div", {}, None)
            part.kids = g
            body = self.blocks(part)
            out.append(body if i == 0 else "\n\\begin{keepsection}" + body + "\\end{keepsection}\n")
        return "".join(out)

    def items(self, node):
        out = []
        for k in node.kids:
            if isinstance(k, Node) and k.tag == "li":
                content = self.li(k).strip()
                out.append(r"\item" + (" " + content if content else "") + "\n")
        return "".join(out)

    def li(self, k):
        if any(isinstance(x, Node) and x.tag in ("ol", "ul", "div", "p") for x in k.kids):
            return self.blocks(k)
        return inline(k)

    def block(self, k):
        if isinstance(k, str):
            return tex_text(k) if k.strip() else ""
        t, c = k.tag, k.cls
        if t in ("header", "script", "nav") or "downloads" in c or "hidden" in k.attrs:
            return ""
        if t == "section":
            lead = "\n\\clearpage\n" if k.attrs.get("id") == "practice" else ""
            checks = find(k, lambda n: "checks" in n.cls)
            if checks:  # keep heading, intro and the whole checklist on one page
                n = sum(1 for x in checks.kids if isinstance(x, Node) and x.tag == "li")
                lead += "\n\\Needspace{%d\\baselineskip}" % (2 * n + 10)
            return lead + "\n\\begin{keepsection}" + self.chunks(k) + "\\end{keepsection}\n"
        if t == "h2":
            self.section = k.text()
            return "\n\\section{%s}\n" % inline(k)
        if t == "h3":
            return "\n\\subsection{%s}\n" % inline(k)
        if t == "p":
            if "lab-link" in c:
                return ""
            if "math-line" in c:
                return "\n\\begin{equation*}%s\\end{equation*}\n" % grow_delims(math(k))
            if "method" in c:
                return "\n\\begin{notebox}%s\\end{notebox}\n" % inline(k)
            if "plain" in c:
                return "\n\\begin{plainbox}%s\\end{plainbox}\n" % inline(k)
            if "source-note" in c:
                return "\n\\vfill{\\small %s}\n" % inline(k)
            if "standfirst" in c:
                return "\n{\\large %s}\n\n" % inline(k)
            return "\n%s\n" % inline(k)
        if t == "ol":
            return self.keep(k) + "\n\\begin{enumerate}\n%s\\end{enumerate}\n" % self.items(k)
        if t == "ul":
            if "checks" in c:
                return "\n\\begin{itemize}[label={}]\n%s\\end{itemize}\n" % self.items(k)
            return self.keep(k) + "\n\\begin{itemize}\n%s\\end{itemize}\n" % self.items(k)
        if t == "details":
            summ = find(k, lambda n: n.tag == "summary")
            body = "".join(self.block(x) for x in k.kids if isinstance(x, Node) and x.tag != "summary")
            label = self.section
            self.answers.append((label, summ.text().strip() if summ else "Answers", body))
            return "\n\\nopagebreak[4]{\\small\\itshape Answers: see “%s” under Answers at the end.}\n" % tex_text(label)
        if t == "div" and "eq" in c:
            title = find(k, lambda n: n.tag == "strong" and n.parent is k)
            forms = [n for n in k.kids if isinstance(n, Node) and "formula" in n.cls]
            note = find(k, lambda n: "eq-note" in n.cls)
            formula_lines = r" \\ ".join(grow_delims(math(form)) for form in forms)
            s = "\n\\begin{equationcard}{%s}\n\\[ \\begin{gathered} %s \\end{gathered} \\]\n" % (inline(title) if title else "", formula_lines)
            if note:
                s += "{\\small %s}\n" % inline(note)
            return s + "\\end{equationcard}\n"
        if t == "div" and ("worked" in c or "recall" in c):
            env = "workedbox" if "worked" in c else "recallbox"
            title = find(k, lambda n: n.tag == "p" and ("worked-title" in n.cls or "recall-title" in n.cls))
            rest = "".join(self.block(x) for x in k.kids if x is not title and (isinstance(x, Node) or x.strip()))
            return "\n\\begin{%s}{%s}%s\\end{%s}\n" % (env, inline(title) if title else "", rest, env)
        if t == "div" and ("arrows" in c or "figs" in c):
            figs = [n for n in k.kids if isinstance(n, Node) and n.tag == "figure" and ("amap" in n.cls or "viz" in n.cls)]
            w = "%.3f" % (0.97 / max(1, min(len(figs), 4)) - 0.02)
            cells = []
            for f in figs:
                cap = find(f, lambda n: n.tag == "figcaption")
                cells.append("\\begin{minipage}[t]{%s\\linewidth}\\centering\n%s\\par\\smallskip{\\small\\raggedright %s\\par}\\end{minipage}"
                             % (w, amap_tikz(f) if "amap" in f.cls else viz_tikz(f), inline(cap) if cap else ""))
            return "\n\\Needspace{14\\baselineskip}\n\\begin{center}\n" + "\\hfill\n".join(cells) + "\n\\end{center}\n"
        if t == "div" and "tw" in c:
            return "\n\\Needspace{10\\baselineskip}" + self.table(find(k, lambda n: n.tag == "table"))
        return self.blocks(k)

    def keep(self, lst):
        """Ask for room for a short list so it moves to the next page whole instead of splitting."""
        items = [x for x in lst.kids if isinstance(x, Node) and x.tag == "li"]
        if len(items) > 8:
            return ""
        lines = sum(1 + len(x.text()) // 95 for x in items) + len(items) // 2 + 1
        return "\n\\Needspace{%d\\baselineskip}" % lines

    def table(self, tb):
        rows = []
        for tr in self.all(tb, "tr"):
            cells = [x for x in tr.kids if isinstance(x, Node) and x.tag in ("td", "th")]
            rows.append(([inline(x) for x in cells], cells and cells[0].tag == "th"))
        n = max(len(r[0]) for r in rows)
        spec = ">{\\raggedright\\arraybackslash}X" * n
        out = ["\n\\begin{center}\\small\\begin{tabularx}{\\linewidth}{%s}\\toprule" % spec]
        for cells, head in rows:
            line = " & ".join("\\textbf{%s}" % x if head else x for x in cells) + r" \\"
            out.append(line + (r" \midrule" if head else ""))
        out.append("\\bottomrule\\end{tabularx}\\end{center}\n")
        return "\n".join(out)

    def all(self, node, tag):
        res = []
        for k in node.kids:
            if isinstance(k, Node):
                if k.tag == tag:
                    res.append(k)
                res.extend(self.all(k, tag))
        return res


PREAMBLE = r"""\documentclass[11pt]{article}
\usepackage[margin=18mm,headheight=22pt]{geometry}
\usepackage{amsmath}
\usepackage{fontspec}
\usepackage{unicode-math}
\setmainfont{NewCM10}[Extension=.otf,UprightFont=*-Book,BoldFont=*-Bold,ItalicFont=*-BookItalic,BoldItalicFont=*-BoldItalic]
\setsansfont{NewCMSans10}[Extension=.otf,UprightFont=*-Book,BoldFont=*-Bold,ItalicFont=*-BookOblique,BoldItalicFont=*-BoldOblique]
\setmathfont{NewCMMath-Book.otf}
\usepackage{xcolor}
\definecolor{FAUblue}{HTML}{04316A}
\definecolor{Paperblue}{HTML}{EEF2F7}
\definecolor{EEIgold}{HTML}{CC9C42}
\usepackage{etoolbox,enumitem,booktabs,tabularx,array,needspace,microtype}
\usepackage[most]{tcolorbox}
\usepackage{titlesec,fancyhdr}
\usepackage[hidelinks]{hyperref}
\usepackage{draftwatermark}
\SetWatermarkText{Made by Thanate Amornjiraporn (Focus)}
\SetWatermarkColor{black!7}\SetWatermarkFontSize{30pt}\SetWatermarkAngle{45}
\setlength{\parindent}{0pt}
\setlength{\parskip}{5pt}
\setlist{itemsep=2pt,topsep=3pt,leftmargin=1.6em,beginpenalty=10000,endpenalty=10000}
\raggedbottom
\clubpenalty=10000 \widowpenalty=10000 \displaywidowpenalty=10000 \interlinepenalty=10000
\setcounter{secnumdepth}{0}
\setcounter{tocdepth}{1}
\pagestyle{fancy}\fancyhf{}
\fancyhead[L]{\small\sffamily\color{FAUblue} From Fundamentals to AI Apocalypse · @CODE@ · @CHAPTER@}
\fancyhead[R]{\small\sffamily @TITLE@}
\fancyfoot[C]{\small\thepage}
\titleformat{\section}{\Large\bfseries\sffamily\color{FAUblue}}{}{0pt}{}
\titleformat{\subsection}{\large\bfseries\sffamily\color{FAUblue}}{}{0pt}{}
\titlespacing*{\section}{0pt}{16pt}{6pt}
\preto\section{\Needspace{8\baselineskip}}
\preto\subsection{\Needspace{6\baselineskip}}
\newtcolorbox{equationcard}[1]{colback=Paperblue,colframe=Paperblue,boxrule=0pt,arc=0pt,left=10pt,right=10pt,top=6pt,bottom=6pt,title={#1},fonttitle=\small\bfseries\sffamily,coltitle=FAUblue,before skip=8pt,after skip=8pt}
\newtcolorbox{workedbox}[1]{colback=white,colframe=EEIgold,boxrule=0pt,leftrule=3pt,arc=0pt,left=10pt,top=4pt,bottom=4pt,title={#1},fonttitle=\small\bfseries\sffamily,coltitle=FAUblue,attach title to upper={\par},before skip=8pt,after skip=8pt}
\newtcolorbox{recallbox}[1]{colback=white,colframe=FAUblue,boxrule=0pt,leftrule=3pt,arc=0pt,left=10pt,top=4pt,bottom=4pt,title={#1},fonttitle=\small\bfseries\sffamily,coltitle=FAUblue,attach title to upper={\par},before skip=8pt,after skip=8pt}
\usepackage{environ}
\newsavebox\measurebox
% Typeset the section once invisibly to measure it; start a new page if it will not fit in what is left.
\makeatletter
\newif\ifkeep@measuring
\NewEnviron{keepsection}{%
  \ifkeep@measuring \BODY \else
    \edef\keep@sec{\the\value{section}}\edef\keep@sub{\the\value{subsection}}%
    \setbox\measurebox\vbox{\hsize\linewidth\keep@measuringtrue\def\Needspace##1{}\BODY}%
    \setcounter{section}{\keep@sec}\setcounter{subsection}{\keep@sub}%
    \dimen2=\ht\measurebox \advance\dimen2\dp\measurebox
    \dimen@=\textheight
    \ifdim\pagegoal<\maxdimen
      \dimen@=\pagegoal \advance\dimen@-\pagetotal
      \ifdim\dimen2>\dimen@ \clearpage \dimen@=\textheight \fi
    \fi
    % if it fits, nothing inside may force an early break
    \ifdim\dimen2>\dimen@ \BODY \else \begingroup\def\Needspace##1{}\BODY\endgroup \fi
  \fi}
\makeatother
\newtcolorbox{notebox}{colback=Paperblue,colframe=Paperblue,boxrule=0pt,arc=0pt,left=8pt,right=8pt,top=4pt,bottom=4pt,before skip=6pt,after skip=6pt}
\newtcolorbox{plainbox}{colback=white,colframe=FAUblue,boxrule=0pt,leftrule=3pt,arc=0pt,left=10pt,right=8pt,top=4pt,bottom=4pt,before skip=6pt,after skip=8pt}
\usetikzlibrary{arrows.meta}
\title{\sffamily\bfseries\color{FAUblue}@TITLE@}
\author{@COURSE@\\[2pt]\small From Fundamentals to AI Apocalypse · personal study guide}
\date{}
\begin{document}
\maketitle
\begingroup\footnotesize\setlength{\parskip}{0pt}\tableofcontents\endgroup
\clearpage
"""


def main(src, dst):
    t = Tree()
    t.feed(open(src, encoding="utf-8").read())
    main_el = find(t.root, lambda n: n.tag == "main")
    conv = Conv()
    body = conv.blocks(main_el)
    ans = ["\n\\clearpage\n\\section{Answers}\n"]
    for label, summ, latex in conv.answers:
        ans.append("\\begin{keepsection}\\subsection{%s}\n%s\n\\end{keepsection}\n" % (tex_text(label), latex))
    note = body.rsplit("\\vfill", 1)
    body, tail = (note[0], "\\vfill" + note[1]) if len(note) == 2 else (body, "")
    head = find(main_el, lambda n: n.tag == "header")
    title = find(head, lambda n: n.tag == "h1").text().strip()
    course = find(head, lambda n: "course" in n.cls).text().strip()
    code = find(head, lambda n: "code" in n.cls).text().strip()
    chapter = course.split("·")[-1].strip()
    pre = PREAMBLE
    for k, v in (("@TITLE@", title), ("@COURSE@", course), ("@CODE@", code), ("@CHAPTER@", chapter)):
        pre = pre.replace(k, tex_text(v))
    with open(dst, "w", encoding="utf-8") as f:
        f.write(pre + body + "".join(ans) + "\n" + tail + "\n\\end{document}\n")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
