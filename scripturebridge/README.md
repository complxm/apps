# ScriptureBridge: Whole-Bible Prophecy & Cross-Reference Explorer

**ScriptureBridge** is an interactive, zero-dependency web application that transforms flat Bible cross-reference lists into a guided, semantic study experience across **all 66 books of the Bible**.

## Features

- **Dual-Pane Prophecy Explorer (77 Curated Bridges Across All 66 Books):** Compare Old Testament promises and New Testament fulfillments side by side with highlighted key phrases, historical context, era gaps, community vote weights, and hermeneutical bridge explanations.
- **Whole-Bible 66-Book Filter Bar:** Filter connections by clicking any of the 39 Old Testament or 27 New Testament books, or filter by relationship type (*Direct Prophecy*, *Typological Foreshadowing*, *Direct OT Quotation*, *Covenantal Promise*, *Thematic Parallel*).
- **6 Narrative Mega-Threads:** Step chronologically through canonical themes from Genesis to Revelation (*Seed of the Woman & Royal Scepter*, *Passover Lamb & Suffering Servant*, *Melchizedek Priest-King*, *Temple, Veil & Cornerstone*, *New Covenant & Faith*, and *Outpoured Spirit & New Creation*).
- **Interactive 66-Book Arc Map:** A dynamic SVG arc visualization inspired by the Chris Harrison & Christoph Römhild BibleViz diagram—color-coded by theological category with clickable arcs and book ticks.
- **Full TSK Index & Live 340,000-Row Dataset Loader:** Pre-loaded with 204 high-confidence Treasury of Scripture Knowledge (TSK) links, plus an in-browser TSV/CSV parser that lets users upload the complete 344,799-row `cross_references.txt` dataset from [OpenBible.info](https://www.openbible.info/labs/cross-references/) and filter by confidence votes.
- **Saved Study Notes & Markdown Export:** Bookmark passages in `localStorage` and export your study collection to Markdown with one click.

## Reading layout (index.html)

The default page is a calm reader built on the Flow Visual Language (FVL) and GSAP:

- **Browse** with search, category chips and one filter drawer (book and relationship). Rows show what you have read and saved, and **Continue reading** picks up where you stopped.
- **Tap a bridge** and it grows into a full-screen reader: promise, fulfilment, why they connect. The rest of the app is hidden. The top and bottom bars step aside as you read down and return on the way up.
- **Next / Previous** (or swipe, or the ← → keys) move through the current list, thread or saved set; **Back** (or Esc, or the phone's back gesture) returns to the exact row you left.
- **Threads** read as numbered sequences, the **Map** draws every bridge as an arc, **Saved** collects starred bridges, and the **Index** holds the TSK links with the 344,799-row OpenBible importer.

Files: `index.html`, `ui.css`, `ui.js`, data loaded from `data/*.json`. The original single-file layout is kept as `bible_prophecy_explorer.html` (rebuilt by `scripts/generate_app.py`).

## Repository Structure

```text
├── index.html                      # Self-contained single-page app (ready for GitHub Pages)
├── bible_prophecy_explorer.html    # Standalone copy of the web application
├── data/
│   ├── books_66.json               # Metadata and coordinates for all 66 canonical books
│   ├── prophecies_66_books.json    # 77 full-text dual-pane bridges covering all 66 books
│   ├── canonical_threads.json      # 6 step-by-step narrative threads across Scripture
│   └── tsk_high_impact_index.json  # 204 high-impact TSK cross-references with vote scores
├── scripts/
│   ├── build_dataset.py            # Python dataset definition and 66-book coverage verifier
│   └── generate_app.py             # Static site generator that compiles data into index.html
├── LICENSE                         # MIT License
└── README.md
```

## Quick Start & GitHub Pages Deployment

1. **Run Locally:** Simply double-click `index.html` in any web browser—no server or build step required.
2. **Deploy on GitHub Pages:**
   - Upload the contents of this archive to your GitHub repository.
   - Go to **Settings → Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**, choose `main` (and `/ (root)`), and click **Save**.
   - Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Loading the Full 340,000+ OpenBible.info Dataset

1. Download `cross_references.txt` (zipped) from [OpenBible.info Labs](https://www.openbible.info/labs/cross-references/) and extract the `.txt` file.
2. Open **ScriptureBridge**, click the **Full TSK Index & 340k Loader** tab, and select your `cross_references.txt` file using the file picker.
3. Use the **Min Votes** slider and search box to filter hundreds of thousands of verse links in real time.
