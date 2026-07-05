# Black Poppy Canon

**Version 0.4.0 — The First Bloom**
Author: Rachael Nike

The living Canon of the Black Poppy Universe — a collection of principles, symbols, systems, and stories uncovered through creating.

Live: https://blackpoppyethos.github.io/blackpoppycanon/
Galaxy: Ethos

---

## What this is

A vanilla JavaScript Progressive Web App. Single-page application, native ES modules, component-first architecture. No frameworks, **no build step, no npm**. Every path is relative, so it runs from any folder, any subpath, any static host.

- **Responsive** — desktop sidebar collapses to a slide-over menu on mobile
- **Themed** — light by default, dark for the Canon at night; persisted, no flash on load
- **Accessible** — skip link, focus management, aria-current nav, visible focus rings, reduced-motion respected
- **Print-friendly** — pages print like a journal page
- **Offline** — service worker caches the app shell; installable as a PWA

## Structure

```
/
  index.html            App shell entry
  sw.js                 Service worker (offline cache)
  manifest.webmanifest  PWA manifest
  icon.svg              The Seal
  .nojekyll             Tells GitHub Pages not to run Jekyll
  /src
    main.js  app.js  router.js  state.js  theme.js
    /components   sidebar, header, card, icons
    /views        dashboard, library, atelier, search, settings, notfound
    /services     storage
    /styles       variables (design tokens), typography, layout, components, print
```

## Deploying to GitHub Pages

1. All of these files go at the **root of the repository** (index.html must be at the top level, not inside a folder).
2. Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
3. Wait ~1 minute, then open https://rachaelnike-queen.github.io/blackpoppycanon/
4. On your phone: open the URL → browser menu → **Add to Home Screen**. The Canon installs like an app and works offline.

## The Entry System (Sprint 4.4)

Entries are the atomic unit of the Canon (Architectural Decision 006).

- **Write**: `#/write` or the "Write an entry in this Book" button. Markdown editor with
  live preview, toolbar, word count, reading time. Split view on desktop, toggle on mobile.
- **Autosave vs. versions**: drafts are kept silently every 10 seconds (crash-safe);
  Ctrl+S / the Save button commits a **version** with an optional summary. Nothing is deleted —
  entries archive, and every version is preserved.
- **Read**: title, metadata, rendered body, relationships, timeline, version history.
- **Print**: Ctrl+P or the Print button. The entry prints as a journal page — book title and
  entry title above, version, date, and 11:11 in a repeating footer, no browser chrome.
- **Relationships**: connect entries to Books, other Entries, Symbols, Projects, Companions,
  Products, Components. Book/Entry connections are live links.
- Entries persist on this device (localStorage) until the Sprint 6 backend; they flow through
  the same adapter interface the backend will implement.

To update: change files, commit, push. Pages redeploys automatically.

## Design tokens

All color, type, spacing, and motion decisions live in `src/styles/variables.css`. Palette: black, deep purple, silver, dark rose, full moon white, hot pink, gray. Never gold. Fonts: Bebas Neue (display) + Libre Baskerville (body).

---

*Noli illegitimi carborundum · 11:11*
