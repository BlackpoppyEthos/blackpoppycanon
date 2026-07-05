// Black Poppy Canon — Atelier toolbar (APP-006)
// The tools of the table: new worktable, notes, images, canon
// objects, connections, save, promote, search.

export function Toolbar({ actions }) {
  const el = document.createElement('div');
  el.className = 'atelier-toolbar';
  el.setAttribute('role', 'toolbar');
  el.setAttribute('aria-label', 'Atelier tools');

  const btn = (label, action, { primary = false, title = '' } = {}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = primary ? 'btn atelier-tool' : 'btn btn--ghost atelier-tool';
    b.textContent = label;
    if (title) b.title = title;
    b.dataset.action = action;
    b.addEventListener('click', () => actions[action]());
    return b;
  };

  // Worktable switcher
  const switcher = document.createElement('select');
  switcher.className = 'entry-input atelier-switcher';
  switcher.setAttribute('aria-label', 'Choose worktable');
  switcher.addEventListener('change', () => actions.switchTable(switcher.value));

  el.append(
    btn('New Worktable', 'newTable', { primary: true }),
    switcher,
    sep(),
    btn('+ Note', 'addSticky', { title: 'Add sticky note' }),
    btn('+ Markdown', 'addNote'),
    btn('+ Image', 'importImage', { title: 'Import image' }),
    btn('+ Entry', 'addEntry', { title: 'Place a Canon entry' }),
    btn('+ Symbol', 'addSymbol'),
    btn('+ Swatch', 'addSwatch'),
    btn('+ Checklist', 'addChecklist'),
    btn('+ Link', 'addUrl'),
    sep(),
    btn('⇄ Connect', 'connect', { title: 'Connect two objects — the line is a real relationship' }),
    btn('Save', 'save'),
    btn('🏛 Promote', 'promote', { title: 'Promote selected object to Canon' }),
  );

  // Search + filters
  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'entry-input atelier-search';
  search.placeholder = 'Search this table…';
  search.setAttribute('aria-label', 'Search objects');
  search.addEventListener('input', () => actions.filter());

  const typeFilter = filterSelect('All types', ['sticky', 'note', 'image', 'symbol', 'entry', 'swatch', 'url', 'checklist']);
  const statusFilter = filterSelect('All statuses', ['looking-glass', 'atelier', 'canon', 'archived']);
  typeFilter.addEventListener('change', () => actions.filter());
  statusFilter.addEventListener('change', () => actions.filter());

  const spacer = document.createElement('span');
  spacer.className = 'atelier-toolbar__spacer';
  el.append(spacer, search, typeFilter, statusFilter);

  // Hidden file input for image import
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'image/*';
  file.hidden = true;
  file.setAttribute('aria-hidden', 'true');
  el.appendChild(file);

  function sep() {
    const s = document.createElement('span');
    s.className = 'atelier-toolbar__sep';
    s.setAttribute('aria-hidden', 'true');
    return s;
  }

  function filterSelect(allLabel, options) {
    const s = document.createElement('select');
    s.className = 'entry-input atelier-filter';
    s.setAttribute('aria-label', allLabel);
    const all = document.createElement('option');
    all.value = '';
    all.textContent = allLabel;
    s.appendChild(all);
    options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      s.appendChild(opt);
    });
    return s;
  }

  return {
    el, switcher, search, typeFilter, statusFilter, fileInput: file,
    paintSwitcher(tables, currentId) {
      switcher.innerHTML = '';
      tables.forEach((t) => {
        const o = document.createElement('option');
        o.value = t.id;
        o.textContent = t.name;
        if (t.id === currentId) o.selected = true;
        switcher.appendChild(o);
      });
    },
    setConnectActive(on) {
      const b = el.querySelector('[data-action="connect"]');
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    },
  };
}
