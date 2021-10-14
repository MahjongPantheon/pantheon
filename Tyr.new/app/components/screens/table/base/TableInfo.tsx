import * as React from 'react';
import './page-table.css';
import {IconType} from '#/components/general/icon/IconType';
import {TableTenbou} from '#/components/screens/table/base/TableTenbou';
import {Icon} from "#/components/general/icon/Icon";
import {useContext} from "react";
import {i18n} from "#/components/i18n";

export type TableInfoProps = {
  showRoundInfo?: boolean;
  showTableNumber?: boolean;
  showTimer?: boolean;
  gamesLeft?: number;
  round?: string;
  honbaCount?: number;
  riichiCount?: number;
  currentTime?: string;
  tableNumber?: number;
  showRotators?: boolean;
  onRotateCwClick?: () => void;
  onRotateCcwClick?: () => void;
  onTableInfoToggle?: () => void;
}

export const TableInfo = React.memo(function (props: TableInfoProps) {
  const loc = useContext(i18n);
  const {
    showRoundInfo,
    showTableNumber,
    showRotators,
    showTimer,
    gamesLeft,
    round,
    honbaCount,
    riichiCount,
    currentTime,
    tableNumber,
    onTableInfoToggle,
    onRotateCcwClick,
    onRotateCwClick
  } = props;

  if (!showRoundInfo && !showTableNumber) {
    return null
  }

  return (<div className="table-info">
    {showRotators && <>
      <div className="table-info__rotator_ccw" onClick={onRotateCcwClick}><Icon type={IconType.ROTATE_CCW} /></div>
      <div className="table-info__rotator_cw" onClick={onRotateCwClick}><Icon type={IconType.ROTATE_CW} /></div>
    </>}
    <div className="table-info__info" onClick={onTableInfoToggle}>
      {showRoundInfo && (
        <>
          {!!round && (
            <div className="table-info__round">
              {round}
            </div>
          )}
          {riichiCount !== undefined && (
            <TableTenbou iconType={IconType.RIICHI_SMALL} count={riichiCount}/>
          )}
          {honbaCount !== undefined && (
            <TableTenbou iconType={IconType.HONBA} count={honbaCount}/>
          )}
          {showTimer && (
            <div className="table-info__timer">
              {currentTime}
            </div>
          )}
          {gamesLeft && (
            <div className="table-info__games-left">
              <div className="table-info__games-left-count">
                {loc._nt(['%1 deal left', '%1 deals left'], gamesLeft, [gamesLeft])}
              </div>
            </div>
          )}
        </>
      )}
      {showTableNumber && (
        <>
          <div className="table-info__table-caption">
            {loc._t('Table #%1', [tableNumber])}
          </div>
        </>
      )}
    </div>
  </div>);
})
