// Black Poppy Canon — RelationshipPanel
// Entries connect to Books, other Entries, Symbols, Projects,
// Companions, Products, Components. Unlimited threads.

import { getBooks, getEntries, setRelationships, isLocalEntry } from '../../services/canon-data.js';

const KINDS = ['Book', 'Entry', 'Symbol', 'Project', 'Companion', 'Product', 'Component'];

export function RelationshipPanel(entry, { editable = false, onChange } = {}) {
  const el = document.createElement('section');
  el.className = 'card entry-relationships';
  el.innerHTML = '<span class="eyebrow">Relationships</span>';

  const list = document.createElement('div');
  list.className = 'rel-chips';
  el.appendChild(list);

  let relationships = (entry.relationships || []).slice();

  function chipHref(rel) {
    if (rel.kind === 'Book') return `#/book/${encodeURIComponent(rel.targetId)}`;
    if (rel.kind === 'Entry') return `#/entry/${encodeURIComponent(rel.targetId)}`;
    return null;
  }

  function renderChips() {
    list.innerHTML = '';
    if (!relationships.length) {
      list.innerHTML = '<p class="panel__empty">No threads connected yet.</p>';
      return;
    }
    relationships.forEach((rel, i) => {
      const href = chipHref(rel);
      const chip = document.createElement(href ? 'a' : 'span');
      chip.className = 'rel-chip';
      if (href) chip.href = href;
      chip.textContent = `${rel.kind}: ${rel.label}`;
      if (editable) {
        const x = document.createElement('button');
        x.className = 'rel-chip__remove';
        x.setAttribute('aria-label', `Remove relationship ${rel.label}`);
        x.textContent = '×';
        x.addEventListener('click', (e) => {
          e.preventDefault();
          relationships.splice(i, 1);
          commit();
        });
        chip.appendChild(x);
      }
      list.appendChild(chip);
    });
  }

  function commit() {
    if (isLocalEntry(entry.id)) setRelationships(entry.id, relationships);
    if (onChange) onChange(relationships);
    renderChips();
  }

  if (editable) {
    const form = document.createElement('div');
    form.className = 'rel-form';

    const kind = document.createElement('select');
    kind.className = 'writer__select';
    kind.setAttribute('aria-label', 'Relationship kind');
    kind.innerHTML = KINDS.map((k) => `<option>${k}</option>`).join('');

    const target = document.createElement('select');
    target.className = 'writer__select';
    target.setAttribute('aria-label', 'Relationship target');
    target.hidden = true;

    const text = document.createElement('input');
    text.className = 'writer__input';
    text.placeholder = 'Name the connection…';
    text.setAttribute('aria-label', 'Relationship name');

    async function refreshTargets() {
      const k = kind.value;
      if (k === 'Book' || k === 'Entry') {
        const items = k === 'Book' ? await getBooks() : await getEntries();
        target.innerHTML = items
          .filter((i) => i.id !== entry.id)
          .map((i) => `<option value="${i.id}">${i.title}</option>`)
          .join('');
        target.hidden = false;
        text.hidden = true;
      } else {
        target.hidden = true;
        text.hidden = false;
      }
    }
    kind.addEventListener('change', refreshTargets);
    refreshTargets();

    const add = document.createElement('button');
    add.className = 'btn btn--ghost';
    add.textContent = 'Connect';
    add.addEventListener('click', () => {
      const k = kind.value;
      if (k === 'Book' || k === 'Entry') {
        if (!target.value) return;
        relationships.push({
          kind: k,
          targetId: target.value,
          label: target.options[target.selectedIndex].textContent,
        });
      } else {
        const label = text.value.trim();
        if (!label) return;
        relationships.push({ kind: k, targetId: null, label });
        text.value = '';
      }
      commit();
    });

    form.append(kind, target, text, add);
    el.appendChild(form);
  }

  renderChips();
  return { el, get: () => relationships };
}
