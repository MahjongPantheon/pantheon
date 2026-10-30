import { Migration } from '@mikro-orm/migrations';

export class Migration20261031000000 extends Migration {
  override async up(): Promise<void> {
    // Preserve enabled timed chombo handling while retiring the old setting.
    this.addSql(`
      update "event"
      set "ruleset_config" = jsonb_set(
        "ruleset_config", '{rules}',
        (("ruleset_config" #> '{rules}') - 'chomboEndsGame') ||
        jsonb_build_object('chomboCountsAsHand',
          coalesce(("ruleset_config" #>> '{rules,chomboCountsAsHand}')::boolean, false) or
          coalesce(("ruleset_config" #>> '{rules,chomboEndsGame}')::boolean, false)
        )
      )
      where jsonb_typeof("ruleset_config" #> '{rules}') = 'object';
    `);
  }
}
