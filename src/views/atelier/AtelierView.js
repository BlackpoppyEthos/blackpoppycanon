// Black Poppy Canon — the Atelier (Sprint 4.6 · APP-006)
// The creative workspace of the Canon. Worktables, not folders.
// The Canon stores truth; the Atelier creates it. Nothing here is
// permanent until intentionally promoted.

import * as wt from '../../services/WorktableService.js';
import * as canonData from '../../services/canon-data.js';
import { Breadcrumbs } from '../../components/breadcrumbs.js';
import { Toolbar } from './Toolbar.js';
import { Worktable } from './Worktable.js';
import { Inspector } from './Inspector.js';
import { StatusBar } from './StatusBar.js';
import { TemplatePicker } from './TemplatePicker.js';

const AUTOSAVE_MS = 10000;

export function AtelierView() {
  const view = document.createElement('div');
  view.className = 'atelier';

  let table = null;
  let selectedId = null;
  let connectFrom = null; // id of first object picked in connect mode
  let connecting = false;
  let dirty = false;
  let entries = [];
  let symbols = [];

  const crumbs = document.createElement('div');
  view.appendChild(crumbs);

  const statusBar = StatusBar();

  const picker = TemplatePicker({
    async onCreate({ name, template }) {
      table = await wt.createWorktable({ name, template });
      await refreshSwitcher();
      paintAll();
      statusBar.say(`“${name}” laid out from ${template}.`);
    },
  });

  const inspector = Inspector({
    async onPatch(obj, patch, repaintTable = false) {
      await wt.updateObject(table, obj.id, patch);
      if (repaintTable || 'title' in patch || 'status' in patch || 'content' in patch || 'favorite' in patch) paintTable();
      inspector.paint(table.objects.find((o) => o.id === obj.id));
      statusBar.paint(table);
    },
    async onPromote(obj) {
      const entry = await wt.promoteToCanon(table, obj.id);
      paintTable();
      inspector.paint(table.objects.find((o) => o.id === obj.id));
      statusBar.say(`“${obj.title}” is Canon now — ${entry.id}, shelved in the Atelier Book.`);
    },
    async onRemove(obj) {
      await wt.removeObject(table, obj.id);
      selectedId = null;
      inspector.paintEmpty();
      paintTable();
      statusBar.paint(table);
      statusBar.say('Removed from the table. What was promoted stays in the Canon.');
    },
    async onDuplicate(obj) {
      const copy = await wt.duplicateObject(table, obj.id);
      paintTable();
      selectObject(copy.id);
    },
  });

  const surface = Worktable({
    symbols: [],
    onSelect: (id) => {
      if (connecting) return pickForConnect(id);
      selectObject(id);
    },
    onMove: async (obj, settled) => {
      if (settled) { await wt.updateObject(table, obj.id, { x: obj.x, y: obj.y, w: obj.w, h: obj.h }); }
    },
    onEditContent: (obj, value) => {
      obj.content = value;
      obj.updated = new Date().toISOString();
      dirty = true;
      statusBar.say('unsaved changes');
    },
    onKeyCommand: async (cmd, id) => {
      if (cmd === 'remove') {
        await wt.removeObject(table, id);
        if (selectedId === id) { selectedId = null; inspector.paintEmpty(); }
        paintTable();
        statusBar.paint(table);
      }
    },
  });

  const toolbar = Toolbar({
    actions: {
      newTable: () => picker.open(),
      switchTable: async (id) => {
        await flush();
        table = await wt.getWorktable(id);
        selectedId = null;
        inspector.paintEmpty();
        paintAll();
      },
      addSticky: () => place({ type: 'sticky' }),
      addNote: () => place({ type: 'note' }),
      addSwatch: () => place({ type: 'swatch', content: '#8B7A9E' }),
      addChecklist: () => place({ type: 'checklist', content: '[ ] First thing' }),
      addUrl: () => place({ type: 'url', content: 'https://' }),
      importImage: () => toolbar.fileInput.click(),
      addEntry: async () => {
        const choice = await choose('Place a Canon entry', entries.map((e) => ({ value: e.id, label: e.title })));
        if (!choice) return;
        const entry = entries.find((e) => e.id === choice);
        place({ type: 'entry', title: entry.title, refId: entry.id });
      },
      addSymbol: async () => {
        const choice = await choose('Place a symbol', symbols.map((s) => ({ value: s.id, label: `${s.glyph} ${s.name}` })));
        if (!choice) return;
        const sym = symbols.find((s) => s.id === choice);
        place({ type: 'symbol', title: sym.name, refId: sym.id });
      },
      connect: () => {
        connecting = !connecting;
        connectFrom = null;
        toolbar.setConnectActive(connecting);
        statusBar.say(connecting ? 'Connect: choose the first object…' : '');
      },
      save: () => flush(true),
      promote: async () => {
        if (!selectedId) { statusBar.say('Select an object to promote.'); return; }
        const obj = table.objects.find((o) => o.id === selectedId);
        const entry = await wt.promoteToCanon(table, obj.id);
        paintTable();
        inspector.paint(obj);
        statusBar.say(`“${obj.title}” is Canon now — ${entry.id}.`);
      },
      filter: () => paintTable(),
    },
  });

  toolbar.fileInput.addEventListener('change', () => {
    const f = toolbar.fileInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      place({ type: 'image', title: f.name.replace(/\.[a-z0-9]+$/i, ''), content: reader.result });
      statusBar.say(f.size > 400000
        ? 'Image placed. Large images fill local storage quickly — the Root System will carry them properly.'
        : 'Image placed.');
    };
    reader.readAsDataURL(f);
    toolbar.fileInput.value = '';
  });

  const emptyEl = document.createElement('section');
  emptyEl.className = 'empty atelier-empty';
  emptyEl.hidden = true;
  emptyEl.innerHTML = `
    <h2>The drafting table is bare.</h2>
    <p>Every idea the Canon will ever hold starts on a Worktable. Lay the first one.</p>`;
  const beginBtn = document.createElement('button');
  beginBtn.type = 'button';
  beginBtn.className = 'btn';
  beginBtn.textContent = 'Begin a Worktable →';
  beginBtn.addEventListener('click', () => picker.open());
  emptyEl.appendChild(beginBtn);

  const main = document.createElement('div');
  main.className = 'atelier-main';
  main.append(emptyEl, surface.el, inspector.el);

  view.append(toolbar.el, main, statusBar.el);
  view.appendChild(picker.el);

  boot();

  /* ---- autosave: every ten seconds, quietly ---- */
  const autosave = setInterval(async () => {
    if (!view.isConnected) { clearInterval(autosave); return; }
    await flush();
  }, AUTOSAVE_MS);

  return view;

  /* ================================================================ */

  async function boot() {
    [entries, symbols] = await Promise.all([canonData.listEntries(), canonData.listSymbols()]);
    const tables = await wt.listWorktables();
    table = tables[0] || null;
    await refreshSwitcher();
    paintAll();
  }

  async function refreshSwitcher() {
    toolbar.paintSwitcher(await wt.listWorktables(), table?.id);
  }

  function paintAll() {
    crumbs.innerHTML = '';
    crumbs.appendChild(Breadcrumbs([
      { label: 'Dashboard', href: '#/' },
      { label: 'Atelier' },
      ...(table ? [{ label: table.name }] : []),
    ]));

    const bare = !table;
    emptyEl.hidden = !bare;
    surface.el.hidden = bare;
    inspector.el.hidden = bare;
    if (bare) { statusBar.paint(null); return; }
    paintTable();
    statusBar.paint(table);
  }

  function currentFilter() {
    const q = toolbar.search.value.trim().toLowerCase();
    const t = toolbar.typeFilter.value;
    const s = toolbar.statusFilter.value;
    if (!q && !t && !s) return null;
    return (obj) =>
      (!q || (obj.title + ' ' + obj.content + ' ' + (obj.tags || []).join(' ')).toLowerCase().includes(q)) &&
      (!t || obj.type === t) &&
      (!s || obj.status === s);
  }

  function paintTable() {
    surface.paint(table, { selectedId, filterFn: currentFilter(), symbols });
  }

  function selectObject(id) {
    selectedId = id;
    surface.markSelected(id);
    const obj = table.objects.find((o) => o.id === id);
    if (obj) inspector.paint(obj);
  }

  async function pickForConnect(id) {
    if (!connectFrom) {
      connectFrom = id;
      statusBar.say('Connect: now choose the second object…');
      return;
    }
    // pointerdown and focus both land here — same object is a no-op.
    if (connectFrom === id) return;
    await wt.connectObjects(table, connectFrom, id);
    statusBar.say('Connected. The line is a real relationship in the Canon.');
    connectFrom = null;
    connecting = false;
    toolbar.setConnectActive(false);
    paintTable();
  }

  async function flush(announce = false) {
    if (!table) return;
    if (dirty) {
      await wt.saveWorktable(table);
      dirty = false;
      statusBar.say(`kept · ${new Date().toLocaleTimeString()}`);
    } else if (announce) {
      await wt.saveWorktable(table);
      statusBar.say(`saved · ${new Date().toLocaleTimeString()}`);
    }
  }

  // A new object lands in open space — never on top of another idea.
  function findFreeSpot(w = 300, h = 240) {
    for (let y = 40; y < 1200; y += 60) {
      for (let x = 40; x < 1900; x += 60) {
        const clash = table.objects.some((o) =>
          x < o.x + o.w + 24 && x + w > o.x - 24 &&
          y < o.y + o.h + 24 && y + h > o.y - 24);
        if (!clash) return { x, y };
      }
    }
    return { x: 60 + Math.random() * 400, y: 60 + Math.random() * 300 };
  }

  async function place(partial) {
    if (!table) { picker.open(); return; }
    const spot = findFreeSpot();
    const obj = await wt.addObject(table, { ...partial, ...spot });
    paintTable();
    statusBar.paint(table);
    selectObject(obj.id);
    surface.focusObject(obj.id);
  }

  // A quiet chooser dialog for entries and symbols.
  function choose(title, options) {
    return new Promise((resolve) => {
      const dialog = document.createElement('dialog');
      dialog.className = 'rel-modal';
      dialog.setAttribute('aria-label', title);
      dialog.innerHTML = `
        <form method="dialog" class="rel-modal__form">
          <h3 class="rel-modal__title">${title}</h3>
          <select class="entry-input" aria-label="${title}"></select>
          <div class="rel-modal__actions">
            <button type="button" class="btn btn--ghost" data-cancel>Cancel</button>
            <button type="submit" class="btn">Place</button>
          </div>
        </form>`;
      const select = dialog.querySelector('select');
      options.forEach(({ value, label }) => {
        const o = document.createElement('option');
        o.value = value; o.textContent = label;
        select.appendChild(o);
      });
      dialog.querySelector('[data-cancel]').addEventListener('click', () => { dialog.close(); });
      dialog.addEventListener('close', () => { dialog.remove(); resolve(null); });
      dialog.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = select.value;
        dialog.addEventListener('close', () => resolve(v), { once: true });
        dialog.remove();
        resolve(v);
      });
      document.body.appendChild(dialog);
      dialog.showModal();
      select.focus();
    });
  }
}
