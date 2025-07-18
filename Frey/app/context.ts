export interface Context {
  locale: string;
  authToken: string | null;
  personId: number | null;
  currentEventId: number | null;
}
