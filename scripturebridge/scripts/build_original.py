"""Original-language layer from STEPBible data (Tyndale House, Cambridge; CC BY 4.0).

Inputs (from github.com/STEPBible/STEPBible-Data):
  Translators Amalgamated OT+NT/TAHOT *.txt   Hebrew OT (Leningrad Codex), word by word, English versification
  Translators Amalgamated OT+NT/TAGNT *.txt   Greek NT, word by word; only words in the Nestle-Aland text are kept
  Lexicons/TBESH *.txt, Lexicons/TBESG *.txt  brief lexicons keyed by extended Strong's numbers

Usage: python3 scripts/build_original.py <path to STEPBible-Data>

Writes:
  data/orig/<Osis>/<chapter>.json   {"<verse>": [[word, transliteration, gloss, strong], ...]}  (Hebrew without cantillation marks)
  data/lex/<H|G>/<n>.json           {"<strong>": {"l": lemma, "t": translit, "g": gloss, "d": definition, "n": occurrences}}
                                    bucket n = Strong's number // 100
  data/occ/<H|G>/<n>.json           {"<strong>": ["Osis.C.V", ...]}  every verse the word occurs in
"""
import glob
import html
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
BOOKS = json.load(open(os.path.join(DATA, "bible", "books.json"), encoding="utf-8"))["books"]
OSIS = [b["osis"] for b in BOOKS]

HEB_FILES = ["TAHOT Gen-Deu", "TAHOT Jos-Est", "TAHOT Job-Sng", "TAHOT Isa-Mal"]
GRK_FILES = ["TAGNT Mat-Jhn", "TAGNT Act-Rev"]
LINE = re.compile(r"^([1-3]?[A-Z][a-z]+)\.(\d+)\.(\d+)(?:\([^)]*\))?#\d+=(\S+)\t")


# Greek letters with "oxia" (U+1F71 ...) are canonically the same as the "tonos" letters (U+03AC ...); NFC maps them
# so, and many fonts only draw the tonos forms. Only these Greek singletons are mapped, so Hebrew text is left exactly as it is.
OXIA = str.maketrans({"\u1f71": "\u03ac", "\u1f73": "\u03ad", "\u1f75": "\u03ae", "\u1f77": "\u03af", "\u1f79": "\u03cc", "\u1f7b": "\u03cd",
                      "\u1f7d": "\u03ce", "\u1fbb": "\u0386", "\u1fc9": "\u0388", "\u1fcb": "\u0389", "\u1fdb": "\u038a", "\u1ff9": "\u038c",
                      "\u1feb": "\u038e", "\u1ffb": "\u038f", "\u1fd3": "\u0390", "\u1fe3": "\u03b0"})


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def find(src, prefix):
    hits = glob.glob(os.path.join(src, "**", prefix + "*.txt"), recursive=True)
    hits = [h for h in hits if "Older Formats" not in h]
    assert hits, prefix
    return hits[0]


def strong_key(s):
    """'{H7225G}' / 'H9003/{H7225G}' / 'G0976=N-NSF' -> main Strong's number."""
    m = re.search(r"\{([HG]\d{4}[A-Za-z]?)\}", s)
    if m:
        return m.group(1)
    ks = re.findall(r"[HG]\d{4}[A-Za-z]?", s)
    return ks[-1] if ks else None


def clean_def(raw, limit):
    s = raw.replace("<BR />", "\n").replace("<BR>", "\n").replace("<br>", "\n").replace("<br />", "\n")
    s = re.sub(r"<ref='[^']*'>", "", s).replace("</ref>", "")
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("__", "")
    s = "\n".join(re.sub(r"\s+", " ", ln).strip() for ln in s.split("\n"))
    s = re.sub(r"\n{2,}", "\n", s).strip()
    return s if len(s) <= limit else s[:limit].rsplit(" ", 1)[0] + " …"


def read_lexicon(path, limit):
    lex = {}
    for ln in open(path, encoding="utf-8"):
        cols = ln.rstrip("\n").split("\t")
        if len(cols) < 8 or not re.match(r"^[HG]\d{4}", cols[0]):
            continue
        key = cols[1].split(" ")[0].strip() or cols[0].strip()
        if not re.match(r"^[HG]\d{4}[A-Za-z]?$", key) or key in lex:
            continue
        lex[key] = {"l": cols[3].strip().translate(OXIA), "t": cols[4].strip().replace(".", ""), "g": cols[6].strip(), "d": clean_def(cols[7], limit).translate(OXIA)}
    return lex


