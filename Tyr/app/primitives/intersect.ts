export function intersect(arr1: any[], arr2: any[]) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    throw new Error('expected both arguments to be arrays');
  }
  const result = [];
  const len = arr1.length;
  for (let i = 0; i < len; i++) {
    const elem = arr1[i];
    if (arr2.includes(elem) && !result.includes(elem)) {
      result.push(elem);
    }
  }
  return result;
}
