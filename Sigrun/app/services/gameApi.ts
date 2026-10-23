import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  GamesGetSessionOverviewResponse,
  EventsGetGameResponse,
} from 'tsclients/proto/mimir.pb';
import type { GameResult, PersonEx, SessionState } from 'tsclients/proto/atoms.pb';

// Twirp JSON can omit protobuf defaults, including defaults in nested messages.
type ProtoJson<T> = T extends (infer Item)[]
  ? ProtoJson<Item>[]
  : T extends object
    ? { [Key in keyof T]?: ProtoJson<T[Key]> }
    : T;

type PublicPlayer = Pick<PersonEx, 'id' | 'title' | 'hasAvatar' | 'lastUpdate'>;
export interface PublicGameResponse {
  sessionHash: string;
  eventId: number | undefined;
  tableIndex: number | null;
  players: (PublicPlayer & {
    score: number;
    yakitori: boolean;
    replacedBy: PublicPlayer | null;
  })[];
  state: Omit<SessionState, 'scores' | 'chombo'> & {
    scores: ProtoJson<SessionState['scores']>;
    chombo: ProtoJson<SessionState['chombo']>;
  };
  timerState: ProtoJson<GamesGetSessionOverviewResponse['timerState']> | null;
  game: Omit<GameResult, 'rounds' | 'finalResults' | 'players'> & {
    rounds: ProtoJson<GameResult['rounds']>;
    finalResults: ProtoJson<GameResult['finalResults']>;
    players: PublicPlayer[];
  };
}

interface GameApiErrorResponse {
  error: {
    code: 'method_not_allowed' | 'invalid_argument' | 'not_found' | 'unavailable';
    message: string;
  };
}

interface GameApiEnvironment {
  VITE_MIMIR_URL_SSR?: string;
  VITE_MIMIR_URL?: string;
}

interface RpcResponses {
  GetSessionOverview: ProtoJson<GamesGetSessionOverviewResponse>;
  GetGame: ProtoJson<EventsGetGameResponse>;
}

class GameServiceError extends Error {
  constructor(readonly notFound: boolean) {
    super('Game service request failed');
  }
}

export function createGameApi(env: GameApiEnvironment, fetchGame: typeof fetch = globalThis.fetch) {
  const baseUrl = env.VITE_MIMIR_URL_SSR ?? env.VITE_MIMIR_URL;

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const pathname = (req.url ?? '').split('?')[0];
    if (pathname !== '/api/game' && !pathname.startsWith('/api/game/')) {
      next();
      return;
    }

    const send = (status: number, body: PublicGameResponse | GameApiErrorResponse) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(body));
    };

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      send(405, { error: { code: 'method_not_allowed', message: 'Use GET.' } });
      return;
    }

    const sessionHash = pathname.slice('/api/game/'.length);
    if (!/^[a-f0-9]{40}$/.test(sessionHash)) {
      send(400, {
        error: { code: 'invalid_argument', message: 'Expected a 40-character session hash.' },
      });
      return;
    }

    try {
      const signal = AbortSignal.timeout(10000);
      const rpc = async <Method extends keyof RpcResponses>(
        method: Method
      ): Promise<RpcResponses[Method]> => {
        const response = await fetchGame(
          `${(baseUrl ?? '').replace(/\/$/, '')}/v2/common.Mimir/${method}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionHash }),
            signal,
          }
        );
        const body: unknown = await response.json();
        if (!response.ok) {
          throw new GameServiceError(
            typeof body === 'object' && body !== null && 'code' in body && body.code === 'not_found'
          );
        }
        if (typeof body !== 'object' || body === null) {
          throw new Error('Invalid game service response');
        }
        return body;
      };

      // Read the overview first: it also distinguishes an unknown session from an outage.
      const overview = await rpc('GetSessionOverview');
      const { game } = await rpc('GetGame');
      if (!overview.state || !game || game.sessionHash !== sessionHash) {
        throw new Error('Invalid game service response');
      }

      const publicPlayer = (player: ProtoJson<PersonEx>): PublicPlayer => ({
        id: player.id ?? 0,
        title: player.title ?? '',
        hasAvatar: player.hasAvatar ?? false,
        lastUpdate: player.lastUpdate ?? '',
      });

      send(200, {
        sessionHash,
        eventId: overview.eventId,
        tableIndex: overview.tableIndex ?? null,
        players: (overview.players ?? []).map((player) => ({
          ...publicPlayer(player),
          score: player.score ?? 0,
          yakitori: player.yakitori ?? false,
          replacedBy: player.replacedBy ? publicPlayer(player.replacedBy) : null,
        })),
        state: {
          dealer: overview.state.dealer ?? 0,
          roundIndex: overview.state.roundIndex ?? 0,
          riichiCount: overview.state.riichiCount ?? 0,
          honbaCount: overview.state.honbaCount ?? 0,
          scores: overview.state.scores ?? [],
          finished: overview.state.finished ?? false,
          lastHandStarted: overview.state.lastHandStarted ?? false,
          chombo: overview.state.chombo ?? [],
        },
        timerState: overview.timerState ?? null,
        game: {
          sessionHash,
          date: game.date ?? null,
          replayLink: game.replayLink ?? '',
          finalResults: game.finalResults ?? [],
          rounds: game.rounds ?? [],
          players: (game.players ?? []).map(publicPlayer),
        },
      });
    } catch (error) {
      if (error instanceof GameServiceError && error.notFound) {
        send(404, { error: { code: 'not_found', message: 'Game not found.' } });
        return;
      }
      send(502, {
        error: { code: 'unavailable', message: 'Game data is temporarily unavailable.' },
      });
    }
  };
}
