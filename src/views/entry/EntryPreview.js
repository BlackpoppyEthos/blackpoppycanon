// Black Poppy Canon — EntryPreview
// The live rendering of the page as it will read.

import { renderMarkdown } from '../../services/markdown.js';

export function EntryPreview() {
  const wrap = document.createElement('div');
  wrap.className = 'entry-pane entry-pane--preview';

  const article = document.createElement('div');
  article.className = 'prose entry-preview';
  article.setAttribute('aria-label', 'Entry preview');
  article.setAttribute('aria-live', 'polite');
  wrap.appendChild(article);

  return {
    el: wrap,
    article,
    update(markdown) {
      article.innerHTML = renderMarkdown(markdown) ||
        '<p class="panel__empty">The page is blank — an invitation, not an absence.</p>';
    },
  };
}
