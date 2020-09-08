import * as React from 'react';
import './players.css';
import {PlayerBase} from './PlayerBase';
import {PlayerMode} from '../../types/PlayerEnums';
import {PlayerProps} from './PlayerProps';
import {PlayerDimensionsWrapper} from './PlayerDimensionsWrapper';

export class PlayerRight extends React.Component<PlayerProps> {
  render() {
    return (
      <PlayerDimensionsWrapper>
        <PlayerBase
          {...this.props}
          mode={PlayerMode.RIGHT}
          rotated={true}
          verticalButtons={true}
        />
      </PlayerDimensionsWrapper>
    );
  }
}
