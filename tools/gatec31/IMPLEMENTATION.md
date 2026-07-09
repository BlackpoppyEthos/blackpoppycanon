# GATEC31 Flight Deck — Implementation Guide

**Version 1.1 · July 2026 · one file: `index.html`**
For engineers (and future Fables) maintaining or extending the tool. For how to *use* it, see `USER-GUIDE.md`.

---

## Design constraints

The tool inherits the repo's hard rules and adds two of its own:

1. **One self-contained file.** All CSS and JavaScript are inline in `index.html`. No imports, no modules, no build step. The file must keep working when someone saves it to a desktop and double-clicks it. The only external dependency is Google Fonts (Space Grotesk / Space Mono / Syne), which degrades gracefully offline.
2. **No invented facts.** The SEO title improver applies only mechanical transformations. It never fabricates numbers, runways, altitudes, or events — those score points are deliberately left for the human.
3. **Repo rules still apply:** relative paths, no frameworks, WCAG AA (keyboard tab navigation with arrow keys, `role="tablist"`, `aria-pressed` states, visible focus, `prefers-reduced-motion` honored, table view behind every chart).

## File anatomy

`index.html` reads top to bottom as: **CSS** (design tokens in `:root`, then component styles grouped by feature) → **markup** (topbar + eight `section.panel-view` tab panels + toast + footer) → **one `<script>`** with all logic, organized in labeled blocks:

| Block | What it owns |
|---|---|
| `SAFE STORAGE` | `store.get/set` (try/catch around localStorage), `DB_KEY`, `freshDb()`, `db`, `save()` |
| `UTILS` | `$`/`$$`, date helpers, `fmtNum`, `esc` (HTML escaping — use it on ALL user text), `uid`, `toast` |
| `TABS` | `activateTab(view)` — also re-renders the target view, so stale panels are never shown |
| `CHART ENGINE` | `niceTicks`, `lineChart(container, points, opts)`, `sparklineSVG` |
| `FLIGHT DECK` | hero stats, stat tiles, milestone meter with ETA projection, next-task surfacing |
| `DAILY LOG` | `upsertEntry` (keyed by date — one entry per day), table render, CSV export |
| `SEO SCORING` | `KEYWORDS`, `POWER_WORDS`, `scoreTitle(title)` → `{score, checks, verdict}` |
| SEO editing | `enterSeoEdit`/`exitSeoEdit` (round-trip to Hangar), `buildVariants` (title improver) |
| `HANGAR` | video pipeline CRUD, status flow, published-stats inputs with CTR/AVD verdicts |
| `RUNWAY` | `RUNWAY` task data, persisted checkboxes, `WEEKLY` ritual (auto-resets on `weekStamp()` change) |
| `REVENUE` | `STREAMS` data, active toggles, per-month amounts keyed `YYYY-MM` |
| `THUMBNAIL LAB` | `thumbState`, `drawThumbBase(ctx, W, H, withGuides)`, previews, PNG export |
| `DATA` | JSON export/import (shape-validated), demo data generator, guarded reset |
| `BOOT` | `renderAll()`, font-ready redraw of the canvas |

## Data model

Everything persists under one localStorage key, **`gatec31.flightdeck.v1`**:

```js
{
  dailyLog: [{ date: 'YYYY-MM-DD', subs, views, watch, rev, notes }],  // one per date
  videos:   [{ id, title, pillar: 'dest|tech|real|short',
               status: 'idea|scripted|recorded|edited|published',
               hook, keyword, stats: { views, ctr, avd }, created }],
  tasks:    { 'p1-0': true, ... },            // runway checkbox ids: phaseId-index
  weekly:   { week: 'YYYY-MM-DD', checked: {} },  // week = Sunday; mismatch = reset
  revenue:  { streamId: { active, amounts: { 'YYYY-MM': n } } },
  meta:     { created }
}
```

