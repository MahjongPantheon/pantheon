import * as React from "react";
import './players.css'
import {PlayerBase} from './PlayerBase';
import {PlayerMode} from '../../types/PlayerEnums';
import {PlayerProps} from './PlayerProps';
import {PlayerDimensionsWrapper} from './PlayerDimensionsWrapper';

export const PlayerLeft: React.FC<PlayerProps> = (props) => {
  return (
    <PlayerDimensionsWrapper>
      <PlayerBase
        {...props}
        mode={PlayerMode.LEFT}
        rotated={true}
        startWithName={true}
        verticalButtons={true}
      />
    </PlayerDimensionsWrapper>
  );
}
