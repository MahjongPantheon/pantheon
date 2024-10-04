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
    <div className={clsx(styles.wrapper, props.newyear ? styles.newyear : null)}>
      <div className={styles.topPanel}>
        <Button variant='light' size='lg' icon={<RefreshIcon />} onClick={onRefreshClick} />
        {showDonate ? (
          <Button variant='light' size='lg' icon={<DonateIcon />} onClick={onDonateClick} />
        ) : null}
        {showPenalties ? (
          <Button variant='light' size='lg' icon={<WarningIcon />} onClick={onPenaltiesClick} />
        ) : null}
        <Button variant='light' size='lg' icon={<SettingsIcon />} onClick={onSettingClick} />
      </div>
      <div className={styles.title}>{eventName}</div>
      <div className={styles.menu}>
        {canStartGame && (
          <Button variant='primary' size='fullwidth' icon={<PlusIcon />} onClick={onNewGameClick}>
            {loc._t('New game')}
          </Button>
        )}
        {hasStartedGame && (
          <Button variant='primary' size='fullwidth' onClick={onCurrentGameClick}>
            {loc._t('Current game')}
          </Button>
        )}
        {hasPrevGame && (
          <Button variant='contained' size='fullwidth' onClick={onPrevGameClick}>
            {loc._t('Previous game')}
          </Button>
        )}
        {canSeeOtherTables && (
          <Button variant='contained' size='fullwidth' onClick={onOtherTablesClick}>
            {loc._t('Other playing tables')}
          </Button>
        )}
        {hasStat && (
          <Button
            variant='contained'
            size='fullwidth'
            rightIcon={<LinkIcon />}
            onClick={onStatClick}
          >
            {loc._t('Statistics')}
          </Button>
        )}
      </div>
    </div>
  );
};
