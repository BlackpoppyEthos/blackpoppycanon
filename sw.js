// Black Poppy Canon — service worker (relative paths, subpath-safe)
// Works at any base path, including GitHub Pages project sites.
// Bump CACHE_VERSION on each release to invalidate old caches.

const CACHE_VERSION = 'bpc-v0.7.2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './src/main.js',
  './src/app.js',
  './src/router.js',
  './src/state.js',
  './src/theme.js',
  './src/components/sidebar.js',
  './src/components/header.js',
  './src/components/breadcrumbs.js',
  './src/components/card.js',
  './src/components/dashboard-cards.js',
  './src/components/search-overlay.js',
  './src/components/icons.js',
  './src/views/dashboard.js',
  './src/views/library.js',
  './src/views/book.js',
  './src/views/symbolarium.js',
  './src/views/lookingglass.js',
  './src/views/atelier/AtelierView.js',
  './src/views/atelier/Toolbar.js',
  './src/views/atelier/Worktable.js',
  './src/views/atelier/WorktableObject.js',
  './src/views/atelier/Inspector.js',
  './src/views/atelier/RelationshipLayer.js',
  './src/views/atelier/StatusBar.js',
  './src/views/atelier/TemplatePicker.js',
  './src/views/search.js',
  './src/views/settings.js',
  './src/views/notfound.js',
  './src/views/entry/EntryView.js',
  './src/views/entry/EntryEditor.js',
  './src/views/entry/EntryPreview.js',
  './src/views/entry/EntryToolbar.js',
  './src/views/entry/EntryMetadata.js',
  './src/views/entry/VersionHistory.js',
  './src/views/entry/PrintView.js',
  './src/views/relationship/RelationshipPanel.js',
  './src/views/relationship/RelationshipCard.js',
  './src/views/relationship/RelationshipGraph.js',
  './src/views/relationship/RelationshipModal.js',
  './src/views/relationship/RelationshipBadge.js',
  './src/services/storage.js',
  './src/services/companions.js',
  './src/services/canon-data.js',
  './src/services/markdown.js',
  './src/services/RelationshipService.js',
  './src/services/WorktableService.js',
  './src/root/RootSystem.js',
  './src/root/Repository.js',
  './src/root/storage.js',
  './src/root/schema.js',
  './src/root/ids.js',
  './src/data/books.json',
  './src/data/entries.json',
  './src/data/relationships.json',
  './src/data/symbols.json',
  './src/styles/variables.css',
  './src/styles/typography.css',
  './src/styles/layout.css',
  './src/styles/components.css',
  './src/styles/entry.css',
  './src/styles/relationship.css',
  './src/styles/atelier.css',
  './src/styles/print.css',
  './tools/gatec31/index.html',
  './docs/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
