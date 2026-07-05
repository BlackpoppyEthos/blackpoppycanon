// Black Poppy Canon — Root System · IDs (APP-007, Principle Two)
// IDs never change. IDs are never recycled. IDs are permanent.
// New objects mint in the constitutional format: PREFIX-000001,
// a zero-padded counter that only ever climbs. Existing IDs
// (ENT-002, BOOK-007, SYM-001…) are already permanent and are
// left exactly as written — the Constitution forbids renumbering.

import { storage } from '../services/storage.js';

const COUNTER_KEY = 'bpc-id-counters';

// Constitutional prefixes, by object type.
export const ID_PREFIX = {
  book: 'BOOK',
  entry: 'ENTRY',
  symbol: 'SYMBOL',
  relationship: 'REL',
  worktable: 'WORKTABLE',
  object: 'OBJECT',
  companion: 'COMPANION',
  project: 'PROJECT',
  product: 'PRODUCT',
  package: 'PACKAGE',
  component: 'COMPONENT',
  asset: 'ASSET',
};

function counters() {
  return storage.get(COUNTER_KEY, {});
}

// Mint the next permanent id for a type. The counter is persisted
// before the id is returned, so a mint is never handed out twice.
export function mintId(type) {
  const prefix = ID_PREFIX[type] || String(type || 'OBJECT').toUpperCase();
  const all = counters();
  const next = (all[prefix] || 0) + 1;
  all[prefix] = next;
  storage.set(COUNTER_KEY, all);
  return `${prefix}-${String(next).padStart(6, '0')}`;
}

// Learn the high-water mark from ids already in the store, so a
// fresh counter never collides with existing constitutional ids.
export function observeId(id) {
  const m = /^([A-Z]+)-(\d{6,})$/.exec(String(id));
  if (!m) return;
  const [, prefix, num] = m;
  const all = counters();
  const seen = parseInt(num, 10);
  if (seen > (all[prefix] || 0)) {
    all[prefix] = seen;
    storage.set(COUNTER_KEY, all);
  }
}

// The type a legacy or constitutional id belongs to (best effort).
const PREFIX_TO_TYPE = Object.fromEntries(
  Object.entries(ID_PREFIX).map(([type, prefix]) => [prefix, type])
);
// Legacy short prefixes still in the seed data.
Object.assign(PREFIX_TO_TYPE, { ENT: 'entry', SYM: 'symbol', WT: 'worktable', OBJ: 'object' });

export function typeOfId(id) {
  const prefix = String(id).split('-')[0];
  return PREFIX_TO_TYPE[prefix] || null;
}
