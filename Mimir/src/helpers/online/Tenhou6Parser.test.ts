import { readFileSync } from 'fs';
import { join } from 'path';
import { EventEntity } from 'src/entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { init } from 'src/tests/initOrm.js';
import { PlatformType, RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { Repository } from 'src/services/Repository.js';
import { Tenhou6OnlineParser } from './Tenhou6Parser.js';
import { FreyServiceMock } from 'src/services/FreyMock.js';
import { MikroORM } from '@mikro-orm/core';

const makeEvent = (orm: MikroORM) => {
  const event = new EventEntity();
  event.title = 'title';
  event.timezone = 'UTC';
  event.description = 'desc';
  event.lobbyId = 0;
  event.isOnline = 1;
  event.isTeam = 0;
  event.syncStart = 0;
  event.syncEnd = 0;
  event.autoSeating = 0;
  event.sortByGames = 0;
  event.useTimer = 0;
  event.usePenalty = 0;
  event.allowPlayerAppend = 1;
  event.statHost = '';
  event.seriesLength = 0;
  event.hideResults = 0;
  event.hideAchievements = 0;
  event.isPrescripted = 0;
  event.minGamesCount = 0;
  event.finished = 0;
  event.nextGameStartTime = new Date().getTime();
  event.timeToStart = Date.now();
  event.isListed = 1;
  event.allowViewOtherTables = 1;
  event.ruleset = RulesetEntity.createRuleset('tenhounet');
  orm.em.persist(event);
  return event;
}

const makeRegs = (orm: MikroORM, event: EventEntity) => {
  const regs = [];
  for (const p of [1, 2, 3, 4]) {
    const reg = new EventRegisteredPlayersEntity();
    reg.playerId = p;
    reg.event = event;
    reg.ignoreSeating = 0;
    orm.em.persist(reg);
    regs.push(reg);
  }
  return regs;
};

const makeRepo = async () => {
  const orm = await init();
  await orm.schema.createSchema();
  orm.em.fork({ useContext: true })
  const repo = Repository.instance({}, orm);
  await repo.cache.connect();
  repo.mockFrey();
  (repo.frey as FreyServiceMock).mockMajsoul(
    { 1: 1, 2: 2, 3: 3, 4: 4 },
    { 1: 'TPlayer1', 2: 'プレーヤー2', 3: 'プレーヤー3', 4: 'プレーヤー4' }
  );
  return repo;
}

const prepareTestEntities = async () => {
  const repo = await makeRepo();
  const event = makeEvent(repo.db);
  const regs = makeRegs(repo.db, event);
  await repo.db.em.flush()
  return [repo, event, regs] as const;
}

/**
 * Replay parser integration test suite
 */
describe('Tenhou6ParserTest', () => {
  test('parseUsualGame', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/format6/usual.json'), 'utf-8');
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2023101214gm-00a9-0000-8cb902d4',
      content
    );

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

    expect(rounds.length).toBe(9);
    expect(openHands).toBe(3);

  });

  test('parseTensoulGame', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/tensoul_usual.json'),
      'utf-8'
    );

    event.onlinePlatform = PlatformType.PLATFORM_TYPE_MAHJONGSOUL;
    await repo.db.em.persistAndFlush(event);

    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '231014-84c11a6f-b3f7-4363-966e-25f37886cfbf',
      content,
      false,
      PlatformType.PLATFORM_TYPE_MAHJONGSOUL
    );

    expect(sessionEntity).toBeTruthy();
    expect(sessionEntity.intermediateResults?.scores).toEqual(results);

    let openHands = 0;
    let riichiCount = 0;
    let tempaiCount = 0;
    for (const round of rounds) {
      riichiCount += round.riichi?.length ?? 0;
      for (const hand of round.hands) {
        tempaiCount += hand.tempai?.length ?? 0;
        if (hand.openHand) {
          openHands++;
        }
      }
    }

    expect(rounds.length).toBe(8);
    expect(openHands).toBe(5);
    expect(riichiCount).toBe(4);
    expect(tempaiCount).toBe(3);

  });

  test('parseYakumanDoubleRon', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/doubleron.json'),
      'utf-8'
    );
    const [sessionEntity, results] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2009120221gm-0001-0000-8f264f66',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

  });

  test('parseDoubleRonAndHonbaBets', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/doubleron_and_honba.json'),
      'utf-8'
    );
    const [sessionEntity, results] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2018020420gm-0001-14423-3290b527',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

  });

  test('parseDoubleRonAndRiichiBets', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/doubleron_and_riichi.json'),
      'utf-8'
    );
    const [sessionEntity, results] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2009120221gm-0001-0000-8f264f66',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

  });

  test('parseNagashiMangan', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/nagashi_usual.json'),
      'utf-8'
    );
    const [sessionEntity, results] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2019020814gm-0061-0000-c1b0958b',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

  });

  test('parseTripleYakuman', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/tripleyakuman.json'),
      'utf-8'
    );
    const [sessionEntity, results] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2009100819gm-0049-0000-13bf5b23',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

  });

  test('parseHanchanWithWestRound', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(join(import.meta.dirname, 'testdata/format6/west.json'), 'utf-8');
    const [sessionEntity, results] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2017030413gm-0009-3821-485c5dae',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);

  });

  test('parseRonWithPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/pao_ron.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2012050716gm-0009-0000-85fac029',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds[2].hands[0].paoPlayerId).toBe(4);

  });

  test('parseTsumoWithPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/pao_tsumo.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2015010313gm-0009-0000-21763319',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds[1].hands[0].paoPlayerId).toBe(4);

  });

  test('yakumanTsumoNoDealerWithoutPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/suuankou_no_dealer_tsumo_no_pao.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2023100200gm-0029-0000-bbdb64ce',
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

  });

  test('yakumanTsumoDealerWithoutPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/suukantsu_dealer_tsumo_no_pao.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2015012609gm-0089-0000-1956db78',
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

  });

  test('yakumanRonWithoutPao', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/yakuman_ron_no_pao.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2023101322gm-0029-0000-01f88e5d',
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

  });

  test('tripleRonDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/triple_ron_draw.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2020020506gm-0009-7994-344ceb83',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(13);
    expect(rounds[10].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);

  });

  test('fourKanDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/four_kan_draw.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2014021417gm-0009-7447-00d6d80f',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(11);
    expect(rounds[5].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);

  });

  test('nineTerminalDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/nine_terminal_draw.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2014011202gm-0089-0000-c5a5f508',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(12);
    expect(rounds[1].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);

  });

  test('fourWindDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/four_wind_draw.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2015090309gm-0009-7447-fa717ec6',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(12);
    expect(rounds[7].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);

  });

  test('fourRiichiDraw', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/four_riichi_draw.json'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '2014081419gm-0009-7447-b66ad799',
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(13);
    expect(rounds[6].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);

  });

  test('parseTensoulGameWithSameNicknames', async () => {
    const [repo, event] = await prepareTestEntities();
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/format6/tensoul_with_same_nicknames.json'),
      'utf-8'
    );

    event.onlinePlatform = PlatformType.PLATFORM_TYPE_MAHJONGSOUL;
    await repo.db.em.persistAndFlush(event);

    (repo.frey as FreyServiceMock).mockMajsoul(
      { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
      { 1: 'TPlayer1', 2: 'プレーヤー2', 3: 'プレーヤー3', 4: 'プレーヤー4', 5: 'TPlayer1' }
    );

    const reg = new EventRegisteredPlayersEntity();
    reg.playerId = 5;
    reg.event = event;
    reg.ignoreSeating = 0;
    await repo.db.em.persistAndFlush(reg);

    const [sessionEntity, results, rounds] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      '240122-8211b2d1-2b15-499e-a845-e1095c1b964a',
      content,
      false,
      PlatformType.PLATFORM_TYPE_MAHJONGSOUL
    );

    expect(sessionEntity).toBeTruthy();
    expect(sessionEntity.intermediateResults?.scores).toEqual(results);

    let openHands = 0;
    let riichiCount = 0;
    let tempaiCount = 0;
    for (const round of rounds) {
      riichiCount += round.riichi?.length ?? 0;
      for (const hand of round.hands) {
        tempaiCount += hand.tempai?.length ?? 0;
        if (hand.openHand) {
          openHands++;
        }
      }
    }

    expect(rounds.length).toBe(4);
    expect(openHands).toBe(1);
    expect(riichiCount).toBe(5);
    expect(tempaiCount).toBe(0);

  });
});
