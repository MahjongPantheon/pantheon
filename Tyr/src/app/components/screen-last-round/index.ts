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

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MetrikaService } from '../../services/metrika';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import { AppActionTypes, GET_LAST_ROUND_INIT } from '../../services/store/actions/interfaces';
import { getOutcomeName } from '../../services/store/selectors/commonSelectors';
import { getWins } from '../../services/store/selectors/otherTableSelectors';
import { RoundPreviewSchemePurpose } from '../../services/store/selectors/roundPreviewSchemeSelectors';

@Component({
  selector: 'screen-last-round',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class LastRoundScreenComponent extends I18nComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  get _loading(): boolean { return this.state.loading.overview; };
  get _purpose(): RoundPreviewSchemePurpose {
    if (this.state.currentSessionHash) {
      return 'lastround';
    } else {
      return 'otherlastround';
    }
  };
  get outcomeName(): string { return getOutcomeName(
    this.i18n,
    this.state.lastRoundOverview.outcome,
    this.state.lastRoundOverview.outcome === 'multiron' ? this.state.lastRoundOverview.winner.length : 0
  ); };
  get wins() { return getWins(this.state.lastRoundOverview, this.state.players, this.i18n); }
  get _error(): string {
    if (!this.state.lastRoundOverviewErrorCode) {
      return null;
    }

    switch (this.state.lastRoundOverviewErrorCode) {
      case 403:
        return this.i18n._t('Authentication failed');
      case 404:
        return this.i18n._t('Latest hand wasn\'t found');
      case 418:
        return this.i18n._t('Error occured. Try again.');
      default:
        return this.i18n._t('Unexpected server error');
    }
  };

  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) {
    super(i18n);
  }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-last-round' });
    this.dispatch({ type: GET_LAST_ROUND_INIT, payload: this.state.currentSessionHash || this.state.currentOtherTableHash });
  }
}
