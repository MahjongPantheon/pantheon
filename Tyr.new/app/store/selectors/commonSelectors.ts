import { I18nService } from '#/services/i18n';
import { AppOutcome } from '#/interfaces/app';
import { Player } from '#/interfaces/common';
import { memoize } from '#/primitives/memoize';
import { IAppState } from '../interfaces';

export function getOutcomeName(i18n: I18nService, outcome: AppOutcome['selectedOutcome'], winnersCount = 0, noMultiRon = false) {
  switch (outcome) {
    case 'ron': return i18n._t('Ron');
    case 'tsumo': return i18n._t('Tsumo');
    case 'draw': return i18n._t('Exhaustive draw');
    case 'abort': return i18n._t('Abortive draw');
    case 'chombo': return i18n._t('Chombo');
    case 'nagashi': return i18n._t('Nagashi mangan');
    case 'multiron': return noMultiRon
      ? i18n._t('Ron')
      : (winnersCount === 2
          ? i18n._t('Double ron')
          : i18n._t('Triple ron')
      );
  }
}

function _getSeating(
  round: number,
  overviewShift: number,
  currentPlayerId: number,
  playersList: Player[],
  riichiBets?: string[],
  penaltyFor?: number,
  paoPlayer?: number
) {
  let players: Player[] = (<Player[]>[]).concat(playersList);

  let seating = ['東', '南', '西', '北'];
  for (let i = 1; i < round; i++) {
    seating = [seating.pop()!].concat(seating);
  }

  let roundOffset = 0;
  for (; roundOffset < 4 + (overviewShift || 0); roundOffset++) {
    if (players[0].id === currentPlayerId) {
      break;
    }

    players = players.slice(1).concat(players[0]);
    seating = seating.slice(1).concat(seating[0]);
  }

  // Riichi bets
  let riichi = [ false, false, false, false ];
  const riichiIds = (riichiBets || []).map((id: string) => parseInt(id, 10)); // TODO: get it out to formatters
  players.forEach((p, idx) => {
    riichi[idx] = riichiIds.includes(p.id);
  });

  // Chombo penalties
  let chombo = [ false, false, false, false ];
  players.forEach((p, idx) => {
    chombo[idx] = penaltyFor === p.id;
  });

  // Pao
  let pao = [ false, false, false, false ];
  players.forEach((p, idx) => {
    pao[idx] = paoPlayer === p.id;
  });

  return { players, seating, roundOffset, riichi, chombo, pao };
}

export const getSeating: typeof _getSeating = memoize(_getSeating);

function _getScores(s: IAppState, o: Player[]) {
  if (!s.currentPlayerId || !s.gameConfig) {
    return;
  }

  // For other tables preview
  let round = s.currentRound;
  if (!o.map((p) => p.id).includes(s.currentPlayerId) && s.currentOtherTable) {
    round = s.currentOtherTable.currentRound;
  }

  const seating: Player[] = getSeating(round, s.overviewViewShift || 0, s.currentPlayerId, o).players;
  const scores: string[] = [];
  const chombos: string[] = [];
  const seq = { 'self': 0, 'shimocha': 1, 'toimen': 2, 'kamicha': 3 };
  for (let p of seating) {
    const scoreNum = s.overviewDiffBy ? p.score - seating[seq[s.overviewDiffBy]].score : p.score;
    const score = (s.overviewDiffBy && scoreNum > 0
      ? '+' + scoreNum.toString()
      : scoreNum.toString());
    scores.push(score);
    chombos.push((Math.abs((p.penalties || 0 ) / s.gameConfig.chomboPenalty) || '').toString());
  }

  return { scores, chombos };
}

export const getScores: typeof _getScores = memoize(_getScores);
