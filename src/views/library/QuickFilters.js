// Black Poppy Canon — QuickFilters (Living Library)
// One question: "What do I want to explore?"

export const FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'books',      label: 'Books' },
  { id: 'projects',   label: 'Projects' },
  { id: 'visual',     label: 'Visual Canon' },
  { id: 'symbols',    label: 'Symbols' },
  { id: 'components', label: 'Components' },
  { id: 'packaging',  label: 'Packaging' },
  { id: 'prompts',    label: 'Prompts' },
  { id: 'favorites',  label: 'Favorites' },
  { id: 'recent',     label: 'Recent' },
];

export function QuickFilters({ active = 'all', onChange }) {
  const el = document.createElement('div');
  el.className = 'quick-filters';
  el.setAttribute('role', 'tablist');
  el.setAttribute('aria-label', 'Library filters');

  FILTERS.forEach((f) => {
    const btn = document.createElement('button');
    btn.className = 'quick-filters__btn';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(f.id === active));
    btn.dataset.filter = f.id;
    btn.textContent = f.label;
    btn.addEventListener('click', () => {
      el.querySelectorAll('[role="tab"]').forEach((b) =>
        b.setAttribute('aria-selected', String(b === btn))
      );
      onChange(f.id);
    });
    el.appendChild(btn);
  });

  return el;
}
