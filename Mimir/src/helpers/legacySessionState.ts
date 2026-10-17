/** Preserve the original seating; JavaScript sorts numeric score-map keys by ID. */
export function getLegacyPlayerIds(
  state: { _playerIds?: number[]; _scores?: Record<number, unknown> },
  seating?: number[]
): number[] {
  return [...(state._playerIds ?? seating ?? Object.keys(state._scores ?? {}).map(Number))];
}
