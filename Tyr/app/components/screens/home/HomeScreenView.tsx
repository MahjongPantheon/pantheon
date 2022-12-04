import * as React from "react";
import './page-home.css'
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';
import classNames from 'classnames';
import {useContext} from "react";
import {i18n} from "#/components/i18n";

type IProps = {
  eventName: string
  canStartGame: boolean
  hasStartedGame: boolean
  hasPrevGame: boolean
  canSeeOtherTables: boolean
  hasStat: boolean
  showDonate: boolean
  onDonateClick: () => void
  onSettingClick: () => void
  onRefreshClick: () => void
  onOtherTablesClick: () => void
  onPrevGameClick: () => void
  onNewGameClick: () => void
  onCurrentGameClick: () => void
  onStatClick: () => void
}

export const HomeScreenView = React.memo(function HomeScreenView(props: IProps) {
  const loc = useContext(i18n);
  const {
    eventName,
    canStartGame,
    hasStartedGame,
    hasPrevGame,
    canSeeOtherTables,
    hasStat,
    showDonate,
    onDonateClick,
    onSettingClick,
    onRefreshClick,
    onOtherTablesClick,
    onPrevGameClick,
    onNewGameClick,
    onCurrentGameClick,
    onStatClick,
  } = props;

  return (
    <div className="page-home">
      <div className="top-panel top-panel--between">
        <div className="svg-button svg-button--small" onClick={onRefreshClick}>
          <Icon type={IconType.REFRESH} />
        </div>
        <div className="svg-button svg-button--small" onClick={onSettingClick}>
          <Icon type={IconType.SETTINGS} />
        </div>
      </div>
      <div className="page-home__title">{eventName}</div>
      <div className="page-home__bottom">
        {showDonate ? <div className="svg-button" style={{ margin: '16px' }} onClick={onDonateClick}>
          <Icon type={IconType.DONATE} svgProps={{ color: '#ddd' }} />
        </div> : null}
        <HomeScreenButton
          caption={loc._t('New game')}
          isVisible={canStartGame}
          isActive={true}
          iconType={IconType.PLUS}
          onClick={onNewGameClick}
        />
        <HomeScreenButton
          caption={loc._t('Current game')}
          isVisible={hasStartedGame}
          isActive={true}
          onClick={onCurrentGameClick}
        />
        <HomeScreenButton
          caption={loc._t('Previous game')}
          isVisible={hasPrevGame}
          isBordered={!canStartGame && !hasStartedGame}
          onClick={onPrevGameClick}
        />
        <HomeScreenButton
          caption={loc._t('Other playing tables')}
          isVisible={canSeeOtherTables}
          isBordered={(!canStartGame && !hasStartedGame) || hasPrevGame}
          onClick={onOtherTablesClick}
        />
        <HomeScreenButton
          caption={loc._t('Statistics')}
          isVisible={hasStat}
          isBordered={(!canStartGame && !hasStartedGame) || hasPrevGame || canSeeOtherTables}
          iconType={IconType.LINK}
          isIconRight={true}
          onClick={onStatClick}
        />
      </div>
    </div>
  );
})

type IButtonProps = {
  caption: string
  isVisible: boolean
  isActive?: boolean
  isBordered?: boolean
  iconType?: IconType
  isIconRight?: boolean
  onClick: () => void
}

const HomeScreenButton = React.memo(function (props: IButtonProps) {
  const {caption, isVisible, isActive, isBordered, iconType, isIconRight, onClick} = props;

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={classNames(
        'page-home__button',
        {
          'page-home__button--active': isActive,
          'page-home__button--bordered': isBordered,
        })}
      onClick={onClick}
    >
      <div className="page-home__button-content">
        {iconType && (
          <div className={classNames('icon', {'icon--right': isIconRight})}>
            <Icon type={iconType} />
          </div>
        )}
        {caption}
      </div>
    </div>
  )
})
