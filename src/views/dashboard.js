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

export function DashboardView() {
  const view = document.createElement('div');
  view.className = 'dashboard';

  const state = getState();

  view.appendChild(DashboardHeader(state));

  const grid = document.createElement('div');
  grid.className = 'dash-grid';

  grid.appendChild(ContinueCard(state));
  grid.appendChild(BloomCard(state));
  grid.appendChild(AtelierCard(state));
  grid.appendChild(LookingGlassCard(state));
  grid.appendChild(ProjectsCard(state));
  grid.appendChild(RecentEntriesCard(state));
  grid.appendChild(CompanionCard());

  view.appendChild(grid);
  view.appendChild(Footer(state));

  return view;
}
