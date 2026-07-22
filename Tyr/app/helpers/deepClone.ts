// Credits: https://github.com/thebearingedge/deep-clone

type Data = number | string | boolean | null | undefined | Date | Data[] | { [key: string]: Data };

type FormatKey = (key: string) => string;

export default function deepClone<I, O = I>(
  value: I,
  formatKey?: FormatKey,
  refs: Map<I, O> = new Map<I, O>()
): O {
  const ref = refs.get(value);
  if (typeof ref !== 'undefined') return ref;
  if (Array.isArray(value)) {
    const clone: Data[] = [];
    refs.set(value, clone as O);
    for (let i = 0; i < value.length; i++) {
      clone[i] = deepClone(value[i], formatKey, refs) as any;
    }
    return clone as O;
  }
  if (value instanceof Date) return new Date(value.valueOf()) as O;
  if (!(value instanceof Object)) return value as unknown as O;
  const clone: Record<string, Data> = {};
  refs.set(value, clone as O);
  const keys = Object.keys(value);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < keys.length; i++) {
    const key = typeof formatKey === 'function' ? formatKey(keys[i]) : keys[i];
    // @ts-expect-error workaround
    clone[key] = deepClone(value[keys[i]] as any, formatKey, refs) as any;
  }
  return clone as O;
}

export function formatKeys(format: FormatKey) {
  return <I extends Data, O extends Data = I>(value: I) => deepClone<I, O>(value, format);
}

deepClone.formatKeys = formatKeys;
