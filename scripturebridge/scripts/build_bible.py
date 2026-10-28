"""Build the per-chapter Bible text and cross-reference files the reader loads on demand.

Sources (both from github.com/scrollmapper/bible_databases):
  formats/json/BSB.json                 Berean Standard Bible, CC0 (public domain)
  sources/extras/cross_references.txt   OpenBible.info cross references, CC BY (export 2024-11-04)

Usage:
  python3 scripts/build_bible.py <path/to/BSB.json> <path/to/cross_references.txt>

Writes, next to this script's app folder:
  data/bible/books.json                      66 books: osis id, name, testament, verse counts per chapter
  data/bible/bsb/<Osis>/<chapter>.json       ["verse 1 text", "verse 2 text", ...]  ("" = verse omitted by the BSB)
  data/bible/xref/<Osis>/<chapter>.json      {"<verse>": [[target, votes], ...]} sorted by votes, highest first
                                             target is "Osis.C.V", "Osis.C.V-V2" or "Osis.C.V-Osis2.C2.V2"
  data/bible/xin/<Osis>/<chapter>.json       {"<verse>": [["Osis.C.V", votes], ...]} the verses that point HERE
                                             (OpenBible lists each link one way only), excluding any already
                                             listed under xref for that verse, sorted by votes
"""
import json
import os
import sys
from collections import defaultdict

# Canonical order with OpenBible/OSIS abbreviations and the names the app already uses.
BOOKS = [
    ("Gen", "Genesis"), ("Exod", "Exodus"), ("Lev", "Leviticus"), ("Num", "Numbers"), ("Deut", "Deuteronomy"),
    ("Josh", "Joshua"), ("Judg", "Judges"), ("Ruth", "Ruth"), ("1Sam", "1 Samuel"), ("2Sam", "2 Samuel"),
    ("1Kgs", "1 Kings"), ("2Kgs", "2 Kings"), ("1Chr", "1 Chronicles"), ("2Chr", "2 Chronicles"), ("Ezra", "Ezra"),
    ("Neh", "Nehemiah"), ("Esth", "Esther"), ("Job", "Job"), ("Ps", "Psalms"), ("Prov", "Proverbs"),
    ("Eccl", "Ecclesiastes"), ("Song", "Song of Solomon"), ("Isa", "Isaiah"), ("Jer", "Jeremiah"), ("Lam", "Lamentations"),
    ("Ezek", "Ezekiel"), ("Dan", "Daniel"), ("Hos", "Hosea"), ("Joel", "Joel"), ("Amos", "Amos"),
    ("Obad", "Obadiah"), ("Jonah", "Jonah"), ("Mic", "Micah"), ("Nah", "Nahum"), ("Hab", "Habakkuk"),
    ("Zeph", "Zephaniah"), ("Hag", "Haggai"), ("Zech", "Zechariah"), ("Mal", "Malachi"),
    ("Matt", "Matthew"), ("Mark", "Mark"), ("Luke", "Luke"), ("John", "John"), ("Acts", "Acts"),
    ("Rom", "Romans"), ("1Cor", "1 Corinthians"), ("2Cor", "2 Corinthians"), ("Gal", "Galatians"), ("Eph", "Ephesians"),
    ("Phil", "Philippians"), ("Col", "Colossians"), ("1Thess", "1 Thessalonians"), ("2Thess", "2 Thessalonians"),
    ("1Tim", "1 Timothy"), ("2Tim", "2 Timothy"), ("Titus", "Titus"), ("Phlm", "Philemon"), ("Heb", "Hebrews"),
    ("Jas", "James"), ("1Pet", "1 Peter"), ("2Pet", "2 Peter"), ("1John", "1 John"), ("2John", "2 John"),
    ("3John", "3 John"), ("Jude", "Jude"), ("Rev", "Revelation"),
]
OSIS = [b[0] for b in BOOKS]


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def compact_target(t):
    """Gen.1.1-Gen.1.3 -> Gen.1.1-3 when the range stays in one chapter."""
    if "-" not in t:
        return t
    a, b = t.split("-", 1)
    ab, ac, av = a.split(".")
    bb, bc, bv = b.split(".")
    return f"{a}-{bv}" if (ab, ac) == (bb, bc) else t


