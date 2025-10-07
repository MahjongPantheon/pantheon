import { PersonEx } from 'tsclients/proto/atoms.pb';

export function substituteReplacements(players: PersonEx[], replacements: Map<number, PersonEx>) {
  return players.map((p) => {
    if (replacements.has(p.id)) {
      return replacements.get(p.id)!;
    }
    return p;
  });
}
