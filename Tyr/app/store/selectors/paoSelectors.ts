import {IAppState} from '#/store/interfaces';
import {playerHasYakuWithPao} from '#/store/util';

export function getFirstWinnerWithPao(state: IAppState): number | undefined {
  return getNextWinnerWithPao(state, undefined)
}

export function getNextWinnerWithPao(state: IAppState, currentPlayerId: number | undefined): number | undefined {
  const gameConfig = state.gameConfig
  if (!gameConfig || state.currentScreen !== 'paoSelect' || state.currentOutcome?.selectedOutcome !== 'ron') {
    return undefined;
  }

  const allWinners = state.currentOutcome.wins;
  const winsIds = Object.keys(allWinners);

  if (winsIds.length === 1) {
    return undefined;
  }

  let currentWinnerIndex = -1;
  let nextPaoWinnerId = -1;
  let index = 0;

  if (currentPlayerId) {
    for(; index < winsIds.length && currentWinnerIndex === -1; index++) {
      const id = parseInt(winsIds[index].toString(), 10);
      if (id === currentPlayerId) {
        currentWinnerIndex = index;
      }
    }
  }

  for(; index < winsIds.length && nextPaoWinnerId === -1; index++) {
    const id = parseInt(winsIds[index].toString(), 10);
    const winner = allWinners[winsIds[index]];
    if (playerHasYakuWithPao(winner.yaku, gameConfig)) {
      nextPaoWinnerId = id;
    }
  }

  return nextPaoWinnerId !== -1 ? nextPaoWinnerId : undefined;
}
