// Black Poppy Canon — sidebar component
import { routes } from '../router.js';
import { icon } from './icons.js';
import { recentRelationships } from '../services/RelationshipService.js';
import { getState, subscribe } from '../state.js';

const NAV_ICONS = {
  '/': 'poppy',
  '/library': 'book',
  '/symbolarium': 'star',
  '/atelier': 'atelier',
  '/looking-glass': 'moon',
  '/search': 'search',
  '/settings': 'settings',
};

export function Sidebar() {
  const el = document.createElement('aside');
  el.className = 'sidebar';
  el.setAttribute('aria-label', 'Primary');

  // Brand + seal
  const brand = document.createElement('a');
  brand.className = 'sidebar__brand';
  brand.href = '#/';
  brand.innerHTML = `
    <svg class="sidebar__seal" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="20" cy="20" r="14.5" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>
      <circle cx="20" cy="16" r="3" fill="#E24E9B"/>
      <path d="M20 19v11M20 24c2.5-1.5 4.5-1.5 4.5-1.5M20 27c-2.5-1.5-4.5-1.5-4.5-1.5"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M20 13.5c-1.5-2.6-4.6-3-6.3-1.2-1.8 1.9-1 5 1.6 6M20 13.5c1.5-2.6 4.6-3 6.3-1.2 1.8 1.9 1 5-1.6 6"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>
    <span>Black Poppy<br>Canon</span>
  `;

  const bloom = document.createElement('p');
  bloom.className = 'sidebar__bloom';
  bloom.textContent = 'v0.7.0 · The First Bloom';

  // Nav
  const nav = document.createElement('nav');
  nav.className = 'sidebar__nav';
  nav.setAttribute('aria-label', 'Canon navigation');

  routes.filter((r) => r.nav).forEach((route) => {
    const a = document.createElement('a');
    a.className = 'sidebar__link';
    a.href = `#${route.path}`;
    a.dataset.path = route.path;
    a.appendChild(icon(NAV_ICONS[route.path] || 'star', 'sidebar__icon'));
    a.append(route.nav);
    nav.appendChild(a);
  });

  const footer = document.createElement('p');
  footer.className = 'sidebar__footer';
  footer.textContent = 'Noli illegitimi carborundum · 11:11';

  // Recent Connections — the newest threads in the root system (APP-005).
  const connections = document.createElement('div');
  connections.className = 'sidebar__connections';
  connections.setAttribute('aria-label', 'Recent connections');

  async function paintConnections() {
    const rels = await recentRelationships(3);
    const { entries = [], books = [] } = getState();
    const name = (id, label) =>
      entries.find((e) => e.id === id)?.title ||
      books.find((b) => b.id === id)?.title || label || id;

    connections.innerHTML = '';
    if (!rels.length) return;

    const eyebrow = document.createElement('p');
    eyebrow.className = 'sidebar__connections-eyebrow';
    eyebrow.textContent = 'Recent Connections';
    connections.appendChild(eyebrow);

    rels.forEach((rel) => {
      const a = document.createElement('a');
      a.className = 'sidebar__connection';
      a.href = rel.source.startsWith('ENT') ? `#/entry/${rel.source}`
        : rel.source.startsWith('BOOK') ? `#/book/${rel.source}` : '#/library';
      a.innerHTML = '';
      const from = document.createElement('span');
      from.textContent = name(rel.source, rel.sourceLabel);
      const kind = document.createElement('em');
      kind.textContent = ` ${rel.type.toLowerCase()} `;
      const to = document.createElement('span');
      to.textContent = name(rel.target, rel.targetLabel);
      a.append(from, kind, to);
      connections.appendChild(a);
    });
  }

  subscribe(paintConnections);
  window.addEventListener('bpc:data-changed', paintConnections);
  paintConnections();

  el.append(brand, bloom, nav, connections, footer);

  return {
    el,
    setActive(path) {
      nav.querySelectorAll('.sidebar__link').forEach((a) => {
        if (a.dataset.path === path) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      });
    },
  };
}
