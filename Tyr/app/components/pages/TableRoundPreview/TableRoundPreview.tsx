import { FourSidedScreen } from '../../base/FourSidedScreen/FourSidedScreen';
import { PlayerPlace, IProps as PlayerProps } from '../../base/PlayerPlace/PlayerPlace';
import { ResultArrows } from '../../base/ResultArrows/ResultArrows';
import { ResultArrowsProps } from '../../base/ResultArrows/ResultArrowsProps';
import { useState } from 'react';
import { Button } from '../../base/Button/Button';
import { BottomPanel } from '../../base/BottomPanel/BottomPanel';

import BackIcon from '../../../img/icons/arrow-left.svg?react';
import CheckIcon from '../../../img/icons/check.svg?react';
import styles from './TableRoundPreview.module.css';

export type IProps = {
  toimen: PlayerProps;
  kamicha: PlayerProps;
  shimocha: PlayerProps;
  self: PlayerProps;
  results: Omit<ResultArrowsProps, 'width' | 'height'>;
  onSubmit: () => void;
  onClickBack: () => void;
  topRowUpsideDown?: boolean;
  bottomPanelText?: string;
};

export const TableRoundPreview = (props: IProps) => {
  const [centerDims, setCenterDims] = useState({ width: 0, height: 0 });

  return (
    <div className={styles.wrapper}>
      <div className={styles.table}>
        <FourSidedScreen
          sideUp={<PlayerPlace upsideDown={props.topRowUpsideDown} {...props.toimen} />}
          sideLeft={<PlayerPlace {...props.kamicha} />}
          sideDown={<PlayerPlace {...props.self} />}
          sideRight={<PlayerPlace {...props.shimocha} />}
          center={<ResultArrows {...centerDims} arrows={props.results.arrows} />}
          onDimensionChange={setCenterDims}
        />
      </div>
      <BottomPanel>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={props.onClickBack} />
        <div className={styles.outcomeTitle}>{props.bottomPanelText}</div>
        <Button variant='light' icon={<CheckIcon />} size='lg' onClick={props.onSubmit} />
      </BottomPanel>
    </div>
  );
};
