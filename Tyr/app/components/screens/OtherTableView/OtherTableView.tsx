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
import { i18n } from '../../i18n';
import { useContext } from 'react';

import { Loader } from '../../base/Loader/Loader';
import {
  GET_OTHER_TABLE_INIT,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  SHOW_GAME_LOG,
  TOGGLE_OVERVIEW_DIFFBY,
} from '../../../store/actions/interfaces';
import { TablePrimaryView } from '../../pages/TablePrimaryView/TablePrimaryView';
import { getOtherTablePlayerData, getOtherTableStatus } from '../../../store/selectors/table';
import { Button } from '../../base/Button/Button';
import styles from '../../pages/TablePrimaryView/TablePrimaryView.module.css';
import SaveIcon from '../../../img/icons/check.svg?react';

export const OtherTableView = ({ state, dispatch }: IComponentProps) => {
  const loc = useContext(i18n);
  const isLoading =
    state.loading.events ||
    !state.currentOtherTable ||
    !state.currentOtherTablePlayers ||
    state.currentOtherTablePlayers.length !== 4 ||
    state.loading.otherTable ||
    state.loading.overview;

  if (isLoading) {
    return <Loader />;
  }

  const tableStatus = getOtherTableStatus(state, dispatch);
  const self = { onPlayerClick: () => {}, ...(getOtherTablePlayerData('self', state) ?? {}) };
  const shimocha = {
    onPlayerClick: () => {},
    ...(getOtherTablePlayerData('shimocha', state) ?? {}),
  };
  const toimen = { onPlayerClick: () => {}, ...(getOtherTablePlayerData('toimen', state) ?? {}) };
  const kamicha = { onPlayerClick: () => {}, ...(getOtherTablePlayerData('kamicha', state) ?? {}) };

  self.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: self.id });
  shimocha.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: shimocha.id });
  toimen.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: toimen.id });
  kamicha.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: kamicha.id });

  if (state.currentOtherTable?.state.finished) {
    return (
      <>
        <div className={styles.wrapper}>
          <div className={styles.gameFinished}>{loc._t('Game has finished')}</div>
          <div className={styles.buttons}>
            <Button
              variant='contained'
              onClick={() => dispatch({ type: GOTO_NEXT_SCREEN })}
              size='lg'
              icon={<SaveIcon />}
            />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <TablePrimaryView
          toimen={toimen}
          kamicha={kamicha}
          shimocha={shimocha}
          self={self}
          tableStatus={tableStatus}
          onGoBack={() => dispatch({ type: GOTO_PREV_SCREEN })}
          onRefresh={() =>
            dispatch({ type: GET_OTHER_TABLE_INIT, payload: state.currentOtherTableHash })
          }
          onGotoGameLog={() => dispatch({ type: SHOW_GAME_LOG })}
          rulesetConfig={state.gameConfig?.rulesetConfig ?? {}}
        />
      </>
    );
  }
};
