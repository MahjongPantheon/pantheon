import {AppScreen, IAppState} from '#/store/interfaces';
import {Dispatch} from 'redux';
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
import {PlayerButtonMode, PlayerPointsMode} from '#/components/types/PlayerEnums';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {ItemSelect} from '#/components/general/select-modal/ItemSelect';
import {SelectModalProps} from '#/components/general/select-modal/SelectModal';
import {
  ADD_ROUND_INIT,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  INIT_BLANK_OUTCOME, SELECT_MULTIRON_WINNER, SHOW_GAME_LOG,
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
import {Outcome as OutcomeType, Outcome, Player} from '#/interfaces/common';
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
import {PlayerButtonProps} from '#/components/types/PlayerButtonProps';
import {TableMode} from '#/components/types/TableMode';
import {mayGoNextFromPlayersSelect} from '#/store/selectors/navbarSelectors';
import {PlayerArrow, PlayerSide, ResultArrowsProps} from '#/components/general/result-arrows/ResultArrowsProps';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {roundToString} from '#/components/helpers/Utils';
import {AppOutcome} from '#/interfaces/app';
import {playerHasYakuWithPao} from '#/store/util';
import {getWinningUsers} from '#/store/selectors/mimirSelectors';
import {getNextWinnerWithPao} from '#/store/selectors/paoSelectors';

// todo move to selectors most of code from here

export function getPlayerTopInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state);
  const playerBase = getToimen(state, purpose);
  const wind = getSeatToimen(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getPlayerLeftInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state)
  const playerBase = getKamicha(state, purpose)
  const wind = getSeatKamicha(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getPlayerRightInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state)
  const playerBase = getShimocha(state, purpose)
  const wind = getSeatShimocha(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getPlayerBottomInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state)
  const playerBase = getSelf(state, purpose)
  const wind = getSeatSelf(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getOutcomeModalInfo(state: IAppState, dispatch: Dispatch): SelectModalProps | undefined {
  if (state.currentScreen !== 'outcomeSelect') {
    return undefined
  }

  const onItemSelect = (outcome: Outcome) => {
    dispatch({ type: INIT_BLANK_OUTCOME, payload: outcome });
    dispatch({ type: GOTO_NEXT_SCREEN });
  }

  const items: ItemSelect[] = [
    {
      text: 'Ron',
      onSelect: () => {onItemSelect('ron')},
    },
    {
      text: 'Tsumo',
      onSelect: () => {onItemSelect('tsumo')},
    },
    {
      text: 'Exhaustive draw',
      onSelect: () => {onItemSelect('draw')},
    },
    {
      text: 'Chombo',
      onSelect: () => {onItemSelect('chombo')},
    },
  ];

  const gameConfig = state.gameConfig
  if (gameConfig) {
    if (gameConfig.withAbortives) {
      items.push(
        {
          text: 'Abortive draw',
          onSelect: () => {onItemSelect('abort')},
          unavailable: false,
        }
      )
    }

    if (gameConfig.withNagashiMangan) {
      items.push(
        {
          text: 'Nagashi mangan',
          onSelect: () => {onItemSelect('nagashi')},
          unavailable: false,
        }
      )
    }
  }

  return {
    items: items,
    onHide: () => {dispatch({ type: GOTO_PREV_SCREEN });},
  }
}

function getPurposeForType(state: IAppState): RoundPreviewSchemePurpose {
  //todo add other table and check
  const currentScreen = state.currentScreen;

  switch (currentScreen) {
    case 'confirmation':
      return 'confirmation';
    case 'overview':
    default:
      return 'overview';
  }
}

function getPlayerPaymentResult(player: Player, state: IAppState): number | string {
  const paymentsInfo = getPaymentsInfo(state);

  //todo add reverse mangan tsumo (mimir)
  if (paymentsInfo.length === 0 ) {
    if (state.changesOverview && state.changesOverview.outcome === 'chombo' && !!state.changesOverview.penaltyFor) {
      const penaltyFor = state.changesOverview.penaltyFor
      if (player.id === penaltyFor) {
        return 'Penalty'
      }
    }
  }

  let result = 0;
  paymentsInfo.forEach(item => {
    if ((item.from === player.id || item.to === player.id) && item.from !== item.to) {
      const payment = item.directAmount + item.riichiAmount + item.honbaAmount;
      const factor =  item.from === player.id ? -1 : 1
      result += payment * factor;
    }
  })

  return  result;
}

function getPlayer(player: Player, wind: string, state: IAppState, dispatch: Dispatch): PlayerProps {
  let rotated = false; //todo singleDeviceMode
  let pointsMode = PlayerPointsMode.IDLE; //todo check
  let points: number | string | undefined = player.score;
  let penaltyPoints: number | undefined = player.penalties; //todo check
  let inlineWind = true;
  let winButton: PlayerButtonProps | undefined = undefined;
  let loseButton: PlayerButtonProps | undefined = undefined;
  let riichiButton: PlayerButtonProps | undefined = undefined;
  let showDeadButton = false;
  let showInlineRiichi = false;
  const currentOutcome: AppOutcome | undefined = state.currentOutcome;

  switch (state.currentScreen) {
    case 'currentGame':
      if (state.overviewDiffBy) {
        const diffByPlayer = state.players?.find(x => x.id === state.overviewDiffBy);
        if (diffByPlayer) {
          points = player.score - diffByPlayer.score;
          if (points > 0) {
            points = `+${points}`
          }
          pointsMode = PlayerPointsMode.ACTIVE;
          penaltyPoints = undefined
        }
      }
      break;
    case 'confirmation':
      const paymentResult = getPlayerPaymentResult(player, state);
      points = paymentResult !== 0 ? paymentResult : undefined;
      if (typeof paymentResult === 'number') {
        if (paymentResult > 0) {
          pointsMode = PlayerPointsMode.POSITIVE;
          points = `+${points}`
        } else if (paymentResult < 0) {
          pointsMode = PlayerPointsMode.NEGATIVE;
        }
      } else {
        pointsMode = PlayerPointsMode.NEGATIVE;
      }

      const riichiPayments = state.changesOverview?.payments.riichi;
      const currentPlayerId = player.id;
      const savedRiichiKey = `${currentPlayerId}<-${currentPlayerId}`;
      if (riichiPayments && Object.keys(riichiPayments).indexOf(savedRiichiKey) !== -1) {
        showInlineRiichi = true;
      }
      break;
    case 'playersSelect':
      points = undefined;
      penaltyPoints = undefined;

      const selectedOutcome = currentOutcome?.selectedOutcome;
      if (!selectedOutcome) {
        throw new Error('empty outcome');
      }
      const hasWinButton = ['ron', 'tsumo', 'draw', 'nagashi'].includes(selectedOutcome);
      const hasLoseButton = ['ron', 'chombo'].includes(selectedOutcome);
      const hasRiichiButton = ['ron', 'tsumo', 'draw', 'abort', 'nagashi'].includes(selectedOutcome);

      showDeadButton = ['draw', 'nagashi'].includes(selectedOutcome) && deadPressed(state, player);

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
        throw new Error('empty outcome');
      }

      let paoButtonMode: PlayerButtonMode | undefined;
      let hasPaoButton = false

      switch (currentOutcome.selectedOutcome) {
        case 'ron':
          if (state.multironCurrentWinner === player.id) {
            points = 'Winner'
            pointsMode = PlayerPointsMode.POSITIVE
          } else if (currentOutcome.loser === player.id) {
            points = 'Loser'
            pointsMode = PlayerPointsMode.NEGATIVE
          } else {
            hasPaoButton = true
          }
          break;
        case 'tsumo':
          if (currentOutcome.winner !== player.id) {
            hasPaoButton = true
          } else {
            points = 'Winner'
            pointsMode = PlayerPointsMode.POSITIVE
          }
          break;
        default:
          throw new Error('wrong outcome for paoSelect');
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
  }



  return {
    name: player.displayName,
    wind: wind,
    points: points,
    penaltyPoints: penaltyPoints,
    pointsMode: pointsMode,
    rotated: rotated,
    inlineWind: inlineWind,
    winButton: winButton,
    loseButton: loseButton,
    riichiButton: riichiButton,
    showDeadButton: showDeadButton,
    onDeadButtonClick: onDeadButtonClick(dispatch, player.id),
    showInlineRiichi: showInlineRiichi,
    onPlayerClick: onPlayerClick(state, dispatch, player.id)
  }
}

function getTitleForOutcome(selectedOutcome: OutcomeType | undefined, currentScreen: AppScreen): string | undefined {
  // todo add i18n
  if (selectedOutcome === undefined) {
    return undefined
  }

  switch (selectedOutcome) {
    case 'ron':
    case 'tsumo':
      if (currentScreen === 'paoSelect') {
        return  'Select pao';
      }
      break;
    case 'nagashi':
      if (currentScreen === 'playersSelect') {
        return 'Select tempai';
      }
      break;
  }

  return getOutcomeName(selectedOutcome)
}

// todo replace with common selector
export function getOutcomeName(selectedOutcome: OutcomeType): string {
  switch (selectedOutcome) {
    case 'ron':
      return  'Ron';
    case 'tsumo':
      return  'Tsumo';
    case 'draw':
      return  'Draw';
    case 'abort':
      return  'Abort';
    case 'chombo':
      return  'Chombo';
    case 'nagashi':
      return 'Nagashi';
  }
}

export function getBottomPanel(state: IAppState, dispatch: Dispatch) {
  const tableMode = getTableMode(state);
  const selectedOutcome = state.currentOutcome && state.currentOutcome.selectedOutcome;

  const text = getTitleForOutcome(selectedOutcome, state.currentScreen)

  const showBack = tableMode === TableMode.SELECT_PLAYERS || tableMode ===  TableMode.RESULT;
  const showNext = tableMode === TableMode.SELECT_PLAYERS;
  const isNextDisabled = !canGoNext(state);
  const showSave = tableMode === TableMode.RESULT;
  const isSaveDisabled = false; //todo do we really need disabled state for save? seems no

  const showHome = [TableMode.GAME, TableMode.BEFORE_START, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);
  const showRefresh = [TableMode.GAME, TableMode.BEFORE_START, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);
  const showAdd = tableMode === TableMode.GAME;
  const showLog = [TableMode.GAME, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);

  // todo simplify
  const nextClickHandler = () => {
    if (state.currentScreen === 'paoSelect' && state.currentOutcome?.selectedOutcome === 'ron') {
      const nextPaoWinnerId = getNextWinnerWithPao(state, state.multironCurrentWinner)
      if (nextPaoWinnerId !== undefined) {
        return () => dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: nextPaoWinnerId} });
      }
    }

    return onNextClick(dispatch);
  }

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
    onRefreshClick: onRefreshClick(dispatch),
  }
}

