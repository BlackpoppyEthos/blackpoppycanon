// Black Poppy Canon — Settings view (Sprint 4.3)
// Home of the quiet things — including the hidden dark theme.
// Parchment is Version 1. The night mode waits for those who look.

import { getTheme, toggleTheme } from '../theme.js';

export function SettingsView() {
  const view = document.createElement('div');

  const intro = document.createElement('section');
  intro.innerHTML = `
    <span class="eyebrow">Settings</span>
    <h2>How the Canon behaves</h2>
  `;
  view.appendChild(intro);

  // Appearance
  const appearance = document.createElement('section');
  appearance.className = 'card';
  appearance.innerHTML = `
    <h3 class="card__title">Appearance</h3>
    <p class="text-muted">Parchment is the Canon's daylight. A night theme
    exists for those who prefer to read after dark.</p>
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn btn--ghost';

  function paint() {
    const theme = getTheme();
    toggleBtn.textContent = theme === 'light' ? 'Read after dark' : 'Return to parchment';
    toggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  paint();

  toggleBtn.addEventListener('click', () => {
    toggleTheme();
    paint();
  });

  appearance.appendChild(toggleBtn);
  view.appendChild(appearance);

  // Data
  const data = document.createElement('section');
  data.className = 'card';
  data.style.marginTop = 'var(--space-4)';
  data.innerHTML = `
    <h3 class="card__title">Data</h3>
    <p class="text-muted" style="margin-bottom:0">The Canon is running on mock data.
    The specialized Google Sheets backend arrives in Sprint 6 — nothing here
    is stored anywhere but this device.</p>
  `;
  view.appendChild(data);

  return view;
}
