import React, {useCallback} from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {GameResultScreenView, PlayerScore} from '#/components/screens/game-result/GameResultScreenView';
import {isLoading} from '#/store/selectors/screenConfirmationSelectors';
import {Preloader} from '#/components/general/preloader/Preloader';
import {GOTO_NEXT_SCREEN} from '#/store/actions/interfaces';

export const GameResultScreen: React.FC<IComponentProps> = props => {
  const {state, dispatch} = props;

  if (state.currentScreen !== 'lastResults' || isLoading(state) || !state.gameConfig) {
    return <Preloader />
  }

  let players: PlayerScore[] = []

  if (state.lastResults) {
    players = state.lastResults.map(player => {
      return {
        name: player.displayName,
        score: player.score,
        delta: player.ratingDelta,
      }
    })
  }

  const canStartGame = !state.gameConfig.autoSeating && !state.isUniversalWatcher && !state.currentSessionHash

  const onCheckClick = useCallback(() => {
    dispatch({ type: GOTO_NEXT_SCREEN });
  }, [dispatch])

  const onRepeatClick = useCallback(() => {

  }, [dispatch])


  return (
    <GameResultScreenView
      players={players}
      showRepeatButton={canStartGame}
      onCheckClick={onCheckClick}
      onRepeatClick={onRepeatClick}
    />
  )
}
