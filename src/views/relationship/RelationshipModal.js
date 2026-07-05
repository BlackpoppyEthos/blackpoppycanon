// Black Poppy Canon — RelationshipModal
// A quiet dialog: choose a destination, name the connection,
// leave a note if the connection deserves one. Native <dialog>
// gives us focus containment and Escape for free.

import { RELATIONSHIP_TYPES, createRelationship } from '../../services/RelationshipService.js';

export function RelationshipModal({ entry, entries, books, symbols = [], onCreated }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'rel-modal';
  dialog.setAttribute('aria-label', 'Connect this entry');

  dialog.innerHTML = `
    <form method="dialog" class="rel-modal__form">
      <h3 class="rel-modal__title">Connect this entry</h3>
      <p class="panel__meta panel__meta--block">Everything can connect to everything.</p>

      <label class="rel-modal__label" for="bpc-rel-destination">Destination</label>
      <input id="bpc-rel-destination" class="entry-input" type="text"
        list="bpc-rel-destinations" placeholder="An entry, a Book, a symbol…"
        autocomplete="off" required>
      <datalist id="bpc-rel-destinations"></datalist>

      <label class="rel-modal__label" for="bpc-rel-type">Relationship</label>
      <select id="bpc-rel-type" class="entry-input"></select>

      <label class="rel-modal__label" for="bpc-rel-notes">Notes <span class="panel__meta">(optional)</span></label>
      <textarea id="bpc-rel-notes" class="entry-input rel-modal__notes" rows="2"
        placeholder="Why do these belong together?"></textarea>

      <div class="rel-modal__actions">
        <button type="button" class="btn btn--ghost" data-cancel>Cancel</button>
        <button type="submit" class="btn" data-save>Connect</button>
      </div>
    </form>
  `;

  const destination = dialog.querySelector('#bpc-rel-destination');
  const datalist = dialog.querySelector('#bpc-rel-destinations');
  const typeSelect = dialog.querySelector('#bpc-rel-type');
  const notes = dialog.querySelector('#bpc-rel-notes');

  RELATIONSHIP_TYPES.forEach((t) => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    typeSelect.appendChild(o);
  });

  // Every knowable destination: entries (not this one) and Books.
  entries.filter((e) => e.id !== entry.id).forEach((e) => {
    const o = document.createElement('option');
    o.value = e.title;
    o.label = 'Entry';
    datalist.appendChild(o);
  });
  books.forEach((b) => {
    const o = document.createElement('option');
    o.value = b.title;
    o.label = 'Book';
    datalist.appendChild(o);
  });
  symbols.forEach((s) => {
    const o = document.createElement('option');
    o.value = s.name;
    o.label = 'Symbol';
    datalist.appendChild(o);
  });

  dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());

  dialog.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = destination.value.trim();
    if (!raw) return;

    // Resolve a friendly name to a canon id where one exists;
    // unknown names are kept as written — the Canon may name them later.
    const targetId =
      entries.find((en) => en.title.toLowerCase() === raw.toLowerCase())?.id ||
      books.find((b) => b.title.toLowerCase() === raw.toLowerCase())?.id ||
      symbols.find((s) => s.name.toLowerCase() === raw.toLowerCase())?.id ||
      raw;

    await createRelationship({
      source: entry.id,
      target: targetId,
      type: typeSelect.value,
      notes: notes.value.trim(),
      author: entry.author || 'Rachael Nike',
    });

    dialog.close();
    destination.value = '';
    notes.value = '';
    onCreated();
  });

  return {
    el: dialog,
    open() {
      if (!dialog.isConnected) document.body.appendChild(dialog);
      dialog.showModal();
      destination.focus();
    },
  };
}
