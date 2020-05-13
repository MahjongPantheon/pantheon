import { IAppState } from '../interfaces';
import { memoize } from '../../../helpers/memoize';
import { Player } from '../../../interfaces/common';

function _getSeating(state: IAppState, playersList: Player[]) {
  let players: Player[] = [].concat(playersList);
  let seating = ['東', '南', '西', '北'];
  for (let i = 1; i < state.currentRound; i++) {
    seating = [seating.pop()].concat(seating);
  }

  let roundOffset = 0;
  for (; roundOffset < 4 + (state.overviewViewShift || 0); roundOffset++) {
    if (players[0].id === state.currentPlayerId) {
      break;
    }

    players = players.slice(1).concat(players[0]);
    seating = seating.slice(1).concat(seating[0]);
  }

  return { players, seating };
}

const getSeating = memoize(_getSeating);

function _getScores(s: IAppState, o: Player[]) {
  const seating: Player[] = getSeating(s, o).players;
  const scores = [];
  const chombos = [];
  const seq = { 'self': 0, 'shimocha': 1, 'toimen': 2, 'kamicha': 3 };
  seating.forEach((p) => {
    const scoreNum = s.overviewDiffBy ? p.score - seating[seq[s.overviewDiffBy]].score : p.score;
    const score = (s.overviewDiffBy && scoreNum > 0
      ? '+' + scoreNum.toString()
      : scoreNum.toString());
    scores.push(score);
    chombos.push((Math.abs((p.penalties || 0 ) / s.gameConfig.chomboPenalty) || '').toString());
  });

  return { scores, chombos };
}

const getScores = memoize(_getScores);

// TODO ##2: из-за постоянных обновлений таймера в стейте селекторы могут работать не столь эффективно.
//  Нужно делать остальные селекторы более специальными.
function _getTimeRemaining(state: IAppState) {
  if (!state.gameConfig.useTimer) {
    return '';
  }

  if (state.timer.waiting) {
    return '⏳';
  }

  let min = Math.floor(state.timer.secondsRemaining / 60);
  let sec = state.timer.secondsRemaining % 60;
  return min.toString() + ':' + (
    (sec < 10) ? ('0' + sec.toString()) : sec.toString()
  );
}

export const getTimeRemaining = memoize(_getTimeRemaining);

export const getSelf = (s: IAppState, o: Player[]) => getSeating(s, o).players[0];
export const getShimocha = (s: IAppState, o: Player[]) => getSeating(s, o).players[1];
export const getToimen = (s: IAppState, o: Player[]) => getSeating(s, o).players[2];
export const getKamicha = (s: IAppState, o: Player[]) => getSeating(s, o).players[3];

export const getSeatSelf = (s: IAppState, o: Player[]) => getSeating(s, o).seating[0];
export const getSeatShimocha = (s: IAppState, o: Player[]) => getSeating(s, o).seating[1];
export const getSeatToimen = (s: IAppState, o: Player[]) => getSeating(s, o).seating[2];
export const getSeatKamicha = (s: IAppState, o: Player[]) => getSeating(s, o).seating[3];

export const getScoreSelf = (s: IAppState, o: Player[]) => getScores(s, o).scores[0];
export const getScoreShimocha = (s: IAppState, o: Player[]) => getScores(s, o).scores[1];
export const getScoreToimen = (s: IAppState, o: Player[]) => getScores(s, o).scores[2];
export const getScoreKamicha = (s: IAppState, o: Player[]) => getScores(s, o).scores[3];

export const getChomboSelf = (s: IAppState, o: Player[]) => getScores(s, o).chombos[0];
export const getChomboShimocha = (s: IAppState, o: Player[]) => getScores(s, o).chombos[1];
export const getChomboToimen = (s: IAppState, o: Player[]) => getScores(s, o).chombos[2];
export const getChomboKamicha = (s: IAppState, o: Player[]) => getScores(s, o).chombos[3];