function canGoNext(state: IAppState) {
  return mayGoNextFromPlayersSelect(state) //todo check (at least nagashi)
}

function getTableMode(state: IAppState): TableMode {
  switch (state.currentScreen) {
    case 'currentGame':
      return TableMode.GAME;
    case 'confirmation':
      return TableMode.RESULT;
    default: //todo
      return TableMode.SELECT_PLAYERS;
  }
}

export function getTableInfo(state: IAppState, dispatch: Dispatch): TableInfoProps | undefined {
  if (state.currentScreen === 'confirmation') {
    return undefined;
  }

  // todo show for showAdditionalTableInfo while confirmation

  let showTableNumber = false; // todo from state
  let showRoundInfo = true;

  if (state.showAdditionalTableInfo && state.currentScreen === 'currentGame') {
    showTableNumber = true;
    showRoundInfo = false;
  }

  return {
    showRoundInfo: showRoundInfo,
    showTableNumber: showTableNumber,
    showTimer: true, // todo
    gamesLeft: undefined, // todo
    round: roundToString(state.currentRound),
    honbaCount: state.honba,
    riichiCount: state.riichiOnTable,
    currentTime: undefined, // todo
    tableNumber: undefined, // todo
    onTableInfoToggle: onTableInfoToggle(state, dispatch),
  }
}

