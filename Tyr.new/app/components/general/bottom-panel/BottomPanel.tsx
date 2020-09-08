import * as React from 'react';
import {BottomPanelProps} from './BottomPanelProps';
import './bottom-panel.css';
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';
import {classNames} from '#/components/helpers/ReactUtils';

export class BottomPanel extends React.Component<BottomPanelProps> {
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
    } = this.props;

    const needRenderEmptyButton = showBack && !!text && !showNext && !showSave;

    return (
      <div className="bottom-panel">
        <div className="bottom-panel__inner">
          {showBack && (
            <div className="svg-button">
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
            <div className={classNames('svg-button', {'svg-button--disabled': isNextDisabled})}>
              <Icon type={IconType.NEXT} />
            </div>
          )}
          {showSave && (
            <div className={classNames('svg-button', {'svg-button--disabled': isSaveDisabled})}>
              <Icon type={IconType.SAVE} />
            </div>
          )}
          {showHome && (
            <div className="svg-button">
              <Icon type={IconType.HOME} />
            </div>
          )}
          {showRefresh && (
            <div className="svg-button">
              <Icon type={IconType.REFRESH} />
            </div>
          )}
          {showAdd && (
            <div className="svg-button">
              <Icon type={IconType.PLUS} />
            </div>
          )}
          {showLog && (
            <div className="svg-button">
              <Icon type={IconType.LOG} />
            </div>
          )}
        </div>
      </div>
    )
  }
}
