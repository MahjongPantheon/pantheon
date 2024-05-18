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
import { useContext } from 'react';
import { GOTO_NEXT_SCREEN, GOTO_PREV_SCREEN } from '../../../store/actions/interfaces';
import { getOutcomeTitle, getPlayerButtons, getPlayerData } from '../../../store/selectors/table';
import { TableSelectPlayerStatus } from '../../pages/TableSelectPlayerStatus/TableSelectPlayerStatus';
import { mayGoNextFromPlayersSelect } from '../../../store/selectors/navbar';

export const TableSelectPlayers = ({ state, dispatch }: IComponentProps) => {
  const loc = useContext(i18n);

  const isLoading =
    state.loading.events ||
    (state.currentScreen === 'overview' &&
      (!state.gameOverviewReady || !state.players || state.players.length !== 4)) ||
    state.loading.addRound ||
    state.loading.overview;

  if (isLoading) {
    return <Loader />;
  }

  const self = getPlayerData('self', state) ?? {};
  const shimocha = getPlayerData('shimocha', state) ?? {};
  const toimen = getPlayerData('toimen', state) ?? {};
  const kamicha = getPlayerData('kamicha', state) ?? {};

  const selfButtons = getPlayerButtons('self', state, dispatch) ?? {};
  const shimochaButtons = getPlayerButtons('shimocha', state, dispatch) ?? {};
  const toimenButtons = getPlayerButtons('toimen', state, dispatch) ?? {};
  const kamichaButtons = getPlayerButtons('kamicha', state, dispatch) ?? {};

  const bottomPanelText = getOutcomeTitle(state, loc);

  return (
    <>
      <TableSelectPlayerStatus
        toimen={{ ...toimen, buttons: toimenButtons }}
        kamicha={{ ...kamicha, buttons: kamichaButtons }}
        shimocha={{ ...shimocha, buttons: shimochaButtons }}
        self={{ ...self, buttons: selfButtons }}
        bottomPanelText={bottomPanelText}
        onGoBack={() => dispatch({ type: GOTO_PREV_SCREEN })}
        onGoForward={() => dispatch({ type: GOTO_NEXT_SCREEN })}
        mayGoForward={mayGoNextFromPlayersSelect(state)}
        topRowUpsideDown={!state.settings.singleDeviceMode}
      />
    </>
  );
};
