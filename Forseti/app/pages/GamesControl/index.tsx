/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authCtx } from '../../hooks/auth';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { usePageTitle } from '../../hooks/pageTitle';
import {
  GameConfig,
  IntermediateResultOfSession,
  RegisteredPlayer,
  TableState,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb';
import { Container, LoadingOverlay } from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';
import { GamesList } from './GamesList';
import { TournamentControls } from './TournamentControls';
import { TopActionButton } from '../../components/TopActionButton';
import { IconRefresh } from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { useStorage } from '../../hooks/storage';
import {
  EventsGetPrescriptedEventConfigResponse,
  EventsGetTimerStateResponse,
} from 'tsclients/proto/mimir.pb';

const DEFAULT_SECS_UNTIL_RELOAD = 60;
export const GamesControl: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const eventId = parseInt(id ?? '0', 10);
  const reloadGeneration = useRef(0);
  const activeEventId = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState<null | GameConfig>(null);
  const [prescriptedConfig, setPrescriptedConfig] =
    useState<null | EventsGetPrescriptedEventConfigResponse>(null);
  const [timerState, setTimerState] = useState<null | EventsGetTimerStateResponse>(null);
  const [tablesState, setTablesState] = useState<TableState[]>([]);
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [secsUntilReload, setSecsUntilReload] = useState(DEFAULT_SECS_UNTIL_RELOAD);
  api.setEventId(eventId);

  usePageTitle(i18n._t('Games management'));

  useEffect(() => {
    if (!isLoggedIn || !id) {
      return;
    }
    let cancelled = false;
    activeEventId.current = eventId;
    setSecsUntilReload(DEFAULT_SECS_UNTIL_RELOAD);
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([
      api.getGameConfig(eventId),
      api.getPrescriptedEventConfig(eventId),
      api.getTablesState(eventId),
      api.getAllPlayers(eventId),
      api.getTimerState(eventId),
    ])
      .then(([config, prescriptConfig, tables, regs, tState]) => {
        if (cancelled) return;
        setEventConfig(config);
        setPrescriptedConfig(prescriptConfig);
        setTablesState(tables);
        setPlayers(regs);
        setTimerState(tState);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        if (cancelled) return;
        nprogress.complete();
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
      activeEventId.current = null;
      reloadGeneration.current += 1;
    };
  }, [isLoggedIn, id, api, eventId, i18n]);

  const errHandler = useCallback(
    (err: Error) => {
      notifications.show({
        title: i18n._t('Error has occurred'),
        message: err.message,
        color: 'red',
      });
    },
    [i18n]
  );

  const doReloadConfigAndTables = useCallback(() => {
    if (activeEventId.current !== eventId) return Promise.resolve();
    const generation = reloadGeneration.current;
    return Promise.all([
      api.getGameConfig(eventId),
      api.getTablesState(eventId),
      api.getTimerState(eventId),
    ]).then(([cfg, tables, tState]) => {
      if (generation !== reloadGeneration.current) return;
      setEventConfig(cfg);
      setTablesState(tables);
      setTimerState(tState);
    });
  }, [api, eventId]);

  const doReloadConfigOnly = useCallback(() => {
    if (activeEventId.current !== eventId) return Promise.resolve();
    const generation = reloadGeneration.current;
    return api.getGameConfig(eventId).then((cfg) => {
      if (generation !== reloadGeneration.current) return;
      setEventConfig(cfg);
    });
  }, [api, eventId]);

  const doReloadTablesOnly = useCallback(() => {
    if (activeEventId.current !== eventId) return Promise.resolve();
    const generation = reloadGeneration.current;
    return api.getTablesState(eventId).then((tables) => {
      if (generation !== reloadGeneration.current) return;
      setTablesState(tables);
    });
  }, [api, eventId]);

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
    [id, api, i18n, doReloadTablesOnly, errHandler]
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
    [id, api, i18n, doReloadTablesOnly, errHandler]
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
    [id, api, i18n, doReloadTablesOnly, errHandler]
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
  }, [api, eventId, i18n, doReloadConfigAndTables, errHandler]);

  const onAddExtraTime = useCallback(
    (extraTime: number) => {
      api
        .addExtraTime(
          tablesState.map((t) => t.sessionHash),
          extraTime
        )
        .then((r) => {
          if (!r) {
            throw new Error(i18n._t('Failed to add extra time'));
          }
        })
        .then(doReloadConfigAndTables)
        .catch(errHandler);
    },
    [api, tablesState, i18n, doReloadConfigAndTables, errHandler]
  );

  const onAddExtraTimeForTable = useCallback(
    (hash: string, extraTime: number) => {
      api
        .addExtraTime([hash], extraTime)
        .then((r) => {
          if (!r) {
            throw new Error(i18n._t('Failed to add extra time'));
          }
        })
        .then(doReloadConfigAndTables)
        .catch(errHandler);
    },
    [api, i18n, doReloadConfigAndTables, errHandler]
  );

  const notifyPlayers = useCallback(() => {
    api
      .notifyPlayers(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to notify players'));
        }
      })
      .catch(errHandler);
  }, [api, eventId, i18n, errHandler]);

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
  }, [api, eventId, i18n, doReloadConfigOnly, errHandler]);

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
  }, [api, eventId, i18n, doReloadConfigAndTables, errHandler]);

  const onMakeIntervalSeating = useCallback(
    (interval: number, windShuffleMode: WindShuffleMode) => {
      setSeatingLoading(true);
      api
        .makeIntervalSeating(eventId, interval, windShuffleMode)
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
    [api, eventId, i18n, doReloadConfigAndTables, errHandler]
  );

  const onMakeRandomSeating = useCallback(
    (windShuffleMode: WindShuffleMode) => {
      setSeatingLoading(true);
      api
        .makeShuffledSeating(eventId, windShuffleMode)
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
    },
    [api, eventId, i18n, doReloadConfigAndTables, errHandler]
  );

  const onMakeSwissSeating = useCallback(
    (windShuffleMode: WindShuffleMode) => {
      setSeatingLoading(true);
      api
        .makeSwissSeating(eventId, windShuffleMode)
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
    },
    [api, eventId, i18n, doReloadConfigAndTables, errHandler]
  );

  const onMakePrescriptedSeating = useCallback(
    (windShuffleMode: WindShuffleMode) => {
      setSeatingLoading(true);
      api
        .makePrescriptedSeating(eventId, windShuffleMode)
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
    [api, eventId, i18n, doReloadConfigAndTables, errHandler]
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
  }, [api, eventId, i18n, doReloadConfigAndTables, errHandler]);

  const onForceFinish = useCallback(
    (sessionHash: string) => {
      api
        .forceFinish(sessionHash)
        .then((r) => {
          if (!r) {
            throw new Error(i18n._t('Failed to finish the game'));
          }
        })
        .then(doReloadTablesOnly)
        .catch(errHandler);
    },
    [api, i18n, doReloadTablesOnly, errHandler]
  );

  useEffect(() => {
    if (!isLoggedIn || !id) return;
    const timer = setInterval(() => {
      setSecsUntilReload((secs) => Math.max(0, secs - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, id]);

  useEffect(() => {
    if (!isLoggedIn || !id || secsUntilReload > 0) return;
    let cancelled = false;
    doReloadConfigAndTables()
      .catch((err: Error) => {
        if (!cancelled) errHandler(err);
      })
      .finally(() => {
        if (!cancelled) setSecsUntilReload(DEFAULT_SECS_UNTIL_RELOAD);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, id, secsUntilReload, doReloadConfigAndTables, errHandler]);

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <Container data-testid='forseti-games-control-page'>
      <LoadingOverlay visible={isLoading} overlayProps={{ opacity: 1 }} />
      {eventConfig?.syncStart && (
        <TournamentControls
          seatingLoading={seatingLoading}
          players={players}
          tablesState={tablesState}
          eventConfig={eventConfig}
          prescriptedConfig={prescriptedConfig}
          startTimer={onStartTimer}
          notifyPlayers={notifyPlayers}
          addExtraTime={onAddExtraTime}
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
        timerState={timerState}
        onCancelLastRound={onCancelRound}
        onDefinalizeGame={eventConfig?.syncStart ? undefined : onDefinalize}
        onRemoveGame={eventConfig?.syncStart ? undefined : onRemoveGame}
        onForceFinish={eventConfig?.syncStart ? undefined : onForceFinish}
        onAddExtraTime={onAddExtraTimeForTable}
      />
      <TopActionButton
        testId='forseti-games-control-save'
        color='green'
        title={i18n._t('Refresh data [%1]', [secsUntilReload <= 0 ? '0' : secsUntilReload])}
        loading={false}
        icon={<IconRefresh />}
        onClick={() => {
          doReloadConfigAndTables()
            .then(() => {
              setSecsUntilReload(DEFAULT_SECS_UNTIL_RELOAD);
            })
            .catch(errHandler);
        }}
      />
    </Container>
  );
};
