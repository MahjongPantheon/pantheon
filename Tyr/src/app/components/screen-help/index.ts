/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.dev>
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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import { AppActionTypes, GOTO_NEXT_SCREEN } from '../../services/store/actions/interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'screen-help',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class HelpScreenComponent extends I18nComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  public loading = false;
  public text = '';

  constructor(public i18n: I18nService, private http: HttpClient,
              private ref: ChangeDetectorRef) { super(i18n); }
  nextScreen() { this.dispatch({ type: GOTO_NEXT_SCREEN }); }
  ngOnInit() {
    this.loading = true;
    this.http.get('https://mjtop.net/announces_tyr_' + this.state.settings.currentLang + '.html', {responseType: 'text'})
      .toPromise().then((response: string) => {
        this.text = response;
        this.loading = false;
        this.ref.markForCheck();
    });
  }
}
