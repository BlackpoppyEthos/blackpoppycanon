// Black Poppy Canon — Dashboard view (Sprint 4.2)
// The front door of the Canon. Not an admin page — a studio.
//
// Layout (desktop, two columns):
//   Welcome Header ............... full width
//   Continue        | Today's Bloom
//   Atelier         | Looking Glass
//   Active Projects | Recent Entries
//   Companion       | (breathing room)
//   Footer ....................... full width

import {
  DashboardHeader,
  ContinueCard,
  BloomCard,
  AtelierCard,
  LookingGlassCard,
  ProjectsCard,
  RecentEntriesCard,
  CompanionCard,
  Footer,
} from '../components/dashboard-cards.js';
import { getState } from '../state.js';
import { getEntries } from '../services/canon-data.js';

export function DashboardView() {
  const view = document.createElement('div');
  view.className = 'dashboard';

  const state = getState();

  view.appendChild(DashboardHeader(state));

  const grid = document.createElement('div');
  grid.className = 'dash-grid';

  grid.appendChild(ContinueCard(state));
  const bloomSlot = BloomCard(state);
  grid.appendChild(bloomSlot);
  grid.appendChild(AtelierCard(state));
  grid.appendChild(LookingGlassCard(state));
  grid.appendChild(ProjectsCard(state));
  const recentSlot = RecentEntriesCard(state);
  grid.appendChild(recentSlot);
  grid.appendChild(CompanionCard());

  // Entries are real now — refresh Bloom and Recent from the adapter.
  getEntries().then((entries) => {
    if (!entries.length) return;
    const sorted = entries.slice().sort((a, b) => new Date(b.updated || b.date) - new Date(a.updated || a.date));
    const blooms = sorted.slice(0, 5).map((e) => ({
      title: e.title, kind: e.type || 'Entry', href: `#/entry/${encodeURIComponent(e.id)}`,
    }));
    bloomSlot.replaceWith(BloomCard({ blooms }));
    recentSlot.replaceWith(RecentEntriesCard({
      entries: sorted.map((e) => ({ title: e.title, book: e.bookId, date: e.updated || e.date, href: `#/entry/${encodeURIComponent(e.id)}` })),
    }));
  });

  view.appendChild(grid);
  view.appendChild(Footer(state));

  return view;
}
