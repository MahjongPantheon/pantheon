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
import { AppState } from '../../primitives/appstate';
import { RiichiApiService } from '../../services/riichiApi';
import { LUser } from '../../interfaces/local';
import { rand } from '../../helpers/rand';
import { toNumber, map, uniq } from 'lodash';

const defaultPlayer: LUser = {
  displayName: '--- ? ---',
  id: -1,
  tenhouId: null,
  ident: null,
  alias: null
};

@Component({
  selector: 'screen-new-game',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class NewGameScreen {
  @Input() state: AppState;
  @Input() api: RiichiApiService;
  public _loading: boolean = false;

  // These are indexes in _players array
  toimen: number = 0;
  shimocha: number = 0;
  kamicha: number = 0;
  self: number = 0; // Self is always considered east!

  players: LUser[] = [defaultPlayer];
  ngOnInit() {
    this._loading = true;

    this.api.getAllPlayers()
      .then((players) => {
        this._loading = false;

        this.players = [defaultPlayer].concat(
          players.sort((a, b) => {
            if (a == b) {
              return 0;
            }
            return (a.displayName < b.displayName ? -1 : 1);
          })
        );
      });
  }

  playersValid(): boolean {
    let playerIndices = [this.self, this.shimocha, this.toimen, this.kamicha];

    // we had to convert ids to the int
    // to be able properly validate selected players
    playerIndices = map(playerIndices, (id) => toNumber(id));

    // all players should be initialized
    // player with index=0 is not initialized player
    if (playerIndices.indexOf(0) != -1) {
      return false;
    }

    return uniq(playerIndices).length == 4;
  }

  /**
   * randomize seating
   */
  randomize() {
    let randomized = rand([
      this.toimen, this.kamicha,
      this.self, this.shimocha
    ]);

    this.toimen = randomized[0];
    this.kamicha = randomized[1];
    this.self = randomized[2];
    this.shimocha = randomized[3];
  }

  startGame() {
    if (!this.playersValid()) {
      return;
    }

    this._loading = true;
    this.api.startGame([
      this.players[this.self].id,
      this.players[this.shimocha].id,
      this.players[this.toimen].id,
      this.players[this.kamicha].id
    ]).then(() => {
      this.state._reset();
      this.state.updateCurrentGames();
    });
  }
}

