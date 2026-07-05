// Black Poppy Canon — RelationshipBadge
// A small, readable chip naming the kind of connection.
// Colors are the quiet ones the spec assigns — never neon.

import { typeColor } from '../../services/RelationshipService.js';

export function RelationshipBadge(type, direction = '') {
  const el = document.createElement('span');
  el.className = `rel-badge rel-badge--${typeColor(type)}`;
  const arrow = direction === 'in' ? '← ' : direction === 'out' ? '→ ' : '';
  el.textContent = `${arrow}${type}`;
  if (direction) {
    el.setAttribute(
      'aria-label',
      `${type}, ${direction === 'in' ? 'incoming' : 'outgoing'} relationship`
    );
  }
  return el;
}
