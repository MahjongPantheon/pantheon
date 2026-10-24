import { Migration } from '@mikro-orm/migrations';

export class Migration20261024000000 extends Migration {
  override async up(): Promise<void> {
    // Keep historical IDs allowed, and enable individual yakuhai for existing events.
    this.addSql(`
      update "event"
      set "ruleset_config" = jsonb_set("ruleset_config", '{rules,allowedYaku}', (
        select jsonb_agg(distinct yaku)
        from jsonb_array_elements(
          ("ruleset_config" #> '{rules,allowedYaku}') ||
          '[48,49,50,51,52,53,54,55,56,57,58]'::jsonb
        ) as yaku
      ))
      where ("ruleset_config" #> '{rules,allowedYaku}') @> '[13]'::jsonb
         or ("ruleset_config" #> '{rules,allowedYaku}') @> '[14]'::jsonb
         or ("ruleset_config" #> '{rules,allowedYaku}') @> '[15]'::jsonb
         or ("ruleset_config" #> '{rules,allowedYaku}') @> '[16]'::jsonb;
    `);
  }
}
