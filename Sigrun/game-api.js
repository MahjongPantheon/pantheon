// Shared by the production Express server and the Vite development server.
export function createGameApi(env, fetchGame = globalThis.fetch) {
  const baseUrl = env.VITE_MIMIR_URL_SSR ?? env.VITE_MIMIR_URL;

  return async (req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0];
    if (pathname !== '/api/game' && !pathname.startsWith('/api/game/')) {
      return next();
    }

    const send = (status, body) => {
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
      const rpc = async (method) => {
        const response = await fetchGame(
          `${baseUrl.replace(/\/$/, '')}/v2/common.Mimir/${method}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionHash }),
            signal,
          }
        );
        const body = await response.json();
        if (!response.ok) {
          const error = new Error('Game service request failed');
          error.notFound = body.code === 'not_found';
          throw error;
        }
        return body;
      };

      // Read the overview first: it also distinguishes an unknown session from an outage.
      const overview = await rpc('GetSessionOverview');
      const { game } = await rpc('GetGame');
      if (!overview.state || !game || game.sessionHash !== sessionHash) {
        throw new Error('Invalid game service response');
      }

      const publicPlayer = (player) => ({
        id: player.id,
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
      if (error?.notFound) {
        send(404, { error: { code: 'not_found', message: 'Game not found.' } });
        return;
      }
      send(502, {
        error: { code: 'unavailable', message: 'Game data is temporarily unavailable.' },
      });
    }
  };
}
