import {IAppState} from '#/store/interfaces';
import {Dispatch} from 'redux';
import {
  getKamicha, getSeatKamicha, getSeatSelf, getSeatShimocha,
  getSeatToimen, getShimocha, getSelf,
  getToimen,
  RoundPreviewSchemePurpose,
} from '#/store/selectors/roundPreviewSchemeSelectors';
import {PlayerButtonMode, PlayerPointsMode} from '#/components/types/PlayerEnums';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {ItemSelect} from '#/components/general/select-modal/ItemSelect';
import {SelectModalProps} from '#/components/general/select-modal/SelectModal';
import {GOTO_NEXT_SCREEN, GOTO_PREV_SCREEN, INIT_BLANK_OUTCOME} from '#/store/actions/interfaces';
import {Outcome, Player} from '#/interfaces/common';
import {
  paoPressed,
  showDeadButton,
  showLoseButton, showNagashiButton,
  showPaoButton,
  showRiichiButton,
  showWinButton,
  winPressed,
  losePressed,
  riichiPressed,
  deadPressed,
  nagashiPressed,
  winDisabled,
  loseDisabled,
  nagashiDisabled
} from '#/store/selectors/userItemSelectors';

export function getPlayerTopInfo(state: IAppState) {
  const purpose = getPurposeForType(state);
  const playerBase = getToimen(state, purpose);
  const wind = getSeatToimen(state, purpose);

  return getPlayer(playerBase, wind, state)
}

export function getPlayerLeftInfo(state: IAppState) {
  const purpose = getPurposeForType(state)
  const playerBase = getKamicha(state, purpose)
  const wind = getSeatKamicha(state, purpose);

  return getPlayer(playerBase, wind, state)
}

export function getPlayerRightInfo(state: IAppState) {
  const purpose = getPurposeForType(state)
  const playerBase = getShimocha(state, purpose)
  const wind = getSeatShimocha(state, purpose);

  return getPlayer(playerBase, wind, state)
}

export function getPlayerBottomInfo(state: IAppState) {
  const purpose = getPurposeForType(state)
  const playerBase = getSelf(state, purpose)
  const wind = getSeatSelf(state, purpose);

  return getPlayer(playerBase, wind, state)
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
      text: 'Abortive draw',
      onSelect: () => {onItemSelect('abort')},
      unavailable: false,
    },
    {
      text: 'Nagashi mangan',
      onSelect: () => {onItemSelect('nagashi')},
      unavailable: false,
    },
    {
      text: 'Chombo',
      onSelect: () => {onItemSelect('chombo')},
    },
  ];

  return {
    items: items,
    onHide: () => {dispatch({ type: GOTO_PREV_SCREEN });},
  }
}

export function getTableInfo(state: IAppState, dispatch: Dispatch) {

}

function getPurposeForType(state: IAppState) {
  let purpose: RoundPreviewSchemePurpose = 'overview'
  // switch (type) {
  //   case TableType.SELECT_OUTCOME:
  //     purpose = ''
  //     break
  //
  // }
  return purpose
}

function getPlayer(player: Player, wind: string, state: IAppState): PlayerProps {
  let rotated = false; //todo singleDeviceMode
  let pointsMode = PlayerPointsMode.IDLE; //todo check
  let points: number | undefined = player.score;
  let penaltyPoints: number | undefined = player.penalties; //todo check
  let inlineWind = true;
  let winButtonMode: PlayerButtonMode | undefined = undefined;
  let loseButtonMode: PlayerButtonMode | undefined = undefined;
  let riichiButtonMode: PlayerButtonMode | undefined = undefined;
  let showDeadButton = false;

  switch (state.currentScreen) {
    case 'playersSelect':
      points = undefined;
      penaltyPoints = undefined;

      if (winPressed(state, player)) {
        winButtonMode = PlayerButtonMode.PRESSED
      } else if (winDisabled(state, player)) {
        winButtonMode = PlayerButtonMode.DISABLE
      } else {
        winButtonMode = PlayerButtonMode.IDLE
      }

      if (losePressed(state, player)) {
        loseButtonMode = PlayerButtonMode.PRESSED
      } else if (loseDisabled(state, player)) {
        loseButtonMode = PlayerButtonMode.DISABLE
      } else {
        loseButtonMode = PlayerButtonMode.IDLE
      }

      if (riichiPressed(state, player)) {
        riichiButtonMode = PlayerButtonMode.PRESSED
      } else {
        riichiButtonMode = PlayerButtonMode.IDLE
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
    winButtonMode: winButtonMode,
    loseButtonMode: loseButtonMode,
    riichiButtonMode: riichiButtonMode,
    showDeadButton: showDeadButton,
  }
}

function getPlayerForTableIdle(): Pick<PlayerProps, 'inlineWind' | 'winButtonMode' | 'loseButtonMode' | 'riichiButtonMode' | 'showDeadButton'> {
  return {
  inlineWind: true,
  winButtonMode: undefined,
  loseButtonMode: undefined,
  riichiButtonMode: undefined,
  showDeadButton: false,
  }
}
