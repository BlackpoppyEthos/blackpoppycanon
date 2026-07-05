// Black Poppy Canon — Relationship Engine (Sprint 4.5 · APP-005)
// Part of the canon-data adapter layer (AD-006): views never touch
// relationship JSON or storage keys directly — everything flows
// through this service. Mock mode until Sprint 6.
//
// The Relationship is a first-class object:
//   { id, source, target, type, created, author, notes, version, status }
//
// Lookups are O(1): every load builds source→[] and target→[] indexes.
// Nothing is deleted — relationships archive.

import { root } from '../root/RootSystem.js';
import { mintId } from '../root/ids.js';

// The relationship repository is the storage path; this service is
// the engine on top of it (indexes, neighborhoods, colors). Views
// call the service; the service calls the repository (APP-007).
const repo = () => root.repo('relationship');
const MIGRATED_KEY = 'bpc-relationships-migrated';

export const RELATIONSHIP_TYPES = [
  'Belongs To', 'References', 'Inspired By', 'Continues',
  'Parent', 'Child', 'Related', 'Companion', 'Symbol', 'Product',
  'Visual Component', 'Engineering Decision', 'Sprint', 'Project',
  'Looking Glass Idea', 'Atelier Prototype',
];

// Relationship colors (APP-005): quiet, editorial, never neon.
const TYPE_COLORS = {
  'Belongs To': 'stone',
  'Inspired By': 'finch',
  'Project': 'dusty',
  'Symbol': 'pink',
  'Engineering Decision': 'slate',
  'Sprint': 'slate',
  'Looking Glass Idea': 'lavender',
  'Atelier Prototype': 'dusty',
};

export function typeColor(type) {
  return TYPE_COLORS[type] || 'stone';
}

/* ---------- normalization & persistence ---------- */

// Accept pre-4.5 rows ({from, to, type, label}) so old exports still read.
function normalize(rel, i = 0) {
  if (rel.id && rel.source) return rel;
  return {
    id: rel.id || `REL-LEGACY-${i + 1}`,
    source: rel.source ?? rel.from,
    target: rel.target ?? rel.to,
    type: rel.type === 'book' ? 'Belongs To' : rel.type === 'entry' ? 'References' : (rel.type || 'Related'),
    created: rel.created || '2026-07-03',
    author: rel.author || 'Zorya',
    notes: rel.notes || rel.label || '',
    version: rel.version || 1,
    status: rel.status || 'canon',
  };
}

async function persist(rel) {
  return repo().put(rel);
}

/* ---------- indexes: O(1) lookup by source and target ---------- */

export function buildIndexes(relationships) {
  const bySource = new Map();
  const byTarget = new Map();
  relationships.forEach((rel) => {
    if (!bySource.has(rel.source)) bySource.set(rel.source, []);
    bySource.get(rel.source).push(rel);
    if (!byTarget.has(rel.target)) byTarget.set(rel.target, []);
    byTarget.get(rel.target).push(rel);
  });
  return { bySource, byTarget };
}

let indexes = null;
let indexStamp = '';

async function ensureIndexes() {
  const rels = await listAll();
  // Rebuild only when the collection actually changed.
  const stamp = `${rels.length}·${rels[rels.length - 1]?.id || ''}`;
  if (!indexes || stamp !== indexStamp) {
    indexes = buildIndexes(rels);
    indexStamp = stamp;
  }
  return indexes;
}

if (typeof window !== 'undefined') {
  window.addEventListener('bpc:data-changed', () => { indexes = null; });
}

/* ---------- public surface ---------- */

export async function listAll() {
  const rels = await repo().all();
  return rels.map((r, i) => normalize(r, i));
}

// Everything touching an entry, sorted incoming/outgoing. O(1) via index.
export async function listForEntry(id) {
  const idx = await ensureIndexes();
  return {
    outgoing: (idx.bySource.get(id) || []).filter((r) => r.status !== 'archived'),
    incoming: (idx.byTarget.get(id) || []).filter((r) => r.status !== 'archived'),
  };
}

export async function createRelationship({ source, target, type, notes = '', author = 'Rachael Nike', sourceLabel = '', targetLabel = '' }) {
  await repo().all(); // ensure seed ids are observed so the counter never collides
  const rel = {
    id: mintId('relationship'), // permanent constitutional id: REL-000001
    source,
    target,
    type: RELATIONSHIP_TYPES.includes(type) ? type : 'Related',
    created: new Date().toISOString(),
    author,
    notes,
    // Friendly names for ids that have no canon page (worktable objects).
    sourceLabel,
    targetLabel,
    version: 1,
    status: 'canon',
  };
  return persist(rel);
}

// Archive, never delete.
export async function archiveRelationship(rel) {
  return persist({ ...rel, status: 'archived', version: (rel.version || 1) + 1 });
}

export async function recentRelationships(limit = 5) {
  const rels = (await listAll()).filter((r) => r.status !== 'archived');
  return rels
    .slice()
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, limit);
}

// One-degree neighborhood of an id (for graph and related search).
export async function neighbors(id) {
  const { outgoing, incoming } = await listForEntry(id);
  return [
    ...outgoing.map((r) => ({ id: r.target, rel: r, direction: 'out' })),
    ...incoming.map((r) => ({ id: r.source, rel: r, direction: 'in' })),
  ];
}

/* ---------- migration: embedded entry.relationships → objects ----------
   Pre-4.5 entries carried { type, targetId, label } inline. Harvest them
   once into first-class relationships; the entry keeps its field (its
   shape is the Sprint 6 migration test case and must not break). */

export async function migrateFromEntries(entries) {
  if (await repo().readLocalRaw(MIGRATED_KEY)) return;
  const existing = await listAll();
  const seen = new Set(existing.map((r) => `${r.source}→${r.target}·${r.type}`));

  for (const entry of entries) {
    for (let i = 0; i < (entry.relationships || []).length; i++) {
      const old = entry.relationships[i];
      const type = old.type === 'book' ? 'Belongs To'
        : old.type === 'entry' ? 'References'
        : old.type === 'symbol' ? 'Symbol'
        : old.type === 'companion' ? 'Companion'
        : old.type === 'product' ? 'Product'
        : old.type === 'visual' ? 'Visual Component'
        : old.type === 'project' ? 'Project'
        : 'Related';
      const key = `${entry.id}→${old.targetId}·${type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await repo().put({
        id: `REL-M-${entry.id}-${i}`,
        source: entry.id,
        target: old.targetId,
        type,
        created: entry.updated || entry.created,
        author: entry.author || '',
        notes: old.label || '',
        version: 1,
        status: 'canon',
      });
    }
  }

  await repo().writeLocalRaw(MIGRATED_KEY, true);
  indexes = null;
}
