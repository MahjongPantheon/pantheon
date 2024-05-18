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
import { useCallback, useContext } from 'react';
import { GOTO_PREV_SCREEN } from '../../../store/actions/interfaces';
import { roundToString } from '../../../helpers/roundToString';
import { Loader } from '../../base/Loader/Loader';
import { getRoundOverviewInfo } from '../../../store/selectors/logScreen';
import { i18n } from '../../i18n';
import { IRoundOverviewInfo, IRoundResult } from '../../../helpers/interfaces';
import { LogView } from '../../pages/LogView/LogView';

export const Log = (props: IComponentProps) => {
  const { state, dispatch } = props;
  const loc = useContext(i18n);

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN });
  }, [dispatch]);

  if (state.loading.overview) {
    return <Loader />;
  }

  const results: IRoundResult[] = [];
  const rounds: IRoundOverviewInfo[] = [];

  const playersList = state.currentOtherTable ? state.currentOtherTablePlayers : state.players;

  if (!state.allRoundsOverviewErrorCode && state.allRoundsOverview && playersList) {
    state.allRoundsOverview.forEach((roundOverview) => {
      results.push({
        round: roundToString(roundOverview.roundIndex),
        scores: roundOverview.scores,
        scoresDelta: roundOverview.scoresDelta,
      });

      rounds.push(getRoundOverviewInfo(roundOverview, playersList, loc));
    });
  }

  return (
    <LogView
      startScore={state.gameConfig?.rulesetConfig.startPoints ?? 0}
      players={playersList ?? []}
      results={results}
      onBackClick={onBackClick}
      rounds={rounds}
    />
  );
};
