// Black Poppy Canon — Root System · Storage Providers (APP-007)
// The application must never depend directly on storage technology.
// A provider answers two questions: what is shipped (immutable seed
// JSON) and what has been written locally (mutable records). Swap
// the provider — Mock JSON today, Google Sheets / Supabase / SQLite
// tomorrow — and no view, service, or repository changes.
//
// Interface (all async):
//   readSeed(seedName)  -> array of shipped records (read-only)
//   readLocal(key)      -> stored value, or null
//   writeLocal(key, v)  -> boolean success

import { storage } from '../services/storage.js';

// ---- Version 1: Mock JSON over the safe localStorage wrapper ----
export class MockJsonStorage {
  constructor() {
    this.name = 'mock-json';
    this._seedCache = {};
  }

  async readSeed(seedName) {
    if (this._seedCache[seedName]) return this._seedCache[seedName];
    try {
      const res = await fetch(new URL(`../data/${seedName}.json`, import.meta.url));
      this._seedCache[seedName] = res.ok ? await res.json() : [];
    } catch {
      this._seedCache[seedName] = [];
    }
    return this._seedCache[seedName];
  }

  async readLocal(key) {
    return storage.get(key, null);
  }

  async writeLocal(key, value) {
    return storage.set(key, value);
  }
}

// ---- In-memory provider: for tests and to prove swappability ----
// Same contract, nothing persisted. Seeds are supplied up front.
export class MemoryStorage {
  constructor({ seeds = {}, local = {} } = {}) {
    this.name = 'memory';
    this._seeds = seeds;
    this._local = { ...local };
  }

  async readSeed(seedName) {
    return this._seeds[seedName] || [];
  }

  async readLocal(key) {
    return key in this._local ? this._local[key] : null;
  }

  async writeLocal(key, value) {
    this._local[key] = value;
    return true;
  }
}
