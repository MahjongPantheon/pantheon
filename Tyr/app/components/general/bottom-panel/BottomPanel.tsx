import * as React from 'react';
import { BottomPanelProps } from './BottomPanelProps';
import './bottom-panel.css';
import classNames from 'classnames';
import BackIcon from '../../../img/back.svg?svgr';
import NextIcon from '../../../img/next.svg?svgr';
import SaveIcon from '../../../img/save.svg?svgr';
import HomeIcon from '../../../img/home.svg?svgr';
import RefreshIcon from '../../../img/refresh.svg?svgr';
import PlusIcon from '../../../img/plus.svg?svgr';
import LogIcon from '../../../img/log.svg?svgr';

export class BottomPanel extends React.Component<BottomPanelProps> {
  private onNextButtonClick() {
    const { isNextDisabled, onNextClick } = this.props;
    if (onNextClick && !isNextDisabled) {
      onNextClick();
    }
  }

  private onSaveButtonClick() {
    const { isSaveDisabled, onSaveClick } = this.props;
    if (onSaveClick && !isSaveDisabled) {
      onSaveClick();
    }
  }

  render() {
    const {
      text,
      showBack,
      showNext,
      isNextDisabled,
      showSave,
      isSaveDisabled,
      showHome,
      showRefresh,
      showAdd,
      showLog,
      onAddClick,
      onBackClick,
      onHomeClick,
      onLogClick,
      onRefreshClick,
    } = this.props;

    const needRenderEmptyButton = showBack && !!text && !showNext && !showSave;

    return (
      <div className='bottom-panel'>
        <div className='bottom-panel__inner'>
          {showBack && (
            <div className='svg-button' onClick={onBackClick}>
              <BackIcon />
            </div>
          )}
          {!!text && <div className='bottom-panel__text'>{text}</div>}
          {needRenderEmptyButton && <div className='svg-button' />}
          {showNext && (
            <div
              className={classNames('svg-button', { 'svg-button--disabled': isNextDisabled })}
              onClick={this.onNextButtonClick.bind(this)}
            >
              <NextIcon />
            </div>
          )}
          {showSave && (
            <div
              className={classNames('svg-button', { 'svg-button--disabled': isSaveDisabled })}
              onClick={this.onSaveButtonClick.bind(this)}
            >
              <SaveIcon />
            </div>
          )}
          {showHome && (
            <div className='svg-button' onClick={onHomeClick}>
              <HomeIcon />
            </div>
          )}
          {showRefresh && (
            <div className='svg-button' onClick={onRefreshClick}>
              <RefreshIcon />
            </div>
          )}
          {showAdd && (
            <div className='svg-button' onClick={onAddClick}>
              <PlusIcon />
            </div>
          )}
          {showLog && (
            <div className='svg-button' onClick={onLogClick}>
              <LogIcon />
            </div>
          )}
        </div>
      </div>
    );
  }
}
