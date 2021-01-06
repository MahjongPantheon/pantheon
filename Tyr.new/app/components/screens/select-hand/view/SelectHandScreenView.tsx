import * as React from 'react';
import {OutcomeTableMode} from '../../../types/OutcomeTypes';
import './page-set-hand.css';
import {SelectYakuPanel} from './SelectYakuPanel';
import {SelectTotalPanel} from './SelectTotalPanel';
import {Tab} from '#/components/general/tab/Tab';
import {BottomPanel} from '#/components/general/bottom-panel/BottomPanel';
import {ArrowState, SelectHandActiveTab, YakuGroup} from '#/components/screens/select-hand/YakuTypes';
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';

type IProps = {
  playerName: string
  yakuGroups: YakuGroup[]
  outcome: OutcomeTableMode
  canGoNext: boolean
  leftArrowState: ArrowState
  rightArrowState: ArrowState
  activeTab: SelectHandActiveTab
  onTabClick: (tab: SelectHandActiveTab) => void

  doraValues: number[]
  uraDoraValues: number[]
  redFivesValues: number[]
  fuValues: number[]
  yakuHan: number,
  doraCount: number,
  uraDoraCount: number,
  withRedFives: boolean,
  redFivesCount?: number,
  fuCount: number,
}

const getTabItems = (activeTab: SelectHandActiveTab, onTabClick: (tab: SelectHandActiveTab) => void) => [
  {
    caption: SelectHandActiveTab.YAKU,
    isActive: activeTab === SelectHandActiveTab.YAKU,
    onClick: () => onTabClick(SelectHandActiveTab.YAKU)
  },
  {
    caption: SelectHandActiveTab.TOTAL,
    isActive: activeTab === SelectHandActiveTab.TOTAL,
    onClick: () => onTabClick(SelectHandActiveTab.TOTAL)
  },
];

export class SelectHandScreenView extends React.Component<IProps> {
  render() {
    const {
      playerName,
      leftArrowState,
      rightArrowState,
      activeTab,
      onTabClick,
      yakuGroups,
      outcome,
      canGoNext,
      doraValues,
      uraDoraValues,
      redFivesValues,
      fuValues,
      yakuHan,
      doraCount,
      uraDoraCount,
      withRedFives,
      redFivesCount,
      fuCount,
    } = this.props;

    return (
      <div className="flex-container page-select-hand">
        <div className="page-select-hand__top-panel top-panel top-panel--between">
          <div className="page-select-hand__top-panel-arrow">
            {leftArrowState !== ArrowState.UNAVAILABLE && (
              <div className="svg-button svg-button--xsmall">
                <Icon type={IconType.ARROW_LEFT} />
              </div>
            )}
          </div>
          <div className="page-select-hand__player-name">{playerName}</div>
          <div className="page-select-hand__top-panel-arrow">
            {rightArrowState !== ArrowState.UNAVAILABLE && (
              <div className="svg-button svg-button--xsmall">
                <Icon type={IconType.ARROW_RIGHT} />
              </div>
            )}
          </div>
        </div>
        <Tab items={getTabItems(activeTab, onTabClick)}/>
        {activeTab === SelectHandActiveTab.YAKU && (
          <SelectYakuPanel yakuGroups={yakuGroups} />
        )}
        {activeTab === SelectHandActiveTab.TOTAL && (
          <SelectTotalPanel
            yakuHan={yakuHan}
            doraCount={doraCount}
            uraDoraCount={uraDoraCount}
            fuCount={fuCount}
            redFivesCount={redFivesCount}
            withRedFives={withRedFives}
            doraValues={doraValues}
            uraDoraValues={uraDoraValues}
            redFivesValues={redFivesValues}
            fuValues={fuValues}
          />
        )}
        <div className="flex-container__bottom">
          <BottomPanel
            text={outcome}
            showBack={true}
            showNext={true}
            isNextDisabled={!canGoNext}
          />
        </div>
      </div>
    );
  }
}
