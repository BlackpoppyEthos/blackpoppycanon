// Black Poppy Canon — BookCard (Living Library)
// A Book on the shelf: icon, title, description, entry count,
// status, updated date, favorite star. The Books provide the
// personality — the card stays quiet paper.

import { icon } from '../../components/icons.js';
import { isFavorite, toggleFavorite } from '../../services/favorites.js';

export const STATUS_LABELS = {
  'looking-glass': 'Looking Glass',
  'atelier': 'Atelier',
  'canon': 'Canon',
  'archived': 'Archived',
};

export function BookCard(book, { entryCount = 0, onFavoriteChange } = {}) {
  const el = document.createElement('article');
  el.className = 'book-tile';

  const link = document.createElement('a');
  link.className = 'book-tile__link';
  link.href = `#/book/${encodeURIComponent(book.id)}`;
  link.setAttribute(
    'aria-label',
    `${book.title} — ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}, status ${STATUS_LABELS[book.status] || book.status}`
  );

  const head = document.createElement('div');
  head.className = 'book-tile__head';
  head.appendChild(icon(book.icon || 'book', 'book-tile__icon'));

  const status = document.createElement('span');
  status.className = `book-tile__status book-tile__status--${book.status}`;
  status.textContent = STATUS_LABELS[book.status] || book.status;
  head.appendChild(status);

  const title = document.createElement('h3');
  title.className = 'book-tile__title';
  title.textContent = book.title;

  const desc = document.createElement('p');
  desc.className = 'book-tile__desc';
  desc.textContent = book.description || '';

  const meta = document.createElement('p');
  meta.className = 'book-tile__meta';
  meta.textContent = `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} · v${book.version} · updated ${book.updated}`;

  link.append(head, title, desc, meta);
  el.appendChild(link);

  // Favorite star — separate button, outside the link, keyboard reachable
  const fav = document.createElement('button');
  fav.className = 'book-tile__fav';
  paintFav();

  function paintFav() {
    const on = isFavorite(book.id);
    fav.classList.toggle('is-fav', on);
    fav.setAttribute('aria-pressed', String(on));
    fav.setAttribute(
      'aria-label',
      on ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`
    );
    fav.textContent = on ? '★' : '☆';
  }

  fav.addEventListener('click', () => {
    toggleFavorite(book.id);
    paintFav();
    if (onFavoriteChange) onFavoriteChange();
  });

  el.appendChild(fav);
  return el;
}
