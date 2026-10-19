import { Migration } from '@mikro-orm/migrations';

export class Migration20261019000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`drop index "session_replay_hash_index";`);
    this.addSql(
      `alter table "session" add constraint "session_replay_hash_index" unique ("replay_hash");`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "session" drop constraint "session_replay_hash_index";`);
    this.addSql(`create index "session_replay_hash_index" on "session" ("replay_hash");`);
  }
}
