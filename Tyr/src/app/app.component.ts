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

import { Component, NgZone, ApplicationRef } from '@angular/core';
import { AppState } from './primitives/appstate';
import { Outcome } from './interfaces/common';
import { RiichiApiService } from './services/riichiApi';

@Component({
  selector: 'riichi-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public state: AppState;
  constructor(
    private appRef: ApplicationRef,
    private zone: NgZone,
    private api: RiichiApiService
  ) {
    this.state = new AppState(
      this.zone,
      this.api
    );

    window.__state = this.state; // for great debug
    this.state.init();
  }
}
