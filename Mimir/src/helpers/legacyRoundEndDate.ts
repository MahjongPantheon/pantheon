/** pg returns timestamps as Date objects; RoundEntity stores them as strings. */
export function legacyRoundEndDate(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}
