// Black Poppy Canon — 404 view
import { EmptyState } from '../components/card.js';

export function NotFoundView() {
  const view = document.createElement('div');
  view.appendChild(
    EmptyState({
      symbol: 'paw',
      title: 'This page wandered off.',
      body: 'Nothing lives at this address. Use the sidebar to find your way back into the Canon.',
    })
  );
  return view;
}
