import * as React from 'react';
import './page-game-result.css';
import classNames from 'classnames';
import { i18n } from '#/components/i18n';
import { useContext } from 'react';
import RepeatIcon from '../../../img/repeat.svg?svgr';
import SaveIcon from '../../../img/save.svg?svgr';

type IProps = {
  showRepeatButton?: boolean;
  players: PlayerScore[];
  onCheckClick: () => void;
  onRepeatClick: () => void;
};

export type PlayerScore = {
  name: string;
  score: number;
  delta: number;
};

export const GameResultScreenView = React.memo(function (props: IProps) {
  const { players, showRepeatButton, onCheckClick, onRepeatClick } = props;
  const loc = useContext(i18n);

  return (
    <div className='page-game-result'>
      {players.length > 0 && (
        <>
          <div className='page-game-result__players'>
            {players.map((player, i) => (
              <div key={i} className='player-result'>
                <div className='player-result__name'>{player.name}</div>
                <div className='player-result__score-container'>
                  <div className='player-result__score'>{player.score}</div>
                  <div
                    className={classNames(
                      'player-result__delta',
                      { 'player-result__delta--danger': player.delta < 0 },
                      { 'player-result__delta--success': player.delta > 0 }
                    )}
                  >
                    {player.delta <= 0 ? player.delta : '+' + player.delta}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='page-game-result__buttons'>
            {showRepeatButton && (
              <>
                <div className='flat-btn flat-btn--medium' onClick={onRepeatClick}>
                  <RepeatIcon />
                </div>
                <div className='flat-btn flat-btn--medium' onClick={onCheckClick}>
                  <SaveIcon />
                </div>
              </>
            )}
            {!showRepeatButton && (
              <div className='flat-btn flat-btn--large' onClick={onCheckClick}>
                <SaveIcon />
              </div>
            )}
          </div>
        </>
      )}
      {players.length === 0 && (
        <>
          <div className='page-game-result__no-games'>{loc._t('No games found')}</div>

          <div className='page-game-result__buttons'>
            <div className='flat-btn flat-btn--large' onClick={onCheckClick}>
              <SaveIcon />
            </div>
          </div>
        </>
      )}
    </div>
  );
});
