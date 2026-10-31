import { SessionHistoryResult } from 'tsclients/proto/atoms.pb';

import { useContext } from 'react';
import { i18n } from '../../i18n';
import clsx from 'classnames';
import RepeatIcon from '../../../img/icons/repeat.svg?react';
import SaveIcon from '../../../img/icons/check.svg?react';
import GameLogIcon from '../../../img/icons/log.svg?react';
import { Player } from '../../base/Player/Player';
import { Button } from '../../base/Button/Button';
import styles from './GameResult.module.css';

type IProps = {
  showRepeatButton?: boolean;
  results?: SessionHistoryResult[];
  onCheckClick: () => void;
  onRepeatClick: () => void;
  onLogClick?: () => void;
};

export const GameResult = (props: IProps) => {
  const { results, showRepeatButton, onCheckClick, onRepeatClick, onLogClick } = props;
  const loc = useContext(i18n);
  return (
    <div className={styles.wrapper} data-testid='tyr-game-result'>
      {results && results.length > 0 && (
        <>
          <div className={styles.players}>
            {results.map((result) => (
              <div
                key={result.playerId}
                className={styles.playerResult}
                data-testid={`tyr-game-result-player-${result.playerId}`}
              >
                <Player
                  id={result.playerId}
                  playerName={result.title}
                  lastUpdate={result.lastUpdate}
                  size='lg'
                  hasAvatar={result.hasAvatar}
                />
                <div className={styles.scoreContainer}>
                  <div
                    className={styles.playerScore}
                    data-testid={`tyr-game-result-player-${result.playerId}-score`}
                  >
                    {result.score}
                  </div>
                  <div
                    data-testid={`tyr-game-result-player-${result.playerId}-rating-change`}
                    className={clsx(
                      styles.playerRating,
                      result.ratingDelta < 0 ? styles.playerRatingDanger : null,
                      result.ratingDelta > 0 ? styles.playerRatingSuccess : null
                    )}
                  >
                    {result.ratingDelta <= 0 ? result.ratingDelta : `+${result.ratingDelta}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.buttons}>
            {onLogClick && (
              <Button
                variant='contained'
                onClick={onLogClick}
                size='lg'
                icon={<GameLogIcon />}
                testId='tyr-game-result-log'
              />
            )}
            {showRepeatButton && (
              <Button
                variant='contained'
                onClick={onRepeatClick}
                size='lg'
                icon={<RepeatIcon />}
                testId='tyr-game-result-repeat'
              />
            )}
            <Button
              variant='contained'
              onClick={onCheckClick}
              size='lg'
              icon={<SaveIcon />}
              testId='tyr-game-result-confirm'
            />
          </div>
        </>
      )}
      {results && results.length === 0 && (
        <>
          <div className={styles.noGames} data-testid='tyr-game-result-empty'>
            {loc._t('No games found')}
          </div>
          <div className={styles.buttons}>
            <Button
              variant='contained'
              onClick={onCheckClick}
              size='lg'
              icon={<SaveIcon />}
              testId='tyr-game-result-empty-confirm'
            />
          </div>
        </>
      )}
    </div>
  );
};
