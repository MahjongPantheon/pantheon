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

import { AppScreen, IAppState } from '#/store/interfaces';
import { Dispatch } from 'redux';
import {
  getKamicha,
  getSeatKamicha,
  getSeatSelf,
  getSeatShimocha,
  getSeatToimen,
  getSelf,
  getShimocha,
  getToimen,
  RoundPreviewSchemePurpose,
} from '#/store/selectors/roundPreviewSchemeSelectors';
import { PlayerButtonMode, PlayerPointsMode } from '#/components/types/PlayerEnums';
import { PlayerProps } from '#/components/general/players/PlayerProps';
import { ItemSelect } from '#/components/general/select-modal/ItemSelect';
import { SelectModalProps } from '#/components/general/select-modal/SelectModal';
import {
  ADD_ROUND_INIT,
  GET_OTHER_TABLE_RELOAD,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  INIT_BLANK_OUTCOME,
  SELECT_MULTIRON_WINNER,
  SHOW_GAME_LOG,
  TABLE_ROTATE_CLOCKWISE,
  TABLE_ROTATE_COUNTERCLOCKWISE,
  TOGGLE_ADDITIONAL_TABLE_INFO,
  TOGGLE_DEADHAND,
  TOGGLE_LOSER,
  TOGGLE_NAGASHI,
  TOGGLE_OVERVIEW_DIFFBY,
  TOGGLE_PAO,
  TOGGLE_RIICHI,
  TOGGLE_WINNER,
  UPDATE_CURRENT_GAMES_INIT,
} from '#/store/actions/interfaces';
import {
  deadPressed,
  loseDisabled,
  losePressed,
  nagashiDisabled,
  nagashiPressed,
  paoPressed,
  riichiPressed,
  winDisabled,
  winPressed,
} from '#/store/selectors/userItemSelectors';
import { PlayerButtonProps } from '#/components/types/PlayerButtonProps';
import { TableMode } from '#/components/types/TableMode';
import { mayGoNextFromPlayersSelect } from '#/store/selectors/navbarSelectors';
import {
  PlayerArrow,
  PlayerSide,
  ResultArrowsProps,
} from '#/components/general/result-arrows/ResultArrowsProps';
import { TableInfoProps } from '#/components/screens/table/base/TableInfo';
import { roundToString } from '#/components/helpers/Utils';
import { AppOutcome } from '#/interfaces/app';
import { getNextWinnerWithPao } from '#/store/selectors/paoSelectors';
import {
  formatTime,
  getAutostartTimeRemaining,
  getTimeRemaining,
} from '#/store/selectors/overviewSelectors';
import { I18nService } from '#/services/i18n';
import { PlayerInSession, RoundOutcome } from '#/clients/proto/atoms.pb';

// todo move to selectors most of code from here

export function getPlayerTopInfo(loc: I18nService, state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state);
  const playerBase = getToimen(state, purpose);
  const wind = getSeatToimen(state, purpose);

  const result = getPlayer(loc, playerBase, wind, state, dispatch);
  result.rotated =
    state.settings.singleDeviceMode &&
    ['currentGame', 'outcomeSelect', 'confirmation'].includes(state.currentScreen);

  return result;
}

export function getPlayerLeftInfo(loc: I18nService, state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state);
  const playerBase = getKamicha(state, purpose);
  const wind = getSeatKamicha(state, purpose);

  return getPlayer(loc, playerBase, wind, state, dispatch);
}

export function getPlayerRightInfo(loc: I18nService, state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state);
  const playerBase = getShimocha(state, purpose);
  const wind = getSeatShimocha(state, purpose);

  return getPlayer(loc, playerBase, wind, state, dispatch);
}

export function getPlayerBottomInfo(loc: I18nService, state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state);
  const playerBase = getSelf(state, purpose);
  const wind = getSeatSelf(state, purpose);

  return getPlayer(loc, playerBase, wind, state, dispatch);
}

