#!/usr/bin/env python3
"""Check that every Hebrew block in a Markdown reply opens with a right-to-left letter.

A block is a paragraph line, list item, heading, quote line or table cell.
Fenced code blocks are skipped. A block counts only if it contains Hebrew.
The first strong character (Unicode bidi class L, R or AL) decides the block's
direction, the same way bidi-aware renderers do.

Usage: check_rtl_openers.py reply.md [--json]
Exit code 0 when every Hebrew block passes, 1 otherwise.
"""
import json
import re
import sys
import unicodedata

MARKER = re.compile(r"^\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+)?")
TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$")
HEBREW = re.compile(r"[֐-׿]")


def first_strong(text):
    for ch in text:
        if ch == "‏":
            return "R"
        if ch == "‎":
            return "L"
        cls = unicodedata.bidirectional(ch)
        if cls in ("L", "R", "AL"):
            return cls
    return None


def blocks(markdown):
    in_fence = False
    for n, line in enumerate(markdown.splitlines(), 1):
        if line.lstrip().startswith(("```", "~~~")):
            in_fence = not in_fence
            continue
        if in_fence or not line.strip() or TABLE_SEP.match(line):
            continue
        if line.strip().startswith("|"):
            for cell in line.strip().strip("|").split("|"):
                yield n, cell.strip()
        else:
            yield n, MARKER.sub("", line, count=1)


def check(markdown):
    results = []
    for n, text in blocks(markdown):
        if not HEBREW.search(text):
            continue
        strong = first_strong(text)
        results.append({"line": n, "ok": strong in ("R", "AL"), "text": text[:80]})
    return results


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    with open(args[0], encoding="utf-8") as f:
        results = check(f.read())
    bad = [r for r in results if not r["ok"]]
    if "--json" in sys.argv:
        print(json.dumps({"hebrew_blocks": len(results), "failing": bad}, ensure_ascii=False, indent=2))
    else:
        print(f"{len(results) - len(bad)}/{len(results)} Hebrew blocks open right-to-left")
        for r in bad:
            print(f"  line {r['line']}: {r['text']}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
