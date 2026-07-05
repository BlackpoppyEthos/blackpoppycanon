// Black Poppy Canon — Book view (Sprint 4.3)
// One Book, its entries beneath it. In mock mode the Constitution
// stands with empty pages — the Canon is written, not invented.

import { getBook, getEntries } from '../services/canon-data.js';
import { EmptyState } from '../components/card.js';
import { recordOpened } from '../state.js';

export function BookView(params = {}) {
  const view = document.createElement('div');

  const header = document.createElement('section');
  view.appendChild(header);

  const list = document.createElement('div');
  view.appendChild(list);

  getBook(params.id).then((book) => {
    if (!book) {
      header.appendChild(
        EmptyState({
          symbol: 'book',
          title: 'No such Book.',
          body: 'This shelf holds nothing by that name. Return to the Library.',
        })
      );
      return;
    }

    recordOpened({
      kind: 'Book',
      title: book.title,
      href: `#/book/${encodeURIComponent(book.id)}`,
      date: new Date().toISOString(),
    });

    header.innerHTML = `
      <a href="#/library" class="crumb">← Library</a>
      <span class="eyebrow">${book.id}</span>
      <h2>${book.title}</h2>
      <a class="btn btn--ghost" style="text-decoration:none" href="#/write/${encodeURIComponent(book.id)}">Write an entry in this Book</a>
    `;

    getEntries(book.id).then((entries) => {
      if (!entries.length) {
        list.appendChild(
          EmptyState({
            symbol: 'star',
            title: 'The pages are ready.',
            body: `“${book.title}” has no entries yet. The Canon is written through creating. Write the first one.`,
          })
        );
        return;
      }

      const ul = document.createElement('div');
      ul.className = 'grid';
      entries.forEach((e) => {
        const a = document.createElement('a');
        a.className = 'card card--link';
        a.href = `#/entry/${encodeURIComponent(e.id)}`;
        a.innerHTML = `<h3 class="card__title"></h3><p class="card__meta"></p>`;
        a.querySelector('.card__title').textContent = e.title;
        a.querySelector('.card__meta').textContent = `${e.type || 'Canon Entry'} · v${e.version || 1} · ${new Date(e.updated || e.date).toLocaleDateString()}`;
        ul.appendChild(a);
      });
      list.appendChild(ul);
    });
  });

  return view;
}