export function getOutcomeModalInfo(
  loc: I18nService,
  state: IAppState,
  dispatch: Dispatch
): SelectModalProps | undefined {
  if (state.currentScreen !== 'outcomeSelect') {
    return undefined;
  }

  const onItemSelect = (outcome: RoundOutcome) => {
    dispatch({ type: INIT_BLANK_OUTCOME, payload: outcome });
    dispatch({ type: GOTO_NEXT_SCREEN });
  };

  const items: ItemSelect[] = [
    {
      text: loc._t('Ron'),
      onSelect: () => {
        onItemSelect(RoundOutcome.ROUND_OUTCOME_RON);
      },
    },
    {
      text: loc._t('Tsumo'),
      onSelect: () => {
        onItemSelect(RoundOutcome.ROUND_OUTCOME_TSUMO);
      },
    },
    {
      text: loc._t('Exhaustive draw'),
      onSelect: () => {
        onItemSelect(RoundOutcome.ROUND_OUTCOME_DRAW);
      },
    },
    {
      text: loc._t('Chombo'),
      onSelect: () => {
        onItemSelect(RoundOutcome.ROUND_OUTCOME_CHOMBO);
      },
    },
  ];

  const gameConfig = state.gameConfig;
  if (gameConfig) {
    if (gameConfig.rulesetConfig.withAbortives) {
      items.push({
        text: loc._t('Abortive draw'),
        onSelect: () => {
          onItemSelect(RoundOutcome.ROUND_OUTCOME_ABORT);
        },
        unavailable: false,
      });
    }

    if (gameConfig.rulesetConfig.withNagashiMangan) {
      items.push({
        text: loc._t('Nagashi mangan'),
        onSelect: () => {
          onItemSelect(RoundOutcome.ROUND_OUTCOME_NAGASHI);
        },
        unavailable: false,
      });
    }
  }

  return {
    items: items,
    onHide: () => {
      dispatch({ type: GOTO_PREV_SCREEN });
    },
  };
}

function getPurposeForType(state: IAppState): RoundPreviewSchemePurpose {
  const currentScreen = state.currentScreen;

  switch (currentScreen) {
    case 'confirmation':
      return 'confirmation';
    case 'otherTable':
      return 'other_overview';
    case 'overview':
    default:
      return 'overview';
  }
}

function getPlayerPaymentResult(
  loc: I18nService,
  player: PlayerInSession,
  state: IAppState
): number | string {
  const paymentsInfo = getPaymentsInfo(state);

  //todo add reverse mangan tsumo (mimir)
  if (paymentsInfo.length === 0) {
    if (
      state.changesOverview &&
      state.changesOverview.outcome === RoundOutcome.ROUND_OUTCOME_CHOMBO
    ) {
      if (
        state.changesOverview.scoresDelta.find((d) => d.penaltyScore && d.playerId === player.id)
      ) {
        return loc._t('Penalty');
      }
    }
  }

  let result = 0;
  paymentsInfo.forEach((item) => {
    if ((item.from === player.id || item.to === player.id) && item.from !== item.to) {
      const payment = item.directAmount + item.riichiAmount + item.honbaAmount;
      const factor = item.from === player.id ? -1 : 1;
      result += payment * factor;
    }
  });

  return result;
}

