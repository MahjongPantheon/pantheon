import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {IRoundResult, LogScreenView} from '#/components/screens/log/view/LogScreenView';
import {useCallback} from 'react';
import {GOTO_PREV_SCREEN} from '#/store/actions/interfaces';
import {roundToString} from '#/components/helpers/Utils';
import {Preloader} from '#/components/general/preloader/Preloader';
import {IRoundInfo} from '#/components/screens/log/view/RoundTypes';

export const LogScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch} = props;

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN });
  }, [dispatch])

  if (state.loading.overview) {
    return <Preloader />
  }

  let players: {[index: string]: string} = {};
  let results: IRoundResult[] = [];
  let rounds: IRoundInfo[] = [];

  if (!state.allRoundsOverviewErrorCode && state.allRoundsOverview && state.players) {
    state.players.forEach(player => {
      players[player.id.toString()] = player.displayName
    })

    state.allRoundsOverview.forEach(roundOverview => {
      results.push({
        round: roundToString(roundOverview.round),
        scores: roundOverview.scores,
        scoresDelta: roundOverview.scoresDelta,
      })


      rounds.push({
        outcome: roundOverview.outcome,
        riichiOnTable: roundOverview.riichi,
        honbaOnTable: roundOverview.honba,
        // riichiPlayers: riichiPlayers,
        // penaltyFor: '',
        // loser: '',
        // winner: roundOverview.winner.map(id => players[id]),
        // paoPlayers: [],
        // han: [],
        // fu: [],
        // dora: [],
      } as any)
    })
  }

  console.log(results)

  return (
    <LogScreenView
      players={players}
      results={results}
      onBackClick={onBackClick}
      rounds={rounds}
    />
  )
}
