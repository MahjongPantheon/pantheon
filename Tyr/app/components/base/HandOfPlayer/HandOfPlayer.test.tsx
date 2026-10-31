import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { HandOfPlayer, IProps } from './HandOfPlayer';
import { YakuId } from '../../../helpers/yaku';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function renderHand(overrides: Partial<IProps> = {}) {
  const props: IProps = {
    playerId: 7,
    yaku: [YakuId.EAST_SEAT_WIND, YakuId.RED_DRAGON, YakuId.YAKUHAI3, YakuId.TANYAO],
    selectedYaku: [],
    disabledYaku: [],
    onYakuClick: vi.fn(),
    isYakuman: false,
    yakuHan: 1,
    doraCount: 0,
    doraValues: [0, 1],
    onDoraSelected: vi.fn(),
    fuCount: 30,
    fuValues: [30],
    onFuSelected: vi.fn(),
    paoSelectRequired: false,
    paoPlayers: [],
    ...overrides,
  };
  act(() => root.render(<HandOfPlayer {...props} />));
  return props;
}

it.each([
  [YakuId.EAST_SEAT_WIND, 'East', 'Ton.svg'],
  [YakuId.EAST_ROUND_WIND, 'East', 'Ton.svg'],
  [YakuId.SOUTH_SEAT_WIND, 'South', 'Nan.svg'],
  [YakuId.SOUTH_ROUND_WIND, 'South', 'Nan.svg'],
  [YakuId.WEST_SEAT_WIND, 'West', 'Shaa.svg'],
  [YakuId.WEST_ROUND_WIND, 'West', 'Shaa.svg'],
  [YakuId.NORTH_SEAT_WIND, 'North', 'Pei.svg'],
  [YakuId.NORTH_ROUND_WIND, 'North', 'Pei.svg'],
  [YakuId.RED_DRAGON, 'Red dragon', 'Chun.svg'],
  [YakuId.GREEN_DRAGON, 'Green dragon', 'Hatsu.svg'],
  [YakuId.WHITE_DRAGON, 'White dragon', 'Haku.svg'],
] as const)(
  'renders yaku %s as its tile with an accessible name',
  (id: YakuId, label: string, filename: string) => {
    renderHand({ yaku: [id] });
    const image = container.querySelector('img')!;
    expect(image.getAttribute('src')).toContain(filename);
    expect(image.alt).toBe(label);
    expect(image.title).toBe(label);
    expect(image.closest('button')?.textContent).toBe('');
  }
);

it('keeps aggregated yakuhai and other yaku as text', () => {
  renderHand({ yaku: [YakuId.YAKUHAI3, YakuId.TANYAO] });
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('[data-testid$="-yaku-15"]')?.textContent).toBe('Yakuhai x3');
  expect(container.querySelector('[data-testid$="-yaku-23"]')?.textContent).toBe('Tanyao');
});

it('keeps tile buttons selectable and respects disabled yaku', () => {
  const props = renderHand({ disabledYaku: [YakuId.RED_DRAGON] });
  const east = container.querySelector<HTMLButtonElement>('[data-testid$="-yaku-48"]')!;
  const dragon = container.querySelector<HTMLButtonElement>('[data-testid$="-yaku-56"]')!;
  act(() => east.click());
  act(() => dragon.click());
  expect(props.onYakuClick).toHaveBeenCalledExactlyOnceWith(YakuId.EAST_SEAT_WIND, 7);
  expect(dragon.disabled).toBe(true);
});

it.each([
  [
    YakuId.EAST_SEAT_WIND,
    YakuId.SOUTH_SEAT_WIND,
    YakuId.WEST_SEAT_WIND,
    YakuId.NORTH_SEAT_WIND,
    YakuId.RED_DRAGON,
    YakuId.GREEN_DRAGON,
    YakuId.WHITE_DRAGON,
  ],
  [YakuId.YAKUHAI1, YakuId.YAKUHAI2, YakuId.YAKUHAI3, YakuId.YAKUHAI4],
])('groups yakuhai separately from the other buttons: %s', (...yaku: YakuId[]) => {
  renderHand({ yaku: [YakuId.__OPENHAND, ...yaku, YakuId.TANYAO, YakuId.RIICHI] });
  const group = container.querySelector('[data-testid="tyr-hand-player-7-yakuhai"]')!;
  expect(group.querySelector('h3')).toBeNull();
  expect(group.getAttribute('role')).toBe('group');
  expect(group.previousElementSibling?.getAttribute('data-testid')).toBe(
    'tyr-hand-player-7-yaku--1'
  );
  expect(group.nextElementSibling?.getAttribute('data-testid')).toBe('tyr-hand-player-7-yaku-23');
  expect(group.getAttribute('aria-label')).toBe('Yakuhai');
  expect(group.querySelectorAll('button')).toHaveLength(yaku.length);
  for (const id of yaku) expect(group.querySelector(`[data-testid$="-yaku-${id}"]`)).not.toBeNull();
  expect(group.querySelector('[data-testid$="-yaku-23"]')).toBeNull();
  expect(group.querySelector('[data-testid$="-yaku--1"]')).toBeNull();
});

