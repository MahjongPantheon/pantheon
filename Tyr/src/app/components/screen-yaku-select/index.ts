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
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {YakuId} from '../../primitives/yaku';
import {throttle} from 'lodash';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {MetrikaService} from '../../services/metrika';
import {IAppState} from '../../services/store/interfaces';
import {Dispatch} from 'redux';
import {
  ADD_YAKU,
  AppActionTypes,
  INIT_REQUIRED_YAKU,
  REMOVE_YAKU,
  SELECT_MULTIRON_WINNER
} from '../../services/store/actions/interfaces';
import {getWinningUsers, hasYaku} from '../../services/store/selectors/mimirSelectors';
import {getDora, getFu, getHan} from '../../services/store/selectors/hanFu';
import {getSelectedYaku} from '../../services/store/selectors/yaku';
import {getDisabledYaku, getYakuList, shouldShowTabs} from '../../services/store/selectors/screenYakuSelectors';
import {getOutcomeName} from '../../services/store/selectors/commonSelectors';

@Component({
  selector: 'screen-yaku-select',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class YakuSelectScreenComponent extends I18nComponent implements OnInit {
  get winningUsers() { return getWinningUsers(this.state); }
  get outcome() { return getOutcomeName(
    this.i18n,
    this.state.currentOutcome.selectedOutcome,
    this.state.currentOutcome.selectedOutcome === 'multiron' ? this.state.currentOutcome.multiRon : 0,
    true
  ); }
  get shouldShowTabs() { return shouldShowTabs(this.state); }
  get yakuList() { return getYakuList(this.state); }
  get disabledYaku() { return getDisabledYaku(this.state); }
  get currentMultironUser() { return this.state.multironCurrentWinner; }
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  // -------------------------------
  // ---- View & scroll related ----
  // -------------------------------
  @ViewChild('scroller', {static: false}) scroller: ElementRef;
  @ViewChildren('scrlink') links: QueryList<ElementRef>;
  private _simpleLink: HTMLAnchorElement;

  private _rareLink: HTMLAnchorElement;
  private _yakumanLink: HTMLAnchorElement;
  selectedSimple = true;
  selectedRare = false;
  selectedYakuman = false;

  _viewportHeight: string = null;
  _tabsHeight: string = null;

  private _updateAfterScrollThrottled = throttle(() => this._updateAfterScroll(), 16);
  fu(id: number) { return getFu(this.state, id); }
  han(id: number) { return getHan(this.state, id) + getDora(this.state, id); }
  isSelected(id: YakuId) { return getSelectedYaku(this.state).indexOf(id) !== -1; }

  constructor(public i18n: I18nService, private metrika: MetrikaService) {
    super(i18n);
    this._initView();
  }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-yaku-select' });
    // next action sets winner for ron/tsumo too
    this.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: getWinningUsers(this.state)[0].id } });
    this.dispatch({ type: INIT_REQUIRED_YAKU });
    if (this.state.currentOutcome.selectedOutcome === 'tsumo') {
      this.dispatch({ type: ADD_YAKU, payload: { id: YakuId.MENZENTSUMO, winner: getWinningUsers(this.state)[0].id } });
    }
  }

  selectMultiRonUser(id: number) {
    this.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: id } });
  }

  yakuSelect(evt: { id: number }) {
    if (hasYaku(this.state, evt.id)) {
      this.dispatch({ type: REMOVE_YAKU, payload: { id: evt.id, winner: this.state.multironCurrentWinner } });
    } else {
      this.dispatch({ type: ADD_YAKU, payload: { id: evt.id, winner: this.state.multironCurrentWinner } });
    }
  }

  private _initView() {
    this._viewportHeight = (window.innerHeight - 50) + 'px'; // 50 is height of navbar;
    this._tabsHeight = parseInt((window.innerWidth * 0.10).toString(), 10) + 'px'; // Should equal to margin-left of buttons & scroller-wrap
  }
  updateAfterScroll() { this._updateAfterScrollThrottled(); }

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

