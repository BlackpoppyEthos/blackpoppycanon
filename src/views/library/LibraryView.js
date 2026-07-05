// Black Poppy Canon — LibraryView (Sprint 4.3: The Living Library)
// Not a file explorer. Not a database table. A private library of ideas.
// It answers "What do I want to explore?" — never "Where did I save the file?"

import { getBooks, getEntries, getProjects, getSymbols, getCounts, DATA_MODE } from '../../services/canon-data.js';
import { getFavorites } from '../../services/favorites.js';
import { getRecent } from '../../state.js';
import { BookGrid } from './BookGrid.js';
import { SearchBar } from './SearchBar.js';
import { QuickFilters } from './QuickFilters.js';
import { RecentActivity } from './RecentActivity.js';

export function LibraryView() {
  const view = document.createElement('div');
  view.className = 'library';

  // ---- Header: title, counts, search button ----
  const header = document.createElement('section');
  header.className = 'library-header';
  header.innerHTML = `
    <div>
      <span class="eyebrow">The Living Library</span>
      <h2>Library</h2>
      <p class="library-header__counts text-muted" aria-live="polite">Counting the shelves…</p>
    </div>
  `;
  const searchBtn = document.createElement('button');
  searchBtn.className = 'btn btn--ghost';
  searchBtn.textContent = 'Search the Canon';
  searchBtn.setAttribute('aria-label', 'Open Canon search (Ctrl+K)');
  searchBtn.addEventListener('click', () =>
    window.dispatchEvent(new CustomEvent('bpc:open-search'))
  );
  header.appendChild(searchBtn);
  view.appendChild(header);

  // ---- State for filtering ----
  let allBooks = [];
  let entryCounts = {};
  let query = '';
  let filter = 'all';

  // ---- Controls ----
  view.appendChild(
    SearchBar({
      onInput(value) {
        query = value;
        renderShelf();
      },
    })
  );

  view.appendChild(
    QuickFilters({
      active: 'all',
      onChange(id) {
        filter = id;
        renderShelf();
      },
    })
  );

  // ---- Shelf ----
  const shelfSlot = document.createElement('div');
  shelfSlot.setAttribute('aria-busy', 'true');
  view.appendChild(shelfSlot);

  // ---- Recent activity ----
  view.appendChild(RecentActivity());

  if (DATA_MODE === 'mock') {
    const note = document.createElement('p');
    note.className = 'tagline';
    note.textContent = 'Mock data · local JSON · the specialized backend arrives in Sprint 6.';
    view.appendChild(note);
  }

  // ---- Filter logic ----
  const BOOK_FILTERS = {
    all: () => true,
    books: () => true,
    visual: (b) => b.id === 'BOOK-004',
    symbols: (b) => b.id === 'BOOK-005',
    favorites: (b) => getFavorites().has(b.id),
    recent: (b) => getRecent().some((r) => r.href.includes(b.id)),
  };

  const EMPTY_MESSAGES = {
    projects: 'No Projects shelved yet — they arrive when the Atelier fills.',
    components: 'No Components catalogued yet.',
    packaging: 'No Packaging designs shelved yet.',
    prompts: 'No Prompts collected yet.',
    favorites: 'No favorites yet. Tap the star on any Book to keep it close.',
    recent: 'Nothing visited recently. Open a Book to begin.',
  };

  function renderShelf() {
    const q = query.trim().toLowerCase();

    let books;
    if (filter in BOOK_FILTERS) {
      books = allBooks.filter(BOOK_FILTERS[filter]);
    } else {
      books = []; // projects / components / packaging / prompts — honestly empty in mock
    }

    if (q) {
      books = books.filter((b) =>
        `${b.title} ${b.description || ''}`.toLowerCase().includes(q)
      );
    }

    const grid = BookGrid(books, {
      entryCounts,
      emptyMessage: q
        ? 'No Books match that search. Try another word.'
        : EMPTY_MESSAGES[filter],
      onFavoriteChange: renderShelf,
    });

    shelfSlot.innerHTML = '';
    shelfSlot.removeAttribute('aria-busy');
    shelfSlot.appendChild(grid);
  }

  // ---- Load data ----
  Promise.all([getBooks(), getEntries(), getCounts()]).then(
    ([books, entries, counts]) => {
      allBooks = books;
      entryCounts = entries.reduce((acc, e) => {
        acc[e.bookId] = (acc[e.bookId] || 0) + 1;
        return acc;
      }, {});
      header.querySelector('.library-header__counts').textContent =
        `${counts.books} ${counts.books === 1 ? 'Book' : 'Books'} · ${counts.entries} ${counts.entries === 1 ? 'Entry' : 'Entries'}`;
      renderShelf();
    }
  );

  return view;
}