def main(src):
    abbr_order, words, occ = [], defaultdict(lambda: defaultdict(list)), defaultdict(set)
    counts = defaultdict(int)

    def osis_of(abbr):
        if abbr not in abbr_order:
            abbr_order.append(abbr)
        return OSIS[abbr_order.index(abbr)]

    # Hebrew: word / transliteration / translation / dStrongs
    for name in HEB_FILES:
        for ln in open(find(src, name), encoding="utf-8"):
            m = LINE.match(ln)
            if not m:
                continue
            cols = ln.rstrip("\n").split("\t")
            o = osis_of(m.group(1))
            c, v = int(m.group(2)), int(m.group(3))
            # Keep consonants and vowel points; drop cantillation (chanting accents, U+0591-U+05AF) and meteg/paseq.
            w = re.sub(r"[\u0591-\u05AF\u05BD\u05C0]", "", cols[1].replace("/", "").replace("\\", "")).strip()
            tr = cols[2].replace("/", "").replace(".", "").strip().lower()
            gl = re.sub(r"\s+", " ", cols[3].replace("/", " ")).strip().replace("<obj.>", "[obj.]")
            s = strong_key(cols[4])
            words[(o, c)][v].append([w, tr, gl, s])
            if s:
                counts[s] += 1
                occ[s].add((o, c, v))
    # Greek: keep the Nestle-Aland text (type starts with N or n)
    for name in GRK_FILES:
        for ln in open(find(src, name), encoding="utf-8"):
            m = LINE.match(ln)
            if not m or not m.group(4)[:1] in ("N", "n"):
                continue
            cols = ln.rstrip("\n").split("\t")
            o = osis_of(m.group(1))
            c, v = int(m.group(2)), int(m.group(3))
            wm = re.match(r"^(.*?)\s*\(([^)]*)\)\s*$", cols[1].strip())
            w, tr = (wm.group(1), wm.group(2)) if wm else (cols[1].strip(), "")
            w = w.translate(OXIA)
            gl = re.sub(r"\s+", " ", cols[2]).strip()
            s = strong_key(cols[3].split("=")[0])
            words[(o, c)][v].append([w, tr, gl, s])
            if s:
                counts[s] += 1
                occ[s].add((o, c, v))
    assert len(abbr_order) == 66, (len(abbr_order), abbr_order)

    for (o, c), by_v in words.items():
        write(os.path.join(DATA, "orig", o, f"{c}.json"), {str(v): ws for v, ws in sorted(by_v.items())})

    lex = {}
    lex.update(read_lexicon(find(src, "TBESH"), 900))
    lex.update(read_lexicon(find(src, "TBESG"), 1400))
    order = {o: i for i, o in enumerate(OSIS)}
    lex_out, occ_out, missing = defaultdict(dict), defaultdict(dict), 0
    for s, n in counts.items():
        e = lex.get(s) or lex.get(s[:5]) or next((lex[k] for k in (s[:5] + x for x in "ABCDEFGH") if k in lex), None)
        if not e:
            missing += 1
            e = {"l": "", "t": "", "g": "", "d": ""}
        b = f"{s[0]}/{int(s[1:5]) // 100}"
        lex_out[b][s] = {**e, "n": n}
        occ_out[b][s] = [f"{o}.{c}.{v}" for (o, c, v) in sorted(occ[s], key=lambda x: (order[x[0]], x[1], x[2]))]
    for b, d in lex_out.items():
        write(os.path.join(DATA, "lex", b + ".json"), d)
    for b, d in occ_out.items():
        write(os.path.join(DATA, "occ", b + ".json"), d)

    nw = sum(len(ws) for by_v in words.values() for ws in by_v.values())
    print(f"chapters {len(words)}, words {nw}, distinct Strong's {len(counts)}, without a lexicon entry {missing}")
    print("book abbreviations mapped:", " ".join(f"{a}={o}" for a, o in zip(abbr_order, OSIS)))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
