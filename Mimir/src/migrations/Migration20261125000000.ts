import { Migration } from '@mikro-orm/migrations';

export class Migration20261125000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "referee_note" (
      "id" serial primary key,
      "event_id" int not null,
      "player_id" int null,
      "author_id" int not null,
      "content" text not null,
      "created_at" timestamp not null,
      constraint "referee_note_event_id_foreign" foreign key ("event_id")
        references "event" ("id") on update cascade
    );`);
    this.addSql(
      'create index "referee_note_event_id_created_at_index" on "referee_note" ("event_id", "created_at");'
    );
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "referee_note" cascade;');
  }
}
