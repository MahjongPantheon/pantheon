import { OnlineParser } from './Parser.js';
import { Repository } from '../../services/Repository.js';
import { Model } from '../../models/Model.js';
import { PlayerModel } from '../../models/PlayerModel.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../SessionState.js';

class Parser extends OnlineParser {
  players(ids: number[]) {
    this._players = ids;
  }
  outcome(content: string) {
    return this._parseOutcome(content);
  }
  chips(content: string) {
    return this._parseChipsOutcome(content);
  }
  nagashi(content: string) {
    return this._parseNagashi(content);
  }
  reach(attributes: Record<string, string>) {
    this._tokenREACH(attributes);
    return [...this._riichi];
  }
  lobby(attributes: Record<string, string>, session: SessionEntity) {
    this._tokenGO(attributes, session);
  }
  users(attributes: Record<string, string>, session: SessionEntity, state: SessionState) {
    return this._tokenUN(attributes, session, state);
  }
  draw(attributes: Record<string, string>, state: SessionState) {
    this._tokenRYUUKYOKU(attributes, state);
    return this._roundData;
  }
}
const persist = vi.fn();
const repo = { em: { persist } } as unknown as Repository;
let parser: Parser;
let session: SessionEntity;
let state: SessionState;
beforeEach(() => {
  parser = new Parser(repo);
  session = Object.assign(new SessionEntity(), {
    event: Object.assign(new EventEntity(), {
      id: 5,
      lobbyId: 123,
      allowPlayerAppend: 0,
      ruleset: RulesetEntity.createRuleset('tenhounet'),
    }),
  });
  state = new SessionState(session.event.ruleset, []);
  persist.mockClear();
});
afterEach(() => vi.restoreAllMocks());

it('requires the event lobby while allowing the implicit default lobby', () => {
  expect(() => parser.lobby({ lobby: '456' }, session)).toThrow('event lobby 123');
  expect(() => parser.lobby({ lobby: '123' }, session)).not.toThrow();
  session.event.lobbyId = 0;
  expect(() => parser.lobby({}, session)).not.toThrow();
});

it('returns empty outcomes without a final result and requires matching score seats', () => {
  expect(parser.outcome('')).toEqual({});
  expect(parser.chips('')).toEqual({});
  expect(() => parser.outcome('owari="250,0,250,0,250,0,250,0"')).toThrow('inequal arrays');
  parser.players([4, 3, 2, 1]);
  expect(parser.outcome('owari="100,0,200,0,300,0,400,0"')).toEqual({
    4: 10000,
    3: 20000,
    2: 30000,
    1: 40000,
  });
  expect(parser.chips('owari="100,0,200,0,300,0,400,0,1,0,-2,0,3,0,-4,0"')).toEqual({
    4: 1,
    3: -2,
    2: 3,
    1: -4,
  });
});

it('ignores unconfirmed and missing-player riichi declarations', () => {
  parser.players([10, 20, 30, 40]);
  expect(parser.reach({ who: '1', step: '1' })).toEqual([]);
  expect(parser.reach({ who: '9', step: '2' })).toEqual([]);
  expect(parser.reach({ step: '2' })).toEqual([10]);
  expect(parser.reach({ who: '2', step: '2' })).toEqual([10, 30]);
});

it('counts only known seats with positive nagashi deltas and rejects incomplete draw seats', () => {
  parser.players([10, 20]);
  expect(parser.nagashi('250,10,250,-10,250,10,250,10')).toEqual([10]);
  expect(() => parser.draw({}, state)).toThrow('inequal arrays');
  parser.players([10, 20, 30, 40]);
  expect(parser.draw({}, state).at(-1)?.draw).toMatchObject({ tempai: [], riichiBets: [] });
});

it('rejects anonymous and unregistered replay players before creating registrations', async () => {
  await expect(parser.users({ n0: 'NoName' }, session, state)).rejects.toThrow('"NoName"');
  const findByTenhouId = vi.fn().mockResolvedValue({});
  vi.spyOn(Model, 'getModel').mockReturnValue({ findByTenhouId } as unknown as PlayerModel);
  await expect(
    parser.users({ n0: 'Alice%20A', n1: 'Bob', n2: 'Carol', n3: 'Dave' }, session, state)
  ).rejects.toThrow('Alice A, Bob, Carol, Dave');
  expect(findByTenhouId).toHaveBeenCalledWith(['Alice A', 'Bob', 'Carol', 'Dave']);
  expect(persist).not.toHaveBeenCalled();
});

it.each([false, true])('only appends missing registrations when allowed (%s)', async (append) => {
  const players = { Alice: { id: 10 }, Bob: { id: 20 }, Carol: { id: 30 }, Dave: { id: 40 } };
  const playerModel = { findByTenhouId: vi.fn().mockResolvedValue(players) };
  const registrations = {
    findByEventId: vi
      .fn()
      .mockResolvedValue([{ playerId: 10 }, { playerId: 20 }, { playerId: 30 }]),
  };
  vi.spyOn(Model, 'getModel').mockImplementation(
    (_repo, model) => (model === PlayerModel ? playerModel : registrations) as unknown as Model
  );
  session.event.allowPlayerAppend = append ? 1 : 0;
  await parser.users({ n0: 'Alice', n1: 'Bob', n2: 'Carol', n3: 'Dave' }, session, state);
  expect(state.state.playerIds).toEqual([10, 20, 30, 40]);
  expect(persist).toHaveBeenCalledTimes(append ? 1 : 0);
  if (append)
    expect(persist).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 40, event: session.event })
    );
  await parser.users({ n0: 'NoName' }, session, state);
  expect(playerModel.findByTenhouId).toHaveBeenCalledOnce();
});
