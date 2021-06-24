import { IAppState } from '../interfaces';
import { memoize } from '#/primitives/memoize';
import { Player } from '#/interfaces/common';
// import { getScores } from './commonSelectors';

// TODO ##2: из-за постоянных обновлений таймера в стейте селекторы могут работать не столь эффективно.
//  Нужно делать остальные селекторы более специальными.
function _getTimeRemaining(state: IAppState) {
  if (!state.gameConfig?.useTimer) {
    return '';
  }

  if (state.timer?.waiting) {
    return '⏳';
  }

  let min = Math.floor((state.timer?.secondsRemaining || 0) / 60);
  let sec = (state.timer?.secondsRemaining || 0) % 60;
  return min.toString() + ':' + (
    (sec < 10) ? ('0' + sec.toString()) : sec.toString()
  );
}

export const getTimeRemaining = memoize(_getTimeRemaining);

/*export const getScoreSelf = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[0];
export const getScoreShimocha = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[1];
export const getScoreToimen = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[2];
export const getScoreKamicha = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[3];

export const getChomboSelf = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[0];
export const getChomboShimocha = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[1];
export const getChomboToimen = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[2];
export const getChomboKamicha = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[3];*/
