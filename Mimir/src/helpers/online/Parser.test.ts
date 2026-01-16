import { readFileSync } from 'fs';
import { join } from 'path';
import { SessionState } from 'src/aggregates/SessionState.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { init } from 'src/tests/initOrm.js';
import { RoundOutcome, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { OnlineParser } from './Parser.js';
import { Repository } from 'src/services/Repository.js';

/**
 * Replay parser integration test suite
 */
describe('OnlinelogParserTest', () => {
  let event: EventEntity;
  let session: SessionEntity;
  let repo: Repository;

  beforeEach(async () => {
    const orm = await init();
    await orm.schema.createSchema();
    repo = Repository.instance({}, orm);
    await repo.cache.connect();
    repo.mockFrey();

    event = new EventEntity();
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

    for (const p of [1, 2, 3, 4]) {
      const reg = new EventRegisteredPlayersEntity();
      reg.playerId = p;
      reg.event = event;
      reg.ignoreSeating = 0;
      orm.em.persist(reg);
    }

    session = new SessionEntity();
    session.event = event;
    session.extraTime = 0;
    session.intermediateResults = new SessionState(event.ruleset, [1, 2, 3, 4]).state;
    session.status = SessionStatus.SESSION_STATUS_INPROGRESS;
    session.replayHash = '';
    orm.em.persist(session);

    await orm.em.flush();
  });

  afterAll(async () => {
    await repo.db.close();
  });

  test('parseUsualGame', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/usual.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
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

    expect(rounds.length).toBe(16);
    expect(openHands).toBe(7);
  });

  test('parseYakumanDoubleRon', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/doubleron.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('parseTripleYakuman', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/tripleyakuman.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('parseDoubleRonAndRiichiBets', async () => {
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/doubleron_and_riichi.xml'),
      'utf-8'
    );
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('parseDoubleRonAndHonbaBets', async () => {
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/doubleron_and_honba.xml'),
      'utf-8'
    );
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('parseNagashiMangan', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/nagashi.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('hanchanWithWestRound', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/west.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('hanchanWithWestRound', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/west.xml'), 'utf-8');
    const [sessionEntity, results] = await new OnlineParser(repo).parseToSession(event, content);

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
  });

  test('parseRegressUsualGame', async () => {
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
  });

  test('ronWithPao', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/pao_ron.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds[2].hands[0].paoPlayerId).toBe(4);
  });

  test('tsumoWithPao', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/pao_tsumo.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds[1].hands[0].paoPlayerId).toBe(4);
  });

  test('yakumanTsumoNoDealerWithoutPao', async () => {
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
  });

  test('yakumanTsumoDealerWithoutPao', async () => {
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
  });

  test('yakumanRonWithoutPao', async () => {
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
  });

  test('tripleRonDraw', async () => {
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
  });

  test('fourKanDraw', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/four_kan_draw.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(11);
    expect(rounds[5].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
  });

  test('nineTerminalDraw', async () => {
    const content = readFileSync(
      join(import.meta.dirname, 'testdata/nine_terminal_draw.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(12);
    expect(rounds[1].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
  });

  test('fourWindDraw', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/four_wind_draw.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(sessionEntity.intermediateResults?.scores);
    expect(rounds.length).toBe(12);
    expect(rounds[7].outcome).toBe(RoundOutcome.ROUND_OUTCOME_ABORT);
  });

  test('fourRiichiDraw', async () => {
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
  });
});
