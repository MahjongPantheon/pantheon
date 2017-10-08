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

@Component({
  selector: 'nav-bar',
  templateUrl: './template.html',
  styleUrls: ['./style.css']
})
export class NavBarComponent {
  @Input() state: AppState;
  @Input() screen: AppState['_currentScreen'];
  public logoutDisabled: boolean = false;
  private _logoutTimer: number;

  ngOnInit() {
    this.ngOnChanges();
  }

  ngOnChanges() {
    if (this.screen === 'overview') {
      // Disable logout button for 3 secs to avoid misclicks
      this.logoutDisabled = true;
      window.clearTimeout(this._logoutTimer);
      this._logoutTimer = window.setTimeout(() => {
        this.logoutDisabled = false;
      }, 3000);
    } else {
      window.clearTimeout(this._logoutTimer);
    }
  }

  get doraOptions() {
    if (this.state.yakumanInYaku()) {
      return [0];
    }

    if (this.state.getGameConfig('rulesetTitle') === 'jpmlA') {
      // TODO: make withUradora/withKandora config items and use them, not title!
      return [0, 1, 2, 3, 4];
    }

    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  }

  get fuOptions() {
    return this.state.getPossibleFu();
  }

  get selectedFu() {
    return this.state.getFu();
  }

  set selectedFu(fu: any) {
    this.state.setFu(parseInt(fu, 10));
  }

  get selectedDora() {
    return this.state.getDora();
  }

  set selectedDora(dora: any) {
    this.state.setDora(parseInt(dora, 10));
  }

  isMultiron() {
    return this.state.getOutcome() === 'multiron';
  }

  multironTitle() {
    if (this.state.getOutcome() === 'multiron' && this.state.getMultiRonCount() === 3) {
      return 'Трипл-рон';
    }
    if (this.state.getOutcome() === 'multiron' && this.state.getMultiRonCount() === 2) {
      return 'Дабл-рон';
    }
  }

  outcome() {
    switch (this.state.getOutcome()) {
      case 'ron':
        return 'Рон';
      case 'multiron':
        return 'Дабл/трипл рон';
      case 'tsumo':
        return 'Цумо';
      case 'draw':
        return 'Ничья';
      case 'abort':
        return 'Абортивная ничья';
      case 'chombo':
        return 'Чомбо';
      default:
        return '';
    }
  }

  showHanFu() {
    return ['ron', 'multiron', 'tsumo']
      .indexOf(this.state.getOutcome()) !== -1;
  }

  han(): number {
    return this.state.getHan();
  }

  overrideFu(): number {
    return this.state.getFu();
  }

  isScreen(...screens: string[]): boolean {
    return screens.indexOf(this.screen) !== -1;
  }

  mayGoNext(screen): boolean {
    switch (screen) {
      case 'yakuSelect':
        switch (this.state.getOutcome()) {
          case 'ron':
          case 'tsumo':
            return this.state.getHan() != 0;
          case 'multiron':
            return this.state.getWinningUsers().reduce((acc, user) => {
              return acc && (this.state.getHanOf(user.id) != 0);
            }, true);
        }
        return false;
      case 'playersSelect':
        switch (this.state.getOutcome()) {
          case 'ron':
            return this.state.getWinningUsers().length === 1
              && this.state.getLosingUsers().length === 1;
          case 'tsumo':
            return this.state.getWinningUsers().length === 1;
          case 'draw':
          case 'abort':
            return true;
          case 'multiron':
            return this.state.getWinningUsers().length >= 1
              && this.state.getLosingUsers().length === 1;
          case 'chombo':
            return this.state.getLosingUsers().length === 1;
        }
        break;
      default:
        return true;
    }
  }

  scrollDown() {
    document.querySelector('.scroller-wrap').scrollTop = document.querySelector('.scroller-wrap').scrollHeight;
  }

  tournamentTitle(): string {
    return this.state.getEventTitle();
  }

  prevScreen() {
    this.state.prevScreen();
  }

  nextScreen() {
    this.state.nextScreen();
  }

  logout() {
    if (window.confirm("Выйти из текущего рейтинга? Для повторного входа будет нужен новый пин-код!")) {
      this.state.logout();
    }
  }

  onFuSelect(fu) {
    // TODO: wat?
  }
}
