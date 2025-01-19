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
import { useContext, useEffect, useState } from 'react';
import { authCtx } from '../hooks/auth';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { usePageTitle } from '../hooks/pageTitle';
import { Chombo, GameConfig, Penalty, Player } from '../clients/proto/atoms.pb';
import { Container, LoadingOverlay, Space } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';
import { Redirect } from 'wouter';
import { useStorage } from '../hooks/storage';
import { PenaltiesList } from './Penalties/PenaltiesList';
import { PenaltyForm } from './Penalties/PenaltyForm';

export const Penalties: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  api.setEventId(parseInt(id ?? '0', 10));
  const [isLoading, setIsLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState<null | GameConfig>(null);
  const [playersList, setPlayersList] = useState<Array<{ label: string; value: string }>>([]);
  const [playersListFull, setPlayersListFull] = useState<Record<number, Player>>({});
  const [penaltiesList, setPenaltiesList] = useState<Penalty[]>([]);
  const [refereesList, setRefereesList] = useState<Record<number, Player>>({});
  const [chomboList, setChomboList] = useState<Chombo[]>([]);
  const [chomboPlayersList, setChomboPlayersList] = useState<Record<number, Player>>({});
  usePageTitle(i18n._t('Manage penalties'));

  const reloadForm = () => {
    if (!isLoggedIn || !id) {
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([
      api.getGameConfig(parseInt(id, 10)),
      api.getAllPlayers(parseInt(id, 10)),
      api.getPenalties(parseInt(id, 10)),
      api.getChombo(parseInt(id, 10)),
    ])
      .then(([config, players, penalties, chombo]) => {
        setEventConfig(config);
        setPlayersList(
          players.map((p) => ({
            value: p.id.toString(),
            label: p.title,
          }))
        );
        setPlayersListFull(
          players.reduce(
            (acc, p) => {
              acc[p.id] = p;
              return acc;
            },
            {} as Record<number, Player>
          )
        );
        setPenaltiesList(penalties.penalties);
        setRefereesList(
          penalties.referees.reduce(
            (acc, p) => {
              acc[p.id] = p;
              return acc;
            },
            {} as Record<number, Player>
          )
        );
        setChomboList(chombo.chombos);
        setChomboPlayersList(
          chombo.players.reduce(
            (acc, p) => {
              acc[p.id] = p;
              return acc;
            },
            {} as Record<number, Player>
          )
        );
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
  };

  useEffect(() => {
    reloadForm();
  }, [isLoggedIn]);

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      <PenaltyForm
        eventId={id}
        playersList={playersList}
        eventConfig={eventConfig}
        onSuccess={reloadForm}
      />
      <Space h='20px' />
      <PenaltiesList
        penaltiesList={penaltiesList}
        setPenaltiesList={setPenaltiesList}
        playersListFull={playersListFull}
        refereesList={refereesList}
        chomboList={chomboList}
        chomboPlayersList={chomboPlayersList}
      />
    </Container>
  );
};
