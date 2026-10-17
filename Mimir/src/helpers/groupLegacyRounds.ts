/** Fields identifying a single multiron in the v1 round-per-winner schema. */
type LegacyRound = {
  session_id: number;
  round: number;
  honba?: number;
  last_session_state?: unknown;
  loser_id: number | null;
  multi_ron: number | null;
};

/** v1 has no honba column: its counter lives in the serialized pre-round state. */
export function getLegacyHonba(round: Pick<LegacyRound, 'honba' | 'last_session_state'>): number {
  const state =
    typeof round.last_session_state === 'string'
      ? JSON.parse(round.last_session_state)
      : round.last_session_state;
  const honba = round.honba ?? (state as { _honba?: number } | null)?._honba ?? 0;
  if (!Number.isSafeInteger(honba) || honba < 0) throw new Error('Invalid legacy honba counter');
  return honba;
}

/** Input must be ordered by session_id, id, as in the v1 importer. */
export function groupLegacyRounds<T extends LegacyRound>(rounds: T[]): T[][] {
  const groups: T[][] = [];
  for (const round of rounds) {
    const previousGroup = groups[groups.length - 1];
    const previous = previousGroup?.[0];
    if (
      round.multi_ron !== null &&
      round.multi_ron > 1 &&
      previous?.multi_ron === round.multi_ron &&
      previousGroup.length < round.multi_ron &&
      previous.session_id === round.session_id &&
      previous.round === round.round &&
      getLegacyHonba(previous) === getLegacyHonba(round) &&
      previous.loser_id === round.loser_id
    ) {
      previousGroup.push(round);
    } else {
      groups.push([round]);
    }
  }
  return groups;
}
