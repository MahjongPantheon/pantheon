/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { IAppState } from '../interfaces';
import { Dispatch } from 'redux';
import { PlayerButtonMode, PlayerPointsMode } from '../../helpers/enums';
import {
  TABLE_ROTATE_CLOCKWISE,
  TABLE_ROTATE_COUNTERCLOCKWISE,
  TOGGLE_DEADHAND,
  TOGGLE_LOSER,
  TOGGLE_NAGASHI,
  TOGGLE_RIICHI,
  TOGGLE_WINNER,
} from '../actions/interfaces';

import { TableStatus } from '../../helpers/interfaces';
import { I18nService } from '../../services/i18n';
import { RoundOutcome } from '../../clients/proto/atoms.pb';
import { IProps as PlayerPlaceProps } from '../../components/base/PlayerPlace/PlayerPlace';
import { IProps as ButtonsProps } from '../../components/base/PlayerButtons/PlayerButtons';
import {
  deadPressed,
  loseDisabled,
  losePressed,
  nagashiDisabled,
  nagashiPressed,
  riichiPressed,
  winDisabled,
  winPressed,
} from './userItem';
import {
  PlayerArrow,
  PlayerSide,
  ResultArrowsProps,
} from '../../components/base/ResultArrows/ResultArrowsProps';

const playerOffsets = {
  self: 0,
  shimocha: 1,
  toimen: 2,
  kamicha: 3,
};

export function getPlayerData(
  who: keyof typeof playerOffsets,
  state: IAppState
): Omit<PlayerPlaceProps, 'buttons' | 'onPlayerClick'> | null {
  const playerIndex =
    (playerOffsets[who] + (state.players?.findIndex((p) => p.id === state.currentPlayerId) ?? 0)) %
    4;
  const player = state.players?.[playerIndex];
  const currentWind = (['e', 's', 'w', 'n'] as const)[
    (8 + playerIndex - ((state.sessionState?.roundIndex ?? 1) - 1)) % 4
  ];

  if (!player) {
    return null;
  }

  let points: number | string = player.score;
  let pointsMode = PlayerPointsMode.IDLE;
  let penaltyPoints = state.sessionState?.penalties.find((p) => p.who === player.id)?.amount;

  if (state.overviewDiffBy) {
    const diffByPlayer = state.players?.find((x) => x.id === state.overviewDiffBy);
    if (diffByPlayer) {
      points = player.score - diffByPlayer.score;
      if (points > 0) {
        pointsMode = PlayerPointsMode.POSITIVE;
        points = `+${points}`;
      } else if (points < 0) {
        pointsMode = PlayerPointsMode.NEGATIVE;
      } else {
        pointsMode = PlayerPointsMode.ACTIVE;
      }
      penaltyPoints = undefined;
    }
  }

  let showInlineRiichi = false;
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
    case RoundOutcome.ROUND_OUTCOME_DRAW:
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      showInlineRiichi = state.currentOutcome.riichiBets.includes(player.id);
      break;
    default:
  }

  let showChomboSign = false;
  if (
    state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_CHOMBO &&
    state.currentScreen === 'confirmation'
  ) {
    showChomboSign = state.currentOutcome.loser === player.id;
  }

  return {
    id: player.id,
    playerName: player.title,
    hasAvatar: player.hasAvatar,
    lastUpdate: player.lastUpdate,
    showYakitori: state.gameConfig?.rulesetConfig.withYakitori && player.yakitori,
    currentWind,
    showChomboSign,
    showInlineRiichi,
    points: points.toString(),
    pointsMode,
    penaltyPoints,
  };
}

export function getOutcomeTitle(state: IAppState, loc: I18nService) {
  let bottomPanelText = '';
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      bottomPanelText = loc._t('Abortive draw');
      break;
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      bottomPanelText = loc._t('Chombo');
      break;
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      bottomPanelText = loc._t('Exhaustive draw');
      break;
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      bottomPanelText = loc._t('Tsumo');
      break;
    case RoundOutcome.ROUND_OUTCOME_RON:
      bottomPanelText = loc._t('Ron');
      break;
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      bottomPanelText = loc._t('Nagashi mangan');
      break;
    default:
  }

  return bottomPanelText;
}

