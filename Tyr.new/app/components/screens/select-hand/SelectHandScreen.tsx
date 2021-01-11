import * as React from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {SelectHandScreenView} from '#/components/screens/select-hand/view/SelectHandScreenView';
import {getWinningUsers, hasYaku} from '#/store/selectors/mimirSelectors';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {ArrowState, SelectHandActiveTab, YakuGroup, YakuItem} from '#/components/screens/select-hand/YakuTypes';
import {getDisabledYaku, getYakuList} from '#/store/selectors/screenYakuSelectors';
import {getSelectedYaku} from '#/store/selectors/yaku';
import {
  ADD_YAKU,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  REMOVE_YAKU,
  SET_DORA_COUNT,
  SET_FU_COUNT,
} from '#/store/actions/interfaces';
import {doraOptions, mayGoNextFromYakuSelect} from '#/store/selectors/navbarSelectors';

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

  private onBackClick() {
    const {state, dispatch} = this.props;
    //todo maybe for total open table instead of yaku select?
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onNextClick() {
    const {state, dispatch} = this.props;
    //todo for multiron switch player if it's not the last one
    dispatch({ type: GOTO_NEXT_SCREEN });
  }

  private onDoraSelected(value: number) {
    const {state, dispatch} = this.props;
    dispatch({ type: SET_DORA_COUNT, payload: {
        count: value,
        winner: state.multironCurrentWinner
      }});
  }

  private onUraDoraSelected(value: number) {
    //todo
  }

  private onRedFivesSelected(value: number) {
    //todo
  }

  private onFuSelected(value: number) {
    const {state, dispatch} = this.props;
    dispatch({ type: SET_FU_COUNT, payload: {
        count: value,
        winner: state.multironCurrentWinner
      }});
  }

  private canGoNext(): boolean {
    const {state} = this.props;
    if (state.currentScreen === 'yakuSelect') {
      return !!mayGoNextFromYakuSelect(state);
    }

    return true
  }


  render() {
    const {state, i18nService} = this.props;
    if (!state.currentOutcome || state.currentOutcome.selectedOutcome !== 'ron') { //todo
      return null;
    }

    // const winnerId = state.currentOutcome.winner
    const player = getWinningUsers(state)[0] //state.multironCurrentWinner?
    const playerName = player.displayName;
    const outcomeText = OutcomeTableMode.RON;
    const canGoNext = this.canGoNext();
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
    const doraValues: number[] = doraOptions(state);

    const withUraDora = false //todo support withUra
    const uraDoraCount = undefined
    const uraDoraValues = undefined;

    const withRedFives = false  //todo support withRedFives
    const redFivesCount = undefined
    const redFivesValues = undefined;

    const fuCount = state.currentOutcome.fu
    const fuValues = state.currentOutcome.possibleFu;

    //todo support yakumans

    return <SelectHandScreenView
      playerName={playerName}
      yakuGroups={yakuGroups}
      outcome={outcomeText}
      leftArrowState={leftArrowState}
      rightArrowState={rightArrowState}
      activeTab={activeTab}
      onTabClick={this.onTabClick.bind(this)}
      canGoNext={canGoNext}
      onNextClick={this.onNextClick.bind(this)}
      onBackClick={this.onBackClick.bind(this)}
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
  }
}
