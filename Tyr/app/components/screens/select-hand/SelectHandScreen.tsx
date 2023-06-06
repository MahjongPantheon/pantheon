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
import { SelectHandScreenView } from './view/SelectHandScreenView';
import { getWinningUsers, hasYaku } from '../../../store/selectors/mimirSelectors';
import { ArrowState, SelectHandActiveTab, YakuGroup, YakuItem } from './YakuTypes';
import { getDisabledYaku, getYakuList } from '../../../store/selectors/screenYakuSelectors';
import { getSelectedYaku } from '../../../store/selectors/yaku';
import {
  ADD_YAKU,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  REMOVE_YAKU,
  SELECT_MULTIRON_WINNER,
  SET_DORA_COUNT,
  SET_FU_COUNT,
  SET_SELECT_HAND_TAB,
} from '../../../store/actions/interfaces';
import { doraOptions, mayGoNextFromYakuSelect } from '../../../store/selectors/navbarSelectors';
import { getDora, getFu, getPossibleFu, getHan } from '../../../store/selectors/hanFu';
import { getOutcomeName } from '../table/TableHelper';
import { i18n } from '../../i18n';
import { I18nService } from '../../../services/i18n';
import { RoundOutcome } from '../../../clients/proto/atoms.pb';

export class SelectHandScreen extends React.Component<IComponentProps> {
  static contextType = i18n;

  private onTabClick(tab: SelectHandActiveTab) {
    const { state, dispatch } = this.props;
    if (state.currentSelectHandTab === 'yaku' && tab === SelectHandActiveTab.TOTAL) {
      dispatch({ type: SET_SELECT_HAND_TAB, payload: 'total' });
    } else if (state.currentSelectHandTab === 'total' && tab === SelectHandActiveTab.YAKU) {
      dispatch({ type: SET_SELECT_HAND_TAB, payload: 'yaku' });
    }
  }

  private onYakuClick(yakuId: number) {
    const { state, dispatch } = this.props;
    if (hasYaku(state, yakuId)) {
      dispatch({ type: REMOVE_YAKU, payload: { id: yakuId, winner: state.multironCurrentWinner } });
    } else {
      dispatch({ type: ADD_YAKU, payload: { id: yakuId, winner: state.multironCurrentWinner } });
    }
  }

