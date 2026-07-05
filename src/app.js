// Black Poppy Canon — application shell
import { Sidebar } from './components/sidebar.js';
import { Header } from './components/header.js';
import { initRouter } from './router.js';
import { initSearch } from './components/search-overlay.js';
import { setState } from './state.js';
import * as canonData from './services/canon-data.js';
import { migrateFromEntries } from './services/RelationshipService.js';

export function initApp(root) {
  root.innerHTML = '';

  const sidebar = Sidebar();
  const header = Header();

  const main = document.createElement('main');
  main.className = 'main';
  main.id = 'main-content';
  main.setAttribute('tabindex', '-1');

  const inner = document.createElement('div');
  inner.className = 'main__inner';
  main.appendChild(inner);

  // Mobile scrim for the slide-over sidebar
  const scrim = document.createElement('button');
  scrim.className = 'scrim';
  scrim.setAttribute('aria-label', 'Close menu');
  scrim.addEventListener('click', () => toggleSidebar(false));

  root.append(sidebar.el, header.el, main, scrim);

  function toggleSidebar(open) {
    const isOpen = open ?? sidebar.el.dataset.open !== 'true';
    sidebar.el.dataset.open = String(isOpen);
    scrim.dataset.visible = String(isOpen);
    header.menuButton.setAttribute('aria-expanded', String(isOpen));
  }

  header.menuButton.addEventListener('click', () => toggleSidebar());

  initSearch(root);

  // Close the mobile menu after navigating
  sidebar.el.addEventListener('click', (e) => {
    if (e.target.closest('a')) toggleSidebar(false);
  });

  // Wake the Canon: entries flow into state through the adapter,
  // so the dashboard and global search see them from first paint —
  // and stay current whenever the Canon grows.
  async function hydrate() {
    try {
      const [books, entries] = await Promise.all([
        canonData.listBooks(),
        canonData.listEntries(),
      ]);
      // Sprint 4.5: embedded entry relationships become first-class objects.
      await migrateFromEntries(entries);
      const bookTitle = (id) => books.find((b) => b.id === id)?.title || '';
      setState({
        books,
        entries: entries.map((e) => ({
          id: e.id,
          title: e.title,
          book: bookTitle(e.bookId),
          date: e.updated,
          href: `#/entry/${e.id}`,
        })),
        blooms: entries.slice(0, 5).map((e) => ({
          title: e.title,
          kind: e.type,
          href: `#/entry/${e.id}`,
        })),
      });
    } catch {
      /* Empty collections stay honest if the data cannot load. */
    }
  }

  window.addEventListener('bpc:data-changed', hydrate);

  (async () => {
    await hydrate();

    initRouter({
      outlet: inner,
      onNavigate(route) {
        header.setTitle(route.title);
        sidebar.setActive(route.path);
        document.title = `${route.title} · Black Poppy Canon`;
        main.focus({ preventScroll: true });
        window.scrollTo(0, 0);
      },
    });
  })();
}
