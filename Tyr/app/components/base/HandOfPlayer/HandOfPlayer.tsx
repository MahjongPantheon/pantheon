import { ActionButton } from '../ActionButton/ActionButton';
import { NumberSelect } from '../NumberSelect/NumberSelect';
import { UIEvent, useContext, useState } from 'react';
import { i18n } from '../../i18n';
import { aggregatedYakuhai, windYaku } from '../../../helpers/yakuhai';
import { YakuId, yakuMap } from '../../../helpers/yaku';
import styles from './HandOfPlayer.module.css';
import { Toggle } from '../Toggle/Toggle';
import { PlayerDescriptor } from '../../../helpers/interfaces';
import { Player } from '../Player/Player';
import { PopupMenu } from '../PopupMenu/PopupMenu';
import { PopupMenuItem } from '../PopupMenu/PopupMenuItem';
import clsx from 'classnames';
import eastTile from '../../../assets/mahjong-tiles/Ton.svg';
import southTile from '../../../assets/mahjong-tiles/Nan.svg';
import westTile from '../../../assets/mahjong-tiles/Shaa.svg';
import northTile from '../../../assets/mahjong-tiles/Pei.svg';
import redDragonTile from '../../../assets/mahjong-tiles/Chun.svg';
import greenDragonTile from '../../../assets/mahjong-tiles/Hatsu.svg';
import whiteDragonTile from '../../../assets/mahjong-tiles/Haku.svg';

const yakuhaiTiles: Partial<Record<YakuId, string>> = {
  [YakuId.EAST_SEAT_WIND]: eastTile,
  [YakuId.EAST_ROUND_WIND]: eastTile,
  [YakuId.SOUTH_SEAT_WIND]: southTile,
  [YakuId.SOUTH_ROUND_WIND]: southTile,
  [YakuId.WEST_SEAT_WIND]: westTile,
  [YakuId.WEST_ROUND_WIND]: westTile,
  [YakuId.NORTH_SEAT_WIND]: northTile,
  [YakuId.NORTH_ROUND_WIND]: northTile,
  [YakuId.RED_DRAGON]: redDragonTile,
  [YakuId.GREEN_DRAGON]: greenDragonTile,
  [YakuId.WHITE_DRAGON]: whiteDragonTile,
};

