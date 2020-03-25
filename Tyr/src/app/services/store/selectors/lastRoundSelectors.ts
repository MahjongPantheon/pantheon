import { IAppState } from "../interfaces";
import { YakuId, yakuMap } from "../../../primitives/yaku";

export function getOutcomeName(state: IAppState) {
  switch (state.lastRoundOverview.outcome) {
    case 'ron': return this.i18n._t('Ron');
    case 'tsumo': return this.i18n._t('Tsumo');
    case 'draw': return this.i18n._t('Exhaustive draw');
    case 'abort': return this.i18n._t('Abortive draw');
    case 'chombo': return this.i18n._t('Chombo');
    case 'nagashi': return this.i18n._t('Nagashi mangan');
    case 'multiron': return (state.lastRoundOverview.winner.length === 2
        ? this.i18n._t('Double ron')
        : this.i18n._t('Triple ron')
    );
  }
}

export function getWins(state: IAppState): Array<{ winner: string, han: number, fu: number, dora: number, yakuList: string }> {
  switch (state.lastRoundOverview.outcome) {
    case 'ron':
    case 'tsumo':
      return [{
        winner: _getPlayerName(state, state.lastRoundOverview.winner),
        yakuList: _getYakuList(state.lastRoundOverview.yaku),
        han: state.lastRoundOverview.han,
        fu: state.lastRoundOverview.fu,
        dora: state.lastRoundOverview.dora
      }];
    case 'multiron':
      let wins = [];
      for (let idx in state.lastRoundOverview.winner) {
        wins.push({
          winner: _getPlayerName(state, state.lastRoundOverview.winner[idx]),
          yakuList: _getYakuList(state.lastRoundOverview.yaku[idx]),
          han: state.lastRoundOverview.han[idx],
          fu: state.lastRoundOverview.fu[idx],
          dora: state.lastRoundOverview.dora[idx]
        });
      }
      return wins;
  }
}

function _getYakuList(str: string) {
  const yakuIds: YakuId[] = str.split(',').map((y) => parseInt(y, 10));
  const yakuNames: string[] = yakuIds.map((y) => yakuMap[y].name(this.i18n).toLowerCase());
  return yakuNames.join(', ');
}

function _getPlayerName(state: IAppState, playerId: number): string {
  for (let i in state.players) {
    if (!state.players.hasOwnProperty(i)) {
      continue;
    }
    if (state.players[i].id == playerId) {
      return state.players[i].displayName;
    }
  }
  return '';
}
