import { IProps as PlayerProps, PlayerPlace } from '../../base/PlayerPlace/PlayerPlace';
import { useContext, useState } from 'react';
import { FourSidedScreen } from '../../base/FourSidedScreen/FourSidedScreen';
import { BottomPanel } from '../../base/BottomPanel/BottomPanel';
import { Button } from '../../base/Button/Button';

import HomeIcon from '../../../img/icons/home.svg?react';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import RefreshIcon from '../../../img/icons/refresh.svg?react';
import AddNewIcon from '../../../img/icons/plus.svg?react';
import GameLogIcon from '../../../img/icons/log.svg?react';
import { PopupMenu } from '../../base/PopupMenu/PopupMenu';
import { PopupMenuItem } from '../../base/PopupMenu/PopupMenuItem';
import { i18n } from '../../i18n';
import { TableStatus } from '../../base/TableStatus/TableStatus';
import styles from './TablePrimaryView.module.css';
import { TableStatus as TableStatusProps } from '../../../helpers/interfaces';
import { EndingPolicy } from 'tsclients/proto/atoms.pb';

export type IProps = {
  toimen: PlayerProps;
  kamicha: PlayerProps;
  shimocha: PlayerProps;
  self: PlayerProps;
  tableStatus: Omit<TableStatusProps, 'width' | 'height'>;

  onGoHome?: () => void;
  onGoBack?: () => void;
  onRefresh: () => void;
  onAddNewGame?: (outcome: 'ron' | 'tsumo' | 'draw' | 'abort' | 'chombo' | 'nagashi') => void;
  onGotoGameLog?: () => void;
  topRowUpsideDown?: boolean;

  rulesetConfig: {
    withNagashiMangan?: boolean;
    withAbortives?: boolean;
    endingPolicy?: EndingPolicy;
  };
};

export const TablePrimaryView = (props: IProps) => {
  const loc = useContext(i18n);
  const [centerDims, setCenterDims] = useState({ width: 0, height: 0 });
  const [newGameOpen, setNewGameOpen] = useState(false);

  const { toimen, kamicha, self, shimocha } = props;

  return (
    <div className={styles.wrapper} data-testid='tyr-table'>
      <div className={styles.mainArea}>
        <FourSidedScreen
          sideUp={
            <PlayerPlace
              upsideDown={props.topRowUpsideDown}
              {...toimen}
              testIdPrefix='tyr-table-player-toimen'
            />
          }
          sideLeft={<PlayerPlace {...kamicha} testIdPrefix='tyr-table-player-kamicha' />}
          sideDown={<PlayerPlace {...self} testIdPrefix='tyr-table-player-self' />}
          sideRight={<PlayerPlace {...shimocha} testIdPrefix='tyr-table-player-shimocha' />}
          center={
            <TableStatus
              {...centerDims}
              {...props.tableStatus}
              endingPolicy={props.rulesetConfig.endingPolicy}
            />
          }
          onDimensionChange={setCenterDims}
        />
        {!!props.onAddNewGame && (
          <PopupMenu isOpen={newGameOpen} onClose={() => setNewGameOpen(false)}>
            <PopupMenuItem
              onClick={() => props.onAddNewGame?.('ron')}
              label={loc._t('Ron')}
              testId='tyr-table-outcome-ron'
            />
            <PopupMenuItem
              onClick={() => props.onAddNewGame?.('tsumo')}
              label={loc._t('Tsumo')}
              testId='tyr-table-outcome-tsumo'
            />
            <PopupMenuItem
              onClick={() => props.onAddNewGame?.('draw')}
              label={loc._t('Exhaustive draw')}
              testId='tyr-table-outcome-draw'
            />
            {props.rulesetConfig.withAbortives && (
              <PopupMenuItem
                onClick={() => props.onAddNewGame?.('abort')}
                label={loc._t('Abortive draw')}
                testId='tyr-table-outcome-abort'
              />
            )}
            <PopupMenuItem
              onClick={() => props.onAddNewGame?.('chombo')}
              label={loc._t('Chombo')}
              testId='tyr-table-outcome-chombo'
            />
            {props.rulesetConfig.withNagashiMangan && (
              <PopupMenuItem
                onClick={() => props.onAddNewGame?.('nagashi')}
                label={loc._t('Nagashi mangan')}
                testId='tyr-table-outcome-nagashi'
              />
            )}
          </PopupMenu>
        )}
      </div>
      <BottomPanel>
        {!!props.onGoHome && (
          <Button
            variant='light'
            icon={<HomeIcon />}
            size='lg'
            onClick={props.onGoHome}
            testId='tyr-table-home'
          />
        )}
        {!!props.onGoBack && (
          <Button
            variant='light'
            icon={<BackIcon />}
            size='lg'
            onClick={props.onGoBack}
            testId='tyr-table-back'
          />
        )}
        <Button
          variant='light'
          icon={<RefreshIcon />}
          size='lg'
          onClick={props.onRefresh}
          testId='tyr-table-refresh'
        />
        {!!props.onAddNewGame && (
          <Button
            variant='light'
            icon={<AddNewIcon />}
            size='lg'
            onClick={() => setNewGameOpen(!newGameOpen)}
            testId='tyr-table-add-round'
          />
        )}
        {!!props.onGotoGameLog && (
          <Button
            variant='light'
            icon={<GameLogIcon />}
            size='lg'
            onClick={props.onGotoGameLog}
            testId='tyr-table-game-log'
          />
        )}
      </BottomPanel>
    </div>
  );
};
