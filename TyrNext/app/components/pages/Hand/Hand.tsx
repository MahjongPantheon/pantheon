import { HandOfPlayer, IProps as HandOfPlayerProps } from '../../base/HandOfPlayer/HandOfPlayer';
import { TabbedView } from '../../base/TabbedView/TabbedView';
import { Player } from '../../base/Player/Player';
import { BottomPanel } from '../../base/BottomPanel/BottomPanel';
import { Button } from '../../base/Button/Button';

import BackIcon from '../../../img/icons/arrow-left.svg?react';
import ForwardIcon from '../../../img/icons/arrow-right.svg?react';
import styles from './Hand.module.css';
import { PlayerDescriptor } from '../../../helpers/interfaces';

export type IProps = {
  hands: Array<PlayerDescriptor & HandOfPlayerProps>;

  bottomPanelText: string;
  onBackClick: () => void;
  canGoNext: boolean;
  onNextClick: () => void;

  onPlayerChange?: (id: number) => void;
};

export const Hand = ({
  hands,
  bottomPanelText,
  canGoNext,
  onNextClick,
  onBackClick,
  onPlayerChange,
}: IProps) => {
  return (
    <div className={styles.wrapper}>
      <TabbedView
        onTabChange={(index) => onPlayerChange?.(hands[index].id!)}
        tabs={hands.map((hand) => ({
          title: (
            <Player
              id={hand.id}
              playerName={hand.playerName}
              lastUpdate={hand.lastUpdate}
              hasAvatar={hand.hasAvatar}
              size='md'
            />
          ),
          content: <HandOfPlayer {...hand} />,
        }))}
      />
      <BottomPanel>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
        <div className={styles.outcomeTitle}>{bottomPanelText}</div>
        <Button
          variant='light'
          icon={<ForwardIcon />}
          size='lg'
          onClick={onNextClick}
          disabled={!canGoNext}
        />
      </BottomPanel>
    </div>
  );
};
