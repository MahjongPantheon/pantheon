import * as React from 'react';
import {BottomPanelProps} from './BottomPanelProps';
import './bottom-panel.css';
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';
import {classNames} from '#/components/helpers/ReactUtils';

export class BottomPanel extends React.Component<BottomPanelProps> {
  private onNextButtonClick() {
    const {isNextDisabled, onNextClick} = this.props;
    if (onNextClick && !isNextDisabled) {
      onNextClick()
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
      onNextClick,
      onSaveClick,
      onRefreshClick,
    } = this.props;

    const needRenderEmptyButton = showBack && !!text && !showNext && !showSave;

    return (
      <div className="bottom-panel">
        <div className="bottom-panel__inner">
          {showBack && (
            <div className="svg-button" onClick={onBackClick}>
              <Icon type={IconType.BACK} />
            </div>
          )}
          {!!text && (
            <div className="bottom-panel__text">
              {text}
            </div>
          )}
          {needRenderEmptyButton && <div className="svg-button" />}
          {showNext && (
            <div
              className={classNames('svg-button', {'svg-button--disabled': isNextDisabled})}
              onClick={this.onNextButtonClick.bind(this)}
            >
              <Icon type={IconType.NEXT} />
            </div>
          )}
          {showSave && (
            <div
              className={classNames('svg-button', {'svg-button--disabled': isSaveDisabled})}
              onClick={onSaveClick}
            >
              <Icon type={IconType.SAVE} />
            </div>
          )}
          {showHome && (
            <div className="svg-button" onClick={onHomeClick}>
              <Icon type={IconType.HOME} />
            </div>
          )}
          {showRefresh && (
            <div className="svg-button" onClick={onRefreshClick}>
              <Icon type={IconType.REFRESH} />
            </div>
          )}
          {showAdd && (
            <div className="svg-button" onClick={onAddClick}>
              <Icon type={IconType.PLUS} />
            </div>
          )}
          {showLog && (
            <div className="svg-button" onClick={onLogClick}>
              <Icon type={IconType.LOG} />
            </div>
          )}
        </div>
      </div>
    )
  }
}
