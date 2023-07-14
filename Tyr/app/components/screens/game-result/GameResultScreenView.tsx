/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import './page-game-result.css';
import classNames from 'classnames';
import { i18n } from '../../i18n';
import { useContext } from 'react';
import { ReactComponent as RepeatIcon } from '../../../img/icons/repeat.svg';
import { ReactComponent as SaveIcon } from '../../../img/icons/check.svg';
import { SessionHistoryResult } from '../../../clients/proto/atoms.pb';
import { PlayerAvatar } from '../../general/avatar/Avatar';

type IProps = {
  showRepeatButton?: boolean;
  results?: SessionHistoryResult[];
  onCheckClick: () => void;
  onRepeatClick: () => void;
};

export const GameResultScreenView = React.memo(function (props: IProps) {
  const { results, showRepeatButton, onCheckClick, onRepeatClick } = props;
  const loc = useContext(i18n);
  return (
    <div className='page-game-result'>
      {results && results.length > 0 && (
        <>
          <div className='page-game-result__players'>
            {results.map((result, i) => (
              <div key={i} className='player-result'>
                <div className='player-result__name'>
                  <PlayerAvatar
                    size={32}
                    p={{
                      id: result.playerId,
                      title: result.title,
                      hasAvatar: result.hasAvatar,
                      lastUpdate: result.lastUpdate,
                    }}
                  />
                  {result.title}
                </div>
                <div className='player-result__score-container'>
                  <div className='player-result__score'>{result.score}</div>
                  <div
                    className={classNames(
                      'player-result__delta',
                      { 'player-result__delta--danger': result.ratingDelta < 0 },
                      { 'player-result__delta--success': result.ratingDelta > 0 }
                    )}
                  >
                    {result.ratingDelta <= 0 ? result.ratingDelta : `+${result.ratingDelta}`}
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
      {results && results.length === 0 && (
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
