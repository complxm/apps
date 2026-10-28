"""People and places in each verse, and two small base maps, for the verse sheet.

Inputs (all openly licensed):
  BibleData by Brady Stephenson, CC BY 4.0           https://github.com/BradyStephenson/bible-data
    BibleData-Person.csv, BibleData-PersonLabel.csv, BibleData-PersonVerse.csv
  Bible Geocoding Data by OpenBible.info, CC BY 4.0  https://github.com/openbibleinfo/Bible-Geocoding-Data
    data/ancient.jsonl, data/modern.jsonl
  Natural Earth, public domain                       https://github.com/nvkelso/natural-earth-vector
    geojson/ne_10m_land, ne_50m_land, ne_10m_lakes, ne_10m_rivers_lake_centerlines

Usage: python3 scripts/build_people_places.py <bible-data> <Bible-Geocoding-Data> <natural-earth-vector>   (needs shapely)

Writes:
  data/who/<Osis>/<c>.json  {"p": {id: [name, about]}, "l": {id: [name, type, lon, lat, confidence]}, "v": {"<verse>": [[people], [places]]}}
  data/person/<n>.json      {id: {"n": name, "a": about, "s": sex, "t": tribe, "on": [original name, meaning, "he" | "grc"], "r": [verses]}}
  data/place/<n>.json       {id: {"n": name, "ty": type, "ll": [lon, lat] or null, "c": 0-100, "m": modern site, "u": OpenBible page, "r": [verses]}}
                            n = bucket of the id (see bucket(); the app computes the same)
  data/maps.json            {"holy" | "region": {"bbox", "w", "h", "land", "coast", "water", "rivers"}} projected SVG paths

Edits to the sources: God, the Father and the Son (BibleData's YHVH entries) are left out of the people lists, which are for the
people of the story; "G-d" is written "God"; book codes in descriptions are written out ("RUT 4:17" -> "Ruth 4:17").
"""
import csv
import json
import math
import os
import re
import shutil
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
BOOKS = json.load(open(os.path.join(DATA, "bible", "books.json"), encoding="utf-8"))["books"]
OSIS = [b["osis"] for b in BOOKS]
NAME = {b["osis"]: ("Psalm" if b["osis"] == "Ps" else b["name"]) for b in BOOKS}
USX = ("GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB "
       "ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV").split()
USX2OSIS = dict(zip(USX, OSIS))
ORDER = {o: i for i, o in enumerate(OSIS)}
BUCKETS = 64
CANT = re.compile(r"[֑-ֽ֯׀]")


def bucket(key):
    a = 0
    for ch in key:
        a = (a * 31 + ord(ch)) % BUCKETS
    return a


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def readable(text):
    """'son of Jesse (RUT 4:17)' -> 'son of Jesse (Ruth 4:17)'; 'G-d' -> 'God'."""
    text = text.replace("G-d", "God")
    return re.sub(r"\b([1-3]?[A-Z]{2,3}) (\d+:\d+(?:[-–]\d+)?)", lambda m: f"{NAME[USX2OSIS[m.group(1)]]} {m.group(2)}" if m.group(1) in USX2OSIS else m.group(0), text)


def ref_key(r):
    o, c, v = r.split(".")
    return (ORDER[o], int(c), int(v))


