import * as React from "react";
import './players.css'
import {PlayerBase} from './PlayerBase';
import {PlayerMode} from '../../types/PlayerEnums';
import {PlayerProps} from './PlayerProps';

export class PlayerBottom extends React.Component<PlayerProps> {
  render() {
    return (
      <PlayerBase
        {...this.props}
        mode={PlayerMode.BOTTOM}
      />
    );
  }
}
