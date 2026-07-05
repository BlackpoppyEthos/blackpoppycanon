// Black Poppy Canon — Inspector (APP-006)
// One object, examined: title, type, status, presence, tags,
// content, notes, versions, relationships — and the two verbs
// that matter: Promote to Canon, Remove from table.

import { presenceBadge } from '../../services/WorktableService.js';
import { listForEntry } from '../../services/RelationshipService.js';

const dateFmt = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const EDITABLE_CONTENT = ['sticky', 'note', 'url', 'swatch', 'checklist', 'image'];

export function Inspector({ onPatch, onPromote, onRemove, onDuplicate }) {
  const el = document.createElement('aside');
  el.className = 'atelier-inspector';
  el.setAttribute('aria-label', 'Inspector');

  paintEmpty();

  return { el, paint, paintEmpty };

  function paintEmpty() {
    el.innerHTML = `
      <h3 class="atelier-inspector__title">Inspector</h3>
      <p class="panel__empty">Select an object on the table and its whole story appears here.</p>`;
  }

  async function paint(obj) {
    el.innerHTML = '';

    const heading = document.createElement('h3');
    heading.className = 'atelier-inspector__title';
    heading.textContent = 'Inspector';
    el.appendChild(heading);

    const presence = document.createElement('p');
    presence.className = 'atelier-inspector__presence';
    presence.innerHTML = `<span aria-hidden="true">${presenceBadge(obj.status)}</span> ${obj.status} · ${obj.type} · v${obj.version || 1}`;
    el.appendChild(presence);

    const form = document.createElement('div');
    form.className = 'atelier-inspector__form';
    el.appendChild(form);

    field('Title', input('text', obj.title, (v) => onPatch(obj, { title: v })));

    const statusSelect = document.createElement('select');
    statusSelect.className = 'entry-input';
    ['looking-glass', 'atelier', 'canon', 'archived'].forEach((s) => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      if (s === obj.status) o.selected = true;
      statusSelect.appendChild(o);
    });
    statusSelect.addEventListener('change', () => onPatch(obj, { status: statusSelect.value }));
    field('Status', statusSelect);

    if (EDITABLE_CONTENT.includes(obj.type)) {
      const content = document.createElement('textarea');
      content.className = 'entry-input atelier-inspector__content';
      content.rows = obj.type === 'note' ? 6 : 3;
      content.value = obj.content || '';
      content.placeholder = obj.type === 'checklist' ? '[ ] one item per line'
        : obj.type === 'swatch' ? '#8B7A9E'
        : obj.type === 'url' ? 'https://…'
        : obj.type === 'image' ? 'image URL or imported data'
        : 'Content…';
      content.addEventListener('change', () => onPatch(obj, { content: content.value }, true));
      field('Content', content);
    }

    field('Tags', input('text', (obj.tags || []).join(', '), (v) =>
      onPatch(obj, { tags: v.split(',').map((t) => t.trim()).filter(Boolean) })));

    const fav = document.createElement('button');
    fav.type = 'button';
    fav.className = 'btn btn--ghost';
    fav.textContent = obj.favorite ? '♥ Favorited' : '♡ Favorite';
    fav.setAttribute('aria-pressed', String(!!obj.favorite));
    fav.addEventListener('click', () => onPatch(obj, { favorite: !obj.favorite }, true));
    field('Favorite', fav);

    const notes = document.createElement('textarea');
    notes.className = 'entry-input';
    notes.rows = 2;
    notes.value = obj.notes || '';
    notes.placeholder = 'Working notes…';
    notes.addEventListener('change', () => onPatch(obj, { notes: notes.value }));
    field('Notes', notes);

    const meta = document.createElement('p');
    meta.className = 'panel__meta panel__meta--block';
    meta.textContent = `Created ${dateFmt(obj.created)} · Modified ${dateFmt(obj.updated)}`;
    form.appendChild(meta);

    // Relationships (through the object's canon identity when it has one)
    const rels = await listForEntry(obj.refId || obj.id);
    const relCount = rels.outgoing.length + rels.incoming.length;
    const relLine = document.createElement('p');
    relLine.className = 'panel__meta panel__meta--block';
    relLine.textContent = `Relationships: ${relCount}`;
    if (obj.refId) {
      const link = document.createElement('a');
      link.href = obj.refId.startsWith('SYM') ? `#/symbol/${obj.refId}` : `#/entry/${obj.refId}`;
      link.textContent = ' · open in the Canon →';
      relLine.appendChild(link);
    }
    form.appendChild(relLine);

    /* ---- verbs ---- */
    const actions = document.createElement('div');
    actions.className = 'atelier-inspector__actions';

    const promote = document.createElement('button');
    promote.type = 'button';
    promote.className = 'btn';
    promote.textContent = '🏛 Promote to Canon';
    promote.disabled = obj.status === 'canon';
    promote.addEventListener('click', () => onPromote(obj));

    const dup = document.createElement('button');
    dup.type = 'button';
    dup.className = 'btn btn--ghost';
    dup.textContent = 'Duplicate';
    dup.addEventListener('click', () => onDuplicate(obj));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn--ghost atelier-inspector__remove';
    remove.textContent = 'Remove from table';
    remove.addEventListener('click', () => onRemove(obj));

    actions.append(promote, dup, remove);
    el.appendChild(actions);

    function field(label, node) {
      const wrap = document.createElement('label');
      wrap.className = 'atelier-inspector__field';
      const span = document.createElement('span');
      span.className = 'atelier-inspector__label';
      span.textContent = label;
      wrap.append(span, node);
      form.appendChild(wrap);
    }

    function input(type, value, apply) {
      const i = document.createElement('input');
      i.className = 'entry-input';
      i.type = type;
      i.value = value;
      i.addEventListener('change', () => apply(i.value));
      return i;
    }
  }
}
