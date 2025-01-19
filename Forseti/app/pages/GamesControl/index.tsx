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
import { useCallback, useContext, useEffect, useState } from 'react';
import { authCtx } from '../../hooks/auth';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { usePageTitle } from '../../hooks/pageTitle';
import {
  GameConfig,
  IntermediateResultOfSession,
  RegisteredPlayer,
  TableState,
} from '../../clients/proto/atoms.pb';
import { Container, LoadingOverlay } from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';
import { GamesList } from './GamesList';
import { TournamentControls } from './TournamentControls';
import { TopActionButton } from '../../components/TopActionButton';
import { IconRefresh } from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { useStorage } from '../../hooks/storage';
import { EventsGetTimerStateResponse } from '../../clients/proto/mimir.pb';

const DEFAULT_SECS_UNTIL_RELOAD = 60;
export const GamesControl: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const eventId = parseInt(id ?? '0', 10);
  const [isLoading, setIsLoading] = useState(false);
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState<null | GameConfig>(null);
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
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([
      api.getGameConfig(eventId),
      api.getTablesState(eventId),
      api.getAllPlayers(eventId),
      api.getTimerState(eventId),
    ])
      .then(([config, tables, regs, tState]) => {
        setEventConfig(config);
        setTablesState(tables);
        setPlayers(regs);
        setTimerState(tState);
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

  const errHandler = useCallback((err: Error) => {
    notifications.show({
      title: i18n._t('Error has occurred'),
      message: err.message,
      color: 'red',
    });
  }, []);

  const doReloadConfigAndTables = useCallback(() => {
    return Promise.all([
      api.getGameConfig(eventId),
      api.getTablesState(eventId),
      api.getTimerState(eventId),
    ]).then(([cfg, tables, tState]) => {
      setEventConfig(cfg);
      setTablesState(tables);
      setTimerState(tState);
    });
  }, []);

  const doReloadConfigOnly = useCallback(() => {
    return api.getGameConfig(eventId).then((cfg) => {
      setEventConfig(cfg);
    });
  }, []);

  const doReloadTablesOnly = useCallback(() => {
    return api.getTablesState(eventId).then((tables) => {
      setTablesState(tables);
    });
  }, []);

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
    []
  );

  const onDefinalize = useCallback((sessionHash: string) => {
    if (!id) return;
    api
      .definalizeGame(sessionHash)
      .then((r) => {
        if (!r) throw new Error(i18n._t('Failed to definalize game'));
      })
      .then(doReloadTablesOnly)
      .catch(errHandler);
  }, []);

  const onRemoveGame = useCallback((sessionHash: string) => {
    if (!id) return;
    api
      .cancelGame(sessionHash)
      .then((r) => {
        if (!r) throw new Error(i18n._t('Failed to cancel game'));
      })
      .then(doReloadTablesOnly)
      .catch(errHandler);
  }, []);

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
  }, []);

  const onAddExtraTime = useCallback((extraTime: number) => {
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
  }, []);

  const onAddExtraTimeForTable = useCallback((hash: string, extraTime: number) => {
    api
      .addExtraTime([hash], extraTime)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to add extra time'));
        }
      })
      .then(doReloadConfigAndTables)
      .catch(errHandler);
  }, []);

  const notifyPlayers = useCallback(() => {
    api
      .notifyPlayers(eventId)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to notify players'));
        }
      })
      .catch(errHandler);
  }, []);

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
  }, []);

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
  }, []);

  const onMakeIntervalSeating = useCallback((interval: number) => {
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
  }, []);

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
  }, []);

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
  }, []);

  const onMakePrescriptedSeating = useCallback((rndSeats: boolean) => {
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
  }, []);

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
  }, []);

  const onForceFinish = useCallback((sessionHash: string) => {
    api
      .forceFinish(sessionHash)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to finish the game'));
        }
      })
      .then(doReloadTablesOnly)
      .catch(errHandler);
  }, []);

  let timer: ReturnType<typeof setInterval> | null = null;
  const reloader = useCallback(() => {
    setSecsUntilReload((secs) => {
      if (secs <= 0) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        doReloadConfigAndTables().then(() => {
          setSecsUntilReload(DEFAULT_SECS_UNTIL_RELOAD);
          timer = setInterval(reloader, 1000);
        });
      }
      return secs - 1;
    });
  }, [secsUntilReload]);

  useEffect(() => {
    if (!timer) {
      timer = setInterval(reloader, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      {eventConfig?.syncStart && (
        <TournamentControls
          seatingLoading={seatingLoading}
          players={players}
          tablesState={tablesState}
          eventConfig={eventConfig}
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
        color='green'
        title={i18n._t('Refresh data [%1]', [secsUntilReload <= 0 ? '0' : secsUntilReload])}
        loading={false}
        icon={<IconRefresh />}
        onClick={() => {
          doReloadConfigAndTables().then(() => {
            setSecsUntilReload(DEFAULT_SECS_UNTIL_RELOAD);
          });
        }}
      />
    </Container>
  );
};
