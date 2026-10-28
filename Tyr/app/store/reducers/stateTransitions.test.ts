import {
  GameConfig,
  PlayerInSession,
  RegisteredPlayer,
  RoundOutcome,
  RulesetConfig,
} from 'tsclients/proto/atoms.pb';
import { YakuId } from '../../helpers/yaku';
import { commonReducer } from './commonReducer';
import { outcomeReducer } from './outcomeReducer';
import { initialState, initBlankOutcome } from '../state';
import type { IAppState } from '../interfaces';
import * as a from '../actions/interfaces';
import { getPlayers, defaultPlayer } from '../selectors/newGame';

function fixture(outcome: RoundOutcome): IAppState {
  return {
    ...initialState,
    players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id, score: 25000 })),
    gameConfig: GameConfig.initialize({
      rulesetConfig: RulesetConfig.initialize({ withTobi: true }),
    }),
    currentOutcome: initBlankOutcome(1, outcome),
  };
}
function change(state: IAppState, type: string, payload?: unknown) {
  return outcomeReducer(state, { type, payload } as a.AppActionTypes);
}

it('resets state independently and saves preferences without losing other settings', () => {
  const reset = commonReducer(initialState, { type: a.INIT_STATE });
  expect(reset).toEqual(initialState);
  expect(reset).not.toBe(initialState);
  let state = commonReducer(initialState, { type: a.SETTINGS_SAVE_LANG, payload: 'de' });
  state = commonReducer(state, { type: a.SETTINGS_SAVE_SINGLE_DEVICE_MODE, payload: true });
  expect(state.settings).toMatchObject({
    currentLang: 'de',
    singleDeviceMode: true,
    currentTheme: 'day',
  });
  state = commonReducer(state, { type: a.SET_STATE_SETTINGS, payload: undefined });
  expect(state.settings.currentLang).toBe('de');
  state = commonReducer(state, {
    type: a.SET_STATE_SETTINGS,
    payload: { currentLang: 'en', currentTheme: 'night', singleDeviceMode: false },
  });
  expect(state.settings).toEqual({
    currentLang: 'en',
    currentTheme: 'night',
    singleDeviceMode: false,
  });
  state = commonReducer(state, { type: a.TOGGLE_OVERVIEW_DIFFBY, payload: 2 });
  expect(state.overviewDiffBy).toBe(2);
  state = commonReducer(state, { type: a.TOGGLE_OVERVIEW_DIFFBY, payload: 2 });
  expect(state.overviewDiffBy).toBeUndefined();
  state = commonReducer(state, { type: a.TOGGLE_ADDITIONAL_TABLE_INFO });
  expect(state.showAdditionalTableInfo).toBe(true);
  expect(
    commonReducer(state, { type: a.TOGGLE_RIICHI_NOTIFICATION, payload: true })
      .riichiNotificationShown
  ).toBe(true);
  expect(
    commonReducer(state, { type: a.SHOW_NETWORK_DIALOG, payload: true }).networkDialogShown
  ).toBe(true);
  const advice = { winner: 1, lastYaku: YakuId.SANANKOU, expectedYaku: YakuId.SANANKOU as const };
  expect(commonReducer(state, { type: a.SET_YAKU_ADVICE, payload: advice }).yakuAdvice).toEqual(
    advice
  );
});

it.each([RoundOutcome.ROUND_OUTCOME_RON, RoundOutcome.ROUND_OUTCOME_TSUMO])(
  'selects and removes winners, hand values and pao for %s',
  (outcome: RoundOutcome) => {
    let state = fixture(outcome);
    state = change(state, a.TOGGLE_WINNER, 1);
    state = change(state, a.SET_DORA_COUNT, { winner: 1, count: 2 });
    state = change(state, a.SET_FU_COUNT, { winner: 1, count: 50 });
    state = change(state, a.SELECT_PAO, { winnerId: 1, paoId: 3 });
    const selected =
      state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON
        ? state.currentOutcome.wins[1]
        : state.currentOutcome;
    expect(selected).toMatchObject({
      winner: 1,
      winnerIsDealer: true,
      dora: 2,
      fu: 50,
      paoPlayerId: 3,
    });
    state = change(state, a.TOGGLE_WINNER, 1);
    if (state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON)
      expect(state.currentOutcome.wins).toEqual({});
    else expect(state.currentOutcome).toMatchObject({ winner: undefined });
    const withoutPlayers = change({ ...fixture(outcome), players: undefined }, a.TOGGLE_WINNER, 2);
    const hand =
      withoutPlayers.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON
        ? withoutPlayers.currentOutcome.wins[2]
        : withoutPlayers.currentOutcome;
    expect(hand).toMatchObject({ winner: 2, winnerIsDealer: false });
  }
);

