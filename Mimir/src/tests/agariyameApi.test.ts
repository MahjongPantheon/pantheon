import { EventType, PlatformType, WindShuffleMode } from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { MimirTest } from '../services/MimirTest.js';
import { Yaku } from '../helpers/yaku.js';

const client = new MimirTest();

async function startSession(playAdditionalRounds: boolean) {
  const rules = RulesetEntity.createRuleset('tenhounet').rules;
  rules.playAdditionalRounds = playAdditionalRounds;
  const { eventId } = await client.CreateEvent({
    type: EventType.EVENT_TYPE_LOCAL,
    title: 'Agariyame regression',
    description: '',
    duration: 75,
    timezone: 'UTC',
    lobbyId: 0,
    seriesLength: 0,
    minGames: 0,
    isTeam: false,
    isPrescripted: false,
    rulesetConfig: rules,
    isListed: true,
    isRatingShown: true,
    achievementsShown: true,
    allowViewOtherTables: true,
    platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
    allowManualAddReplay: false,
    windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
  });
  for (const playerId of [1, 2, 3, 4]) await client.RegisterPlayer(eventId, playerId);
  return (await client.StartGame(eventId, [1, 2, 3, 4])).sessionHash;
}

async function draw(sessionHash: string, tempai: number[] = []) {
  const { state } = await client.GetSessionOverview(sessionHash);
  return client.AddRound({
    sessionHash,
    roundData: {
      draw: {
        roundIndex: state.roundIndex,
        honba: state.honbaCount,
        riichiBets: [],
        tempai,
      },
    },
  });
}

it.each(['draw', 'tsumo'])(
  'persists South 4 agariyame below a disabled goal after %s',
  async (outcome) => {
    const sessionHash = await startSession(false);
    for (let index = 1; index < 8; index++) await draw(sessionHash);
    if (outcome === 'draw') {
      await draw(sessionHash, [4]);
    } else {
      const { state } = await client.GetSessionOverview(sessionHash);
      await client.AddRound({
        sessionHash,
        roundData: {
          tsumo: {
            roundIndex: 8,
            honba: state.honbaCount,
            riichiBets: [],
            winnerId: 4,
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
    }
    const finished = await client.GetSessionOverview(sessionHash);
    expect(finished.state?.roundIndex).toBe(8);
    expect(finished.state?.finished).toBe(true);
    expect(finished.players.find((player) => player.id === 4)?.score).toBeLessThan(30000);
    const { game } = await client.GetGame(sessionHash);
    expect(game.finalResults).toHaveLength(4);
  }
);

it('persists West renchan at the goal, then finishes when the dealer rotates', async () => {
  const sessionHash = await startSession(true);
  await draw(sessionHash, [2]);
  for (let index = 2; index <= 8; index++) await draw(sessionHash);
  for (let repeat = 0; repeat < 4; repeat++) await draw(sessionHash, [1, 2]);

  const repeated = await client.GetSessionOverview(sessionHash);
  expect(repeated.state?.roundIndex).toBe(9);
  expect(repeated.state?.dealer).toBe(1);
  expect(repeated.state?.finished).toBe(false);
  expect(repeated.players.filter((player) => player.id <= 2).map((player) => player.score)).toEqual(
    [30000, 34000]
  );

  await draw(sessionHash, [2]);

  const finished = await client.GetSessionOverview(sessionHash);
  expect(finished.state?.roundIndex).toBe(10);
  expect(finished.state?.finished).toBe(true);
  const { game } = await client.GetGame(sessionHash);
  expect(game.finalResults).toHaveLength(4);
});
