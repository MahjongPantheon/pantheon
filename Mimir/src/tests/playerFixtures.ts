import { PersonEx } from 'tsclients/proto/atoms.pb.js';

export function makePlayer(id: number): PersonEx {
  return { ...PersonEx.decode(new Uint8Array()), id, title: `Player ${id}` };
}
