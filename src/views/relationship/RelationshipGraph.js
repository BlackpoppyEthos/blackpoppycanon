// Black Poppy Canon — RelationshipGraph (Version 1)
// A simple node graph: the current entry at center, its one-degree
// connections arranged around it. Thin charcoal connector lines,
// serif labels, calm and organic — no neon, no technical diagrams.
// Keyboard reachable, with a list alternative for screen readers.

import { neighbors, typeColor } from '../../services/RelationshipService.js';
import { resolveObject } from './RelationshipCard.js';

const NODE_COLORS = {
  stone: 'var(--bp-slate)',
  finch: 'var(--bp-finch)',
  dusty: 'var(--bp-dusty-purple)',
  pink: 'var(--bp-hot-pink)',
  slate: 'var(--bp-slate)',
  lavender: 'var(--bp-soft-lavender)',
};

const trim = (s, n = 20) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export function RelationshipGraph({ entry, entries, books, symbols = [] }) {
  const el = document.createElement('details');
  el.className = 'card entry-panel rel-graph';

  const summary = document.createElement('summary');
  summary.className = 'entry-panel__summary';
  summary.textContent = 'Graph';
  el.appendChild(summary);

  const body = document.createElement('div');
  body.className = 'rel-graph__body';
  el.appendChild(body);

  // Lazy: the graph is only drawn the first time it is opened.
  let drawn = false;
  el.addEventListener('toggle', () => {
    if (el.open && !drawn) {
      drawn = true;
      draw();
    }
  });

  return { el, redraw: () => { drawn = false; if (el.open) { drawn = true; draw(); } } };

  async function draw() {
    body.innerHTML = '';
    const links = await neighbors(entry.id);

    if (!links.length) {
      const p = document.createElement('p');
      p.className = 'panel__empty';
      p.textContent = 'No connections drawn yet. The first one turns this page into a constellation.';
      body.appendChild(p);
      return;
    }

    const W = 640, H = Math.max(340, 120 + links.length * 26);
    const cx = W / 2, cy = H / 2;
    // Room to breathe: even a small constellation deserves open sky.
    const radius = Math.max(125, Math.min(W, H) / 2 - 70);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'rel-graph__svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label',
      `Connections of ${entry.title}: ${links.length}. A list alternative follows.`);

    const ns = (tag) => document.createElementNS('http://www.w3.org/2000/svg', tag);

    // Connector lines first, beneath the nodes.
    links.forEach((link, i) => {
      const angle = (2 * Math.PI * i) / links.length - Math.PI / 2;
      link._x = cx + radius * Math.cos(angle);
      link._y = cy + radius * Math.sin(angle);
      const line = ns('line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', link._x); line.setAttribute('y2', link._y);
      line.setAttribute('class', 'rel-graph__line');
      svg.appendChild(line);

      // The relationship type rests along the line, quietly.
      const label = ns('text');
      label.setAttribute('x', (cx + link._x) / 2);
      label.setAttribute('y', (cy + link._y) / 2 - 5);
      label.setAttribute('class', 'rel-graph__edge-label');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = link.rel.type;
      svg.appendChild(label);
    });

    // Center node: the current entry.
    const center = ns('g');
    center.setAttribute('class', 'rel-graph__node rel-graph__node--center');
    const cDot = ns('circle');
    cDot.setAttribute('cx', cx); cDot.setAttribute('cy', cy); cDot.setAttribute('r', 9);
    const cLabel = ns('text');
    cLabel.setAttribute('x', cx); cLabel.setAttribute('y', cy - 20);
    cLabel.setAttribute('text-anchor', 'middle');
    cLabel.textContent = trim(entry.title, 28);
    center.append(cDot, cLabel);
    svg.appendChild(center);

    // Connected objects.
    links.forEach((link) => {
      const obj = resolveObject(link.id, { entries, books, symbols });
      const g = ns('g');
      g.setAttribute('class', 'rel-graph__node');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', obj.href ? 'link' : 'img');
      g.setAttribute('aria-label',
        `${obj.title}, ${link.rel.type}, ${link.direction === 'in' ? 'incoming' : 'outgoing'}`);

      const dot = ns('circle');
      dot.setAttribute('cx', link._x); dot.setAttribute('cy', link._y); dot.setAttribute('r', 6);
      dot.setAttribute('fill', NODE_COLORS[typeColor(link.rel.type)]);

      const label = ns('text');
      label.setAttribute('x', link._x);
      label.setAttribute('y', link._y + 22);
      label.setAttribute('text-anchor', 'middle');
      label.textContent = trim(obj.title);

      g.append(dot, label);

      if (obj.href) {
        const go = () => { window.location.hash = obj.href.slice(1); };
        g.addEventListener('click', go);
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      }

      svg.appendChild(g);
    });

    body.appendChild(svg);

    // The list alternative — same knowledge, no picture required.
    const alt = document.createElement('ul');
    alt.className = 'panel__list rel-graph__alt';
    alt.setAttribute('aria-label', 'Connections as a list');
    links.forEach((link) => {
      const obj = resolveObject(link.id, { entries, books, symbols });
      const li = document.createElement('li');
      if (obj.href) {
        const a = document.createElement('a');
        a.href = obj.href;
        a.textContent = obj.title;
        li.appendChild(a);
      } else {
        li.textContent = obj.title;
      }
      const meta = document.createElement('span');
      meta.className = 'panel__meta';
      meta.textContent = `${link.direction === 'in' ? '←' : '→'} ${link.rel.type}`;
      li.appendChild(meta);
      alt.appendChild(li);
    });
    body.appendChild(alt);
  }
}
