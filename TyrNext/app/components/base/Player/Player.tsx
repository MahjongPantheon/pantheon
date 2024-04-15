import { Avatar } from '../Avatar/Avatar';
import styles from './Player.module.css';
import clsx from 'classnames';
import { YakitoriIndicator } from '../YakitoriIndicator/YakitoriIndicator';
import { PlayerDescriptor } from '../../../helpers/interfaces';
import { useContext } from 'react';
import { i18n } from '../../i18n';

export type IProps = PlayerDescriptor & {
  title?: string;
  showYakitori?: boolean;
  currentWind?: 'e' | 's' | 'w' | 'n';
  size?: 'sm' | 'md' | 'lg';
  upsideDown?: boolean;
  showChomboSign?: boolean;
};

export const Player = ({
  id,
  title,
  playerName,
  hasAvatar,
  showYakitori,
  currentWind,
  lastUpdate,
  showChomboSign,
  size,
  upsideDown,
}: IProps) => {
  size ??= 'md';
  playerName ??= title;

  const loc = useContext(i18n);

  const sizes = { sm: 16, md: 24, lg: 32 };
  const classes = [
    size === 'sm' ? styles.small : null,
    size === 'md' ? styles.medium : null,
    size === 'lg' ? styles.large : null,
    upsideDown ? styles.upsideDown : null,
  ];

  const windClasses = [
    currentWind === 'e' ? styles.east : null,
    currentWind === 's' ? styles.south : null,
    currentWind === 'w' ? styles.west : null,
    currentWind === 'n' ? styles.north : null,
  ];

  const wind = {
    e: '東',
    s: '南',
    w: '西',
    n: '北',
  };

  return (
    <div className={clsx(styles.wrapper, ...classes)}>
      {showChomboSign && <div className={styles.chombo}>{loc._t('Chombo')}</div>}
      <div className={styles.infoWrapper}>
        <Avatar
          playerName={playerName ?? ''}
          id={id ?? 0}
          lastUpdate={lastUpdate ?? ''}
          hasAvatar={hasAvatar}
          size={sizes[size]}
        />
        <div className={styles.playerName}>{playerName}</div>
        {currentWind && (
          <div className={clsx(styles.wind, ...windClasses)}>{wind[currentWind]}</div>
        )}
        {showYakitori && <YakitoriIndicator size={size} />}
      </div>
    </div>
  );
};
