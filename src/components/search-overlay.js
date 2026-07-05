// Black Poppy Canon — search overlay (Sprint 4.2)
// Floating search button + Ctrl+K. Searches Canon entries in state.
// Until the data layer arrives, it answers honestly.

import { icons } from './icons.js';
import { getState } from '../state.js';
import { neighbors } from '../services/RelationshipService.js';

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
    const { entries, books = [] } = getState();
    results.innerHTML = '';

    if (!entries.length) {
      results.innerHTML =
        '<p class="panel__empty">The Canon has no entries to search yet. When the data layer arrives, everything will be findable from here.</p>';
      return;
    }

    const q = query.trim().toLowerCase();
    const matches = q
      ? entries.filter((e) => (e.title + ' ' + (e.book || '')).toLowerCase().includes(q))
      : entries.slice(0, 8);

    if (!matches.length) {
      results.innerHTML = '<p class="panel__empty">No entries match. Try another word.</p>';
      return;
    }

    const item = (label, href, meta) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      a.addEventListener('click', close);
      li.appendChild(a);
      if (meta) {
        const m = document.createElement('span');
        m.className = 'panel__meta';
        m.textContent = meta;
        li.appendChild(m);
      }
      return li;
    };

    const ul = document.createElement('ul');
    ul.className = 'panel__list';
    matches.slice(0, 10).forEach((e) => ul.appendChild(item(e.title, e.href || '#/library')));
    results.appendChild(ul);

    // Relationships widen the answer: one degree out from the top matches.
    if (q) {
      const matchedIds = new Set(matches.map((e) => e.id));
      const related = new Map();
      for (const match of matches.slice(0, 3)) {
        for (const link of await neighbors(match.id)) {
          if (matchedIds.has(link.id) || related.has(link.id)) continue;
          const entry = entries.find((e) => e.id === link.id);
          const book = books.find((b) => b.id === link.id);
          if (entry) related.set(link.id, { label: entry.title, href: entry.href, meta: `${link.rel.type} · ${match.title}` });
          else if (book) related.set(link.id, { label: book.title, href: '#/library', meta: `${link.rel.type} · ${match.title}` });
        }
      }
      // The query may have changed while we looked — stay honest.
      if (input.value.trim().toLowerCase() !== q || !related.size) return;

      const heading = document.createElement('p');
      heading.className = 'search-overlay__related';
      heading.textContent = 'Related';
      results.appendChild(heading);

      const rul = document.createElement('ul');
      rul.className = 'panel__list';
      [...related.values()].slice(0, 6).forEach((r) => rul.appendChild(item(r.label, r.href, r.meta)));
      results.appendChild(rul);
    }
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
