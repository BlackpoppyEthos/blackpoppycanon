// Black Poppy Canon — The Root System (APP-007)
// The single source of truth for all application data. It holds one
// storage provider and one repository per object type, and it is the
// only place the storage technology is named. Swap the provider here
// (setStorage) and the entire application follows — no view, service,
// or repository edit required. Storage is replaceable; the Object
// Model is not.
//
//   View → Service → Repository → Storage
//                    └────────────┘  (this module wires these two)

import { Repository } from './Repository.js';
import { MockJsonStorage } from './storage.js';
import { universalView } from './schema.js';

// Collection wiring: type → where its seeds and local records live.
// Keys preserved exactly so existing local data keeps loading.
const COLLECTIONS = {
  book:         { seedName: 'books',         localKey: null },
  entry:        { seedName: 'entries',       localKey: 'bpc-canon-entries' },
  symbol:       { seedName: 'symbols',       localKey: null },
  relationship: { seedName: 'relationships', localKey: 'bpc-relationships' },
  worktable:    { seedName: null,            localKey: 'bpc-worktables' },
};

class RootSystem {
  constructor(storage) {
    this.storage = storage;
    this._repos = {};
    this._emit = (type) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bpc:data-changed', { detail: { type } }));
      }
    };
    for (const [type, cfg] of Object.entries(COLLECTIONS)) {
      this._repos[type] = new Repository({
        type,
        seedName: cfg.seedName,
        localKey: cfg.localKey,
        storage,
        onChange: this._emit,
      });
    }
  }

  repo(type) {
    const r = this._repos[type];
    if (!r) throw new Error(`Root System: no repository for type "${type}"`);
    return r;
  }

  // Swap the storage technology beneath the whole application.
  setStorage(provider) {
    this.storage = provider;
    Object.values(this._repos).forEach((r) => r.setStorage(provider));
    this._emit('*');
    return this;
  }

  storageName() {
    return this.storage?.name || 'unknown';
  }

  // Everything searches (Principle Eight). One index across every
  // object the Canon holds: title, description, tags, metadata.
  async searchAll(query, { types } = {}) {
    const q = String(query || '').trim().toLowerCase();
    const wanted = types || Object.keys(COLLECTIONS);
    const out = [];
    for (const type of wanted) {
      const records = await this.repo(type).all();
      for (const r of records) {
        const view = universalView(r, type);
        if (!q || view.text.includes(q)) out.push(view);
      }
    }
    return out;
  }
}

// The one instance the application shares.
export const root = new RootSystem(new MockJsonStorage());

export { RootSystem };
