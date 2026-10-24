import { EventType, PlatformType, WindShuffleMode } from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { MimirTest } from '../services/MimirTest.js';
import { Yaku } from '../helpers/yaku.js';
import { GHOST_PLAYER_ID } from '../../../Common/constants.js';

const client = new MimirTest();
const eventData = {
  type: EventType.EVENT_TYPE_LOCAL,
  title: 'Sanma integration',
  description: '',
  duration: 75,
  timezone: 'UTC',
  lobbyId: 0,
  seriesLength: 0,
  minGames: 0,
  isTeam: false,
  isPrescripted: false,
  rulesetConfig: RulesetEntity.createRuleset('sanma').rules,
  isListed: true,
  isRatingShown: true,
  achievementsShown: true,
  allowViewOtherTables: true,
  platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
  allowManualAddReplay: false,
  windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
};

describe('Sanma Twirp API', () => {
  it('persists a three-player session through scoring and South 3 finalization', async () => {
    const { eventId } = await client.CreateEvent(eventData);
    for (const playerId of [1, 2, 3]) await client.RegisterPlayer(eventId, playerId);
    const { sessionHash } = await client.StartGame(eventId, [1, 2, 3]);
    const tables = await client.GetTablesState({ eventId, omitLastRound: false });
    expect(tables.tables).toHaveLength(1);
    expect(tables.tables[0].players.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(tables.tables[0].scores.map((s) => [s.playerId, s.score])).toEqual([
      [1, 35000],
      [2, 35000],
      [3, 35000],
    ]);
    const overview = await client.GetSessionOverview(sessionHash);
    expect(overview.players.map((player) => player.id)).toEqual([1, 2, 3, GHOST_PLAYER_ID]);
    expect(overview.players.at(-1)?.score).toBe(0);
    const first = await client.AddRound({
      sessionHash,
      roundData: {
        tsumo: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [],
          winnerId: 2,
          paoPlayerId: 0,
          openHand: false,
          han: 1,
          fu: 30,
          yaku: [Yaku.TANYAO],
          dora: 0,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
        },
      },
    });
    expect(first.scores.map(({ playerId, score }) => [playerId, score])).toEqual([
      [1, 34500],
      [2, 35800],
      [3, 34700],
    ]);
    for (let index = 2; index <= 6; index++) {
      const current = await client.GetSessionOverview(sessionHash);
      expect(current.state?.dealer).toBe(((index - 1) % 3) + 1);
      await client.AddRound({
        sessionHash,
        roundData: {
          draw: {
            roundIndex: index,
            honba: current.state.honbaCount,
            riichiBets: [],
            tempai: [],
          },
        },
      });
    }
    const finished = await client.GetSessionOverview(sessionHash);
    expect(finished.state?.finished).toBe(true);
    expect(finished.state?.roundIndex).toBe(7);
    const finishedTables = await client.GetTablesState({ eventId, omitLastRound: false });
    expect(finishedTables.tables[0].players.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(finishedTables.tables[0].scores.map((s) => [s.playerId, s.score])).toEqual([
      [1, 34500],
      [2, 35800],
      [3, 34700],
    ]);
    const { game } = await client.GetGame(sessionHash);
    expect(game.finalResults.map((result) => result.playerId).sort((a, b) => a - b)).toEqual([
      1, 2, 3,
    ]);
    expect(
      Object.fromEntries(game.finalResults.map((result) => [result.playerId, result.ratingDelta]))
    ).toEqual({ 1: -15500, 2: 15800, 3: -300 });
  });

  it('generates shuffled, interval and Swiss seating with three real players per table', async () => {
    const { eventId } = await client.CreateEvent({
      ...eventData,
      type: EventType.EVENT_TYPE_TOURNAMENT,
    });
    for (let playerId = 1; playerId <= 9; playerId++)
      await client.RegisterPlayer(eventId, playerId);
    const preview = await client.GenerateSwissSeating(
      eventId,
      false,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(preview.tables).toHaveLength(3);
    expect(preview.tables.every((table) => table.players.length === 3)).toBe(true);
    for (const makeSeating of [
      () => client.MakeShuffledSeating(eventId, 1, 123, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED),
      () => client.MakeIntervalSeating(eventId, 2, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED),
      () => client.MakeSwissSeating(eventId, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED),
    ]) {
      await makeSeating();
      const { seating } = await client.GetCurrentSeating(eventId);
      expect(seating).toHaveLength(9);
      expect(seating.map((seat) => seat.playerId).sort((a, b) => a - b)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9,
      ]);
      for (const tableIndex of new Set(seating.map((seat) => seat.tableIndex))) {
        expect(seating.filter((seat) => seat.tableIndex === tableIndex)).toHaveLength(3);
      }
      await client.ResetSeating(eventId);
    }
  });
});
