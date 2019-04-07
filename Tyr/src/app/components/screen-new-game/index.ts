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
import { MetrikaService } from '../../services/metrika';
import { LUser } from '../../interfaces/local';
import { rand } from '../../helpers/rand';
import { toNumber, uniq, clone, find, remove } from 'lodash';

const DEFAULT_ID = -1;

const defaultPlayer: LUser = {
  displayName: '--- ? ---',
  id: DEFAULT_ID,
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
  constructor(private metrika: MetrikaService) { }

  // These are indexes in _players array
  toimen: number = DEFAULT_ID;
  shimocha: number = DEFAULT_ID;
  kamicha: number = DEFAULT_ID;
  self: number = DEFAULT_ID; // Self is always considered east!

  players: LUser[] = [defaultPlayer];
  availablePlayers: LUser[] = [];

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-new-game' });
    this._loading = true;

    this.api.getAllPlayers()
      .then((players) => {
        this.metrika.track(MetrikaService.LOAD_SUCCESS, { type: 'screen-new-game', request: 'getAllPlayers' });
        this._loading = false;        
      
        let currentUserIndex = players.findIndex((element) => element.id == this.state.getCurrentPlayerId());        
        let currentPlayer = players.splice(currentUserIndex, 1);

        this.players = [defaultPlayer].concat(currentPlayer,
          players.sort((a, b) => {
            if (a == b) {
              return 0;
            }
            return (a.displayName < b.displayName ? -1 : 1);
          })
        );

        this.availablePlayers = clone(this.players);
      })
      .catch((e) => this.metrika.track(MetrikaService.LOAD_ERROR, {
        type: 'screen-new-game', request: 'getAllPlayers', message: e.toString()
      }));
  }

  playersValid(): boolean {
    let playerIds = this._selectedPlayerIds();

    // all players should have initialized ids
    if (playerIds.indexOf(DEFAULT_ID) != -1) {
      return false;
    }

    // There must be Current Player
    if (playerIds.indexOf(this.state.getCurrentPlayerId()) == -1) {
      return false;
    }
 
    // all players should be unique
    return uniq(playerIds).length == 4;
  }

  /**
   * randomize seating
   */
  randomize() {
    let randomized = rand(this._selectedPlayerIds());

    this.toimen = randomized[0];
    this.kamicha = randomized[1];
    this.self = randomized[2];
    this.shimocha = randomized[3];
  }

  afterSelect() {
    let playerIds = this._selectedPlayerIds();
    remove(playerIds, (id) => id == DEFAULT_ID);

    // don't display already selected players
    this.availablePlayers = clone(this.players);
    for (let playerId of playerIds) {
      remove(this.availablePlayers, { id: playerId })
    }
  }

  findById(playerId) {
    playerId = toNumber(playerId);
    return find(this.players, { id: playerId });
  }

  startGame() {
    if (!this.playersValid()) {
      return;
    }

    this._loading = true;
    this.api.startGame(this._selectedPlayerIds()).then(() => {
      this.metrika.track(MetrikaService.LOAD_SUCCESS, { type: 'screen-new-game', request: 'startGame' });
      this.state._reset();
      this.state.updateCurrentGames();
    }).catch((e) => this.metrika.track(MetrikaService.LOAD_ERROR, {
      type: 'screen-new-game', request: 'startGame', message: e.toString()
    }));
  }

  private _selectedPlayerIds(): number[] {
    // we had to convert ids to the int
    // to be able properly validate selected players
    return [
      toNumber(this.self),
      toNumber(this.shimocha),
      toNumber(this.toimen),
      toNumber(this.kamicha)
    ];
  }
  
}