def expand(target, verse_counts):
    """All (book, chapter, verse) a target like Gen.1.1, Gen.1.1-Gen.1.3 or Gen.1.31-Gen.2.3 covers."""
    a, _, b = target.partition("-")
    ab, ac, av = a.split(".")
    bb, bc, bv = (b.split(".") if b else (ab, ac, av))
    i0, i1 = OSIS.index(ab), OSIS.index(bb)
    out, (c, v) = [], (int(ac), int(av))
    for bi in range(i0, i1 + 1):
        book, counts = OSIS[bi], verse_counts[OSIS[bi]]
        last_c = int(bc) if bi == i1 else len(counts)
        while c <= last_c:
            last_v = int(bv) if (bi == i1 and c == int(bc)) else counts[c - 1]
            out += [(book, c, x) for x in range(v, min(last_v, counts[c - 1]) + 1)]
            c, v = c + 1, 1
        c, v = 1, 1
        if len(out) > 200:  # guard against a malformed range
            break
    return out


def main(bsb_path, xref_path):
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, "data", "bible")

    bsb = json.load(open(bsb_path, encoding="utf-8"))
    assert len(bsb["books"]) == 66, "expected 66 books"
    meta, verses_total, omitted = [], 0, 0
    for i, book in enumerate(bsb["books"]):
        osis, name = BOOKS[i]
        counts = []
        for ch in book["chapters"]:
            texts = [v["text"].strip() for v in ch["verses"]]
            assert [v["verse"] for v in ch["verses"]] == list(range(1, len(texts) + 1)), (osis, ch["chapter"])
            write(os.path.join(out, "bsb", osis, f"{ch['chapter']}.json"), texts)
            counts.append(len(texts))
            verses_total += len(texts)
            omitted += sum(1 for t in texts if not t)
        meta.append({"osis": osis, "name": name, "testament": "OT" if i < 39 else "NT", "verses": counts})

    verse_counts = {BOOKS[i][0]: [len(ch["verses"]) for ch in book["chapters"]] for i, book in enumerate(bsb["books"])}
    xref = defaultdict(lambda: defaultdict(list))  # (osis, chapter) -> verse -> [[target, votes]]
    xin = defaultdict(lambda: defaultdict(dict))   # (osis, chapter) -> verse -> {source: votes}
    links = 0
    with open(xref_path, encoding="utf-8") as f:
        header = f.readline()
        assert header.startswith("From Verse"), header
        for line in f:
            line = line.strip()
            if not line:
                continue
            src, dst, votes = line.split("\t")
            b, c, v = src.split(".")
            assert b in OSIS and dst.split(".")[0] in OSIS, line
            xref[(b, int(c))][int(v)].append([compact_target(dst), int(votes)])
            links += 1
            # Every verse the target covers gets this source as an incoming link.
            for tb, tc, tv in expand(dst, verse_counts):
                xin[(tb, tc)][tv][src] = max(int(votes), xin[(tb, tc)][tv].get(src, -10**9))
    for (b, c), by_verse in xref.items():
        write(os.path.join(out, "xref", b, f"{c}.json"),
              {str(v): sorted(lst, key=lambda x: -x[1]) for v, lst in sorted(by_verse.items())})
    incoming = 0
    for (b, c), by_verse in xin.items():
        doc = {}
        for v, sources in sorted(by_verse.items()):
            already = {t.split("-")[0] for t, _ in xref.get((b, c), {}).get(v, [])}
            lst = sorted(([s_, n] for s_, n in sources.items() if s_ not in already), key=lambda x: -x[1])
            if lst:
                doc[str(v)] = lst
                incoming += len(lst)
        if doc:
            write(os.path.join(out, "xin", b, f"{c}.json"), doc)

    meta_doc = {
        "translation": {"id": "BSB", "name": "Berean Standard Bible", "licence": "Public domain (CC0)", "url": "https://berean.bible"},
        "crossReferences": {"source": "OpenBible.info", "licence": "CC BY", "url": "https://www.openbible.info/labs/cross-references/",
                            "export": header.strip().split("#")[-1].strip(), "links": links, "incoming": incoming},
        "books": meta,
    }
    write(os.path.join(out, "books.json"), meta_doc)
    print(f"books 66, chapters {sum(len(m['verses']) for m in meta)}, verses {verses_total} ({omitted} omitted by the BSB), cross references {links}, incoming shown in reverse {incoming}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
