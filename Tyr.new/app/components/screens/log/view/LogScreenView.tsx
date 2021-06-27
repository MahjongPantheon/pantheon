import * as React from "react";
import {BottomPanel} from '#/components/general/bottom-panel/BottomPanel';
import './page-log.css'
import {useCallback, useState} from 'react';
import {RoundResult} from '#/components/screens/log/view/RoundResult';
import {IRoundInfo} from '#/components/screens/log/view/RoundTypes';

export interface IRoundResult {
  scoresDelta: {[id: string]: number}
  scores: {[index: string]: number}
  round: string
}

type IProps = {
  players: {[index: string]: string}
  results: IRoundResult[]
  rounds: IRoundInfo[]
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

  return (
    <div className="flex-container page-log">
      {!results.length && (
        <div className="flex-container__content page-log__no-results">No results found</div>
      )}
      {!!results.length && (
        <div className="flex-container__content page-log__content">
          <div className="page-log__row-container">
            <div className="page-log__row">
              <div className="page-log__cell page-log__cell--first" />
              {Object.keys(players).map(key => (
                <div key={key} className="page-log__cell">{players[key]}</div>
              ))}
            </div>
          </div>

          {results.map((roundResult, i) => (
            <RoundResult
              key={i}
              players={players}
              index={i}
              scoresDelta={roundResult.scoresDelta}
              scores={roundResult.scores}
              round={roundResult.round}
              selectRound={selectRound}
            >
              {/*{selectedRoundIndex === i && <RoundInfo />}*/}
            </RoundResult>
          ))}
        </div>
      )}
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
