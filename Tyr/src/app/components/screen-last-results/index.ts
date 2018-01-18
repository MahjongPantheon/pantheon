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
import { Player } from '../../interfaces/common';
import { I18nComponent, I18nService } from '../auxiliary-i18n';

@Component({
  selector: 'screen-last-results',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class LastResultsScreen extends I18nComponent {
  @Input() state: AppState;
  @Input() api: RiichiApiService;
  constructor(protected i18n: I18nService) { super(i18n); }

  public _loading: boolean = true;
  public _noResults: boolean = false;

  self: Player;
  shimocha: Player;
  toimen: Player;
  kamicha: Player;

  ngOnInit() {
    this.api.getLastResults().then((results) => {
      if (!results) {
        this._loading = false;
        this._noResults = true;
        return;
      }

      const current = this.state.getCurrentPlayerId();
      for (let i = 0; i < 4; i++) {
        if (results[0].id === current) {
          break;
        }

        results = results.slice(1).concat(results[0]);
      }

      this.self = results[0];
      this.shimocha = results[1];
      this.toimen = results[2];
      this.kamicha = results[3];
      this._loading = false;
    });
  }

  nextScreen() {
    this.state.nextScreen();
  }
}
