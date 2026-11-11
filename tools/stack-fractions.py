#!/usr/bin/env python3
"""Turn "/" quotients in study pages into stacked fractions (span.frac), in display lines and in running text.

    python3 -I tools/stack-fractions.py --list eei/ch1-electrostatic-fields.html   # show what would change
    python3 -I tools/stack-fractions.py eei/ch1-electrostatic-fields.html           # rewrite the page

The numerator is the product written right before the slash (atoms with no space between them: letters, digits,
<var>, <sub>, <sup>, roots, a bracket group), the denominator the single term right after it; brackets that only
grouped one side go. A slash stays as it is inside exponents and limits (<sup>, <sub>), in code, links, headers and
the rail, between plain words (and/or, binary/decimal) and in units (m/s, V/m), where neither side holds a variable,
a digit, a Greek letter or a root. A quotient whose side starts or ends at a function name written with a space
(sin x/cos x, ln x/ln a) is listed as "check by hand" and left alone. tools/check-guide.py uses find() to report
any slash quotient still left.
"""
import re
import sys
from pathlib import Path

VOID = {"br", "img", "input", "meta", "link", "hr", "wbr", "source", "col"}
SKIP = {"head", "script", "style", "svg", "code", "pre", "sup", "sub", "a", "title", "nav", "header", "footer", "button", "summary", "h1", "h2"}
ATOM_TAGS = {"var", "sub", "sup", "span", "i", "em"}
CHARS = re.compile(r"[\w′'∂Δ∇∞√⁰¹²³⁴⁵⁶⁷⁸⁹⁻₀₁₂₃₄₅₆₇₈₉*]")
MATHY = re.compile(r"[0-9α-ωΑ-Ωϑϱϕϵ∂∇√π∞<]")  # "<" stands for any tag group (var, sqrt, sub/sup)
FUNC = re.compile(r"(?:sin|cos|tan|cot|ln|log|exp|arctan|arcsin|arccos|sinh|cosh|tanh)$")


def atom_open(tag):
    """A tag that can be part of a fraction side: a variable, sub/superscript or italic, or a root or fraction span.
    Other spans (a big operator with its limits, a section reference) end the side."""
    name = tag_name(tag)
    if name != "span":
        return name in ATOM_TAGS
    return bool(re.search(r'class="[^"]*\b(sqrt|frac)\b', tag))


def tokens(html):
    return [t for t in re.split(r"(<[^>]+>)", html) if t]


def tag_name(tok):
    m = re.match(r"</?\s*([a-zA-Z0-9]+)", tok)
    return m.group(1).lower() if m else ""


def is_open(tok):
    return tok.startswith("<") and not tok.startswith("</") and not tok.startswith("<!") and not tok.endswith("/>")


def is_close(tok):
    return tok.startswith("</")


class Stream:
    """The page as a flat list of characters and whole tags, so operands can be walked across tag boundaries."""

    def __init__(self, html):
        self.items = []  # (kind, value): ("c", char) or ("t", tag)
        for t in tokens(html):
            if t.startswith("<"):
                self.items.append(("t", t))
            else:
                self.items.extend(("c", ch) for ch in t)

    def html(self, a=0, b=None):
        return "".join(v for _, v in self.items[a:b])


def match_back(items, j):
    """j is a closing tag or ')' ; return the index of its opening partner, or None."""
    kind, v = items[j]
    if kind == "c":
        depth = 0
        for k in range(j, -1, -1):
            if items[k] == ("c", ")"):
                depth += 1
            elif items[k] == ("c", "("):
                depth -= 1
                if depth == 0:
                    return k
        return None
    name, depth = tag_name(v), 0
    for k in range(j, -1, -1):
        kk, vv = items[k]
        if kk != "t" or tag_name(vv) != name:
            continue
        if is_close(vv):
            depth += 1
        elif is_open(vv):
            depth -= 1
            if depth == 0:
                return k
    return None


def match_fwd(items, j):
    kind, v = items[j]
    if kind == "c":
        depth = 0
        for k in range(j, len(items)):
            if items[k] == ("c", "("):
                depth += 1
            elif items[k] == ("c", ")"):
                depth -= 1
                if depth == 0:
                    return k
        return None
    name, depth = tag_name(v), 0
    for k in range(j, len(items)):
        kk, vv = items[k]
        if kk != "t" or tag_name(vv) != name:
            continue
        if is_open(vv):
            depth += 1
        elif is_close(vv):
            depth -= 1
            if depth == 0:
                return k
    return None


