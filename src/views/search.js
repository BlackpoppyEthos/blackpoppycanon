// Black Poppy Canon — Search view (placeholder)
import { EmptyState } from '../components/card.js';

export function SearchView() {
  const view = document.createElement('div');
  view.appendChild(
    EmptyState({
      symbol: 'search',
      title: 'Search is listening.',
      body: 'Soon you will be able to find any entry, symbol, or thread across the entire Canon from here.',
    })
  );
  return view;
}
