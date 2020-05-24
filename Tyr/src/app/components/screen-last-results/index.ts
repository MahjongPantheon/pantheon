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
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import { AppActionTypes, GET_LAST_RESULTS_INIT, GOTO_NEXT_SCREEN } from '../../services/store/actions/interfaces';
import { getKamicha, getSelf, getShimocha, getToimen } from '../../services/store/selectors/lastResultsSelectors';
import { LUserWithScore } from '../../interfaces/local';

@Component({
  selector: 'screen-last-results',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class LastResultsScreenComponent extends I18nComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  constructor(public i18n: I18nService) { super(i18n); }

  get _loading(): boolean { return this.state.loading.overview };
  get _noResults(): boolean { return !this.state.lastResults };

  get self(): LUserWithScore { return getSelf(this.state, this.state.lastResults); }
  get shimocha(): LUserWithScore { return getShimocha(this.state, this.state.lastResults); }
  get toimen(): LUserWithScore { return getToimen(this.state, this.state.lastResults); }
  get kamicha(): LUserWithScore { return getKamicha(this.state, this.state.lastResults); }

  ngOnInit() { this.dispatch({ type: GET_LAST_RESULTS_INIT }); }
  nextScreen() { this.dispatch({ type: GOTO_NEXT_SCREEN }); }
}