  private onBackClick() {
    const { dispatch } = this.props;
    //todo maybe for total open table instead of yaku select?
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onNextClick() {
    const { dispatch } = this.props;
    dispatch({ type: GOTO_NEXT_SCREEN });
  }

  private onDoraSelected(value: number) {
    const { state, dispatch } = this.props;
    dispatch({
      type: SET_DORA_COUNT,
      payload: {
        count: value,
        winner: state.multironCurrentWinner,
      },
    });
  }

  private onUraDoraSelected(_value: number) {
    //todo
  }

  private onRedFivesSelected(_value: number) {
    //todo
  }

  private onFuSelected(value: number) {
    const { state, dispatch } = this.props;
    dispatch({
      type: SET_FU_COUNT,
      payload: {
        count: value,
        winner: state.multironCurrentWinner,
      },
    });
  }

  private onLeftArrowClick() {
    this.goToMultironUser(-1);
  }

  private onRightArrowClick() {
    this.goToMultironUser(1);
  }

  private goToMultironUser(delta: number) {
    const { state, dispatch } = this.props;
    const currentWinnerId = state.multironCurrentWinner;

    if (currentWinnerId) {
      const allWinners = getWinningUsers(state);
      const currentIndex = allWinners.findIndex((x) => x.id === currentWinnerId);
      if (currentIndex !== -1) {
        const nextId = allWinners[currentIndex + delta].id;
        dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: nextId } });
        dispatch({ type: SET_SELECT_HAND_TAB, payload: 'yaku' });
      }
    }
  }

  render() {
    const loc = this.context as I18nService;
    const { state } = this.props;
    if (
      !state.currentOutcome ||
      (state.currentOutcome.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_RON &&
        state.currentOutcome.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO)
    ) {
      //todo
      return null;
    }

    const currentWinnerId = state.multironCurrentWinner;
    if (!currentWinnerId) {
      return null;
    }

    const allWinners = getWinningUsers(state);
    const player = allWinners.find((val) => val.id === currentWinnerId);
    const playerName = player !== undefined ? player.title : '';
    const bottomPanelText = getOutcomeName(loc, state.currentOutcome.selectedOutcome);
    const canGoNext = !!mayGoNextFromYakuSelect(state);

    let leftArrowState = ArrowState.UNAVAILABLE;
    let rightArrowState = ArrowState.UNAVAILABLE;
    if (allWinners.length > 1) {
      leftArrowState =
        allWinners[0].id === currentWinnerId ? ArrowState.DISABLED : ArrowState.AVAILABLE;
      rightArrowState =
        allWinners[allWinners.length - 1].id === currentWinnerId
          ? ArrowState.DISABLED
          : ArrowState.AVAILABLE;
    }
    const activeTab =
      state.currentSelectHandTab === 'total' ? SelectHandActiveTab.TOTAL : SelectHandActiveTab.YAKU;

    const selectedYaku = getSelectedYaku(state);
    const disabledYaku = getDisabledYaku(state)[currentWinnerId];

    const yakuList = getYakuList(state)[currentWinnerId];
    const yakuGroups: YakuGroup[] = [];
    yakuList.forEach((yakuListItem) => {
      const yakuGroup: YakuItem[] = [];
      yakuListItem.forEach((yaku) => {
        const item: YakuItem = {
          name: yaku.name(loc),
          onClick: () => this.onYakuClick(yaku.id),
          disabled: disabledYaku[yaku.id],
          pressed: selectedYaku.includes(yaku.id),
        };
        yakuGroup.push(item);
      });
      yakuGroups.push(yakuGroup);
    });

    const yakuHan = getHan(state, currentWinnerId);
    const isYakuman = yakuHan < 0;

    const doraCount = getDora(state, currentWinnerId);
    const doraValues = doraOptions(state);

    const withUraDora = false; //todo support withUra
    const uraDoraCount = undefined;
    const uraDoraValues = undefined;

    const withRedFives = false; //todo support withRedFives
    const redFivesCount = undefined;
    const redFivesValues = undefined;

    const fuCount = getFu(state, currentWinnerId);
    // todo move to selectors?
    const shouldSelectFu = yakuHan > 0 && doraCount + yakuHan <= 4;
    const fuValues = shouldSelectFu ? getPossibleFu(state) : [];

    return (
      <SelectHandScreenView
        playerName={playerName}
        yakuGroups={yakuGroups}
        bottomPanelText={bottomPanelText}
        leftArrowState={leftArrowState}
        leftArrowClick={this.onLeftArrowClick.bind(this)}
        rightArrowState={rightArrowState}
        rightArrowClick={this.onRightArrowClick.bind(this)}
        activeTab={activeTab}
        onTabClick={this.onTabClick.bind(this)}
        canGoNext={canGoNext}
        onNextClick={this.onNextClick.bind(this)}
        onBackClick={this.onBackClick.bind(this)}
        isYakuman={isYakuman}
        yakuHan={yakuHan}
        doraCount={doraCount}
        doraValues={doraValues}
        onDoraSelected={this.onDoraSelected.bind(this)}
        withUraDora={withUraDora}
        uraDoraCount={uraDoraCount}
        uraDoraValues={uraDoraValues}
        onUraDoraSelected={this.onUraDoraSelected.bind(this)}
        withRedFives={withRedFives}
        redFivesCount={redFivesCount}
        redFivesValues={redFivesValues}
        onRedFivesSelected={this.onRedFivesSelected.bind(this)}
        fuCount={fuCount}
        fuValues={fuValues}
        onFuSelected={this.onFuSelected.bind(this)}
      />
    );
  }
}
