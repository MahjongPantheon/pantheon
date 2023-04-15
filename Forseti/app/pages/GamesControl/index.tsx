import * as React from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { usePageTitle } from '#/hooks/pageTitle';
import { GameConfig, IntermediateResultOfSession, TableState } from '#/clients/atoms.pb';
import { Container } from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';
import { GamesList } from '#/pages/GamesControl/GamesList';

export const GamesControl: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState<null | GameConfig>(null);
  const [tablesState, setTablesState] = useState<TableState[]>([]);

  usePageTitle(i18n._t('Games management :: %1', [eventConfig?.eventTitle]));

  useEffect(() => {
    if (!isLoggedIn || !id) {
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([api.getGameConfig(parseInt(id, 10)), api.getTablesState(parseInt(id, 10))])
      .then(([config, tables]) => {
        setEventConfig(config);
        setTablesState(tables);
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

  const onCancelRound = useCallback(
    (sessionHash: string, intermediateResults: IntermediateResultOfSession[]) => {
      if (!id) return;
      api
        .cancelLastRound(sessionHash, intermediateResults)
        .then((r) => {
          if (!r) throw new Error(i18n._t('Failed to cancel round'));
        })
        .then(() => api.getTablesState(parseInt(id, 10)))
        .then((tables) => {
          setTablesState(tables);
        })
        .catch((err: Error) => {
          notifications.show({
            title: i18n._t('Error has occurred'),
            message: err.message,
            color: 'red',
          });
        });
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
        .then(() => api.getTablesState(parseInt(id, 10)))
        .then((tables) => {
          setTablesState(tables);
        })
        .catch((err: Error) => {
          notifications.show({
            title: i18n._t('Error has occurred'),
            message: err.message,
            color: 'red',
          });
        });
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
        .then(() => api.getTablesState(parseInt(id, 10)))
        .then((tables) => {
          setTablesState(tables);
        })
        .catch((err: Error) => {
          notifications.show({
            title: i18n._t('Error has occurred'),
            message: err.message,
            color: 'red',
          });
        });
    },
    [isLoggedIn]
  );

  return isLoading ? null : (
    <Container>
      <GamesList
        tablesState={tablesState}
        eventConfig={eventConfig}
        onCancelLastRound={onCancelRound}
        onDefinalizeGame={onDefinalize}
        onRemoveGame={onRemoveGame}
      />
    </Container>
  );
};
