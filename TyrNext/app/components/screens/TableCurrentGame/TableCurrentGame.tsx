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

import { IComponentProps } from '../../IComponentProps';

import { Loader } from '../../base/Loader/Loader';
import { i18n } from '../../i18n';
import { useContext, useState } from 'react';
import {
  CALL_REFEREE,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  INIT_BLANK_OUTCOME,
  SHOW_GAME_LOG,
  TOGGLE_OVERVIEW_DIFFBY,
  UPDATE_CURRENT_GAMES_INIT,
} from '../../../store/actions/interfaces';
import { Notification } from '../../base/Notification/Notification';
import { ModalDialog } from '../../base/ModalDialog/ModalDialog';
import { TablePrimaryView } from '../../pages/TablePrimaryView/TablePrimaryView';
import { getPlayerData, getTableStatus } from '../../../store/selectors/table';
import { RoundOutcome } from '../../../clients/proto/atoms.pb';

const outcomes = {
  ron: RoundOutcome.ROUND_OUTCOME_RON,
  tsumo: RoundOutcome.ROUND_OUTCOME_TSUMO,
  draw: RoundOutcome.ROUND_OUTCOME_DRAW,
  abort: RoundOutcome.ROUND_OUTCOME_ABORT,
  chombo: RoundOutcome.ROUND_OUTCOME_CHOMBO,
  nagashi: RoundOutcome.ROUND_OUTCOME_NAGASHI,
};

export const TableCurrentGame = ({ state, dispatch }: IComponentProps) => {
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
    state.loading.games ||
    !state.gameOverviewReady ||
    !state.players ||
    state.players.length !== 4 ||
    state.loading.addRound ||
    state.loading.overview;

  if (isLoading) {
    return <Loader />;
  }

  const tableStatus = getTableStatus(state);
  const self = { onPlayerClick: () => {}, ...(getPlayerData('self', state) ?? {}) };
  const shimocha = { onPlayerClick: () => {}, ...(getPlayerData('shimocha', state) ?? {}) };
  const toimen = { onPlayerClick: () => {}, ...(getPlayerData('toimen', state) ?? {}) };
  const kamicha = { onPlayerClick: () => {}, ...(getPlayerData('kamicha', state) ?? {}) };

  self.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: self.id });
  shimocha.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: shimocha.id });
  toimen.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: toimen.id });
  kamicha.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: kamicha.id });

  const showActionButtons = !tableStatus.timerState.timerWaiting;

  return (
    <>
      <TablePrimaryView
        toimen={toimen}
        kamicha={kamicha}
        shimocha={shimocha}
        self={self}
        tableStatus={{
          ...tableStatus,
          onCallRefereeClick: tableStatus.showCallReferee
            ? () => setCallRefereeConfirmationShown(true)
            : undefined,
        }}
        onGoHome={() => dispatch({ type: GOTO_PREV_SCREEN })}
        onRefresh={() => dispatch({ type: UPDATE_CURRENT_GAMES_INIT })}
        onAddNewGame={
          showActionButtons
            ? (selectedOutcome) => {
                dispatch({ type: INIT_BLANK_OUTCOME, payload: outcomes[selectedOutcome] });
                dispatch({ type: GOTO_NEXT_SCREEN });
              }
            : undefined
        }
        onGotoGameLog={showActionButtons ? () => dispatch({ type: SHOW_GAME_LOG }) : undefined}
        rulesetConfig={state.gameConfig?.rulesetConfig ?? {}}
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
