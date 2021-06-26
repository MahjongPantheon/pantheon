import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {IRoundPlayer, IRoundResult, LogScreenView} from '#/components/screens/log/view/LogScreenView';
import {useCallback} from 'react';
import {GOTO_PREV_SCREEN} from '#/store/actions/interfaces';
import {roundToString} from '#/components/helpers/Utils';
import {Preloader} from '#/components/general/preloader/Preloader';

export const LogScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch} = props;

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN });
  }, [dispatch])

  if (state.loading.overview) {
    return <Preloader />
  }

  let players: IRoundPlayer[] = [];
  let results: IRoundResult[] = [];

  if (!state.allRoundsOverviewErrorCode && state.allRoundsOverview && state.players) {
    players = state.players.map(x => {
      return {
        id: x.id,
        name: x.displayName,
      } as IRoundPlayer
    })



    // const roundOverview = state.allRoundsOverview;
    // const t: IRoundResult = {
    //   scoresDelta: {
    //     [players[0].id]: 0,
    //     [players[1].id]: 0,
    //     [players[2].id]: 0,
    //     [players[3].id]: 0,
    //   },
    //   scores: roundOverview.scores,
    //   wind: "東1",
    // }

    results = state.allRoundsOverview.map(roundOverview => {
      return {
        round: roundToString(roundOverview.round),
        scores: roundOverview.scores,
        scoresDelta: roundOverview.scoresDelta,
      }
    })
    console.log(results)
  }

  return (
    <LogScreenView
      players={players}
      results={results}
      onBackClick={onBackClick}
    />
  )
}
