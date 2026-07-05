// Black Poppy Canon — EntryEditor (Writer)
// A calm desk. Markdown on the left, the page taking shape on the right.
// Autosave keeps a silent draft every 10 seconds; Ctrl+S (or the button)
// commits a version. Drafts protect the work; versions tell the story.

import {
  getBooks, getEntry, saveEntry, isLocalEntry,
  saveDraft, getDraft, clearDraft,
  ENTRY_TYPES, ENTRY_STATUSES,
} from '../../services/canon-data.js';
import { wordCount, readingTime } from '../../services/markdown.js';
import { EntryPreview } from './EntryPreview.js';
import { EntryToolbar } from './EntryToolbar.js';
import { RelationshipPanel } from './RelationshipPanel.js';
import { STATUS_LABELS } from '../library/BookCard.js';
import { printPage } from './PrintView.js';

const AUTOSAVE_MS = 10000;

export function EntryEditor(params = {}) {
  const view = document.createElement('div');
  view.className = 'writer';

  const editingId = params.id && params.id.startsWith('ENTRY-') ? params.id : null;
  const preselectBook = params.id && params.id.startsWith('BOOK-') ? params.id : null;
  const draftKey = editingId || 'new';

  view.innerHTML = `
    <div class="entry-bar no-print">
      <a href="${editingId ? `#/entry/${editingId}` : '#/library'}" class="crumb" style="margin-bottom:0">← ${editingId ? 'Entry' : 'Library'}</a>
    </div>
    <span class="eyebrow">${editingId ? 'Revise the Canon' : 'Write the Canon'}</span>
    <h2>${editingId ? 'Edit Entry' : 'New Entry'}</h2>
  `;

  // ---- Metadata fields ----
  const metaRow = document.createElement('div');
  metaRow.className = 'writer__meta-row';

  const bookSelect = document.createElement('select');
  bookSelect.className = 'writer__select';
  bookSelect.setAttribute('aria-label', 'Book');
  bookSelect.innerHTML = '<option value="" disabled selected>Choose a Book…</option>';

  const typeSelect = document.createElement('select');
  typeSelect.className = 'writer__select';
  typeSelect.setAttribute('aria-label', 'Entry type');
  typeSelect.innerHTML = ENTRY_TYPES.map((t) => `<option>${t}</option>`).join('');

  const statusSelect = document.createElement('select');
  statusSelect.className = 'writer__select';
  statusSelect.setAttribute('aria-label', 'Status');
  statusSelect.innerHTML = ENTRY_STATUSES
    .map((s) => `<option value="${s}">${STATUS_LABELS[s]}</option>`)
    .join('');

  metaRow.append(bookSelect, typeSelect, statusSelect);
  view.appendChild(metaRow);

  const titleInput = document.createElement('input');
  titleInput.className = 'writer__input writer__input--title';
  titleInput.type = 'text';
  titleInput.maxLength = 140;
  titleInput.placeholder = 'Name the lesson…';
  titleInput.setAttribute('aria-label', 'Entry title');
  view.appendChild(titleInput);

  const tagsInput = document.createElement('input');
  tagsInput.className = 'writer__input';
  tagsInput.type = 'text';
  tagsInput.placeholder = 'Tags, separated by commas…';
  tagsInput.setAttribute('aria-label', 'Tags');
  view.appendChild(tagsInput);

  // ---- Editor + preview split ----
  const body = document.createElement('textarea');
  body.className = 'writer__textarea';
  body.rows = 18;
  body.placeholder = 'Write what proved true… (markdown welcome)';
  body.setAttribute('aria-label', 'Entry body, markdown');

  const preview = EntryPreview();

  const split = document.createElement('div');
  split.className = 'writer__split';

  const editorPane = document.createElement('div');
  editorPane.className = 'writer__pane';
  const previewPane = document.createElement('div');
  previewPane.className = 'writer__pane writer__pane--preview card';
  previewPane.appendChild(preview.el);

  const toolbar = EntryToolbar(body, {
    onInput: () => onBodyInput(),
    onPrint: printPage,
  });

  editorPane.append(toolbar, body);
  split.append(editorPane, previewPane);
  view.appendChild(split);

  // Tablet/mobile toggle
  const toggle = document.createElement('button');
  toggle.className = 'btn btn--ghost writer__toggle no-print';
  toggle.textContent = 'Preview';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.addEventListener('click', () => {
    const showing = split.classList.toggle('is-preview');
    toggle.textContent = showing ? 'Write' : 'Preview';
    toggle.setAttribute('aria-pressed', String(showing));
  });
  view.insertBefore(toggle, split);

  // ---- Status line ----
  const statusLine = document.createElement('p');
  statusLine.className = 'writer__count';
  statusLine.setAttribute('aria-live', 'polite');
  view.appendChild(statusLine);

  const message = document.createElement('p');
  message.className = 'writer__message';
  message.setAttribute('role', 'status');
  view.appendChild(message);

  // ---- Relationships (editing an existing local entry) ----
  let relPanel = null;

  // ---- Save actions ----
  const actions = document.createElement('div');
  actions.className = 'writer__actions no-print';

  const summaryInput = document.createElement('input');
  summaryInput.className = 'writer__input';
  summaryInput.type = 'text';
  summaryInput.placeholder = editingId ? 'What changed? (version summary, optional)' : 'Version summary (optional)';
  summaryInput.setAttribute('aria-label', 'Version summary');

  const save = document.createElement('button');
  save.className = 'btn';
  save.textContent = editingId ? 'Save Revision (Ctrl+S)' : 'Add to the Canon (Ctrl+S)';

  actions.append(save);
  view.append(summaryInput, actions);

  // ---- Behavior ----
  let dirty = false;
  let autosaveTimer = null;

  function currentDraft() {
    return {
      bookId: bookSelect.value,
      type: typeSelect.value,
      status: statusSelect.value,
      title: titleInput.value,
      tags: tagsInput.value,
      body: body.value,
    };
  }

  function updateStatusLine(extra = '') {
    statusLine.textContent =
      `${wordCount(body.value)} words · ${readingTime(body.value)} min read${extra}`;
  }

  function onBodyInput() {
    dirty = true;
    preview.render(body.value);
    updateStatusLine();
  }

  body.addEventListener('input', onBodyInput);
  [bookSelect, typeSelect, statusSelect, titleInput, tagsInput].forEach((f) =>
    f.addEventListener('input', () => { dirty = true; })
  );

  function autosave() {
    if (!dirty) return;
    saveDraft(draftKey, currentDraft());
    dirty = false;
    updateStatusLine(` · draft kept ${new Date().toLocaleTimeString()}`);
  }

  autosaveTimer = setInterval(autosave, AUTOSAVE_MS);

  function commit() {
    const d = currentDraft();
    const title = d.title.trim();
    const bodyText = d.body.trim();

    if (!d.bookId || !title || !bodyText) {
      message.textContent = 'A Book, a title, and the entry itself — all three are needed.';
      return;
    }

    const entry = saveEntry({
      id: editingId,
      bookId: d.bookId,
      type: d.type,
      status: d.status,
      title,
      tags: d.tags.split(',').map((t) => t.trim()).filter(Boolean),
      body: bodyText,
      summary: summaryInput.value.trim() || undefined,
    });

    if (!entry) {
      message.textContent = 'Only entries written on this device can be revised here.';
      return;
    }

    clearDraft(draftKey);
    clearInterval(autosaveTimer);
    window.location.hash = `#/entry/${encodeURIComponent(entry.id)}`;
  }

  save.addEventListener('click', commit);

  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      commit();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      printPage();
    }
  };
  window.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', () => {
    window.removeEventListener('keydown', onKey);
    clearInterval(autosaveTimer);
  }, { once: true });

  // ---- Load data ----
  getBooks().then(async (books) => {
    bookSelect.innerHTML =
      '<option value="" disabled selected>Choose a Book…</option>' +
      books.map((b) => `<option value="${b.id}">${b.title}</option>`).join('');

    if (preselectBook) bookSelect.value = preselectBook;

    let base = null;
    if (editingId) {
      if (!isLocalEntry(editingId)) {
        message.textContent = 'Only entries written on this device can be edited here.';
        save.disabled = true;
        return;
      }
      base = await getEntry(editingId);
    }

    const draft = getDraft(draftKey);
    const src = draft || base;

    if (src) {
      bookSelect.value = src.bookId || '';
      typeSelect.value = src.type || 'Canon Entry';
      statusSelect.value = src.status || 'looking-glass';
      titleInput.value = src.title || '';
      tagsInput.value = Array.isArray(src.tags) ? src.tags.join(', ') : (src.tags || '');
      body.value = src.body || '';
      if (draft) message.textContent = `A kept draft from ${new Date(draft.savedAt).toLocaleString()} was restored.`;
    }

    if (base) {
      relPanel = RelationshipPanel(base, { editable: true });
      relPanel.el.classList.add('no-print');
      view.insertBefore(relPanel.el, summaryInput);
    }

    preview.render(body.value);
    updateStatusLine();
  });

  return view;
}
