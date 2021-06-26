import * as React from "react";
import classNames from 'classnames';
import {BottomPanel} from '#/components/general/bottom-panel/BottomPanel';
import './page-log.css'
import {RoundInfo} from '#/components/screens/log/view/RoundInfo';
import {useCallback, useState} from 'react';

export interface IRoundResult {
  delta: number[]
  result: number[]
  wind: string
}

export interface IRoundPlayer {
  id: number
  name: string
}

type IProps = {
  players: IRoundPlayer[]
  results: IRoundResult[]
  // rounds: IRound[]
  onBackClick: () => void
}

export const LogScreenView: React.FC<IProps> = (props) => {
  const {players, results, onBackClick} = props;
  const [selectedRoundIndex, setRoundIndex] = useState<number | undefined>(undefined);

  const selectRound = useCallback((index: number) => {
    if (selectedRoundIndex === index) {
      setRoundIndex(undefined);
    } else {
      setRoundIndex(index);
    }
  }, [selectedRoundIndex, setRoundIndex])

  if (results.length) {
    return (
      <div className="flex-container page-log">
        No results found
      </div>
    )
  }

  return (
    <div className="flex-container page-log">
      <div className="flex-container__content page-log__content">
        <div className="page-log__row-container">
          <div className="page-log__row">
            <div className="page-log__cell page-log__cell--first" />
            {players.map(player => (
              <div key={player.id} className="page-log__cell">{player.name}</div>
            ))}
          </div>
        </div>

        {results.map((roundResult, i) => (
          <div key={i} className="page-log__row-container" onClick={() => selectRound(i)}>
            <div className="page-log__row">
              <div className="page-log__cell page-log__cell--first">{roundResult.wind}</div>
              {roundResult.delta.map((playerDelta, j) => (
                <div key={j} className="page-log__cell">
                  <div className={classNames(
                    'page-log__delta',
                    {'page-log__delta--success': playerDelta > 0},
                    {'page-log__delta--danger': playerDelta < 0}
                  )}
                  >{playerDelta > 0 ? '+' + playerDelta : playerDelta}</div>
                  <div className="page-log__score">{roundResult.result[j]}</div>
                </div>
              ))}
            </div>
            {selectedRoundIndex === i &&
              <RoundInfo />
            }
          </div>
        ))}

      </div>
      <div className="flex-container__bottom">
        <BottomPanel
          text="Log"
          showBack={true}
          onBackClick={onBackClick}
        />
      </div>
    </div>
  );
}


/*export class LogScreenView1 extends React.Component<IProps> {
private onRoundClick(round: any) {
   if (this.state.selectedRound !== round) {
     this.setState({
       selectedRound: round
     });
   } else {
     this.setState({
       selectedRound: undefined
     });
   }
 }

  private getPlayerName(id: number): string {
    return this.props.players.find(player => player.id === id)!.name;
  }

  private getNames(ids: number[]): string {
    return ids.map(winner => this.getPlayerName(winner)).join(', ');
  }

  private getHandAmount(hand: any): string {
    if (hand.isYakuman) {
      return 'yakuman';
    }

    let str = `${hand.han} han`;

    if (hand.han && hand.han < 5) {
      str += ` ${hand.fu} fu`;
    }
    return str;
  }
}*/
