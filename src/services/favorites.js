// Black Poppy Canon — favorites service
// Favorite Books rise to the top of the shelf. Persist locally.

import { storage } from './storage.js';

const KEY = 'bpc-favorites';

export function getFavorites() {
  return new Set(storage.get(KEY, []));
}

export function isFavorite(id) {
  return getFavorites().has(id);
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  favs.has(id) ? favs.delete(id) : favs.add(id);
  storage.set(KEY, [...favs]);
  return favs.has(id);
}
