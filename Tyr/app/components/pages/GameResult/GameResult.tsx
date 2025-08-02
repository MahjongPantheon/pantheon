import { SessionHistoryResult } from 'tsclients/proto/atoms.pb';

import { useContext } from 'react';
import { i18n } from '../../i18n';
import clsx from 'classnames';
import RepeatIcon from '../../../img/icons/repeat.svg?react';
import SaveIcon from '../../../img/icons/check.svg?react';
import { Player } from '../../base/Player/Player';
import { Button } from '../../base/Button/Button';
import styles from './GameResult.module.css';

type IProps = {
  showRepeatButton?: boolean;
  results?: SessionHistoryResult[];
  onCheckClick: () => void;
  onRepeatClick: () => void;
};

export const GameResult = (props: IProps) => {
  const { results, showRepeatButton, onCheckClick, onRepeatClick } = props;
  const loc = useContext(i18n);
  return (
    <div className={styles.wrapper}>
      {results && results.length > 0 && (
        <>
          <div className={styles.players}>
            {results.map((result, i) => (
              <div key={i} className={styles.playerResult}>
                <Player
                  id={result.playerId}
                  playerName={result.title}
                  lastUpdate={result.lastUpdate}
                  size='lg'
                  hasAvatar={result.hasAvatar}
                />
                <div className={styles.scoreContainer}>
                  <div className={styles.playerScore}>{result.score}</div>
                  <div
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
            {showRepeatButton && (
              <Button variant='contained' onClick={onRepeatClick} size='lg' icon={<RepeatIcon />} />
            )}
            <Button variant='contained' onClick={onCheckClick} size='lg' icon={<SaveIcon />} />
          </div>
        </>
      )}
      {results && results.length === 0 && (
        <>
          <div className={styles.noGames}>{loc._t('No games found')}</div>
          <div className={styles.buttons}>
            <Button variant='contained' onClick={onCheckClick} size='lg' icon={<SaveIcon />} />
          </div>
        </>
      )}
    </div>
  );
};
