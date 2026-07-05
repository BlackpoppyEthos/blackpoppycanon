// Black Poppy Canon — VersionHistory
// Every explicit save creates a version. Nothing is deleted.
// Restoring an old version writes a NEW version — the record only grows.

import { renderMarkdown } from '../../services/markdown.js';

const stamp = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function VersionHistory({ entry, onRestore }) {
  const el = document.createElement('details');
  el.className = 'card entry-panel entry-panel--versions';
  el.open = false;

  const summary = document.createElement('summary');
  summary.className = 'entry-panel__summary';
  summary.textContent = `Versions (${(entry.versions || []).length})`;
  el.appendChild(summary);

  const timeline = document.createElement('div');
  timeline.className = 'entry-timeline';

  // Timeline header: created / updated at a glance
  const meta = document.createElement('p');
  meta.className = 'panel__meta panel__meta--block';
  meta.textContent = `Created ${stamp(entry.created)} · Updated ${stamp(entry.updated)}`;
  timeline.appendChild(meta);

  const versions = [...(entry.versions || [])].sort((a, b) => b.version - a.version);

  if (!versions.length) {
    const p = document.createElement('p');
    p.className = 'panel__empty';
    p.textContent = 'No versions yet. The first explicit save begins the record.';
    timeline.appendChild(p);
  }

  const viewer = document.createElement('div');
  viewer.className = 'entry-version-viewer';
  viewer.hidden = true;

  versions.forEach((v) => {
    const row = document.createElement('div');
    row.className = 'entry-version';

    const badge = document.createElement('span');
    badge.className = 'chip chip--version';
    badge.textContent = `v${v.version}`;

    const info = document.createElement('span');
    info.className = 'entry-version__info';
    info.innerHTML = '';
    const strong = document.createElement('strong');
    strong.textContent = v.summary || 'Saved.';
    const small = document.createElement('span');
    small.className = 'panel__meta';
    small.textContent = ` ${stamp(v.timestamp)} · ${v.author || ''}`;
    info.append(strong, small);

    row.append(badge, info);

    if (typeof v.body === 'string') {
      const view = document.createElement('button');
      view.type = 'button';
      view.className = 'btn btn--ghost entry-version__btn';
      view.textContent = 'View';
      view.addEventListener('click', () => {
        viewer.hidden = false;
        viewer.innerHTML = '';
        const label = document.createElement('p');
        label.className = 'panel__meta panel__meta--block';
        label.textContent = `Reading v${v.version} — ${stamp(v.timestamp)}`;
        const page = document.createElement('div');
        page.className = 'prose';
        page.innerHTML = renderMarkdown(v.body);
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'btn btn--ghost';
        close.textContent = 'Close';
        close.addEventListener('click', () => { viewer.hidden = true; });
        viewer.append(label, page, close);
        viewer.scrollIntoView({ block: 'nearest' });
      });

      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'btn btn--ghost entry-version__btn';
      restore.textContent = 'Restore';
      restore.addEventListener('click', () => onRestore(v));

      row.append(view, restore);
    }

    timeline.appendChild(row);
  });

  timeline.appendChild(viewer);
  el.appendChild(timeline);
  return el;
}