export function getPlayerButtons(
  who: keyof typeof playerOffsets,
  state: IAppState,
  dispatch: Dispatch
): ButtonsProps | null {
  const playerIndex =
    (playerOffsets[who] + (state.players?.findIndex((p) => p.id === state.currentPlayerId) ?? 0)) %
    4;
  const player = state.players?.[playerIndex];
  const rotateActionIcons =
    who === 'toimen' ? 'flip' : who === 'kamicha' ? 'ccw' : who === 'shimocha' ? 'cw' : undefined;

  const selectedOutcome: RoundOutcome | undefined = state.currentOutcome?.selectedOutcome;
  if (!selectedOutcome || !player) {
    return null;
  }

  const hasWinButton = (
    [
      RoundOutcome.ROUND_OUTCOME_RON,
      RoundOutcome.ROUND_OUTCOME_TSUMO,
      RoundOutcome.ROUND_OUTCOME_DRAW,
      RoundOutcome.ROUND_OUTCOME_NAGASHI,
    ] as RoundOutcome[]
  ).includes(selectedOutcome);

  const hasLoseButton = (
    [RoundOutcome.ROUND_OUTCOME_RON, RoundOutcome.ROUND_OUTCOME_CHOMBO] as RoundOutcome[]
  ).includes(selectedOutcome);

  const hasRiichiButton = (
    [
      RoundOutcome.ROUND_OUTCOME_RON,
      RoundOutcome.ROUND_OUTCOME_TSUMO,
      RoundOutcome.ROUND_OUTCOME_DRAW,
      RoundOutcome.ROUND_OUTCOME_ABORT,
      RoundOutcome.ROUND_OUTCOME_NAGASHI,
    ] as RoundOutcome[]
  ).includes(selectedOutcome);

  const showDeadButton =
    (
      [RoundOutcome.ROUND_OUTCOME_DRAW, RoundOutcome.ROUND_OUTCOME_NAGASHI] as RoundOutcome[]
    ).includes(selectedOutcome) && deadPressed(state, player);

  let winButton: PlayerButtonMode | undefined;
  let onWinButtonClick: (() => void) | undefined;
  if (hasWinButton && !showDeadButton) {
    if (winPressed(state, player)) {
      winButton = PlayerButtonMode.PRESSED;
    } else if (winDisabled(state, player)) {
      winButton = PlayerButtonMode.DISABLE;
    } else {
      winButton = PlayerButtonMode.IDLE;
    }
    onWinButtonClick = () => {
      dispatch({ type: TOGGLE_WINNER, payload: player.id });
    };
  }

  let loseButton: PlayerButtonMode | undefined;
  let onLoseButtonClick: (() => void) | undefined;
  if (hasLoseButton) {
    if (losePressed(state, player)) {
      loseButton = PlayerButtonMode.PRESSED;
    } else if (loseDisabled(state, player)) {
      loseButton = PlayerButtonMode.DISABLE;
    } else {
      loseButton = PlayerButtonMode.IDLE;
    }
    onLoseButtonClick = () => {
      dispatch({ type: TOGGLE_LOSER, payload: player.id });
    };
  }

  let riichiButton: PlayerButtonMode | undefined;
  let onRiichiButtonClick: (() => void) | undefined;
  if (hasRiichiButton) {
    if (riichiPressed(state, player)) {
      riichiButton = PlayerButtonMode.PRESSED;
    } else {
      riichiButton = PlayerButtonMode.IDLE;
    }
    onRiichiButtonClick = () => {
      dispatch({ type: TOGGLE_RIICHI, payload: player.id });
    };
  }

  let deadButton: PlayerButtonMode | undefined;
  let onDeadButtonClick: (() => void) | undefined;
  if (showDeadButton) {
    deadButton = PlayerButtonMode.PRESSED;
    onDeadButtonClick = () => {
      dispatch({ type: TOGGLE_DEADHAND, payload: player.id });
    };
  }

  return {
    winButton,
    onWinButtonClick,
    loseButton,
    onLoseButtonClick,
    riichiButton,
    onRiichiButtonClick,
    deadButton,
    onDeadButtonClick,
    rotateActionIcons,
  };
}

