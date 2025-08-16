import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('achievemnts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('data', 'text', (col) => col.notNull())
    .addColumn('last_update', 'timestamp')
    .execute();

  await db.schema
    .createIndex('achievements_event_id')
    .on('achievements')
    .column('event_id')
    .execute();

  await db.schema
    .createTable('event')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('title', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('start_time', 'timestamp')
    .addColumn('end_time', 'timestamp')
    .addColumn('game_duration', 'integer')
    .addColumn('last_timer', 'integer')
    .addColumn('is_online', 'integer', (col) => col.notNull())
    .addColumn('is_team', 'integer', (col) => col.notNull())
    .addColumn('sync_start', 'integer', (col) => col.notNull())
    .addColumn('sync_end', 'integer', (col) => col.notNull())
    .addColumn('auto_seating', 'integer', (col) => col.notNull())
    .addColumn('sort_by_games', 'integer', (col) => col.notNull())
    .addColumn('use_timer', 'integer', (col) => col.notNull())
    .addColumn('use_penalty', 'integer', (col) => col.notNull())
    .addColumn('allow_player_append', 'integer', (col) => col.notNull())
    .addColumn('stat_host', 'varchar', (col) => col.notNull())
    .addColumn('lobby_id', 'integer')
    .addColumn('ruleset_config', 'text', (col) => col.notNull())
    .addColumn('timezone', 'varchar', (col) => col.notNull())
    .addColumn('series_length', 'integer', (col) => col.notNull())
    .addColumn('games_status', 'varchar')
    .addColumn('hide_results', 'integer', (col) => col.notNull())
    .addColumn('hide_achievements', 'integer', (col) => col.notNull())
    .addColumn('is_prescripted', 'integer', (col) => col.notNull())
    .addColumn('min_games_count', 'integer', (col) => col.notNull())
    .addColumn('finished', 'integer', (col) => col.notNull())
    .addColumn('next_game_start_time', 'integer', (col) => col.notNull())
    .addColumn('time_to_start', 'integer', (col) => col.notNull())
    .addColumn('is_listed', 'integer', (col) => col.notNull())
    .addColumn('online_platform', 'varchar')
    .addColumn('allow_view_other_tables', 'integer', (col) => col.notNull())
    .execute();

  await db.schema.createIndex('event_finished').on('event').column('finished').execute();
  await db.schema.createIndex('event_lobby_id').on('event').column('lobby_id').execute();
  await db.schema.createIndex('event_title').on('event').column('title').using('btree').execute();

  await db.schema
    .createTable('event_prescript')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('script', 'text', (col) => col.notNull())
    .addColumn('next_game', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('event_prescript_event_id')
    .on('event_prescript')
    .column('event_id')
    .execute();

  await db.schema
    .createTable('event_registered_players')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('player_id', 'integer', (col) => col.notNull())
    .addColumn('local_id', 'integer')
    .addColumn('replacement_id', 'integer')
    .addColumn('ignore_seating', 'integer')
    .addColumn('team_name', 'varchar')
    .execute();

  await db.schema
    .createIndex('event_registered_players_event_player')
    .on('event_registered_players')
    .columns(['event_id', 'player_id'])
    .unique()
    .execute();

  await db.schema
    .createIndex('event_prescript_ignore_seating')
    .on('event_registered_players')
    .column('ignore_seating')
    .execute();

  await db.schema
    .createTable('jobs_queue')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('job_arguments', 'text', (col) => col.notNull())
    .addColumn('job_name', 'varchar', (col) => col.notNull())
    .addColumn('created_at', 'timestamp')
    .execute();

  await db.schema
    .createIndex('jobs_queue_created_at')
    .on('jobs_queue')
    .column('created_at')
    .execute();

  await db.schema
    .createTable('penalty')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('player_id', 'integer', (col) => col.notNull())
    .addColumn('session_id', 'integer')
    .addColumn('amount', 'integer', (col) => col.notNull())
    .addColumn('assigned_by', 'integer', (col) => col.notNull())
    .addColumn('cancelled', 'integer', (col) => col.notNull())
    .addColumn('cancelled_reason', 'text')
    .addColumn('created_at', 'timestamp')
    .addColumn('reason', 'text')
    .execute();

  await db.schema.createIndex('penalty_assigned_by').on('penalty').column('assigned_by').execute();
  await db.schema.createIndex('penalty_cancelled').on('penalty').column('cancelled').execute();
  await db.schema.createIndex('penalty_created_at').on('penalty').column('created_at').execute();
  await db.schema.createIndex('penalty_player_id').on('penalty').column('player_id').execute();
  await db.schema.createIndex('penalty_event_id').on('penalty').column('event_id').execute();
  await db.schema.createIndex('penalty_session_id').on('penalty').column('session_id').execute();

  await db.schema
    .createTable('player_history')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('player_id', 'integer', (col) => col.notNull())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('session_id', 'integer', (col) => col.notNull())
    .addColumn('avg_place', 'integer', (col) => col.notNull())
    .addColumn('chips', 'integer')
    .addColumn('games_played', 'integer', (col) => col.notNull())
    .addColumn('rating', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('player_history_event_id')
    .on('player_history')
    .column('event_id')
    .execute();
  await db.schema
    .createIndex('player_history_session_id')
    .on('player_history')
    .column('session_id')
    .execute();

  await db.schema
    .createIndex('player_history_event_player')
    .on('player_history')
    .columns(['event_id', 'player_id'])
    .execute();

  await db.schema
    .createTable('player_stats')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('player_id', 'integer', (col) => col.notNull())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('data', 'text', (col) => col.notNull())
    .addColumn('last_update', 'timestamp')
    .execute();

  await db.schema
    .createIndex('player_stats_event_player')
    .on('player_stats')
    .columns(['event_id', 'player_id'])
    .unique()
    .execute();

  await db.schema
    .createTable('round')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('session_id', 'integer', (col) => col.notNull())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('outcome', 'varchar', (col) => col.notNull())
    .addColumn('han', 'integer')
    .addColumn('fu', 'integer')
    .addColumn('round', 'integer', (col) => col.notNull())
    .addColumn('dora', 'integer')
    .addColumn('uradora', 'integer')
    .addColumn('kandora', 'integer')
    .addColumn('kanuradora', 'integer')
    .addColumn('multi_ron', 'integer')
    .addColumn('riichi', 'varchar')
    .addColumn('yaku', 'varchar')
    .addColumn('tempai', 'varchar')
    .addColumn('nagashi', 'varchar')
    .addColumn('winner_id', 'integer')
    .addColumn('loser_id', 'integer')
    .addColumn('pao_player_id', 'integer')
    .addColumn('open_hand', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('end_date', 'timestamp')
    .addColumn('last_session_state', 'text')
    .execute();

  await db.schema.createIndex('round_event_id').on('round').column('event_id').execute();
  await db.schema.createIndex('round_session_id').on('round').column('session_id').execute();
  await db.schema.createIndex('round_outcome').on('round').column('outcome').execute();

  await db.schema
    .createTable('session')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar')
    .addColumn('table_index', 'integer')
    .addColumn('representational_hash', 'varchar')
    .addColumn('start_date', 'timestamp')
    .addColumn('end_date', 'timestamp')
    .addColumn('intermediate_results', 'text')
    .addColumn('orig_link', 'varchar')
    .addColumn('replay_hash', 'varchar')
    .addColumn('extra_time', 'integer')
    .execute();

  await db.schema.createIndex('session_event_id').on('session').column('event_id').execute();
  await db.schema.createIndex('session_end_date').on('session').column('end_date').execute();
  await db.schema.createIndex('session_replay_hash').on('session').column('replay_hash').execute();
  await db.schema
    .createIndex('session_representational_hash')
    .on('session')
    .column('representational_hash')
    .execute();
  await db.schema.createIndex('session_status').on('session').column('status').execute();
  await db.schema.createIndex('session_table_index').on('session').column('table_index').execute();

  await db.schema
    .createTable('session_player')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('player_id', 'integer', (col) => col.notNull())
    .addColumn('session_id', 'integer', (col) => col.notNull())
    .addColumn('order', 'integer', (col) => col.notNull())
    .execute();
  await db.schema
    .createIndex('session_player_session_id')
    .on('session_player')
    .column('session_id')
    .execute();
  await db.schema
    .createIndex('session_player_session_id_player_id')
    .on('session_player')
    .columns(['session_id', 'player_id'])
    .unique()
    .execute();

  await db.schema
    .createTable('session_results')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('event_id', 'integer', (col) => col.notNull())
    .addColumn('session_id', 'integer', (col) => col.notNull())
    .addColumn('player_id', 'integer', (col) => col.notNull())
    .addColumn('place', 'integer', (col) => col.notNull())
    .addColumn('score', 'integer', (col) => col.notNull())
    .addColumn('rating_delta', 'real', (col) => col.notNull())
    .addColumn('chips', 'integer')
    .execute();

  await db.schema
    .createIndex('session_results_event_id')
    .on('session_results')
    .column('event_id')
    .execute();

  await db.schema
    .createIndex('session_results_session_id')
    .on('session_results')
    .column('session_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {}
