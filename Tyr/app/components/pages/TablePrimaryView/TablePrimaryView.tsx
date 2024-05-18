import { IProps as PlayerProps, PlayerPlace } from '../../base/PlayerPlace/PlayerPlace';
import { useContext, useEffect, useState } from 'react';
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
  };
};

export const TablePrimaryView = (props: IProps) => {
  const loc = useContext(i18n);
  const [centerDims, setCenterDims] = useState({ width: 0, height: 0 });
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [componentsReady, setComponentsReady] = useState(false);

  const [toimen, setToimen] = useState(props.toimen);
  const [kamicha, setKamicha] = useState(props.kamicha);
  const [self, setSelf] = useState(props.self);
  const [shimocha, setShimocha] = useState(props.shimocha);

  // This weird magic is for nicer animations during player side switch on other table
  // We keep old props until the screen is faded out to avoid content blinking
  useEffect(() => {
    setComponentsReady(false);
    const timeout = setTimeout(() => {
      setToimen(props.toimen);
      setKamicha(props.kamicha);
      setSelf(props.self);
      setShimocha(props.shimocha);
      setTimeout(() => {
        setComponentsReady(true);
      }, 0);
    }, 100);
    return () => clearTimeout(timeout);
  }, [props.toimen.id, props.kamicha.id, props.shimocha.id, props.self.id]);

  useEffect(() => {
    setToimen(props.toimen);
    setKamicha(props.kamicha);
    setSelf(props.self);
    setShimocha(props.shimocha);
  }, [props.self.points, props.shimocha.points, props.kamicha.points, props.toimen.points]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.mainArea}>
        <FourSidedScreen
          sideUp={<PlayerPlace upsideDown={props.topRowUpsideDown} {...toimen} />}
          sideLeft={<PlayerPlace {...kamicha} />}
          sideDown={<PlayerPlace {...self} />}
          sideRight={<PlayerPlace {...shimocha} />}
          center={<TableStatus {...centerDims} {...props.tableStatus} />}
          onDimensionChange={setCenterDims}
          ready={componentsReady}
        />
        {!!props.onAddNewGame && (
          <PopupMenu isOpen={newGameOpen} onClose={() => setNewGameOpen(false)}>
            <PopupMenuItem onClick={() => props.onAddNewGame?.('ron')} label={loc._t('Ron')} />
            <PopupMenuItem onClick={() => props.onAddNewGame?.('tsumo')} label={loc._t('Tsumo')} />
            <PopupMenuItem
              onClick={() => props.onAddNewGame?.('draw')}
              label={loc._t('Exhaustive draw')}
            />
            {props.rulesetConfig.withAbortives && (
              <PopupMenuItem
                onClick={() => props.onAddNewGame?.('abort')}
                label={loc._t('Abortive draw')}
              />
            )}
            <PopupMenuItem
              onClick={() => props.onAddNewGame?.('chombo')}
              label={loc._t('Chombo')}
            />
            {props.rulesetConfig.withNagashiMangan && (
              <PopupMenuItem
                onClick={() => props.onAddNewGame?.('nagashi')}
                label={loc._t('Nagashi mangan')}
              />
            )}
          </PopupMenu>
        )}
      </div>
      <BottomPanel>
        {!!props.onGoHome && (
          <Button variant='light' icon={<HomeIcon />} size='lg' onClick={props.onGoHome} />
        )}
        {!!props.onGoBack && (
          <Button variant='light' icon={<BackIcon />} size='lg' onClick={props.onGoBack} />
        )}
        <Button variant='light' icon={<RefreshIcon />} size='lg' onClick={props.onRefresh} />
        {!!props.onAddNewGame && (
          <Button
            variant='light'
            icon={<AddNewIcon />}
            size='lg'
            onClick={() => setNewGameOpen(!newGameOpen)}
          />
        )}
        {!!props.onGotoGameLog && (
          <Button variant='light' icon={<GameLogIcon />} size='lg' onClick={props.onGotoGameLog} />
        )}
      </BottomPanel>
    </div>
  );
};