function getPlayer(
  loc: I18nService,
  player: PlayerInSession,
  wind: string,
  state: IAppState,
  dispatch: Dispatch
): PlayerProps {
  let pointsMode = PlayerPointsMode.IDLE; //todo check
  let points: number | string | undefined = player.score;
  let penaltyPoints: number | undefined = state.sessionState?.penalties.find(
    (p) => p.who === player.id
  )?.amount;
  let inlineWind = true;
  let winButton: PlayerButtonProps | undefined = undefined;
  let loseButton: PlayerButtonProps | undefined = undefined;
  let riichiButton: PlayerButtonProps | undefined = undefined;
  let showDeadButton = false;
  let showInlineRiichi = false;
  const currentOutcome: AppOutcome | undefined = state.currentOutcome;

  switch (state.currentScreen) {
    case 'currentGame':
    case 'otherTable':
      if (state.timer?.waiting) {
        inlineWind = false;
        points = undefined;
        penaltyPoints = undefined;
      }

      if (state.overviewDiffBy) {
        const diffByPlayer = (
          state.currentScreen === 'currentGame' ? state.players : state.currentOtherTablePlayers
        )?.find((x) => x.id === state.overviewDiffBy);
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
      break;
    case 'confirmation':
      const paymentResult = getPlayerPaymentResult(loc, player, state);
      points = paymentResult !== 0 ? paymentResult : undefined;
      if (typeof paymentResult === 'number') {
        if (paymentResult > 0) {
          pointsMode = PlayerPointsMode.POSITIVE;
          points = `+${points}`;
        } else if (paymentResult < 0) {
          pointsMode = PlayerPointsMode.NEGATIVE;
        }
      } else {
        pointsMode = PlayerPointsMode.NEGATIVE;
      }

      const riichiPayments = state.changesOverview?.payments.riichi;
      const currentPlayerId = player.id;
      const savedRiichiKey = `${currentPlayerId}<-${currentPlayerId}`;
      if (riichiPayments && Object.keys(riichiPayments).includes(savedRiichiKey)) {
        showInlineRiichi = true;
      }
      break;
    case 'playersSelect':
      points = undefined;
      penaltyPoints = undefined;

      const selectedOutcome: RoundOutcome | undefined = currentOutcome?.selectedOutcome;
      if (!selectedOutcome) {
        throw new Error('empty outcome');
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

      showDeadButton =
        (
          [RoundOutcome.ROUND_OUTCOME_DRAW, RoundOutcome.ROUND_OUTCOME_NAGASHI] as RoundOutcome[]
        ).includes(selectedOutcome) && deadPressed(state, player);

      if (hasWinButton && !showDeadButton) {
        let winButtonMode: PlayerButtonMode;
        if (winPressed(state, player)) {
          winButtonMode = PlayerButtonMode.PRESSED;
        } else if (winDisabled(state, player)) {
          winButtonMode = PlayerButtonMode.DISABLE;
        } else {
          winButtonMode = PlayerButtonMode.IDLE;
        }
        winButton = {
          mode: winButtonMode,
          onClick: onWinButtonClick(dispatch, player.id),
        };
      }

      if (hasLoseButton) {
        let loseButtonMode: PlayerButtonMode;
        if (losePressed(state, player)) {
          loseButtonMode = PlayerButtonMode.PRESSED;
        } else if (loseDisabled(state, player)) {
          loseButtonMode = PlayerButtonMode.DISABLE;
        } else {
          loseButtonMode = PlayerButtonMode.IDLE;
        }
        loseButton = {
          mode: loseButtonMode,
          onClick: onLoseButtonClick(dispatch, player.id),
        };
      }

      if (hasRiichiButton) {
        let riichiButtonMode: PlayerButtonMode;
        if (riichiPressed(state, player)) {
          riichiButtonMode = PlayerButtonMode.PRESSED;
        } else {
          riichiButtonMode = PlayerButtonMode.IDLE;
        }
        riichiButton = {
          mode: riichiButtonMode,
          onClick: onRiichiButtonClick(dispatch, player.id),
        };
      }

      break;
    case 'nagashiSelect':
      points = undefined;
      penaltyPoints = undefined;

      let nagashiButtonMode: PlayerButtonMode;
      if (nagashiPressed(state, player)) {
        nagashiButtonMode = PlayerButtonMode.PRESSED;
      } else if (nagashiDisabled(state, player)) {
        nagashiButtonMode = PlayerButtonMode.DISABLE;
      } else {
        nagashiButtonMode = PlayerButtonMode.IDLE;
      }
      winButton = {
        mode: nagashiButtonMode,
        onClick: onNagashiButtonClick(dispatch, player.id),
      };
      break;

    case 'paoSelect':
      points = undefined;
      penaltyPoints = undefined;

      if (!currentOutcome) {
        throw new Error(loc._t('empty outcome'));
      }

      let paoButtonMode: PlayerButtonMode | undefined;
      let hasPaoButton = false;

      switch (currentOutcome.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_RON:
          if (state.multironCurrentWinner === player.id) {
            points = loc._t('Winner');
            pointsMode = PlayerPointsMode.POSITIVE;
          } else if (currentOutcome.loser === player.id) {
            points = loc._t('Loser');
            pointsMode = PlayerPointsMode.NEGATIVE;
          } else {
            hasPaoButton = true;
          }
          break;
        case RoundOutcome.ROUND_OUTCOME_TSUMO:
          if (currentOutcome.winner !== player.id) {
            hasPaoButton = true;
          } else {
            points = loc._t('Winner');
            pointsMode = PlayerPointsMode.POSITIVE;
          }
          break;
        default:
          throw new Error(loc._t('wrong outcome for paoSelect'));
      }

      if (hasPaoButton) {
        if (paoPressed(state, player)) {
          paoButtonMode = PlayerButtonMode.PRESSED;
        } else {
          paoButtonMode = PlayerButtonMode.IDLE;
        }

        loseButton = {
          mode: paoButtonMode,
          onClick: onPaoButtonClick(dispatch, player.id),
        };
      }

      break;
    default:
  }

  return {
    name: player.title,
    wind: wind,
    points: points,
    penaltyPoints: penaltyPoints,
    pointsMode: pointsMode,
    inlineWind: inlineWind,
    winButton: winButton,
    loseButton: loseButton,
    riichiButton: riichiButton,
    showDeadButton: showDeadButton,
    onDeadButtonClick: onDeadButtonClick(dispatch, player.id),
    showInlineRiichi: showInlineRiichi,
    onPlayerClick: onPlayerClick(state, dispatch, player.id),
  };
}

function getTitleForOutcome(
  loc: I18nService,
  selectedOutcome: RoundOutcome | undefined,
  currentScreen: AppScreen
): string | undefined {
  // todo add i18n
  if (selectedOutcome === undefined) {
    return undefined;
  }

  switch (selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_MULTIRON:
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      if (currentScreen === 'paoSelect') {
        return loc._t('Select pao');
      }
      break;
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      if (currentScreen === 'playersSelect') {
        return loc._t('Select tempai');
      }
      break;
    default:
  }

  return getOutcomeName(loc, selectedOutcome);
}

// todo replace with common selector
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

export function getBottomPanel(loc: I18nService, state: IAppState, dispatch: Dispatch) {
  const tableMode = getTableMode(state);
  const selectedOutcome = state.currentOutcome && state.currentOutcome.selectedOutcome;

  const text = getTitleForOutcome(loc, selectedOutcome, state.currentScreen);

  const showBack = [
    TableMode.OTHER_PLAYER_TABLE,
    TableMode.SELECT_PLAYERS,
    TableMode.RESULT,
  ].includes(tableMode);
  const showNext = tableMode === TableMode.SELECT_PLAYERS;
  const isNextDisabled = !canGoNext(state);
  const showSave = tableMode === TableMode.RESULT;
  const isSaveDisabled = false; //todo do we really need disabled state for save? seems no

  const showHome = [TableMode.GAME, TableMode.BEFORE_START].includes(tableMode);
  const showRefresh = [
    TableMode.GAME,
    TableMode.BEFORE_START,
    TableMode.OTHER_PLAYER_TABLE,
  ].includes(tableMode);
  const showAdd = tableMode === TableMode.GAME;
  const showLog = [TableMode.GAME, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);

  // todo simplify
  const nextClickHandler = () => {
    if (
      state.currentScreen === 'paoSelect' &&
      state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON
    ) {
      const nextPaoWinnerId = getNextWinnerWithPao(state, state.multironCurrentWinner);
      if (nextPaoWinnerId !== undefined) {
        return () =>
          dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: nextPaoWinnerId } });
      }
    }

    return onNextClick(dispatch);
  };

  return {
    text: text,
    showBack: showBack,
    showNext: showNext,
    isNextDisabled: isNextDisabled,
    showHome: showHome,
    showRefresh: showRefresh,
    showAdd: showAdd,
    showLog: showLog,
    showSave: showSave,
    isSaveDisabled: isSaveDisabled,
    onNextClick: nextClickHandler(),
    onBackClick: onBackClick(dispatch),
    onSaveClick: onSaveClick(state, dispatch),
    onLogClick: onLogClick(dispatch),
    onAddClick: onAddClick(state, dispatch),
    onHomeClick: onHomeClick(dispatch),
    onRefreshClick: onRefreshClick(state, dispatch),
  };
}

