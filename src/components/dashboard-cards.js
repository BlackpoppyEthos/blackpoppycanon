// Black Poppy Canon — Dashboard components (Sprint 4.2)
// DashboardHeader · ContinueCard · BloomCard · AtelierCard
// LookingGlassCard · ProjectCard · RecentEntryCard · CompanionCard · Footer

import { icon, icons } from './icons.js';
import { spotlightCompanion } from '../services/companions.js';

/* ---------- helpers ---------- */

function panel({ eyebrow, title }) {
  const el = document.createElement('section');
  el.className = 'card panel';
  if (eyebrow) {
    const e = document.createElement('span');
    e.className = 'eyebrow';
    e.textContent = eyebrow;
    el.appendChild(e);
  }
  if (title) {
    const h = document.createElement('h3');
    h.className = 'card__title';
    h.textContent = title;
    el.appendChild(h);
  }
  return el;
}

function quietList(items, emptyText) {
  if (!items.length) {
    const p = document.createElement('p');
    p.className = 'panel__empty';
    p.textContent = emptyText;
    return p;
  }
  const ul = document.createElement('ul');
  ul.className = 'panel__list';
  items.forEach((item) => {
    const li = document.createElement('li');
    if (item.href) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
    } else {
      li.textContent = item.label;
    }
    if (item.meta) {
      const m = document.createElement('span');
      m.className = 'panel__meta';
      m.textContent = item.meta;
      li.appendChild(m);
    }
    ul.appendChild(li);
  });
  return ul;
}

function panelAction(label, href) {
  const a = document.createElement('a');
  a.className = 'btn btn--ghost panel__action';
  a.href = href;
  a.textContent = label;
  return a;
}

/* ---------- 1. Dashboard Header ---------- */

export function DashboardHeader({ version }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const dateText = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const el = document.createElement('section');
  el.className = 'dash-header';
  el.innerHTML = `
    <div>
      <h2 class="dash-header__greeting">${greeting}, Miss Rachael Nike</h2>
      <p class="dash-header__meta">${dateText} · Canon v${version} · The First Bloom</p>
    </div>
  `;

  const searchBtn = document.createElement('button');
  searchBtn.className = 'btn btn--ghost dash-header__search';
  searchBtn.setAttribute('aria-label', 'Search the Canon (Ctrl+K)');
  searchBtn.innerHTML = `${icons.search}<span>Search</span><kbd>Ctrl K</kbd>`;
  searchBtn.addEventListener('click', () =>
    window.dispatchEvent(new CustomEvent('bpc:open-search'))
  );
  el.appendChild(searchBtn);

  return el;
}

/* ---------- 2. Continue Working ---------- */

export function ContinueCard({ lastOpened }) {
  const el = panel({ eyebrow: 'Continue Working', title: lastOpened ? lastOpened.title : 'Begin.' });
  const p = document.createElement('p');
  p.className = 'panel__empty';
  p.textContent = lastOpened
    ? `${lastOpened.kind} · last opened ${new Date(lastOpened.date).toLocaleDateString()}`
    : 'Nothing is open yet. The first Book of the Canon is waiting to be bound.';
  el.appendChild(p);
  el.appendChild(panelAction('Continue →', lastOpened ? lastOpened.href : '#/library'));
  return el;
}

/* ---------- 3. Today's Bloom ---------- */

export function BloomCard({ blooms }) {
  const el = panel({ eyebrow: "Today's Bloom", title: 'What is newest' });
  el.appendChild(
    quietList(
      blooms.slice(0, 5).map((b) => ({ label: b.title, meta: b.kind, href: b.href })),
      'No new entries, ideas, sketches, or captures yet. The garden is planted — the first blooms arrive with the data layer.'
    )
  );
  return el;
}

/* ---------- 4. Atelier ---------- */

export function AtelierCard({ atelierProjects }) {
  const el = panel({ eyebrow: 'Atelier', title: 'In progress' });
  el.appendChild(
    quietList(
      atelierProjects.map((p) => ({ label: p.title, meta: p.status, href: p.href })),
      'The workbench is clear. Works in progress will gather here.'
    )
  );
  el.appendChild(panelAction('Open Atelier', '#/atelier'));
  return el;
}

/* ---------- 5. Looking Glass ---------- */

export function LookingGlassCard({ lookingGlass }) {
  const el = panel({ eyebrow: 'Looking Glass', title: 'Experiments' });
  el.appendChild(
    quietList(
      lookingGlass.map((i) => ({ label: i.title, meta: i.date, href: i.href })),
      'No experiments recorded yet. The glass is polished and waiting.'
    )
  );
  el.appendChild(panelAction('Step Through the Looking Glass', '#/atelier'));
  return el;
}

/* ---------- 6. Active Projects ---------- */

export function ProjectsCard({ activeProjects }) {
  const el = panel({ eyebrow: 'Active Projects', title: 'The Universe' });
  const ul = document.createElement('ul');
  ul.className = 'panel__list panel__list--projects';
  activeProjects.forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.name}</strong><span class="panel__meta">${p.role}</span>`;
    ul.appendChild(li);
  });
  el.appendChild(ul);
  return el;
}

/* ---------- 7. Recent Entries ---------- */

export function RecentEntriesCard({ entries }) {
  const el = panel({ eyebrow: 'Recent Entries', title: 'Latest in the Canon' });
  el.appendChild(
    quietList(
      entries
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .map((e) => ({ label: e.title, meta: e.book, href: e.href || '#/library' })),
      'The Canon has no entries yet. Every lesson worth remembering will live here.'
    )
  );
  return el;
}

/* ---------- 8. Companion Spotlight ---------- */

export function CompanionCard() {
  const c = spotlightCompanion();
  const el = panel({ eyebrow: 'Companion Spotlight', title: c.name });
  const kind = document.createElement('p');
  kind.className = 'panel__meta panel__meta--block';
  kind.textContent = c.kind;
  const note = document.createElement('p');
  note.textContent = c.note;
  note.style.marginBottom = '0';
  el.prepend(icon(c.symbol, 'panel__symbol'));
  el.append(kind, note);
  return el;
}

/* ---------- 9. Footer ---------- */

export function Footer({ version }) {
  const el = document.createElement('footer');
  el.className = 'dash-footer';
  el.innerHTML = `
    <span>Black Poppy Canon · v${version} · The First Bloom</span>
    <span aria-hidden="true">11:11</span>
    <span><em>Noli illegitimi carborundum</em></span>
  `;
  return el;
}
