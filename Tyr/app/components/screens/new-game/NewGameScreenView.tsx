import * as React from 'react';
import './page-new-game.css';
import { TopPanel } from '#/components/general/top-panel/TopPanel';
import { PlayerDropdown } from '#/components/general/dropdown/PlayerDropdown';
import classNames from 'classnames';
import { i18n } from '#/components/i18n';
import CloseIcon from '../../../img/icons/close.svg?svgr';
import ShuffleIcon from '../../../img/icons/shuffle.svg?svgr';
import SaveIcon from '../../../img/icons/check.svg?svgr';

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

export const NewGameScreenView = React.memo(function (props: IProps) {
  const loc = React.useContext(i18n);
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
    <div className='page-new-game'>
      <TopPanel onBackClick={onBackClick} />
      <div className='page-new-game__inner'>
        <div className='page-new-game__players'>
          <PlayerDropdown wind='東' playerName={east} onPlayerClick={() => onPlayerClick('東')} />
          <PlayerDropdown wind='南' playerName={south} onPlayerClick={() => onPlayerClick('南')} />
          <PlayerDropdown wind='西' playerName={west} onPlayerClick={() => onPlayerClick('西')} />
          <PlayerDropdown wind='北' playerName={north} onPlayerClick={() => onPlayerClick('北')} />
          <div className='page-new-game__buttons'>
            <div className='flat-btn' onClick={onClearClick}>
              <CloseIcon />
              <label>{loc._t('Clear players')}</label>
            </div>
            <div className='flat-btn' onClick={onShuffleClick}>
              <ShuffleIcon />
              <label>{loc._t('Shuffle players')}</label>
            </div>
            <div
              className={classNames('flat-btn', { 'flat-btn--disabled': !canSave })}
              onClick={onSaveClick}
            >
              <SaveIcon />
              <label>{loc._t('Start game')}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
