// Black Poppy Canon — Settings view (placeholder)
import { EmptyState } from '../components/card.js';

export function SettingsView() {
  const view = document.createElement('div');
  view.appendChild(
    EmptyState({
      symbol: 'settings',
      title: 'Settings are taking shape.',
      body: 'Theme preferences, data connections, and Canon behavior will be configured here. For now, the moon in the header switches between light and dark.',
    })
  );
  return view;
}
