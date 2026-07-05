// Black Poppy Canon — symbolic icon set
// Inline SVG. Hand-drawn simplicity, stroke-based, currentColor.
// Symbols are a language, not decoration.

const svg = (paths, viewBox = '0 0 24 24') =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const icons = {
  // The Black Poppy — dashboard / home
  poppy: svg(`
    <circle cx="12" cy="9" r="2.4" fill="currentColor" stroke="none"/>
    <path d="M12 6.6C10.8 4.6 8.4 4.2 7 5.6c-1.5 1.5-.9 4 1.2 4.8M12 6.6c1.2-2 3.6-2.4 5-1 1.5 1.5.9 4-1.2 4.8M8.2 10.4c-2.2.5-3.2 2.8-2.2 4.6 1 1.8 3.5 2 4.9.5M15.8 10.4c2.2.5 3.2 2.8 2.2 4.6-1 1.8-3.5 2-4.9.5M12 11.4V21M12 16c1.6-1 3-1 3-1"/>
  `),
  // Books — library
  book: svg(`
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/>
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/>
    <path d="M9 7.5h7"/>
  `),
  // Atelier — the making place
  atelier: svg(`
    <path d="M12 3l2 4.5L12 12l-2-4.5z"/>
    <path d="M12 12v9M8 21h8"/>
    <path d="M5.5 8.5l2.2 1.3M18.5 8.5l-2.2 1.3"/>
  `),
  // Search
  search: svg(`
    <circle cx="10.5" cy="10.5" r="6"/>
    <path d="M15 15l5.5 5.5"/>
  `),
  // Settings — a small compass, not a gear
  settings: svg(`
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M15 9l-1.8 4.2L9 15l1.8-4.2z"/>
  `),
  // Triple moon — theme / night
  moon: svg(`
    <path d="M15.5 4a8 8 0 1 0 4.5 12A8.5 8.5 0 0 1 15.5 4z"/>
  `),
  sun: svg(`
    <circle cx="12" cy="12" r="4.5"/>
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12h2.5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19"/>
  `),
  menu: svg(`<path d="M4 7h16M4 12h16M4 17h16"/>`),
  // Star — for empty states
  star: svg(`
    <path d="M12 3l2.2 5.6 6 .4-4.6 3.9 1.5 5.8L12 15.5l-5.1 3.2 1.5-5.8L3.8 9l6-.4z"/>
  `),
  // Paw print
  paw: svg(`
    <ellipse cx="12" cy="15.5" rx="4" ry="3.2"/>
    <circle cx="7" cy="10.5" r="1.6"/>
    <circle cx="10.4" cy="7.8" r="1.6"/>
    <circle cx="13.6" cy="7.8" r="1.6"/>
    <circle cx="17" cy="10.5" r="1.6"/>
  `),
};

export function icon(name, className = '') {
  const span = document.createElement('span');
  span.className = className;
  span.innerHTML = icons[name] || icons.star;
  span.firstElementChild.classList.add(...(className ? [] : []));
  const el = span.firstElementChild;
  if (className) el.setAttribute('class', className);
  return el;
}