export function getNagashiPlayerButtons(
  who: keyof typeof playerOffsets,
  state: IAppState,
  dispatch: Dispatch
): ButtonsProps | null {
  const playerIndex =
    (playerOffsets[who] + (state.players?.findIndex((p) => p.id === state.currentPlayerId) ?? 0)) %
    4;
  const player = state.players?.[playerIndex];
  const rotateActionIcons =
    who === 'toimen' ? 'flip' : who === 'kamicha' ? 'ccw' : who === 'shimocha' ? 'cw' : undefined;

  if (!player) {
    return null;
  }

  let winButton: PlayerButtonMode | undefined;
  if (nagashiPressed(state, player)) {
    winButton = PlayerButtonMode.PRESSED;
  } else if (nagashiDisabled(state, player)) {
    winButton = PlayerButtonMode.DISABLE;
  } else {
    winButton = PlayerButtonMode.IDLE;
  }
  const onWinButtonClick = () => {
    dispatch({ type: TOGGLE_NAGASHI, payload: player.id });
  };

  return {
    winButton,
    onWinButtonClick,
    rotateActionIcons,
  };
}

// For primary table view (other tables use another selector)
export function getTableStatus(
  state: IAppState
): Omit<TableStatus, 'width' | 'height' | 'onCallRefereeClick'> {
  return {
    tableIndex: state.tableIndex ?? undefined,
    showCallReferee: state.gameConfig?.syncStart, // only tournaments
    showRotateButtons: false,

    // from SessionState
    tableStatus: {
      roundIndex: state.sessionState?.roundIndex ?? 0,
      riichiCount: state.sessionState?.riichiCount ?? 0,
      honbaCount: state.sessionState?.honbaCount ?? 0,
      lastHandStarted: state.sessionState?.lastHandStarted,
    },

    timerState: {
      useTimer: state.gameConfig?.useTimer,
      timerWaiting: state.timer?.waiting,
      secondsRemaining: state.timer?.secondsRemaining,
    },
  };
}

export function getOtherTableStatus(
  state: IAppState,
  dispatch: Dispatch
): Omit<TableStatus, 'width' | 'height'> {
  return {
    tableIndex: state.currentOtherTableIndex ?? undefined,
    showCallReferee: false,
    showRotateButtons: true,
    onCwRotateClick: () => dispatch({ type: TABLE_ROTATE_CLOCKWISE }),
    onCcwRotateClick: () => dispatch({ type: TABLE_ROTATE_COUNTERCLOCKWISE }),

    // from SessionState
    tableStatus: {
      roundIndex: state.currentOtherTable?.state?.roundIndex ?? 0,
      riichiCount: state.currentOtherTable?.state?.riichiCount ?? 0,
      honbaCount: state.currentOtherTable?.state?.honbaCount ?? 0,
      lastHandStarted: state.currentOtherTable?.state?.lastHandStarted,
    },

    timerState: {
      useTimer: state.gameConfig?.useTimer,
      timerWaiting: state.timer?.waiting,
      secondsRemaining: state.timer?.secondsRemaining,
    },
  };
}

export function getOtherTablePlayerData(
  who: keyof typeof playerOffsets,
  state: IAppState
): Omit<PlayerPlaceProps, 'buttons' | 'onPlayerClick'> | null {
  const playerIndex = (playerOffsets[who] + (state.overviewViewShift ?? 0)) % 4;
  const player =
    state.currentOtherTablePlayers?.[(playerOffsets[who] + (state.overviewViewShift ?? 0)) % 4];
  const currentWind = (['e', 's', 'w', 'n'] as const)[
    (8 + playerIndex - ((state.currentOtherTable?.state?.roundIndex ?? 1) - 1)) % 4
  ];

  if (!player) {
    return null;
  }

  let points: number | string = player.score;
  let pointsMode = PlayerPointsMode.IDLE;
  let penaltyPoints = state.currentOtherTable?.state?.penalties.find(
    (p) => p.who === player.id
  )?.amount;

  if (state.overviewDiffBy) {
    const diffByPlayer = state.currentOtherTablePlayers?.find((x) => x.id === state.overviewDiffBy);
    if (diffByPlayer) {
      points = player.score - diffByPlayer.score;
      if (points > 0) {
        pointsMode = PlayerPointsMode.POSITIVE;
        points = `+${points}`;
      } else if (points < 0) {
        pointsMode = PlayerPointsMode.NEGATIVE;
      } else {
        pointsMode = PlayerPointsMode.ACTIVE;
      }
      penaltyPoints = undefined;
    }
  }

  return {
    id: player.id,
    playerName: player.title,
    hasAvatar: player.hasAvatar,
    lastUpdate: player.lastUpdate,
    showYakitori: state.gameConfig?.rulesetConfig.withYakitori && player.yakitori,
    currentWind,
    showInlineRiichi: false,
    points: points.toString(),
    pointsMode,
    penaltyPoints,
  };
}

