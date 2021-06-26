import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {IRoundPlayer, IRoundResult, LogScreenView} from '#/components/screens/log/view/LogScreenView';
import {useCallback} from 'react';
import {GOTO_PREV_SCREEN} from '#/store/actions/interfaces';

export const LogScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch} = props;

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN })
  }, [dispatch])

  let players: IRoundPlayer[] = [];
  let results: IRoundResult[] = [];

  if (!state.lastRoundOverviewErrorCode) {
    if (state.players) {
      players = state.players.map(x => {
        return {
          id: x.id,
          name: x.displayName,
        } as IRoundPlayer
      })
    }
  }

  return (
    <LogScreenView
      players={players}
      results={results}
      onBackClick={onBackClick}
    />
  )
}
