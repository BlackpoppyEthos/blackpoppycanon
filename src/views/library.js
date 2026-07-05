// Black Poppy Canon — Library view (Sprint 4.4)
// The twelve Books, each a shelf of Entries. Every idea eventually
// becomes an Entry; every Entry lives in a Book.

import * as canonData from '../services/canon-data.js';
import { navigate } from '../router.js';
import { Breadcrumbs } from '../components/breadcrumbs.js';

const dateFmt = (iso) => new Date(iso).toLocaleDateString();

export function LibraryView() {
  const view = document.createElement('div');
  view.className = 'library';

  view.appendChild(Breadcrumbs([
    { label: 'Dashboard', href: '#/' },
    { label: 'Library' },
  ]));

  const intro = document.createElement('header');
  intro.className = 'library__intro';
  intro.innerHTML = `
    <span class="eyebrow">The Library</span>
    <h2>Twelve Books, one Canon.</h2>
    <p class="panel__meta panel__meta--block">Every page you write is kept. Nothing is deleted.</p>
  `;
  view.appendChild(intro);

  const shelves = document.createElement('div');
  shelves.className = 'library__shelves';
  view.appendChild(shelves);

  paint();
  return view;

  async function paint() {
    const [books, entries] = await Promise.all([
      canonData.listBooks(),
      canonData.listEntries(),
    ]);

    shelves.innerHTML = '';

    books.forEach((book) => {
      const shelf = document.createElement('section');
      shelf.className = 'card library-book';

      const head = document.createElement('div');
      head.className = 'library-book__head';

      const title = document.createElement('h3');
      title.className = 'library-book__title';
      const titleLink = document.createElement('a');
      titleLink.className = 'library-book__link';
      titleLink.href = `#/book/${book.id}`;
      titleLink.textContent = book.title;
      title.appendChild(titleLink);

      const id = document.createElement('span');
      id.className = 'panel__meta';
      id.textContent = book.id;

      head.append(title, id);
      shelf.appendChild(head);

      const own = entries.filter((e) => e.bookId === book.id);

      if (own.length) {
        const ul = document.createElement('ul');
        ul.className = 'panel__list';
        own.forEach((e) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#/entry/${e.id}`;
          a.textContent = e.title;
          const meta = document.createElement('span');
          meta.className = 'panel__meta';
          meta.append(chip(e.status), document.createTextNode(` ${e.type} · ${dateFmt(e.updated)}`));
          li.append(a, meta);
          ul.appendChild(li);
        });
        shelf.appendChild(ul);
      } else {
        const p = document.createElement('p');
        p.className = 'panel__empty';
        p.textContent = 'Not yet written. Every Canon begins with a single entry.';
        shelf.appendChild(p);
      }

      const begin = document.createElement('button');
      begin.type = 'button';
      begin.className = 'btn btn--ghost panel__action';
      begin.textContent = 'Begin an entry →';
      begin.addEventListener('click', async () => {
        const entry = await canonData.createEntry({ bookId: book.id });
        navigate(`/entry/${entry.id}`);
      });
      shelf.appendChild(begin);

      shelves.appendChild(shelf);
    });
  }

  function chip(status) {
    const s = document.createElement('span');
    s.className = `chip chip--status chip--${status}`;
    s.textContent = status;
    return s;
  }
}
