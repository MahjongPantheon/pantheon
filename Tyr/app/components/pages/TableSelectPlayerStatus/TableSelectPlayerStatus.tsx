import { IProps as PlayerProps, PlayerPlace } from '../../base/PlayerPlace/PlayerPlace';
import { FourSidedScreen } from '../../base/FourSidedScreen/FourSidedScreen';
import { BottomPanel } from '../../base/BottomPanel/BottomPanel';
import { Button } from '../../base/Button/Button';

import BackIcon from '../../../img/icons/arrow-left.svg?react';
import ForwardIcon from '../../../img/icons/arrow-right.svg?react';
import styles from './TableSelectPlayerStatus.module.css';

export type IProps = {
  toimen: PlayerProps;
  kamicha: PlayerProps;
  shimocha: PlayerProps;
  self: PlayerProps;

  bottomPanelText?: string;

  onGoBack: () => void;
  onGoForward: () => void;
  mayGoForward?: boolean;
  topRowUpsideDown?: boolean;
};

export const TableSelectPlayerStatus = (props: IProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.mainArea}>
        <FourSidedScreen
          sideUp={
            <PlayerPlace
              upsideDown={props.topRowUpsideDown}
              {...props.toimen}
              points={undefined}
              showYakitori={false}
            />
          }
          sideLeft={
            <PlayerPlace
              {...props.kamicha}
              points={undefined}
              showYakitori={false}
              buttons={{ ...props.kamicha.buttons, rotateActionIcons: 'ccw' }}
            />
          }
          sideDown={<PlayerPlace {...props.self} points={undefined} showYakitori={false} />}
          sideRight={
            <PlayerPlace
              {...props.shimocha}
              points={undefined}
              showYakitori={false}
              buttons={{ ...props.shimocha.buttons, rotateActionIcons: 'cw' }}
            />
          }
          center={<></>}
        />
      </div>
      <BottomPanel>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={props.onGoBack} />
        <div className={styles.outcomeTitle}>{props.bottomPanelText}</div>
        <Button
          variant='light'
          icon={<ForwardIcon />}
          disabled={!props.mayGoForward}
          size='lg'
          onClick={props.onGoForward}
        />
      </BottomPanel>
    </div>
  );
};
