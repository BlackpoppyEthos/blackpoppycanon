// Black Poppy Canon — TemplatePicker (APP-006)
// A new Worktable begins with a name and, if wanted, a starting
// arrangement. Native <dialog>: focus held, Escape dismisses.

import { WORKTABLE_TEMPLATES } from '../../services/WorktableService.js';

export function TemplatePicker({ onCreate }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'rel-modal atelier-templates';
  dialog.setAttribute('aria-label', 'New worktable');

  dialog.innerHTML = `
    <form method="dialog" class="rel-modal__form">
      <h3 class="rel-modal__title">A new Worktable</h3>
      <p class="panel__meta panel__meta--block">Not a file. Not a folder. A living surface.</p>

      <label class="rel-modal__label" for="bpc-wt-name">Name</label>
      <input id="bpc-wt-name" class="entry-input" type="text" placeholder="Packaging, Wonderland, Garden…" required>

      <label class="rel-modal__label" for="bpc-wt-template">Begin from</label>
      <select id="bpc-wt-template" class="entry-input"></select>

      <div class="rel-modal__actions">
        <button type="button" class="btn btn--ghost" data-cancel>Cancel</button>
        <button type="submit" class="btn">Lay the table</button>
      </div>
    </form>
  `;

  const name = dialog.querySelector('#bpc-wt-name');
  const template = dialog.querySelector('#bpc-wt-template');
  Object.keys(WORKTABLE_TEMPLATES).forEach((t) => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    template.appendChild(o);
  });

  dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());
  dialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!name.value.trim()) return;
    dialog.close();
    onCreate({ name: name.value.trim(), template: template.value });
    name.value = '';
  });

  return {
    el: dialog,
    open() {
      if (!dialog.isConnected) document.body.appendChild(dialog);
      dialog.showModal();
      name.focus();
    },
  };
}
