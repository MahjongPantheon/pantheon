import * as React from "react";
import {classNames} from '../../ReactUtils';
import './page-home.css'
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';

type IProps = {
  canStartGame: boolean
  hasStartedGame: boolean
  hasPrevGame: boolean
  canSeeOtherTables: boolean
  hasStat: boolean
  onSettingClick: () => void
}

export const HomeScreenView = React.memo(function HomeScreenView(props: IProps) {
  const {canStartGame, hasStartedGame, hasPrevGame, canSeeOtherTables, hasStat, onSettingClick} = props;

  return (
    <div className="page-home">
      <div className="top-panel top-panel--between">
        <div className="svg-button svg-button--small">
          <Icon type={IconType.REFRESH} />
        </div>
        <div className="svg-button svg-button--small" onClick={onSettingClick}>
          <Icon type={IconType.SETTINGS} />
        </div>
      </div>
      <div className="page-home__title">Pantheon testdrive</div>
      <div className="page-home__bottom">
        {canStartGame && (
          <div className="page-home__button page-home__button--active">
            <div className="page-home__button-content">
              <div className="icon">
                <Icon type={IconType.PLUS} />
              </div>
              New game
            </div>
          </div>
        )}
        {hasStartedGame && (
          <div className="page-home__button page-home__button--active">
            <div className="page-home__button-content">Current game</div>
          </div>
        )}
        {hasPrevGame && (
          <div className={classNames('page-home__button', {'page-home__button--bordered': !canStartGame && !hasStartedGame})}>
            <div className="page-home__button-content">Previous game</div>
          </div>
        )}
        {canSeeOtherTables && (
          <div className={classNames('page-home__button', {'page-home__button--bordered': (!canStartGame && !hasStartedGame) || hasPrevGame})}>
            <div className="page-home__button-content">Other playing tables</div>
          </div>
        )}
        {hasStat && (
          <div className={classNames('page-home__button', {'page-home__button--bordered': (!canStartGame && !hasStartedGame) || hasPrevGame || canSeeOtherTables})}>
            <div className="page-home__button-content">
              <div className="icon icon--right">
                <Icon type={IconType.LINK} />
              </div>
              Statistics
            </div>
          </div>
        )}
      </div>
    </div>
  );
})
