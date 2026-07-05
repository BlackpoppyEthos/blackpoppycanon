// Black Poppy Canon — hash router
// Routes map #/path → view module. Hash routing keeps the app
// deployable on any static host with zero server configuration.
// Sprint 4.4 adds parameterized routes (#/entry/:id).

import { DashboardView } from './views/dashboard.js';
import { LibraryView } from './views/library.js';
import { AtelierView } from './views/atelier/AtelierView.js';
import { LookingGlassView } from './views/lookingglass.js';
import { SearchView } from './views/search.js';
import { SettingsView } from './views/settings.js';
import { NotFoundView } from './views/notfound.js';
import { EntryView } from './views/entry/EntryView.js';
import { BookView } from './views/book.js';
import { SymbolariumView, SymbolView } from './views/symbolarium.js';

export const routes = [
  { path: '/',            title: 'Dashboard',   view: DashboardView,   nav: 'Dashboard' },
  { path: '/library',     title: 'Library',     view: LibraryView,     nav: 'Library' },
  { path: '/entry/:id',   title: 'Entry',       view: EntryView },
  { path: '/book/:id',    title: 'Book',        view: BookView },
  { path: '/symbolarium', title: 'Symbolarium', view: SymbolariumView, nav: 'Symbolarium' },
  { path: '/symbol/:id',  title: 'Symbol',      view: SymbolView },
  { path: '/atelier',       title: 'Atelier',       view: AtelierView,      nav: 'Atelier' },
  { path: '/looking-glass', title: 'Looking Glass', view: LookingGlassView, nav: 'Looking Glass' },
  { path: '/search',        title: 'Search',        view: SearchView,       nav: 'Search' },
  { path: '/settings',  title: 'Settings',  view: SettingsView,  nav: 'Settings' },
];

const notFound = { path: null, title: 'Not Found', view: NotFoundView };

// Compile "/entry/:id" → regex with named params, once.
routes.forEach((route) => {
  const names = [];
  const pattern = route.path.replace(/:([\w-]+)/g, (_, name) => {
    names.push(name);
    return '([^/]+)';
  });
  route._regex = new RegExp(`^${pattern}$`);
  route._params = names;
});

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash.split('?')[0];
}

function matchRoute(path) {
  for (const route of routes) {
    const m = route._regex.exec(path);
    if (m) {
      const params = {};
      route._params.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { route, params };
    }
  }
  return null;
}

export function initRouter({ outlet, onNavigate }) {
  function render() {
    const path = currentPath();
    const matched = matchRoute(path);
    const route = matched ? matched.route : notFound;

    outlet.innerHTML = '';
    outlet.appendChild(route.view(matched ? matched.params : {}));

    // Sidebar highlighting: open Entries and Books belong to the Library;
    // an open Symbol belongs to the Symbolarium.
    const activePath = route.path && (route.path.startsWith('/entry') || route.path.startsWith('/book'))
      ? '/library'
      : route.path && route.path.startsWith('/symbol/') ? '/symbolarium' : path;
    onNavigate(route.path !== null ? { ...route, path: activePath } : { ...notFound, path });
  }

  window.addEventListener('hashchange', render);
  render();
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}
