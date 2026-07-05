// Black Poppy Canon — EntryPreview
// The words as they will be read. Live, quiet, typographic.

import { renderMarkdown } from '../../services/markdown.js';

export function EntryPreview() {
  const el = document.createElement('div');
  el.className = 'entry-md';
  el.setAttribute('aria-label', 'Preview');

  return {
    el,
    render(src) {
      el.innerHTML = renderMarkdown(src);
    },
  };
}
