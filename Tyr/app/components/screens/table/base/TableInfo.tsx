import * as React from 'react';
import './page-table.css';
import { TableTenbou } from '#/components/screens/table/base/TableTenbou';
import { useContext } from 'react';
import { i18n } from '#/components/i18n';
import RiichiIcon from '../../../../img/icons/riichi-small.svg?svgr';
import HonbaIcon from '../../../../img/icons/honba.svg?svgr';
import RotateCWIcon from '../../../../img/icons/rotate-cw.svg?svgr';
import RotateCCWIcon from '../../../../img/icons/rotate-ccw.svg?svgr';

export type TableInfoProps = {
  showRoundInfo?: boolean;
  showTableNumber?: boolean;
  showTimer?: boolean;
  isAutostartTimer?: boolean;
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
};

export const TableInfo = React.memo(function (props: TableInfoProps) {
  const loc = useContext(i18n);
  const {
    showRoundInfo,
    showTableNumber,
    showRotators,
    showTimer,
    isAutostartTimer,
    gamesLeft,
    round,
    honbaCount,
    riichiCount,
    currentTime,
    tableNumber,
    onTableInfoToggle,
    onRotateCcwClick,
    onRotateCwClick,
  } = props;

  if (!showRoundInfo && !showTableNumber) {
    return null;
  }

  return (
    <div className='table-info'>
      {showRotators && (
        <>
          <div className='table-info__rotator_ccw' onClick={onRotateCcwClick}>
            <RotateCWIcon />
          </div>
          <div className='table-info__rotator_cw' onClick={onRotateCwClick}>
            <RotateCCWIcon />
          </div>
        </>
      )}
      <div className='table-info__info' onClick={onTableInfoToggle}>
        {showRoundInfo && (
          <>
            {!!round && <div className='table-info__round'>{round}</div>}
            {riichiCount !== undefined && <TableTenbou icon={<RiichiIcon />} count={riichiCount} />}
            {honbaCount !== undefined && <TableTenbou icon={<HonbaIcon />} count={honbaCount} />}
            {showTimer && <div className='table-info__timer'>{currentTime}</div>}
            {gamesLeft && (
              <div className='table-info__games-left'>
                <div className='table-info__games-left-count'>
                  {loc._nt(['%1 deal left', '%1 deals left'], gamesLeft, [gamesLeft])}
                </div>
              </div>
            )}
          </>
        )}
        {showTableNumber && (
          <>
            <div className='table-info__table-caption'>{loc._t('Table #%1', [tableNumber])}</div>
            {showTimer && isAutostartTimer && (
              <>
                <hr className='table-info__autostart-separator' />
                <div className='table-info__autostart-hint'>
                  {loc._t('Time before game start:')}
                </div>
              </>
            )}
            {showTimer && <div className='table-info__timer'>{currentTime}</div>}
          </>
        )}
      </div>
    </div>
  );
});
