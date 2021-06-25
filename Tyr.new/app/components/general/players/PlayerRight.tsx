import * as React from 'react';
import './players.css';
import {PlayerBase} from './PlayerBase';
import {PlayerMode} from '../../types/PlayerEnums';
import {PlayerProps} from './PlayerProps';
import {PlayerDimensionsWrapper} from './PlayerDimensionsWrapper';

export const PlayerRight: React.FC<PlayerProps> = (props) => {
  return (
    <PlayerDimensionsWrapper>
      <PlayerBase
        {...props}
        mode={PlayerMode.RIGHT}
        rotated={true}
        verticalButtons={true}
      />
    </PlayerDimensionsWrapper>
  );
}