def people(src):
    persons = {r["person_id"]: r for r in csv.DictReader(open(os.path.join(src, "BibleData-Person.csv"), encoding="utf-8-sig"))}
    labels = defaultdict(list)
    for r in csv.DictReader(open(os.path.join(src, "BibleData-PersonLabel.csv"), encoding="utf-8-sig")):
        labels[r["person_id"]].append(r)
    refs = defaultdict(set)
    for r in csv.DictReader(open(os.path.join(src, "BibleData-PersonVerse.csv"), encoding="utf-8-sig")):
        pid = r["person_id"]
        m = re.match(r"^([1-3]?[A-Z]{2,3}) (\d+):(\d+)$", r["reference_id"].strip())
        if not m or pid == "NA" or pid.startswith("YHVH") or pid not in persons or m.group(1) not in USX2OSIS:
            continue
        refs[pid].add(f"{USX2OSIS[m.group(1)]}.{int(m.group(2))}.{int(m.group(3))}")
    out = {}
    for pid, rs in refs.items():
        p = persons[pid]
        ls = sorted(labels.get(pid, []), key=lambda x: int(x["label_sequence"] or 0))
        lab = next((x for x in ls if x["english_label"] == p["person_name"]), ls[0] if ls else None)
        rs = sorted(rs, key=ref_key)
        he = [CANT.sub("", lab["hebrew_label"]).strip(), lab["hebrew_label_meaning"].strip(), "he"] if lab and lab["hebrew_label"] and lab["hebrew_label"] != "[none]" else None
        gr = [lab["greek_label"].strip(), lab["greek_label_meaning"].strip(), "grc"] if lab and lab["greek_label"] and lab["greek_label"] != "[none]" else None
        # The name in the language of the Testament where the person first appears.
        first_nt = ORDER[rs[0].split(".")[0]] >= 39
        out[pid] = {"n": p["person_name"], "a": readable(p["unique_attribute"]), "s": p["sex"], "t": p["tribe"],
                    "on": (gr or he) if first_nt else (he or gr), "r": rs}
    return out


def places(src):
    modern = {}
    for ln in open(os.path.join(src, "data", "modern.jsonl"), encoding="utf-8"):
        m = json.loads(ln)
        modern[m["id"]] = m
    out = {}
    for ln in open(os.path.join(src, "data", "ancient.jsonl"), encoding="utf-8"):
        a = json.loads(ln)
        rs = sorted({v["osis"] for v in a.get("verses", []) if v.get("osis", "").split(".")[0] in ORDER}, key=ref_key)
        if not rs:
            continue
        ll, conf, site = None, 0, ""
        assoc = a.get("modern_associations") or {}
        if assoc:
            mid, best = max(assoc.items(), key=lambda kv: kv[1].get("score", 0))
            if mid in modern and modern[mid].get("lonlat"):
                lon, lat = (float(x) for x in modern[mid]["lonlat"].split(","))
                ll, conf, site = [round(lon, 4), round(lat, 4)], round(best.get("score", 0) / 10), best.get("name", "")
        out[a["id"]] = {"n": re.sub(r"\s+\d+$", "", a["friendly_id"]), "ty": (a.get("types") or [""])[0], "ll": ll, "c": conf, "m": site,
                        "u": f"https://www.openbible.info/geo/ancient/{a['id']}/{a['url_slug']}", "r": rs}
    return out


