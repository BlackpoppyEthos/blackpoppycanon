// Black Poppy Canon — top header component
import { icons } from './icons.js';
import { getTheme, toggleTheme } from '../theme.js';

export function Header() {
  const el = document.createElement('header');
  el.className = 'header';

  // Mobile menu button
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

  // Theme toggle
  const themeButton = document.createElement('button');
  themeButton.className = 'icon-btn';
  themeButton.setAttribute('aria-label', 'Switch to dark theme');

  function paintThemeButton() {
    const theme = getTheme();
    themeButton.innerHTML = theme === 'light' ? icons.moon : icons.sun;
    themeButton.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }
  paintThemeButton();

  themeButton.addEventListener('click', () => {
    toggleTheme();
    paintThemeButton();
  });

  const actions = document.createElement('div');
  actions.className = 'header__actions';
  actions.append(themeButton);

  el.append(left, actions);

  return {
    el,
    menuButton,
    setTitle(text) {
      title.textContent = text;
    },
  };
}
