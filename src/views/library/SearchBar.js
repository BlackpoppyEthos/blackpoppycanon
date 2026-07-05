// Black Poppy Canon — SearchBar (Living Library)
// Instant, local, calm. Filters the shelf as you type.

export function SearchBar({ onInput }) {
  const el = document.createElement('div');
  el.className = 'library-search';

  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.setAttribute('for', 'library-search-input');
  label.textContent = 'Search the Library';

  const input = document.createElement('input');
  input.id = 'library-search-input';
  input.type = 'search';
  input.className = 'library-search__input';
  input.placeholder = 'Search the Library…';
  input.autocomplete = 'off';
  input.addEventListener('input', () => onInput(input.value));

  el.append(label, input);
  return el;
}
