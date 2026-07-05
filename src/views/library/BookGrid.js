// Black Poppy Canon — BookGrid (Living Library)
// The shelf itself. Favorites rise to the top. Empty shelves
// answer honestly, in the Canon's voice.

import { BookCard } from './BookCard.js';
import { getFavorites } from '../../services/favorites.js';

export function BookGrid(books, { entryCounts = {}, emptyMessage, onFavoriteChange } = {}) {
  const el = document.createElement('div');

  if (!books.length) {
    el.className = 'library-empty';
    el.innerHTML = `
      <h3>Your Library is waiting for its first story.</h3>
      <p class="text-muted">${emptyMessage || 'Nothing lives on this shelf yet.'}</p>
      <a class="btn" href="#/write">Create First Entry</a>
    `;
    return el;
  }

  el.className = 'book-grid';
  el.setAttribute('role', 'list');

  const favs = getFavorites();
  const sorted = books
    .slice()
    .sort((a, b) => (favs.has(b.id) ? 1 : 0) - (favs.has(a.id) ? 1 : 0));

  sorted.forEach((book) => {
    const item = BookCard(book, {
      entryCount: entryCounts[book.id] || 0,
      onFavoriteChange,
    });
    item.setAttribute('role', 'listitem');
    el.appendChild(item);
  });

  return el;
}
