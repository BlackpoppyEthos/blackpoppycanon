// Black Poppy Canon — Book view
// One of the twelve Books, opened: its description, its statistics,
// its place in the root system, and the entries shelved inside it.

import * as canonData from '../services/canon-data.js';
import { listForEntry } from '../services/RelationshipService.js';
import { RelationshipCard } from './relationship/RelationshipCard.js';
import { wordCount } from '../services/markdown.js';
import { navigate } from '../router.js';
import { Breadcrumbs } from '../components/breadcrumbs.js';

const dateFmt = (iso) => new Date(iso).toLocaleDateString();

export function BookView(params = {}) {
  const view = document.createElement('div');
  view.className = 'book-view';

  load();
  return view;

  async function load() {
    const [book, books, entries, rels, symbols] = await Promise.all([
      canonData.getBook(params.id),
      canonData.listBooks(),
      canonData.listEntries(),
      listForEntry(params.id),
      canonData.listSymbols(),
    ]);

    if (!book) {
      view.innerHTML = '';
      const missing = document.createElement('section');
      missing.className = 'empty';
      missing.innerHTML = `
        <h2>No Book answers to that name.</h2>
        <p>The Canon holds twelve. All of them live in the Library.</p>
        <p><a class="btn btn--ghost" href="#/library">Return to the Library</a></p>`;
      view.appendChild(missing);
      return;
    }

    document.title = `${book.title} · Black Poppy Canon`;
    const own = entries.filter((e) => e.bookId === book.id);

    /* ---- header: title + description ---- */

    const header = document.createElement('header');
    header.className = 'book-view__header';

    view.appendChild(Breadcrumbs([
      { label: 'Dashboard', href: '#/' },
      { label: 'Library', href: '#/library' },
      { label: book.title },
    ]));

    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = `${book.id} · The Library`;

    const title = document.createElement('h2');
    title.className = 'book-view__title';
    title.textContent = book.title;

    const description = document.createElement('p');
    description.className = book.note ? 'book-view__description' : 'panel__empty book-view__description';
    description.textContent = book.note ||
      'This Book has no description yet. Its meaning is still being uncovered — that is allowed.';

    header.append(eyebrow, title, description);
    view.appendChild(header);

    /* ---- statistics ---- */

    const statsCard = document.createElement('section');
    statsCard.className = 'card panel';
    statsCard.innerHTML = '<span class="eyebrow">Statistics</span>';

    const stats = document.createElement('div');
    stats.className = 'book-view__stats';

    const words = own.reduce((sum, e) => sum + wordCount(e.body), 0);
    const versions = own.reduce((sum, e) => sum + (e.versions || []).length, 0);
    const connections = rels.outgoing.length + rels.incoming.length;
    const newest = own.length
      ? own.reduce((a, b) => (new Date(a.updated) > new Date(b.updated) ? a : b))
      : null;

    [
      [own.length, own.length === 1 ? 'Entry' : 'Entries'],
      [words, 'Words'],
      [versions, 'Versions kept'],
      [connections, 'Connections'],
      [newest ? dateFmt(newest.updated) : '—', 'Last tended'],
    ].forEach(([value, label]) => {
      const stat = document.createElement('div');
      stat.className = 'stat';
      const v = document.createElement('span');
      v.className = 'stat__value';
      v.textContent = String(value);
      const l = document.createElement('span');
      l.className = 'stat__label';
      l.textContent = label;
      stat.append(v, l);
      stats.appendChild(stat);
    });

    statsCard.appendChild(stats);
    view.appendChild(statsCard);

    /* ---- relationships ---- */

    const relCard = document.createElement('section');
    relCard.className = 'card panel';
    relCard.innerHTML = '<span class="eyebrow">Relationships</span>';

    const all = [
      ...rels.outgoing.map((rel) => ({ rel, direction: 'out' })),
      ...rels.incoming.map((rel) => ({ rel, direction: 'in' })),
    ];

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
      p.textContent = 'This Book stands quietly on its own for now. Entries inside it will draw the first threads.';
      relCard.appendChild(p);
    }
    view.appendChild(relCard);

    /* ---- entries ---- */

    const entriesCard = document.createElement('section');
    entriesCard.className = 'card panel';
    entriesCard.innerHTML = '<span class="eyebrow">Entries</span>';

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
        const chip = document.createElement('span');
        chip.className = `chip chip--status chip--${e.status}`;
        chip.textContent = e.status;
        meta.append(chip, document.createTextNode(` ${e.type} · v${e.version} · ${dateFmt(e.updated)}`));
        li.append(a, meta);
        ul.appendChild(li);
      });
      entriesCard.appendChild(ul);

      const open = document.createElement('a');
      open.className = 'btn btn--ghost panel__action';
      open.href = `#/entry/${(newest || own[0]).id}`;
      open.textContent = 'Open Entry →';
      entriesCard.appendChild(open);
    } else {
      // Not an apology — an onboarding moment, in the Canon's voice.
      const invite = document.createElement('div');
      invite.className = 'book-view__invite';
      const line1 = document.createElement('p');
      line1.className = 'book-view__invite-title';
      line1.textContent = 'This Book has not yet been written.';
      const line2 = document.createElement('p');
      line2.className = 'panel__empty book-view__invite-sub';
      line2.textContent = 'Every Canon begins with a single entry.';
      invite.append(line1, line2);
      entriesCard.appendChild(invite);
    }

    const begin = document.createElement('button');
    begin.type = 'button';
    begin.className = 'btn panel__action';
    begin.style.marginLeft = own.length ? 'var(--space-3)' : '0';
    begin.textContent = own.length ? 'Begin an entry →' : 'Create the First Entry →';
    begin.addEventListener('click', async () => {
      const entry = await canonData.createEntry({ bookId: book.id });
      navigate(`/entry/${entry.id}`);
    });
    entriesCard.appendChild(begin);

    view.appendChild(entriesCard);
  }
}
