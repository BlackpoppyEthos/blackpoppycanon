// Black Poppy Canon — the Symbolarium (Sprint 4.5.1, Foundation Repairs)
// The Book of Symbols, opened as a place. Symbols are a language,
// not decoration. Definitions are written by Rachael Nike or absent —
// the structure holds the space until the words arrive.

import * as canonData from '../services/canon-data.js';
import { listForEntry } from '../services/RelationshipService.js';
import { RelationshipCard, resolveObject } from './relationship/RelationshipCard.js';
import { Breadcrumbs } from '../components/breadcrumbs.js';

/* ---------- the Symbolarium: all symbols ---------- */

export function SymbolariumView() {
  const view = document.createElement('div');
  view.className = 'symbolarium';

  view.appendChild(Breadcrumbs([
    { label: 'Dashboard', href: '#/' },
    { label: 'Symbolarium' },
  ]));

  const header = document.createElement('header');
  header.className = 'symbolarium__header';
  header.innerHTML = `
    <span class="eyebrow">BOOK-005 · The Language</span>
    <h2 class="symbolarium__title">Symbolarium</h2>
    <p class="panel__meta panel__meta--block">Symbols are a language. Each one holds a meaning that is written or still arriving.</p>
  `;
  view.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'symbolarium__grid';
  view.appendChild(grid);

  paint();
  return view;

  async function paint() {
    const symbols = await canonData.listSymbols();
    grid.innerHTML = '';
    symbols.forEach((sym) => {
      const card = document.createElement('a');
      card.className = 'card card--link symbol-card';
      card.href = `#/symbol/${sym.id}`;

      const glyph = document.createElement('span');
      glyph.className = 'symbol-card__glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = sym.glyph;

      const name = document.createElement('span');
      name.className = 'symbol-card__name';
      name.textContent = sym.name;

      const meta = document.createElement('span');
      meta.className = 'panel__meta';
      meta.textContent = sym.definition ? '' : 'meaning not yet written';

      card.append(glyph, name, meta);
      grid.appendChild(card);
    });
  }
}

/* ---------- one Symbol, opened ---------- */

export function SymbolView(params = {}) {
  const view = document.createElement('div');
  view.className = 'symbol-view';

  load();
  return view;

  async function load() {
    const [symbol, books, entries, rels] = await Promise.all([
      canonData.getSymbol(params.id),
      canonData.listBooks(),
      canonData.listEntries(),
      listForEntry(params.id),
    ]);
    const symbols = await canonData.listSymbols();

    if (!symbol) {
      view.innerHTML = '';
      const missing = document.createElement('section');
      missing.className = 'empty';
      missing.innerHTML = `
        <h2>No symbol answers to that name.</h2>
        <p>The Symbolarium holds the language of the Canon.</p>
        <p><a class="btn btn--ghost" href="#/symbolarium">Return to the Symbolarium</a></p>`;
      view.appendChild(missing);
      return;
    }

    document.title = `${symbol.name} · Black Poppy Canon`;

    view.appendChild(Breadcrumbs([
      { label: 'Dashboard', href: '#/' },
      { label: 'Symbolarium', href: '#/symbolarium' },
      { label: symbol.name },
    ]));

    /* ---- header: glyph, name, status, definition ---- */

    const header = document.createElement('header');
    header.className = 'symbol-view__header';

    const glyph = document.createElement('span');
    glyph.className = 'symbol-view__glyph';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = symbol.glyph;

    const title = document.createElement('h2');
    title.className = 'symbol-view__title';
    title.textContent = symbol.name;

    const status = document.createElement('span');
    status.className = `chip chip--status chip--${symbol.status}`;
    status.textContent = symbol.status;

    const definition = document.createElement('p');
    definition.className = symbol.definition ? 'symbol-view__definition' : 'panel__empty symbol-view__definition';
    definition.textContent = symbol.definition ||
      'The meaning of this symbol has not yet been written. It is already true — the words are still arriving.';

    header.append(glyph, title, status, definition);
    view.appendChild(header);

    /* ---- relationships ---- */

    const all = [
      ...rels.outgoing.map((rel) => ({ rel, direction: 'out' })),
      ...rels.incoming.map((rel) => ({ rel, direction: 'in' })),
    ];

    const relCard = document.createElement('section');
    relCard.className = 'card panel';
    relCard.innerHTML = '<span class="eyebrow">Relationships</span>';

    if (all.length) {
      const list = document.createElement('div');
      list.className = 'rel-card-list';
      list.style.marginTop = 'var(--space-3)';
      all.forEach(({ rel, direction }) =>
        list.appendChild(RelationshipCard({ rel, direction, entries, books, symbols })));
      relCard.appendChild(list);
    } else {
      const p = document.createElement('p');
      p.className = 'panel__empty';
      p.textContent = 'Nothing is connected to this symbol yet. The first thread makes it part of the root system.';
      relCard.appendChild(p);
    }
    view.appendChild(relCard);

    /* ---- connected, by kind ---- */

    const kinds = [
      ['Connected Entries', (id) => entries.find((e) => e.id === id) && `#/entry/${id}`],
      ['Connected Books', (id) => books.find((b) => b.id === id) && `#/book/${id}`],
      ['Connected Projects', () => null],
    ];

    kinds.forEach(([label, hrefFor]) => {
      const ids = new Set();
      all.forEach(({ rel }) => {
        const other = rel.source === symbol.id ? rel.target : rel.source;
        ids.add(other);
      });

      const items = [...ids]
        .map((id) => ({ id, href: hrefFor(id) }))
        .filter((x) => x.href || (label === 'Connected Projects' && x.id.startsWith('PRJ')));

      if (!items.length) return;

      const section = document.createElement('section');
      section.className = 'card panel';
      section.innerHTML = `<span class="eyebrow">${label}</span>`;
      const ul = document.createElement('ul');
      ul.className = 'panel__list';
      items.forEach(({ id, href }) => {
        const obj = resolveObject(id, { entries, books, symbols });
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href || obj.href || '#/library';
        a.textContent = obj.title;
        li.appendChild(a);
        ul.appendChild(li);
      });
      section.appendChild(ul);
      view.appendChild(section);
    });
  }
}
