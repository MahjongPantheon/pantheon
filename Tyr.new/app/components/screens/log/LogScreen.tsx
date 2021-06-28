import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {IRoundResult, LogScreenView} from '#/components/screens/log/view/LogScreenView';
import {useCallback} from 'react';
import {GOTO_PREV_SCREEN} from '#/store/actions/interfaces';
import {roundToString} from '#/components/helpers/Utils';
import {Preloader} from '#/components/general/preloader/Preloader';
import {IRoundOverviewInfo} from '#/components/screens/log/view/RoundTypes';
import {getRoundOverviewInfo} from '#/components/screens/log/LogScreenSelectors';

export const LogScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch, i18nService} = props;

  const onBackClick = useCallback(() => {
    dispatch({ type: GOTO_PREV_SCREEN });
  }, [dispatch])

  if (state.loading.overview) {
    return <Preloader />
  }

  let players: {[index: string]: string} = {};
  let results: IRoundResult[] = [];
  let rounds: IRoundOverviewInfo[] = [];

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

      rounds.push(getRoundOverviewInfo(roundOverview, players, i18nService));
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
