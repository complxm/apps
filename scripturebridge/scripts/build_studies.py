"""Build the Studies data and the catalogue from the mapped Berean Study videos.

Source: research/berean-study/steps/<id>.json, one per video. Each holds the passages the teacher turns to, in his
order, with a timestamp, how he uses each passage (read aloud or only mentioned), the version he reads from, and a
short note in our own words on what he draws from it (with Polish in "pl"). No transcript text is stored.

Writes:
  data/studies/index.json     series and studies (title, question, summary, length, number of steps; Polish in "pl")
  data/studies/<id>.json      one study with its steps, references normalised to the app's book names
  data/studies/verses.json    {"Osis.C": {"v": [[study, step, seconds, "read"|"cited"], ...]}}, the verse sheet's "In the studies"
  research/berean-study/CATALOGUE.md

Usage: python3 scripts/build_studies.py
"""
import json, os, re, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "research", "berean-study", "steps")
OUT = os.path.join(ROOT, "data", "studies")

SERIES = [
    {"id": "hope", "title": "Our Blessed Hope", "pl": {"title": "Nasza błogosławiona nadzieja"}, "parts": ["hope1", "hope2", "hope3", "hope4", "hope5"]},
    {"id": "saved", "title": "What Must We Do? Biblical Salvation", "pl": {"title": "Co mamy czynić? Biblijne zbawienie"}, "parts": ["saved1", "saved2", "saved3"]},
]
SINGLES = ["godhead", "passion"]
SOURCE = {"name": "The Berean Study", "kind": "YouTube channel", "url": None}

books = json.load(open(os.path.join(ROOT, "data", "bible", "books.json"), encoding="utf-8"))["books"]
BY_NAME = {b["name"].lower(): b for b in books}
BY_NAME.update({"psalm": BY_NAME["psalms"], "song of songs": BY_NAME["song of solomon"], "revelations": BY_NAME["revelation"]})
RX = re.compile(r"^\s*(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(?:(\d+):)?(\d+))?)?\s*$")


def norm_ref(ref):
    """'Isaiah 52:13-53:12' -> ('Isaiah 52:13-15; 53:1-12', book, [(c, v1, v2), ...]); a bare chapter -> v1 = v2 = None."""
    m = RX.match(ref)
    assert m, ref
    b = BY_NAME[m.group(1).strip().lower()]
    c1 = int(m.group(2))
    counts = b["verses"]
    assert 1 <= c1 <= len(counts), ref
    if not m.group(3):
        return f"{b['name']} {c1}", b, [(c1, None, None)]
    v1 = int(m.group(3))
    c2 = int(m.group(4)) if m.group(4) else c1
    v2 = int(m.group(5)) if m.group(5) else v1
    assert c2 <= len(counts) and v1 <= counts[c1 - 1] and v2 <= counts[c2 - 1] and (c2, v2) >= (c1, v1), ref
    spans = []
    for c in range(c1, c2 + 1):
        a = v1 if c == c1 else 1
        z = v2 if c == c2 else counts[c - 1]
        spans.append((c, a, z))
    text = "; ".join(
        (f"{b['name']} " if i == 0 else "") + f"{c}:{a}" + (f"-{z}" if z != a else "")
        for i, (c, a, z) in enumerate(spans))
    return text, b, spans


def hms(t):
    h, m, s = t // 3600, t % 3600 // 60, t % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def main():
    order = [p for s in SERIES for p in s["parts"]] + SINGLES
    studies, index, verses = {}, {}, collections.defaultdict(lambda: collections.defaultdict(list))
    for sid in order:
        d = json.load(open(os.path.join(SRC, sid + ".json"), encoding="utf-8"))
        se = next((s for s in SERIES if sid in s["parts"]), None)
        steps = []
        for i, st in enumerate(d["steps"]):
            ref, b, spans = norm_ref(st["ref"])
            o = {"t": st["t"], "ref": ref, "kind": st["kind"], "version": st["version"], "point": st["point"]}
            if st.get("note"):
                o["note"] = st["note"]
            steps.append(o)
            n = sum((z - a + 1) for _, a, z in spans if a)
            if st["kind"] == "read" or (n and n <= 12):
                for c, a, z in spans:
                    if a is None:
                        continue
                    for v in range(a, z + 1):
                        verses[f"{b['osis']}.{c}"][str(v)].append([sid, i, st["t"], st["kind"]])
        pl = d.get("pl")
        assert pl and len(pl["steps"]) == len(steps), sid
        study = {"id": sid, "title": d["title"], "question": d["question"], "summary": d["summary"], "claims": d["claims"], "topics": d["topics"],
                 "dur": d["dur"], "video": d.get("video"), "series": se and se["id"], "part": se and se["parts"].index(sid) + 1,
                 "steps": steps, "pl": pl}
        studies[sid] = study
        write(os.path.join(OUT, sid + ".json"), study)
        index[sid] = {"title": d["title"], "question": d["question"], "dur": d["dur"], "steps": len(steps), "video": d.get("video"),
                      "series": study["series"], "part": study["part"], "pl": {"title": pl["title"], "question": pl["question"]}}
    write(os.path.join(OUT, "index.json"), {"source": SOURCE, "series": SERIES, "studies": index})
    write(os.path.join(OUT, "verses.json"), {k: dict(v) for k, v in sorted(verses.items())})
    catalogue(order, studies)
    print(f"{len(studies)} studies, {sum(len(s['steps']) for s in studies.values())} steps, "
          f"{sum(len(v) for v in verses.values())} verses indexed in {len(verses)} chapters")


