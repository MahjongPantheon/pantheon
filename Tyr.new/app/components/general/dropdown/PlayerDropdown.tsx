import * as React from "react";
import {Player} from '../../types/Player';
import './player-dropdown.css'

type IProps = {
  player?: Player
  wind: string
}

export class PlayerDropdown extends React.Component<IProps> {
  render() {
    const {player, wind} = this.props;

    return (
      <div className="player-dropdown">
        <div className="player-dropdown">
          {wind}
        </div>
        <div className="player-dropdown__player">
          {!!player &&  (
            <div className="player-dropdown__player-name">
              {player.displayName}
            </div>
          )}
          {!player &&  (
            <div className="player-dropdown__placeholder">
              select player
            </div>
          )}
        </div>
      </div>
    );
  }
}