function canGoNext(state: IAppState) {
  return mayGoNextFromPlayersSelect(state); //todo check (at least nagashi)
}

function getTableMode(state: IAppState): TableMode {
  if (state.timer?.waiting) {
    return TableMode.BEFORE_START;
  }

  switch (state.currentScreen) {
    case 'currentGame':
      return TableMode.GAME;
    case 'confirmation':
      return TableMode.RESULT;
    case 'otherTable':
      return TableMode.OTHER_PLAYER_TABLE;
    default: //todo
      return TableMode.SELECT_PLAYERS;
  }
}

export function getTableInfo(state: IAppState, dispatch: Dispatch): TableInfoProps | undefined {
  if (state.currentScreen === 'confirmation') {
    return undefined;
  }

  // todo show for showAdditionalTableInfo while confirmation

  let showTableNumber = false;
  const tableNumber = state.currentOtherTable?.tableIndex ?? state.tableIndex;
  let showRoundInfo = true;
  let showTimer = false;
  let isAutostartTimer = false;
  let currentTime: string | undefined = undefined;
  let gamesLeft: number | undefined = undefined;

  if (state.showAdditionalTableInfo) {
    if (state.currentScreen === 'currentGame') {
      showTableNumber = true;
      showRoundInfo = false;
    }
  } else if (state.timer !== undefined) {
    if (state.timer?.waiting) {
      if (state.tableIndex) {
        showTableNumber = true;
        showRoundInfo = false;
      }

      const timeRemaining = getAutostartTimeRemaining(state);
      if (timeRemaining !== undefined) {
        showTimer = true;
        isAutostartTimer = true;
        currentTime = formatTime(timeRemaining.minutes, timeRemaining.seconds);
      }
    } else if (state.currentScreen === 'currentGame' || state.currentScreen === 'outcomeSelect') {
      const timeRemaining = getTimeRemaining(state);
      if (timeRemaining !== undefined) {
        showTimer = true;
        if (timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
          gamesLeft = state.sessionState?.lastHandStarted ? 1 : 2;
        } else {
          currentTime = formatTime(timeRemaining.minutes, timeRemaining.seconds);
        }
      }
    }
  }

  return {
    showRotators: state.currentScreen === 'otherTable',
    showRoundInfo,
    showTableNumber,
    showTimer,
    isAutostartTimer,
    gamesLeft,
    round: roundToString(
      state.currentOtherTable?.state.roundIndex ?? state.sessionState?.roundIndex ?? 0
    ),
    honbaCount: state.currentOtherTable?.state.honbaCount ?? state.sessionState?.honbaCount ?? 0,
    riichiCount: state.currentOtherTable?.state.riichiCount ?? state.sessionState?.riichiCount ?? 0,
    currentTime,
    tableNumber,
    onTableInfoToggle: onTableInfoToggle(state, dispatch),
    onRotateCwClick: () => dispatch({ type: TABLE_ROTATE_CLOCKWISE }),
    onRotateCcwClick: () => dispatch({ type: TABLE_ROTATE_COUNTERCLOCKWISE }),
  };
}

