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
import { toNumber, map, uniq, clone, find, remove } from 'lodash';

const defaultId = -1;

const defaultPlayer: LUser = {
  displayName: '--- ? ---',
  id: defaultId,
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
  toimen: number = defaultId;
  shimocha: number = defaultId;
  kamicha: number = defaultId;
  self: number = defaultId; // Self is always considered east!

  players: LUser[] = [defaultPlayer];
  availablePlayers: LUser[] = [];

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

        this.availablePlayers = map(this.players, clone);
      });
  }

  playersValid(): boolean {
    let playerIds = this._selectedPlayerIds();

    // all players should have initialized ids
    if (playerIds.indexOf(defaultId) != -1) {
      return false;
    }

    // all players should be unique
    return uniq(playerIds).length == 4;
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

  afterSelect() {
    let playerIds = this._selectedPlayerIds();
    remove(playerIds, (id) => id == defaultId);

    // don't display already selected players
    this.availablePlayers = map(this.players, clone);
    for (let playerId of playerIds) {
      remove(this.availablePlayers, {id: playerId})
    }
  }

  findById(playerId) {
    playerId = toNumber(playerId);
    return find(this.players, {id: playerId});
  }

  startGame() {
    if (!this.playersValid()) {
      return;
    }

    this._loading = true;
    this.api.startGame([
      this.self,
      this.shimocha,
      this.toimen,
      this.kamicha
    ]).then(() => {
      this.state._reset();
      this.state.updateCurrentGames();
    });
  }

  _selectedPlayerIds() {
    let playerIds = [this.self, this.shimocha, this.toimen, this.kamicha];
    // we had to convert ids to the int
    // to be able properly validate selected players
    playerIds = map(playerIds, (id) => toNumber(id));
    return playerIds;
  }
}

