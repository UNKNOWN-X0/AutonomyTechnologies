"""Convert a Wegweiser study guide (its <main>) into a standalone LaTeX file.

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
TEXT_MATH = {"∫": r"\int", "∮": r"\oint", "∯": r"\oiint", "∬": r"\iint", "∭": r"\iiint",
             "≈": r"\approx", "∝": r"\propto", "≪": r"\ll", "≤": r"\leq", "≥": r"\geq",
             "→": r"\to", "≠": r"\neq", "±": r"\pm", "∓": r"\mp", "·": r"\cdot",
             "×": r"\times", "−": "-", "√": r"\surd", "∞": r"\infty", "Σ": r"\Sigma",
             "½": r"\tfrac12", "<": "<", ">": ">"}


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
        elif t == "span" and "frac" in c:
            num, den = [x for x in k.kids if isinstance(x, Node)]
            out.append(r"(%s)/(%s)" % (inline(num), inline(den)))
        elif t == "span" and "sec-ref" in c:
            out.append(r"\hfill{\small\color{FAUblue}%s}" % inline(k))
        elif t == "input":
            out.append(r"$\mdlgwhtsquare$\ ")
        else:
            out.append(inline(k))
    return "".join(out)


# ---------- math mode (formula spans) ----------
MATH_MAP = {"−": "-", "·": r"\cdot ", "×": r"\times ", "≈": r"\approx ", "½": r"\tfrac{1}{2}",
            "Σ": r"\sum", "→": r"\to ", "∝": r"\propto ", "≪": r"\ll ", "√": r"\sqrt",
            "∞": r"\infty ", "≥": r"\geq ", "≤": r"\leq ", "±": r"\pm ", "∓": r"\mp ",
            "{": r"\{", "}": r"\}", "%": r"\%", "&": r"\&", "#": r"\#"}


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
            out.append(r"\text{%s}" % p if len(p) > 1 else r"\mathrm{%s}" % p)
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
        elif t == "span" and "frac" in c:
            num, den = [x for x in k.kids if isinstance(x, Node)]
            out.append(r"\dfrac{%s}{%s}" % (math(num), math(den)))
        else:
            out.append(math(k))
    return "".join(out)


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
        return "".join(r"\item %s" % self.li(k) + "\n" for k in node.kids if isinstance(k, Node) and k.tag == "li")

    def li(self, k):
        if any(isinstance(x, Node) and x.tag in ("ol", "ul", "div", "p") for x in k.kids):
            return self.blocks(k)
        return inline(k)

    def block(self, k):
        if isinstance(k, str):
            return tex_text(k) if k.strip() else ""
        t, c = k.tag, k.cls
        if t in ("header", "script", "nav") or "downloads" in c:
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
            if "method" in c:
                return "\n\\begin{notebox}%s\\end{notebox}\n" % inline(k)
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
            form = find(k, lambda n: "formula" in n.cls)
            note = find(k, lambda n: "eq-note" in n.cls)
            s = "\n\\begin{equationcard}{%s}\n\\[ %s \\]\n" % (inline(title) if title else "", math(form))
            if note:
                s += "{\\small %s}\n" % inline(note)
            return s + "\\end{equationcard}\n"
        if t == "div" and ("worked" in c or "recall" in c):
            env = "workedbox" if "worked" in c else "recallbox"
            title = find(k, lambda n: n.tag == "p" and ("worked-title" in n.cls or "recall-title" in n.cls))
            rest = "".join(self.block(x) for x in k.kids if x is not title and (isinstance(x, Node) or x.strip()))
            return "\n\\begin{%s}{%s}%s\\end{%s}\n" % (env, inline(title) if title else "", rest, env)
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
\setlength{\parindent}{0pt}
\setlength{\parskip}{5pt}
\setlist{itemsep=2pt,topsep=3pt,leftmargin=1.6em,beginpenalty=10000,endpenalty=10000}
\raggedbottom
\clubpenalty=10000 \widowpenalty=10000 \displaywidowpenalty=10000 \interlinepenalty=10000
\setcounter{secnumdepth}{0}
\setcounter{tocdepth}{1}
\pagestyle{fancy}\fancyhf{}
\fancyhead[L]{\small\sffamily\color{FAUblue} Wegweiser · @CODE@ · @CHAPTER@}
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
\title{\sffamily\bfseries\color{FAUblue}@TITLE@}
\author{@COURSE@\\[2pt]\small Wegweiser personal study guide}
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
