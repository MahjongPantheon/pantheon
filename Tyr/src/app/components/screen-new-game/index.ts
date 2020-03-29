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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MetrikaService} from '../../services/metrika';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {
  AppActionTypes,
  GET_ALL_PLAYERS_INIT,
  RANDOMIZE_NEWGAME_PLAYERS,
  SELECT_NEWGAME_PLAYER_KAMICHA,
  SELECT_NEWGAME_PLAYER_SELF,
  SELECT_NEWGAME_PLAYER_SHIMOCHA,
  SELECT_NEWGAME_PLAYER_TOIMEN,
  START_GAME_INIT
} from "../../services/store/actions/interfaces";
import {getPlayers, playersValid} from "../../services/store/selectors/screenNewGameSelectors";

@Component({
  selector: 'screen-new-game',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class NewGameScreen {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  get _loading() { return this.state.loading.players; }
  get players() { return getPlayers(this.state); }

  get self() { return this.state.newGameSelectedUsers && this.state.newGameSelectedUsers[0]; }
  get shimocha() { return this.state.newGameSelectedUsers && this.state.newGameSelectedUsers[1]; }
  get toimen() { return this.state.newGameSelectedUsers && this.state.newGameSelectedUsers[2]; }
  get kamicha() { return this.state.newGameSelectedUsers && this.state.newGameSelectedUsers[3]; }

  get playersValid() { return playersValid(this.state); }

  ngOnInit() {
    this.dispatch({ type: GET_ALL_PLAYERS_INIT });
  }

  randomize() { this.dispatch( { type: RANDOMIZE_NEWGAME_PLAYERS } ); }
  selectSelf(id: string) { this.dispatch( { type: SELECT_NEWGAME_PLAYER_SELF, payload: parseInt(id, 10) } ); }
  selectShimocha(id: string) { this.dispatch( { type: SELECT_NEWGAME_PLAYER_SHIMOCHA, payload: parseInt(id, 10) } ); }
  selectToimen(id: string) { this.dispatch( { type: SELECT_NEWGAME_PLAYER_TOIMEN, payload: parseInt(id, 10) } ); }
  selectKamicha(id: string) { this.dispatch( { type: SELECT_NEWGAME_PLAYER_KAMICHA, payload: parseInt(id, 10) } ); }

  startGame() {
    if (!this.playersValid) {
      return;
    }

    this.dispatch({ type: START_GAME_INIT, payload: this.state.newGameSelectedUsers.map((p) => p.id) });
  }
}

