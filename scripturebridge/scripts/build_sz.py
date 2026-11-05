"""Add Biblica® Słowo Życia, otwarty dostęp (Open Polish Living New Testament, 2016) to the app's Bibles.

Source: github.com/BibleNLP/ebible (mirror of eBible.org), corpus/pol-polsz.txt with metadata/vref.txt
(one verse per line, aligned line by line). Licence: CC BY-SA 4.0, © 1991, 2005, 2016 Biblica, Inc.
Attribution required: "Original work available for free at www.biblica.com and open.bible". The text is shared
unchanged: only surrounding whitespace is trimmed; "<range>" (a verse translated together with the one before it)
becomes "" and is recorded in "joined", so the reader shows one line numbered "13–14".

New Testament only: the app reads the Old Testament from "fallback" (UBG) and says so.

Usage (after scripts/build_bible.py, which rewrites books.json):
  python3 scripts/build_sz.py <path/to/vref.txt> <path/to/pol-polsz.txt>
Writes data/bible/sz/<Osis>/<chapter>.json and adds the "sz" entry to data/bible/books.json.
"""
import json
import os
import sys

USFM = {"MAT": "Matt", "MRK": "Mark", "LUK": "Luke", "JHN": "John", "ACT": "Acts", "ROM": "Rom", "1CO": "1Cor", "2CO": "2Cor",
        "GAL": "Gal", "EPH": "Eph", "PHP": "Phil", "COL": "Col", "1TH": "1Thess", "2TH": "2Thess", "1TI": "1Tim", "2TI": "2Tim",
        "TIT": "Titus", "PHM": "Phlm", "HEB": "Heb", "JAS": "Jas", "1PE": "1Pet", "2PE": "2Pet", "1JN": "1John", "2JN": "2John",
        "3JN": "3John", "JUD": "Jude", "REV": "Rev"}

app = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vref_path, text_path = sys.argv[1], sys.argv[2]
meta_path = os.path.join(app, "data", "bible", "books.json")
meta = json.load(open(meta_path, encoding="utf-8"))
counts = {b["osis"]: b["verses"] for b in meta["books"]}

refs = open(vref_path, encoding="utf-8").read().splitlines()
lines = open(text_path, encoding="utf-8-sig").read().splitlines()
assert len(refs) == len(lines), (len(refs), len(lines))

chapters, joined, notes = {}, {}, []
for ref, txt in zip(refs, lines):
    book, cv = ref.split(" ")
    if book not in USFM or not txt.strip():
        continue
    osis = USFM[book]
    c, v = (int(x) for x in cv.split(":"))
    n = counts[osis][c - 1]
    ch = chapters.setdefault((osis, c), [""] * n)
    t = txt.strip()
    if v > n:  # a verse beyond the app's numbering joins the last verse
        notes.append(f"{osis} {c}:{v} beyond {n}: appended to {c}:{n}")
        ch[n - 1] = (ch[n - 1] + " " + ("" if t == "<range>" else t)).strip()
        continue
    if t == "<range>":
        # Joined to the nearest earlier verse that has text.
        k = v - 1
        while k > 1 and not ch[k - 1]:
            k -= 1
        joined.setdefault(f"{osis}/{c}", {})[str(v)] = k
        continue
    ch[v - 1] = t

# A chapter's last verse with no text of its own: this Bible numbers the chapter one shorter (Acts 19:41 is in 19:40,
# 2 Corinthians 13:14 is 13:13), so it is joined to the verse before.
for (osis, c), verses in chapters.items():
    n = len(verses)
    if n > 1 and not verses[n - 1] and verses[n - 2] and str(n) not in joined.get(f"{osis}/{c}", {}):
        joined.setdefault(f"{osis}/{c}", {})[str(n)] = n - 1
        notes.append(f"{osis} {c}:{n} has no text of its own: joined to {c}:{n - 1}")

written = 0
for (osis, c), verses in chapters.items():
    d = os.path.join(app, "data", "bible", "sz", osis)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f"{c}.json"), "w", encoding="utf-8") as f:
        json.dump(verses, f, ensure_ascii=False, separators=(",", ":"))
    written += 1
# Every New Testament chapter is present.
nt = [b for b in meta["books"] if b["testament"] == "NT"]
missing = [f"{b['osis']} {c}" for b in nt for c in range(1, len(b["verses"]) + 1) if (b["osis"], c) not in chapters]
assert not missing, missing
empty = sum(1 for (o, c), vs in chapters.items() for i, x in enumerate(vs) if not x and str(i + 1) not in joined.get(f"{o}/{c}", {}))

entry = {"id": "sz", "label": "SŻ", "name": "Biblica® Słowo Życia", "lang": "pl",
         "licence": "© 1991, 2005, 2016 Biblica, Inc., CC BY-SA 4.0", "url": "https://open.bible",
         "empty": "Brak osobnego wersetu w tym przekładzie.", "nt": True, "fallback": "ubg", "joined": joined}
ts = [t for t in meta["translations"] if t["id"] != "sz"]
at = next((i + 1 for i, t in enumerate(ts) if t["id"] == "ubg"), len(ts))
meta["translations"] = ts[:at] + [entry] + ts[at:]
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, separators=(",", ":"))
print(f"chapters {written}, joined verses {sum(len(x) for x in joined.values())}, verses without text {empty}")
for n in notes:
    print(" ", n)
