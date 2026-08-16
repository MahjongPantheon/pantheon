// ---- Type-level snake_case -> camelCase conversion ----

type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S;

type CamelCaseKeys<T> =
  T extends Array<infer U>
    ? Array<CamelCaseKeys<U>>
    : T extends object
      ? {
          [K in keyof T as CamelCase<K & string>]: CamelCaseKeys<T[K]>;
        }
      : T;

// ---- Runtime implementation ----

function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/gi, (_, char: string) => char.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp)
  );
}

/**
 * Recursively converts all snake_case keys in an object (including nested
 * objects and arrays) to camelCase. Non-plain-object values (Date, RegExp,
 * class instances, primitives) are left untouched.
 */
export function camelCaseKeys<T>(input: T): CamelCaseKeys<T> {
  if (Array.isArray(input)) {
    return input.map((item) => camelCaseKeys(item)) as CamelCaseKeys<T>;
  }

  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(input)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = camelCaseKeys(input[key]);
    }

    return result as CamelCaseKeys<T>;
  }

  return input as CamelCaseKeys<T>;
}