type paymentInfo = {
  from?: number;
  to?: number;
  directAmount: number;
  riichiAmount: number;
  honbaAmount: number;
};
//todo add memorize
function getPaymentsInfo(state: IAppState): paymentInfo[] {
  const changesOverview = state.changesOverview;
  if (
    state.currentScreen !== 'confirmation' ||
    changesOverview === undefined ||
    state.loading.overview
  ) {
    return [];
  }

  const payments = changesOverview.payments;

  const result: paymentInfo[] = [];
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

export function getArrowsInfo(state: IAppState): ResultArrowsProps | undefined {
  if (
    state.currentScreen !== 'confirmation' ||
    state.changesOverview === undefined ||
    state.loading.overview
  ) {
    return undefined;
  }

  // todo hide for showAdditionalTableInfo

  //todo we get only one pao player from server, need to be fixes for multiron
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

  const sideByPlayer: Record<number, PlayerSide> = {
    [getToimen(state, 'confirmation').id]: PlayerSide.TOP,
    [getKamicha(state, 'confirmation').id]: PlayerSide.LEFT,
    [getShimocha(state, 'confirmation').id]: PlayerSide.RIGHT,
    [getSelf(state, 'confirmation').id]: PlayerSide.BOTTOM,
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

///////////////
// events
//////////////

function onWinButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_WINNER, payload: playerId });
}

function onNagashiButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_NAGASHI, payload: playerId });
}

function onPaoButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_PAO, payload: playerId });
}

function onDeadButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_DEADHAND, payload: playerId });
}

function onLoseButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_LOSER, payload: playerId });
}

function onRiichiButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_RIICHI, payload: playerId });
}

function onLogClick(dispatch: Dispatch) {
  return () => dispatch({ type: SHOW_GAME_LOG });
}

function onAddClick(state: IAppState, dispatch: Dispatch) {
  return () => {
    if (state.currentScreen === 'currentGame') {
      dispatch({ type: GOTO_NEXT_SCREEN });
    } else if (state.currentScreen === 'outcomeSelect') {
      dispatch({ type: GOTO_PREV_SCREEN });
    }
  };
}

function onHomeClick(dispatch: Dispatch) {
  return () => dispatch({ type: GOTO_PREV_SCREEN });
}

function onRefreshClick(state: IAppState, dispatch: Dispatch) {
  return () => {
    if (state.currentScreen === 'otherTable') {
      dispatch({ type: GET_OTHER_TABLE_RELOAD });
    } else {
      dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    }
  };
}

function onNextClick(dispatch: Dispatch) {
  return () => {
    dispatch({ type: GOTO_NEXT_SCREEN });
  };
}

function onBackClick(dispatch: Dispatch) {
  return () => dispatch({ type: GOTO_PREV_SCREEN });
}

function onSaveClick(state: IAppState, dispatch: Dispatch) {
  return () => dispatch({ type: ADD_ROUND_INIT, payload: state });
}

function onPlayerClick(state: IAppState, dispatch: Dispatch, playerId: number) {
  if (!['currentGame', 'otherTable'].includes(state.currentScreen) || state.timer?.waiting) {
    return undefined;
  }

  return () => {
    dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: playerId });
  };
}

//todo make canShowAdditionalInfo selector
function onTableInfoToggle(state: IAppState, dispatch: Dispatch) {
  if (state.currentScreen !== 'currentGame' && state.currentScreen !== 'confirmation') {
    return undefined;
  }

  if (state.currentScreen === 'currentGame') {
    const tableNumber = state.tableIndex;
    if (!tableNumber) {
      return undefined;
    }
  }

  return () => {
    dispatch({ type: TOGGLE_ADDITIONAL_TABLE_INFO });
  };
}
