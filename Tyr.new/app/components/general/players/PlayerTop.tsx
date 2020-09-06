import * as React from "react";
import './players.less'
import {PlayerBase} from './PlayerBase';
import {PlayerMode} from '../../types/PlayerEnums';
import {PlayerProps} from './PlayerProps';

export class PlayerTop extends React.Component<PlayerProps> {
  render() {
    return (
      <PlayerBase
        {...this.props}
        mode={PlayerMode.TOP}
        startWithName={true}
      />
    );
  }
}
