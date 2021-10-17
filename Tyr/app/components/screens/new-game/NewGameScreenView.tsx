import * as React from "react";
import './page-new-game.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import {PlayerDropdown} from '#/components/general/dropdown/PlayerDropdown';
import {IconType} from '#/components/general/icon/IconType';
import {Icon} from '#/components/general/icon/Icon';
import classNames from 'classnames';

type IProps = {
  east?: string
  south?: string
  west?: string
  north?: string
  canSave: boolean
  onBackClick: () => void
  onShuffleClick: () => void
  onSaveClick: () => void
  onPlayerClick: (side: string) => void
}

export const NewGameScreenView = React.memo(function (props: IProps) {
  const {east, south, west, north, canSave, onBackClick, onShuffleClick, onSaveClick, onPlayerClick} = props;

  return (
    <div className="page-new-game">
      <TopPanel onBackClick={onBackClick} />
      <div className="page-new-game__inner">
        <div className="page-new-game__players">
          <PlayerDropdown wind="東" playerName={east} onPlayerClick={() => onPlayerClick('東')} />
          <PlayerDropdown wind="南" playerName={south} onPlayerClick={() => onPlayerClick('南')} />
          <PlayerDropdown wind="西" playerName={west} onPlayerClick={() => onPlayerClick('西')} />
          <PlayerDropdown wind="北" playerName={north} onPlayerClick={() => onPlayerClick('北')} />
          <div className="page-new-game__buttons">
            <div className="flat-btn flat-btn--medium" onClick={onShuffleClick}>
              <Icon type={IconType.SHUFFLE} />
            </div>
            <div
              className={classNames('flat-btn flat-btn--medium', {'flat-btn--disabled': !canSave})}
              onClick={onSaveClick}
            >
              <Icon type={IconType.SAVE} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})
