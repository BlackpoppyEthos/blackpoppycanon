// Black Poppy Canon — Root System · Schema (APP-007, Principle Three)
// The universal Object envelope. Everything is an Object; every
// object carries the same core metadata. New generic objects are
// built here. Established typed records (Entry, Relationship,
// Worktable) keep their locked shapes — the Entry shape is the
// Sprint 6 migration contract and must never break — and are read
// through a light adapter (universalView) so cross-cutting features
// (search, print) see one shape without rewriting stored data.

import { mintId } from './ids.js';

// Every kind of thing the Canon can hold (Principle One).
export const OBJECT_TYPES = [
  'book', 'entry', 'symbol', 'companion', 'project', 'product',
  'package', 'component', 'asset', 'worktable', 'object', 'relationship',
];

// The one lifecycle (Principle Five). Nothing skips stages.
export const LIFECYCLE = ['looking-glass', 'atelier', 'canon', 'archived'];

export function nextStage(status) {
  const i = LIFECYCLE.indexOf(status);
  return i >= 0 && i < LIFECYCLE.length - 1 ? LIFECYCLE[i + 1] : status;
}

const nowISO = () => new Date().toISOString();

export function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'untitled';
}

// Build a brand-new universal object (Principle Three schema).
export function makeObject(type, partial = {}) {
  const stamp = nowISO();
  return {
    id: partial.id || mintId(type),
    type,
    title: partial.title || 'Untitled',
    slug: partial.slug || slugify(partial.title || 'untitled'),
    description: partial.description || '',
    status: partial.status || 'atelier',
    version: partial.version || '1.0.0',
    created: partial.created || stamp,
    modified: partial.modified || stamp,
    author: partial.author || 'Rachael Nike',
    owner: partial.owner || 'Rachael Nike',
    tags: partial.tags || [],
    relationships: partial.relationships || [], // ids only; the objects live in the relationship repo
    metadata: partial.metadata || {},
    content: partial.content || {},
    assets: partial.assets || [],
    history: partial.history || [{ version: '1.0.0', timestamp: stamp, summary: 'Created.', author: partial.author || 'Rachael Nike' }],
    visibility: partial.visibility || 'private',
    favorite: partial.favorite || false,
    archived: partial.archived || false,
  };
}

// Non-destructively fill any missing core fields on an object.
export function ensureCore(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (!obj.slug && obj.title) obj.slug = slugify(obj.title);
  if (obj.favorite === undefined) obj.favorite = false;
  if (obj.archived === undefined) obj.archived = obj.status === 'archived';
  return obj;
}

// A universal read-only view over any typed record, so search and
// print can treat everything the same without mutating storage.
export function universalView(record, type) {
  if (!record) return null;
  const t = type || record.type || 'object';
  return {
    id: record.id,
    type: t,
    title: record.title || record.name || '',
    slug: record.slug || slugify(record.title || record.name || ''),
    description: record.description || record.note || record.notes || '',
    status: record.status || 'canon',
    version: record.version || '1.0.0',
    created: record.created || null,
    modified: record.modified || record.updated || record.created || null,
    author: record.author || '',
    tags: record.tags || [],
    // The searchable text of any object (Principle Eight).
    text: [
      record.title, record.name, record.description, record.note, record.notes,
      record.body, (record.tags || []).join(' '),
    ].filter(Boolean).join(' ').toLowerCase(),
    raw: record,
  };
}

// A single object's validity against the Constitution (best effort).
export function validate(obj) {
  const problems = [];
  if (!obj.id) problems.push('missing id');
  if (!obj.type) problems.push('missing type');
  if (obj.status && !LIFECYCLE.includes(obj.status)) problems.push(`unknown status "${obj.status}"`);
  return { ok: problems.length === 0, problems };
}
