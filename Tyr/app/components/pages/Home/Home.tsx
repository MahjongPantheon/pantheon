import { useContext } from 'react';
import { i18n } from '../../i18n';

import RefreshIcon from '../../../img/icons/refresh.svg?react';
import SettingsIcon from '../../../img/icons/settings.svg?react';
import DonateIcon from '../../../img/donate.svg?react';
import PlusIcon from '../../../img/icons/plus.svg?react';
import LinkIcon from '../../../img/icons/link.svg?react';
import WarningIcon from '../../../img/icons/warning-icon.svg?react';
import { Button } from '../../base/Button/Button';
import styles from './Home.module.css';
import clsx from 'classnames';

type IProps = {
  canAccessAdminPanel?: boolean;
  onAdminPanelClick: () => void;
  eventName: string;
  canStartGame: boolean;
  hasStartedGame: boolean;
  hasPrevGame: boolean;
  canSeeOtherTables: boolean;
  hasStat: boolean;
  showDonate: boolean;
  showPenalties: boolean;
  onDonateClick: () => void;
  onPenaltiesClick: () => void;
  onSettingClick: () => void;
  onRefreshClick: () => void;
  onOtherTablesClick: () => void;
  onPrevGameClick: () => void;
  onNewGameClick: () => void;
  onCurrentGameClick: () => void;
  onStatClick: () => void;
  newyear?: boolean;
};

export const Home = (props: IProps) => {
  const loc = useContext(i18n);
  const {
    canAccessAdminPanel = false,
    eventName,
    canStartGame,
    hasStartedGame,
    hasPrevGame,
    canSeeOtherTables,
    hasStat,
    showDonate,
    showPenalties,
    onDonateClick,
    onPenaltiesClick,
    onSettingClick,
    onRefreshClick,
    onOtherTablesClick,
    onPrevGameClick,
    onNewGameClick,
    onCurrentGameClick,
    onStatClick,
  } = props;

  return (
    <div
      className={clsx(styles.wrapper, props.newyear ? styles.newyear : null)}
      data-testid='tyr-home'
    >
      <div className={styles.topPanel}>
        <Button
          variant='light'
          size='lg'
          icon={<RefreshIcon />}
          onClick={onRefreshClick}
          testId='tyr-home-refresh'
        />
        {showDonate ? (
          <Button
            variant='light'
            size='lg'
            icon={<DonateIcon />}
            onClick={onDonateClick}
            testId='tyr-home-donate'
          />
        ) : null}
        {showPenalties ? (
          <Button
            variant='light'
            size='lg'
            icon={<WarningIcon />}
            onClick={onPenaltiesClick}
            testId='tyr-home-penalties'
          />
        ) : null}
        <Button
          variant='light'
          size='lg'
          icon={<SettingsIcon />}
          onClick={onSettingClick}
          testId='tyr-home-settings'
        />
      </div>
      <div className={styles.title} data-testid='tyr-home-event-name'>
        {eventName}
      </div>
      <div className={styles.menu}>
        {canStartGame && (
          <Button
            variant='primary'
            size='fullwidth'
            icon={<PlusIcon />}
            onClick={onNewGameClick}
            testId='tyr-home-new-game'
          >
            {loc._t('New game')}
          </Button>
        )}
        {hasStartedGame && (
          <Button
            variant='primary'
            size='fullwidth'
            onClick={onCurrentGameClick}
            testId='tyr-home-current-game'
          >
            {loc._t('Current game')}
          </Button>
        )}
        {hasPrevGame && (
          <Button
            variant='contained'
            size='fullwidth'
            onClick={onPrevGameClick}
            testId='tyr-home-previous-game'
          >
            {loc._t('Previous game')}
          </Button>
        )}
        {canSeeOtherTables && (
          <Button
            variant='contained'
            size='fullwidth'
            onClick={onOtherTablesClick}
            testId='tyr-home-other-tables'
          >
            {loc._t('Other playing tables')}
          </Button>
        )}
        {canAccessAdminPanel && (
          <Button
            variant='contained'
            size='fullwidth'
            rightIcon={<LinkIcon />}
            onClick={props.onAdminPanelClick}
            testId='tyr-home-admin-panel'
          >
            {loc._t('Go to admin panel')}
          </Button>
        )}
        {hasStat && (
          <Button
            variant='contained'
            size='fullwidth'
            rightIcon={<LinkIcon />}
            onClick={onStatClick}
            testId='tyr-home-statistics'
          >
            {loc._t('Statistics')}
          </Button>
        )}
      </div>
    </div>
  );
};
