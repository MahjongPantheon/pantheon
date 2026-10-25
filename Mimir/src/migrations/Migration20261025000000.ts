import { Migration } from '@mikro-orm/migrations';

export class Migration20261025000000 extends Migration {
  override async up(): Promise<void> {
    // Preserve aggregated entry/imports for events created before the mode setting.
    // New events default to separate names through the protocol and preset defaults.
    this.addSql(`
      update "event"
      set "ruleset_config" = jsonb_set(
        "ruleset_config", '{rules,useAggregatedYakuhai}', 'true'::jsonb
      )
      where "ruleset_config" #> '{rules}' is not null;
    `);
  }
}
