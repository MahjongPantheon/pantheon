import { Migration } from '@mikro-orm/migrations';

export class Migration20261101000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "player_history" alter column "rating" type double precision using "rating"::double precision;`
    );
    this.addSql(
      `alter table "session_results" alter column "rating_delta" type double precision using "rating_delta"::double precision;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "player_history" alter column "rating" type int using "rating"::int;`);
    this.addSql(
      `alter table "session_results" alter column "rating_delta" type int using "rating_delta"::int;`
    );
  }
}
