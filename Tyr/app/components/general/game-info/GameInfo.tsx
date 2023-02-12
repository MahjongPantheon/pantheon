import React, { PropsWithChildren } from 'react';
import { Round } from '#/components/general/game-info/partials/Round';
import { Honba, Riichi } from '#/components/general/game-info/partials/Tenbou';
import { Flex } from '#/components/general/flex/Flex';
import { TableNumber } from '#/components/general/game-info/partials/TableNumber';
import './game-info.css';
import { RotateControls } from '#/components/general/game-info/partials/RotateControls';

export type GameInfoProps = PropsWithChildren<{
  onClick?: () => void;
}>;

export const GameInfo = (({ onClick, children }: GameInfoProps) => (
  <Flex
    direction='column'
    justify='center'
    alignItems='center'
    maxWidth
    maxHeight
    onClick={onClick}
  >
    {children}
  </Flex>
)) as React.FC<GameInfoProps> & Partials;

interface Partials {
  Round: typeof Round;
  TableNumber: typeof TableNumber;
  Riichi: typeof Riichi;
  Honba: typeof Honba;
  RotateControls: typeof RotateControls;
}

GameInfo.Round = Round;
GameInfo.TableNumber = TableNumber;
GameInfo.Riichi = Riichi;
GameInfo.Honba = Honba;
GameInfo.RotateControls = RotateControls;
