import { Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { RulesetEntity } from './Ruleset.entity.js';
import { PlatformType, TournamentGamesStatus } from 'tsclients/proto/atoms.pb.js';

@Entity({ tableName: 'event' })
export class EventEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'title' })
  title!: string;

  @Property({ fieldName: 'description', type: 'text' })
  description!: string;

  @Property({ fieldName: 'start_time', nullable: true })
  startTime?: string;

  @Property({ fieldName: 'end_time', nullable: true })
  endTime?: string;

  @Property({
    fieldName: 'game_duration',
    comment: 'for timer, duration in seconds',
    nullable: true,
  })
  gameDuration?: number;

  @Property({
    fieldName: 'last_timer',
    comment: 'for timer, unix datetime of last started timer',
    nullable: true,
  })
  lastTimer?: number;

  @Property({ fieldName: 'is_online' })
  isOnline!: number;

  @Property({ fieldName: 'is_team' })
  isTeam!: number;

  @Property({ fieldName: 'sync_start' })
  syncStart!: number;

  @Property({ fieldName: 'sync_end' })
  syncEnd!: number;

  @Property({ fieldName: 'auto_seating' })
  autoSeating!: number;

  @Property({ fieldName: 'sort_by_games' })
  sortByGames!: number;

  @Property({ fieldName: 'use_timer' })
  useTimer!: number;

  @Property({ fieldName: 'use_penalty' })
  usePenalty!: number;

  @Property({ fieldName: 'allow_player_append' })
  allowPlayerAppend!: number;

  @Property({ fieldName: 'stat_host', comment: 'host of statistics frontend' })
  statHost!: string;

  @Property({ fieldName: 'lobby_id', comment: 'tenhou lobby id for online events', nullable: true })
  lobbyId?: number;

  @Embedded({
    entity: () => RulesetEntity,
    nullable: true,
    object: true,
    fieldName: 'ruleset_config',
  })
  ruleset!: RulesetEntity;

  @Property({ fieldName: 'timezone' })
  timezone!: string;

  @Property({ fieldName: 'series_length' })
  seriesLength!: number;

  @Property({ fieldName: 'games_status', nullable: true })
  gamesStatus?: TournamentGamesStatus;

  @Property({ fieldName: 'hide_results' })
  hideResults!: number;

  @Property({ fieldName: 'hide_achievements' })
  hideAchievements!: number;

  @Property({ fieldName: 'is_prescripted' })
  isPrescripted!: number;

  @Property({ fieldName: 'min_games_count' })
  minGamesCount!: number;

  @Property({ fieldName: 'finished' })
  finished!: number;

  @Property({ fieldName: 'next_game_start_time' })
  nextGameStartTime!: number;

  @Property({ fieldName: 'time_to_start' })
  timeToStart!: number;

  @Property({ fieldName: 'is_listed' })
  isListed!: number;

  @Property({ fieldName: 'online_platform', nullable: true })
  onlinePlatform?: PlatformType;

  @Property({ fieldName: 'allow_view_other_tables' })
  allowViewOtherTables!: number;
}
