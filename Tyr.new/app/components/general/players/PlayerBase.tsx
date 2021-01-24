import * as React from 'react';
import './players.css';
import {PlayerButtonMode, PlayerMode, PlayerPointsMode} from '../../types/PlayerEnums';
import {PlayerProps} from './PlayerProps';
import {classNames} from '#/components/helpers/ReactUtils';
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';

type IProps = PlayerProps & {
  mode: PlayerMode
  startWithName?: boolean
  verticalButtons?: boolean
  nameWidth?: string
}

export class PlayerBase extends React.Component<IProps> {

  renderName() {
    const {name, wind, nameWidth, inlineWind} = this.props;

    return (
      <div className="player__name-container">
        <div className="player__name" style={{width: nameWidth}}>
          {inlineWind && (
            <span className="player__inline-wind">{wind}</span>
          )}
          {name}
        </div>
      </div>
    )
  }

  private onRiichiClick() {
    const {riichiButton} = this.props;
    if (riichiButton && riichiButton.mode !== PlayerButtonMode.DISABLE) {
      riichiButton.onClick()
    }
  }

  private renderRiichiButton() {
    const {verticalButtons, riichiButton} = this.props;

    if (riichiButton !== undefined) {
      return (
        <div onClick={this.onRiichiClick.bind(this)} className={classNames(
          'player__riichi-button',
          {'player__riichi-button--rotated': verticalButtons},
          {'player__riichi-button--empty': riichiButton.mode === PlayerButtonMode.IDLE}
        )}
        >
          <Icon type={IconType.RIICHI_BIG} />
        </div>
      )
    }

    return null
  }

  private onWinClick() {
    const {winButton} = this.props;
    if (winButton && winButton.mode !== PlayerButtonMode.DISABLE) {
      winButton.onClick()
    }
  }

  private onLoseClick() {
    const {loseButton} = this.props;
    if (loseButton && loseButton.mode !== PlayerButtonMode.DISABLE) {
      loseButton.onClick()
    }
  }

  renderButtons() {
    const {startWithName, verticalButtons, winButton, loseButton, showDeadButton} = this.props;
    const hasWinButton = winButton !== undefined;
    const hasLoseButton = loseButton !== undefined;
    const oneButton = (hasWinButton && !hasLoseButton) || (hasLoseButton && !hasWinButton);

    return (
      <>
        {!startWithName && this.renderRiichiButton()}

        {(hasWinButton || hasLoseButton || showDeadButton) && (
          <div className={classNames(
            'player__button-container',
            {'player__button-container--horizontal': !verticalButtons}
          )}
          >

            {hasWinButton && winButton && (
              <div onClick={this.onWinClick.bind(this)} className={classNames(
                'player__button flat-btn',
                {'flat-btn--small': !oneButton},
                {'flat-btn--v-large': oneButton && verticalButtons},
                {'flat-btn--large': oneButton && !verticalButtons},
                {'flat-btn--disabled': winButton.mode === PlayerButtonMode.DISABLE},
                {'flat-btn--success': winButton.mode === PlayerButtonMode.PRESSED},
              )}
              >
                <Icon type={IconType.WIN} />
              </div>
            )}

            {hasLoseButton && loseButton && (
              <div onClick={this.onLoseClick.bind(this)} className={classNames(
                'player__button flat-btn',
                {'flat-btn--small': !oneButton},
                {'flat-btn--v-large': oneButton && verticalButtons},
                {'flat-btn--large': oneButton && !verticalButtons},
                {'flat-btn--disabled': loseButton.mode === PlayerButtonMode.DISABLE},
                {'flat-btn--danger': loseButton.mode === PlayerButtonMode.PRESSED},
              )}
              >
                <Icon type={IconType.LOSE} />
              </div>
            )}

            {showDeadButton && (
              <div className={classNames(
                'player__button flat-btn flat-btn--pressed ',
                {'flat-btn--v-large': verticalButtons},
                {'flat-btn--large': !verticalButtons},
              )}
              >
                <div className="flat-btn__caption">
                  dead hand
                </div>
              </div>
            )}
          </div>
        )}

        {startWithName && this.renderRiichiButton()}
      </>
    );
  }

  render() {
    const {
      wind,
      mode,
      rotated,
      startWithName,
      inlineWind,
      points,
      pointsMode,
      penaltyPoints,
      showInlineRiichi,
    } = this.props;

    return (
      <div className = {classNames(
        'player',
        {'player--top': mode === PlayerMode.TOP},
        {'player--right': mode === PlayerMode.RIGHT},
        {'player--bottom': mode === PlayerMode.BOTTOM},
        {'player--left': mode === PlayerMode.LEFT},
        {'player--rotated': rotated},
      )}
      >
        {startWithName && this.renderName()}

        {this.renderButtons()}

        {wind && !inlineWind && (
          <div className="player__wind-container">
            <div className="player__wind">
              {wind}
            </div>
          </div>
        )}

        {points !== undefined && (
          <div className="player__score-container">
            <div className={classNames(
              'player__score',
              {'player__score--success': pointsMode === PlayerPointsMode.POSITIVE},
              {'player__score--danger': pointsMode === PlayerPointsMode.NEGATIVE}
            )}
            >
              <p>
                {points}
                {showInlineRiichi && (
                  <Icon type={IconType.RIICHI_BIG} svgProps={{className: "player__inline-riichi"}} />
                )}
              </p>
              {!!penaltyPoints && (
                <div className="player__penalty">{penaltyPoints / 1000 + 'k'}</div>
              )}
            </div>
          </div>
        )}

        {!startWithName && this.renderName()}
      </div>
    )
  }
}
