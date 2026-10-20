import { Migration } from '@mikro-orm/migrations';

export class Migration20261021000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "session" add column "next_round_token" varchar(255) not null default gen_random_uuid()::text;`
    );
    this.addSql(`alter table "session" alter column "next_round_token" drop default;`);
    this.addSql(
      `create table "rpc_operation" ("id" varchar(64) primary key, "request_hash" varchar(64) not null, "response" jsonb not null, "created_at" timestamptz not null);`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table "rpc_operation";`);
    this.addSql(`alter table "session" drop column "next_round_token";`);
  }
}