type paymentInfo = {
  from?: number,
  to?: number,
  directAmount: number,
  riichiAmount: number,
  honbaAmount: number,
}
//todo add memorize
function getPaymentsInfo(state: IAppState): paymentInfo[] {
  const changesOverview = state.changesOverview;
  if (state.currentScreen !== 'confirmation' || changesOverview === undefined || state.loading.overview) {
    return [];
  }

  const payments = changesOverview.payments;

  const result: paymentInfo[] = [];
  const separator = '<-';
  Object.keys(payments.direct || []).forEach(paymentItem => {
    const players = paymentItem.split(separator);

    if (players.length === 2) {
      const from = parseInt(players[1], 10);
      const to = parseInt(players[0], 10);

      const directAmount = payments.direct[paymentItem];

      const invertedPayment = `${from}${separator}${to}`;
      const invertedDirectAmount = payments.direct[invertedPayment];
      if (directAmount !== invertedDirectAmount) {
        const item = {
          from: from,
          to: to,
          directAmount: directAmount,
          riichiAmount: 0,
          honbaAmount: 0,
        };
        result.push(item);
      }
    }
  })

  Object.keys(payments.riichi || []).forEach(paymentItem => {
    const players = paymentItem.split('<-');
    const riichiAmount = payments.riichi[paymentItem];

    if (players.length === 2 && riichiAmount !== 0) {
      const from = players[1] ? parseInt(players[1], 10) : undefined;
      const to = players[0] ? parseInt(players[0], 10) : undefined;

      const currentArrow = result.find(arrow => arrow.to === to && arrow.from === from);
      if (currentArrow) {
        currentArrow.riichiAmount = riichiAmount;
      } else {
        const item = {
          from: from,
          to: to,
          directAmount: 0,
          riichiAmount: riichiAmount,
          honbaAmount: 0,
        };
        result.push(item);
      }
    }
  })

  Object.keys(payments.honba || []).forEach(paymentItem => {
    const players = paymentItem.split('<-');
    const honbaAmount = payments.honba[paymentItem];

    if (players.length === 2 && honbaAmount !== 0) {
      const from = parseInt(players[1], 10);
      const to = parseInt(players[0], 10);

      const currentArrow = result.find(arrow => arrow.to === to && arrow.from === from);
      if (currentArrow) {
        currentArrow.honbaAmount = honbaAmount;
      }
    }
  })

  return result;
}

