// Black Poppy Canon — theme architecture
// Light is the default. Dark is the Canon at night.
// The choice persists in localStorage and applies before
// first paint via the inline script in index.html.

import { storage } from './services/storage.js';

const THEME_KEY = 'bpc-theme';
const META_COLORS = { light: '#F5F0E8', dark: '#171319' };

export function initTheme() {
  applyTheme(getTheme());
}

export function getTheme() {
  return storage.get(THEME_KEY, 'light');
}

export function toggleTheme() {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  storage.set(THEME_KEY, next);
  applyTheme(next);
  return next;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLORS[theme]);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}
