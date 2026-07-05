// Black Poppy Canon — Root System · Repository (APP-007)
// The layer between services and storage. A repository owns one
// collection of objects of a single type. It merges shipped seed
// records with locally written ones (local wins by permanent id),
// and it is the only thing that ever speaks to a storage provider.
//
//   View → Service → Repository → Storage
//
// Repositories never know which storage technology sits beneath
// them; they hold a provider and ask it the two questions.

import { observeId } from './ids.js';

export class Repository {
  // localKey: the storage key for written records ({ [id]: record }).
  //           null for seed-only collections (Books, Symbols).
  // seedName: the shipped JSON basename, or null for local-only
  //           collections (Worktables).
  constructor({ type, localKey = null, seedName = null, storage, onChange }) {
    this.type = type;
    this.localKey = localKey;
    this.seedName = seedName;
    this.storage = storage;
    this.onChange = onChange || (() => {});
    this._seedCache = null;
  }

  setStorage(provider) {
    this.storage = provider;
    this._seedCache = null;
  }

  async _seeds() {
    if (this.seedName === null) return [];
    if (this._seedCache) return this._seedCache;
    const seeds = await this.storage.readSeed(this.seedName);
    seeds.forEach((r) => observeId(r.id));
    this._seedCache = seeds;
    return seeds;
  }

  async _localMap() {
    if (this.localKey === null) return {};
    return (await this.storage.readLocal(this.localKey)) || {};
  }

  async _writeLocal(map) {
    if (this.localKey === null) return false;
    return this.storage.writeLocal(this.localKey, map);
  }

  // All records: seeds first, then local overrides by id.
  async all() {
    const merged = new Map();
    (await this._seeds()).forEach((r) => merged.set(r.id, r));
    Object.values(await this._localMap()).forEach((r) => merged.set(r.id, r));
    return [...merged.values()];
  }

  async get(id) {
    const local = await this._localMap();
    if (local[id]) return local[id];
    return (await this._seeds()).find((r) => r.id === id) || null;
  }

  async find(predicate) {
    return (await this.all()).filter(predicate);
  }

  // Write (create or overwrite) a record locally. Nothing is
  // destroyed: a seed record is shadowed by its local copy, never
  // erased. Emits a change so the shell can re-hydrate.
  async put(record) {
    observeId(record.id);
    const map = await this._localMap();
    map[record.id] = record;
    await this._writeLocal(map);
    this.onChange(this.type, record);
    return record;
  }

  // Remove a locally-written record (used for worktable structures;
  // canon objects archive rather than delete).
  async remove(id) {
    const map = await this._localMap();
    if (id in map) {
      delete map[id];
      await this._writeLocal(map);
      this.onChange(this.type, null);
    }
  }

  // A raw local read/write escape hatch for services that keep their
  // own record shape (e.g. relationship map, migration flags).
  async readLocalRaw(key) {
    return this.storage.readLocal(key);
  }

  async writeLocalRaw(key, value) {
    return this.storage.writeLocal(key, value);
  }
}
