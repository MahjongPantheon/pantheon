import React, { useCallback, useContext, useRef } from 'react';
import { GameInfo } from '#/components/general/game-info/GameInfo';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { Overview } from '#/components/screens/table/screens/overview/Overview';
import { PlayerData } from '#/components/screens/table/screens/types/PlayerData';
import { i18n } from '#/components/i18n';
import { Outcome } from '#/interfaces/common';

interface CurrentGameScreenProps {
  topPlayer: PlayerData;
  leftPlayer: PlayerData;
  rightPlayer: PlayerData;
  bottomPlayer: PlayerData;

  topRotated: boolean;

  showTableNumber?: boolean;
  tableNumber?: number;

  round: string;
  riichiCount: number;
  honbaCount: number;

  diffById?: number;
  onScoreClick: (id: number) => void;

  onHomeClick: () => void;
  onAddClick: () => void;
  onRefreshClick: () => void;
  onLogClick: () => void;

  onCenterClick: () => void;

  isOutcomeMenuVisible: boolean;
  isAbortiveDrawAvailable: boolean;
  isNagashiAvailable: boolean;
  onOutcomeMenuClose: () => void;
  onOutcomeSelect: (outcome: Outcome) => void;

  // showTimer?: boolean
  timer?: string;
  dealsLeft?: number;
}

export const CurrentGameScreenView: React.FC<CurrentGameScreenProps> = (props) => {
  const {
    round,
    riichiCount,
    honbaCount,
    showTableNumber = false,
    tableNumber,
    onHomeClick,
    onAddClick,
    onRefreshClick,
    onLogClick,
    onCenterClick,
    isOutcomeMenuVisible,
    isAbortiveDrawAvailable,
    isNagashiAvailable,
    onOutcomeMenuClose,
    onOutcomeSelect,
    timer,
    dealsLeft,
    ...restProps
  } = props;

  const loc = useContext(i18n);

  return (
    <Overview
      {...restProps}
      gameInfo={
        showTableNumber && tableNumber !== undefined ? (
          <GameInfo onClick={onCenterClick}>
            <GameInfo.TableNumber>{tableNumber}</GameInfo.TableNumber>
          </GameInfo>
        ) : (
          <GameInfo onClick={onCenterClick}>
            <GameInfo.Round>{round}</GameInfo.Round>
            <GameInfo.Honba value={honbaCount} />
            <GameInfo.Riichi value={riichiCount} />
            {dealsLeft !== undefined ? (
              <GameInfo.DealsLeft>{dealsLeft}</GameInfo.DealsLeft>
            ) : (
              timer !== undefined && <GameInfo.Timer>{timer}</GameInfo.Timer>
            )}
          </GameInfo>
        )
      }
      bottomBar={
        <>
          <Toolbar>
            <Toolbar.Home disabled={isOutcomeMenuVisible} onClick={onHomeClick} />
            <Toolbar.Refresh disabled={isOutcomeMenuVisible} onClick={onRefreshClick} />
            <Toolbar.Plus onClick={isOutcomeMenuVisible ? onOutcomeMenuClose : onAddClick} />
            <Toolbar.Log disabled={isOutcomeMenuVisible} onClick={onLogClick} />

            {isOutcomeMenuVisible && (
              <Toolbar.Menu onClose={onOutcomeMenuClose}>
                <Toolbar.MenuItem onClick={() => onOutcomeSelect('ron')}>
                  {loc._t('Ron')}
                </Toolbar.MenuItem>
                <Toolbar.MenuItem onClick={() => onOutcomeSelect('tsumo')}>
                  {loc._t('Tsumo')}
                </Toolbar.MenuItem>
                <Toolbar.MenuItem onClick={() => onOutcomeSelect('draw')}>
                  {loc._t('Exhaustive draw')}
                </Toolbar.MenuItem>
                <Toolbar.MenuItem onClick={() => onOutcomeSelect('chombo')}>
                  {loc._t('Chombo')}
                </Toolbar.MenuItem>
                {isAbortiveDrawAvailable && (
                  <Toolbar.MenuItem onClick={() => onOutcomeSelect('abort')}>
                    {loc._t('Abortive draw')}
                  </Toolbar.MenuItem>
                )}
                {isNagashiAvailable && (
                  <Toolbar.MenuItem onClick={() => onOutcomeSelect('nagashi')}>
                    {loc._t('Nagashi mangan')}
                  </Toolbar.MenuItem>
                )}
              </Toolbar.Menu>
            )}
          </Toolbar>
        </>
      }
    />
  );
};
