// Black Poppy Canon — search overlay (Sprint 4.2)
// Floating search button + Ctrl+K. Searches Canon entries in state.
// Until the data layer arrives, it answers honestly.

import { icons } from './icons.js';
import { getBooks, getEntries } from '../services/canon-data.js';

export function initSearch(root) {
  // Floating button
  const fab = document.createElement('button');
  fab.className = 'search-fab';
  fab.setAttribute('aria-label', 'Search the Canon (Ctrl+K)');
  fab.innerHTML = icons.search;
  root.appendChild(fab);

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Search the Canon');
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="search-overlay__panel">
      <label class="visually-hidden" for="bpc-search-input">Search the Canon</label>
      <input id="bpc-search-input" class="search-overlay__input" type="search"
        placeholder="Search entries, books, symbols…" autocomplete="off">
      <div class="search-overlay__results" aria-live="polite"></div>
      <p class="search-overlay__hint">Esc to close</p>
    </div>
  `;
  root.appendChild(overlay);

  const input = overlay.querySelector('input');
  const results = overlay.querySelector('.search-overlay__results');
  let lastFocus = null;

  async function renderResults(query) {
    const [books, entries] = await Promise.all([getBooks(), getEntries()]);
    results.innerHTML = '';

    const pool = [
      ...books.map((b) => ({ label: b.title, meta: 'Book', href: `#/book/${encodeURIComponent(b.id)}` })),
      ...entries.map((e) => ({ label: e.title, meta: 'Entry', href: `#/entry/${encodeURIComponent(e.id)}` })),
    ];

    if (!pool.length) {
      results.innerHTML =
        '<p class="panel__empty">The Canon has nothing to search yet.</p>';
      return;
    }

    const q = query.trim().toLowerCase();
    const matches = q ? pool.filter((i) => i.label.toLowerCase().includes(q)) : pool.slice(0, 8);

    if (!matches.length) {
      results.innerHTML = '<p class="panel__empty">No matches in the Canon. Try another word.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'panel__list';
    matches.slice(0, 10).forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.addEventListener('click', close);
      const m = document.createElement('span');
      m.className = 'panel__meta';
      m.textContent = item.meta;
      li.append(a, m);
      ul.appendChild(li);
    });
    results.appendChild(ul);
  }

  function open() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    input.value = '';
    renderResults('');
    input.focus();
  }

  function close() {
    overlay.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  fab.addEventListener('click', open);
  window.addEventListener('bpc:open-search', open);
  input.addEventListener('input', () => renderResults(input.value));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.hidden ? open() : close();
    }
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  return { open, close };
}
