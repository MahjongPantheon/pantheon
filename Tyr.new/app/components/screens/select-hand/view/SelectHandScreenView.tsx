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
  leftArrowState: ArrowState
  rightArrowState: ArrowState

  activeTab: SelectHandActiveTab
  onTabClick: (tab: SelectHandActiveTab) => void

  onBackClick: () => void
  canGoNext: boolean
  onNextClick: () => void

  yakuHan: number
  doraCount: number
  doraValues: number[]
  onDoraSelected: (value: number) => void
  withUraDora?: boolean
  uraDoraCount?: number
  uraDoraValues?: number[]
  onUraDoraSelected: (value: number) => void
  withRedFives?: boolean
  redFivesCount?: number
  redFivesValues?: number[]
  onRedFivesSelected: (value: number) => void
  fuCount: number
  fuValues: number[]
  onFuSelected: (value: number) => void
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
      yakuGroups,
      outcome,
      leftArrowState,
      rightArrowState,
      activeTab,
      onTabClick,
      onBackClick,
      canGoNext,
      onNextClick,
      yakuHan,
      doraCount,
      doraValues,
      onDoraSelected,
      withUraDora,
      uraDoraCount,
      uraDoraValues,
      onUraDoraSelected,
      withRedFives,
      redFivesCount,
      redFivesValues,
      onRedFivesSelected,
      fuCount,
      fuValues,
      onFuSelected,
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
            doraValues={doraValues}
            onDoraSelected={onDoraSelected}
            withUraDora={withUraDora}
            uraDoraCount={uraDoraCount}
            uraDoraValues={uraDoraValues}
            onUraDoraSelected={onUraDoraSelected}
            withRedFives={withRedFives}
            redFivesCount={redFivesCount}
            redFivesValues={redFivesValues}
            onRedFivesSelected={onRedFivesSelected}
            fuCount={fuCount}
            fuValues={fuValues}
            onFuSelected={onFuSelected}
          />
        )}
        <div className="flex-container__bottom">
          <BottomPanel
            text={outcome}
            showBack={true}
            showNext={true}
            isNextDisabled={!canGoNext}
            onBackClick={onBackClick}
            onNextClick={onNextClick}
          />
        </div>
      </div>
    );
  }
}
