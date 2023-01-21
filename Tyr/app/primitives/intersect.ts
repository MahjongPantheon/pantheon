export function intersect<T>(arr1: T[], arr2: T[]) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    throw new Error('expected both arguments to be arrays');
  }
  const result: T[] = [];
  const len = arr1.length;
  for (let i = 0; i < len; i++) {
    const elem = arr1[i];
    if (arr2.includes(elem) && !result.includes(elem)) {
      result.push(elem);
    }
  }
  return result;
}
