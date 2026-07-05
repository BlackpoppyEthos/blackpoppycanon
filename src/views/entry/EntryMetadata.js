// Black Poppy Canon — EntryMetadata
// The card catalog for a single entry. Read shows the record;
// Write lets the record be corrected.

import { ENTRY_TYPES, ENTRY_STATUSES } from '../../services/canon-data.js';

const dateFmt = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export function EntryMetadata({ entry, books, relCount, onChange }) {
  const el = document.createElement('details');
  el.className = 'card entry-panel entry-panel--metadata';
  el.open = false;

  const summary = document.createElement('summary');
  summary.className = 'entry-panel__summary';
  summary.textContent = 'Metadata';
  el.appendChild(summary);

  const dl = document.createElement('dl');
  dl.className = 'entry-meta';

  function row(term, node) {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    if (typeof node === 'string') dd.textContent = node;
    else dd.appendChild(node);
    dl.append(dt, dd);
  }

  function select(options, value, label, apply) {
    const s = document.createElement('select');
    s.className = 'entry-input';
    s.setAttribute('aria-label', label);
    options.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value ?? opt;
      o.textContent = opt.label ?? opt;
      if (o.value === value) o.selected = true;
      s.appendChild(o);
    });
    s.addEventListener('change', () => apply(s.value));
    return s;
  }

  const bookOptions = books.map((b) => ({ value: b.id, label: b.title }));

  row('Entry ID', entry.id);
  row('Book', select(bookOptions, entry.bookId, 'Book', (v) => onChange({ bookId: v })));
  row('Category', select(ENTRY_TYPES, entry.type, 'Category', (v) => onChange({ type: v })));

  const tags = document.createElement('input');
  tags.className = 'entry-input';
  tags.type = 'text';
  tags.value = (entry.tags || []).join(', ');
  tags.placeholder = 'comma, separated, tags';
  tags.setAttribute('aria-label', 'Tags');
  tags.addEventListener('change', () =>
    onChange({ tags: tags.value.split(',').map((t) => t.trim()).filter(Boolean) })
  );
  row('Tags', tags);

  row('Status', select(ENTRY_STATUSES, entry.status, 'Status', (v) => onChange({ status: v })));
  row('Version', `v${entry.version}`);
  row('Created', dateFmt(entry.created));
  row('Modified', dateFmt(entry.updated));
  row('Author', entry.author || '—');
  row('Relationships', String(relCount ?? (entry.relationships || []).length));

  el.appendChild(dl);
  return el;
}
