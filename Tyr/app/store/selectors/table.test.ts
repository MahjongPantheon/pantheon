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

import { getArrows, getOtherTablePlayerData, getPlayerData } from './table';
import { IAppState } from '../interfaces';
import { PlayerInSession } from 'tsclients/proto/atoms.pb';
import { PlayerSide } from '../../components/base/ResultArrows/ResultArrowsProps';

function makePlayer(id: number): PlayerInSession {
  return {
    id,
    title: `Player ${id}`,
    score: 30000,
    ratingDelta: 0,
    hasAvatar: false,
    lastUpdate: '',
    yakitori: false,
  };
}

const fourPlayers = [makePlayer(1), makePlayer(2), makePlayer(3), makePlayer(4)];
const threePlayers = [makePlayer(1), makePlayer(2), makePlayer(3)];

function makeState(overrides: Partial<IAppState>): IAppState {
  return {
    currentPlayerId: 1,
    sessionState: { roundIndex: 1, chombo: [] } as unknown as IAppState['sessionState'],
    ...overrides,
  } as unknown as IAppState;
}

describe('table selectors / sanma support', () => {
  describe('getPlayerData', () => {
    it('maps all four seats for a regular 4-player game, including "n" wind', () => {
      const state = makeState({ players: fourPlayers });

      expect(getPlayerData('self', state)?.id).toBe(1);
      expect(getPlayerData('shimocha', state)?.id).toBe(2);
      expect(getPlayerData('toimen', state)?.id).toBe(3);
      expect(getPlayerData('kamicha', state)?.id).toBe(4);

      expect(getPlayerData('self', state)?.currentWind).toBe('e');
      expect(getPlayerData('shimocha', state)?.currentWind).toBe('s');
      expect(getPlayerData('toimen', state)?.currentWind).toBe('w');
      expect(getPlayerData('kamicha', state)?.currentWind).toBe('n');
    });

    it('maps only three seats for sanma, with "toimen" empty and never returns "n" wind', () => {
      const state = makeState({ players: threePlayers });

      expect(getPlayerData('self', state)?.id).toBe(1);
      expect(getPlayerData('shimocha', state)?.id).toBe(2);
      expect(getPlayerData('kamicha', state)?.id).toBe(3);
      expect(getPlayerData('toimen', state)).toBeNull();

      expect(getPlayerData('self', state)?.currentWind).toBe('e');
      expect(getPlayerData('shimocha', state)?.currentWind).toBe('s');
      expect(getPlayerData('kamicha', state)?.currentWind).toBe('w');
    });

    it('rotates seats based on currentPlayerId for sanma', () => {
      const state = makeState({ players: threePlayers, currentPlayerId: 2 });

      expect(getPlayerData('self', state)?.id).toBe(2);
      expect(getPlayerData('shimocha', state)?.id).toBe(3);
      expect(getPlayerData('kamicha', state)?.id).toBe(1);
      expect(getPlayerData('toimen', state)).toBeNull();
    });
  });

  describe('getOtherTablePlayerData', () => {
    it('maps three seats for a sanma other-table view', () => {
      const state = makeState({
        players: undefined,
        currentOtherTablePlayers: threePlayers,
        currentOtherTable: {
          state: { roundIndex: 1, chombo: [] },
        } as unknown as IAppState['currentOtherTable'],
        overviewViewShift: 0,
      });

      expect(getOtherTablePlayerData('self', state)?.id).toBe(1);
      expect(getOtherTablePlayerData('shimocha', state)?.id).toBe(2);
      expect(getOtherTablePlayerData('kamicha', state)?.id).toBe(3);
      expect(getOtherTablePlayerData('toimen', state)).toBeNull();
    });

    it('handles negative rotation shift for sanma (counterclockwise)', () => {
      const state = makeState({
        players: undefined,
        currentOtherTablePlayers: threePlayers,
        currentOtherTable: {
          state: { roundIndex: 1, chombo: [] },
        } as unknown as IAppState['currentOtherTable'],
        overviewViewShift: -1,
      });

      // shifting by -1 in a 3-player table is equivalent to shifting by +2
      expect(getOtherTablePlayerData('self', state)?.id).toBe(3);
      expect(getOtherTablePlayerData('shimocha', state)?.id).toBe(1);
      expect(getOtherTablePlayerData('kamicha', state)?.id).toBe(2);
    });
  });

  describe('getArrows', () => {
    it('places the two other players on left/right and never assigns "top" for sanma', () => {
      const state = makeState({
        players: threePlayers,
        currentScreen: 'confirmation',
        loading: { overview: false } as IAppState['loading'],
        changesOverview: {
          payments: {
            direct: [{ from: 2, to: 1, amount: 1000 }],
            riichi: [],
            honba: [],
          },
        } as unknown as IAppState['changesOverview'],
      });

      const { arrows } = getArrows(state);
      expect(arrows).toHaveLength(1);
      expect(arrows[0].start).toBe(PlayerSide.RIGHT);
      expect(arrows[0].end).toBe(PlayerSide.BOTTOM);
    });
  });
});
