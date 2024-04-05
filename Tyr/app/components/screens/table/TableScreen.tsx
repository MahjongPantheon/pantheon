/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
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
import { IComponentProps } from '../../IComponentProps';
import {
  getOutcomeModalInfo,
  getPlayerBottomInfo,
  getPlayerLeftInfo,
  getPlayerRightInfo,
  getPlayerTopInfo,
  getBottomPanel,
  getArrowsInfo,
  getTableInfo,
} from './TableHelper';
import { TableScreenStateless } from './base/TableScreenStateless';
import { Preloader } from '../../general/preloader/Preloader';
import { i18n } from '../../i18n';
import { ModalDialog } from '../../general/modal-dialog/ModalDialog';
import { useContext, useState } from 'react';
import { CALL_REFEREE } from '../../../store/actions/interfaces';
import { Notification } from '../../general/notification/Notification';

export const TableScreen = ({ state, dispatch }: IComponentProps) => {
  const loc = useContext(i18n);
  const [callRefereeConfirmationShown, setCallRefereeConfirmationShown] = useState(false);
  const [callRefereeNotificationShown, setCallRefereeNotificationShown] = useState(false);
  function onCallRefereeClick() {
    dispatch({ type: CALL_REFEREE });
    setCallRefereeNotificationShown(true);
    setTimeout(() => {
      setCallRefereeNotificationShown(false);
    }, 3000);
  }

  const isLoading =
    state.loading.events ||
    (state.currentScreen === 'overview' &&
      (!state.gameOverviewReady || !state.players || state.players.length !== 4)) ||
    state.loading.addRound ||
    state.loading.overview;
  if (isLoading) {
    return <Preloader />;
  }

  const topPlayerInfo = getPlayerTopInfo(loc, state, dispatch);
  const leftPlayerInfo = getPlayerLeftInfo(loc, state, dispatch);
  const rightPlayerInfo = getPlayerRightInfo(loc, state, dispatch);
  const bottomPlayerInfo = getPlayerBottomInfo(loc, state, dispatch);

  const tableInfo = getTableInfo(state, dispatch);

  const outcomeModalInfo = getOutcomeModalInfo(loc, state, dispatch);
  const buttonPanelInfo = getBottomPanel(loc, state, dispatch);

  const arrowsInfo = getArrowsInfo(state);

  return (
    <>
      <TableScreenStateless
        topPlayer={topPlayerInfo}
        leftPlayer={leftPlayerInfo}
        rightPlayer={rightPlayerInfo}
        bottomPlayer={bottomPlayerInfo}
        tableInfo={{
          ...tableInfo,
          onCallRefereeClick: () => setCallRefereeConfirmationShown(true),
        }}
        arrowsInfo={arrowsInfo}
        outcomeModal={outcomeModalInfo}
        bottomPanel={buttonPanelInfo}
      />
      {callRefereeConfirmationShown && (
        <ModalDialog
          onClose={() => setCallRefereeConfirmationShown(false)}
          actionPrimaryLabel={loc._t('Call referee')}
          actionPrimary={() => {
            onCallRefereeClick();
            setCallRefereeConfirmationShown(false);
          }}
          actionSecondaryLabel={loc._t('Cancel')}
          actionSecondary={() => setCallRefereeConfirmationShown(false)}
        >
          {loc._t('Call referee for your table?')}
        </ModalDialog>
      )}
      <Notification isShown={callRefereeNotificationShown}>
        {loc._t('Referee has been requested to your table!')}
      </Notification>
    </>
  );
};
