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
import { ReactNode, useCallback } from 'react';
import classNames from 'classnames';
import { IRoundResult } from '#/components/screens/log/view/LogScreenView';

type RoundResultCellProps = {
  delta: number;
  score: number;
};

export const RoundResultCell: React.FC<RoundResultCellProps> = (props) => {
  const { delta, score } = props;

  return (
    <div className='page-log__cell'>
      <div
        className={classNames(
          'page-log__delta',
          { 'page-log__delta--success': delta > 0 },
          { 'page-log__delta--danger': delta < 0 }
        )}
      >
        {delta > 0 ? `+${delta}` : delta}
      </div>
      <div className='page-log__score'>{score + delta}</div>
    </div>
  );
};

type RoundResultProps = IRoundResult & {
  index: number;
  players: { [index: string]: string };
  selectRound: (index: number) => void;
  children: ReactNode;
};

export const RoundResult: React.FC<RoundResultProps> = (props) => {
  const { players, index, selectRound, round, scoresDelta, scores, children } = props;

  const onRoundClick = useCallback(() => {
    selectRound(index);
  }, [index, selectRound]);

  return (
    <div className='page-log__row-container' onClick={onRoundClick}>
      <div className='page-log__row'>
        <div className='page-log__cell page-log__cell--first'>{round}</div>
        {Object.keys(players).map((key) => (
          <RoundResultCell
            key={key}
            delta={scoresDelta.find((r) => r.playerId === parseInt(key, 10))?.score ?? 0}
            score={scores.find((r) => r.playerId === parseInt(key, 10))?.score ?? 0}
          />
        ))}
      </div>
      {children}
    </div>
  );
};
