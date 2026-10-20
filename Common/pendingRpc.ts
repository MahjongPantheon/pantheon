// Preserve a logical submission across failed requests and page reloads.
// Callers supply either a client UUID or the server-issued next-round token.
const pending = new Map<string, string>();

export async function pendingRpc<T>(
  scope: string,
  request: unknown,
  newKey: () => string,
  send: (key: string) => Promise<T>
): Promise<T> {
  const storageKey = `pantheon:pending-rpc:${scope}:${JSON.stringify(request)}`;
  let key = pending.get(storageKey);
  try {
    key ??= sessionStorage.getItem(storageKey) ?? undefined;
  } catch {
    // Storage may be unavailable; retain protection for this page's lifetime.
  }
  key ??= newKey();
  pending.set(storageKey, key);
  try {
    sessionStorage.setItem(storageKey, key);
  } catch {
    // Keep the in-memory entry when browser storage is unavailable.
  }
  const forget = () => {
    if (pending.get(storageKey) === key) pending.delete(storageKey);
    try {
      if (sessionStorage.getItem(storageKey) === key) sessionStorage.removeItem(storageKey);
    } catch {
      // Browser storage may be unavailable.
    }
  };
  let result: T;
  try {
    result = await send(key);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      ['failed_precondition', 'already_exists'].includes(String(error.code))
    ) {
      forget();
    }
    throw error;
  }
  forget();
  return result;
}
