// Black Poppy Canon — EntryView (Sprint 4.4 · APP-004)
// The Entry is the atomic unit of the entire system. This view is
// its reader and its writer: markdown editing with live preview,
// metadata, unlimited relationships, versions (nothing is deleted),
// autosave every ten seconds, in-entry search, and a print layout
// that reads like a journal page.

import * as canonData from '../../services/canon-data.js';
import { listForEntry } from '../../services/RelationshipService.js';
import { wordCount, readingTime } from '../../services/markdown.js';
import { recordOpened } from '../../state.js';
import { EntryEditor } from './EntryEditor.js';
import { EntryPreview } from './EntryPreview.js';
import { EntryToolbar } from './EntryToolbar.js';
import { EntryMetadata } from './EntryMetadata.js';
import { RelationshipPanel } from '../relationship/RelationshipPanel.js';
import { RelationshipGraph } from '../relationship/RelationshipGraph.js';
import { Breadcrumbs } from '../../components/breadcrumbs.js';
import { VersionHistory } from './VersionHistory.js';
import { PrintView } from './PrintView.js';

const AUTOSAVE_MS = 10000;

export function EntryView(params = {}) {
  const view = document.createElement('div');
  view.className = 'entry-view';

  const quiet = document.createElement('p');
  quiet.className = 'panel__empty';
  quiet.textContent = 'Opening the page…';
  view.appendChild(quiet);

  load();
  return view;

  async function load() {
    const [entry, books, entries, rels, symbols] = await Promise.all([
      canonData.getEntry(params.id),
      canonData.listBooks(),
      canonData.listEntries(),
      listForEntry(params.id),
      canonData.listSymbols(),
    ]);

    if (!view.isConnected && !view.parentNode) {
      // Navigated away before the page opened — nothing to do.
    }

    if (!entry) {
      view.innerHTML = '';
      const missing = document.createElement('section');
      missing.className = 'empty';
      missing.innerHTML = `
        <h2>This page is not yet written.</h2>
        <p>No entry answers to “${params.id || ''}”. The Library holds every page that exists.</p>
        <p><a class="btn btn--ghost" href="#/library">Return to the Library</a></p>`;
      view.appendChild(missing);
      return;
    }

    mount(structuredClone(entry), books, entries, rels.outgoing.length + rels.incoming.length, symbols);
  }

  function mount(working, books, entries, relCount, symbols) {
    view.innerHTML = '';
    document.body.classList.add('printing-entry');

    let dirty = false;
    // A fresh page opens in Write; a written one opens in Read.
    let mode = working.body ? 'read' : 'write';

    const bookTitle = books.find((b) => b.id === working.bookId)?.title || 'The Canon';
    document.title = `${working.title} · Black Poppy Canon`;
    recordOpened({
      title: working.title,
      kind: working.type,
      date: new Date().toISOString(),
      href: `#/entry/${working.id}`,
    });

    /* ---------- header ---------- */

    const header = document.createElement('header');
    header.className = 'entry-header';

    // Orientation, always: every segment before this page is a link.
    const crumbs = Breadcrumbs([
      { label: 'Dashboard', href: '#/' },
      { label: 'Library', href: '#/library' },
      { label: bookTitle, href: `#/book/${working.bookId}` },
      { label: working.title },
    ]);

    const titleRead = document.createElement('h2');
    titleRead.className = 'entry-header__title';
    titleRead.textContent = working.title;

    const titleWrite = document.createElement('input');
    titleWrite.className = 'entry-header__title-input';
    titleWrite.type = 'text';
    titleWrite.value = working.title;
    titleWrite.setAttribute('aria-label', 'Entry title');
    titleWrite.addEventListener('input', () => {
      working.title = titleWrite.value || 'Untitled Entry';
      titleRead.textContent = working.title;
      crumbs.querySelector('[aria-current="page"]').textContent = working.title;
      markDirty();
    });

    const metaLine = document.createElement('p');
    metaLine.className = 'entry-header__meta';

    function paintMetaLine() {
      metaLine.innerHTML = '';
      const bits = [
        working.id,
        `v${working.version}`,
        working.author,
        `updated ${new Date(working.updated).toLocaleDateString()}`,
      ];
      const status = document.createElement('span');
      status.className = `chip chip--status chip--${working.status}`;
      status.textContent = working.status;
      metaLine.append(status, document.createTextNode(' ' + bits.join(' · ')));
    }
    paintMetaLine();

    /* ---------- header actions ---------- */

    const actions = document.createElement('div');
    actions.className = 'entry-header__actions';

    const modeToggle = document.createElement('div');
    modeToggle.className = 'entry-mode';
    modeToggle.setAttribute('role', 'group');
    modeToggle.setAttribute('aria-label', 'Entry mode');
    const readBtn = modeButton('Read');
    const writeBtn = modeButton('Write');
    modeToggle.append(readBtn, writeBtn);

    function modeButton(label) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'entry-mode__btn';
      b.textContent = label;
      b.addEventListener('click', () => setMode(label.toLowerCase()));
      return b;
    }

    const summaryInput = document.createElement('input');
    summaryInput.className = 'entry-input entry-save-summary';
    summaryInput.type = 'text';
    summaryInput.placeholder = 'What changed? (version summary)';
    summaryInput.setAttribute('aria-label', 'Version summary');

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn entry-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', saveNow);

    const fullBtn = document.createElement('button');
    fullBtn.type = 'button';
    fullBtn.className = 'btn btn--ghost';
    fullBtn.textContent = 'Fullscreen';
    fullBtn.setAttribute('aria-pressed', 'false');
    fullBtn.addEventListener('click', () => {
      const on = view.classList.toggle('entry-view--fullscreen');
      fullBtn.setAttribute('aria-pressed', String(on));
      fullBtn.textContent = on ? 'Exit fullscreen' : 'Fullscreen';
    });

    actions.append(modeToggle, summaryInput, saveBtn, fullBtn);
    header.append(crumbs, titleRead, titleWrite, metaLine, actions);

    /* ---------- find bar (Ctrl+K inside an entry) ---------- */

    const findBar = document.createElement('div');
    findBar.className = 'entry-find';
    findBar.hidden = true;
    findBar.innerHTML = `
      <label class="visually-hidden" for="bpc-entry-find">Find in entry</label>
      <input id="bpc-entry-find" class="entry-input" type="search" placeholder="Find in this entry…">
      <button type="button" class="btn btn--ghost" data-find-next>Next</button>
      <span class="panel__meta" data-find-count aria-live="polite"></span>
      <button type="button" class="btn btn--ghost" data-find-close aria-label="Close find">Esc</button>
    `;
    const findInput = findBar.querySelector('input');
    const findCount = findBar.querySelector('[data-find-count]');
    let findIndex = -1;

    /* ---------- workbench: toolbar + editor + preview ---------- */

    const preview = EntryPreview();
    const editor = EntryEditor({
      value: working.body,
      onInput(v) {
        working.body = v;
        preview.update(v);
        paintMetrics();
        markDirty();
      },
    });

    const printView = PrintView();

    const toolbar = EntryToolbar({
      editor,
      onRelationship() {
        relPanel.openConnect();
      },
      onPrint: printNow,
    });

    const paneToggle = document.createElement('div');
    paneToggle.className = 'entry-pane-toggle';
    paneToggle.setAttribute('role', 'group');
    paneToggle.setAttribute('aria-label', 'Editor pane');
    ['Write', 'Preview'].forEach((label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'entry-mode__btn';
      b.textContent = label;
      b.dataset.pane = label.toLowerCase();
      b.addEventListener('click', () => {
        workbench.dataset.pane = b.dataset.pane;
        paneToggle.querySelectorAll('button').forEach((x) =>
          x.setAttribute('aria-pressed', String(x === b)));
      });
      paneToggle.appendChild(b);
    });

    const workbench = document.createElement('div');
    workbench.className = 'entry-workbench';
    workbench.dataset.pane = 'write';
    workbench.append(editor.el, preview.el);

    const writeArea = document.createElement('div');
    writeArea.className = 'entry-write-area';
    writeArea.append(toolbar, paneToggle, workbench);

    const readArea = document.createElement('div');
    readArea.className = 'entry-read-area prose entry-preview';

    /* ---------- status line ---------- */

    const statusLine = document.createElement('p');
    statusLine.className = 'entry-status';
    const metrics = document.createElement('span');
    const saveState = document.createElement('span');
    saveState.className = 'entry-status__save';
    saveState.setAttribute('aria-live', 'polite');
    statusLine.append(metrics, saveState);

    function paintMetrics() {
      metrics.textContent = `${wordCount(working.body)} words · ${readingTime(working.body)}`;
    }

    /* ---------- panels ---------- */

    function patch(changes) {
      Object.assign(working, changes);
      paintMetaLine();
      markDirty();
    }

    const metaPanel = EntryMetadata({ entry: working, books, relCount, onChange: patch });
    const relPanel = RelationshipPanel({ entry: working, books, entries, symbols });
    const graphPanel = RelationshipGraph({ entry: working, entries, books, symbols });
    const versionPanel = VersionHistory({ entry: working, onRestore: versionPanelRestore });
    const versionPanels = { current: versionPanel };

    view.append(header, findBar, readArea, writeArea, statusLine, metaPanel, relPanel.el, graphPanel.el, versionPanel, printView.el);

    // A new connection should reach the graph too.
    window.addEventListener('bpc:data-changed', function onRelChange() {
      if (!view.isConnected) {
        window.removeEventListener('bpc:data-changed', onRelChange);
        return;
      }
      graphPanel.redraw();
    });

    /* ---------- mode ---------- */

    function setMode(next) {
      mode = next;
      const writing = mode === 'write';
      writeArea.hidden = !writing;
      readArea.hidden = writing;
      titleWrite.hidden = !writing;
      titleRead.hidden = writing;
      summaryInput.hidden = !writing;
      saveBtn.hidden = !writing;
      readBtn.setAttribute('aria-pressed', String(!writing));
      writeBtn.setAttribute('aria-pressed', String(writing));
      if (!writing) {
        readArea.innerHTML = preview.article.innerHTML;
      } else {
        editor.textarea.focus();
      }
    }

    preview.update(working.body);
    readArea.innerHTML = preview.article.innerHTML;
    paintMetrics();
    printView.update(working, bookTitle);
    setMode(mode);

    /* ---------- saving ---------- */

    function markDirty() {
      dirty = true;
      saveState.textContent = 'unsaved changes';
    }

    async function persist(summary) {
      const saved = await canonData.saveEntry(working, summary);
      Object.assign(working, saved);
      dirty = false;
      paintMetaLine();
      printView.update(working, bookTitle);
      saveState.textContent = `saved v${working.version} · ${new Date().toLocaleTimeString()}`;
      // Version list changed — repaint the panel in place.
      const fresh = VersionHistory({ entry: working, onRestore: versionPanelRestore });
      versionPanels.current.replaceWith(fresh);
      versionPanels.current = fresh;
    }

    async function versionPanelRestore(v) {
      working.body = v.body;
      editor.setValue(v.body);
      readArea.innerHTML = preview.article.innerHTML;
      await persist(`Restored from v${v.version}. Nothing is deleted.`);
    }

    async function saveNow() {
      await persist(summaryInput.value.trim());
      summaryInput.value = '';
    }

    // Autosave — asynchronous, non-blocking, every ten seconds.
    const autosave = setInterval(async () => {
      if (!view.isConnected) { clearInterval(autosave); return; }
      if (!dirty) return;
      await canonData.autosaveEntry(working);
      dirty = false;
      saveState.textContent = `draft kept · ${new Date().toLocaleTimeString()}`;
    }, AUTOSAVE_MS);

    /* ---------- print ---------- */

    function printNow() {
      printView.update(working, bookTitle);
      window.print();
    }

    /* ---------- find in entry ---------- */

    function currentPage() {
      return mode === 'write' ? preview.article : readArea;
    }

    function clearMarks() {
      view.querySelectorAll('mark.find-mark').forEach((m) => {
        m.replaceWith(document.createTextNode(m.textContent));
      });
      currentPage().normalize();
    }

    function highlight(term) {
      clearMarks();
      findIndex = -1;
      if (!term) { findCount.textContent = ''; return; }
      const root = currentPage();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const targets = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.parentElement.closest('mark')) continue;
        if (node.textContent.toLowerCase().includes(term.toLowerCase())) targets.push(node);
      }
      let total = 0;
      targets.forEach((textNode) => {
        const text = textNode.textContent;
        const frag = document.createDocumentFragment();
        let idx = 0;
        const lower = text.toLowerCase();
        const t = term.toLowerCase();
        let at;
        while ((at = lower.indexOf(t, idx)) !== -1) {
          frag.appendChild(document.createTextNode(text.slice(idx, at)));
          const mark = document.createElement('mark');
          mark.className = 'find-mark';
          mark.textContent = text.slice(at, at + term.length);
          frag.appendChild(mark);
          idx = at + term.length;
          total++;
        }
        frag.appendChild(document.createTextNode(text.slice(idx)));
        textNode.replaceWith(frag);
      });
      findCount.textContent = total ? `${total} found` : 'not found';
      if (total) findNext();
    }

    function findNext() {
      const marks = [...currentPage().querySelectorAll('mark.find-mark')];
      if (!marks.length) return;
      findIndex = (findIndex + 1) % marks.length;
      marks.forEach((m, i) => m.classList.toggle('find-mark--active', i === findIndex));
      marks[findIndex].scrollIntoView({ block: 'center' });
      findCount.textContent = `${findIndex + 1} of ${marks.length}`;
    }

    function openFind() {
      findBar.hidden = false;
      findInput.focus();
      findInput.select();
    }

    function closeFind() {
      findBar.hidden = true;
      clearMarks();
      findCount.textContent = '';
    }

    findInput.addEventListener('input', () => highlight(findInput.value.trim()));
    findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); findNext(); }
    });
    findBar.querySelector('[data-find-next]').addEventListener('click', findNext);
    findBar.querySelector('[data-find-close]').addEventListener('click', closeFind);

    /* ---------- keyboard shortcuts (capture beats global Ctrl+K) ---------- */

    function onKeydown(e) {
      if (!view.isConnected) {
        window.removeEventListener('keydown', onKeydown, true);
        document.body.classList.remove('printing-entry');
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveNow();
      } else if (mod && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        printNow();
      } else if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation(); // inside an entry, Ctrl+K searches the page
        openFind();
      } else if (e.key === 'Escape' && !findBar.hidden) {
        e.stopPropagation();
        closeFind();
      }
    }
    window.addEventListener('keydown', onKeydown, true);

    // Leave no trace when the reader turns the page.
    window.addEventListener('hashchange', function onLeave() {
      if (!view.isConnected) {
        document.body.classList.remove('printing-entry');
        clearInterval(autosave);
        window.removeEventListener('keydown', onKeydown, true);
        window.removeEventListener('hashchange', onLeave);
      }
    });
  }
}
