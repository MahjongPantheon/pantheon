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
import { IComponentProps } from '#/components/IComponentProps';
import {
  getOutcomeModalInfo,
  getPlayerBottomInfo,
  getPlayerLeftInfo,
  getPlayerRightInfo,
  getPlayerTopInfo,
  getBottomPanel,
  getArrowsInfo,
  getTableInfo,
} from '#/components/screens/table/TableHelper';
import { TableScreenStateless } from '#/components/screens/table/base/TableScreenStateless';
import { Preloader } from '#/components/general/preloader/Preloader';
import { i18n } from '#/components/i18n';
import { I18nService } from '#/services/i18n';

export class TableScreen extends React.Component<IComponentProps> {
  static contextType = i18n;

  render() {
    const loc = this.context as I18nService;
    const { state, dispatch } = this.props;
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
      <TableScreenStateless
        topPlayer={topPlayerInfo}
        leftPlayer={leftPlayerInfo}
        rightPlayer={rightPlayerInfo}
        bottomPlayer={bottomPlayerInfo}
        tableInfo={tableInfo}
        arrowsInfo={arrowsInfo}
        outcomeModal={outcomeModalInfo}
        bottomPanel={buttonPanelInfo}
      />
    );
  }
}
