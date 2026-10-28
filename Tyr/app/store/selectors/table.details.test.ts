import {
  GameConfig,
  PlayerInSession,
  RoundOutcome,
  RulesetConfig,
  SessionState,
} from 'tsclients/proto/atoms.pb';
import { initialState, initBlankOutcome } from '../state';
import type { IAppState } from '../interfaces';
import { PlayerButtonMode, PlayerPointsMode } from '../../helpers/enums';
import { I18nService } from '../../services/i18n';
import {
  getArrows,
  getNagashiPlayerButtons,
  getOtherTablePlayerData,
  getOtherTableStatus,
  getOutcomeName,
  getOutcomeTitle,
  getPlayerButtons,
  getPlayerData,
  getTableStatus,
} from './table';
import { PlayerSide } from '../../components/base/ResultArrows/ResultArrowsProps';
import * as a from '../actions/interfaces';

const sides = ['self', 'shimocha', 'toimen', 'kamicha'] as const;
function fixture(outcome: RoundOutcome): IAppState {
  const current = initBlankOutcome(1, outcome);
  if ('riichiBets' in current) current.riichiBets = [2];
  if (current.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO) current.winner = 1;
  if (current.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON) {
    current.loser = 4;
    current.wins = {
      1: {
        winner: 1,
        winnerIsDealer: true,
        han: 3,
        dora: 0,
        fu: 40,
        possibleFu: [40],
        yaku: '',
        openHand: false,
      },
    };
  }
  if ('tempai' in current) current.tempai = [1];
  if ('deadhands' in current) current.deadhands = [3];
  if (current.selectedOutcome === RoundOutcome.ROUND_OUTCOME_CHOMBO) current.loser = 2;
  if (current.selectedOutcome === RoundOutcome.ROUND_OUTCOME_NAGASHI) current.nagashi = [1, 2, 3];
  const players = [1, 2, 3, 4].map((id) =>
    PlayerInSession.initialize({
      id,
      title: `Player ${id}`,
      score: 20000 + id * 1000,
      yakitori: true,
    })
  );
  return {
    ...initialState,
    currentPlayerId: 1,
    players,
    currentOtherTablePlayers: players,
    currentOutcome: current,
    currentScreen: 'confirmation',
    gameConfig: GameConfig.initialize({
      rulesetConfig: RulesetConfig.initialize({ withYakitori: true, withTobi: true }),
    }),
    sessionState: SessionState.initialize({
      roundIndex: 2,
      chombo: [{ playerId: 2, amount: 1000 }],
    }),
  };
}
const loc = { _t: (s: string) => s } as I18nService;
const outcomes = [
  RoundOutcome.ROUND_OUTCOME_RON,
  RoundOutcome.ROUND_OUTCOME_TSUMO,
  RoundOutcome.ROUND_OUTCOME_DRAW,
  RoundOutcome.ROUND_OUTCOME_NAGASHI,
  RoundOutcome.ROUND_OUTCOME_ABORT,
  RoundOutcome.ROUND_OUTCOME_CHOMBO,
];

it.each(outcomes)('builds player controls and indicators for %s', (outcome: RoundOutcome) => {
  const state = fixture(outcome);
  const dispatch = vi.fn();
  for (let i = 0; i < sides.length; i++) {
    const buttons = getPlayerButtons(sides[i], state, dispatch)!;
    expect(buttons.rotateActionIcons).toBe([undefined, 'cw', 'flip', 'ccw'][i]);
    for (const [callback, type] of [
      ['onWinButtonClick', a.TOGGLE_WINNER],
      ['onLoseButtonClick', a.TOGGLE_LOSER],
      ['onRiichiButtonClick', a.TOGGLE_RIICHI],
      ['onDeadButtonClick', a.TOGGLE_DEADHAND],
    ] as const) {
      if (buttons[callback]) {
        buttons[callback]();
        expect(dispatch).toHaveBeenLastCalledWith({ type, payload: i + 1 });
      }
    }
    const player = getPlayerData(sides[i], state)!;
    expect(player.id).toBe(i + 1);
    expect(player.showYakitori).toBe(true);
    if (outcome === RoundOutcome.ROUND_OUTCOME_CHOMBO) expect(player.showChomboSign).toBe(i === 1);
  }
  expect(getOutcomeTitle(state, loc).length).toBeGreaterThan(0);
  expect(getOutcomeName(loc, outcome).length).toBeGreaterThan(0);
  if (outcome === RoundOutcome.ROUND_OUTCOME_RON) {
    expect(getPlayerButtons('self', state, dispatch)?.winButton).toBe(PlayerButtonMode.PRESSED);
    expect(getPlayerButtons('kamicha', state, dispatch)?.loseButton).toBe(PlayerButtonMode.PRESSED);
    expect(getPlayerButtons('self', state, dispatch)?.loseButton).toBe(PlayerButtonMode.DISABLE);
  }
});

