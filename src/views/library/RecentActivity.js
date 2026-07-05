// Black Poppy Canon — RecentActivity (Living Library)
// What was touched, in the order it mattered.

import { getRecent } from '../../state.js';

export function RecentActivity() {
  const el = document.createElement('section');
  el.className = 'card recent-activity';
  el.innerHTML = `<span class="eyebrow">Recent Activity</span>`;

  const recent = getRecent();

  if (!recent.length) {
    const p = document.createElement('p');
    p.className = 'panel__empty';
    p.textContent = 'Nothing visited yet. Open a Book and it will be remembered here.';
    el.appendChild(p);
    return el;
  }

  const ul = document.createElement('ul');
  ul.className = 'panel__list';
  recent.forEach((r) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = r.href;
    a.textContent = r.title;
    const m = document.createElement('span');
    m.className = 'panel__meta';
    m.textContent = `${r.kind} · ${new Date(r.date).toLocaleDateString()}`;
    li.append(a, m);
    ul.appendChild(li);
  });
  el.appendChild(ul);

  return el;
}
