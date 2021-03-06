import * as React from 'react';
import './page-table.css';
import {IconType} from '#/components/general/icon/IconType';
import {TableTenbou} from '#/components/screens/table/base/TableTenbou';

export type TableInfoProps = {
  showRoundInfo?: boolean
  showTableNumber?: boolean
  showTimer?: boolean
  gamesLeft?: number
  round?: string
  honbaCount?: number
  riichiCount?: number
  currentTime?: string
  tableNumber?: number
  onTableInfoToggle?: () => void
}

export const TableInfo = React.memo(function (props: TableInfoProps) {
  const {
    showRoundInfo,
    showTableNumber,
    showTimer,
    gamesLeft,
    round,
    honbaCount,
    riichiCount,
    currentTime,
    tableNumber,
    onTableInfoToggle,
  } = props;

  if (!showRoundInfo && !showTableNumber) {
    return null
  }

  return (
    <div className="table-info" onClick={onTableInfoToggle}>
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
                {gamesLeft}
              </div>
              <div className="table-info__games-left-caption">
                max deals left
              </div>
            </div>
          )}
        </>
      )}
      {showTableNumber && (
        <>
          <div className="table-info__table-caption">
            Table
          </div>
          <div className="table-info__table-number">
            #{tableNumber}
          </div>
        </>
      )}
    </div>
  );
})
