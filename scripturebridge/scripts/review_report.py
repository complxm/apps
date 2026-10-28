"""Turn data/review.json into research/bridge-review.md: every bridge with the review's verdict, issues and note, grouped by verdict.

Usage: python3 scripts/review_report.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data")


def main():
    review = json.load(open(os.path.join(D, "review.json"), encoding="utf-8"))["bridges"]
    bridges = json.load(open(os.path.join(D, "prophecies_66_books.json"), encoding="utf-8"))
    bridges += json.load(open(os.path.join(D, "appointed_times.json"), encoding="utf-8"))["bridges"]
    ev = json.load(open(os.path.join(D, "evidence.json"), encoding="utf-8"))
    by_id = {p["id"]: p for p in bridges}
    groups = {"reconsider": [], "revise": [], "keep": []}
    for pid, r in review.items():
        groups[r["verdict"]].append(pid)
    words = {
        "link": {"quotation": "quoted", "allusion": "echoed", "theme": "shared theme"},
        "verdict": {"reconsider": "Reconsider: the link is weak or the claim overstates it",
                    "revise": "Revise: the link is real, but references, labels or wording need fixing",
                    "keep": "Keep: sound as it is"},
    }
    out = ["# Bridge review", "",
           "Each bridge was checked against the Berean Standard Bible text, the OpenBible.info cross-references and the way the New "
           "Testament uses the Old (written with AI assistance; `data/review.json`, generated report `scripts/review_report.py`). "
           "The app shows each bridge's strength, kind of link and note; the verdicts and issues below are the review's record.", "",
           "Terms: **quoted** = the New Testament cites the words; **echoed** = a clear allusion (a hint at the words or story without "
           "quoting); **shared theme** = only the idea is shared. **Typology** = an earlier person, event or institution that "
           "foreshadows Christ. **Votes** = the strongest OpenBible.info reader-voted cross-reference between the two passages.", "",
           f"{len(groups['reconsider'])} reconsider · {len(groups['revise'])} revise · {len(groups['keep'])} keep. "
           "Every issue listed here has since been corrected in the app's data (English and Polish) and the corrections were "
           "checked again independently; the italic line under each bridge says what changed. The verdicts and issues are kept as "
           "the record of the review.", ""]
    for verdict in ("reconsider", "revise", "keep"):
        ids = sorted(groups[verdict], key=lambda x: int(x[1:]))
        out += [f"## {words['verdict'][verdict]} ({len(ids)})", ""]
        for pid in ids:
            p, r, e = by_id[pid], review[pid], ev.get(pid, {})
            votes = e.get("votes")
            out.append(f"### {pid} · {p['title']}")
            out.append(f"{p['ot']['ref']} → {p['nt']['ref']} · now *{p['type']}* · {r['strength']} link, "
                       f"{words['link'][r['link']]}, {r['reading']}" + (f" · {votes} votes" if votes else " · no direct OpenBible link"))
            out.append("")
            out.append(r["note"])
            if r.get("issues"):
                out.append("")
                out += [f"- {i}" for i in r["issues"]]
            if r.get("resolved"):
                out += ["", f"*{r['resolved']}*"]
            out.append("")
    os.makedirs(os.path.join(ROOT, "research"), exist_ok=True)
    open(os.path.join(ROOT, "research", "bridge-review.md"), "w", encoding="utf-8").write("\n".join(out))
    print({k: len(v) for k, v in groups.items()})


if __name__ == "__main__":
    main()
