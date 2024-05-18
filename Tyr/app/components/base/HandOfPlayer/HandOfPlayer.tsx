import { NumberSelect } from '../NumberSelect/NumberSelect';
import { UIEvent, useContext, useState } from 'react';
import { i18n } from '../../i18n';
import { YakuId, yakuMap } from '../../../helpers/yaku';
import styles from './HandOfPlayer.module.css';
import { Toggle } from '../Toggle/Toggle';
import { PlayerDescriptor } from '../../../helpers/interfaces';
import { Player } from '../Player/Player';
import { PopupMenu } from '../PopupMenu/PopupMenu';
import { PopupMenuItem } from '../PopupMenu/PopupMenuItem';
import clsx from 'classnames';

export type IProps = {
  playerId: number;
  yaku: YakuId[];
  selectedYaku: YakuId[];
  disabledYaku: YakuId[];
  onYakuClick: (yaku: YakuId, playerId: number) => void;
  isYakuman: boolean;
  yakuHan: number;
  doraCount: number;
  doraValues: number[];
  onDoraSelected: (value: number, playerId: number) => void;
  shouldSelectFu?: boolean;
  fuCount: number;
  fuValues: number[];
  onFuSelected: (value: number, playerId: number) => void;
  paoSelectRequired: boolean;
  pao?: number; // selected player
  paoPlayers: PlayerDescriptor[];
  onPaoSelected?: (pao: number | undefined, playerId: number) => void;
};

export const HandOfPlayer = (props: IProps) => {
  const loc = useContext(i18n);
  const [paoMenuOpen, setPaoMenuOpen] = useState(false);
  const [topShadowDisabled, setTopShadowDisabled] = useState(true);
  const [bottomShadowDisabled, setBottomShadowDisabled] = useState(false);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setTopShadowDisabled(e.currentTarget.scrollTop < 4);
    setBottomShadowDisabled(
      Math.abs(
        e.currentTarget.scrollTop - (e.currentTarget.scrollHeight - e.currentTarget.clientHeight)
      ) < 4
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={clsx(styles.beforeYaku, topShadowDisabled ? styles.noShadow : null)}></div>
      <div className={styles.yakuList} onScroll={onScroll}>
        {props.yaku.map((y, idx) => (
          <Toggle
            style={{
              flex: 1,
              whiteSpace: 'nowrap',
              marginBottom: y === YakuId.__OPENHAND ? '10px' : undefined,
            }}
            key={`yaku_${idx}`}
            disabled={props.disabledYaku.includes(y)}
            selected={props.selectedYaku.includes(y)}
            size={y === YakuId.__OPENHAND ? 'fullwidth' : 'lg'}
            onChange={() => props.onYakuClick(y, props.playerId)}
          >
            {yakuMap[y].name(loc)}
          </Toggle>
        ))}
      </div>
      <div
        className={clsx(
          styles.other,
          props.paoSelectRequired ? styles.paoShown : null,
          bottomShadowDisabled ? styles.noShadow : null
        )}
      >
        <div
          className={clsx(
            styles.paoSelectorWrapper,
            props.paoSelectRequired ? styles.paoSelectorShown : null
          )}
        >
          <div
            className={clsx(
              styles.paoSelector,
              props.paoSelectRequired ? styles.paoSelectorShown : null
            )}
          >
            <div>{loc._t('Pao')}</div>
            <div className={styles.playerSelector} onClick={() => setPaoMenuOpen(true)}>
              {props.pao && <Player {...props.paoPlayers.find((p) => p.id === props.pao)} />}
              {!props.pao && loc._t('Nobody selected')}
            </div>
          </div>
        </div>

        <div className={styles.selectors}>
          <NumberSelect
            disabled={!props.shouldSelectFu}
            style={{ flex: 1 }}
            options={
              props.shouldSelectFu
                ? props.fuValues.map((value) => ({
                    label: loc._t('%1 fu', [value]),
                    value,
                  }))
                : []
            }
            selectedIndex={
              props.shouldSelectFu
                ? props.fuValues.findIndex((v) => v === props.fuCount)
                : undefined
            }
            onChange={
              props.shouldSelectFu
                ? (index) => props.onFuSelected(props.fuValues[index], props.playerId)
                : undefined
            }
          />
          <NumberSelect
            style={{ flex: 1 }}
            options={props.doraValues.map((value) => ({
              label: loc._t('Dora %1', [value]),
              value,
            }))}
            selectedIndex={props.doraValues.findIndex((v) => v === props.doraCount)}
            onChange={(index) => props.onDoraSelected(props.doraValues[index], props.playerId)}
          />
        </div>
        <div className={styles.stats}>
          {props.isYakuman
            ? loc._t('Yakuman')
            : props.fuCount
              ? loc._t('%1 han %2 fu', [props.yakuHan + props.doraCount, props.fuCount])
              : loc._t('%1 han', [props.yakuHan + props.doraCount])}
        </div>
      </div>

      <PopupMenu isOpen={paoMenuOpen} onClose={() => setPaoMenuOpen(false)}>
        <PopupMenuItem
          label={loc._t('No pao')}
          onClick={() => props.onPaoSelected?.(undefined, props.playerId)}
        />
        {props.paoPlayers?.map((player, idx) => (
          <PopupMenuItem
            key={`ppl_${idx}`}
            label={<Player {...player} />}
            onClick={() => props.onPaoSelected?.(player.id, props.playerId)}
          />
        ))}
      </PopupMenu>
    </div>
  );
};
