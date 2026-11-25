import { act, StrictMode } from 'react';
import { componentHarness } from '../../../tests/componentHarness';
import { TabbedView } from './TabbedView';

const fixture = vi.hoisted(() => ({
  apis: [] as {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
    scrollTo: ReturnType<typeof vi.fn>;
    scrollPrev: ReturnType<typeof vi.fn>;
    scrollNext: ReturnType<typeof vi.fn>;
    canScrollNext: () => boolean;
    canScrollPrev: () => boolean;
    selectedScrollSnap: () => number;
    listeners: Map<string, Set<() => void>>;
  }[],
  calls: 0,
}));
vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), fixture.apis[fixture.calls++ % 2]],
}));
vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
const view = componentHarness();
beforeEach(() => {
  fixture.calls = 0;
  fixture.apis = [0, 1].map(() => {
    const listeners = new Map<string, Set<() => void>>();
    return {
      listeners,
      on: vi.fn((event: string, handler: () => void) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(handler);
      }),
      off: vi.fn((event: string, handler: () => void) => listeners.get(event)?.delete(handler)),
      scrollTo: vi.fn(),
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      canScrollNext: () => true,
      canScrollPrev: () => false,
      selectedScrollSnap: () => 1,
    };
  });
});
it('cleans both carousel subscriptions in StrictMode and uses the latest callback', () => {
  const oldChange = vi.fn(),
    newChange = vi.fn();
  const tabs = [
    { id: 1, title: 'One', content: <div>One</div> },
    { id: 2, title: 'Two', content: <div>Two</div> },
  ];
  const tree = (onChange: typeof oldChange) => (
    <StrictMode>
      <TabbedView tabs={tabs} onTabChange={onChange} />
    </StrictMode>
  );
  view.render(tree(oldChange));
  expect(fixture.apis[0].listeners.get('select')?.size).toBe(1);
  view.render(tree(newChange));
  act(() => fixture.apis[0].listeners.get('select')!.forEach((handler: () => void) => handler()));
  expect(oldChange).not.toHaveBeenCalled();
  expect(newChange).toHaveBeenCalledExactlyOnceWith(1);
  expect(fixture.apis[1].scrollTo).toHaveBeenCalledWith(1);
  expect(
    view.container.querySelector<HTMLButtonElement>('[aria-label="Previous tab"]')?.disabled
  ).toBe(true);
  view.unmount();
  expect(
    [
      ...fixture.apis.flatMap((api: { listeners: Map<string, Set<() => void>> }) => [
        ...api.listeners.values(),
      ]),
    ].every((handlers) => handlers.size === 0)
  ).toBe(true);
});
it('keeps tab content attached to its player when tabs reorder', () => {
  const tabs = [
    { id: 1, title: 'One', content: <input defaultValue='One' /> },
    { id: 2, title: 'Two', content: <input defaultValue='Two' /> },
  ];
  view.render(<TabbedView tabs={tabs} />);
  const input = view.container.querySelector('input');
  view.render(<TabbedView tabs={[...tabs].reverse()} />);
  expect(view.container.querySelectorAll('input')[1]).toBe(input);
});

it('advances one of three tabs at a time when carousel selection fires synchronously', () => {
  const indices = [0, 0];
  const select = (carousel: number, target: number) => {
    const next = Math.max(0, Math.min(2, target));
    if (indices[carousel] === next) return;
    indices[carousel] = next;
    fixture.apis[carousel].listeners.get('select')?.forEach((handler: () => void) => handler());
  };
  fixture.apis.forEach((api: (typeof fixture.apis)[number], index: number) => {
    api.selectedScrollSnap = () => indices[index];
    api.canScrollNext = () => indices[index] < 2;
    api.canScrollPrev = () => indices[index] > 0;
    api.scrollTo.mockImplementation((target: number) => select(index, target));
    api.scrollNext.mockImplementation(() => select(index, indices[index] + 1));
    api.scrollPrev.mockImplementation(() => select(index, indices[index] - 1));
  });
  const onChange = vi.fn();
  view.render(
    <TabbedView
      onTabChange={onChange}
      tabs={[1, 2, 3].map((id) => ({ id, title: `Player ${id}`, content: <div>Hand {id}</div> }))}
    />
  );
  for (const expected of [1, 2]) {
    view.click('[aria-label="Next tab"]');
    expect(indices).toEqual([expected, expected]);
  }
  for (const expected of [1, 0]) {
    view.click('[aria-label="Previous tab"]');
    expect(indices).toEqual([expected, expected]);
  }
  expect(onChange.mock.calls.map(([index]: [number]) => index)).toEqual([1, 2, 1, 0]);
});