export function getArrowsInfo(state: IAppState): ResultArrowsProps | undefined {
  const changesOverview = state.changesOverview;
  if (state.currentScreen !== 'confirmation' || changesOverview === undefined || state.loading.overview) {
    return undefined;
  }

  // todo hide for showAdditionalTableInfo

  //todo we get only one pao player from server, need to be fixes for multiron
  // const paoPlayer = changesOverview.paoPlayer

  let paoPlayersByWinners: number[] = [];
  if (changesOverview.paoPlayer) {
    if (state.currentOutcome?.selectedOutcome === 'tsumo') {
      if (state.currentOutcome.winner) {
        paoPlayersByWinners[state.currentOutcome.winner] = changesOverview.paoPlayer;
      }
    } else if (state.currentOutcome?.selectedOutcome === 'ron') {
      const wins = state.currentOutcome.wins;
      Object.keys(wins).forEach(winnerKey => {
        const winner = wins[winnerKey];
        if (winner.paoPlayerId && winner.winner) {
          paoPlayersByWinners[winner.winner] = winner.paoPlayerId
        }
      })
    }
  }

  const payments = getPaymentsInfo(state);

  const sideByPlayer: Record<number, PlayerSide> = {
    [getToimen(state, 'confirmation').id]: PlayerSide.TOP,
    [getKamicha(state, 'confirmation').id]: PlayerSide.LEFT,
    [getShimocha(state, 'confirmation').id]: PlayerSide.RIGHT,
    [getSelf(state, 'confirmation').id]: PlayerSide.BOTTOM,
  };

  const arrows: PlayerArrow[] = []
  payments.forEach(item => {
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
  })

  return {
      arrows: arrows
    };
}

///////////////
// events
//////////////

function onWinButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_WINNER, payload: playerId })
}

function onNagashiButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_NAGASHI, payload: playerId })
}

function onPaoButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_PAO, payload: playerId })
}

function onDeadButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_DEADHAND, payload: playerId })
}

function onLoseButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_LOSER, payload: playerId })
}

function onRiichiButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_RIICHI, payload: playerId })
}

function onLogClick(dispatch: Dispatch) {
  return () => dispatch({ type: SHOW_GAME_LOG })
}

function onAddClick(state: IAppState, dispatch: Dispatch) {
  return () => {
    if (state.currentScreen === 'currentGame') {
      dispatch({ type: GOTO_NEXT_SCREEN });
    } else if (state.currentScreen === 'outcomeSelect') {
      dispatch({ type: GOTO_PREV_SCREEN });
    }
  }
}

function onHomeClick(dispatch: Dispatch) {
  return () => dispatch({ type: GOTO_PREV_SCREEN });
}

function onRefreshClick(dispatch: Dispatch) {
  return () => dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
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
  return () => dispatch({ type: ADD_ROUND_INIT, payload: state })
}

function onPlayerClick(state: IAppState, dispatch: Dispatch, playerId: number) {
  if (state.currentScreen !== "currentGame") {
    return undefined
  }

  return () => {
    dispatch( { type: TOGGLE_OVERVIEW_DIFFBY, payload: playerId })
  }
}

//todo make canShowAdditionalInfo selector
function onTableInfoToggle(state: IAppState, dispatch: Dispatch) {
  if (state.currentScreen !== "currentGame" && state.currentScreen !== "confirmation") {
    return undefined;
  }

  if (state.currentScreen === "currentGame") {
    const tableNumber = undefined; // todo
    if (tableNumber === undefined) {
      return undefined;
    }
  }

  return () => {
    dispatch( { type: TOGGLE_ADDITIONAL_TABLE_INFO})
  }
}