it.each([RoundOutcome.ROUND_OUTCOME_RON, RoundOutcome.ROUND_OUTCOME_CHOMBO])(
  'selects and removes a loser for %s',
  (outcome: RoundOutcome) => {
    const initial = fixture(outcome);
    const selected = change(initial, a.TOGGLE_LOSER, 1);
    expect(selected.currentOutcome).toMatchObject({ loser: 1, loserIsDealer: true });
    expect(change(selected, a.TOGGLE_LOSER, 1).currentOutcome).toMatchObject({
      loser: undefined,
      loserIsDealer: false,
    });
    expect(
      change({ ...initial, players: undefined }, a.TOGGLE_LOSER, 2).currentOutcome
    ).toMatchObject({ loser: 2, loserIsDealer: false });
  }
);

it.each([RoundOutcome.ROUND_OUTCOME_DRAW, RoundOutcome.ROUND_OUTCOME_NAGASHI])(
  'cycles tempai, riichi and deadhand corrections for %s',
  (outcome: RoundOutcome) => {
    let state = fixture(outcome);
    state = change(state, a.TOGGLE_WINNER, 1);
    expect(state.currentOutcome).toMatchObject({ tempai: [1] });
    state = change(state, a.TOGGLE_WINNER, 1);
    expect(state.currentOutcome).toMatchObject({ tempai: [] });
    state = change(state, a.TOGGLE_RIICHI, 1);
    expect(state.currentOutcome).toMatchObject({ tempai: [1], riichiBets: [1] });
    expect(() => change(state, a.TOGGLE_DEADHAND, 1)).toThrow('Deadhand button cannot exist');
    state = change(state, a.TOGGLE_WINNER, 1);
    expect(state.currentOutcome).toMatchObject({ tempai: [], deadhands: [1] });
    expect(() => change(state, a.TOGGLE_WINNER, 1)).toThrow('Tempai button cannot exist');
    const restored = change(state, a.TOGGLE_DEADHAND, 1);
    expect(restored.currentOutcome).toMatchObject({ tempai: [1], deadhands: [] });
    state = change(state, a.TOGGLE_RIICHI, 1);
    expect(state.currentOutcome).toMatchObject({ riichiBets: [], deadhands: [] });
    expect(() => change(state, a.TOGGLE_DEADHAND, 1)).toThrow('without pressed riichi');
  }
);

it('toggles nagashi players and rejects actions incompatible with the chosen outcome', () => {
  let state = fixture(RoundOutcome.ROUND_OUTCOME_NAGASHI);
  state = change(state, a.TOGGLE_NAGASHI, 1);
  expect(state.currentOutcome).toMatchObject({ nagashi: [1] });
  state = change(state, a.TOGGLE_NAGASHI, 1);
  expect(state.currentOutcome).toMatchObject({ nagashi: [] });
  const chombo = fixture(RoundOutcome.ROUND_OUTCOME_CHOMBO);
  expect(change(chombo, a.TOGGLE_RIICHI, 1)).toBe(chombo);
  for (const type of [a.TOGGLE_WINNER, a.TOGGLE_DEADHAND, a.TOGGLE_NAGASHI, a.SELECT_PAO])
    expect(() =>
      change(fixture(RoundOutcome.ROUND_OUTCOME_ABORT), type, { winnerId: 1, paoId: 2 })
    ).toThrow();
  expect(() => change(fixture(RoundOutcome.ROUND_OUTCOME_DRAW), a.TOGGLE_LOSER, 1)).toThrow(
    'No losers'
  );
  for (const type of [a.INIT_REQUIRED_YAKU, a.TOGGLE_RIICHI, a.REMOVE_YAKU])
    expect(change(initialState, type, { id: 1, winner: 1 })).toBe(initialState);
  expect(
    change(initialState, a.INIT_BLANK_OUTCOME, RoundOutcome.ROUND_OUTCOME_DRAW).currentOutcome
  ).toMatchObject({ selectedOutcome: RoundOutcome.ROUND_OUTCOME_DRAW });
  expect(
    change(
      { ...initialState, sessionState: undefined },
      a.INIT_BLANK_OUTCOME,
      RoundOutcome.ROUND_OUTCOME_ABORT
    ).currentOutcome
  ).toMatchObject({ roundIndex: 0 });
  expect(change(initialState, 'unknown')).toBe(initialState);
});

it('orders available players and removes already-selected registrations', () => {
  const current = RegisteredPlayer.initialize({ id: 1, title: 'Self' });
  const alice = RegisteredPlayer.initialize({ id: 2, title: 'Alice' }),
    zoe = RegisteredPlayer.initialize({ id: 3, title: 'Zoe' });
  const state = { ...initialState, currentPlayerId: 1, allPlayers: [current, zoe, alice] };
  expect(getPlayers(state)).toEqual([defaultPlayer, current, alice, zoe]);
  expect(getPlayers({ ...state, newGameSelectedUsers: [alice] })).toEqual([
    defaultPlayer,
    current,
    zoe,
  ]);
  expect(getPlayers({ ...state, newGameSelectedUsers: [current] })).toEqual([
    defaultPlayer,
    alice,
    zoe,
  ]);
  expect(getPlayers(initialState)).toEqual([defaultPlayer]);
  expect(state.allPlayers).toEqual([current, zoe, alice]);
});
