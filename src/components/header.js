// Black Poppy Canon — top header component
// Sprint 4.3: the theme toggle moved to Settings. Dark is a supported,
// hidden feature; parchment is the experience.
import { icons } from './icons.js';

export function Header() {
  const el = document.createElement('header');
  el.className = 'header';

  const menuButton = document.createElement('button');
  menuButton.className = 'icon-btn menu-toggle';
  menuButton.setAttribute('aria-label', 'Open menu');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = icons.menu;

  const title = document.createElement('h1');
  title.className = 'header__title';
  title.textContent = 'Dashboard';

  const left = document.createElement('div');
  left.className = 'header__actions';
  left.append(menuButton, title);

  el.append(left);

  return {
    el,
    menuButton,
    setTitle(text) {
      title.textContent = text;
    },
  };
}
