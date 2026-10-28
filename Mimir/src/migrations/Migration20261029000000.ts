import { Migration } from '@mikro-orm/migrations';

export class Migration20261029000000 extends Migration {
  override async up(): Promise<void> {
    // Hold the table lock through cleanup and constraint creation.
    this.addSql('lock table "event_registered_players" in access exclusive mode;');
    // Keep the newest registration row and all its metadata for each player.
    this.addSql(`
      delete from "event_registered_players" as older
      using "event_registered_players" as newer
      where older."event_id" = newer."event_id"
        and older."player_id" = newer."player_id"
        and older."id" < newer."id";
    `);
    this.addSql(
      'alter table "event_registered_players" add constraint "event_registered_players_event_id_player_id_unique" unique ("event_id", "player_id");'
    );
    this.addSql('drop index "event_registered_players_event_id_player_id_index";');
  }

  override async down(): Promise<void> {
    this.addSql(
      'create index "event_registered_players_event_id_player_id_index" on "event_registered_players" ("event_id", "player_id");'
    );
    this.addSql(
      'alter table "event_registered_players" drop constraint "event_registered_players_event_id_player_id_unique";'
    );
  }
}
