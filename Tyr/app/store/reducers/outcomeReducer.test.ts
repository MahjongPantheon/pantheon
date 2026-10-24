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

function makeState(outcome: RoundOutcome, roundIndex = 2): IAppState {
  return {
    players: threePlayers,
    currentOutcome: initBlankOutcome(roundIndex, outcome),
  } as unknown as IAppState;
}

// Dealer order must match the server's East, South, West seating.
describe('outcomeReducer / sanma dealer-dependent outcomes', () => {
  it('keeps the selected loser for a chombo in a 3-player game (round 2)', () => {
    const next = outcomeReducer(makeState(RoundOutcome.ROUND_OUTCOME_CHOMBO), {
      type: TOGGLE_LOSER,
      payload: 35,
    });
    expect(next.currentOutcome?.selectedOutcome).toBe(RoundOutcome.ROUND_OUTCOME_CHOMBO);
    // @ts-expect-error narrowed at runtime
    expect(next.currentOutcome?.loser).toBe(35);
    // @ts-expect-error narrowed at runtime
    expect(next.currentOutcome?.loserIsDealer).toBe(false);
  });

  it('marks the rotated dealer as loser-is-dealer in a 3-player game (round 2)', () => {
    const next = outcomeReducer(makeState(RoundOutcome.ROUND_OUTCOME_CHOMBO), {
      type: TOGGLE_LOSER,
      payload: 36, // round-2 dealer = South
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
