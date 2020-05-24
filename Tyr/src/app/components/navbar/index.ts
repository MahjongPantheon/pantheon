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
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import {
  AppActionTypes,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS, SET_DORA_COUNT, SET_FU_COUNT
} from '../../services/store/actions/interfaces';
import {
  doraOptions,
  fuOptions,
  selectedFu,
  selectedDora,
  isMultiron,
  multironTitle,
  outcome,
  han,
  mayGoNextFromYakuSelect,
  mayGoNextFromPlayersSelect,
  mayGoNextFromNagashiSelect
} from '../../services/store/selectors/navbarSelectors';
import { getEventTitle } from '../../services/store/selectors/mimirSelectors';

@Component({
  selector: 'nav-bar',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./style.css']
})
export class NavBarComponent extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  constructor(public i18n: I18nService) { super(i18n); }

  isScreen(...screens: string[]): boolean {
    return screens.indexOf(this.state.currentScreen) !== -1;
  }

  get doraOptions() { return doraOptions(this.state); }
  get fuOptions() { return fuOptions(this.state); }
  get selectedFu() { return selectedFu(this.state); }
  get selectedDora() { return selectedDora(this.state); }
  get isMultiron() { return isMultiron(this.state); }
  get multironTitle() { return multironTitle(this.i18n, this.state); }
  get outcome() { return outcome(this.i18n, this.state); }
  get han(): number { return han(this.state); }
  get tournamentTitle(): string { return getEventTitle(this.i18n, this.state); }
  get mayGoNextFromYakuSelect() { return mayGoNextFromYakuSelect(this.state); }
  get mayGoNextFromPlayersSelect() { return mayGoNextFromPlayersSelect(this.state); }
  get mayGoNextFromNagashiSelect() { return mayGoNextFromNagashiSelect(this.state); }

  scrollDown() {
    document.querySelector('.scroller-wrap').scrollTop = document.querySelector('.scroller-wrap').scrollHeight;
  }

  set selectedDora(dora: any) {
    this.dispatch({ type: SET_DORA_COUNT, payload: {
      count: parseInt(dora, 10),
      winner: this.state.multironCurrentWinner
    }});
  }

  set selectedFu(fu: any) {
    this.dispatch({ type: SET_FU_COUNT, payload: {
      count: parseInt(fu, 10),
      winner: this.state.multironCurrentWinner
    }});
  }

  prevScreen() { this.dispatch({ type: GOTO_PREV_SCREEN }); }
  nextScreen() { this.dispatch({ type: GOTO_NEXT_SCREEN }); }
  openSettings() { this.dispatch({ type: OPEN_SETTINGS }); }
}
