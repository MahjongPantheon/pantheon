import { GameConfig, PlayerInSession, RoundOutcome, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { SelectHand } from './SelectHand';
import { componentHarness } from '../../../tests/componentHarness';
import type { IAppState } from '../../../store/interfaces';
import { initialState, initBlankOutcome } from '../../../store/state';
import { YakuId } from '../../../helpers/yaku';
import { yakuCommon, yakuRare, yakumans } from '../../../helpers/yakuLists';
import { yakuhai } from '../../../helpers/yakuhai';
import { makeYakuGraph, pack } from '../../../helpers/yakuCompatibility';
import type { IProps as HandProps } from '../../pages/Hand/Hand';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

vi.mock('../../pages/Hand/Hand', () => ({
  Hand: ({ hands }: HandProps) => <div data-testid='yaku-order'>{hands[0].yaku.join(',')}</div>,
}));

const harness = componentHarness();

it.each([false, true])(
  'passes configured yaku order to the hand view (restricted=%s)',
  (restricted: boolean) => {
    const configured = [...yakuCommon, ...yakuRare, ...yakumans]
      .map((yaku) => yaku.id)
      .filter((id) => !yakuhai.includes(id));
    const allowed = configured.filter((id) => !restricted || id % 2 === 0);
    const state: IAppState = {
      ...initialState,
      players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id })),
      gameConfig: GameConfig.initialize({
        rulesetConfig: RulesetConfig.initialize({
          allowedYaku: allowed,
          useAggregatedYakuhai: true,
        }),
      }),
      yakuList: makeYakuGraph(),
      currentOutcome: {
        ...initBlankOutcome(1, RoundOutcome.ROUND_OUTCOME_TSUMO),
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
        winner: 1,
        winnerIsDealer: true,
        han: 0,
        fu: 30,
        possibleFu: [30],
        yaku: pack([]),
        dora: 0,
        openHand: false,
        riichiBets: [],
      },
    };
    harness.render(<SelectHand state={state} dispatch={vi.fn()} newyear={false} />);
    expect(harness.container.querySelector('[data-testid="yaku-order"]')?.textContent).toBe(
      configured.filter((id) => id === YakuId.__OPENHAND || allowed.includes(id)).join(',')
    );
  }
);
