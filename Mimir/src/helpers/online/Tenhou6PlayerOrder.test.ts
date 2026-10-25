import { vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PlatformType } from 'tsclients/proto/atoms.pb.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { Model } from '../../models/Model.js';
import { PlayerModel } from '../../models/PlayerModel.js';
import { EventRegistrationModel } from '../../models/EventRegistrationModel.js';
import { Tenhou6OnlineParser } from './Tenhou6Parser.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const players = Model.getModel(repo, PlayerModel);
const registrations = Model.getModel(repo, EventRegistrationModel);
const ids = [303, 101, 404, 202];
const names = ['30', '10', '40', '20'];
const event = Object.assign(new EventEntity(), {
  id: 19,
  lobbyId: 0,
  allowPlayerAppend: 0,
  ruleset: RulesetEntity.createRuleset('tenhounet'),
});

function replay(name: string) {
  return JSON.parse(
    readFileSync(join(import.meta.dirname, `testdata/format6/${name}.json`), 'utf-8')
  );
}

describe('Tenhou6 replay player order', () => {
  beforeEach(() => {
    vi.spyOn(registrations, 'findByEventId').mockResolvedValue([]);
    vi.spyOn(registrations, 'fetchRegisteredPlayersByEvent').mockResolvedValue(ids.map(makePlayer));
    vi.spyOn(players, 'findById').mockImplementation(async (playerIds) =>
      playerIds.map(makePlayer)
    );
    // Reverse lookup insertion order and use numeric nicknames that objects enumerate in ascending order.
    const lookup = Object.fromEntries(
      [3, 2, 1, 0].map((seat) => [
        names[seat],
        {
          ...makePlayer(ids[seat]),
          tenhouId: names[seat],
        },
      ])
    );
    vi.spyOn(players, 'findByTenhouId').mockResolvedValue(lookup);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it.each(['usual', 'nagashi_usual', 'pao_ron', 'pao_tsumo', 'doubleron_and_riichi'])(
    'preserves replay seat order throughout %s',
    async (fixture) => {
      const data = replay(fixture);
      data.name = names;
      const [session, scores, rounds, debug] = await new Tenhou6OnlineParser(repo).parseToSession(
        event,
        data.ref,
        JSON.stringify(data)
      );

      expect(players.findByTenhouId).toHaveBeenCalledWith(names);
      expect(session.intermediateResults?.playerIds).toEqual(ids);
      const expectedScores = Object.fromEntries(ids.map((id, seat) => [id, data.sc[seat * 2]]));
      expect(scores).toEqual(expectedScores);
      expect(session.intermediateResults?.scores).toEqual(expectedScores);
      expect(rounds.length).toBeGreaterThan(0);
      expect(debug.at(-1)?.split(':: Got\t')[1]).toBe(ids.map((id) => scores[id]).join('\t'));
    }
  );

  it('keeps same-nickname Mahjong Soul accounts in their replay slots', async () => {
    const data = replay('tensoul_with_same_nicknames');
    const lookup = Object.fromEntries(
      [3, 2, 1, 0].map((seat) => {
        const player = data.playerMapping[seat];
        return [
          `${player.nickname}-${player.account_id}`,
          {
            ...makePlayer(ids[seat]),
            msNickname: player.nickname,
            msAccountId: player.account_id,
          },
        ];
      })
    );
    vi.spyOn(players, 'findMajsoulAccounts').mockResolvedValue(lookup);

    const [session, scores] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      data.ref,
      JSON.stringify(data),
      false,
      PlatformType.PLATFORM_TYPE_MAHJONGSOUL
    );

    expect(session.intermediateResults?.playerIds).toEqual(ids);
    expect(scores).toEqual(Object.fromEntries(ids.map((id, seat) => [id, data.sc[seat * 2]])));
    expect(session.intermediateResults?.scores).toEqual(scores);
  });

  it('replaces a substitute without moving their replay slot', async () => {
    vi.mocked(registrations.findByEventId).mockResolvedValue([
      Object.assign(new EventRegisteredPlayersEntity(), {
        event,
        playerId: 909,
        replacementId: 101,
      }),
    ]);
    vi.mocked(registrations.fetchRegisteredPlayersByEvent).mockResolvedValue(
      [303, 909, 404, 202].map(makePlayer)
    );
    const data = replay('usual');
    data.name = names;

    const [session, scores] = await new Tenhou6OnlineParser(repo).parseToSession(
      event,
      data.ref,
      JSON.stringify(data)
    );

    expect(session.intermediateResults?.playerIds).toEqual([303, 909, 404, 202]);
    expect(scores[909]).toBe(data.sc[2]);
    expect(scores[101]).toBeUndefined();
    expect(session.intermediateResults?.scores).toEqual(scores);
  });

  it('reports the missing replay nickname even when lookup returns another player', async () => {
    vi.mocked(players.findByTenhouId).mockResolvedValue({
      '30': makePlayer(303),
      '10': makePlayer(101),
      '40': makePlayer(404),
      unrelated: makePlayer(999),
    });
    const data = replay('usual');
    data.name = names;

    await expect(
      new Tenhou6OnlineParser(repo).parseToSession(event, data.ref, JSON.stringify(data))
    ).rejects.toThrow('Not all Tenhou nicknames were registered in the system: 20');
  });
});
