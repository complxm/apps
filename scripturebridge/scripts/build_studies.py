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


def span(ref):
    """Book, first (c, v) and last (c, v) a reference covers; a bare chapter covers all of it."""
    _, b, spans = norm_ref(ref)
    c1, a1, _ = spans[0]
    c2, _, z2 = spans[-1]
    if a1 is None:
        a1, z2 = 1, b["verses"][c2 - 1]
    return b, (c1, a1), (c2, z2)


def overlaps(r1, r2):
    b1, s1, e1 = span(r1)
    b2, s2, e2 = span(r2)
    return b1["name"] == b2["name"] and s1 <= e2 and s2 <= e1


def union_ref(refs):
    b = span(refs[0])[0]
    lo = min(span(r)[1] for r in refs)
    hi = max(span(r)[2] for r in refs)
    if lo[0] == hi[0]:
        if lo[1] == 1 and hi[1] == b["verses"][lo[0] - 1] and all(":" not in r for r in refs):
            return f"{b['name']} {lo[0]}"
        return f"{b['name']} {lo[0]}:{lo[1]}" + (f"-{hi[1]}" if hi[1] != lo[1] else "")
    return f"{b['name']} {lo[0]}:{lo[1]}-{hi[0]}:{hi[1]}"


def merge_repeats(steps, pl_steps):
    """Back-to-back steps on overlapping verses become one step: the passage is shown once and each thing he
    says about it is kept, with its own time ("at" lists the time of each paragraph of "point").
    The passage shown is what he read aloud when there is a reading (not a whole chapter he only mentions).
    A return to a passage after other passages stays a step of its own."""
    groups = []
    for st, ps in zip(steps, pl_steps):
        g = groups[-1] if groups else None
        if g and overlaps(union_ref(g["refs"]), st["ref"]):
            g["parts"].append((st, ps)); g["refs"].append(st["ref"])
        else:
            groups.append({"parts": [(st, ps)], "refs": [st["ref"]]})
    out, out_pl = [], []
    for g in groups:
        parts = g["parts"]
        if len(parts) == 1:
            out.append(parts[0][0]); out_pl.append(parts[0][1]); continue
        reads = [st for st, _ in parts if st["kind"] == "read"]
        vers = []
        for st in reads:
            if st["version"] not in vers and st["version"] not in ("-", "unknown"):
                vers.append(st["version"])
        named = [v for v in vers if v != "other"] or vers
        m = {"t": parts[0][0]["t"], "ref": union_ref([st["ref"] for st in (reads or [p[0] for p in parts])]),
             "kind": "read" if reads else "cited", "version": ", ".join(named) if reads else "-",
             "point": "\n\n".join(st["point"] for st, _ in parts), "at": [st["t"] for st, _ in parts]}
        notes = [st["note"] for st, _ in parts if st.get("note")]
        if notes:
            m["note"] = " ".join(notes)
        mp = {"point": "\n\n".join(ps["point"] for _, ps in parts)}
        notes_pl = [ps["note"] for _, ps in parts if ps.get("note")]
        if notes_pl:
            mp["note"] = " ".join(notes_pl)
        out.append(m); out_pl.append(mp)
    return out, out_pl


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
    merged_away = {}
    for sid in order:
        d = json.load(open(os.path.join(SRC, sid + ".json"), encoding="utf-8"))
        se = next((s for s in SERIES if sid in s["parts"]), None)
        pl = d.get("pl")
        assert pl and len(pl["steps"]) == len(d["steps"]), sid
        raw = len(d["steps"])
        d["steps"], pl["steps"] = merge_repeats(d["steps"], pl["steps"])
        merged_away[sid] = raw - len(d["steps"])
        steps = []
        for i, st in enumerate(d["steps"]):
            ref, b, spans = norm_ref(st["ref"])
            o = {"t": st["t"], "ref": ref, "kind": st["kind"], "version": st["version"], "point": st["point"]}
            if st.get("at"):
                o["at"] = st["at"]
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
    print("repeats merged:", merged_away, sum(merged_away.values()))
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
            paras = x["point"].split("\n\n")
            pt = " ".join(f"**{hms(t)}** {p}" for t, p in zip(x["at"], paras)) if x.get("at") else x["point"]
            pt += f" *({x['note']})*" if x.get("note") else ""
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
