// Black Poppy Canon — canon-data adapter (AD-006)
// THE data contract. All Canon data flows through here — views never
// touch JSON files or storage keys directly. Mock mode until Sprint 6,
// when the internals swap to the Google Sheets backend. The surface
// of this module must not change when that happens.
//
// The Entry is the atomic unit of the entire system:
//   { id, bookId, type, title, tags, status, body, author,
//     version, created, updated, relationships[], versions[] }
//
// Nothing is deleted. Entries archive; every explicit save creates
// a version.

import { createRelationship } from './RelationshipService.js';
import { root } from '../root/RootSystem.js';
import { mintId } from '../root/ids.js';

// This module is the AD-006 adapter and the Canon's public face over
// the Root System (APP-007): views call these functions; internally
// every read and write flows View → Service → Repository → Storage.
// The Entry shape below is the locked Sprint 6 migration contract and
// must never change.

export const ENTRY_TYPES = [
  'Canon Entry', 'Journal', 'Dream', 'Looking Glass', 'Atelier',
  'Symbol', 'Companion', 'Project', 'Product', 'Engineering Decision',
  'Sprint', 'Release Note', 'Research', 'Meeting Notes', 'Reference',
];

export const ENTRY_STATUSES = ['looking-glass', 'atelier', 'canon', 'archived'];

export const RELATIONSHIP_TYPES = [
  'book', 'project', 'symbol', 'visual', 'companion', 'product', 'entry',
];

const nowISO = () => new Date().toISOString();

// Every write of an entry goes through the entry repository; the
// repository emits the change so the shell re-hydrates.
function persistEntry(entry) {
  return root.repo('entry').put(entry);
}

/* ---------- books ---------- */

export async function listBooks() {
  return root.repo('book').all();
}

export async function getBook(id) {
  return root.repo('book').get(id);
}

/* ---------- symbols (the Symbolarium) ---------- */

export async function listSymbols() {
  return root.repo('symbol').all();
}

export async function getSymbol(id) {
  return root.repo('symbol').get(id);
}

/* ---------- entries ---------- */

export async function listEntries() {
  const entries = await root.repo('entry').all();
  return entries.sort((a, b) => new Date(b.updated) - new Date(a.updated));
}

export async function getEntry(id) {
  return root.repo('entry').get(id);
}

export async function createEntry(partial = {}) {
  const stamp = nowISO();
  const entry = {
    id: mintId('entry'), // permanent constitutional id: ENTRY-000001
    bookId: partial.bookId || 'BOOK-003',
    type: partial.type || 'Canon Entry',
    title: partial.title || 'Untitled Entry',
    tags: partial.tags || [],
    status: partial.status || 'atelier',
    body: partial.body || '',
    author: partial.author || 'Rachael Nike',
    version: 1,
    created: stamp,
    updated: stamp,
    relationships: partial.relationships || [],
    versions: [
      { version: 1, timestamp: stamp, summary: 'Entry begun.', author: partial.author || 'Rachael Nike' },
    ],
  };
  await persistEntry(entry);
  // Canon rule: an Entry cannot exist without a parent Book.
  // The Belongs To thread is drawn automatically — never wired by hand.
  await createRelationship({
    source: entry.id,
    target: entry.bookId,
    type: 'Belongs To',
    author: entry.author,
  });
  return entry;
}

// Explicit save — creates a version. Nothing is deleted.
export async function saveEntry(entry, summary = '') {
  const stamp = nowISO();
  const next = {
    ...entry,
    version: (entry.version || 0) + 1,
    updated: stamp,
    versions: [
      ...(entry.versions || []),
      {
        version: (entry.version || 0) + 1,
        timestamp: stamp,
        summary: summary || 'Saved.',
        author: entry.author,
        body: entry.body,
      },
    ],
  };
  return persistEntry(next);
}

// Autosave — keeps the draft safe without minting a version.
export async function autosaveEntry(entry) {
  return persistEntry({ ...entry, updated: nowISO() });
}

// Archive, never delete.
export async function archiveEntry(entry) {
  return saveEntry({ ...entry, status: 'archived' }, 'Archived.');
}

/* ---------- relationships ---------- */

export async function listRelationships(entryId) {
  const seeded = await root.repo('relationship').all();
  const entry = await getEntry(entryId);
  const own = (entry?.relationships || []).map((r) => ({ from: entryId, to: r.targetId, type: r.type, label: r.label || '' }));
  const external = seeded.filter((r) => r.from === entryId || r.to === entryId);
  const seen = new Set();
  return [...own, ...external].filter((r) => {
    const key = `${r.from}→${r.to}·${r.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
