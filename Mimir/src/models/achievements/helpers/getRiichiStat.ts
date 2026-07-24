import { EventEntity } from '../../../entities/Event.entity';
import { SessionResultsEntity } from '../../../entities/SessionResults.entity';
import { PointsCalc } from '../../../helpers/PointsCalc';
import { Model } from '../../../models/Model';
import { PlayerModel } from '../../../models/PlayerModel';
import { SessionResultsModel } from '../../../models/SessionResultsModel';
import { Repository } from '../../../services/Repository';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';
import { getGamesOfEvent } from './getGamesOfEvent';
import { getRoundsOfSessions } from './getRoundsOfSessions';

export type RiichiStat = {
  lastCalc: Date;
  data: Map<
    number,
    {
      playerId: number;
      won: number;
      lost: number;
      stole: number;
    }
  >;
};

const calcCache: Map<number, RiichiStat> = new Map();

function cleanup() {
  const delEvents: number[] = [];
  calcCache.forEach((stat, eventId) => {
    // 2 minutes cache to avoid repeated calculation during single run
    if (stat.lastCalc.getTime() < new Date().getTime() - 1000 * 60 * 2) {
      delEvents.push(eventId);
    }
  });

  delEvents.forEach((id) => {
    calcCache.delete(id);
  });
}

export async function calcRiichiStat(repo: Repository, event: EventEntity): Promise<RiichiStat> {
  cleanup();
  if (calcCache.has(event.id)) {
    return calcCache.get(event.id)!;
  }

  const playerModel = Model.getModel(repo, PlayerModel);
  const players = await playerModel.findPlayersForEvents([event.id]);

  const stat: RiichiStat = {
    lastCalc: new Date(),
    data: new Map(),
  };

  for (const p of players.players) {
    stat.data.set(p.id, {
      playerId: p.id,
      won: 0,
      lost: 0,
      stole: 0,
    });
  }

  const sessions = await getGamesOfEvent(event.id, repo);

  const sessionResultsModel = Model.getModel(repo, SessionResultsModel);
  const sessionResults = (
    await sessionResultsModel.findBySession(sessions.map((s) => s.id))
  ).reduce(
    (acc, res) => {
      acc[res.session.id] ??= [];
      acc[res.session.id].push(res);
      return acc;
    },
    {} as Record<number, SessionResultsEntity[]>
  );

  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const rules = event.ruleset.rules;
  for (const session of sessions) {
    if (rules.riichiGoesToWinner) {
      // find riichi bets collected in the end of the game by first place
      const firstPlace = sessionResults[session.id].find((res) => res.place === 1);
      const firstPlacePlayerId = firstPlace?.playerId;
      if (firstPlacePlayerId && stat.data.has(firstPlacePlayerId)) {
        stat.data.set(firstPlacePlayerId, {
          ...stat.data.get(firstPlacePlayerId)!,
          stole:
            stat.data.get(firstPlacePlayerId)!.stole +
            (session.intermediateResults?.riichiBets ?? 0),
        });
      }
    }

    for (const round of rounds[session.id]) {
      const riichiIds = round.riichi ?? [];

      if (
        round.outcome === RoundOutcome.ROUND_OUTCOME_RON ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_TSUMO
      ) {
        const winnerId = round.hands[0].winnerId!;

        for (const riichiPlayerId of riichiIds) {
          if (riichiPlayerId === winnerId) {
            if (stat.data.has(riichiPlayerId)) {
              stat.data.get(riichiPlayerId)!.won++;
            }
          } else {
            if (stat.data.has(riichiPlayerId)) {
              stat.data.get(riichiPlayerId)!.lost++;
            }
            if (stat.data.has(winnerId)) {
              stat.data.get(winnerId)!.stole++;
            }
          }
        }

        if (stat.data.has(winnerId)) {
          stat.data.get(winnerId)!.stole += round.lastSessionState?.riichiBets ?? 0;
        }
      }

      if (
        round.outcome === RoundOutcome.ROUND_OUTCOME_ABORT ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_DRAW
      ) {
        for (const riichiPlayerId of riichiIds) {
          if (stat.data.has(riichiPlayerId)) {
            stat.data.get(riichiPlayerId)!.lost++;
          }
        }
      }

      if (round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON) {
        const winnerIds = round.hands.map((h) => h.winnerId!);
        for (const riichiPlayerId of riichiIds) {
          if (!winnerIds.includes(riichiPlayerId) && stat.data.has(riichiPlayerId)) {
            stat.data.get(riichiPlayerId)!.lost++;
          }
        }

        const lastSessionState = round.lastSessionState;
        const riichiWinners = new PointsCalc().assignRiichiBets(
          winnerIds,
          riichiIds,
          round.hands[0].loserId!,
          lastSessionState?.riichiBets ?? 0,
          lastSessionState?.honba ?? 0,
          session.players.sort((p1, p2) => p1.order - p2.order).map((p) => p.id)
        );

        Object.entries(riichiWinners).forEach(([winnerId, item]) => {
          const closestWinner = item.closestWinner;

          if (rules.doubleronRiichiAtamahane && closestWinner) {
            if (closestWinner === +winnerId) {
              if (riichiIds.includes(+winnerId) && stat.data.has(+winnerId)) {
                stat.data.get(+winnerId)!.won++;
              }

              const fromOthers = riichiIds.filter((id) => id !== +winnerId);
              if (stat.data.has(+winnerId)) {
                stat.data.get(+winnerId)!.stole += fromOthers.length;
              }
            } else {
              if (stat.data.has(+winnerId)) {
                stat.data.get(+winnerId)!.lost++;
              }
            }
          } else {
            if (riichiIds.includes(+winnerId) && stat.data.has(+winnerId)) {
              stat.data.get(+winnerId)!.won++;
            }
            const fromOthers = riichiIds.filter((id) => id !== +winnerId);
            if (stat.data.has(+winnerId)) {
              stat.data.get(+winnerId)!.stole += fromOthers.length;
            }
          }

          if (stat.data.has(+winnerId)) {
            stat.data.get(+winnerId)!.stole += item.fromTable;
          }
        });
      }
    }
  }

  calcCache.set(event.id, stat);
  return stat;
}
