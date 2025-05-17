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
import { getWinningUsers, hasYaku } from '../../../store/selectors/mimir';
import { getDisabledYaku, getSelectedYaku, getYakuList } from '../../../store/selectors/yaku';
import {
  ADD_YAKU,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  REMOVE_YAKU,
  SET_DORA_COUNT,
  SET_FU_COUNT,
  SELECT_PAO,
} from '../../../store/actions/interfaces';
import { doraOptions, mayGoNextFromYakuSelect } from '../../../store/selectors/navbar';
import { getDora, getFu, getPossibleFu, getHan } from '../../../store/selectors/hanFu';
import { getOutcomeName } from '../../../store/selectors/table';
import { RoundOutcome } from '../../../clients/proto/atoms.pb';
import { useContext } from 'react';
import { i18n } from '../../i18n';
import { Hand, IProps as HandProps } from '../../pages/Hand/Hand';
import { sortByViewPriority } from '../../../helpers/yaku';
import { getPlayerWithPao } from '../../../store/selectors/pao';
import { enableDoubleYakuman } from '../../../helpers/yakuValues';

export const SelectHand = (props: IComponentProps) => {
  const loc = useContext(i18n);

  const onYakuClick = (yakuId: number, playerId: number) => {
    if (hasYaku(props.state, yakuId)[playerId]) {
      props.dispatch({
        type: REMOVE_YAKU,
        payload: { id: yakuId, winner: playerId },
      });
    } else {
      props.dispatch({
        type: ADD_YAKU,
        payload: { id: yakuId, winner: playerId },
      });
    }
  };

  const onBackClick = () => {
    //todo maybe for total open table instead of yaku select?
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const onNextClick = () => {
    props.dispatch({ type: GOTO_NEXT_SCREEN });
  };

  const onDoraSelected = (value: number, playerId: number) => {
    props.dispatch({
      type: SET_DORA_COUNT,
      payload: {
        count: value,
        winner: playerId,
      },
    });
  };

  const onFuSelected = (value: number, playerId: number) => {
    props.dispatch({
      type: SET_FU_COUNT,
      payload: {
        count: value,
        winner: playerId,
      },
    });
  };

  const onPaoSelected = (paoId: number | undefined, winnerId: number) => {
    props.dispatch({
      type: SELECT_PAO,
      payload: {
        paoId,
        winnerId,
      },
    });
  };

  const { state } = props;

  if (
    !state.currentOutcome ||
    (state.currentOutcome.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_RON &&
      state.currentOutcome.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO)
  ) {
    //todo
    return null;
  }

  const allWinners = getWinningUsers(state);
  const bottomPanelText = getOutcomeName(loc, state.currentOutcome.selectedOutcome);
  const canGoNext = !!mayGoNextFromYakuSelect(state);

  enableDoubleYakuman(state.gameConfig?.rulesetConfig?.doubleYakuman ?? []);

  const selectedYaku = getSelectedYaku(state);
  const disabledYaku = getDisabledYaku(state);
  const yakuList = getYakuList(state);

  const hands = allWinners.map((user) => {
    const yakuHan = getHan(state, user.id);
    const isYakuman = yakuHan < 0;

    const doraCount = getDora(state, user.id);
    const doraValues = doraOptions(state, user.id);

    const shouldSelectFu = yakuHan > 0 && doraCount + yakuHan <= 4;
    const fuCount = getFu(state, user.id);
    const fuValues = shouldSelectFu ? getPossibleFu(state, user.id) : [];

    const paoSelectRequired = selectedYaku[user.id].some((y) =>
      (props.state.gameConfig?.rulesetConfig?.yakuWithPao ?? []).includes(y)
    );
    const pao = getPlayerWithPao(props.state);

    return {
      id: user.id,
      playerId: user.id,
      playerName: user.title,
      hasAvatar: user.hasAvatar,
      lastUpdate: user.lastUpdate,
      yaku: sortByViewPriority(yakuList[user.id]).map((y) => y.id),
      selectedYaku: selectedYaku[user.id],
      disabledYaku: disabledYaku[user.id],
      onYakuClick,
      shouldSelectFu,
      isYakuman,
      yakuHan,
      doraCount,
      doraValues,
      onDoraSelected,
      fuCount,
      fuValues,
      onFuSelected,
      paoSelectRequired,
      pao: pao[user.id],
      paoPlayers: props.state.players?.filter((p) => p.id !== user.id),
      onPaoSelected,
    } as HandProps['hands'][number];
  });

  return (
    <Hand
      bottomPanelText={bottomPanelText}
      canGoNext={canGoNext}
      onNextClick={onNextClick}
      onBackClick={onBackClick}
      hands={hands}
    />
  );
};