def catalogue(order, studies):
    book_of = lambda ref: BY_NAME[RX.match(ref.split(";")[0]).group(1).strip().lower()]
    L = ["# The Berean Study: catalogue of studies", "",
         "Every passage the teacher turns to in ten videos, in his order, with the time in the video. "
         "*Read* = he reads it aloud (and from which version); *mentioned* = he points to it without reading it. "
         "Notes are in our own words; the views are the teacher's. Built by `scripts/build_studies.py` from `steps/`; "
         "the same data drives **Threads → Studies** in the app.", ""]
    tot = sum(len(s["steps"]) for s in studies.values())
    rd = sum(1 for s in studies.values() for x in s["steps"] if x["kind"] == "read")
    hours = sum(s["dur"] for s in studies.values()) / 3600
    L += [f"**{len(studies)} videos · {hours:.0f} hours · {tot} steps ({rd} read aloud, {tot - rd} mentioned)**", "", "## Contents", ""]
    for s in SERIES:
        L.append(f"- **{s['title']}** ({len(s['parts'])} parts)")
        L += [f"  - [{studies[p]['title']}](#{p}) · {len(studies[p]['steps'])} steps · {hms(studies[p]['dur'])}" for p in s["parts"]]
    L.append("- **Single studies**")
    L += [f"  - [{studies[p]['title']}](#{p}) · {len(studies[p]['steps'])} steps · {hms(studies[p]['dur'])}" for p in SINGLES]
    L += ["- [Index: books](#index-books) · [Index: passages taught in more than one video](#index-passages) · [Index: topics](#index-topics)", ""]

    for sid in order:
        s = studies[sid]
        vers = collections.Counter(x["version"] for x in s["steps"] if x["kind"] == "read")
        L += [f'<a id="{sid}"></a>', "", f"## {s['title']}", "",
              f"*{hms(s['dur'])} · {len(s['steps'])} steps · read from " + ", ".join(f"{k} ({n})" for k, n in vers.most_common()) + "*", "",
              f"**Question:** {s['question']}", "", s["summary"], "", "**What he concludes**", ""]
        L += [f"- {c}" for c in s["claims"]]
        L += ["", "**Topics:** " + ", ".join(s["topics"]), "", "| # | Time | Passage | How | What he draws from it |", "|---|---|---|---|---|"]
        for i, x in enumerate(s["steps"]):
            how = f"read ({x['version']})" if x["kind"] == "read" else "mentioned"
            pt = x["point"] + (f" *({x['note']})*" if x.get("note") else "")
            L.append(f"| {i + 1} | {hms(x['t'])} | {x['ref']} | {how} | {pt.replace('|', '/')} |")
        L.append("")

    L += ['<a id="index-books"></a>', "", "## Index: books", "", "| Book | Steps | Read aloud | Videos |", "|---|---|---|---|"]
    by_book = collections.defaultdict(lambda: [0, 0, set()])
    for sid in order:
        for x in studies[sid]["steps"]:
            b = book_of(x["ref"])
            e = by_book[b["name"]]
            e[0] += 1; e[1] += x["kind"] == "read"; e[2].add(sid)
    for b in books:
        if b["name"] in by_book:
            e = by_book[b["name"]]
            L.append(f"| {b['name']} | {e[0]} | {e[1]} | {', '.join(f'[{sid}](#{sid})' for sid in order if sid in e[2])} |")

    L += ["", '<a id="index-passages"></a>', "", "## Index: passages taught in more than one video", "",
          "Chapters he turns to in two or more videos, with each visit (video and time).", "", "| Chapter | Videos | Visits |", "|---|---|---|"]
    ch = collections.defaultdict(list)
    for sid in order:
        for x in studies[sid]["steps"]:
            first = x["ref"].split(";")[0]
            m = RX.match(first)
            ch[(book_of(first)["index"] if "index" in book_of(first) else books.index(book_of(first)), int(m.group(2)))].append((sid, x["t"], x["ref"]))
    rows = []
    for (bi, c), visits in ch.items():
        vids = {v[0] for v in visits}
        if len(vids) >= 2:
            rows.append((-len(vids), bi, c, visits))
    for nv, bi, c, visits in sorted(rows):
        L.append(f"| {books[bi]['name']} {c} | {-nv} | " + "; ".join(f"{sid} {hms(t)} ({r.split(' ', 1)[1] if ' ' in r else r})" for sid, t, r in visits) + " |")

    L += ["", '<a id="index-topics"></a>', "", "## Index: topics", ""]
    tp = collections.defaultdict(list)
    for sid in order:
        for t in studies[sid]["topics"]:
            tp[t.lower()].append(sid)
    for t in sorted(tp):
        L.append(f"- **{t}**: " + ", ".join(f"[{studies[s]['title']}](#{s})" for s in tp[t]))
    L += ["", "---", "Source: the teaching of The Berean Study (YouTube). Transcripts are not reproduced here; only references, times and our summaries."]
    path = os.path.join(ROOT, "research", "berean-study", "CATALOGUE.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write("\n".join(L) + "\n")


if __name__ == "__main__":
    main()
