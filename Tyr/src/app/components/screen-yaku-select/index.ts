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
  Input
} from '@angular/core';
import { Yaku } from '../../interfaces/common';
import { YakuId } from '../../primitives/yaku';
import { yakuGroups, yakumanGroups, yakuRareGroups, filterAllowed } from './yaku-lists';
import { throttle, keys, pickBy } from 'lodash';
import { AppState } from '../../primitives/appstate';
import { I18nComponent, I18nService } from '../auxiliary-i18n';

@Component({
  selector: 'screen-yaku-select',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class YakuSelectScreen extends I18nComponent {
  @Input() state: AppState;
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

  constructor(protected i18n: I18nService) {
    super(i18n);
    this._viewportHeight = (window.innerHeight - 60) + 'px'; // 60 is height of navbar;
    this._tabsHeight = parseInt((window.innerWidth * 0.10).toString(), 10) + 'px'; // Should equal to margin-left of buttons & scroller-wrap
  }

  ngOnInit() {
    this._currentUser = this.state.getWinningUsers()[0].id;
    this.state.selectMultiRonUser(this._currentUser);

    for (let user of this.state.getWinningUsers()) {
      this.yakuList[user.id] = [
        { anchor: 'simple', groups: filterAllowed(yakuGroups, this.state.getGameConfig('allowedYaku')) },
        { anchor: 'rare', groups: filterAllowed(yakuRareGroups, this.state.getGameConfig('allowedYaku')) },
        { anchor: 'yakuman', groups: filterAllowed(yakumanGroups, this.state.getGameConfig('allowedYaku')) }
      ];
    }

    if (this.state.getOutcome() === 'tsumo') {
      this.state.addYaku(YakuId.MENZENTSUMO);
    }
    this._enableRequiredYaku();
    this._disableIncompatibleYaku();
  }

  showFuOf(id: number) {
    let han = this.state.getHanOf(id);
    let dora = this.state.getDoraOf(id);
    return han > 0 && han + dora < 5
  }

  han(id: number) {
    return this.state.getHanOf(id) + this.state.getDoraOf(id);
  }

  showTabs() {
    return this.state.getWinningUsers().length > 1;
  }

  selectMultiRonUser(id: number) {
    this._currentUser = id;
    this.state.selectMultiRonUser(this._currentUser);
    this._enableRequiredYaku();
    this._disableIncompatibleYaku();
  }

  outcome() {
    switch (this.state.getOutcome()) {
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

  yakuSelect(evt) {
    if (this.state.hasYaku(evt.id)) {
      this.state.removeYaku(evt.id);
    } else {
      this.state.addYaku(evt.id);
    }
    this._enableRequiredYaku();
    this._disableIncompatibleYaku();
  }

  _disableIncompatibleYaku() {
    const allowedYaku = this.state.getAllowedYaku();
    this.disabledYaku[this._currentUser] = {};

    for (let yGroup of this.yakuList[this._currentUser]) {
      for (let yRow of yGroup.groups) {
        for (let yaku of yRow) {
          if (allowedYaku.indexOf(yaku.id) === -1 && !this.state.hasYaku(yaku.id)) {
            this.disabledYaku[this._currentUser][yaku.id] = true;
          }
        }
      }
    }
  }

  _enableRequiredYaku() {
    const requiredYaku = this.state.getRequiredYaku();
    requiredYaku.forEach((y) => this.state.addYaku(y, true));
  }

  isSelected(id: YakuId) {
    return this.state.getSelectedYaku().indexOf(id) !== -1;
  }

  // -------------------------------
  // ---- View & scroll related ----
  // -------------------------------
  @ViewChild('scroller') scroller: ElementRef;
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

