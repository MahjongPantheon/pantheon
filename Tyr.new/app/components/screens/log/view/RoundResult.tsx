import * as React from 'react';
import {useCallback} from 'react';
import classNames from 'classnames';
import {IRoundPlayer, IRoundResult} from '#/components/screens/log/view/LogScreenView';

type RoundResultProps = IRoundResult & {
  index: number
  players: IRoundPlayer[]
  selectRound: (index: number) => void
}

export const RoundResult: React.FC<RoundResultProps> = (props) => {
  const {players, index, selectRound, round, scoresDelta, scores, children} = props;

  const onRoundClick = useCallback(() => {
    selectRound(index)
  }, [index, selectRound])

  return (
    <div  className="page-log__row-container" onClick={onRoundClick}>
      <div className="page-log__row">
        <div className="page-log__cell page-log__cell--first">{round}</div>
        {players.map((player, i) => (
          <RoundResultCell
            key={i}
            delta={scoresDelta[player.id]}
            score={scores[player.id]}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

type RoundResultCellProps = {
  delta: number
  score: number
}

export const RoundResultCell: React.FC<RoundResultCellProps> = (props) => {
  const {delta, score} = props;

  return (
    <div className="page-log__cell">
      <div className={classNames(
        'page-log__delta',
        {'page-log__delta--success': delta > 0},
        {'page-log__delta--danger': delta < 0}
      )}
      >{delta > 0 ? '+' + delta : delta}</div>
      <div className="page-log__score">{score}</div>
    </div>
  )
}
