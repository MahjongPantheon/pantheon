import * as React from 'react';
import './players.css';
import { PlayerBase } from './PlayerBase';
import { PlayerMode } from '../../types/PlayerEnums';
import { PlayerProps } from './PlayerProps';

export const PlayerTop: React.FC<PlayerProps> = (props) => {
  return <PlayerBase {...props} mode={PlayerMode.TOP} startWithName={true} />;
};
