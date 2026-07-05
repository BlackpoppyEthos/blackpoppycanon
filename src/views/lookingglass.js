// Black Poppy Canon — Looking Glass view (placeholder)
// Named in the Atelier spec's navigation; its own sprint follows.

import { EmptyState } from '../components/card.js';

export function LookingGlassView() {
  const view = document.createElement('div');
  view.appendChild(
    EmptyState({
      symbol: 'star',
      title: 'The Looking Glass is still silvering.',
      body: 'Experimental ideas will gather here — the ones not yet ready for the Atelier, let alone the Canon. Its sprint is on the roadmap.',
    })
  );
  return view;
}
