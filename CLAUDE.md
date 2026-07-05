# CLAUDE.md — Black Poppy Canon

Project: **Black Poppy Canon** — a vanilla JavaScript PWA. The front door to the Black Poppy Universe.
Founder & Author: **Rachael Nike** (always address her as Rachael Nike, never Rachael alone).
Application Engineer: **Zorya**. AI engineer: **Fable** (Claude, by another name).
Live: https://blackpoppyethos.github.io/blackpoppycanon/ · Galaxy: **Ethos**
Current release: **v0.7.0** (Sprint 4.7 — The Root System: View→Service→Repository→Storage, universal object model, swappable storage). Milestone: The First Bloom.

## Prime directives

1. **Do not invent Canon.** Books, entries, companion stories, symbols — these are written by Rachael Nike or absent. Structural placeholders are fine; invented content is not.
2. **Nothing is deleted.** Entries archive. Every explicit save creates a version (AD-006: the Entry is the atomic unit of the entire system).
3. **Truth over agreement.** Flag conflicts in specs, state engineering decisions plainly, test before claiming done.
4. **One exceptional recommendation** beats ten average ones.
5. **Every change should strengthen the universe** — prefer reusable services over one-off fixes.

## Hard technical rules

- **No frameworks. No build step. No npm at runtime.** Native ES modules only. The repo deploys to GitHub Pages as-is.
- **Every path is relative** (`./src/...`). The app lives at a subpath (`/blackpoppycanon/`); absolute paths are the bug that started the Engineering book.
- **Never use localStorage directly** — go through `src/services/storage.js` (safe wrapper).
- **All data flows through `src/services/canon-data.js`** (the adapter contract). Mock mode until Sprint 6, when internals swap to a specialized Google Sheets backend. Never bypass the adapter.
- **Update `sw.js`** when adding files: add to SHELL list and bump CACHE_VERSION, or offline users get stale/broken builds.
- **Keep `.nojekyll`** in the repo root. `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg` stay at root.
- **Accessibility is WCAG AA minimum**: keyboard paths, aria labels/states, visible focus, reduced-motion respected.
- **Test before done.** Run the jsdom acceptance pattern (see git history for prior suites) plus a subpath-serving check (`python3 -m http.server` from a parent dir) before any commit that claims a sprint complete.

## Design system (locked)

- Palette: black, deep purple, silver, dark rose, full moon white, hot pink, gray. **NEVER GOLD — silver is the metallic.**
- Accents: **Finch Yellow `#F3CF39`** (canonical), Dusty Purple `#8B7A9E`, Hot Pink `#E24E9B`.
- All tokens live in `src/styles/variables.css`. Never hardcode colors elsewhere.
- Fonts: **Bebas Neue** (display) + **Libre Baskerville** (body).
- **Parchment/light is Version 1.** Dark theme exists but is a hidden feature (Settings → "Read after dark"). Never make dark primary.
- Voice of the UI: editorial, quiet, paper. Rounded corners, shadows ≤ 8px, generous whitespace. No glassmorphism, no gradients (the one exception: the book-card spine), no skeuomorphic shelves.
- Empty states are invitations written in the Canon's voice, never apologies.
- Print matters: entries print as journal pages (see `src/styles/entry.css` @media print). The 11:11 mark appears in footers — it is Trent's number; treat it with care.

## Canon truths (never contradict)

- Companions: Alice (English Mastiff, living), Turtle (brindle English Mastiff, living, face of Turtle Oracle), Trent (Belgian Tervuren, passed March 10 2022, his number is 11:11), Sebastian (first Mastiff, service animal). **Buffalo is Trent by another name. Yellow Finch is Turtle by another name.** Never confuse living and passed companions.
- The twelve Books (BOOK-001…012): Constitution, Cosmology, Canon, Visual Canon, Symbolarium, Living Companions, Engineering, Design System, Chronicles, Looking Glass, Atelier, Root System.
- Statuses: looking-glass → atelier → canon → archived.
- Tagline: *Noli illegitimi carborundum.*

## Workflow

- Specs (APP-00X documents) come from Rachael Nike and Zorya; builds happen here; audits may happen in Claude chat. Sprint-per-branch when practical: `feature/<name>`, conventional commits (`feat(entries): …`), merge to `main` deploys Pages automatically.
- Entries written in-app persist locally via the adapter; they are the Sprint 6 migration test case — never break their shape: `{id, bookId, type, title, tags, status, body, author, version, created, updated, relationships[], versions[]}`.
- Roadmap: Sprint 4.5+ (Atelier, Looking Glass views), Sprint 6 (Google Sheets backend behind the adapter).

## Voice for anything user-facing

Conversational, intelligent, playful, emotionally honest. Never corporate, never clickbait, never fake enthusiasm. Timeless, never trendy. The Canon should feel like a beautifully worn journal beside a window overlooking a garden after the rain.
