import { Migration } from '@mikro-orm/migrations';

export class Migration20261116000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      update "event"
      set "ruleset_config" = jsonb_set(
        "ruleset_config", '{rules}',
        (("ruleset_config" #> '{rules}') - 'honbaValue') ||
        jsonb_build_object('honbaValuePerPlayer',
          case
            when "ruleset_config" #> '{rules,honbaValuePerPlayer}' is not null
              then ("ruleset_config" #>> '{rules,honbaValuePerPlayer}')::numeric
            when "ruleset_config" #> '{rules,honbaValue}' is null then 100
            when coalesce(("ruleset_config" #>> '{rules,withSanma}')::boolean, false)
              and ("ruleset_config" #>> '{rules,honbaValue}')::numeric = 300 then 100
            else round(("ruleset_config" #>> '{rules,honbaValue}')::numeric /
              case when coalesce(("ruleset_config" #>> '{rules,withSanma}')::boolean, false)
                then 2 else 3 end)
          end
        )
      )
      where jsonb_typeof("ruleset_config" #> '{rules}') = 'object';
    `);
  }
}
