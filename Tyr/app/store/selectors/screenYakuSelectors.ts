import { getWinningUsers, hasYaku } from './mimirSelectors';
import { IAppState } from '../interfaces';
import { Yaku } from '#/interfaces/common';
import { filterAllowed, yakuGroups, yakumanGroups, yakuRareGroups } from '#/primitives/yaku-lists';
import { memoize } from '#/primitives/memoize';
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