export function getOutcomeName(loc: I18nService, selectedOutcome: RoundOutcome): string {
  switch (selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_MULTIRON:
      return loc._t('Ron');
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return loc._t('Tsumo');
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      return loc._t('Draw');
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      return loc._t('Abort');
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      return loc._t('Chombo');
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return loc._t('Nagashi');
    default:
      return '';
  }
}

type PaymentInfo = {
  from?: number;
  to?: number;
  directAmount: number;
  riichiAmount: number;
  honbaAmount: number;
};

function getPaymentsInfo(state: IAppState): PaymentInfo[] {
  const changesOverview = state.changesOverview;
  if (
    state.currentScreen !== 'confirmation' ||
    changesOverview === undefined ||
    state.loading.overview
  ) {
    return [];
  }

  const payments = changesOverview.payments;

  const result: PaymentInfo[] = [];
  payments.direct.forEach((paymentItem) => {
    if (paymentItem.from && paymentItem.to) {
      const item = {
        from: paymentItem.from,
        to: paymentItem.to,
        directAmount: paymentItem.amount,
        riichiAmount: 0,
        honbaAmount: 0,
      };
      result.push(item);
    }
  });

  payments.riichi.forEach((paymentItem) => {
    if (paymentItem.to && paymentItem.from && paymentItem.amount !== 0) {
      const currentArrow = result.find(
        (arrow) => arrow.to === paymentItem.to && arrow.from === paymentItem.from
      );
      if (currentArrow) {
        currentArrow.riichiAmount = paymentItem.amount;
      } else {
        const item = {
          from: paymentItem.from,
          to: paymentItem.to,
          directAmount: 0,
          riichiAmount: paymentItem.amount,
          honbaAmount: 0,
        };
        result.push(item);
      }
    }
  });

  payments.honba.forEach((paymentItem) => {
    if (paymentItem.to && paymentItem.from && paymentItem.amount !== 0) {
      const currentArrow = result.find(
        (arrow) => arrow.to === paymentItem.to && arrow.from === paymentItem.from
      );
      if (currentArrow) {
        currentArrow.honbaAmount = paymentItem.amount;
      }
    }
  });

  return result;
}

export function getArrows(
  state: IAppState
): Omit<ResultArrowsProps, 'width' | 'height'> | undefined {
  if (
    state.currentScreen !== 'confirmation' ||
    state.changesOverview === undefined ||
    state.loading.overview
  ) {
    return undefined;
  }

  // todo hide for showAdditionalTableInfo

  // todo we get only one pao player from server, need to be fixed for multiron
  // const paoPlayer = changesOverview.paoPlayer

  const paoPlayersByWinners: number[] = [];
  if (state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO) {
    if (state.currentOutcome.winner && state.changesOverview.round.tsumo?.paoPlayerId) {
      paoPlayersByWinners[state.currentOutcome.winner] =
        state.changesOverview.round.tsumo?.paoPlayerId;
    }
  }

  if (state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON) {
    const wins = state.currentOutcome.wins;
    Object.keys(wins).forEach((winnerKey) => {
      const winner = wins[winnerKey];
      if (winner.paoPlayerId && winner.winner) {
        paoPlayersByWinners[winner.winner] = winner.paoPlayerId;
      }
    });
  }

  const payments = getPaymentsInfo(state);

  const selfIndex = state.players?.findIndex((p) => p.id === state.currentPlayerId) ?? 0;
  const sideByPlayer: Record<number, PlayerSide> = {
    [state.players?.[selfIndex].id!]: PlayerSide.BOTTOM,
    [state.players?.[(selfIndex + 1) % 4].id!]: PlayerSide.RIGHT,
    [state.players?.[(selfIndex + 2) % 4].id!]: PlayerSide.TOP,
    [state.players?.[(selfIndex + 3) % 4].id!]: PlayerSide.LEFT,
  };

  const arrows: PlayerArrow[] = [];
  payments.forEach((item) => {
    if (item.from && item.to) {
      const start = sideByPlayer[item.from];
      const end = sideByPlayer[item.to];
      const withPao = paoPlayersByWinners[item.to] === item.from;

      const playerArrow: PlayerArrow = {
        points: item.directAmount,
        honbaPoints: item.honbaAmount,
        withRiichi: item.riichiAmount !== 0,
        withPao: withPao,
        start: start,
        end: end,
      };

      arrows.push(playerArrow);
    }
  });

  return {
    arrows: arrows,
  };
}
