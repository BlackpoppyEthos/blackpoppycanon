# Black Poppy Universe — App Inventory & Audit

**Audited:** July 9, 2026 · **Auditor:** Fable
**Purpose:** the one page that answers "what have we built, where does it live, what version is it, and where are the docs?" Update this file every time an app ships or changes version.

---

## The apps

### 1. Black Poppy Canon (the PWA)

| | |
|---|---|
| **What it is** | The front door to the Black Poppy Universe — a vanilla JavaScript PWA. Library, twelve Books, entries with versioning, Atelier worktable, relationships, Symbolarium. |
| **Version** | **v0.7.0** — The First Bloom · Sprint 4.7 (The Root System) |
| **Code lives** | This repo, `main` branch, repository root (`index.html` + `src/`) |
| **Status** | ✅ Merged to `main` → deploys to GitHub Pages automatically |
| **Live URL** | https://blackpoppyethos.github.io/blackpoppycanon/ |
| **Documentation** | `README.md` (architecture, structure, deploy steps) · `CLAUDE.md` (engineering constitution: prime directives, hard rules, design system, Canon truths) |
| **Data** | Mock JSON seed data + browser-local persistence through the adapter (`src/services/canon-data.js`). Google Sheets backend planned for Sprint 6. |

**History this week:** uploaded to GitHub July 4 (initial upload) and July 5 (Sprint 4.7 update — Root System, relationship layer, Atelier rebuild). Built across Claude chat sprints; this repo is the deployed record.

### 2. GATEC31 YouTube Flight Deck

| | |
|---|---|
| **What it is** | A YouTube channel operations tool for @gatec31: daily subscriber/views/watch-hours tracking with charts and milestone projections, video pipeline (Hangar), SEO title lab with write-back editing and auto-rebuilt variants, 1280×720 thumbnail studio with search-size previews, interactive 90-day runway, revenue stack tracker. |
| **Version** | **v1.1** (v1.0 initial build July 7 · v1.1 SEO title write-back + improver July 9) |
| **Code lives** | This repo, branch `claude/gatec31-youtube-analytics-fpbo3n`, single self-contained file: `tools/gatec31/index.html` |
| **Status** | ⚠️ **Not merged yet** — not live until this branch merges to `main` |
| **Live URL (after merge)** | https://blackpoppyethos.github.io/blackpoppycanon/tools/gatec31/ |
| **Documentation** | `tools/gatec31/IMPLEMENTATION.md` (how it's built, how to extend it) · `tools/gatec31/USER-GUIDE.md` (how to use it, daily/weekly rituals) |
| **Data** | Browser-local (localStorage key `gatec31.flightdeck.v1`), with JSON export/import backup and CSV export of the daily log. **Data lives in whichever browser you use — export backups regularly.** |

**Lineage:** started as a static strategy document (`gatec31youtubestrategy.html`, the "Cleared for Takeoff" page, June 2026). That document's content — channel audit, Nas.com flywheel, three pillars, video blueprint, monetization stack, 90-day plan — is preserved inside the tool's **Strategy** and **Runway** tabs. The static file is superseded; the tool is the living version.

**Commits:** `73ce8dd` (v1.0, tool + sw.js cache bump to `bpc-v0.7.1`) · `c42ac80` (v1.1, SEO round-trip editing + title improver). Verified by a 51-check automated browser suite (zero console errors) plus subpath-serving check.

---

## Outside this repo

| Repo | Last pushed | Status |
|---|---|---|
| **BlackpoppyEthos/Book-of-Shadows-Experience** | July 8, 2026 | Exists in the account but is **outside this session's access scope**, so it is not audited here. To include it, tell Fable: *"add BlackpoppyEthos/Book-of-Shadows-Experience to the session"* and this inventory can be extended. |

If apps were created this week as Claude chat artifacts and never uploaded to a repo, they are not versioned anywhere — the safest home for each finished HTML app is a folder in a repo (like `tools/gatec31/`), where it gets history, a live URL, and a place for docs to live beside it.

---

## Audit findings — July 9, 2026

1. **Fixed: stale live URL in README.** `README.md` pointed to `rachaelnike-queen.github.io`; the repo lives under `BlackpoppyEthos`, so the correct Pages URL is `blackpoppyethos.github.io/blackpoppycanon/`. Corrected on this branch.
2. **Action needed: merge the Flight Deck branch.** `claude/gatec31-youtube-analytics-fpbo3n` holds the Flight Deck v1.1, its docs, and the service-worker cache bump. Until it merges, the tool is only available as the standalone file already delivered in chat.
3. **Live deployment not verified from the build environment** (its network policy blocks `github.io`). After merging, open both URLs above in a browser to confirm Pages is serving.
4. **One repo unaudited** (Book-of-Shadows-Experience — see above).
5. **Docs coverage is now complete for everything in this repo:** Canon has README + CLAUDE.md; Flight Deck has IMPLEMENTATION + USER-GUIDE; this inventory ties them together.

---

## Where everything lives (map)

```
blackpoppycanon/                      ← this repo
  index.html, src/, sw.js, …          ← Black Poppy Canon PWA (v0.7.0, main)
  README.md                           ← Canon: architecture & deploy guide
  CLAUDE.md                           ← Canon: engineering constitution
  docs/
    APP-INVENTORY.md                  ← this file — the index of everything
  tools/
    gatec31/
      index.html                      ← GATEC31 Flight Deck (v1.1, one file, everything inline)
      IMPLEMENTATION.md               ← Flight Deck: how it's built & extended
      USER-GUIDE.md                   ← Flight Deck: how to use it

BlackpoppyEthos/Book-of-Shadows-Experience   ← separate repo, not yet audited
```

*Noli illegitimi carborundum · 11:11*
