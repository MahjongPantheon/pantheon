import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {IRoundResult, LogScreenView} from '#/components/screens/log/view/LogScreenView';
import {useCallback, useContext} from 'react';
import {GOTO_PREV_SCREEN} from '#/store/actions/interfaces';
import {roundToString} from '#/components/helpers/Utils';
import {Preloader} from '#/components/general/preloader/Preloader';
import {IRoundOverviewInfo} from '#/components/screens/log/view/RoundTypes';
import {getRoundOverviewInfo} from '#/components/screens/log/LogScreenSelectors';
import {i18n} from "#/components/i18n";

export const LogScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch} = props;
  const loc = useContext(i18n);

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN });
  }, [dispatch])

  if (state.loading.overview) {
    return <Preloader />
  }

  let players: {[index: string]: string} = {};
  let results: IRoundResult[] = [];
  let rounds: IRoundOverviewInfo[] = [];

  let playersList = state.currentOtherTable ? state.currentOtherTablePlayers : state.players;

  if (!state.allRoundsOverviewErrorCode && state.allRoundsOverview && playersList) {
    playersList.forEach(player => {
      players[player.id.toString()] = player.displayName
    })

    state.allRoundsOverview.forEach(roundOverview => {
      results.push({
        round: roundToString(roundOverview.round),
        scores: roundOverview.scores,
        scoresDelta: roundOverview.scoresDelta,
      })

      rounds.push(getRoundOverviewInfo(roundOverview, players, loc));
    })
  }

  return (
    <LogScreenView
      players={players}
      results={results}
      onBackClick={onBackClick}
      rounds={rounds}
    />
  )
}
