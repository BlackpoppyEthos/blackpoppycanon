// Black Poppy Canon — data adapter (Sprint 4.4: the Entry System)
// The Entry is the atomic unit of the Black Poppy Operating System.
// MOCK MODE: approved Books from JSON; Entries written in-app persist
// on this device through this interface. Sprint 6 swaps the internals
// for the specialized Sheets backend; the contract below is stable.
//
// Canon rules honored here:
//   • Do not invent Canon — entries are written, never generated.
//   • Nothing is deleted — entries archive; every save is a version.

import { storage } from './storage.js';

const LOCAL_ENTRIES_KEY = 'bpc-local-entries';
const AUTHOR = 'Rachael Nike';
const cache = new Map();

export const ENTRY_TYPES = [
  'Canon Entry', 'Journal', 'Dream', 'Looking Glass', 'Atelier',
  'Symbol', 'Companion', 'Project', 'Product', 'Engineering Decision',
  'Sprint', 'Release Note', 'Research', 'Meeting Notes', 'Reference',
];

export const ENTRY_STATUSES = ['looking-glass', 'atelier', 'canon', 'archived'];

async function load(name) {
  if (cache.has(name)) return cache.get(name);
  try {
    const res = await fetch(`./src/data/${name}.json`);
    if (!res.ok) throw new Error(`${name}: ${res.status}`);
    const data = await res.json();
    cache.set(name, data);
    return data;
  } catch (err) {
    console.error('[canon-data]', err);
    cache.set(name, []);
    return [];
  }
}

function localEntries() {
  return storage.get(LOCAL_ENTRIES_KEY, []);
}

function persist(entries) {
  storage.set(LOCAL_ENTRIES_KEY, entries);
}

export const DATA_MODE = 'mock';

/* ---------- Books ---------- */

export async function getBooks() {
  return structuredClone(await load('books'));
}

export async function getBook(id) {
  const books = await load('books');
  return structuredClone(books.find((b) => b.id === id) || null);
}

/* ---------- Entries ---------- */

export async function getEntries(bookId) {
  const json = await load('entries');
  const merged = [...localEntries(), ...json];
  return structuredClone(
    bookId ? merged.filter((e) => e.bookId === bookId) : merged
  );
}

export async function getEntry(id) {
  const entries = await getEntries();
  return entries.find((e) => e.id === id) || null;
}

export function isLocalEntry(id) {
  return localEntries().some((e) => e.id === id);
}

// Explicit save: creates a version. Nothing is deleted.
export function saveEntry({ id, bookId, type, title, tags = [], status, body, summary }) {
  const entries = localEntries();
  const now = new Date().toISOString();

  if (id) {
    const i = entries.findIndex((e) => e.id === id);
    if (i === -1) return null;
    const prev = entries[i];
    const version = (prev.version || 1) + 1;
    entries[i] = {
      ...prev,
      bookId, type, title, tags, body,
      status: status || prev.status,
      version,
      updated: now,
      versions: [
        ...(prev.versions || []),
        { version, timestamp: now, summary: summary || 'Revised', author: AUTHOR, body },
      ],
    };
    persist(entries);
    return structuredClone(entries[i]);
  }

  const entry = {
    id: `ENTRY-${Date.now().toString(36).toUpperCase()}`,
    bookId,
    type: type || 'Canon Entry',
    title,
    tags,
    status: status || 'looking-glass',
    body,
    author: AUTHOR,
    version: 1,
    created: now,
    updated: now,
    relationships: [],
    versions: [
      { version: 1, timestamp: now, summary: summary || 'First writing', author: AUTHOR, body },
    ],
    source: 'local',
  };
  entries.unshift(entry);
  persist(entries);
  return structuredClone(entry);
}

// Archive, never delete.
export function archiveEntry(id) {
  const entries = localEntries();
  const i = entries.findIndex((e) => e.id === id);
  if (i === -1) return false;
  entries[i].status = 'archived';
  entries[i].updated = new Date().toISOString();
  persist(entries);
  return true;
}

/* ---------- Relationships ---------- */

export function setRelationships(id, relationships) {
  const entries = localEntries();
  const i = entries.findIndex((e) => e.id === id);
  if (i === -1) return false;
  entries[i].relationships = relationships;
  persist(entries);
  return true;
}

export async function getRelationshipsData() {
  return structuredClone(await load('relationships'));
}

/* ---------- Drafts (autosave — silent, crash-safe) ---------- */

export function saveDraft(key, draft) {
  storage.set(`bpc-draft-${key}`, { ...draft, savedAt: new Date().toISOString() });
}

export function getDraft(key) {
  return storage.get(`bpc-draft-${key}`, null);
}

export function clearDraft(key) {
  storage.remove(`bpc-draft-${key}`);
}

/* ---------- Other collections ---------- */

export async function getProjects() { return structuredClone(await load('projects')); }
export async function getSymbols() { return structuredClone(await load('symbols')); }
export async function getCompanions() { return structuredClone(await load('companions')); }

export async function getCounts() {
  const books = await load('books');
  const entries = await getEntries();
  return { books: books.length, entries: entries.length };
}
