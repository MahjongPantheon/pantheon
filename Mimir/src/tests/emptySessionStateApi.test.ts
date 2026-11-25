import { MikroORM } from '@mikro-orm/postgresql';
import { EventData, EventType } from 'tsclients/proto/atoms.pb.js';
import config from '../mikro-orm.config.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { MimirTest } from '../services/MimirTest.js';

const client = new MimirTest();
const orm = await MikroORM.init(config());
afterAll(() => orm.close());

it.each(['ema', 'sanma'] as const)(
  'reads empty legacy %s snapshots without changing the persisted state',
  async (preset) => {
    const ruleset = RulesetEntity.createRuleset(preset);
    const seating = preset === 'sanma' ? [3, 1, 2] : [3, 1, 4, 2];
    const { eventId } = await client.CreateEvent(
      EventData.initialize({
        type: EventType.EVENT_TYPE_LOCAL,
        title: 'Empty legacy session state',
        timezone: 'UTC',
        rulesetConfig: ruleset.rules,
      })
    );
    for (const id of seating) await client.RegisterPlayer(eventId, id);
    const { sessionHash } = await client.StartGame(eventId, seating);

    // Seeder defaults hide this legacy representation, so load the actual JSON shape.
    await orm.em
      .getConnection()
      .execute(
        'update "session" set "intermediate_results" = ?::jsonb where "representational_hash" = ?',
        ['{}', sessionHash]
      );

    for (const omitLastRound of [false, true]) {
      const { tables } = await client.GetTablesState({ eventId, omitLastRound });
      expect(tables).toHaveLength(1);
      expect(tables[0].sessionHash).toBe(sessionHash);
      expect(tables[0].players.map((player) => player.id)).toEqual(seating);
      expect(tables[0].scores.map(({ playerId, score }) => [playerId, score])).toEqual(
        seating.map((playerId) => [playerId, ruleset.rules.startPoints])
      );
      expect(tables[0].currentRoundIndex).toBe(1);
      expect(tables[0].lastRound).toBeFalsy();
    }

    const [saved] = await orm.em
      .getConnection()
      .execute('select "intermediate_results" from "session" where "representational_hash" = ?', [
        sessionHash,
      ]);
    expect(saved.intermediate_results).toEqual({});
  }
);
