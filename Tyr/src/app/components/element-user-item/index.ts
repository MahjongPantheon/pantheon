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
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { Player } from '../../interfaces/common';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IAppState } from '../../services/store/interfaces';
import {
  paoPressed,
  showDeadButton,
  showLoseButton, showNagashiButton,
  showPaoButton,
  showRiichiButton,
  showWinButton,
  winPressed,
  losePressed,
  riichiPressed,
  deadPressed,
  nagashiPressed,
  winDisabled,
  loseDisabled,
  nagashiDisabled
} from '../../services/store/selectors/userItemSelectors';

@Component({
  selector: 'user-item',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class UserItemComponent extends I18nComponent {
  @Input() state: IAppState;
  @Input() userData: Player;
  @Output() onEvent = new EventEmitter<[Player, 'win' | 'lose' | 'riichi' | 'dead' | 'pao' | 'nagashi']>();
  constructor(
    public i18n: I18nService
  ) { super(i18n); }

  get showWinButton() { return showWinButton(this.state); }
  get showPaoButton() { return showPaoButton(this.state); }
  get showLoseButton() { return showLoseButton(this.state); }
  get showRiichiButton() { return showRiichiButton(this.state); }
  get showDeadButton() { return showDeadButton(this.state); }
  get showNagashiButton() { return showNagashiButton(this.state); }
  get winPressed() { return winPressed(this.state); }
  get losePressed() { return losePressed(this.state); }
  get paoPressed() { return paoPressed(this.state); }
  get riichiPressed() { return riichiPressed(this.state); }
  get deadPressed() { return deadPressed(this.state); }
  get nagashiPressed() { return nagashiPressed(this.state); }
  get winDisabled() { return winDisabled(this.state); }
  get loseDisabled() { return loseDisabled(this.state); }
  get nagashiDisabled() { return nagashiDisabled(this.state); }

  // event handlers
  winClick = () => this.winDisabled ? null : this.onEvent.emit([this.userData, 'win']);
  loseClick = () => this.loseDisabled ? null : this.onEvent.emit([this.userData, 'lose']);
  riichiClick = () => this.onEvent.emit([this.userData, 'riichi']);
  deadClick = () => this.onEvent.emit([this.userData, 'dead']);
  paoClick = () => this.onEvent.emit([this.userData, 'pao']);
  nagashiClick = () => this.nagashiDisabled ? null : this.onEvent.emit([this.userData, 'nagashi']);
}

