// Black Poppy Canon — application state
// A tiny observable store. No framework, no magic.
// Empty collections are honest: the Grimoire backend arrives in a later sprint.

import { storage } from './services/storage.js';

const initialState = {
  bloom: 'The First Bloom',
  version: '0.7.0',

  // Canon data (populated by the data layer in a future sprint)
  books: [],
  entries: [],        // { id, title, book, date }
  blooms: [],         // Today's Bloom feed: newest entries/ideas/sketches/captures
  atelierProjects: [],// works in progress
  lookingGlass: [],   // experimental ideas

  // Continue Working — last opened thing
  lastOpened: storage.get('bpc-last-opened', null),

  // Active Projects across the Black Poppy Universe (future projects append here)
  activeProjects: [
    { id: 'canon',   name: 'Black Poppy Canon',  role: 'The living heart' },
    { id: 'fbp',     name: 'Funky Black Poppy',  role: 'Second-hand rebellion' },
    { id: 'magik',   name: 'Black Poppy Magik',  role: 'The apothecary storefront' },
    { id: 'oracle',  name: 'Turtle Oracle',      role: 'Animal natal charts' },
    { id: 'cursey',  name: 'Cursey Queen',       role: 'The channel' },
  ],

  lastVisit: storage.get('bpc-last-visit', null),
};

const listeners = new Set();
let state = { ...initialState };

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function recordOpened(item) {
  storage.set('bpc-last-opened', item);
  setState({ lastOpened: item });
}

storage.set('bpc-last-visit', new Date().toISOString());
