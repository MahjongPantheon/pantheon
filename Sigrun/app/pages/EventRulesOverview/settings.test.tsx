import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Event, EventType, GameConfig, UmaType, WindShuffleMode } from 'tsclients/proto/atoms.pb';
import { YakuId } from '../../helpers/yaku';
import { I18nService } from '../../services/i18n';
import { LocalSettings } from './LocalSettings';
import { OnlineSettings } from './OnlineSettings';
import { TournamentSettings } from './TournamentSettings';
import { RulesetSettings } from './RulesetSettings';
import { YakuSettings } from './YakuSettings';

const i18n = { _t: (text: string) => text } as I18nService;
const event = Event.decode(
  Event.encode({
    title: 'Test event',
    description: 'Description',
    type: EventType.EVENT_TYPE_ONLINE,
    isListed: true,
    allowManualAddReplay: true,
  })
);
const config = GameConfig.decode(
  GameConfig.encode({
    timezone: 'Europe/Moscow',
    lobbyId: 123,
    isTeam: true,
    isPrescripted: true,
    windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    rulesetConfig: {
      startPoints: 30000,
      maxPenalty: 20000,
      minPenalty: 100,
      penaltyStep: 500,
      playAdditionalRounds: true,
      goalPoints: 35000,
      withYakitori: true,
      yakitoriPenalty: 1000,
      umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
      uma: { place1: 15000 },
      allowedYaku: [YakuId.EAST_SEAT_WIND],
      yakuWithPao: [],
      doubleYakuman: [],
    },
  })
);
beforeEach(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
  });
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const tree = () => (
  <MantineProvider env='test'>
    <LocalSettings config={config} i18n={i18n} />
    <OnlineSettings event={event} config={config} i18n={i18n} />
    <TournamentSettings config={config} i18n={i18n} />
    <RulesetSettings config={config} i18n={i18n} />
    <YakuSettings config={config} i18n={i18n} />
  </MantineProvider>
);

it('displays current event settings and keeps every control read-only', () => {
  const { container } = render(tree());
  expect(screen.getByLabelText<HTMLInputElement>('Max arbitrary penalty score').value).toBe(
    '20000'
  );
  expect(screen.getByLabelText<HTMLInputElement>('Step of arbitrary penalty scores').value).toBe(
    '500'
  );
  expect(screen.getByLabelText<HTMLInputElement>('Allow adding of replays manually').checked).toBe(
    true
  );
  expect(screen.getByLabelText<HTMLInputElement>('Balanced wind shuffle').checked).toBe(true);
  expect(screen.getByLabelText('Prescripted wind shuffle')).toBeTruthy();
  for (const input of container.querySelectorAll('input, textarea')) {
    expect((input as HTMLInputElement).readOnly).toBe(true);
  }
  const manualReplay = screen.getByLabelText<HTMLInputElement>('Allow adding of replays manually');
  fireEvent.click(manualReplay);
  expect(manualReplay.checked).toBe(true);
  fireEvent.click(screen.getByLabelText('Random wind shuffle'));
  expect(screen.getByLabelText<HTMLInputElement>('Balanced wind shuffle').checked).toBe(true);
});

it('matches yakuhai modes, preserving mixed seat/round wind values', () => {
  const { rerender } = render(
    <MantineProvider env='test'>
      <YakuSettings config={config} i18n={i18n} />
    </MantineProvider>
  );
  expect(screen.getByLabelText('East wind').getAttribute('aria-checked')).toBe('mixed');
  expect(screen.queryByLabelText('Yakuhai x1')).toBeNull();
  const aggregated = {
    ...config,
    rulesetConfig: {
      ...config.rulesetConfig,
      useAggregatedYakuhai: true,
      allowedYaku: [YakuId.YAKUHAI1],
    },
  };
  rerender(
    <MantineProvider env='test'>
      <YakuSettings config={aggregated} i18n={i18n} />
    </MantineProvider>
  );
  expect(screen.queryByLabelText('East wind')).toBeNull();
  expect(screen.getByLabelText<HTMLInputElement>('Yakuhai x1').checked).toBe(true);
});

it('hides conditional settings and renders on the server', () => {
  const hidden = {
    ...config,
    isPrescripted: false,
    rulesetConfig: {
      ...config.rulesetConfig,
      playAdditionalRounds: false,
      withYakitori: false,
      extraChomboPayments: true,
    },
  };
  render(
    <MantineProvider env='test'>
      <RulesetSettings config={hidden} i18n={i18n} />
      <TournamentSettings config={hidden} i18n={i18n} />
    </MantineProvider>
  );
  for (const label of [
    'Goal score',
    'Yakitori penalty',
    'Amount of chombo penalty',
    'Prescripted wind shuffle',
  ])
    expect(screen.queryByLabelText(label)).toBeNull();
  expect(renderToString(tree())).toContain('Max arbitrary penalty score');
});
