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

import {
  Component,
  ViewChild, ViewChildren,
  QueryList, ElementRef,
  Input, ChangeDetectionStrategy
} from '@angular/core';
import { Yaku } from '../../interfaces/common';
import { YakuId } from '../../primitives/yaku';
import { yakuGroups, yakumanGroups, yakuRareGroups, filterAllowed } from './yaku-lists';
import { throttle, keys, pickBy } from 'lodash';
import { AppState } from '../../primitives/appstate';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { MetrikaService } from '../../services/metrika';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {ADD_YAKU, AppActionTypes, REMOVE_YAKU, SELECT_MULTIRON_WINNER} from "../../services/store/actions/interfaces";
import {getWinningUsers, hasYaku} from "../../services/store/selectors/mimirSelectors";
import {getDora, getHan} from "../../services/store/selectors/hanFu";
import {getAllowedYaku, getRequiredYaku, getSelectedYaku} from "../../services/store/selectors/yaku";

@Component({
  selector: 'screen-yaku-select',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class YakuSelectScreen extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  yakuList: {
    [id: number]: Array<{
      anchor: string;
      groups: Yaku[][]
    }>
  } = {};
  disabledYaku: {
    [id: number]: {
      [key: number]: boolean
    }
  } = {};
  _viewportHeight: string = null;
  _tabsHeight: string = null;
  _currentUser: number = null; // Should be in sync with current multi-ron user in state!

  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) {
    super(i18n);
    this._viewportHeight = (window.innerHeight - 50) + 'px'; // 50 is height of navbar;
    this._tabsHeight = parseInt((window.innerWidth * 0.10).toString(), 10) + 'px'; // Should equal to margin-left of buttons & scroller-wrap
  }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-yaku-select' });
    this._currentUser = getWinningUsers(this.state)[0].id;
    this.dispatch({ type: SELECT_MULTIRON_WINNER, payload: this._currentUser });

    for (let user of getWinningUsers(this.state)) {
      this.yakuList[user.id] = [
        { anchor: 'simple', groups: filterAllowed(yakuGroups, this.state.gameConfig.allowedYaku) },
        { anchor: 'rare', groups: filterAllowed(yakuRareGroups, this.state.gameConfig.allowedYaku) },
        { anchor: 'yakuman', groups: filterAllowed(yakumanGroups, this.state.gameConfig.allowedYaku) }
      ];
    }

    if (this.state.currentOutcome.selectedOutcome === 'tsumo') {
      this.dispatch({ type: ADD_YAKU, payload: { id: YakuId.MENZENTSUMO, winner: this._currentUser} });
    }
    this._enableRequiredYaku();
    this._disableIncompatibleYaku();
  }

  showFuOf(id: number) {
    let han = getHan(this.state, id);
    let dora = getDora(this.state, id);
    return han > 0 && han + dora < 5
  }

  han(id: number) {
    return getHan(this.state, id) + getDora(this.state, id);
  }

  showTabs() {
    return getWinningUsers(this.state).length > 1;
  }

  selectMultiRonUser(id: number) {
    this._currentUser = id;
    this.dispatch({ type: SELECT_MULTIRON_WINNER, payload: id });
    this._enableRequiredYaku();
    this._disableIncompatibleYaku();
  }

  outcome() {
    switch (this.state.currentOutcome.selectedOutcome) {
      case 'ron':
      case 'multiron':
        return this.i18n._t('Ron');
      case 'tsumo':
        return this.i18n._t('Tsumo');
      case 'draw':
        return this.i18n._t('Exhaustive draw');
      case 'abort':
        return this.i18n._t('Abortive draw');
      case 'chombo':
        return this.i18n._t('Chombo');
      default:
        return '';
    }
  }

  yakuSelect(evt: { id: number }) {
    if (hasYaku(this.state, evt.id)) {
      this.dispatch({ type: REMOVE_YAKU, payload: { id: evt.id } });
    } else {
      this.dispatch({ type: ADD_YAKU, payload: { id: evt.id } });
    }
    this._enableRequiredYaku();
    this._disableIncompatibleYaku();
  }

  _disableIncompatibleYaku() {
    const allowedYaku = getAllowedYaku(this.state);
    this.disabledYaku[this._currentUser] = {};

    for (let yGroup of this.yakuList[this._currentUser]) {
      for (let yRow of yGroup.groups) {
        for (let yaku of yRow) {
          if (allowedYaku.indexOf(yaku.id) === -1 && !hasYaku(this.state, yaku.id)) {
            this.disabledYaku[this._currentUser][yaku.id] = true;
          }
        }
      }
    }
  }

  _enableRequiredYaku() {
    const requiredYaku = getRequiredYaku(this.state);
    requiredYaku.forEach((y) => {
      this.dispatch({ type: ADD_YAKU, payload: { id: y } });
    });
  }

  isSelected(id: YakuId) {
    return getSelectedYaku(this.state).indexOf(id) !== -1;
  }

  // -------------------------------
  // ---- View & scroll related ----
  // -------------------------------
  @ViewChild('scroller', {static: false}) scroller: ElementRef;
  @ViewChildren('scrlink') links: QueryList<ElementRef>;
  private _simpleLink: HTMLAnchorElement;

  private _rareLink: HTMLAnchorElement;
  private _yakumanLink: HTMLAnchorElement;
  selectedSimple: boolean = true;
  selectedRare: boolean = false;
  selectedYakuman: boolean = false;

  updateAfterScroll() {
    throttle(() => this._updateAfterScroll(), 16)();
  }

  private _makeLinks() {
    if (this._simpleLink) {
      return;
    }

    for (let link of this.links.toArray()) {
      switch (link.nativeElement.name) {
        case 'simple':
          this._simpleLink = link.nativeElement;
          break;
        case 'rare':
          this._rareLink = link.nativeElement;
          break;
        case 'yakuman':
          this._yakumanLink = link.nativeElement;
          break;
      }
    }
  }

  private _updateAfterScroll() {
    this._makeLinks();

    if (this.scroller.nativeElement.scrollTop - this._simpleLink.offsetTop < 500) { // highest edge case
      this.selectedRare = this.selectedYakuman = false;
      this.selectedSimple = true;
    } else if (this._yakumanLink.offsetTop - this.scroller.nativeElement.scrollTop < 150) { // lowest edge case
      this.selectedRare = this.selectedSimple = false;
      this.selectedYakuman = true;
    } else { // middle case
      this.selectedSimple = this.selectedYakuman = false;
      this.selectedRare = true;
    }
  }

  showSimple() {
    this._makeLinks();
    this.scroller.nativeElement.scrollTop = this._simpleLink.offsetTop;
  }

  showRare() {
    this._makeLinks();
    this.scroller.nativeElement.scrollTop = this._rareLink.offsetTop;
  }

  showYakuman() {
    this._makeLinks();
    this.scroller.nativeElement.scrollTop = this._yakumanLink.offsetTop;
  }
}

