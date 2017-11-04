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
import { Yaku, Player } from '../../interfaces/common';
import { YakuId, yakuMap, sortByViewPriority } from '../../primitives/yaku';
import { AppState } from '../../primitives/appstate';
import { RRoundPaymentsInfo } from '../../interfaces/remote';
import { RiichiApiService } from '../../services/riichiApi';
import { RemoteError } from '../../services/remoteError';

@Component({
  selector: 'screen-confirmation',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class ConfirmationScreen {
  @Input() state: AppState;
  public _dataReady: boolean;
  public _data: RRoundPaymentsInfo;
  public confirmed: boolean = false;
  public _error: string = '';

  constructor(private api: RiichiApiService) { }

  ngOnInit() {
    this._error = '';
    this._dataReady = false;
    this.api.getChangesOverview(this.state)
      .then((overview) => {
        this._data = overview;
        this._dataReady = true;
      })
      .catch((e) => this.onerror(e));
  }

  confirm() {
    this._dataReady = false;
    this.api.addRound(this.state)
      .then(() => this.okay())
      .catch((e) => this.onerror(e));
  }

  onerror(e) {
    this._dataReady = true;
    this._error = "Results weren't added. Please try again";
    if (e instanceof RemoteError) {
      if (e.code === 403) {
        this._error = "Error. Authentication wasn't confirmed";
      } else {
        this._error = 'Error. Maybe this hand was already added by someone else?';
      }
    }
  }

  okay() {
    this._dataReady = false;
    // when finished, appstate goes to overview screen automatically, no need to go to next
    this.state.updateOverview((finished) => finished ? null : this.state.nextScreen());
  }
}
