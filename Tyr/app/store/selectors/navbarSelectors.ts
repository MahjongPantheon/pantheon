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

import { IAppState } from '../interfaces';
import { yakumanInYaku } from './yaku';
import { getHan } from './hanFu';
import { getLosingUsers, getWinningUsers } from './mimirSelectors';

export function doraOptions(state: IAppState) {
  if (yakumanInYaku(state)) {
    return [0];
  }

  if (state.gameConfig?.rulesetTitle === 'jpmlA') {
    // TODO: make withUradora/withKandora config items and use them, not title!
    return [0, 1, 2, 3, 4];
  }

  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
}

export function han(state: IAppState): number {
  return getHan(state);
}

export function mayGoNextFromYakuSelect(state: IAppState) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'TSUMO':
      return getHan(state) != 0;
    case 'RON':
      const out = state.currentOutcome;
      return getWinningUsers(state).reduce((acc, user) => acc && out.wins[user.id].han != 0, true);
    default:
      return undefined;
  }
}

export function mayGoNextFromPlayersSelect(state: IAppState) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'TSUMO':
      return getWinningUsers(state).length === 1;
    case 'DRAW':
    case 'ABORT':
    case 'NAGASHI':
      return true;
    case 'RON':
      return getWinningUsers(state).length >= 1 && getLosingUsers(state).length === 1;
    case 'CHOMBO':
      return getLosingUsers(state).length === 1;
    default:
      return undefined;
  }
}
