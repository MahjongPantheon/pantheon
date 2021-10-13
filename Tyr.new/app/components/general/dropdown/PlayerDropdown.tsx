import * as React from "react";
import './player-dropdown.css'
import {useContext} from "react";
import {i18n} from "#/components/i18n";

type IProps = {
  playerName?: string
  wind: string
  onPlayerClick: () => void
}

export class PlayerDropdown extends React.Component<IProps> {
  render() {
    const {playerName, wind, onPlayerClick} = this.props;
    const loc = useContext(i18n);

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
              {loc._t('select player')}
            </div>
          )}
        </div>
      </div>
    );
  }
}
