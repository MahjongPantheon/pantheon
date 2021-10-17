import {getWinningUsers, hasYaku} from './mimirSelectors';
import {IAppState} from '../interfaces';
import {Yaku} from '#/interfaces/common';
import {
  filterAllowed,
  yakuGroups,
  yakumanGroups,
  yakuRareGroups
} from '#/primitives/yaku-lists';
import { memoize } from '#/primitives/memoize';
import {getAllowedYaku} from './yaku';

export const shouldShowTabs = (state: IAppState) => getWinningUsers(state).length > 1;

function _getYakuList(state: IAppState): {[id: number]: Yaku[][]} {
  if (!state.gameConfig) {
    return {};
  }

  const yakuList: { [key: number]: Yaku[][]} = {};
  for (let user of getWinningUsers(state)) {
    const simple = filterAllowed(yakuGroups, state.gameConfig.allowedYaku);
    const rare = filterAllowed(yakuRareGroups, state.gameConfig.allowedYaku);
    const yakuman = filterAllowed(yakumanGroups, state.gameConfig.allowedYaku);
    yakuList[user.id] = simple.concat(rare).concat(yakuman);
  }

  return yakuList;
}

export const getYakuList = memoize(_getYakuList);

type DisabledYakuList = {
  [id: number]: {
    [key: number]: boolean
  }
};

function _getDisabledYaku(state: IAppState): DisabledYakuList {
  const yakuList = getYakuList(state);
  const allowedYaku = getAllowedYaku(state);
  const users = getWinningUsers(state);

  return users.reduce((acc: DisabledYakuList, p) => {
    acc[p.id] = {};
    for (let yGroup of yakuList[p.id]) {
      for (let yaku of yGroup) {
        if (allowedYaku.indexOf(yaku.id) === -1 && !hasYaku(state, yaku.id)) {
          acc[p.id][yaku.id] = true;
        }
      }
    }
    return acc;
  }, {} as DisabledYakuList);
}

export const getDisabledYaku = memoize(_getDisabledYaku);
