import * as React from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { usePageTitle } from '#/hooks/pageTitle';
import {
  GameConfig,
  IntermediateResultOfSession,
  RegisteredPlayer,
  TableState,
} from '#/clients/atoms.pb';
import { Container } from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';
import { GamesList } from '#/pages/GamesControl/GamesList';
import { TournamentControls } from '#/pages/GamesControl/TournamentControls';

export const GamesControl: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const eventId = parseInt(id ?? '0', 10);
  const [isLoading, setIsLoading] = useState(false);
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState<null | GameConfig>(null);
  const [tablesState, setTablesState] = useState<TableState[]>([]);
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);

  usePageTitle(i18n._t('Games management'));

  useEffect(() => {
    if (!isLoggedIn || !id) {
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([
      api.getGameConfig(eventId),
      api.getTablesState(eventId),
      api.getAllPlayers(eventId),
    ])
      .then(([config, tables, regs]) => {
        setEventConfig(config);
        setTablesState(tables);
        setPlayers(regs);
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        nprogress.complete();
        setIsLoading(false);
      });
  }, [isLoggedIn]);

  const errHandler = useCallback(
    (err: Error) => {
      notifications.show({
        title: i18n._t('Error has occurred'),
        message: err.message,
        color: 'red',
      });
    },
    [isLoggedIn]
  );

  const doReloadConfigAndTables = useCallback(() => {
    return Promise.all([api.getGameConfig(eventId), api.getTablesState(eventId)]).then(
      ([cfg, tables]) => {
        setEventConfig(cfg);
        setTablesState(tables);
      }
    );
  }, [isLoggedIn]);

  const doReloadConfigOnly = useCallback(() => {
    return api.getGameConfig(eventId).then((cfg) => {
      setEventConfig(cfg);
    });
  }, [isLoggedIn]);

  const doReloadTablesOnly = useCallback(() => {
    return api.getTablesState(eventId).then((tables) => {
      setTablesState(tables);
    });
  }, [isLoggedIn]);

  const onCancelRound = useCallback(
    (sessionHash: string, intermediateResults: IntermediateResultOfSession[]) => {
      if (!id) return;
      api
        .cancelLastRound(sessionHash, intermediateResults)
        .then((r) => {
          if (!r) throw new Error(i18n._t('Failed to cancel round'));
        })
        .then(doReloadTablesOnly)
        .catch(errHandler);
    },
    [isLoggedIn]
  );

  const onDefinalize = useCallback(
    (sessionHash: string) => {
      if (!id) return;
      api
        .definalizeGame(sessionHash)
        .then((r) => {
          if (!r) throw new Error(i18n._t('Failed to definalize game'));
        })
        .then(doReloadTablesOnly)
        .catch(errHandler);
    },
    [isLoggedIn]
  );

  const onRemoveGame = useCallback(
    (sessionHash: string) => {
      if (!id) return;
      api
        .cancelGame(sessionHash)
        .then((r) => {
          if (!r) throw new Error(i18n._t('Failed to cancel game'));
        })
        .then(doReloadTablesOnly)
        .catch(errHandler);
    },
    [isLoggedIn]
  );

  const onStartTimer = useCallback(() => {
    api
      .startTimer(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to start timer'));
        }
      })
      .then(doReloadConfigAndTables)
      .catch(errHandler);
  }, [isLoggedIn]);

  const onToggleResults = useCallback(() => {
    api
      .toggleResults(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to toggle results visibility'));
        }
      })
      .then(doReloadConfigOnly)
      .catch(errHandler);
  }, [isLoggedIn]);

  const onApproveResults = useCallback(() => {
    api
      .approveResults(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to approve session results'));
        }
      })
      .then(doReloadConfigAndTables)
      .catch(errHandler);
  }, [isLoggedIn]);

  const onMakeIntervalSeating = useCallback(
    (interval: number) => {
      setSeatingLoading(true);
      api
        .makeIntervalSeating(eventId, interval)
        .then((r) => {
          if (!r) {
            throw new Error(i18n._t('Failed to generate interval seating'));
          }
        })
        .then(doReloadConfigAndTables)
        .catch(errHandler)
        .finally(() => {
          setSeatingLoading(false);
        });
    },
    [isLoggedIn]
  );

  const onMakeRandomSeating = useCallback(() => {
    setSeatingLoading(true);
    api
      .makeShuffledSeating(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to generate random seating'));
        }
      })
      .then(doReloadConfigAndTables)
      .catch(errHandler)
      .finally(() => {
        setSeatingLoading(false);
      });
  }, [isLoggedIn]);

  const onMakeSwissSeating = useCallback(() => {
    setSeatingLoading(true);
    api
      .makeSwissSeating(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to generate swiss seating'));
        }
      })
      .then(doReloadConfigAndTables)
      .catch(errHandler)
      .finally(() => {
        setSeatingLoading(false);
      });
  }, [isLoggedIn]);

  const onMakePrescriptedSeating = useCallback(
    (rndSeats: boolean) => {
      setSeatingLoading(true);
      api
        .makePrescriptedSeating(eventId, rndSeats)
        .then((r) => {
          if (!r) {
            throw new Error(i18n._t('Failed to generate prescripted seating'));
          }
        })
        .then(doReloadConfigAndTables)
        .catch(errHandler)
        .finally(() => {
          setSeatingLoading(false);
        });
    },
    [isLoggedIn]
  );

  const onResetSeating = useCallback(() => {
    api
      .resetSeating(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to reset seating'));
        }
      })
      .then(doReloadConfigAndTables)
      .catch(errHandler);
  }, [isLoggedIn]);

  return isLoading ? null : (
    <Container>
      {eventConfig?.syncStart && (
        <TournamentControls
          seatingLoading={seatingLoading}
          players={players}
          tablesState={tablesState}
          eventConfig={eventConfig}
          startTimer={onStartTimer}
          resetTimer={onStartTimer}
          toggleResults={onToggleResults}
          approveResults={onApproveResults}
          makeIntervalSeating={onMakeIntervalSeating}
          makeRandomSeating={onMakeRandomSeating}
          makeSwissSeating={onMakeSwissSeating}
          makeNextPredefinedSeating={onMakePrescriptedSeating}
          resetSeating={onResetSeating}
        />
      )}
      <GamesList
        tablesState={tablesState}
        eventConfig={eventConfig}
        onCancelLastRound={onCancelRound}
        onDefinalizeGame={eventConfig?.syncStart ? undefined : onDefinalize}
        onRemoveGame={eventConfig?.syncStart ? undefined : onRemoveGame}
      />
    </Container>
  );
};
