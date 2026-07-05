// Black Poppy Canon — sidebar component
import { routes } from '../router.js';
import { icon } from './icons.js';

const NAV_ICONS = {
  '/': 'poppy',
  '/library': 'book',
  '/atelier': 'atelier',
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
  bloom.textContent = 'v0.1.0 · The First Bloom';

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

  el.append(brand, bloom, nav, footer);

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
