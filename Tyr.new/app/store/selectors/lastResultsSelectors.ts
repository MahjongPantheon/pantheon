import { IAppState } from '../interfaces';
import { memoize } from '#/primitives/memoize';
import { LUserWithScore } from '#/interfaces/local';

function _getSeating(state: IAppState, playersList: LUserWithScore[]) {
  let players: LUserWithScore[] = (<LUserWithScore[]>[]).concat(playersList);

  let roundOffset = 0;
  for (; roundOffset < 4; roundOffset++) {
    if (players[0].id === state.currentPlayerId) {
      break;
    }

    players = players.slice(1).concat(players[0]);
  }

  return players;
}

const getSeating = memoize(_getSeating);

export const getSelf = (s: IAppState, o: LUserWithScore[]) => getSeating(s, o)[0];
export const getShimocha = (s: IAppState, o: LUserWithScore[]) => getSeating(s, o)[1];
export const getToimen = (s: IAppState, o: LUserWithScore[]) => getSeating(s, o)[2];
export const getKamicha = (s: IAppState, o: LUserWithScore[]) => getSeating(s, o)[3];
