import { Migration } from '@mikro-orm/migrations';

export class Migration20260524005214 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "event" ("id" serial primary key, "title" varchar(255) not null, "description" text not null, "start_time" timestamp null, "end_time" timestamp null, "game_duration" int null, "last_timer" int null, "is_online" int not null, "is_team" int not null, "sync_start" int not null, "sync_end" int not null, "auto_seating" int not null, "use_timer" int not null, "use_penalty" int not null, "allow_player_append" int not null, "stat_host" varchar(255) not null, "lobby_id" int null, "ruleset_config" jsonb null, "timezone" varchar(255) not null, "series_length" int not null, "games_status" varchar(255) null, "hide_results" int not null, "hide_achievements" int not null, "is_prescripted" int not null, "min_games_count" int not null, "finished" int not null, "is_listed" int not null, "online_platform" varchar(255) null, "allow_view_other_tables" int not null, "allow_manual_add_replay" int not null, "wind_shuffle_mode" varchar(255) null);`
    );
    this.addSql(`comment on column "event"."game_duration" is 'for timer, duration in seconds';`);
    this.addSql(
      `comment on column "event"."last_timer" is 'for timer, unix datetime of last started timer';`
    );
    this.addSql(`comment on column "event"."stat_host" is 'host of statistics frontend';`);
    this.addSql(`comment on column "event"."lobby_id" is 'tenhou lobby id for online events';`);

    this.addSql(
      `create table "achievements" ("id" serial primary key, "event_id" int not null, "data" jsonb not null, "last_update" timestamp null);`
    );
    this.addSql(`comment on column "achievements"."data" is 'achievements precalculated data';`);

    this.addSql(
      `create table "event_prescript" ("id" serial primary key, "event_id" int not null, "script" text not null, "next_game" int not null);`
    );
    this.addSql(
      `comment on column "event_prescript"."script" is 'predefined event seating script';`
    );
    this.addSql(
      `alter table "event_prescript" add constraint "event_prescript_event_id_unique" unique ("event_id");`
    );

    this.addSql(
      `create table "event_registered_players" ("id" serial primary key, "event_id" int not null, "player_id" int not null, "local_id" int null, "replacement_id" int null, "ignore_seating" int not null, "team_name" varchar(255) null);`
    );

    this.addSql(
      `create table "jobs_queue" ("id" serial primary key, "job_arguments" varchar(255) not null, "job_name" varchar(255) not null, "created_at" timestamp not null);`
    );

    this.addSql(
      `create table "player_history" ("id" serial primary key, "player_id" int not null, "event_id" int not null, "session_id" int not null, "avg_place" int not null, "chips" int null, "games_played" int not null, "rating" int not null);`
    );

    this.addSql(
      `create table "player_stats" ("id" serial primary key, "player_id" int not null, "event_id" int not null, "data" jsonb not null, "last_update" timestamp null);`
    );
    this.addSql(`comment on column "player_stats"."data" is 'stats precalculated data';`);

    this.addSql(
      `create table "session" ("id" serial primary key, "event_id" int not null, "status" varchar(255) null, "table_index" int null, "representational_hash" varchar(255) null, "start_date" timestamp null, "end_date" timestamp null, "intermediate_results" jsonb null, "orig_link" varchar(255) null, "replay_hash" varchar(255) null, "extra_time" int not null);`
    );
    this.addSql(
      `comment on column "session"."status" is 'planned / inprogress / prefinished / finished';`
    );
    this.addSql(`comment on column "session"."table_index" is 'table number in tournament';`);
    this.addSql(
      `comment on column "session"."representational_hash" is 'hash to find this game from client mobile app';`
    );
    this.addSql(
      `comment on column "session"."orig_link" is 'original tenhou game link, for access to replay';`
    );
    this.addSql(
      `comment on column "session"."replay_hash" is 'tenhou game hash, for deduplication';`
    );
    this.addSql(
      `comment on column "session"."extra_time" is 'extra time for the session in seconds';`
    );

    this.addSql(
      `create table "round" ("id" serial primary key, "session_id" int not null, "event_id" int not null, "outcome" varchar(255) not null, "round" int not null, "honba" int not null, "riichi" jsonb null, "end_date" timestamp null, "last_session_state" jsonb null);`
    );
    this.addSql(
      `comment on column "round"."outcome" is 'ron, tsumo, draw, abortive draw or chombo';`
    );
    this.addSql(
      `comment on column "round"."round" is '1-4 means east1-4, 5-8 means south1-4, etc';`
    );
    this.addSql(`comment on column "round"."honba" is 'count of honba sticks';`);
    this.addSql(`comment on column "round"."riichi" is 'list of user ids who called riichi';`);

    this.addSql(
      `create table "hand" ("id" serial primary key, "round_id" int not null, "han" int null, "fu" int null, "dora" int null, "uradora" int null, "kandora" int null, "kanuradora" int null, "yaku" jsonb null, "tempai" jsonb null, "nagashi" jsonb null, "winner_id" int null, "loser_id" int null, "pao_player_id" int null, "open_hand" boolean null);`
    );
    this.addSql(`comment on column "hand"."dora" is 'dora count';`);
    this.addSql(`comment on column "hand"."uradora" is 'ura dora count';`);
    this.addSql(`comment on column "hand"."kandora" is 'kandora count';`);
    this.addSql(`comment on column "hand"."kanuradora" is 'kanuradora count';`);
    this.addSql(`comment on column "hand"."yaku" is 'yaku id list';`);
    this.addSql(`comment on column "hand"."tempai" is 'list of tempai user ids';`);
    this.addSql(`comment on column "hand"."nagashi" is 'list of nagashi user ids';`);
    this.addSql(`comment on column "hand"."winner_id" is 'not null only on ron or tsumo';`);
    this.addSql(`comment on column "hand"."loser_id" is 'not null only on ron or chombo';`);
    this.addSql(
      `comment on column "hand"."open_hand" is 'boolean, was winner''s hand opened or not';`
    );

    this.addSql(
      `create table "penalty" ("id" serial primary key, "event_id" int not null, "player_id" int not null, "session_id" int null, "amount" int not null, "assigned_by" int not null, "cancelled" int not null, "cancelled_reason" varchar(255) null, "created_at" timestamp not null, "reason" text not null);`
    );

    this.addSql(
      `create table "session_players" ("id" serial primary key, "order" int not null, "player_id" int not null, "session_id" int not null);`
    );
    this.addSql(
      `comment on column "session_players"."order" is 'Order of the player at the table, 1 = first east, 2 = first south, etc';`
    );

    this.addSql(
      `create table "session_results" ("id" serial primary key, "event_id" int not null, "session_id" int not null, "player_id" int not null, "place" int not null, "score" int not null, "rating_delta" int not null, "chips" int null);`
    );
    this.addSql(
      `comment on column "session_results"."score" is 'how many points player has at the end, before any uma/oka calc';`
    );
    this.addSql(
      `comment on column "session_results"."rating_delta" is 'resulting score after uma/oka and starting points subtraction';`
    );

    this.addSql(
      `alter table "achievements" add constraint "achievements_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "event_prescript" add constraint "event_prescript_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "event_registered_players" add constraint "event_registered_players_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "player_history" add constraint "player_history_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "player_stats" add constraint "player_stats_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "session" add constraint "session_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "round" add constraint "round_session_id_foreign" foreign key ("session_id") references "session" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "round" add constraint "round_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "hand" add constraint "hand_round_id_foreign" foreign key ("round_id") references "round" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "penalty" add constraint "penalty_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "penalty" add constraint "penalty_session_id_foreign" foreign key ("session_id") references "session" ("id") on update cascade on delete set null;`
    );

    this.addSql(
      `alter table "session_players" add constraint "session_players_session_id_foreign" foreign key ("session_id") references "session" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "session_results" add constraint "session_results_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "session_results" add constraint "session_results_session_id_foreign" foreign key ("session_id") references "session" ("id") on update cascade;`
    );
  }
}
