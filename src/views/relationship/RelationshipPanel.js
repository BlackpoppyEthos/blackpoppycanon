// Black Poppy Canon — RelationshipPanel (Sprint 4.5)
// Every Entry shows its place in the ecosystem: incoming and
// outgoing connections, counts, and what kinds of things it
// touches. Users never think in folders — they think in
// relationships.

import { listForEntry } from '../../services/RelationshipService.js';
import { RelationshipCard, resolveObject } from './RelationshipCard.js';
import { RelationshipModal } from './RelationshipModal.js';

export function RelationshipPanel({ entry, entries, books, symbols = [] }) {
  const el = document.createElement('details');
  el.className = 'card entry-panel entry-panel--relationships';
  el.id = 'relationship-panel';
  el.open = true;

  const summary = document.createElement('summary');
  summary.className = 'entry-panel__summary';
  summary.textContent = 'Relationships';
  el.appendChild(summary);

  const body = document.createElement('div');
  el.appendChild(body);

  const modal = RelationshipModal({
    entry, entries, books, symbols,
    onCreated: paint,
  });

  paint();

  return {
    el,
    openConnect() {
      el.open = true;
      el.scrollIntoView({ block: 'nearest' });
      modal.open();
    },
    repaint: paint,
  };

  async function paint() {
    const { outgoing, incoming } = await listForEntry(entry.id);
    const total = outgoing.length + incoming.length;

    body.innerHTML = '';

    /* ---- count line ---- */
    const counts = document.createElement('p');
    counts.className = 'panel__meta panel__meta--block rel-counts';
    counts.textContent = total
      ? `${total} connection${total === 1 ? '' : 's'} · ${outgoing.length} outgoing · ${incoming.length} incoming`
      : 'This entry stands alone for now.';
    body.appendChild(counts);

    /* ---- related kinds summary ---- */
    if (total) {
      const kinds = { book: 0, symbol: 0, project: 0, component: 0 };
      [...outgoing, ...incoming].forEach((rel) => {
        const otherId = rel.source === entry.id ? rel.target : rel.source;
        const obj = resolveObject(otherId, { entries, books, symbols });
        if (obj.kind === 'book' || rel.type === 'Belongs To') kinds.book++;
        if (rel.type === 'Symbol') kinds.symbol++;
        if (rel.type === 'Project') kinds.project++;
        if (rel.type === 'Visual Component') kinds.component++;
      });
      const labels = { book: 'Books', symbol: 'Symbols', project: 'Projects', component: 'Components' };
      const line = Object.entries(kinds)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${n} ${labels[k]}`)
        .join(' · ');
      if (line) {
        const related = document.createElement('p');
        related.className = 'panel__meta panel__meta--block';
        related.textContent = `Touches: ${line}`;
        body.appendChild(related);
      }
    }

    /* ---- outgoing ---- */
    if (outgoing.length) {
      body.appendChild(groupHeading('Outgoing'));
      const list = document.createElement('div');
      list.className = 'rel-card-list';
      outgoing.forEach((rel) =>
        list.appendChild(RelationshipCard({ rel, direction: 'out', entries, books, symbols })));
      body.appendChild(list);
    }

    /* ---- incoming ---- */
    if (incoming.length) {
      body.appendChild(groupHeading('Incoming'));
      const list = document.createElement('div');
      list.className = 'rel-card-list';
      incoming.forEach((rel) =>
        list.appendChild(RelationshipCard({ rel, direction: 'in', entries, books, symbols })));
      body.appendChild(list);
    }

    if (!total) {
      const p = document.createElement('p');
      p.className = 'panel__empty';
      p.textContent = 'Every connection you draw becomes a root. Begin with one.';
      body.appendChild(p);
    }

    /* ---- connect ---- */
    const connect = document.createElement('button');
    connect.type = 'button';
    connect.className = 'btn btn--ghost panel__action';
    connect.textContent = 'Connect →';
    connect.addEventListener('click', () => modal.open());
    body.appendChild(connect);
  }

  function groupHeading(text) {
    const h = document.createElement('h4');
    h.className = 'rel-group-heading eyebrow';
    h.textContent = text;
    return h;
  }
}
