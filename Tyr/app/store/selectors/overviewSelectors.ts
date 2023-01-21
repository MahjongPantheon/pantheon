import { IAppState } from '../interfaces';
import { memoize } from '#/primitives/memoize';
// import { Player } from '#/interfaces/common';
// import { getScores } from './commonSelectors';

// TODO ##2: из-за постоянных обновлений таймера в стейте селекторы могут работать не столь эффективно.
//  Нужно делать остальные селекторы более специальными.
function _getTimeRemaining(state: IAppState): { minutes: number; seconds: number } | undefined {
  if (!state.gameConfig?.useTimer || state.timer?.waiting) {
    return undefined;
  }

  const lastGamesLeftZone = 15; //todo will work only for ema
  const min = Math.floor((state.timer?.secondsRemaining ?? 0) / 60) - lastGamesLeftZone;

  if (min < 0) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }
  return {
    minutes: min,
    seconds: (state.timer?.secondsRemaining ?? 0) % 60,
  };
}

function _getAutostartTimeRemaining(
  state: IAppState
): { minutes: number; seconds: number } | undefined {
  if (!state.gameConfig?.useTimer || !state.timer?.waiting) {
    return undefined;
  }

  const min = Math.floor((state.timer?.autostartSecondsRemaining || 0) / 60);

  if (min < 0) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }
  return {
    minutes: min,
    seconds: (state.timer?.autostartSecondsRemaining || 0) % 60,
  };
}

export const getTimeRemaining = memoize(_getTimeRemaining);
export const getAutostartTimeRemaining = memoize(_getAutostartTimeRemaining);

export function formatTime(minutes: number, seconds: number) {
  return minutes.toString() + ':' + (seconds < 10 ? '0' + seconds.toString() : seconds.toString());
}

/*export const getScoreSelf = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[0];
export const getScoreShimocha = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[1];
export const getScoreToimen = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[2];
export const getScoreKamicha = (s: IAppState, o: Player[]) => getScores(s, o)?.scores[3];

export const getChomboSelf = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[0];
export const getChomboShimocha = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[1];
export const getChomboToimen = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[2];
export const getChomboKamicha = (s: IAppState, o: Player[]) => getScores(s, o)?.chombos[3];*/
