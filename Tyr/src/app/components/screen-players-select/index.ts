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

import { Component, Input } from '@angular/core';
import { Outcome, Player } from '../../interfaces/common';
import { AppState } from '../../primitives/appstate';

@Component({
  selector: 'screen-players-select',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class PlayersSelectScreen {
  @Input() state: AppState;
  @Input() paoSelectionMode: boolean;
  outcome() {
    return this.state.getOutcome();
  }

  self: Player;
  shimocha: Player;
  toimen: Player;
  kamicha: Player;

  seatSelf: string;
  seatShimocha: string;
  seatToimen: string;
  seatKamicha: string;

  ngOnInit() {
    let players: Player[] = [].concat(this.state.getPlayers());
    let seating = ['東', '南', '西', '北'];

    const current = this.state.getCurrentPlayerId();

    for (let i = 0; i < 4; i++) {
      if (players[0].id === current) {
        break;
      }

      players = players.slice(1).concat(players[0]);
      seating = seating.slice(1).concat(seating[0]);
    }

    this.self = players[0];
    this.shimocha = players[1];
    this.toimen = players[2];
    this.kamicha = players[3];

    this.seatSelf = seating[0];
    this.seatShimocha = seating[1];
    this.seatToimen = seating[2];
    this.seatKamicha = seating[3];
  }

  handle([player, what]: [Player, 'win' | 'lose' | 'riichi' | 'dead' | 'pao' | 'nagashi']) {
    switch (what) {
      case 'win':
        this.state.toggleWinner(player);
        break;
      case 'lose':
        this.state.toggleLoser(player);
        break;
      case 'riichi':
        this.state.toggleRiichi(player);
        break;
      case 'dead':
        this.state.toggleDeadhand(player);
        break;
      case 'pao':
        this.state.togglePao(player);
        break;
      case 'nagashi':
        this.state.toggleNagashi(player);
        break;
    }
  }
}

