import * as React from 'react';
import { BottomPanel } from '#/components/general/bottom-panel/BottomPanel';
import './page-log.css';
import { useCallback, useContext, useState } from 'react';
import { RoundResult } from '#/components/screens/log/view/RoundResult';
import { IRoundOverviewInfo } from '#/components/screens/log/view/RoundTypes';
import { RoundInfo } from '#/components/screens/log/view/RoundInfo';
import { i18n } from '#/components/i18n';
import { IntermediateResultOfSession } from '#/clients/atoms.pb';

export interface IRoundResult {
  scoresDelta: IntermediateResultOfSession[];
  scores: IntermediateResultOfSession[];
  round: string;
}

type IProps = {
  players: { [index: string]: string };
  results: IRoundResult[];
  rounds: IRoundOverviewInfo[];
  onBackClick: () => void;
};

export const LogScreenView: React.FC<IProps> = (props) => {
  const loc = useContext(i18n);
  const { players, results, rounds, onBackClick } = props;
  const [selectedRoundIndex, setRoundIndex] = useState<number | undefined>(undefined);

  const selectRound = useCallback(
    (index: number) => {
      if (selectedRoundIndex === index) {
        setRoundIndex(undefined);
      } else {
        setRoundIndex(index);
      }
    },
    [selectedRoundIndex, setRoundIndex]
  );

  return (
    <div className='flex-container page-log'>
      {!results.length && (
        <div className='flex-container__content page-log__no-results'>
          {loc._t('No results found')}
        </div>
      )}
      {!!results.length && (
        <>
          <div className='flex-container__top page-log__names'>
            <div className='page-log__row'>
              <div className='page-log__cell page-log__cell--first' />
              {Object.keys(players).map((key) => (
                <div key={key} className='page-log__cell'>
                  {players[key]}
                </div>
              ))}
            </div>
          </div>

          <div className='flex-container__content page-log__rounds'>
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
                {selectedRoundIndex === i && <RoundInfo {...rounds[i]} />}
              </RoundResult>
            ))}
          </div>
        </>
      )}
      <div className='flex-container__bottom'>
        <BottomPanel text={loc._t('Game log')} showBack={true} onBackClick={onBackClick} />
      </div>
    </div>
  );
};
