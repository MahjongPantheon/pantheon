import { componentHarness } from '../../../tests/componentHarness';
import { TablePrimaryView, IProps } from './TablePrimaryView';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
vi.mock('../../base/FourSidedScreen/FourSidedScreen', () => ({
  FourSidedScreen: (props: Record<string, React.ReactNode>) => (
    <>
      {props.sideUp}
      {props.sideDown}
      {props.sideLeft}
      {props.sideRight}
    </>
  ),
}));
vi.mock('../../base/PlayerPlace/PlayerPlace', () => ({
  PlayerPlace: (props: Record<string, unknown>) => (
    <output data-testid={props.testIdPrefix}>{JSON.stringify(props)}</output>
  ),
}));
const view = componentHarness();
it('updates non-score player details immediately without waiting for points to change', () => {
  const player = { id: 1, playerName: 'Before', points: '25000', showInlineRiichi: false };
  const props = {
    self: player,
    shimocha: player,
    kamicha: player,
    toimen: player,
    tableStatus: {},
    rulesetConfig: {},
    onRefresh: vi.fn(),
  } as IProps;
  view.render(<TablePrimaryView {...props} />);
  view.render(
    <TablePrimaryView
      {...props}
      self={{ ...player, playerName: 'After', showInlineRiichi: true }}
    />
  );
  const self = JSON.parse(
    view.container.querySelector('[data-testid="tyr-table-player-self"]')!.textContent
  );
  expect(self).toMatchObject({ playerName: 'After', showInlineRiichi: true, points: '25000' });
});
