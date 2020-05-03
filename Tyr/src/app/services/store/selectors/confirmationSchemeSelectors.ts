import { Player } from '../../../interfaces/common';
import { IAppState } from '../interfaces';
import { memoize } from '../../../helpers/memoize';
import { RRoundPaymentsInfo } from '../../../interfaces/remote';

export type PaymentInfo = {
  backward: boolean;
  title: string;
  riichi: boolean;
};

function _getSeating(state: IAppState, overview: RRoundPaymentsInfo) {
  let seating = ['東', '南', '西', '北'];
  for (let i = 1; i < overview.round; i++) {
    seating = [seating.pop()].concat(seating);
  }

  let players: Player[] = [].concat(state.players);

  let roundOffset = 0;
  for (; roundOffset < 4; roundOffset++) {
    if (players[0].id === state.currentPlayerId) {
      break;
    }

    players = players.slice(1).concat(players[0]);
    seating = seating.slice(1).concat(seating[0]);
  }

  // Riichi bets
  let riichi = [ false, false, false, false ];
  const riichiIds = overview.riichiIds.map((id: string) => parseInt(id, 10)); // TODO: get it out to formatters
  players.forEach((p, idx) => {
    riichi[idx] = riichiIds.includes(p.id);
  });

  // Chombo penalties
  let chombo = [ false, false, false, false ];
  players.forEach((p, idx) => {
    chombo[idx] = overview.penaltyFor === p.id;
  });

  // Pao
  let pao = [ false, false, false, false ];
  if (['ron', 'tsumo', 'multiron'].indexOf(overview.outcome) !== -1) {
    players.forEach((p, idx) => {
      pao[idx] = overview.paoPlayer === p.id;
    });
  }

  return { players, seating, roundOffset, riichi, chombo, pao };
}

const getSeating = memoize(_getSeating);

function _getPayment(state: IAppState, overview: RRoundPaymentsInfo, player1: Player, player2: Player): PaymentInfo {
  const p = overview.payments;
  const directPayment12 = p.direct && p.direct[player2.id + '<-' + player1.id] || 0;
  const directPayment21 = p.direct && p.direct[player1.id + '<-' + player2.id] || 0;
  const riichiPayment12 = p.riichi && p.riichi[player2.id + '<-' + player1.id] || 0;
  const riichiPayment21 = p.riichi && p.riichi[player1.id + '<-' + player2.id] || 0;
  const honbaPayment12 = p.honba && p.honba[player2.id + '<-' + player1.id] || 0;
  const honbaPayment21 = p.honba && p.honba[player1.id + '<-' + player2.id] || 0;

  // multiple nagashi
  if (directPayment12 === directPayment21 && directPayment12 !== 0) {
    return null;
  }

  if (directPayment12 + riichiPayment12 > 0) {
    return {
      backward: false,
      riichi: riichiPayment12 > 0,
      title: [directPayment12, honbaPayment12]
        .filter(e => !!e)
        .join(' + ')
    };
  } else if (directPayment21 + riichiPayment21 > 0) {
    return {
      backward: true,
      riichi: riichiPayment21 > 0,
      title: [directPayment21, honbaPayment21]
        .filter(e => !!e)
        .join(' + ')
    };
  } else {
    return null;
  }
}

const getPayment = memoize(_getPayment);

export const getSelf = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).players[0];
export const getShimocha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).players[1];
export const getToimen = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).players[2];
export const getKamicha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).players[3];
export const getSeatSelf = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).seating[0];
export const getSeatShimocha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).seating[1];
export const getSeatToimen = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).seating[2];
export const getSeatKamicha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).seating[3];
export const getRiichiSelf = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).riichi[0];
export const getRiichiShimocha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).riichi[1];
export const getRiichiToimen = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).riichi[2];
export const getRiichiKamicha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).riichi[3];
export const getChomboSelf = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).chombo[0];
export const getChomboShimocha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).chombo[1];
export const getChomboToimen = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).chombo[2];
export const getChomboKamicha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).chombo[3];
export const getPaoSelf = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).pao[0];
export const getPaoShimocha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).pao[1];
export const getPaoToimen = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).pao[2];
export const getPaoKamicha = (s: IAppState, o: RRoundPaymentsInfo) => getSeating(s, o).pao[3];
export const getRound = (state: IAppState) => state.changesOverview.round;
export const getTopLeftPayment = (s: IAppState, o: RRoundPaymentsInfo) => getPayment(s, o, getToimen(s, o), getKamicha(s, o));
export const getTopRightPayment = (s: IAppState, o: RRoundPaymentsInfo) => getPayment(s, o, getToimen(s, o), getShimocha(s, o));
export const getTopBottomPayment = (s: IAppState, o: RRoundPaymentsInfo) => getPayment(s, o, getToimen(s, o), getSelf(s, o));
export const getBottomLeftPayment = (s: IAppState, o: RRoundPaymentsInfo) => getPayment(s, o, getSelf(s, o), getKamicha(s, o));
export const getBottomRightPayment = (s: IAppState, o: RRoundPaymentsInfo) => getPayment(s, o, getSelf(s, o), getShimocha(s, o));
export const getLeftRightPayment = (s: IAppState, o: RRoundPaymentsInfo) => getPayment(s, o, getKamicha(s, o), getShimocha(s, o));
export const getIfAnyPaymentsOccured = (s: IAppState, o: RRoundPaymentsInfo) => getTopLeftPayment(s, o) !== null
  || getTopRightPayment(s, o) !== null
  || getTopBottomPayment(s, o) !== null
  || getBottomLeftPayment(s, o) !== null
  || getBottomRightPayment(s, o) !== null
  || getLeftRightPayment(s, o) !== null;
