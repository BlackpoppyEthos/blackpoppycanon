// Black Poppy Canon — EntryView (Reader)
// Title · Metadata · Body · Relationships · Timeline · Versions.
// Printable with Ctrl+P or the Print button. Editable if local.

import { getEntry, getBook, isLocalEntry, archiveEntry } from '../../services/canon-data.js';
import { EmptyState } from '../../components/card.js';
import { recordOpened } from '../../state.js';
import { renderMarkdown, wordCount, readingTime } from '../../services/markdown.js';
import { EntryMetadata } from './EntryMetadata.js';
import { RelationshipPanel } from './RelationshipPanel.js';
import { VersionHistory } from './VersionHistory.js';
import { attachPrintChrome, printPage } from './PrintView.js';
import { STATUS_LABELS } from '../library/BookCard.js';

export function EntryView(params = {}) {
  const view = document.createElement('div');
  view.className = 'entry-reader';

  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      printPage();
    }
  };
  window.addEventListener('keydown', onKey);
  // Router replaces the outlet on navigation; listener is re-bound per view.
  // Guard against duplicates by removing on next hashchange.
  window.addEventListener('hashchange', () => window.removeEventListener('keydown', onKey), { once: true });

  getEntry(params.id).then(async (entry) => {
    if (!entry) {
      const empty = EmptyState({
        symbol: 'star',
        title: 'This entry is not yet written.',
        body: 'Nothing lives at this address in the Canon. Perhaps it is waiting for you to write it.',
      });
      const write = document.createElement('a');
      write.className = 'btn';
      write.style.marginTop = 'var(--space-4)';
      write.style.display = 'inline-block';
      write.href = '#/write';
      write.textContent = 'Write an Entry';
      empty.appendChild(write);
      view.appendChild(empty);
      return;
    }

    const book = await getBook(entry.bookId);
    const local = isLocalEntry(entry.id);

    recordOpened({
      kind: 'Entry',
      title: entry.title,
      href: `#/entry/${encodeURIComponent(entry.id)}`,
      date: new Date().toISOString(),
    });

    // Crumb + actions (never printed)
    const bar = document.createElement('div');
    bar.className = 'entry-bar no-print';

    const crumb = document.createElement('a');
    crumb.className = 'crumb';
    crumb.style.marginBottom = '0';
    crumb.href = book ? `#/book/${encodeURIComponent(book.id)}` : '#/library';
    crumb.textContent = book ? `← ${book.title}` : '← Library';
    bar.appendChild(crumb);

    const actions = document.createElement('div');
    actions.className = 'entry-actions';

    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn--ghost';
    printBtn.textContent = 'Print this page';
    printBtn.addEventListener('click', printPage);
    actions.appendChild(printBtn);

    if (local && entry.status !== 'archived') {
      const edit = document.createElement('a');
      edit.className = 'btn btn--ghost';
      edit.href = `#/write/${encodeURIComponent(entry.id)}`;
      edit.textContent = 'Edit';
      actions.appendChild(edit);

      const archive = document.createElement('button');
      archive.className = 'btn btn--ghost';
      archive.textContent = 'Archive';
      archive.addEventListener('click', () => {
        if (window.confirm(`Archive “${entry.title}”? Nothing is deleted — it simply rests.`)) {
          archiveEntry(entry.id);
          window.location.hash = book ? `#/book/${book.id}` : '#/library';
        }
      });
      actions.appendChild(archive);
    }

    bar.appendChild(actions);
    view.appendChild(bar);

    // The printable page
    const page = document.createElement('article');
    page.className = 'entry-page';

    const head = document.createElement('header');
    head.className = 'entry-page__head';
    head.innerHTML = `
      <span class="eyebrow"></span>
      <h2 class="entry-page__title"></h2>
      <p class="entry-page__date"></p>
    `;
    head.querySelector('.eyebrow').textContent =
      `${book ? book.title : 'The Canon'} · ${entry.id} · ${entry.type || 'Canon Entry'} · ${STATUS_LABELS[entry.status] || entry.status}`;
    head.querySelector('.entry-page__title').textContent = entry.title;
    head.querySelector('.entry-page__date').textContent =
      `Written ${new Date(entry.created || entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}` +
      ` · v${entry.version || 1}` +
      ` · ${wordCount(entry.body)} words · ${readingTime(entry.body)} min read` +
      (local ? ' · stored on this device' : '');
    page.appendChild(head);

    const body = document.createElement('div');
    body.className = 'entry-md entry-page__body';
    body.innerHTML = renderMarkdown(entry.body);
    page.appendChild(body);

    attachPrintChrome(page, {
      bookTitle: book ? book.title : 'The Black Poppy Canon',
      entryTitle: entry.title,
      version: entry.version || 1,
    });

    view.appendChild(page);

    // Below the page: threads, timeline, versions (screen only)
    const below = document.createElement('div');
    below.className = 'entry-below no-print';

    below.appendChild(RelationshipPanel(entry, { editable: false }).el);

    const timeline = document.createElement('section');
    timeline.className = 'card';
    timeline.innerHTML = '<span class="eyebrow">Timeline</span>';
    const tl = document.createElement('ul');
    tl.className = 'panel__list';
    const tlItems = [
      ['Created', entry.created || entry.date],
      ['Last updated', entry.updated],
    ];
    tlItems.forEach(([label, when]) => {
      const li = document.createElement('li');
      li.innerHTML = `<span></span><span class="panel__meta"></span>`;
      li.children[0].textContent = label;
      li.children[1].textContent = new Date(when).toLocaleString();
      tl.appendChild(li);
    });
    timeline.appendChild(tl);
    below.appendChild(timeline);

    below.appendChild(VersionHistory(entry));

    view.appendChild(below);

    const meta = EntryMetadata(entry, book);
    meta.classList.add('no-print');
    view.insertBefore(meta, page);
  });

  return view;
}
