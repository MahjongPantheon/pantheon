import { Migration } from '@mikro-orm/migrations';

export class Migration20261027000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      update "event"
      set "ruleset_config" = jsonb_set(
        "ruleset_config", '{rules}',
        (("ruleset_config" #> '{rules}') - 'withButtobi') ||
        jsonb_build_object('withTobi', "ruleset_config" #> '{rules,withButtobi}')
      )
      where "ruleset_config" #> '{rules,withButtobi}' is not null
        and "ruleset_config" #> '{rules,withTobi}' is null;
    `);
  }
}
