// Black Poppy Canon — card & empty-state components
import { icon } from './icons.js';

export function Card({ title, meta, body, href }) {
  const el = document.createElement(href ? 'a' : 'article');
  el.className = 'card' + (href ? ' card--link' : '');
  if (href) el.href = href;

  if (title) {
    const h = document.createElement('h3');
    h.className = 'card__title';
    h.textContent = title;
    el.appendChild(h);
  }
  if (body) {
    const p = document.createElement('p');
    p.textContent = body;
    p.style.marginBottom = meta ? 'var(--space-3)' : '0';
    el.appendChild(p);
  }
  if (meta) {
    const m = document.createElement('p');
    m.className = 'card__meta';
    m.style.margin = '0';
    m.textContent = meta;
    el.appendChild(m);
  }
  return el;
}

export function EmptyState({ symbol = 'star', title, body }) {
  const el = document.createElement('section');
  el.className = 'empty';

  el.appendChild(icon(symbol, 'empty__symbol'));

  const h = document.createElement('h2');
  h.textContent = title;

  const p = document.createElement('p');
  p.textContent = body;

  el.append(h, p);
  return el;
}
