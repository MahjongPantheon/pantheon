import {
  Event,
  EventType,
  GameConfig,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';

export function canChangeSeating(config?: GameConfig, event?: Event, tables?: TableState[]) {
  if (!config) {
    return false;
  }
  if (!config.syncStart || event?.type === EventType.EVENT_TYPE_ONLINE) {
    return true;
  }
  return (
    tables !== undefined &&
    config.gamesStatus !== TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY &&
    !tables.some(
      (table) =>
        table.status === SessionStatus.SESSION_STATUS_INPROGRESS ||
        table.status === SessionStatus.SESSION_STATUS_PREFINISHED
    )
  );
}
