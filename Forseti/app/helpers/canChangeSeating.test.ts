// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  Event,
  EventType,
  GameConfig,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';
import { canChangeSeating } from './canChangeSeating';

const event = Event.initialize({ type: EventType.EVENT_TYPE_TOURNAMENT });
const config = GameConfig.initialize({ syncStart: true });
const startedConfig = GameConfig.initialize({
  syncStart: true,
  gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED,
});

describe('player seating changes', () => {
  it('waits for configuration and live tables to load', () => {
    expect(canChangeSeating(undefined, event, [])).toBe(false);
    expect(canChangeSeating(config, event)).toBe(false);
  });

  it('allows changes before seating and after a seating reset', () => {
    expect(canChangeSeating(config, event, [])).toBe(true);
    expect(canChangeSeating(startedConfig, event, [])).toBe(true);
  });

  it('locks changes while seating is generated', () => {
    expect(
      canChangeSeating(
        GameConfig.initialize({
          syncStart: true,
          gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY,
        }),
        event,
        []
      )
    ).toBe(false);
  });

  it.each([SessionStatus.SESSION_STATUS_INPROGRESS, SessionStatus.SESSION_STATUS_PREFINISHED])(
    'locks changes while a table is %s, even alongside finished tables',
    (status) => {
      expect(
        canChangeSeating(startedConfig, event, [
          TableState.initialize({ status: SessionStatus.SESSION_STATUS_FINISHED }),
          TableState.initialize({ status }),
        ])
      ).toBe(false);
    }
  );

  it('allows changes after all session results are finalized', () => {
    expect(
      canChangeSeating(startedConfig, event, [
        TableState.initialize({ status: SessionStatus.SESSION_STATUS_FINISHED }),
      ])
    ).toBe(true);
  });

  it('preserves changes for online and non-tournament events during games', () => {
    const tables = [TableState.initialize({ status: SessionStatus.SESSION_STATUS_INPROGRESS })];
    expect(
      canChangeSeating(config, Event.initialize({ type: EventType.EVENT_TYPE_ONLINE }), tables)
    ).toBe(true);
    expect(canChangeSeating(GameConfig.initialize({ syncStart: false }), event, tables)).toBe(true);
  });
});
