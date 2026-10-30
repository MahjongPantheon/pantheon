import { componentHarness } from '../../../tests/componentHarness';
import { i18n } from '../../i18n';
import { I18nService } from '../../../services/i18n';
import type { TableStatus as Props } from '../../../helpers/interfaces';
import { EndingPolicy } from 'tsclients/proto/atoms.pb';
import { TableStatus } from './TableStatus';

const view = componentHarness();
const loc = {
  _t: (s: string, values: unknown[] = []) => s.replace('%1', String(values[0])),
  _nt: (forms: string[], count: number) => forms[count === 1 ? 0 : 1].replace('%1', String(count)),
} as unknown as I18nService;
function render(extra: Partial<Props> = {}) {
  const props: Props = {
    width: 200,
    height: 200,
    tableIndex: 2,
    tableStatus: { playersCount: 4, roundIndex: 1, riichiCount: 0, honbaCount: 0 },
    timerState: {},
    ...extra,
  };
  view.render(
    <i18n.Provider value={loc}>
      <TableStatus {...props} />
    </i18n.Provider>
  );
}

it('displays round, table number and accumulated sticks', () => {
  render({ tableStatus: { playersCount: 4, roundIndex: 5, riichiCount: 2, honbaCount: 3 } });
  expect(view.container.textContent).toContain('Table #2');
  expect(view.container.querySelector('[data-testid="tyr-table-round"]')?.textContent).toBe('南1');
  expect(
    view.container.querySelector('[data-testid="tyr-table-riichi-count"]')?.textContent
  ).toContain('2');
  expect(
    view.container.querySelector('[data-testid="tyr-table-honba-count"]')?.textContent
  ).toContain('3');
});

it('hides table details until the tournament timer starts', () => {
  render({
    timerState: { useTimer: true, timerWaiting: true },
    showCallReferee: true,
    showRotateButtons: true,
  });
  expect(view.container.querySelector('[data-testid="tyr-table-round"]')).toBeNull();
  expect(view.container.querySelector('button')).toBeNull();
});

it.each([
  [65, undefined, false, '1:05'],
  [0, EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND, false, '2 deals left'],
  [0, EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND, true, '1 deal left'],
  [0, EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND, false, '1 deal left'],
  [-1, undefined, false, ''],
] as const)(
  'displays remaining time %s under policy %s',
  (
    secondsRemaining: number,
    endingPolicy: EndingPolicy | undefined,
    lastHandStarted: boolean,
    expected: string
  ) => {
    render({
      timerState: { useTimer: true, secondsRemaining },
      endingPolicy,
      tableStatus: {
        playersCount: 4,
        roundIndex: 1,
        riichiCount: 0,
        honbaCount: 0,
        lastHandStarted,
      },
    });
    if (expected) expect(view.container.textContent).toContain(expected);
    else
      expect(view.container.querySelector('[data-testid="tyr-table-timer"]')?.textContent).toBe('');
  }
);

it.each([false, true])(
  'invokes optional referee and rotation handlers when supplied: %s',
  (handlers: boolean) => {
    const referee = vi.fn(),
      cw = vi.fn(),
      ccw = vi.fn();
    render({
      showCallReferee: true,
      showRotateButtons: true,
      onCallRefereeClick: handlers ? referee : undefined,
      onCwRotateClick: handlers ? cw : undefined,
      onCcwRotateClick: handlers ? ccw : undefined,
    });
    for (const id of [
      'tyr-table-call-referee',
      'tyr-table-rotate-clockwise',
      'tyr-table-rotate-counterclockwise',
    ])
      view.click(`[data-testid="${id}"]`);
    for (const callback of [referee, cw, ccw])
      expect(callback.mock.calls.length).toBe(handlers ? 1 : 0);
  }
);

it('shows South 1 after three hands in sanma', () => {
  render({ tableStatus: { playersCount: 3, roundIndex: 4, riichiCount: 0, honbaCount: 0 } });
  expect(view.container.querySelector('[data-testid="tyr-table-round"]')?.textContent).toBe('南1');
});
