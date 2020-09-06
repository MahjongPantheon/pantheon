import * as React from "react";
import {classNames} from '../../ReactUtils';
import './page-home.css'

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
          <svg>
            <use xlinkHref="#refresh"></use>
          </svg>
        </div>
        <div className="svg-button svg-button--small" onClick={onSettingClick}>
          <svg>
            <use xlinkHref="#settings"></use>
          </svg>
        </div>
      </div>
      <div className="page-home__title">Pantheon testdrive</div>
      <div className="page-home__bottom">
        {canStartGame && (
          <div className="page-home__button page-home__button--active">
            <div className="page-home__button-content">
              <svg className="icon">
                <use xlinkHref="#plus"></use>
              </svg>
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
              <svg className="icon icon--right">
                <use xlinkHref="#link"></use>
              </svg>
              Statistics
            </div>
          </div>
        )}
      </div>
    </div>
  );
})
