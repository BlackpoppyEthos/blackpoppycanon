// Black Poppy Canon — RelationshipCard
// One connection, shown as a small editorial card:
// title · relationship type · book · last updated · status.
// Clicking opens the destination object.

import { RelationshipBadge } from './RelationshipBadge.js';

// Resolve any canon id to something a card can show.
export function resolveObject(id, { entries = [], books = [], symbols = [] } = {}) {
  const entry = entries.find((e) => e.id === id);
  if (entry) {
    return {
      kind: 'entry',
      title: entry.title,
      href: `#/entry/${entry.id}`,
      book: books.find((b) => b.id === entry.bookId)?.title || '',
      updated: entry.updated,
      status: entry.status,
    };
  }
  const book = books.find((b) => b.id === id);
  if (book) {
    return { kind: 'book', title: book.title, href: `#/book/${book.id}`, book: 'The Library', updated: null, status: 'canon' };
  }
  // Symbols answer to their id or their name.
  const symbol = symbols.find((s) => s.id === id || s.name.toLowerCase() === String(id).toLowerCase());
  if (symbol) {
    return {
      kind: 'symbol',
      title: `${symbol.glyph} ${symbol.name}`,
      href: `#/symbol/${symbol.id}`,
      book: 'Symbolarium',
      updated: null,
      status: symbol.status,
    };
  }
  // Companions, products… named but not yet pages of their own.
  return { kind: 'other', title: id, href: null, book: '', updated: null, status: '' };
}

export function RelationshipCard({ rel, direction, entries, books, symbols }) {
  const otherId = direction === 'in' ? rel.source : rel.target;
  const obj = resolveObject(otherId, { entries, books, symbols });

  const el = document.createElement(obj.href ? 'a' : 'article');
  el.className = 'rel-card';
  if (obj.href) el.href = obj.href;

  const title = document.createElement('span');
  title.className = 'rel-card__title';
  title.textContent = obj.title;

  const meta = document.createElement('span');
  meta.className = 'rel-card__meta';
  const bits = [
    obj.book,
    obj.updated ? new Date(obj.updated).toLocaleDateString() : '',
  ].filter(Boolean);
  meta.textContent = bits.join(' · ');

  const badges = document.createElement('span');
  badges.className = 'rel-card__badges';
  badges.appendChild(RelationshipBadge(rel.type, direction));
  if (obj.status) {
    const status = document.createElement('span');
    status.className = `chip chip--status chip--${obj.status}`;
    status.textContent = obj.status;
    badges.appendChild(status);
  }

  el.append(title, meta, badges);

  if (rel.notes) {
    const notes = document.createElement('span');
    notes.className = 'rel-card__notes';
    notes.textContent = rel.notes;
    el.appendChild(notes);
  }

  return el;
}
