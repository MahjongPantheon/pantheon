import * as React from 'react';
import './page-home.css';
import classNames from 'classnames';
import { ReactNode, useContext } from 'react';
import { i18n } from '#/components/i18n';
import RefreshIcon from '../../../img/icons/refresh.svg?svgr';
import SettingsIcon from '../../../img/icons/settings.svg?svgr';
import DonateIcon from '../../../img/donate.svg?svgr';
import PlusIcon from '../../../img/icons/plus.svg?svgr';
import LinkIcon from '../../../img/icons/link.svg?svgr';

type IButtonProps = {
  caption: string;
  isVisible: boolean;
  isActive?: boolean;
  isBordered?: boolean;
  icon?: ReactNode;
  isIconRight?: boolean;
  onClick: () => void;
};

const HomeScreenButton = React.memo(function (props: IButtonProps) {
  const { caption, isVisible, isActive, isBordered, icon, isIconRight, onClick } = props;

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={classNames('page-home__button', {
        'page-home__button--active': isActive,
        'page-home__button--bordered': isBordered,
      })}
      onClick={onClick}
    >
      <div className='page-home__button-content'>
        {icon && <div className={classNames('icon', { 'icon--right': isIconRight })}>{icon}</div>}
        {caption}
      </div>
    </div>
  );
});

type IProps = {
  eventName: string;
  canStartGame: boolean;
  hasStartedGame: boolean;
  hasPrevGame: boolean;
  canSeeOtherTables: boolean;
  hasStat: boolean;
  showDonate: boolean;
  onDonateClick: () => void;
  onSettingClick: () => void;
  onRefreshClick: () => void;
  onOtherTablesClick: () => void;
  onPrevGameClick: () => void;
  onNewGameClick: () => void;
  onCurrentGameClick: () => void;
  onStatClick: () => void;
};

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
    <div className='page-home'>
      <div className='top-panel top-panel--between'>
        <div className='svg-button svg-button--small' onClick={onRefreshClick}>
          <RefreshIcon />
        </div>
        <div className='svg-button svg-button--small' onClick={onSettingClick}>
          <SettingsIcon />
        </div>
      </div>
      <div className='page-home__title'>{eventName}</div>
      <div className='page-home__bottom'>
        {showDonate ? (
          <div className='svg-button' style={{ margin: '16px' }} onClick={onDonateClick}>
            <DonateIcon />
          </div>
        ) : null}
        <HomeScreenButton
          caption={loc._t('New game')}
          isVisible={canStartGame}
          isActive={true}
          icon={<PlusIcon />}
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
          icon={<LinkIcon />}
          isIconRight={true}
          onClick={onStatClick}
        />
      </div>
    </div>
  );
});
