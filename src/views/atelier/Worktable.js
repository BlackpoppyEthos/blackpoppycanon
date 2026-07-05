// Black Poppy Canon — Worktable surface (APP-006)
// The drafting table itself. Objects live here; the relationship
// layer draws beneath them; the whole surface scrolls calmly.

import { WorktableObject } from './WorktableObject.js';
import { RelationshipLayer } from './RelationshipLayer.js';

export function Worktable({ onSelect, onMove, onEditContent, onKeyCommand }) {
  const scroll = document.createElement('div');
  scroll.className = 'atelier-scroll';

  const surface = document.createElement('div');
  surface.className = 'atelier-table';
  surface.setAttribute('aria-label', 'Worktable surface');
  scroll.appendChild(surface);

  const lines = RelationshipLayer();
  surface.appendChild(lines.el);

  let currentTable = null;

  return {
    el: scroll,
    paint(table, { selectedId, filterFn, symbols = [] } = {}) {
      currentTable = table;
      surface.querySelectorAll('.wt-object').forEach((n) => n.remove());
      table.objects.forEach((obj) => {
        const node = WorktableObject({
          obj, symbols,
          onSelect,
          onMove: (o, settled) => { lines.redraw(table); onMove(o, settled); },
          onResize: (o) => { lines.redraw(table); onMove(o, true); },
          onEditContent,
          onKeyCommand,
        });
        if (obj.id === selectedId) node.classList.add('is-selected');
        if (filterFn && !filterFn(obj)) node.classList.add('is-dimmed');
        surface.appendChild(node);
      });
      lines.redraw(table);
    },
    redrawLines() {
      if (currentTable) lines.redraw(currentTable);
    },
    focusObject(id) {
      const node = surface.querySelector(`.wt-object[data-id="${id}"]`);
      if (node) node.focus();
    },
    markSelected(id) {
      surface.querySelectorAll('.wt-object').forEach((n) =>
        n.classList.toggle('is-selected', n.dataset.id === id));
    },
  };
}
