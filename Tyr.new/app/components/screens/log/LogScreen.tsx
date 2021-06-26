import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {IRoundPlayer, IRoundResult, LogScreenView} from '#/components/screens/log/view/LogScreenView';
import {useCallback} from 'react';
import {GOTO_PREV_SCREEN} from '#/store/actions/interfaces';

export const LogScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch} = props;

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN });
  }, [dispatch])

  let players: IRoundPlayer[] = [];
  let results: IRoundResult[] = [];

  if (!state.lastRoundOverviewErrorCode && state.lastRoundOverview) {
    // if (state.players) {
    //   players = state.players.map(x => {
    //     return {
    //       id: x.id,
    //       name: x.displayName,
    //     } as IRoundPlayer
    //   })
    // }
    //
    // const roundOverview = state.lastRoundOverview;
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

    // results = [t]
  }

  return (
    <LogScreenView
      players={players}
      results={results}
      onBackClick={onBackClick}
    />
  )
}
