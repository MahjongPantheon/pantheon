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
import { BottomPanelProps } from './BottomPanelProps';
import './bottom-panel.css';
import classNames from 'classnames';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import NextIcon from '../../../img/icons/arrow-right.svg?react';
import SaveIcon from '../../../img/icons/check.svg?react';
import HomeIcon from '../../../img/icons/home.svg?react';
import RefreshIcon from '../../../img/icons/refresh.svg?react';
import PlusIcon from '../../../img/icons/plus.svg?react';
import LogIcon from '../../../img/icons/log.svg?react';

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
