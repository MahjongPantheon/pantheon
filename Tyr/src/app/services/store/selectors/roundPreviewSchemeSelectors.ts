import { Player } from '../../../interfaces/common';
import { IAppState } from '../interfaces';
import { memoize } from '../../../helpers/memoize';
import { getSeating } from './commonSelectors';
import { getPaoUsers, getRiichiUsers } from './mimirSelectors';

export type RoundPreviewSchemePurpose = 'overview' | 'other_overview' | 'confirmation' | 'lastround' | 'otherlastround';
type Csp = RoundPreviewSchemePurpose; // alias for shorter name

export type PaymentInfo = {
  backward: boolean;
  title: string;
  riichi: boolean;
};

type RoundPaymentInfoShort = {
  round: number;
  currentPlayerId: number;
  players: [Player, Player, Player, Player];
  riichiBets: string[];
  penaltyFor: number | null;
  paoPlayer: number;
};

function _getPayment(state: IAppState, purpose: Csp, player1: Player, player2: Player): PaymentInfo {
  let overview;
  switch (purpose) {
    case 'lastround':
    case 'otherlastround':
    case 'other_overview':
      overview = state.lastRoundOverview;
      break;
    case 'confirmation':
    case 'overview':
      overview = state.changesOverview;
      break;
  }
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

const getRoundOverview = (s: IAppState, purpose: Csp): RoundPaymentInfoShort => {
  switch (purpose) {
    case 'lastround':
      if (!s.lastRoundOverview) {
        return null;
      }
      return {
        round: s.lastRoundOverview.round,
        currentPlayerId: s.currentPlayerId,
        players: s.players,
        riichiBets: s.lastRoundOverview.riichiIds,
        penaltyFor: s.lastRoundOverview.penaltyFor,
        paoPlayer: s.lastRoundOverview.paoPlayer
      };
    case 'overview':
      return {
        round: s.currentRound,
        currentPlayerId: s.currentPlayerId,
        players: s.players,
        riichiBets: [],
        penaltyFor: null,
        paoPlayer: null
      };
    case 'confirmation':
      if (!s.currentOutcome) {
        return null;
      }
      const [pao] = getPaoUsers(s);
      return {
        round: s.currentRound,
        currentPlayerId: s.currentPlayerId,
        players: s.players,
        riichiBets: getRiichiUsers(s).map((p) => p.id.toString()),
        penaltyFor: s.currentOutcome.selectedOutcome === 'chombo' && s.currentOutcome.loser,
        paoPlayer: pao && pao.id
      }
    case 'other_overview':
      return {
        round: s.currentOtherTable.currentRound,
        currentPlayerId: s.currentOtherTablePlayers[(s.overviewViewShift || 0) % 4].id,
        players: s.currentOtherTablePlayers as [Player, Player, Player, Player],
        riichiBets: [],
        penaltyFor: null,
        paoPlayer: null
      }
    case 'otherlastround':
      if (!s.lastRoundOverview) {
        return null;
      }
      return {
        round: s.lastRoundOverview.round,
        currentPlayerId: s.currentOtherTablePlayers[(s.overviewViewShift || 0) % 4].id,
        players: s.currentOtherTablePlayers as [Player, Player, Player, Player],
        riichiBets: s.lastRoundOverview.riichiIds,
        penaltyFor: s.lastRoundOverview.penaltyFor,
        paoPlayer: s.lastRoundOverview.paoPlayer
      }
  }
};

const getSeatData = (s: IAppState, purpose: Csp) => {
  const overview = getRoundOverview(s, purpose);
  return getSeating(overview.round, s.overviewViewShift, overview.currentPlayerId,
    overview.players, overview.riichiBets, overview.penaltyFor, overview.paoPlayer);
}

export const getSelf = (s: IAppState, p: Csp) => getSeatData(s, p).players[0];
export const getShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).players[1];
export const getToimen = (s: IAppState, p: Csp) => getSeatData(s, p).players[2];
export const getKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).players[3];
export const getSeatSelf = (s: IAppState, p: Csp) => getSeatData(s, p).seating[0];
export const getSeatShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).seating[1];
export const getSeatToimen = (s: IAppState, p: Csp) => getSeatData(s, p).seating[2];
export const getSeatKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).seating[3];
export const getRiichiSelf = (s: IAppState, p: Csp) => getSeatData(s, p).riichi[0];
export const getRiichiShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).riichi[1];
export const getRiichiToimen = (s: IAppState, p: Csp) => getSeatData(s, p).riichi[2];
export const getRiichiKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).riichi[3];
export const getChomboSelf = (s: IAppState, p: Csp) => getSeatData(s, p).chombo[0];
export const getChomboShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).chombo[1];
export const getChomboToimen = (s: IAppState, p: Csp) => getSeatData(s, p).chombo[2];
export const getChomboKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).chombo[3];
export const getPaoSelf = (s: IAppState, p: Csp) => getSeatData(s, p).pao[0];
export const getPaoShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).pao[1];
export const getPaoToimen = (s: IAppState, p: Csp) => getSeatData(s, p).pao[2];
export const getPaoKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).pao[3];
export const getRound = (state: IAppState, p: Csp) => getRoundOverview(state, p).round;
export const getTopLeftPayment = (s: IAppState, p: Csp) => getPayment(s, p, getToimen(s, p), getKamicha(s, p));
export const getTopRightPayment = (s: IAppState, p: Csp) => getPayment(s, p, getToimen(s, p), getShimocha(s, p));
export const getTopBottomPayment = (s: IAppState, p: Csp) => getPayment(s, p, getToimen(s, p), getSelf(s, p));
export const getBottomLeftPayment = (s: IAppState, p: Csp) => getPayment(s, p, getSelf(s, p), getKamicha(s, p));
export const getBottomRightPayment = (s: IAppState, p: Csp) => getPayment(s, p, getSelf(s, p), getShimocha(s, p));
export const getLeftRightPayment = (s: IAppState, p: Csp) => getPayment(s, p, getKamicha(s, p), getShimocha(s, p));
export const getIfAnyPaymentsOccured = (s: IAppState, p: Csp) => getTopLeftPayment(s, p) !== null
  || getTopRightPayment(s, p) !== null
  || getTopBottomPayment(s, p) !== null
  || getBottomLeftPayment(s, p) !== null
  || getBottomRightPayment(s, p) !== null
  || getLeftRightPayment(s, p) !== null;
