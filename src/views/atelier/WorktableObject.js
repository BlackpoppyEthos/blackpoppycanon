// Black Poppy Canon — a single object on the worktable (APP-006)
// Sticky notes, markdown notes, images, symbols, entries, swatches,
// links, checklists. Every object moves, resizes, duplicates,
// connects — and wears its Canon Presence badge, always.

import { presenceBadge } from '../../services/WorktableService.js';
import { renderMarkdown } from '../../services/markdown.js';

const INTERACTIVE = 'textarea, input, a, button, select, label';

export function WorktableObject({ obj, symbols, onSelect, onMove, onResize, onEditContent, onKeyCommand }) {
  const el = document.createElement('div');
  el.className = `wt-object wt-object--${obj.type}`;
  el.dataset.id = obj.id;
  el.tabIndex = 0;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', `${obj.title}, ${obj.type}, status ${obj.status}`);
  paintGeometry();

  /* ---- title bar: grab surface + presence ---- */
  const bar = document.createElement('div');
  bar.className = 'wt-object__bar';

  const presence = document.createElement('span');
  presence.className = 'wt-object__presence';
  presence.title = `Status: ${obj.status}`;
  presence.textContent = presenceBadge(obj.status);

  const title = document.createElement('span');
  title.className = 'wt-object__title';
  title.textContent = obj.title;

  const fav = document.createElement('span');
  fav.className = 'wt-object__fav';
  fav.textContent = obj.favorite ? '♥' : '';

  bar.append(presence, title, fav);
  el.appendChild(bar);

  /* ---- body, by type ---- */
  const body = document.createElement('div');
  body.className = 'wt-object__body';
  el.appendChild(body);
  paintBody();

  /* ---- resize handle ---- */
  const grip = document.createElement('div');
  grip.className = 'wt-object__grip';
  grip.setAttribute('aria-hidden', 'true');
  el.appendChild(grip);

  /* ---- selection ---- */
  el.addEventListener('focus', () => onSelect(obj.id));
  el.addEventListener('pointerdown', () => onSelect(obj.id));

  /* ---- drag & resize: window-tracked so fast pointers never escape ---- */
  let drag = null;
  let resize = null;

  function trackPointer(e) {
    try { el.setPointerCapture(e.pointerId); } catch { /* synthetic pointers */ }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  function onPointerMove(e) {
    if (drag) {
      obj.x = Math.max(0, drag.ox + e.clientX - drag.sx);
      obj.y = Math.max(0, drag.oy + e.clientY - drag.sy);
      paintGeometry();
      onMove(obj, false);
    } else if (resize) {
      obj.w = Math.max(120, resize.ow + e.clientX - resize.sx);
      obj.h = Math.max(70, resize.oh + e.clientY - resize.sy);
      paintGeometry();
      onMove(obj, false);
    }
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    if (drag) { drag = null; onMove(obj, true); }
    if (resize) { resize = null; onResize(obj); }
  }

  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest(INTERACTIVE) || e.target === grip) return;
    drag = { sx: e.clientX, sy: e.clientY, ox: obj.x, oy: obj.y };
    trackPointer(e);
  });

  grip.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    resize = { sx: e.clientX, sy: e.clientY, ow: obj.w, oh: obj.h };
    trackPointer(e);
  });

  /* ---- keyboard: arrows move, Delete removes ---- */
  el.addEventListener('keydown', (e) => {
    if (e.target !== el) return; // typing inside a note is typing
    const step = e.shiftKey ? 32 : 8;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      obj.x = Math.max(0, obj.x + moves[e.key][0]);
      obj.y = Math.max(0, obj.y + moves[e.key][1]);
      paintGeometry();
      onMove(obj, true);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onKeyCommand('remove', obj.id);
    }
  });

  return el;

  function paintGeometry() {
    el.style.left = obj.x + 'px';
    el.style.top = obj.y + 'px';
    el.style.width = obj.w + 'px';
    el.style.height = obj.h + 'px';
  }

  function paintBody() {
    body.innerHTML = '';

    if (obj.type === 'sticky') {
      const ta = document.createElement('textarea');
      ta.className = 'wt-sticky__text';
      ta.value = obj.content;
      ta.placeholder = 'Write…';
      ta.setAttribute('aria-label', `${obj.title} text`);
      ta.addEventListener('input', () => onEditContent(obj, ta.value));
      body.appendChild(ta);

    } else if (obj.type === 'note') {
      const prose = document.createElement('div');
      prose.className = 'prose wt-note__prose';
      prose.innerHTML = renderMarkdown(obj.content) ||
        '<p class="panel__empty">Markdown note — write in the Inspector.</p>';
      body.appendChild(prose);

    } else if (obj.type === 'image') {
      if (obj.content) {
        const img = document.createElement('img');
        img.className = 'wt-image__img';
        img.alt = obj.title;
        img.src = obj.content;
        body.appendChild(img);
      } else {
        body.innerHTML = '<p class="panel__empty">No image yet.</p>';
      }

    } else if (obj.type === 'symbol') {
      const sym = symbols.find((s) => s.id === obj.refId);
      body.innerHTML = `
        <span class="wt-symbol__glyph" aria-hidden="true">${sym ? sym.glyph : '✶'}</span>
        <a class="wt-symbol__name" href="#/symbol/${obj.refId || ''}">${sym ? sym.name : obj.title}</a>`;

    } else if (obj.type === 'entry') {
      body.innerHTML = obj.refId
        ? `<a class="wt-entry__link" href="#/entry/${obj.refId}">Open in the Canon →</a>`
        : '<p class="panel__empty">Not yet in the Canon.</p>';

    } else if (obj.type === 'swatch') {
      const chipEl = document.createElement('div');
      chipEl.className = 'wt-swatch__chip';
      chipEl.style.background = obj.content || '#C6C2CC';
      const hex = document.createElement('span');
      hex.className = 'wt-swatch__hex';
      hex.textContent = obj.content || '';
      body.append(chipEl, hex);

    } else if (obj.type === 'url') {
      const a = document.createElement('a');
      a.className = 'wt-url__link';
      a.href = /^https?:/.test(obj.content) ? obj.content : '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = obj.content || 'https://…';
      body.appendChild(a);

    } else if (obj.type === 'checklist') {
      const list = document.createElement('div');
      list.className = 'wt-checklist';
      obj.content.split('\n').filter((l) => l.trim()).forEach((line, i) => {
        const done = /^\[x\]/i.test(line.trim());
        const label = document.createElement('label');
        label.className = 'wt-checklist__item' + (done ? ' is-done' : '');
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = done;
        box.addEventListener('change', () => {
          const lines = obj.content.split('\n');
          const idx = lines.filter((l) => l.trim()).indexOf(line);
          const real = lines.findIndex((l, n) => l === line && lines.slice(0, n).filter((x) => x.trim()).length === idx);
          lines[real >= 0 ? real : i] = (box.checked ? '[x] ' : '[ ] ') + line.replace(/^\[( |x)\]\s*/i, '');
          onEditContent(obj, lines.join('\n'));
          paintBody();
        });
        const text = document.createElement('span');
        text.textContent = line.replace(/^\[( |x)\]\s*/i, '');
        label.append(box, text);
        list.appendChild(label);
      });
      if (!list.children.length) list.innerHTML = '<p class="panel__empty">Add items in the Inspector — one per line.</p>';
      body.appendChild(list);
    }
  }
}