def numerator(items, s):
    """Start index of the numerator ending just before the slash at s (spaces right before the slash allowed)."""
    j = s - 1
    while j >= 0 and items[j] == ("c", " "):
        j -= 1
    start = None
    while j >= 0:
        kind, v = items[j]
        if kind == "c" and v == ")":
            k = match_back(items, j)
            if k is None:
                break
            start, j = k, k - 1
        elif kind == "c" and v == "." and start is not None and j > 0 and items[j - 1][0] == "c" and items[j - 1][1].isdigit():
            start, j = j, j - 1
        elif kind == "c" and CHARS.match(v):
            start, j = j, j - 1
        elif kind == "t" and is_close(v) and tag_name(v) in ATOM_TAGS:
            k = match_back(items, j)
            if k is None or not atom_open(items[k][1]):
                break
            start, j = k, k - 1
        else:
            break
    return start


def denominator(items, s):
    """End index (exclusive) of the denominator starting just after the slash at s."""
    j = s + 1
    while j < len(items) and items[j] == ("c", " "):
        j += 1
    begin, end = j, None
    while j < len(items):
        kind, v = items[j]
        if kind == "c" and v == "(":
            k = match_fwd(items, j)
            if k is None:
                break
            end, j = k + 1, k + 1
        elif kind == "c" and v == "." and end is not None and j + 1 < len(items) and items[j + 1][0] == "c" and items[j + 1][1].isdigit():
            end, j = j + 1, j + 1
        elif kind == "c" and CHARS.match(v):
            end, j = j + 1, j + 1
        elif kind == "t" and is_open(v) and atom_open(v):
            k = match_fwd(items, j)
            if k is None:
                break
            end, j = k + 1, k + 1
        else:
            break
    return begin, end


def plain(html):
    return re.sub(r"<[^>]+>", "", html)


def unwrap(html):
    """Drop brackets that only group the whole side: "(y − 3)" → "y − 3", but not "(2a)²"."""
    h = html.strip()
    if h.startswith("(") and h.endswith(")"):
        items = Stream(h).items
        if match_fwd(items, 0) == len(items) - 1:
            return h[1:-1]
    return html


def scan(html):
    """Yield (slash index, numerator start, denominator end, verdict) for every slash in convertible text."""
    st = Stream(html)
    items, stack = st.items, []
    for i, (kind, v) in enumerate(items):
        if kind == "t":
            name = tag_name(v)
            if name in VOID or v.startswith("<!"):
                continue
            if is_close(v):
                while stack and stack.pop() != name:
                    pass
            elif is_open(v):
                stack.append(name)
            continue
        if v != "/" or any(n in SKIP for n in stack):
            continue
        a = numerator(items, i)
        b0, b = denominator(items, i)
        if a is None or b is None:
            yield i, a, b, "skip"
            continue
        num, den = st.html(a, i).rstrip(), st.html(b0, b)
        before = plain(st.html(max(0, a - 12), a))
        after = plain(st.html(b, b + 2))
        if MATHY.search(num + den) and (FUNC.search(before.rstrip()) and before.endswith(" ") or (FUNC.fullmatch(plain(den).strip()) and after.startswith(" "))):
            yield i, a, b, "hand"
            continue
        word = re.compile(r"[A-Za-z]{3,}")
        if not (MATHY.search(num) or MATHY.search(den)) or "http" in num + den or word.fullmatch(num.strip()) or word.fullmatch(den.strip()):
            yield i, a, b, "skip"
            continue
        yield i, a, b, "ok"


def convert(html):
    changes, hand = [], []
    while True:
        st = Stream(html)
        todo = None
        for i, a, b, verdict in scan(html):
            if verdict == "ok":
                todo = (i, a, b)
                break
            if verdict == "hand":
                ctx = plain(st.html(max(0, a - 10), min(len(st.items), b + 10)))
                if ctx not in hand:
                    hand.append(ctx)
        if not todo:
            return html, changes, hand
        i, a, b = todo
        num, den = st.html(a, i).rstrip(), st.html(i + 1, b).lstrip()
        frac = '<span class="frac"><span>%s</span><span>%s</span></span>' % (unwrap(num), unwrap(den))
        changes.append("%s ⁄ %s" % (plain(unwrap(num)), plain(unwrap(den))))
        html = st.html(0, a) + frac + st.html(b)


def find(html):
    """Slash quotients still in a page (for tools/check-guide.py): a list of short plain-text snippets."""
    st, out = Stream(html), []
    for i, a, b, verdict in scan(html):
        if verdict in ("ok", "hand"):
            out.append(plain(st.html(a, b)))
    return out


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show = "--list" in sys.argv
    for f in args:
        p = Path(f)
        old = p.read_text(encoding="utf-8")
        new, changes, hand = convert(old)
        print(f"{f}: {len(changes)} stacked" + (f", {len(hand)} to check by hand" if hand else ""))
        if show:
            for c in changes:
                print("   ", c)
        for h in hand:
            print("    check by hand:", h)
        if not show and new != old:
            p.write_text(new, encoding="utf-8")
