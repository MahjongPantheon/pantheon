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

import { getWinningUsers, hasYaku } from './mimirSelectors';
import { IAppState } from '../interfaces';
import { Yaku } from '../../interfaces/common';
import {
  filterAllowed,
  yakuGroups,
  yakumanGroups,
  yakuRareGroups,
} from '../../primitives/yaku-lists';
import { memoize } from '../../primitives/memoize';
import { getAllowedYaku } from './yaku';

function _getYakuList(state: IAppState): { [id: number]: Yaku[][] } {
  if (!state.gameConfig) {
    return {};
  }

  const yakuList: { [key: number]: Yaku[][] } = {};
  for (const user of getWinningUsers(state)) {
    const simple = filterAllowed(yakuGroups, state.gameConfig.rulesetConfig.allowedYaku);
    const rare = filterAllowed(yakuRareGroups, state.gameConfig.rulesetConfig.allowedYaku);
    const yakuman = filterAllowed(yakumanGroups, state.gameConfig.rulesetConfig.allowedYaku);
    yakuList[user.id] = simple.concat(rare).concat(yakuman);
  }

  return yakuList;
}

export const getYakuList = memoize(_getYakuList);

type DisabledYakuList = {
  [id: number]: {
    [key: number]: boolean;
  };
};

function _getDisabledYaku(state: IAppState): DisabledYakuList {
  const yakuList = getYakuList(state);
  const allowedYaku = getAllowedYaku(state);
  const users = getWinningUsers(state);

  return users.reduce((acc: DisabledYakuList, p) => {
    acc[p.id] = {};
    for (const yGroup of yakuList[p.id]) {
      for (const yaku of yGroup) {
        if (!allowedYaku.includes(yaku.id) && !hasYaku(state, yaku.id)) {
          acc[p.id][yaku.id] = true;
        }
      }
    }
    return acc;
  }, {} as DisabledYakuList);
}

export const getDisabledYaku = memoize(_getDisabledYaku);
