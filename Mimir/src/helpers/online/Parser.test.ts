import { readFileSync } from 'fs';
import { join } from 'path';
import { Yaku } from '../yaku.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { prepareTestEntities } from '../../tests/eventFixtures.js';
import { PlatformType, RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { OnlineParser } from './Parser.js';
import { vi } from 'vitest';

function expectReplayRounds(content: string, rounds: RoundEntity[]) {
  const expectedRounds = [...content.matchAll(/<INIT[^>]* seed="([^"]+)"/g)].map(([, seed]) => {
    const [round, honba] = seed.split(',').map(Number);
    return [round + 1, honba];
  });
  expect(rounds.map((round) => [round.round, round.honba])).toEqual(expectedRounds);
}

/**
 * Replay parser integration test suite
 */
describe('OnlinelogParserTest', () => {
  test('persists independent pre-round states from XML', async () => {
    const [repo, event] = await prepareTestEntities();
    try {
      const content = readFileSync(join(import.meta.dirname, 'testdata/usual.xml'), 'utf-8');
      const [session, , rounds] = await new OnlineParser(repo).parseToSession(event, content);
      const playerIds = session.intermediateResults!.playerIds;
      const initTokens = [...content.matchAll(/<INIT\b[^>]*>/g)].map(([token]) => ({
        counters: token
          .match(/seed="([^"]+)"/)![1]
          .split(',')
          .map(Number),
        scores: token
          .match(/ten="([^"]+)"/)![1]
          .split(',')
          .map((score) => Number(score) * 100),
      }));
      session.extraTime = 0;
      await repo.em.flush();
      const roundIds = rounds.map((round) => round.id);
      repo.em.clear();
      const savedRounds = await repo.em.find(
        RoundEntity,
        { id: { $in: roundIds } },
        { orderBy: { id: 1 } }
      );

      expect(savedRounds).toHaveLength(initTokens.length);
      savedRounds.forEach((round, index) => {
        const { counters, scores } = initTokens[index];
        expect(round.lastSessionState).toMatchObject({
          scores: Object.fromEntries(playerIds.map((id, seat) => [id, scores[seat]])),
          playerIds,
          round: counters[0] + 1,
          honba: counters[1],
          riichiBets: counters[2],
          ...(index > 0 ? { lastOutcome: savedRounds[index - 1].outcome } : {}),
        });
      });
    } finally {
      await repo.destroy();
    }
  });

  test.each([false, true])('uses the event yakuhai mode (aggregated=%s)', async (aggregated) => {
    const [repo, event] = await prepareTestEntities();
    try {
      event.ruleset.rules.useAggregatedYakuhai = aggregated;
      const content = readFileSync(join(import.meta.dirname, 'testdata/usual.xml'), 'utf-8');
      const [, , rounds] = await new OnlineParser(repo).parseToSession(event, content);
      const yaku = rounds.flatMap((round) => round.hands.flatMap((hand) => hand.yaku ?? []));
      const hasIndividual = yaku.some((id) => id >= Yaku.EAST_SEAT_WIND && id <= Yaku.WHITE_DRAGON);
      const hasAggregate = yaku.some((id) =>
        [Yaku.YAKUHAI1, Yaku.YAKUHAI2, Yaku.YAKUHAI3, Yaku.YAKUHAI4].includes(id)
      );
      expect(hasIndividual).toBe(!aggregated);
      expect(hasAggregate).toBe(aggregated);
    } finally {
      await repo.destroy();
    }
  });

  test('parseUsualGame', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/usual.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expectReplayRounds(content, rounds);
    expect(sessionEntity).toBeTruthy();
    expect(sessionEntity.intermediateResults?.scores).toEqual(results);

    let openHands = 0;
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.openHand) {
          openHands++;
        }
      }
    }

    expect(rounds.length).toBe(16);
    expect(openHands).toBe(7);
    await repo.destroy();
  });

  test('parseYakumanDoubleRon', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/doubleron.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('parseTripleYakuman', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/tripleyakuman.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('parseDoubleRonAndRiichiBets', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/doubleron_and_riichi.xml'),
      'utf-8'
    );
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('parseDoubleRonAndHonbaBets', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/doubleron_and_honba.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expectReplayRounds(content, rounds);
    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('parseNagashiMangan', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/nagashi.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expectReplayRounds(content, rounds);
    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('hanchanWithWestRound', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/west.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expectReplayRounds(content, rounds);
    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('hanchanWithWestRound', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/west.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    await repo.destroy();
  });

  test('parseRegressUsualGame', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/openhand_bug.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

    let openHands = 0;
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.openHand) {
          openHands++;
        }
      }
    }

    expect(rounds.length).toBe(9);
    expect(openHands).toBe(3);
    await repo.destroy();
  });

  test('ronWithPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/pao_ron.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds[2].hands[0].paoPlayerId).toBe(4);
    await repo.destroy();
  });

  test('tsumoWithPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/pao_tsumo.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds[1].hands[0].paoPlayerId).toBe(4);
    await repo.destroy();
  });

  test('yakumanTsumoNoDealerWithoutPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/suuankou_no_dealer_tsumo_no_pao.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    let paoApplyCount = 0;
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.paoPlayerId) {
          paoApplyCount++;
        }
      }
    }

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(paoApplyCount).toBe(0);
    await repo.destroy();
  });

  test('yakumanTsumoDealerWithoutPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/suukantsu_dealer_tsumo_no_pao.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    let paoApplyCount = 0;
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.paoPlayerId) {
          paoApplyCount++;
        }
      }
    }

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(paoApplyCount).toBe(0);
    await repo.destroy();
  });

  test('yakumanRonWithoutPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/yakuman_ron_no_pao.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    let paoApplyCount = 0;
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.paoPlayerId) {
          paoApplyCount++;
        }
      }
    }

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(paoApplyCount).toBe(0);
    await repo.destroy();
  });

  test('tripleRonDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/triple_ron_draw.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(13);
    expect(rounds[10].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
    await repo.destroy();
  });

  test('fourKanDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/four_kan_draw.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(11);
    expect(rounds[5].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
    await repo.destroy();
  });

  test('nineTerminalDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/nine_terminal_draw.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expectReplayRounds(content, rounds);
    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(12);
    expect(rounds[1].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
    await repo.destroy();
  });

  test('fourWindDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/four_wind_draw.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expectReplayRounds(content, rounds);
    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(12);
    expect(rounds[7].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
    await repo.destroy();
  });

  test('fourRiichiDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/four_riichi_draw.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(13);
    expect(rounds[6].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
    await repo.destroy();
  });

  describe('Ronin replays', () => {
    const usual = readFileSync(join(import.meta.dirname, 'testdata/usual.xml'), 'utf-8');
    const roninReplay = usual.replace('lobby="0"', 'lobby="3f2b8c1e-9a4d-4f6b-8e2a-1c5d7b9e0f13"');
    const nicknames = [0, 1, 2, 3].map((seat) =>
      decodeURIComponent(new RegExp(`<UN [^>]*n${seat}="([^"]*)"`).exec(usual)![1])
    );

    test('imports a Tenhou XML replay with a UUID lobby by Ronin nicknames', async () => {
      const [repo, event] = await prepareTestEntities();
      const lookup = vi.spyOn(repo.frey, 'FindByRoninIds');
      const tenhouLookup = vi.spyOn(repo.frey, 'FindByTenhouIds');

      const [, , rounds] = await new OnlineParser(repo).parseToSession(
        event,
        roninReplay,
        false,
        PlatformType.PLATFORM_TYPE_RONIN
      );

      expect(rounds.length).toBe(16);
      expect(lookup).toHaveBeenCalledWith({ ids: nicknames });
      expect(tenhouLookup).not.toHaveBeenCalled();
      await repo.destroy();
    });

    test('matches replay nicknames to Ronin IDs stored in another case', async () => {
      const [repo, event] = await prepareTestEntities();
      const registered = await repo.frey.FindByRoninIds({ ids: nicknames });
      vi.spyOn(repo.frey, 'FindByRoninIds').mockResolvedValue({
        people: registered.people.map((p) => ({ ...p, roninId: p.roninId.toUpperCase() })),
      });

      const [, , rounds] = await new OnlineParser(repo).parseToSession(
        event,
        roninReplay,
        false,
        PlatformType.PLATFORM_TYPE_RONIN
      );

      expect(rounds.length).toBe(16);
      await repo.destroy();
    });

    test('rejects a replay with an unregistered Ronin nickname', async () => {
      const [repo, event] = await prepareTestEntities();
      const registered = await repo.frey.FindByRoninIds({ ids: nicknames.slice(0, 3) });
      vi.spyOn(repo.frey, 'FindByRoninIds').mockResolvedValue(registered);

      await expect(
        new OnlineParser(repo).parseToSession(
          event,
          roninReplay,
          false,
          PlatformType.PLATFORM_TYPE_RONIN
        )
      ).rejects.toThrow(`Not all Ronin nicknames were registered in the system: ${nicknames[3]}`);
      await repo.destroy();
    });

    test('accepts NoName as a regular Ronin nickname', async () => {
      const [repo, event] = await prepareTestEntities();
      const content = roninReplay.replace(/(<UN [^>]*n0=")[^"]*"/, '$1NoName"');

      const [, , rounds] = await new OnlineParser(repo).parseToSession(
        event,
        content,
        false,
        PlatformType.PLATFORM_TYPE_RONIN
      );

      expect(rounds.length).toBe(16);
      await repo.destroy();
    });
  });
});
