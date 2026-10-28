import moment from 'moment-timezone';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { Model } from '../Model.js';
import type { Repository } from '../../services/Repository.js';
import { PlayerHistoryEntity } from '../../entities/PlayerHistory.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { PenaltyEntity } from '../../entities/Penalty.entity.js';
import { PersonEx } from 'tsclients/proto/atoms.pb.js';

const model = Model.getModel({} as Repository, PlayerHistoryModel);
function item(playerId: number, extra: Partial<PlayerHistoryEntity> = {}) {
  return Object.assign(new PlayerHistoryEntity(), {
    playerId,
    event: { id: 42 } as EventEntity,
    sessionId: 1,
    gamesPlayed: 4,
    avgPlace: 2.5,
    rating: 100000,
    avgScore: 25000,
    ...extra,
  });
}
afterEach(() => vi.restoreAllMocks());

it.each([
  ['name', [3, 2, 1]],
  ['rating', [2, 3, 1]],
  ['games_and_rating', [2, 3, 1]],
  ['avg_place', [1, 3, 2]],
  ['avg_score', [2, 3, 1]],
  ['chips', [2, 3, 1]],
] as const)('orders history by %s with explicit ties', (order, expected) => {
  const lines = [
    item(1, { rating: 120000, avgPlace: 1.5, avgScore: 30000, chips: 3 }),
    item(2, { rating: 90000, avgPlace: 3, avgScore: 22500, chips: 1 }),
    item(3, { rating: 100000, avgPlace: 2, avgScore: 25000, chips: 2 }),
  ];
  const people = {
    1: PersonEx.initialize({ title: 'A' }),
    2: PersonEx.initialize({ title: 'B' }),
    3: PersonEx.initialize({ title: 'C' }),
  };
  expect(model.sortItems(order, people, lines).map((p) => p.playerId)).toEqual(expected);
  expect(lines.map((p) => p.playerId)).toEqual([1, 2, 3]);
});

it('uses secondary rating and place ordering and handles missing optional fields', () => {
  const a = item(1, { avgPlace: 1, chips: undefined, avgScore: undefined });
  const b = item(2, { avgPlace: 2, chips: 0, avgScore: undefined });
  expect(model.sortItems('rating', {}, [a, b])).toEqual([b, a]);
  expect(model.sortItems('games_and_rating', {}, [a, b])).toEqual([b, a]);
  expect(model.sortItems('avg_score', {}, [a, b])).toEqual([a, b]);
  expect(
    model
      .sortItems('avg_score', {}, [item(1, { avgPlace: 1 }), item(2, { avgPlace: 2 })])
      .map((p) => p.playerId)
  ).toEqual([2, 1]);
  expect(
    model
      .sortItems('avg_place', {}, [item(1, { rating: 90000 }), item(2, { rating: 110000 })])
      .map((p) => p.playerId)
  ).toEqual([2, 1]);
  expect(
    model
      .sortItems('chips', {}, [
        item(1, { chips: undefined, rating: 90000 }),
        item(2, { chips: 0, rating: 110000 }),
      ])
      .map((p) => p.playerId)
  ).toEqual([2, 1]);
  expect(
    model
      .sortItems('games_and_rating', {}, [item(1, { gamesPlayed: 8 }), item(2, { gamesPlayed: 4 })])
      .map((p) => p.playerId)
  ).toEqual([2, 1]);
  expect(() => model.sortItems('invalid', {}, [])).toThrow('Parameter orderBy');
});

it('merges public profile, team and active penalties without changing history records', () => {
  const source = [item(1), item(2)];
  const people = [
    PersonEx.initialize({
      id: 1,
      title: 'Alice',
      tenhouId: 'alice',
      hasAvatar: true,
      lastUpdate: 'today',
    }),
  ];
  const registrations = [{ playerId: 1, teamName: 'Team' }] as EventRegisteredPlayersEntity[];
  const penalties = [
    { playerId: 1, amount: 1000, cancelled: 0 },
    { playerId: 1, amount: 500, cancelled: 0 },
    { playerId: 2, amount: 9000, cancelled: 1 },
  ] as PenaltyEntity[];
  const result = model.mergeData(source, people, registrations, penalties);
  expect(result[0]).toMatchObject({
    playerTitle: 'Alice',
    playerTeamName: 'Team',
    penaltiesAmount: 1500,
    penaltiesCount: 2,
    rating: 98500,
    avgScore: 24625,
  });
  expect(result[1].rating).toBe(100000);
  expect(result[1].penaltiesCount).toBeUndefined();
  expect(result[1].playerTitle).toBeUndefined();
  expect(source[0].rating).toBe(100000);
  expect(result[0]).not.toBe(source[0]);
});

it('combines events once per player with weighted average places and optional chips', () => {
  const ruleset = RulesetEntity.createRuleset('ema');
  ruleset.rules.startRating = 100000;
  const a = item(1, { gamesPlayed: 2, avgPlace: 1, rating: 110000, chips: 4 });
  const b = item(1, { gamesPlayed: 6, avgPlace: 3, rating: 120000, chips: undefined });
  expect(model.mergeSeveralEvents([a, b, item(2)], ruleset)[0]).toMatchObject({
    playerId: 1,
    gamesPlayed: 8,
    avgPlace: 2.5,
    rating: 130000,
    chips: 4,
  });
  expect(model.makeHistoryItemsSum(item(1), b, ruleset).chips).toBeUndefined();
  expect(model.makeHistoryItemsDiff(item(1, { gamesPlayed: 8, chips: 4 }), b, ruleset).chips).toBe(
    4
  );
  expect(model.makeHistoryItemsDiff(item(1), b, ruleset).chips).toBeUndefined();
});

it.each([
  [null, null],
  ['2026-10-01', null],
  [null, '2026-10-28'],
  ['2026-10-01', '2026-10-28'],
] as const)('selects the requested history window %s through %s', async (from, to) => {
  const ruleset = RulesetEntity.createRuleset('ema');
  const current = [item(1)];
  const dated = [item(2)];
  const latest = vi.spyOn(model, 'findLastByEvent').mockResolvedValue(current);
  const byDate = vi.spyOn(model, 'findLastByEventAndDate').mockResolvedValue(dated);
  const calculate = vi.spyOn(model, 'calculateHistory').mockReturnValue([item(3)]);
  const result = await model.getHistoryItems(ruleset, [42], 'Europe/Moscow', from, to);
  if (from) {
    expect(calculate).toHaveBeenCalledWith(dated, to ? dated : current, ruleset);
    expect(result[0].playerId).toBe(3);
  } else expect(result).toBe(to ? dated : current);
  if (to || from)
    expect(byDate).toHaveBeenCalledWith([42], moment.tz(from ?? to, 'Europe/Moscow').utc());
  if (!to) expect(latest).toHaveBeenCalledWith([42]);
});
