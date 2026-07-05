// Black Poppy Canon — hash router (Sprint 4.3: dynamic segments)
// Routes map #/path → view. Patterns like '/book/:id' capture params.
// Hash routing keeps the app deployable on any static host — including
// GitHub Pages project subpaths — with zero server configuration.

import { DashboardView } from './views/dashboard.js';
import { LibraryView } from './views/library/LibraryView.js';
import { BookView } from './views/book.js';
import { EntryView } from './views/entry/EntryView.js';
import { EntryEditor } from './views/entry/EntryEditor.js';
import { AtelierView } from './views/atelier.js';
import { SearchView } from './views/search.js';
import { SettingsView } from './views/settings.js';
import { NotFoundView } from './views/notfound.js';

export const routes = [
  { path: '/',          title: 'Dashboard', view: DashboardView, nav: 'Dashboard' },
  { path: '/library',   title: 'Library',   view: LibraryView,   nav: 'Library' },
  { path: '/book/:id',  title: 'Book',      view: BookView },
  { path: '/entry/:id', title: 'Entry',     view: EntryView },
  { path: '/write',     title: 'Write',     view: EntryEditor },
  { path: '/write/:id', title: 'Write',     view: EntryEditor },
  { path: '/atelier',   title: 'Atelier',   view: AtelierView,   nav: 'Atelier' },
  { path: '/search',    title: 'Search',    view: SearchView,    nav: 'Search' },
  { path: '/settings',  title: 'Settings',  view: SettingsView,  nav: 'Settings' },
];

const notFound = { path: null, title: 'Not Found', view: NotFoundView };

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash.split('?')[0];
}

function matchRoute(path) {
  for (const route of routes) {
    if (!route.path.includes(':')) {
      if (route.path === path) return { route, params: {} };
      continue;
    }
    const routeParts = route.path.split('/');
    const pathParts = path.split('/');
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let ok = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (routeParts[i] !== pathParts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  return null;
}

export function initRouter({ outlet, onNavigate }) {
  function render() {
    const path = currentPath();
    const match = matchRoute(path);
    const route = match ? match.route : notFound;
    const params = match ? match.params : {};

    outlet.innerHTML = '';
    outlet.appendChild(route.view(params));
    onNavigate(route.path ? { ...route, activePath: navRoot(path) } : { ...notFound, path, activePath: null });
  }

  window.addEventListener('hashchange', render);
  render();
}

// Books and entries highlight Library in the sidebar.
function navRoot(path) {
  if (path.startsWith('/book/') || path.startsWith('/entry/') || path.startsWith('/write')) return '/library';
  return path;
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}
