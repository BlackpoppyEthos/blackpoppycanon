// Black Poppy Canon — companions service
// The living (and remembered) companions of the Black Poppy Universe.
// Stories here are true or absent — never invented.

export const companions = [
  {
    id: 'alice',
    name: 'Alice',
    kind: 'English Mastiff',
    note: 'Arrived after Trent crossed. Watched over, always — Trent is her guardian.',
    symbol: 'paw',
  },
  {
    id: 'turtle',
    name: 'Turtle',
    kind: 'Brindle English Mastiff',
    note: 'The face of the Turtle Oracle. A dog-shaped constellation in sage green stars.',
    symbol: 'paw',
  },
  {
    id: 'trent',
    name: 'Trent',
    kind: 'Belgian Tervuren',
    note: 'Named for a spirit twin. Crossed March 10, 2022. His number is 11:11.',
    symbol: 'star',
  },
  {
    id: 'sebastian',
    name: 'Sebastian',
    kind: 'English Mastiff',
    note: 'The first Mastiff. A service animal, a steady heart.',
    symbol: 'paw',
  },
  {
    id: 'buffalo',
    name: 'Buffalo',
    kind: 'Companion',
    note: 'Story not yet written. Every companion earns a true telling.',
    symbol: 'star',
  },
  {
    id: 'finch',
    name: 'Finch',
    kind: 'Companion',
    note: 'Story not yet written — but a color already carries the name.',
    symbol: 'star',
  },
];

// Spotlight: Alice first (per spec), then rotate daily.
export function spotlightCompanion() {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const alice = companions.findIndex((c) => c.id === 'alice');
  const index = (alice + daysSinceEpoch) % companions.length;
  return companions[index === -1 ? 0 : index];
}
