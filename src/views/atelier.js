// Black Poppy Canon — Atelier view (placeholder)
import { EmptyState } from '../components/card.js';

export function AtelierView() {
  const view = document.createElement('div');
  view.appendChild(
    EmptyState({
      symbol: 'atelier',
      title: 'The Atelier is still being swept.',
      body: 'The making place — visual components, the studio wall, and works in progress will gather here. Coming in a future sprint.',
    })
  );
  return view;
}
