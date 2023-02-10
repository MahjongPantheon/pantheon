import * as React from 'react';
import './page-set-hand.css';
import { SelectYakuPanel } from './SelectYakuPanel';
import { SelectTotalPanel } from './SelectTotalPanel';
import { Tab } from '#/components/general/tab/Tab';
import { BottomPanel } from '#/components/general/bottom-panel/BottomPanel';
import {
  ArrowState,
  SelectHandActiveTab,
  YakuGroup,
} from '#/components/screens/select-hand/YakuTypes';
import classNames from 'classnames';
import ArrowLeftIcon from '../../../../img/icons/chevron-left.svg?svgr';
import ArrowRightIcon from '../../../../img/icons/chevron-right.svg?svgr';

type IProps = {
  playerName: string;
  yakuGroups: YakuGroup[];
  bottomPanelText: string;
  leftArrowState: ArrowState;
  leftArrowClick: () => void;
  rightArrowState: ArrowState;
  rightArrowClick: () => void;

  activeTab: SelectHandActiveTab;
  onTabClick: (tab: SelectHandActiveTab) => void;

  onBackClick: () => void;
  canGoNext: boolean;
  onNextClick: () => void;

  isYakuman: boolean;
  yakuHan: number;
  doraCount: number;
  doraValues: number[];
  onDoraSelected: (value: number) => void;
  withUraDora?: boolean;
  uraDoraCount?: number;
  uraDoraValues?: number[];
  onUraDoraSelected: (value: number) => void;
  withRedFives?: boolean;
  redFivesCount?: number;
  redFivesValues?: number[];
  onRedFivesSelected: (value: number) => void;
  fuCount: number;
  fuValues: number[];
  onFuSelected: (value: number) => void;
};

const getTabItems = (
  activeTab: SelectHandActiveTab,
  onTabClick: (tab: SelectHandActiveTab) => void
) => [
  {
    caption: SelectHandActiveTab.YAKU,
    isActive: activeTab === SelectHandActiveTab.YAKU,
    onClick: () => onTabClick(SelectHandActiveTab.YAKU),
  },
  {
    caption: SelectHandActiveTab.TOTAL,
    isActive: activeTab === SelectHandActiveTab.TOTAL,
    onClick: () => onTabClick(SelectHandActiveTab.TOTAL),
  },
];

export class SelectHandScreenView extends React.Component<IProps> {
  private onLeftArrowClick() {
    const { leftArrowState, leftArrowClick } = this.props;
    if (leftArrowState !== ArrowState.DISABLED) {
      leftArrowClick();
    }
  }

  private onRightArrowClick() {
    const { rightArrowState, rightArrowClick } = this.props;
    if (rightArrowState !== ArrowState.DISABLED) {
      rightArrowClick();
    }
  }

  render() {
    const {
      playerName,
      yakuGroups,
      bottomPanelText,
      leftArrowState,
      rightArrowState,
      activeTab,
      onTabClick,
      onBackClick,
      canGoNext,
      onNextClick,
      isYakuman,
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
      <div className='flex-container page-select-hand'>
        <div className='page-select-hand__top-panel top-panel top-panel--between'>
          <div className='page-select-hand__top-panel-arrow'>
            {leftArrowState !== ArrowState.UNAVAILABLE && (
              <div
                className={classNames('svg-button svg-button--xsmall', {
                  'svg-button--disabled': leftArrowState === ArrowState.DISABLED,
                })}
                onClick={this.onLeftArrowClick.bind(this)}
              >
                <ArrowLeftIcon />
              </div>
            )}
          </div>
          <div className='page-select-hand__player-name'>{playerName}</div>
          <div className='page-select-hand__top-panel-arrow'>
            {rightArrowState !== ArrowState.UNAVAILABLE && (
              <div
                className={classNames('svg-button svg-button--xsmall', {
                  'svg-button--disabled': rightArrowState === ArrowState.DISABLED,
                })}
                onClick={this.onRightArrowClick.bind(this)}
              >
                <ArrowRightIcon />
              </div>
            )}
          </div>
        </div>
        <Tab items={getTabItems(activeTab, onTabClick)} />
        {activeTab === SelectHandActiveTab.YAKU && <SelectYakuPanel yakuGroups={yakuGroups} />}
        {activeTab === SelectHandActiveTab.TOTAL && (
          <SelectTotalPanel
            isYakuman={isYakuman}
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
        <div className='flex-container__bottom'>
          <BottomPanel
            text={bottomPanelText}
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
