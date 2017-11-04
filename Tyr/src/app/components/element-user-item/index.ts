/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Player } from '../../interfaces/common';
import { AppState } from '../../primitives/appstate';
import { intersection } from 'lodash';

@Component({
  selector: 'user-item',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})

export class UserItemComponent {
  @Input() state: AppState;
  @Input() userData: Player;
  @Input() seat: string;
  @Input() paoSelectionMode: boolean;

  @Output() onEvent = new EventEmitter<[Player, 'win' | 'lose' | 'riichi' | 'dead' | 'pao']>();

  // helpers
  showWinButton = () => -1 !== ['ron', 'multiron', 'tsumo', 'draw']
    .indexOf(this.state.getOutcome()) && !this.paoSelectionMode;

  showPaoButton = () => {
    if (!this.paoSelectionMode) {
      return false;
    }

    switch (this.state.getOutcome()) {
      case 'ron':
      case 'tsumo':
        // no pao for current winner or loser
        return this.state.getWinningUsers().indexOf(this.userData) === -1 &&
          this.state.getLosingUsers().indexOf(this.userData) === -1;
      case 'multiron':
        // no pao for loser and winner with yakuman
        if (this.state.getLosingUsers().indexOf(this.userData) !== -1) {
          return false;
        }
        for (let win of this.state.getWins()) {
          if (intersection(win.yaku, this.state.getGameConfig('yakuWithPao')).length !== 0) {
            return false;
          }
        }
        return true;
    }
  };

  showLoseButton = () => -1 !== ['ron', 'multiron', 'chombo']
    .indexOf(this.state.getOutcome()) && !this.paoSelectionMode;

  showRiichiButton = () => -1 !== ['ron', 'multiron', 'tsumo', 'abort', 'draw']
    .indexOf(this.state.getOutcome()) && !this.paoSelectionMode;

  showDeadButton = () => -1 !== ['draw']
    .indexOf(this.state.getOutcome()) && !this.paoSelectionMode;

  winPressed = () => -1 !== this.state.getWinningUsers()
    .indexOf(this.userData);

  losePressed = () => -1 !== this.state.getLosingUsers()
    .indexOf(this.userData);

  paoPressed = () => -1 !== this.state.getPaoUsers()
    .indexOf(this.userData);

  riichiPressed = () => -1 !== this.state.getRiichiUsers()
    .indexOf(this.userData);

  deadPressed = () => -1 !== this.state.getDeadhandUsers()
    .indexOf(this.userData);

  winDisabled = () => {
    if (this.state.getOutcome() === 'draw') {
      return -1 !== this.state.getDeadhandUsers().indexOf(this.userData)
    }

    if (this.state.getOutcome() === 'multiron') {
      return -1 !== this.state.getLosingUsers().indexOf(this.userData)
    }

    // for ron/tsumo winner is only one
    return (
      this.state.getWinningUsers().length > 0
      && -1 === this.state.getWinningUsers().indexOf(this.userData)
    ) || -1 !== this.state.getLosingUsers().indexOf(this.userData); // and it should not be current loser
  };

  // for ron/multiron/chombo - loser is only one
  loseDisabled = () => {
    return (
      this.state.getLosingUsers().length > 0
      && -1 === this.state.getLosingUsers().indexOf(this.userData)
    ) || -1 !== this.state.getWinningUsers().indexOf(this.userData); // and it should not be current winner
  };

  // riichi & dead hand can't be disabled

  // event handlers
  winClick = () => this.winDisabled() ? null : this.onEvent.emit([this.userData, 'win']);
  loseClick = () => this.loseDisabled() ? null : this.onEvent.emit([this.userData, 'lose']);
  riichiClick = () => this.onEvent.emit([this.userData, 'riichi']);
  deadClick = () => this.onEvent.emit([this.userData, 'dead']);
  paoClick = () => this.onEvent.emit([this.userData, 'pao']);
}

