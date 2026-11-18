export const routes = [
  { path: '/', page: 'EventList' },
  { path: '/filter/:filter', page: 'EventList' },
  { path: '/page/:page', page: 'EventList' },
  { path: '/filter/:filter/page/:page', page: 'EventList' },
  { path: '/event/:eventId/info', page: 'EventInfo' },
  { path: '/event/:eventId/order/:orderBy', page: 'RatingTable' },
  { path: '/event/:eventId/order/:orderBy/from/:dateFrom', page: 'RatingTable' },
  { path: '/event/:eventId/order/:orderBy/to/:dateTo', page: 'RatingTable' },
  { path: '/event/:eventId/order/:orderBy/from/:dateFrom/to/:dateTo', page: 'RatingTable' },
  { path: '/event/:eventId/order/:orderBy/filter/:minGamesSelector', page: 'RatingTable' },
  {
    path: '/event/:eventId/order/:orderBy/filter/:minGamesSelector/from/:dateFrom',
    page: 'RatingTable',
  },
  {
    path: '/event/:eventId/order/:orderBy/filter/:minGamesSelector/to/:dateTo',
    page: 'RatingTable',
  },
  {
    path: '/event/:eventId/order/:orderBy/filter/:minGamesSelector/from/:dateFrom/to/:dateTo',
    page: 'RatingTable',
  },
  { path: '/event/:eventId/playersList', page: 'RegisteredPlayers' },
  { path: '/event/:eventId/tablesState', page: 'TablesState' },
  { path: '/event/:eventId/player/:playerId', page: 'PlayerStats' },
  { path: '/event/:eventId/player/:playerId/from/:dateFrom', page: 'PlayerStats' },
  { path: '/event/:eventId/player/:playerId/to/:dateTo', page: 'PlayerStats' },
  { path: '/event/:eventId/player/:playerId/from/:dateFrom/to/:dateTo', page: 'PlayerStats' },
  { path: '/event/:eventId/games', page: 'RecentGames' },
  { path: '/event/:eventId/games/page/:page', page: 'RecentGames' },
  { path: '/event/:eventId/game/:sessionHash', page: 'Game' },
  { path: '/event/:eventId/seriesRating', page: 'SeriesRating' },
  { path: '/event/:eventId/timer', page: 'Timer' },
  { path: '/event/:eventId/achievements', page: 'Achievements' },
  { path: '/event/:eventId/rules', page: 'EventRulesOverview' },
] as const;

export type Page = (typeof routes)[number]['page'];