def maps(ne):
    from shapely.geometry import shape, box, mapping
    from shapely.ops import unary_union

    def load(name):
        return json.load(open(os.path.join(ne, "geojson", name), encoding="utf-8"))["features"]

    frames = {"holy": {"bbox": [33.9, 30.5, 36.7, 33.45], "w": 480, "land": "ne_10m_land.geojson", "tol": 0.35, "lake_min": 0},
              "region": {"bbox": [9.0, 20.0, 54.0, 44.0], "w": 900, "land": "ne_50m_land.geojson", "tol": 1.0, "lake_min": 0.05}}
    lakes, rivers = load("ne_10m_lakes.geojson"), load("ne_10m_rivers_lake_centerlines.geojson")
    out = {}
    for key, fr in frames.items():
        x0, y0, x1, y1 = fr["bbox"]
        k = fr["w"] / ((x1 - x0) * math.cos(math.radians((y0 + y1) / 2)))
        h = round((y1 - y0) * k)
        clip = box(x0, y0, x1, y1)

        def proj(lon, lat):
            return ((lon - x0) * math.cos(math.radians((y0 + y1) / 2)) * k, (y1 - lat) * k)

        def to_path(geom, closed):
            parts = []

            def ring(coords):
                pts = [proj(*c[:2]) for c in coords]
                if len(pts) < 2:
                    return
                parts.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + ("Z" if closed else ""))

            def walk(g):
                t = g.geom_type
                if t == "Polygon":
                    ring(g.exterior.coords)
                    for i in g.interiors:
                        ring(i.coords)
                elif t == "LineString":
                    ring(g.coords)
                elif t in ("MultiPolygon", "MultiLineString", "GeometryCollection"):
                    for x in g.geoms:
                        walk(x)
            walk(geom)
            return "".join(parts)

        def prep(feats, keep=lambda f: True):
            gs = []
            for f in feats:
                if not keep(f):
                    continue
                g = shape(f["geometry"])
                if g.intersects(clip):
                    gs.append(g.intersection(clip))
            return unary_union(gs) if gs else None

        tol_deg = fr["tol"] / k
        land = prep(load(fr["land"]))
        water = prep(lakes, lambda f: shape(f["geometry"]).area >= fr["lake_min"])
        riv = prep(rivers, lambda f: (f["properties"].get("scalerank") or 10) <= (9 if key == "holy" else 6))
        # The coastline is the land's edge minus the frame's edge, so the frame itself is never drawn as coast.
        coast = land.simplify(tol_deg).boundary.difference(clip.exterior.buffer(tol_deg)) if land else None
        out[key] = {"bbox": fr["bbox"], "w": fr["w"], "h": h,
                    "land": to_path(land.simplify(tol_deg), True) if land else "",
                    "coast": to_path(coast, False) if coast else "",
                    "water": to_path(water.simplify(tol_deg), True) if water else "",
                    "rivers": to_path(riv.simplify(tol_deg), False) if riv else ""}
    return out


def main(bibledata, geocoding, ne):
    P, L = people(bibledata), places(geocoding)
    for sub in ("who", "person", "place"):
        shutil.rmtree(os.path.join(DATA, sub), ignore_errors=True)
    by_ch = defaultdict(lambda: {"p": {}, "l": {}, "v": defaultdict(lambda: [[], []])})
    for pid, p in P.items():
        for r in p["r"]:
            o, c, v = r.split(".")
            ch = by_ch[(o, int(c))]
            ch["p"][pid] = [p["n"], p["a"]]
            ch["v"][v][0].append(pid)
    for lid, l in L.items():
        for r in l["r"]:
            o, c, v = r.split(".")
            ch = by_ch[(o, int(c))]
            ch["l"][lid] = [l["n"], l["ty"], *(l["ll"] or [None, None]), l["c"]]
            ch["v"][v][1].append(lid)
    for (o, c), ch in by_ch.items():
        write(os.path.join(DATA, "who", o, f"{c}.json"), {"p": ch["p"], "l": ch["l"], "v": {k: ch["v"][k] for k in sorted(ch["v"], key=int)}})
    # Every chapter gets a file, empty when nobody and nowhere is named, so the app never asks for a missing one.
    for b in BOOKS:
        for c in range(1, len(b["verses"]) + 1):
            if (b["osis"], c) not in by_ch:
                write(os.path.join(DATA, "who", b["osis"], f"{c}.json"), {"p": {}, "l": {}, "v": {}})
    for kind, items in (("person", P), ("place", L)):
        groups = defaultdict(dict)
        for key, x in items.items():
            groups[bucket(key)][key] = x
        for b, d in groups.items():
            write(os.path.join(DATA, kind, f"{b}.json"), d)
    write(os.path.join(DATA, "maps.json"), maps(ne))
    sizes = [os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(os.path.join(DATA, "who")) for f in fs]
    print(f"people {len(P)} | places {len(L)} (located {sum(1 for x in L.values() if x['ll'])}) | chapters {len(by_ch)} | who files {len(sizes)}, largest {max(sizes)} bytes")
    print(f"maps.json {os.path.getsize(os.path.join(DATA, 'maps.json'))} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
