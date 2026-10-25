import { vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { Model } from '../../models/Model.js';
import { PlayerModel } from '../../models/PlayerModel.js';
import { EventRegistrationModel } from '../../models/EventRegistrationModel.js';
import { OnlineParser } from './Parser.js';

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

function replay(fixture: string) {
  return readFileSync(join(import.meta.dirname, `testdata/${fixture}.xml`), 'utf-8').replace(
    /n([0-3])="[^"]*"/g,
    (_, seat) => `n${seat}="${names[+seat]}"`
  );
}

describe('XML replay player order', () => {
  beforeEach(() => {
    vi.spyOn(registrations, 'fetchRegisteredPlayersByEvent').mockResolvedValue(ids.map(makePlayer));
    // Lookup order and numeric key enumeration both differ from replay seat order.
    vi.spyOn(players, 'findByTenhouId').mockResolvedValue(
      Object.fromEntries(
        [3, 2, 1, 0].map((seat) => [
          names[seat],
          { ...makePlayer(ids[seat]), tenhouId: names[seat] },
        ])
      )
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it.each(['usual', 'nagashi', 'pao_ron', 'pao_tsumo', 'doubleron_and_riichi'])(
    'preserves replay seat order throughout %s',
    async (fixture) => {
      const content = replay(fixture);
      const owari = content
        .match(/owari="([^"]*)"/)![1]
        .split(',')
        .map(Number);
      const [session, scores, rounds, debug] = await new OnlineParser(repo).parseToSession(
        event,
        content
      );

      expect(players.findByTenhouId).toHaveBeenCalledWith(names);
      expect(session.intermediateResults?.playerIds).toEqual(ids);
      const expected = Object.fromEntries(ids.map((id, seat) => [id, owari[seat * 2] * 100]));
      expect(scores).toEqual(expected);
      expect(session.intermediateResults?.scores).toEqual(expected);
      expect(rounds.length).toBeGreaterThan(0);
      expect(debug.at(-1)?.split(':: Got\t')[1]).toBe(ids.map((id) => scores[id]).join('\t'));
    }
  );

  it('assigns final chips to the corresponding replay seats', async () => {
    const content = replay('usual').replace(
      /owari="([^"]*)"/,
      (_, owari) => `owari="${owari},7,0,-2,0,3,0,-8,0"`
    );

    const [session] = await new OnlineParser(repo).parseToSession(event, content, true);

    expect(session.intermediateResults?.chips).toEqual({ 303: 7, 101: -2, 404: 3, 202: -8 });
  });

  it('reports a missing seat nickname even if the lookup returns an unrelated player', async () => {
    vi.mocked(players.findByTenhouId).mockResolvedValue({
      '30': makePlayer(303),
      '10': makePlayer(101),
      '40': makePlayer(404),
      unrelated: makePlayer(999),
    });

    await expect(new OnlineParser(repo).parseToSession(event, replay('usual'))).rejects.toThrow(
      'Not all tenhou nicknames were registered in the system: 20'
    );
  });
});
