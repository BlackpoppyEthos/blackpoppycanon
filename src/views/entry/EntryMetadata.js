// Black Poppy Canon — EntryMetadata
// The facts of an entry: id, book, type, tags, status, version, dates, author.

import { STATUS_LABELS } from '../library/BookCard.js';

export function EntryMetadata(entry, book) {
  const el = document.createElement('aside');
  el.className = 'entry-meta card';
  el.setAttribute('aria-label', 'Entry metadata');

  const rows = [
    ['Entry', entry.id],
    ['Book', book ? book.title : entry.bookId],
    ['Type', entry.type || 'Canon Entry'],
    ['Tags', (entry.tags || []).join(', ') || '—'],
    ['Status', STATUS_LABELS[entry.status] || entry.status],
    ['Version', `v${entry.version || 1}`],
    ['Created', new Date(entry.created || entry.date).toLocaleDateString()],
    ['Updated', new Date(entry.updated).toLocaleDateString()],
    ['Author', entry.author || 'Rachael Nike'],
  ];

  el.innerHTML =
    '<span class="eyebrow">Metadata</span>' +
    '<dl class="entry-meta__list">' +
    rows.map(([k, v]) => `<div><dt>${k}</dt><dd></dd></div>`).join('') +
    '</dl>';

  el.querySelectorAll('dd').forEach((dd, i) => (dd.textContent = rows[i][1]));

  return el;
}
