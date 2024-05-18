import { i18n } from '../../i18n';
import CloseIcon from '../../../img/icons/close.svg?react';
import ShuffleIcon from '../../../img/icons/shuffle.svg?react';
import SaveIcon from '../../../img/icons/check.svg?react';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import styles from './NewGame.module.css';
import { StaticSelector } from '../../base/StaticSelector/StaticSelector';
import { Button } from '../../base/Button/Button';
import { useContext } from 'react';

type IProps = {
  east?: string;
  south?: string;
  west?: string;
  north?: string;
  canSave: boolean;
  onBackClick: () => void;
  onShuffleClick: () => void;
  onSaveClick: () => void;
  onClearClick: () => void;
  onPlayerClick: (side: string) => void;
};

export const NewGame = (props: IProps) => {
  const loc = useContext(i18n);
  const {
    east,
    south,
    west,
    north,
    canSave,
    onBackClick,
    onShuffleClick,
    onSaveClick,
    onClearClick,
    onPlayerClick,
  } = props;

  return (
    <div className={styles.wrapper}>
      <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
      <div className={styles.content}>
        <div className={styles.players}>
          <StaticSelector
            wind='東'
            placeholder={loc._t('select player')}
            playerName={east}
            onPlayerClick={() => onPlayerClick('東')}
          />
          <StaticSelector
            wind='南'
            placeholder={loc._t('select player')}
            playerName={south}
            onPlayerClick={() => onPlayerClick('南')}
          />
          <StaticSelector
            wind='西'
            placeholder={loc._t('select player')}
            playerName={west}
            onPlayerClick={() => onPlayerClick('西')}
          />
          <StaticSelector
            wind='北'
            placeholder={loc._t('select player')}
            playerName={north}
            onPlayerClick={() => onPlayerClick('北')}
          />
        </div>

        <div className={styles.buttons}>
          <Button variant='contained' size='fullwidth' icon={<CloseIcon />} onClick={onClearClick}>
            {loc._t('Clear players')}
          </Button>

          <Button
            variant='contained'
            size='fullwidth'
            icon={<ShuffleIcon />}
            onClick={onShuffleClick}
          >
            {loc._t('Shuffle players')}
          </Button>

          <Button
            variant='contained'
            disabled={!canSave}
            size='fullwidth'
            icon={<SaveIcon />}
            onClick={onSaveClick}
          >
            {loc._t('Start game')}
          </Button>
        </div>
      </div>
    </div>
  );
};
