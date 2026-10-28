"""Evidence for each bridge, computed from the texts and the OpenBible links (no opinions, only checks).

Reads data/prophecies_66_books.json and data/appointed_times.json (the bridges), data/bible/books.json, data/bible/bsb/*, data/bible/xref/*
Writes data/evidence.json:
  { "<bridge id>": {
      "votes": strongest OpenBible link between the two passages (either direction), or null,
      "links": up to 5 [from, to, votes] pairs, strongest first, "linkCount": n,
      "overlap": {"words": n, "text": "longest run of identical wording (BSB)"},
      "formula": {"ref": "Matt.1.22", "phrase": "..."} or null   (NT introduces Scripture/fulfilment),
      "refs": {"ot": "ok" | problem, "nt": "ok" | problem},
      "textMatch": {"ot": 0..1, "nt": 0..1}   share of the bridge's quoted words found in the BSB text of its reference
  } }

Usage: python3 scripts/build_evidence.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data")
META = json.load(open(os.path.join(D, "bible", "books.json"), encoding="utf-8"))
BOOKS = META["books"]
BY_NAME = {b["name"].lower(): b for b in BOOKS}
BY_NAME.update({"psalm": BY_NAME["psalms"], "song of songs": BY_NAME["song of solomon"]})
BY_OSIS = {b["osis"]: b for b in BOOKS}
OSIS_ORDER = [b["osis"] for b in BOOKS]
_cache = {}


def chapter(kind, osis, c):
    key = (kind, osis, c)
    if key not in _cache:
        p = os.path.join(D, "bible", kind, osis, f"{c}.json")
        _cache[key] = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else ([] if kind == "bsb" else {})
    return _cache[key]


def parse_refs(ref):
    """'Exodus 16:15; 17:6' / 'Psalm 22:1, 7-8' -> [(osis, c, v), ...] plus problems found."""
    verses, problems, book, ch = [], [], None, None
    for raw in ref.split(";"):
        seg = raw.strip()
        if not seg:
            continue
        m = re.match(r"^((?:[123]\s)?[A-Za-z][A-Za-z ]*?)\s+(\d.*)$", seg)
        rest = seg
        if m and m.group(1).lower() in BY_NAME:
            book, rest = BY_NAME[m.group(1).lower()], m.group(2)
        if not book:
            problems.append(f"unknown book in '{seg}'")
            continue
        cm = re.match(r"^(\d+):(.+)$", rest)
        if cm:
            ch, spec = int(cm.group(1)), cm.group(2)
        elif ch:
            spec = rest
        else:
            ch, spec = int(rest), ""
        if ch < 1 or ch > len(book["verses"]):
            problems.append(f"{book['name']} has no chapter {ch}")
            continue
        n = book["verses"][ch - 1]
        items = [x.strip() for x in spec.split(",") if x.strip()] or [f"1-{n}"]
        for it in items:
            a, _, b = it.partition("-")
            a, b = int(a), int(b or a)
            if b > n or a < 1:
                problems.append(f"{book['name']} {ch}:{it} past the last verse ({n})")
            verses += [(book["osis"], ch, v) for v in range(a, min(b, n) + 1)]
    return verses, problems


def expand(target):
    a, _, b = target.partition("-")
    ab, ac, av = a.split(".")
    if not b:
        return [(ab, int(ac), int(av))]
    q = b.split(".")
    bb, bc, bv = (q if len(q) == 3 else (ab, ac, q[0]))
    out, i0, i1 = [], OSIS_ORDER.index(ab), OSIS_ORDER.index(bb)
    c, v = int(ac), int(av)
    for bi in range(i0, i1 + 1):
        counts = BY_OSIS[OSIS_ORDER[bi]]["verses"]
        last_c = int(bc) if bi == i1 else len(counts)
        while c <= last_c:
            last_v = int(bv) if (bi == i1 and c == int(bc)) else counts[c - 1]
            out += [(OSIS_ORDER[bi], c, x) for x in range(v, min(last_v, counts[c - 1]) + 1)]
            c, v = c + 1, 1
        c, v = 1, 1
        if len(out) > 300:
            break
    return out


def links_between(src, dst):
    """OpenBible links from any verse in src to any verse in dst."""
    dst_set, found = set(dst), []
    for (o, c, v) in src:
        for t, votes in chapter("xref", o, c).get(str(v), []):
            if any(x in dst_set for x in expand(t)):
                found.append([f"{o}.{c}.{v}", t, votes])
    return found


WORD = re.compile(r"[a-z’']+")
STOP = set("the a an and or of to in on for with that this these those is was were be been are as at by it its his her he she they them their you your we our i me my not no but so from into upon unto shall will who whom which what when there then than all have has had do did".split())


def words(text):
    return WORD.findall(text.lower().replace("’", "'"))


def longest_run(a, b):
    """Longest run of identical consecutive words shared by a and b."""
    best, end, prev = 0, 0, [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
                if cur[j] > best:
                    best, end = cur[j], i
        prev = cur
    return best, " ".join(a[end - best:end])


FORMULAS = re.compile(
    r"(to fulfil[l]?|was fulfilled|fulfilled what|might be fulfilled|in fulfil[l]?ment|"
    r"it is written|as it is written|it has been written|it stands written|"
    r"the scripture says|the scriptures?|scripture (has|was) fulfilled|"
    r"spoken (by|through) the prophets?|what was spoken|the prophet (isaiah|jeremiah|joel|daniel|hosea|zechariah)|"
    r"(david|isaiah|moses|the prophet|the holy spirit|the lord|god) (says|said|declared|wrote|spoke)|"
    r"he says|it says|as he says|for he says|the law says)",
    re.I,
)


def formula_near(nt_verses):
    """Look in the NT passage and the two verses before each of its starts for an introduction to Scripture."""
    seen, checks = set(), []
    for (o, c, v) in nt_verses:
        for k in (v - 2, v - 1, v):
            if k >= 1 and (o, c, k) not in seen:
                seen.add((o, c, k))
                checks.append((o, c, k))
    for (o, c, k) in checks:
        txt = chapter("bsb", o, c)[k - 1] if k <= len(chapter("bsb", o, c)) else ""
        m = FORMULAS.search(txt)
        if m:
            s = max(0, m.start() - 40)
            return {"ref": f"{o}.{c}.{k}", "phrase": ("…" if s else "") + txt[s:m.end() + 50].strip() + ("…" if m.end() + 50 < len(txt) else "")}
    return None


def text_of(verses):
    return " ".join(chapter("bsb", o, c)[v - 1] for (o, c, v) in verses if v <= len(chapter("bsb", o, c)))


def match_share(quoted, actual):
    q = [w for w in words(quoted) if w not in STOP]
    if not q:
        return None
    a = set(words(actual))
    return round(sum(1 for w in q if w in a) / len(q), 2)


def main():
    bridges = json.load(open(os.path.join(D, "prophecies_66_books.json"), encoding="utf-8"))
    extra = os.path.join(D, "appointed_times.json")
    if os.path.exists(extra):
        bridges += json.load(open(extra, encoding="utf-8"))["bridges"]
    out = {}
    for p in bridges:
        ot, ot_prob = parse_refs(p["ot"]["ref"])
        nt, nt_prob = parse_refs(p["nt"]["ref"])
        found = links_between(ot, nt) + links_between(nt, ot)
        found.sort(key=lambda x: -x[2])
        ot_t, nt_t = text_of(ot), text_of(nt)
        n, run = longest_run(words(ot_t), words(nt_t))
        out[p["id"]] = {
            "votes": found[0][2] if found else None,
            "links": found[:5],
            "linkCount": len(found),
            "overlap": {"words": n, "text": run},
            "formula": formula_near(nt),
            "refs": {"ot": "; ".join(ot_prob) or "ok", "nt": "; ".join(nt_prob) or "ok"},
            "textMatch": {"ot": match_share(p["ot"]["text"], ot_t), "nt": match_share(p["nt"]["text"], nt_t)},
        }
    json.dump(out, open(os.path.join(D, "evidence.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    linked = sum(1 for e in out.values() if e["votes"] is not None)
    quoting = sum(1 for e in out.values() if e["overlap"]["words"] >= 5)
    formula = sum(1 for e in out.values() if e["formula"])
    bad_refs = [k for k, e in out.items() if e["refs"]["ot"] != "ok" or e["refs"]["nt"] != "ok"]
    low = [k for k, e in out.items() if (e["textMatch"]["ot"] or 1) < 0.5 or (e["textMatch"]["nt"] or 1) < 0.5]
    print(f"bridges {len(out)} | OpenBible link {linked} | shared wording >=5 words {quoting} | NT introduces Scripture {formula}")
    print(f"reference problems: {bad_refs}")
    print(f"quoted text differs from its reference (<50% of words found): {low}")


if __name__ == "__main__":
    main()