it('limits nagashi selection to three players and maps all seat rotations', () => {
  const state = fixture(RoundOutcome.ROUND_OUTCOME_NAGASHI);
  const dispatch = vi.fn();
  for (let i = 0; i < sides.length; i++) {
    const buttons = getNagashiPlayerButtons(sides[i], state, dispatch)!;
    expect(buttons.winButton).toBe(i === 3 ? PlayerButtonMode.DISABLE : PlayerButtonMode.PRESSED);
    buttons.onWinButtonClick!();
    expect(dispatch).toHaveBeenLastCalledWith({ type: a.TOGGLE_NAGASHI, payload: i + 1 });
  }
  const reset = {
    ...state,
    currentOutcome: { ...state.currentOutcome!, nagashi: [] },
  } as IAppState;
  expect(getNagashiPlayerButtons('self', reset, dispatch)?.winButton).toBe(PlayerButtonMode.IDLE);
});

it('shows signed score differences and clears penalty labels while comparing players', () => {
  const state = fixture(RoundOutcome.ROUND_OUTCOME_DRAW);
  state.overviewDiffBy = 2;
  for (const get of [getPlayerData, getOtherTablePlayerData]) {
    expect(get('self', state)).toMatchObject({
      points: '-1000',
      pointsMode: PlayerPointsMode.NEGATIVE,
      penaltyPoints: undefined,
    });
    expect(get('shimocha', state)).toMatchObject({
      points: '0',
      pointsMode: PlayerPointsMode.ACTIVE,
    });
    expect(get('toimen', state)).toMatchObject({
      points: '+1000',
      pointsMode: PlayerPointsMode.POSITIVE,
    });
    expect(get('self', { ...state, overviewDiffBy: 99 })?.points).toBe('21000');
  }
  expect(getPlayerData('shimocha', { ...state, overviewDiffBy: undefined })?.penaltyPoints).toBe(
    1000
  );
});

it('returns empty controls until players or outcomes are available', () => {
  expect(getPlayerData('self', initialState)).toBeNull();
  expect(getOtherTablePlayerData('self', initialState)).toBeNull();
  expect(getPlayerButtons('self', initialState, vi.fn())).toBeNull();
  expect(getNagashiPlayerButtons('self', initialState, vi.fn())).toBeNull();
  expect(getOutcomeTitle(initialState, loc)).toBe('');
  expect(getOutcomeName(loc, RoundOutcome.ROUND_OUTCOME_UNSPECIFIED)).toBe('');
  expect(getOutcomeName(loc, RoundOutcome.ROUND_OUTCOME_MULTIRON)).toBe('Ron');
  expect(getTableStatus({ ...initialState, sessionState: undefined }).tableStatus).toMatchObject({
    roundIndex: 0,
    honbaCount: 0,
    riichiCount: 0,
  });
});

it('exposes spectator rotation actions and rotated player winds and penalties', () => {
  const state = fixture(RoundOutcome.ROUND_OUTCOME_DRAW);
  const dispatch = vi.fn();
  state.currentOtherTable = { state: state.sessionState } as IAppState['currentOtherTable'];
  state.overviewViewShift = 1;
  expect(getOtherTablePlayerData('self', state)).toMatchObject({
    id: 2,
    currentWind: 'e',
    penaltyPoints: 1000,
  });
  const status = getOtherTableStatus(state, dispatch);
  status.onCwRotateClick!();
  status.onCcwRotateClick!();
  expect(dispatch).toHaveBeenCalledWith({ type: a.TABLE_ROTATE_CLOCKWISE });
  expect(dispatch).toHaveBeenCalledWith({ type: a.TABLE_ROTATE_COUNTERCLOCKWISE });
});

it('combines direct, riichi and honba payments into directional arrows', () => {
  const state = fixture(RoundOutcome.ROUND_OUTCOME_RON);
  if (state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON)
    state.currentOutcome.wins[1].paoPlayerId = 4;
  state.changesOverview = {
    round: {},
    payments: {
      direct: [
        { from: 4, to: 1, amount: 8000 },
        { from: 0, to: 1, amount: 0 },
      ],
      riichi: [
        { from: 4, to: 1, amount: 1000 },
        { from: 2, to: 1, amount: 1000 },
        { from: 0, to: 1, amount: 1000 },
        { from: 3, to: 1, amount: 0 },
      ],
      honba: [
        { from: 4, to: 1, amount: 300 },
        { from: 3, to: 1, amount: 300 },
        { from: 0, to: 1, amount: 0 },
      ],
    },
  } as IAppState['changesOverview'];
  expect(getArrows(state).arrows).toEqual([
    {
      points: 8000,
      honbaPoints: 300,
      withRiichi: true,
      withPao: true,
      start: PlayerSide.LEFT,
      end: PlayerSide.BOTTOM,
    },
    {
      points: 0,
      honbaPoints: 0,
      withRiichi: true,
      withPao: false,
      start: PlayerSide.RIGHT,
      end: PlayerSide.BOTTOM,
    },
  ]);
  expect(getArrows({ ...state, currentScreen: 'currentGame' }).arrows).toEqual([]);
  expect(getArrows({ ...state, changesOverview: undefined }).arrows).toEqual([]);
  expect(getArrows({ ...state, loading: { ...state.loading, overview: true } }).arrows).toEqual([]);
  const tsumo = fixture(RoundOutcome.ROUND_OUTCOME_TSUMO);
  tsumo.changesOverview = {
    ...state.changesOverview,
    round: { tsumo: { paoPlayerId: 4 } },
  } as IAppState['changesOverview'];
  expect(getArrows(tsumo).arrows[0].withPao).toBe(true);
});
