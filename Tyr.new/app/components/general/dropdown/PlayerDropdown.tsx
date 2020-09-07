import * as React from "react";
import {Player} from '../../types/Player';
import './player-dropdown.css'

type IProps = {
  playerName?: string
  wind: string
  onPlayerClick: () => void
}

export class PlayerDropdown extends React.Component<IProps> {
  render() {
    const {playerName, wind, onPlayerClick} = this.props;

    return (
      <div className="player-dropdown">
        <div className="player-dropdown">
          {wind}
        </div>
        <div className="player-dropdown__player" onClick={onPlayerClick}>
          {!!playerName &&  (
            <div className="player-dropdown__player-name">
              {playerName}
            </div>
          )}
          {!playerName &&  (
            <div className="player-dropdown__placeholder">
              select player
            </div>
          )}
        </div>
      </div>
    );
  }
}
