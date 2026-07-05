// Black Poppy Canon — PrintView
// The entry as a journal page: no chrome, ink on paper,
// the 11:11 mark in the footer. Hidden on screen; the only
// thing visible in print while an entry is open.

import { renderMarkdown } from '../../services/markdown.js';

const dateFmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' }) : '';

export function PrintView() {
  const el = document.createElement('div');
  el.className = 'entry-print';
  el.setAttribute('aria-hidden', 'true');

  return {
    el,
    update(entry, bookTitle) {
      el.innerHTML = '';

      const header = document.createElement('header');
      header.className = 'entry-print__header';
      const book = document.createElement('p');
      book.className = 'entry-print__book';
      book.textContent = `${bookTitle || 'The Canon'} · Black Poppy Canon`;
      const title = document.createElement('h1');
      title.className = 'entry-print__title';
      title.textContent = entry.title;
      const meta = document.createElement('p');
      meta.className = 'entry-print__meta';
      meta.textContent = [
        entry.id,
        `v${entry.version}`,
        entry.status,
        entry.author,
        dateFmt(entry.updated),
      ].filter(Boolean).join(' · ');
      header.append(book, title, meta);

      const body = document.createElement('div');
      body.className = 'prose entry-print__body';
      body.innerHTML = renderMarkdown(entry.body);

      const footer = document.createElement('footer');
      footer.className = 'entry-print__footer';
      footer.textContent = 'Noli illegitimi carborundum · 11:11';

      el.append(header, body, footer);
    },
  };
}
