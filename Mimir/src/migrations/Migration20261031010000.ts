import { Migration } from '@mikro-orm/migrations';

export class Migration20261031010000 extends Migration {
  override async up(): Promise<void> {
    // Traverse saved messages without changing scalar losers in ron outcomes or hands.
    this.addSql(`
      create function pg_temp.migrate_chombo_losers(payload jsonb) returns jsonb
      language plpgsql as $$
      declare
        result jsonb;
        entry record;
        chombo jsonb;
        losers jsonb;
      begin
        if jsonb_typeof(payload) = 'array' then
          select coalesce(jsonb_agg(pg_temp.migrate_chombo_losers(value) order by ord), '[]'::jsonb)
          into result from jsonb_array_elements(payload) with ordinality as items(value, ord);
          return result;
        elsif jsonb_typeof(payload) <> 'object' or payload is null then
          return payload;
        end if;
        result := '{}'::jsonb;
        for entry in select key, value from jsonb_each(payload) loop
          result := result || jsonb_build_object(entry.key, pg_temp.migrate_chombo_losers(entry.value));
        end loop;
        chombo := result -> 'chombo';
        if jsonb_typeof(chombo) = 'object' and chombo ? 'loserId' then
          losers := case when jsonb_typeof(chombo -> 'loserIds') = 'array'
            then chombo -> 'loserIds' else '[]'::jsonb end;
          -- Zero is the default of the retired protobuf field, not a player ID.
          if jsonb_typeof(chombo -> 'loserId') = 'number' and (chombo ->> 'loserId')::numeric > 0
            and not losers @> jsonb_build_array(chombo -> 'loserId') then
            losers := losers || jsonb_build_array(chombo -> 'loserId');
          end if;
          result := jsonb_set(result, '{chombo}',
            (chombo - 'loserId') || jsonb_build_object('loserIds', losers));
        end if;
        return result;
      end;
      $$;
    `);
    for (const [table, column] of [
      ['round', 'last_session_state'],
      ['session', 'intermediate_results'],
      ['rpc_operation', 'response'],
    ]) {
      this.addSql(`
        update "${table}" set "${column}" = pg_temp.migrate_chombo_losers("${column}")
        where "${column}" is distinct from pg_temp.migrate_chombo_losers("${column}");
      `);
    }
    this.addSql('drop function pg_temp.migrate_chombo_losers(jsonb);');
  }
}
