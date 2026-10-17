import { Migration } from '@mikro-orm/migrations';

export class Migration20261018000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "player_history" alter column "avg_place" type real using "avg_place"::real;`
    );
    this.addSql(
      `insert into "jobs_queue" ("job_arguments", "job_name", "created_at")
       select json_build_object('eventId', "id")::text, 'scoring', now() from "event";`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`delete from "jobs_queue" where "job_name" = 'scoring';`);
    this.addSql(
      `alter table "player_history" alter column "avg_place" type int using "avg_place"::int;`
    );
  }
}
