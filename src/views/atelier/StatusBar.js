// Black Poppy Canon — Atelier status bar (APP-006)
// Quiet facts at the foot of the table: counts, save state, guidance.

export function StatusBar() {
  const el = document.createElement('div');
  el.className = 'atelier-statusbar';

  const counts = document.createElement('span');
  const save = document.createElement('span');
  save.className = 'atelier-statusbar__save';
  save.setAttribute('aria-live', 'polite');
  const hint = document.createElement('span');
  hint.className = 'atelier-statusbar__hint';
  hint.textContent = 'Arrows move a selected object · Shift for larger steps · Delete removes';

  el.append(counts, save, hint);

  return {
    el,
    paint(table) {
      const n = table ? table.objects.length : 0;
      const c = table ? (table.connections || []).length : 0;
      counts.textContent = table
        ? `${table.name} · ${n} object${n === 1 ? '' : 's'} · ${c} connection${c === 1 ? '' : 's'}`
        : '';
    },
    say(text) {
      save.textContent = text;
    },
  };
}