Semantics that matter: `subs` is the **cumulative total**; `views`/`watch`/`rev` are YouTube Studio's **trailing 28-day** figures. Deltas and growth rates are computed, never stored. If you ever change this shape, bump the key to `.v2` and write a migration in `freshDb`/boot — never mutate the meaning of an existing field.

## The parts with actual logic

- **Milestone ETA** (`subGrowthPerDay`): linear rate over up to a 14-day lookback window → days until the next milestone in `MILESTONES`. Deliberately simple; resist curve-fitting on noisy small-channel data.
- **Chart engine**: hand-built SVG (viewBox 640-wide, responsive via CSS). Follows the repo's dataviz method: hairline gridlines, 2px line, 10%-opacity area wash, end dot with a 2px surface ring, direct end-label, crosshair + tooltip on hover/touch, `<details>` table view for accessibility. Chart series colors (`--series-1..4`) were **validated for colorblind separation and ≥3:1 contrast against `--panel`** — don't swap them casually; re-validate if you do.
- **`scoreTitle`**: additive checks — length band (40–65 ideal), niche keyword present (+ front-loaded within 40 chars), number, power word, curiosity structure, not-shouting, bracket bonus; capped at 100. The Hangar reuses it for card badges, so a scoring change updates every card.
- **`buildVariants`** (the improver): de-shout via `titleCaseIfShouting` (preserving MSFS/PMDG/KDEN/VR/ILS/ATC caps), then three transforms — `frontload` (move/prepend keyword), `bracket` (append `(MSFS 2024)` or `(Full VR Flight)`), `curiosity` (append `— Here's What Happened`) — individually plus stacked; scored, deduped, sorted, top 4. Keyword priority: user's keyword field → keyword detected in title → `'MSFS 2024'`.
- **Thumbnail Lab**: everything renders through `drawThumbBase` so the main canvas (guides on), the 168px/320px previews, and the PNG export (guides off) can never drift apart. Layout guides (thirds + duration-badge zone) are draw-time-only and never exported.

## Extending it (recipes)

- **New keyword** → add to `KEYWORDS` (feeds bank chips, scoring, and variant detection at once).
- **New revenue stream** → add to `STREAMS`; persistence and totals are automatic.
- **New runway task** → append to a phase's `tasks`. **Append only** — checkbox state is keyed by index, so inserting mid-list silently re-maps saved checkmarks.
- **New thumbnail preset** → add to `BG_PRESETS` (`{id, name, stops:[…]}`); the swatch button and gradient come free. Preset-specific decoration goes in `drawThumbBase` (see the `runway` example).
- **New tab** → tab button in `#tabbar` + `section.panel-view#view-<name>` + a render call in `activateTab`.

## Deployment & testing

- **Hosted:** merging to `main` deploys via GitHub Pages → `…/blackpoppycanon/tools/gatec31/`. The tool is listed in the app shell's `sw.js` SHELL cache — **adding files or shipping a new version means bumping `CACHE_VERSION` in `/sw.js`** (currently `bpc-v0.7.1`) or offline users get the stale build.
- **Standalone:** the same file can be sent/saved directly. Data does not travel with the file — it stays in the browser profile — so replacing the file in place preserves the user's data.
- **Test before done:** a Playwright acceptance suite (51 checks: logging, charts + tooltips, pipeline, SEO scoring/variants/round-trip, canvas rendering at both preview sizes, checklists, revenue math, reload persistence, zero console errors) is run against the repo served from a **parent directory** (`python3 -m http.server` one level up) to prove subpath safety. Re-create it from this description or from session history; it lives outside the repo by design.

## Version log

| Version | Date | Commit | Change |
|---|---|---|---|
| v1.0 | 2026-07-07 | `73ce8dd` | Initial build: eight tabs, tracking, charts, Hangar, SEO Tower, Thumbnail Lab, Runway, Revenue, backup |
| v1.1 | 2026-07-09 | `c42ac80` | SEO Tower round-trip editing (write titles back to Hangar) + deterministic title improver |
