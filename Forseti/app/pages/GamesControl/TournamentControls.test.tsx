import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GameConfig,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb';
import type { EventsGetPrescriptedEventConfigResponse } from 'tsclients/proto/mimir.pb';
import { TournamentControls } from './TournamentControls';
import { MantineProvider } from '@mantine/core';

vi.mock('../../hooks/i18n', () => ({
  useI18n: () => ({ _t: (message: string) => message }),
}));

function fixture() {
  return {
    players: [],
    tablesState: [TableState.initialize({ status: SessionStatus.SESSION_STATUS_FINISHED })],
    eventConfig: GameConfig.initialize({ isPrescripted: true, syncEnd: true }),
    prescriptedConfig: {
      eventId: 1,
      errors: [],
      prescript: '1-2-3-4\n\n1-3-2-4',
      nextSessionIndex: 3,
    } satisfies EventsGetPrescriptedEventConfigResponse,
    toggleResults: vi.fn(),
    makeRandomSeating: vi.fn(),
    makeIntervalSeating: vi.fn(),
    makeSwissSeating: vi.fn(),
    makeNextPredefinedSeating: vi.fn(),
    startTimer: vi.fn(),
    notifyPlayers: vi.fn(),
    addExtraTime: vi.fn(),
    approveResults: vi.fn(),
    resetSeating: vi.fn(),
    seatingLoading: false,
  };
}

describe('prescripted tournament controls', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      }
    );
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function render(props = fixture()) {
    act(() =>
      root.render(
        <MantineProvider env='test'>
          <TournamentControls {...props} />
        </MantineProvider>
      )
    );
  }

  function control(testId: string) {
    return document.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  }

  it.each([false, true])(
    'keeps the rating toggle after script exhaustion (hidden: %s)',
    (hidden) => {
      const props = fixture();
      props.eventConfig.hideResults = hidden;
      render(props);

      expect(control('forseti-tournament-prescripted-exhausted')?.textContent).toBe(
        'No more prescripted sessions available'
      );
      expect(control('forseti-tournament-next-prescripted-seating-open')).toBeNull();
      const toggle = control('forseti-tournament-toggle-results-prescripted')!;
      expect(toggle.textContent).toBe(hidden ? 'Show results table' : 'Hide results table');
      act(() => toggle.click());
      expect(props.toggleResults).toHaveBeenCalledOnce();
      expect(props.makeNextPredefinedSeating).not.toHaveBeenCalled();
    }
  );

  it.each(['\n', '\r\n'])(
    'generates the available next seating with %j line endings',
    (newline) => {
      const props = fixture();
      props.prescriptedConfig.nextSessionIndex = 2;
      props.prescriptedConfig.prescript = ['1-2-3-4', '', '1-3-2-4'].join(newline);
      render(props);

      expect(control('forseti-tournament-prescripted-exhausted')).toBeNull();
      act(() => control('forseti-tournament-next-prescripted-seating-open')!.click());
      act(() => control('forseti-tournament-next-prescripted-seating-confirm')!.click());
      expect(props.makeNextPredefinedSeating).toHaveBeenCalledWith(
        WindShuffleMode.WIND_SHUFFLE_MODE_UNSPECIFIED
      );
    }
  );

  it.each([
    [SessionStatus.SESSION_STATUS_INPROGRESS, 'forseti-tournament-add-extra-time-open'],
    [SessionStatus.SESSION_STATUS_PREFINISHED, 'forseti-tournament-approve-sessions-open'],
  ])('keeps final active session controls for status %s', (status, testId) => {
    const props = fixture();
    props.tablesState[0].status = status;
    render(props);

    expect(control(testId)).not.toBeNull();
    expect(control('forseti-tournament-prescripted-exhausted')).toBeNull();
  });

  it.each(['\n', '\r\n'])(
    'keeps the final seating ready to start with %j line endings',
    (newline) => {
      const props = fixture();
      props.prescriptedConfig.nextSessionIndex = 2;
      props.prescriptedConfig.prescript = ['1-2-3-4', '', '1-3-2-4'].join(newline);
      props.prescriptedConfig.prescript += newline;
      props.eventConfig.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY;
      props.tablesState[0].status = SessionStatus.SESSION_STATUS_PLANNED;
      render(props);

      expect(control('forseti-tournament-start-timer-open')).not.toBeNull();
      expect(control('forseti-tournament-prescripted-exhausted')).toBeNull();
    }
  );

  it('does not restrict regular tournament seating', () => {
    const props = fixture();
    props.eventConfig.isPrescripted = false;
    render(props);

    expect(control('forseti-tournament-random-seating-open')).not.toBeNull();
    expect(control('forseti-tournament-prescripted-exhausted')).toBeNull();
  });
});
