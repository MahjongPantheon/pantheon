import { createRuleset, Ruleset } from 'rulesets/ruleset';
import { Event as IEvent } from '../database/schema';

// Смотрим на https://mikro-orm.io/docs/quick-start - как будто это будет лучше чем просто query builder
//
// TODO: подумать как правильно раскидать доменные объекты. Обозначить связи между объектами.
// Возможно изобразить некое подобие доменной модели. Желательно чтобы слой сохранения был отдельно от бизнес-логики
// (мб в энтити? или в отдельных сервисах для сохранения в базу, тогда в энтити передавать объекты-сохраняторы).
// Подумать как обеспечить консистентность (транзакционный уровень).

export class Event {
  id: number | undefined = undefined;
  title = '';
  description = '';
  start_time: string | null = null;
  end_time: string | null = null;
  /**
   * for timer, duration in seconds
   */
  game_duration: number | null = null;
  /**
   * for timer, unix datetime of last started timer
   */
  last_timer: number | null = null;
  is_online = false;
  is_team = false;
  sync_start = false;
  sync_end = false;
  auto_seating = false;
  sort_by_games = false;
  use_timer = false;
  use_penalty = false;
  allow_player_append = false;
  /**
   * host of statistics frontend
   */
  stat_host = '';
  /**
   * tenhou lobby id for online events
   */
  lobby_id: number | null = null;
  ruleset_config?: Ruleset;
  timezone = '';
  series_length = 0;
  games_status: string | null = null;
  hide_results = false;
  hide_achievements = false;
  is_prescripted = false;
  min_games_count = 0;
  finished = false;
  next_game_start_time: number | null = null;
  time_to_start: number | null = null;
  is_listed = false;
  online_platform: string | null = null;
  allow_view_other_tables = false;

  toDatabase(): Omit<IEvent, 'id'> & { id?: number } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      start_time: this.start_time,
      end_time: this.end_time,
      game_duration: this.game_duration,
      last_timer: this.last_timer,
      is_online: this.is_online ? 1 : 0,
      is_team: this.is_team ? 1 : 0,
      sync_start: this.sync_start ? 1 : 0,
      sync_end: this.sync_end ? 1 : 0,
      auto_seating: this.auto_seating ? 1 : 0,
      sort_by_games: this.sort_by_games ? 1 : 0,
      use_timer: this.use_timer ? 1 : 0,
      use_penalty: this.use_penalty ? 1 : 0,
      allow_player_append: this.allow_player_append ? 1 : 0,
      stat_host: this.stat_host,
      lobby_id: this.lobby_id,
      ruleset_config: JSON.stringify(this.ruleset_config?.rules ?? {}),
      timezone: this.timezone,
      series_length: this.series_length,
      games_status: this.games_status,
      hide_results: this.hide_results ? 1 : 0,
      hide_achievements: this.hide_achievements ? 1 : 0,
      is_prescripted: this.is_prescripted ? 1 : 0,
      min_games_count: this.min_games_count,
      finished: this.finished ? 1 : 0,
      next_game_start_time: this.next_game_start_time ?? 0,
      time_to_start: this.time_to_start ?? 0,
      is_listed: this.is_listed ? 1 : 0,
      online_platform: this.online_platform,
      allow_view_other_tables: this.allow_view_other_tables ? 1 : 0,
    };
  }

  static fromDatabase(data: IEvent): Event {
    const e = new Event();
    e.id = Number(data.id);
    e.title = data.title;
    e.description = data.description;
    e.start_time = data.start_time;
    e.end_time = data.end_time;
    e.game_duration = data.game_duration;
    e.last_timer = data.last_timer;
    e.is_online = !!data.is_online;
    e.is_team = !!data.is_team;
    e.sync_start = !!data.sync_start;
    e.sync_end = !!data.sync_end;
    e.auto_seating = !!data.auto_seating;
    e.sort_by_games = !!data.sort_by_games;
    e.use_timer = !!data.use_timer;
    e.use_penalty = !!data.use_penalty;
    e.allow_player_append = !!data.allow_player_append;
    e.stat_host = data.stat_host;
    e.lobby_id = data.lobby_id;
    e.ruleset_config = createRuleset('custom', data.ruleset_config);
    e.timezone = data.timezone;
    e.series_length = data.series_length;
    e.games_status = data.games_status;
    e.hide_results = !!data.hide_results;
    e.hide_achievements = !!data.hide_achievements;
    e.is_prescripted = !!data.is_prescripted;
    e.min_games_count = data.min_games_count;
    e.finished = !!data.finished;
    e.next_game_start_time = data.next_game_start_time;
    e.time_to_start = data.time_to_start;
    e.is_listed = !!data.is_listed;
    e.online_platform = data.online_platform;
    e.allow_view_other_tables = !!data.allow_view_other_tables;
    return e;
  }
}
