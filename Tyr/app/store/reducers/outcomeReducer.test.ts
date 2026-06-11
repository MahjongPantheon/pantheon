/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { outcomeReducer } from './outcomeReducer';
import { initBlankOutcome } from '../state';
import { IAppState } from '../interfaces';
import { PlayerInSession, RoundOutcome } from 'tsclients/proto/atoms.pb';
import { TOGGLE_LOSER, TOGGLE_WINNER } from '../actions/interfaces';

function makePlayer(id: number): PlayerInSession {
  return {
    id,
    title: `Player ${id}`,
    score: 35000,
    ratingDelta: 0,
    hasAvatar: false,
    lastUpdate: '',
    yakitori: false,
  };
}

// Sanma: the ghost seat is already filtered out, so state.players has 3 entries.
const threePlayers = [makePlayer(2), makePlayer(36), makePlayer(35)];

// Round 2+ is required to reproduce the bug: getDealerId rotates the players
// array once per round past the first, so only from round 2 does the
// (previously hardcoded) undefined 4th seat rotate into index 0 and crash.
function makeState(outcome: RoundOutcome, roundIndex = 2): IAppState {
  return {
    players: threePlayers,
    currentOutcome: initBlankOutcome(roundIndex, outcome),
  } as unknown as IAppState;
}

// Regression: dealer-dependent outcomes (ron/tsumo/chombo) call getDealerId,
// which used to index a hardcoded 4th seat. In sanma there is no 4th real
// player, so on round 2+ that access was undefined and the reducer threw — the
// selection would "blink" and never stay. These outcomes must work with 3
// players. (On round 2 the rotated dealer is the third seat, player 35.)
describe('outcomeReducer / sanma dealer-dependent outcomes', () => {
  it('keeps the selected loser for a chombo in a 3-player game (round 2)', () => {
    const next = outcomeReducer(makeState(RoundOutcome.ROUND_OUTCOME_CHOMBO), {
      type: TOGGLE_LOSER,
      payload: 36,
    });
    expect(next.currentOutcome?.selectedOutcome).toBe(RoundOutcome.ROUND_OUTCOME_CHOMBO);
    // @ts-expect-error narrowed at runtime
    expect(next.currentOutcome?.loser).toBe(36);
    // @ts-expect-error narrowed at runtime
    expect(next.currentOutcome?.loserIsDealer).toBe(false);
  });

  it('marks the rotated dealer as loser-is-dealer in a 3-player game (round 2)', () => {
    const next = outcomeReducer(makeState(RoundOutcome.ROUND_OUTCOME_CHOMBO), {
      type: TOGGLE_LOSER,
      payload: 35, // round-2 dealer = third seat
    });
    // @ts-expect-error narrowed at runtime
    expect(next.currentOutcome?.loserIsDealer).toBe(true);
  });

  it('keeps the selected winner for a tsumo in a 3-player game (round 2)', () => {
    const next = outcomeReducer(makeState(RoundOutcome.ROUND_OUTCOME_TSUMO), {
      type: TOGGLE_WINNER,
      payload: 36,
    });
    // @ts-expect-error narrowed at runtime
    expect(next.currentOutcome?.winner).toBe(36);
  });
});
