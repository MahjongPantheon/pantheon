import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export interface Achievements {
  id: Generated<number>;
  event_id: number;
  /**
   * achievements precalculated data
   */
  data: string;
  last_update: string | null;
}

export interface Event {
  id: Generated<number>;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  /**
   * for timer, duration in seconds
   */
  game_duration: number | null;
  /**
   * for timer, unix datetime of last started timer
   */
  last_timer: number | null;
  is_online: number;
  is_team: number;
  sync_start: number;
  sync_end: number;
  auto_seating: number;
  sort_by_games: number;
  use_timer: number;
  use_penalty: number;
  allow_player_append: number;
  /**
   * host of statistics frontend
   */
  stat_host: string;
  /**
   * tenhou lobby id for online events
   */
  lobby_id: number | null;
  ruleset_config: string;
  timezone: string;
  series_length: number;
  games_status: string | null;
  hide_results: number;
  hide_achievements: number;
  is_prescripted: number;
  min_games_count: number;
  finished: number;
  next_game_start_time: number;
  time_to_start: number;
  is_listed: number;
  online_platform: string | null;
  allow_view_other_tables: number;
}

export interface EventPrescript {
  id: Generated<number>;
  event_id: number;
  /**
   * predefined event seating script
   */
  script: string;
  next_game: number;
}

export interface EventRegisteredPlayers {
  id: Generated<number>;
  event_id: number;
  player_id: number;
  local_id: number | null;
  replacement_id: number | null;
  ignore_seating: number;
  team_name: string | null;
}

export interface JobsQueue {
  id: Generated<number>;
  job_arguments: string;
  job_name: string;
  created_at: string;
}

export interface Penalty {
  id: Generated<number>;
  event_id: number;
  player_id: number;
  session_id: number | null;
  amount: number;
  assigned_by: number;
  cancelled: number;
  cancelled_reason: string | null;
  created_at: string;
  reason: string;
}

export interface PlayerHistory {
  id: Generated<number>;
  player_id: number;
  event_id: number;
  session_id: number;
  avg_place: number;
  chips: number | null;
  games_played: number;
  rating: number;
}

export interface PlayerStats {
  id: Generated<number>;
  player_id: number;
  event_id: number;
  /**
   * stats precalculated data
   */
  data: string;
  last_update: string | null;
}

export interface Round {
  id: Generated<number>;
  session_id: number;
  event_id: number;
  /**
   * ron, tsumo, draw, abortive draw or chombo
   */
  outcome: string;
  han: number | null;
  fu: number | null;
  /**
   * 1-4 means east1-4, 5-8 means south1-4, etc
   */
  round: number;
  /**
   * dora count
   */
  dora: number | null;
  uradora: number | null;
  kandora: number | null;
  kanuradora: number | null;
  /**
   * double or triple ron flag to properly display results of round
   */
  multi_ron: number | null;
  /**
   * comma-separated list of user ids who called riichi
   */
  riichi: string | null;
  /**
   * comma-separated yaku id list
   */
  yaku: string | null;
  /**
   * comma-separated list of tempai user ids
   */
  tempai: string | null;
  nagashi: string | null;
  /**
   * not null only on ron or tsumo
   */
  winner_id: number | null;
  /**
   * not null only on ron or chombo
   */
  loser_id: number | null;
  pao_player_id: number | null;
  /**
   * boolean, was winner's hand opened or not
   */
  open_hand: number;
  end_date: string | null;
  /**
   * session intermediate results before this round was registered
   */
  last_session_state: string | null;
}

export interface Session {
  id: Generated<number>;
  event_id: number;
  /**
   * planned / inprogress / prefinished / finished
   */
  status: string | null;
  /**
   * table number in tournament
   */
  table_index: number | null;
  /**
   * hash to find this game from client mobile app
   */
  representational_hash: string | null;
  start_date: string | null;
  end_date: string | null;
  /**
   * json-encoded results for in-progress sessions
   */
  intermediate_results: string | null;
  /**
   * original tenhou game link, for access to replay
   */
  orig_link: string | null;
  /**
   * tenhou game hash, for deduplication
   */
  replay_hash: string | null;
  extra_time: number;
}

export interface SessionPlayer {
  id: Generated<number>;
  order: number;
  player_id: number;
  session_id: number;
}

export interface SessionResults {
  id: Generated<number>;
  event_id: number;
  session_id: number;
  player_id: number;
  place: number;
  /**
   * how many points player has at the end, before any uma/oka calc
   */
  score: number;
  /**
   * resulting score after uma/oka and starting points subtraction
   */
  rating_delta: number;
  chips: number | null;
}

export interface Database {
  achievements: Achievements;
  event: Event;
  event_prescript: EventPrescript;
  event_registered_players: EventRegisteredPlayers;
  jobs_queue: JobsQueue;
  penalty: Penalty;
  player_history: PlayerHistory;
  player_stats: PlayerStats;
  round: Round;
  session: Session;
  session_player: SessionPlayer;
  session_results: SessionResults;
}