export type IProps = {
  playerId: number;
  yaku: YakuId[];
  selectedYaku: YakuId[];
  disabledYaku: YakuId[];
  doubleWindYaku?: YakuId;
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

  const yakuhaiButtons = [
    ...windYaku.flat(),
    YakuId.RED_DRAGON,
    YakuId.WHITE_DRAGON,
    YakuId.GREEN_DRAGON,
    ...aggregatedYakuhai,
  ].filter((y) => props.yaku.includes(y));
  const firstYakuhai = props.yaku.find((id) => yakuhaiButtons.includes(id));
  const isAggregatedYakuhai = yakuhaiButtons.every((y) => aggregatedYakuhai.includes(y));
  const renderYakuButton = (y: YakuId) => {
    const isYakuhai = yakuhaiButtons.includes(y);
    const label = windYaku.some((pair) => pair.includes(y))
      ? yakuMap[y].shortName(loc)
      : yakuMap[y].name(loc);
    return (
      <Toggle
        style={{
          flex: isAggregatedYakuhai && isYakuhai && y === yakuhaiButtons[0] ? '0 0 auto' : 1,
          minWidth: isYakuhai ? 0 : undefined,
          position: isYakuhai ? 'relative' : undefined,
          padding: isYakuhai ? '6px 2px' : undefined,
          paddingInline:
            isAggregatedYakuhai && isYakuhai && y === yakuhaiButtons[0] ? 10 : undefined,
          whiteSpace: 'nowrap',
          marginBottom: y === YakuId.__OPENHAND ? '10px' : undefined,
        }}
        key={y}
        disabled={props.disabledYaku.includes(y)}
        selected={props.selectedYaku.includes(y)}
        size={y === YakuId.__OPENHAND ? 'fullwidth' : 'lg'}
        onChange={() => props.onYakuClick(y, props.playerId)}
        testId={`tyr-hand-player-${props.playerId}-yaku-${y}`}
      >
        {yakuhaiTiles[y] ? (
          <span className={styles.yakuhaiTileWrapper}>
            <img
              className={styles.yakuhaiTile}
              src={yakuhaiTiles[y]}
              alt={label}
              title={label}
              draggable={false}
            />
            {props.doubleWindYaku === y && (
              <span
                className={styles.doubleWindBadge}
                data-testid={`tyr-hand-player-${props.playerId}-yaku-${y}-double-wind`}
              >
                x2
              </span>
            )}
          </span>
        ) : isAggregatedYakuhai && isYakuhai && y !== yakuhaiButtons[0] ? (
          <span aria-label={label}>x{aggregatedYakuhai.indexOf(y) + 1}</span>
        ) : (
          label
        )}
      </Toggle>
    );
  };

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setTopShadowDisabled(e.currentTarget.scrollTop < 4);
    setBottomShadowDisabled(
      Math.abs(
        e.currentTarget.scrollTop - (e.currentTarget.scrollHeight - e.currentTarget.clientHeight)
      ) < 4
    );
  };

  return (
    <div className={styles.wrapper} data-testid={`tyr-hand-player-${props.playerId}`}>
      <div className={clsx(styles.beforeYaku, topShadowDisabled ? styles.noShadow : null)}></div>
      <div className={styles.yakuList} onScroll={onScroll}>
        {props.yaku.map((y) => {
          if (!yakuhaiButtons.includes(y)) return renderYakuButton(y);
          if (y !== firstYakuhai) return null;
          return (
            <div
              className={styles.yakuhaiGroup}
              role='group'
              aria-label={loc._t('Yakuhai')}
              data-testid={`tyr-hand-player-${props.playerId}-yakuhai`}
              key='yakuhai'
            >
              <div
                className={clsx(styles.yakuhaiRow, isAggregatedYakuhai && styles.yakuhaiSegments)}
              >
                {yakuhaiButtons.map(renderYakuButton)}
              </div>
            </div>
          );
        })}
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
            <ActionButton
              className={styles.playerSelector}
              disabled={!props.paoSelectRequired}
              onClick={() => setPaoMenuOpen(true)}
              data-testid={`tyr-hand-player-${props.playerId}-pao-open`}
            >
              {props.pao && <Player {...props.paoPlayers.find((p) => p.id === props.pao)} />}
              {!props.pao && loc._t('Nobody selected')}
            </ActionButton>
          </div>
        </div>

        <div className={styles.selectors}>
          <NumberSelect
            testId={{
              arrowDown: `tyr-hand-player-${props.playerId}-fu-less`,
              dropdownSelector: `tyr-hand-player-${props.playerId}-fu-select`,
              arrowUp: `tyr-hand-player-${props.playerId}-fu-more`,
              optionPrefix: `tyr-hand-player-${props.playerId}-fu-option`,
            }}
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
            testId={{
              arrowDown: `tyr-hand-player-${props.playerId}-dora-less`,
              dropdownSelector: `tyr-hand-player-${props.playerId}-dora-select`,
              arrowUp: `tyr-hand-player-${props.playerId}-dora-more`,
              optionPrefix: `tyr-hand-player-${props.playerId}-dora-option`,
            }}
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
            ? props.yakuHan < -1
              ? `${loc._t('Yakuman')} x${props.yakuHan * -1}`
              : loc._t('Yakuman')
            : props.fuCount
              ? loc._t('%1 han %2 fu', [props.yakuHan + props.doraCount, props.fuCount])
              : loc._t('%1 han', [props.yakuHan + props.doraCount])}
        </div>
      </div>

      <PopupMenu isOpen={paoMenuOpen} onClose={() => setPaoMenuOpen(false)}>
        <PopupMenuItem
          testId={`tyr-hand-player-${props.playerId}-pao-none`}
          label={loc._t('No pao')}
          onClick={() => props.onPaoSelected?.(undefined, props.playerId)}
        />
        {props.paoPlayers?.map((player) => (
          <PopupMenuItem
            key={player.id}
            testId={`tyr-hand-player-${props.playerId}-pao-${player.id}`}
            label={<Player {...player} />}
            onClick={() => props.onPaoSelected?.(player.id, props.playerId)}
          />
        ))}
      </PopupMenu>
    </div>
  );
};
