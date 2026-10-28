import { memoize } from './memoize';
type Controls = {
  clear: () => void;
  keys: () => IArguments[] | null;
  values: () => unknown[] | null;
  keyValues: () => {
    primitives: Record<string, unknown>;
    objects: WeakMap<object, unknown>;
  } | null;
};
afterEach(() => vi.useRealTimers());

it('caches primitive, object and function keys independently and clears every cache', () => {
  const calls = vi.fn();
  function fn(input: unknown) {
    calls(input);
    return { input };
  }
  const cached = memoize(fn) as typeof fn & Controls;
  const inputs = [1, '1', false, null, undefined, {}, () => {}];
  for (const input of inputs) expect(cached(input)).toBe(cached(input));
  expect(calls).toHaveBeenCalledTimes(inputs.length);
  expect(cached.keys()).toBeNull();
  expect(cached.values()).toBeNull();
  expect(cached.keyValues()?.objects).toBeInstanceOf(WeakMap);
  cached.clear();
  cached(inputs[0]);
  expect(calls).toHaveBeenCalledTimes(inputs.length + 1);
});

it('uses an explicit serializer for custom unary cache keys', () => {
  const calls = vi.fn();
  function fn(value: { id: number }) {
    calls(value);
    return { id: value.id };
  }
  const cached = memoize(fn, { serializer: (value: { id: number }) => value.id });
  expect(cached({ id: 1 })).toBe(cached({ id: 1 }));
  expect(calls).toHaveBeenCalledOnce();
  function symbolFn(value: symbol) {
    return { value };
  }
  const symbolCache = memoize(symbolFn, { serializer: (value: symbol) => value.description });
  expect(symbolCache(Symbol('key'))).toBe(symbolCache(Symbol('key')));
});

it('compares every argument, retains call signatures and separates different arities', () => {
  const fn = vi.fn((...args: number[]) => args.reduce((sum, value) => sum + value, 0));
  const cached = memoize(fn);
  expect(cached(1, 2)).toBe(3);
  expect(cached(1, 3)).toBe(4);
  expect(cached(1, 2)).toBe(3);
  expect(cached(1)).toBe(1);
  expect(fn).toHaveBeenCalledTimes(3);
  expect(cached.keys()?.map((args: IArguments) => Array.from(args))).toEqual([[1, 2], [1, 3], [1]]);
  expect(cached.values()).toEqual([3, 4, 1]);
  expect(cached.keyValues()).toBeNull();
  cached.clear();
  expect(cached.keys()).toEqual([]);
});

it('supports custom equality and a bounded number of compared arguments', () => {
  const fn = vi.fn((word: string) => word.toUpperCase());
  const equal = memoize(fn, {
    equals: (a: string, b: string) => a.toLowerCase() === b.toLowerCase(),
  });
  expect(equal('hello')).toBe('HELLO');
  expect(equal('HELLO')).toBe('HELLO');
  expect(fn).toHaveBeenCalledOnce();
  const pair = vi.fn((a: number, b: number) => a + b);
  const bounded = memoize(pair, { maxArgs: 1 });
  expect(bounded(1, 2)).toBe(3);
  expect(bounded(1, 3)).toBe(3);
  expect(pair).toHaveBeenCalledOnce();
});

it('expires primitive, weak and multiple-argument entries without sliding on cache hits', () => {
  vi.useFakeTimers();
  function unary(value: unknown) {
    return { value };
  }
  const primitive = memoize(unary, { maxAge: 10 });
  const object = {};
  const first = primitive(object);
  const number = primitive(1);
  vi.advanceTimersByTime(5);
  expect(primitive(object)).toBe(first);
  expect(primitive(1)).toBe(number);
  vi.advanceTimersByTime(5);
  expect(primitive(object)).not.toBe(first);
  expect(primitive(1)).not.toBe(number);
  const fn = vi.fn((a: number, b: number) => ({ a, b }));
  const multiple = memoize(fn, { maxAge: 10 });
  const result = multiple(1, 2);
  expect(multiple(1, 2)).toBe(result);
  vi.advanceTimersByTime(10);
  expect(multiple(1, 2)).not.toBe(result);
});
