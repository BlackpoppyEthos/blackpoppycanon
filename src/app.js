// Black Poppy Canon — application shell
import { Sidebar } from './components/sidebar.js';
import { Header } from './components/header.js';
import { initRouter } from './router.js';
import { initSearch } from './components/search-overlay.js';

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

  initRouter({
    outlet: inner,
    onNavigate(route) {
      header.setTitle(route.title);
      sidebar.setActive(route.activePath ?? route.path ?? '/');
      document.title = `${route.title} · Black Poppy Canon`;
      main.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    },
  });
}
