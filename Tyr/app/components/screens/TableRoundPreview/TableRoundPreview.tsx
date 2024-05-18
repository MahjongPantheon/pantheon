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
import {
  ADD_ROUND_INIT,
  GOTO_PREV_SCREEN,
  TOGGLE_OVERVIEW_DIFFBY,
} from '../../../store/actions/interfaces';
import { TableRoundPreview as TableRoundPreviewPage } from '../../pages/TableRoundPreview/TableRoundPreview';
import { getArrows, getOutcomeTitle, getPlayerData } from '../../../store/selectors/table';
import { useContext } from 'react';
import { i18n } from '../../i18n';

export const TableRoundPreview = ({ state, dispatch }: IComponentProps) => {
  const loc = useContext(i18n);
  const isLoading =
    state.loading.events ||
    (state.currentScreen === 'overview' &&
      (!state.gameOverviewReady || !state.players || state.players.length !== 4)) ||
    state.loading.addRound ||
    state.loading.overview;
  const arrows = getArrows(state);

  if (isLoading || !arrows) {
    return <Loader />;
  }

  const self = { onPlayerClick: () => {}, ...(getPlayerData('self', state) ?? {}) };
  const shimocha = { onPlayerClick: () => {}, ...(getPlayerData('shimocha', state) ?? {}) };
  const toimen = { onPlayerClick: () => {}, ...(getPlayerData('toimen', state) ?? {}) };
  const kamicha = { onPlayerClick: () => {}, ...(getPlayerData('kamicha', state) ?? {}) };

  const bottomPanelText = getOutcomeTitle(state, loc);

  self.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: self.id });
  shimocha.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: shimocha.id });
  toimen.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: toimen.id });
  kamicha.onPlayerClick = () => dispatch({ type: TOGGLE_OVERVIEW_DIFFBY, payload: kamicha.id });

  return (
    <>
      <TableRoundPreviewPage
        toimen={toimen}
        kamicha={kamicha}
        shimocha={shimocha}
        self={self}
        results={arrows}
        bottomPanelText={bottomPanelText}
        onSubmit={() => dispatch({ type: ADD_ROUND_INIT, payload: state })}
        onClickBack={() => dispatch({ type: GOTO_PREV_SCREEN })}
        topRowUpsideDown={!state.settings.singleDeviceMode}
      />
    </>
  );
};
