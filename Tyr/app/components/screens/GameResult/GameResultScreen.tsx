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

import React, { useCallback } from 'react';
import { IComponentProps } from '../../IComponentProps';
import { Loader } from '../../base/Loader/Loader';
import { GameResult as GameResultPage } from '../../pages/GameResult/GameResult';
import { GOTO_NEXT_SCREEN, START_NEW_GAME } from '../../../store/actions/interfaces';

export const GameResultScreen = (props: IComponentProps) => {
  const { state, dispatch } = props;

  if (
    state.currentScreen !== 'lastResults' ||
    state.loading.overview ||
    state.loading.addRound ||
    state.loading.games ||
    !state.gameConfig
  ) {
    return <Loader />;
  }

  const results = [...(state.lastResults ?? [])].sort((p1, p2) => p2.score - p1.score);
  const canStartGame =
    !state.gameConfig.autoSeating && !state.currentSessionHash && !state.gameConfig.isPrescripted;

  const onCheckClick = useCallback(() => {
    dispatch({ type: GOTO_NEXT_SCREEN });
  }, [dispatch]);

  const onRepeatClick = useCallback(() => {
    let playerIds: number[] | undefined;
    if (state.lastResults) {
      playerIds = state.lastResults.map((x) => x.playerId);
    }

    dispatch({ type: START_NEW_GAME, payload: playerIds });
  }, [state.lastResults, dispatch]);

  return (
    <GameResultPage
      results={results}
      showRepeatButton={canStartGame}
      onCheckClick={onCheckClick}
      onRepeatClick={onRepeatClick}
    />
  );
};
