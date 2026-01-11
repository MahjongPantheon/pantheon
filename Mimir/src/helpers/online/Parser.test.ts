import { readFileSync } from 'fs';
import { join } from 'path';
import { SessionState } from 'src/aggregates/SessionState.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { init } from 'src/tests/initOrm.js';
import { SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { OnlineParser } from './Parser.js';
import { Repository } from 'src/services/Repository.js';

const orm = await init();
/**
 * Replay parser integration test suite
 */
describe('OnlinelogParserTest', () => {
  let event: EventEntity;
  let session: SessionEntity;
  const repo = Repository.instance({}, orm);

  beforeEach(async () => {
    event = new EventEntity();
    event.title = 'title';
    event.timezone = 'UTC';
    event.description = 'desc';
    event.lobbyId = 0;
    event.ruleset = RulesetEntity.createRuleset('tenhounet');
    orm.em.persist(event);

    for (const p of [1, 2, 3, 4]) {
      const reg = new EventRegisteredPlayersEntity();
      reg.playerId = p;
      reg.event = event;
      orm.em.persist(reg);
    }

    session = new SessionEntity();
    session.event = event;
    session.intermediateResults = new SessionState(event.ruleset, [1, 2, 3, 4]).state;
    session.status = SessionStatus.SESSION_STATUS_INPROGRESS;
    session.replayHash = '';
    orm.em.persist(session);
  });

  test('parseUsualGame', async () => {
    const content = readFileSync(join(import.meta.dirname, 'testdata/usual.xml'), 'utf-8');
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    expect(sessionEntity).toBeTruthy();
    expect(results).toEqual(session.intermediateResults?.scores);

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
      join(__dirname, 'testdata/suuankou_no_dealer_tsumo_no_pao.xml'),
      'utf-8'
    );
    const [sessionEntity, results, rounds] = await new OnlineParser(repo).parseToSession(
      event,
      content
    );

    let paoApplyCount = 0;
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.paoPlayerId !== undefined) {
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
        if (hand.paoPlayerId !== undefined) {
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
        if (hand.paoPlayerId !== undefined) {
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
    expect(rounds[10].outcome).toBe('abort');
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
    expect(rounds[5].outcome).toBe('abort');
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
    expect(rounds[1].outcome).toBe('abort');
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
    expect(rounds[7].outcome).toBe('abort');
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
    expect(rounds[6].outcome).toBe('abort');
  });
});