it('omits the yakuhai row when no yakuhai are allowed', () => {
  renderHand({ yaku: [YakuId.TANYAO] });
  expect(container.querySelector('[data-testid="tyr-hand-player-7-yakuhai"]')).toBeNull();
});

it('orders dragon buttons red, white, green', () => {
  renderHand({ yaku: [YakuId.RED_DRAGON, YakuId.GREEN_DRAGON, YakuId.WHITE_DRAGON] });
  const buttons = container.querySelectorAll('[data-testid="tyr-hand-player-7-yakuhai"] button');
  expect(Array.from(buttons, (button) => button.getAttribute('data-testid'))).toEqual([
    'tyr-hand-player-7-yaku-56',
    'tyr-hand-player-7-yaku-58',
    'tyr-hand-player-7-yaku-57',
  ]);
});

it.each([false, true])('shows the double-wind badge whether selected=%s', (selected: boolean) => {
  renderHand({
    doubleWindYaku: YakuId.EAST_SEAT_WIND,
    selectedYaku: selected ? [YakuId.EAST_SEAT_WIND, YakuId.EAST_ROUND_WIND] : [],
  });
  const badges = container.querySelectorAll('[data-testid$="-double-wind"]');
  expect(badges).toHaveLength(1);
  expect(badges[0].textContent).toBe('x2');
  expect(badges[0].closest('button')?.getAttribute('data-testid')).toBe(
    'tyr-hand-player-7-yaku-48'
  );
});

it('does not show a multiplier on ordinary wind or dragon buttons', () => {
  renderHand();
  expect(container.querySelector('[data-testid$="-double-wind"]')).toBeNull();
});

it('joins aggregate labels and preserves each multiplier action and disabled state', () => {
  const ids = [YakuId.YAKUHAI1, YakuId.YAKUHAI2, YakuId.YAKUHAI3, YakuId.YAKUHAI4];
  const props = renderHand({ yaku: ids, disabledYaku: [YakuId.YAKUHAI4] });
  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('[data-testid$="-yakuhai"] button')
  );
  expect(buttons.map((button) => button.textContent)).toEqual(['Yakuhai x1', 'x2', 'x3', 'x4']);
  expect(buttons[1].querySelector('span')?.getAttribute('aria-label')).toBe('Yakuhai x2');
  for (const button of buttons) act(() => button.click());
  expect(props.onYakuClick).toHaveBeenCalledTimes(3);
  for (const id of ids.slice(0, 3)) {
    expect(props.onYakuClick).toHaveBeenCalledWith(id, 7);
  }
  expect(buttons[3].disabled).toBe(true);
});

it('keeps the supplied display order, including the position of the Yakuhai group', () => {
  renderHand({
    yaku: [YakuId.__OPENHAND, YakuId.ITTSU, YakuId.YAKUHAI1, YakuId.YAKUHAI2, YakuId.RIICHI],
  });
  expect(
    Array.from(container.querySelectorAll('[data-testid*="-yaku-"]'), (button) =>
      button.getAttribute('data-testid')
    )
  ).toEqual([
    `tyr-hand-player-7-yaku-${YakuId.__OPENHAND}`,
    `tyr-hand-player-7-yaku-${YakuId.ITTSU}`,
    `tyr-hand-player-7-yaku-${YakuId.YAKUHAI1}`,
    `tyr-hand-player-7-yaku-${YakuId.YAKUHAI2}`,
    `tyr-hand-player-7-yaku-${YakuId.RIICHI}`,
  ]);
});
