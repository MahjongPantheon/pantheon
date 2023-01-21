export function roundToString(value: string | number): string {
  const v = parseInt(value.toString(), 10);
  if (v > 12) {
    return `北${v - 12}`;
  }
  if (v > 8) {
    return `西${v - 8}`;
  }
  if (v > 4) {
    return `南${v - 4}`;
  }
  return `東${v}`;
}
