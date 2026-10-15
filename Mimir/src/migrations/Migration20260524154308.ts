import { Migration } from '@mikro-orm/migrations';

export class Migration20260524154308 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create index "event_title_index" on "event" ("title");`);
    this.addSql(`create index "event_lobby_id_index" on "event" ("lobby_id");`);
    this.addSql(`create index "event_finished_index" on "event" ("finished");`);

    this.addSql(`create index "achievements_event_id_index" on "achievements" ("event_id");`);

    this.addSql(`create index "event_prescript_event_id_index" on "event_prescript" ("event_id");`);

    this.addSql(
      `create index "event_registered_players_ignore_seating_index" on "event_registered_players" ("ignore_seating");`
    );
    this.addSql(
      `create index "event_registered_players_event_id_player_id_index" on "event_registered_players" ("event_id", "player_id");`
    );

    this.addSql(`create index "jobs_queue_created_at_index" on "jobs_queue" ("created_at");`);

    this.addSql(`create index "player_history_event_id_index" on "player_history" ("event_id");`);

    this.addSql(
      `create index "player_stats_event_id_player_id_index" on "player_stats" ("event_id", "player_id");`
    );

    this.addSql(`create index "session_table_index_index" on "session" ("table_index");`);
    this.addSql(`create index "session_status_index" on "session" ("status");`);
    this.addSql(
      `create index "session_representational_hash_index" on "session" ("representational_hash");`
    );
    this.addSql(`create index "session_replay_hash_index" on "session" ("replay_hash");`);
    this.addSql(`create index "session_end_date_index" on "session" ("end_date");`);
    this.addSql(`create index "session_event_id_index" on "session" ("event_id");`);

    this.addSql(`create index "round_outcome_index" on "round" ("outcome");`);
    this.addSql(`create index "round_session_id_index" on "round" ("session_id");`);
    this.addSql(`create index "round_event_id_index" on "round" ("event_id");`);

    this.addSql(`create index "hand_round_id_index" on "hand" ("round_id");`);

    this.addSql(`create index "penalty_player_id_index" on "penalty" ("player_id");`);
    this.addSql(`create index "penalty_created_at_index" on "penalty" ("created_at");`);
    this.addSql(`create index "penalty_cancelled_index" on "penalty" ("cancelled");`);
    this.addSql(`create index "penalty_assigned_by_index" on "penalty" ("assigned_by");`);
    this.addSql(`create index "penalty_session_id_index" on "penalty" ("session_id");`);
    this.addSql(`create index "penalty_event_id_index" on "penalty" ("event_id");`);

    this.addSql(
      `create index "session_players_session_id_player_id_index" on "session_players" ("session_id", "player_id");`
    );

    this.addSql(
      `create index "session_results_session_id_index" on "session_results" ("session_id");`
    );
    this.addSql(`create index "session_results_event_id_index" on "session_results" ("event_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "event_title_index";`);
    this.addSql(`drop index "event_lobby_id_index";`);
    this.addSql(`drop index "event_finished_index";`);

    this.addSql(`drop index "achievements_event_id_index";`);

    this.addSql(`drop index "event_prescript_event_id_index";`);

    this.addSql(`drop index "event_registered_players_ignore_seating_index";`);
    this.addSql(`drop index "event_registered_players_event_id_player_id_index";`);

    this.addSql(`drop index "jobs_queue_created_at_index";`);

    this.addSql(`drop index "player_history_event_id_index";`);

    this.addSql(`drop index "player_stats_event_id_player_id_index";`);

    this.addSql(`drop index "session_table_index_index";`);
    this.addSql(`drop index "session_status_index";`);
    this.addSql(`drop index "session_representational_hash_index";`);
    this.addSql(`drop index "session_replay_hash_index";`);
    this.addSql(`drop index "session_end_date_index";`);
    this.addSql(`drop index "session_event_id_index";`);

    this.addSql(`drop index "round_outcome_index";`);
    this.addSql(`drop index "round_session_id_index";`);
    this.addSql(`drop index "round_event_id_index";`);

    this.addSql(`drop index "hand_round_id_index";`);

    this.addSql(`drop index "penalty_player_id_index";`);
    this.addSql(`drop index "penalty_created_at_index";`);
    this.addSql(`drop index "penalty_cancelled_index";`);
    this.addSql(`drop index "penalty_assigned_by_index";`);
    this.addSql(`drop index "penalty_session_id_index";`);
    this.addSql(`drop index "penalty_event_id_index";`);

    this.addSql(`drop index "session_players_session_id_player_id_index";`);

    this.addSql(`drop index "session_results_session_id_index";`);
    this.addSql(`drop index "session_results_event_id_index";`);
  }
}
