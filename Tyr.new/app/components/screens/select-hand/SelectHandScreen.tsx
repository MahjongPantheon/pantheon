import * as React from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {SelectHandScreenView} from '#/components/screens/select-hand/view/SelectHandScreenView';
import {getWinningUsers, hasYaku} from '#/store/selectors/mimirSelectors';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {ArrowState, SelectHandActiveTab, YakuGroup, YakuItem} from '#/components/screens/select-hand/YakuTypes';
import {getDisabledYaku, getYakuList} from '#/store/selectors/screenYakuSelectors';
import {getSelectedYaku} from '#/store/selectors/yaku';
import {ADD_YAKU, GOTO_NEXT_SCREEN, GOTO_PREV_SCREEN, REMOVE_YAKU} from '#/store/actions/interfaces';
import {doraOptions} from '#/store/selectors/navbarSelectors';

export class SelectHandScreen extends React.Component<IComponentProps> {

  private onTabClick(tab: SelectHandActiveTab) {
    const {state, dispatch} = this.props;
    if (state.currentScreen === 'yakuSelect' && tab === SelectHandActiveTab.TOTAL) {
      dispatch({ type: GOTO_NEXT_SCREEN });
    } else if (state.currentScreen === 'totalHandSelect' && tab === SelectHandActiveTab.YAKU) {
      dispatch({ type: GOTO_PREV_SCREEN });
    }
  }

  private onYakuClick(yakuId: number) {
    const {state, dispatch} = this.props;
    if (hasYaku(state, yakuId)) {
      dispatch({ type: REMOVE_YAKU, payload: { id: yakuId, winner: state.multironCurrentWinner } });
    } else {
      dispatch({ type: ADD_YAKU, payload: { id: yakuId, winner: state.multironCurrentWinner } });
    }
  }



  render() {
    const {state, i18nService} = this.props;
    if (!state.currentOutcome || state.currentOutcome.selectedOutcome !== 'ron') {
      return null;
    }

    // const winnerId = state.currentOutcome.winner
    const player = getWinningUsers(state)[0] //state.multironCurrentWinner?
    const playerName = player.displayName;
    const outcomeText = OutcomeTableMode.RON;
    const canGoNext = true;
    const leftArrowState = ArrowState.UNAVAILABLE;
    const rightArrowState = ArrowState.UNAVAILABLE;
    const activeTab = state.currentScreen === 'yakuSelect' ? SelectHandActiveTab.YAKU : SelectHandActiveTab.TOTAL;



    const selectedYaku = getSelectedYaku(state)
    const disabledYaku = getDisabledYaku(state)[player.id]

    const yakuList = getYakuList(state)[player.id];
    const yakuGroups: YakuGroup[] = [];
    yakuList.forEach(yakuListItem => {
      const yakuGroup: YakuItem[] = []
      yakuListItem.forEach(yaku => {
        const item: YakuItem = {
          name: yaku.name(i18nService),
          onClick: () => this.onYakuClick(yaku.id),
          disabled: disabledYaku[yaku.id],
          pressed: selectedYaku.indexOf(yaku.id) !== -1,
        }
        yakuGroup.push(item)
      })
      yakuGroups.push(yakuGroup);
    })

    const yakuHan = state.currentOutcome.han
    const doraCount = state.currentOutcome.dora
    const uraDoraCount = 0
    const fuCount = state.currentOutcome.fu
    const withRedFives = false
    const redFivesCount = undefined

    const doraValues: number[] = doraOptions(state);
    const uraDoraValues: number[] = [0, 5]; //add with ura to props
    const redFivesValues: number[] = [0, 16];
    const fuValues = state.currentOutcome.possibleFu;

    return <SelectHandScreenView
      playerName={playerName}
      yakuGroups={yakuGroups}
      outcome={outcomeText}
      canGoNext={canGoNext}
      leftArrowState={leftArrowState}
      rightArrowState={rightArrowState}
      activeTab={activeTab}
      onTabClick={this.onTabClick.bind(this)}
      doraValues={doraValues}
      uraDoraValues={uraDoraValues}
      redFivesValues={redFivesValues}
      fuValues={fuValues}
      yakuHan={yakuHan}
      doraCount={doraCount}
      uraDoraCount={uraDoraCount}
      fuCount={fuCount}
      withRedFives={withRedFives}
      redFivesCount={redFivesCount}
      />
  }
}
