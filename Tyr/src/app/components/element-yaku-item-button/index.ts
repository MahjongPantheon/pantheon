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

import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { Yaku } from '../../interfaces/common';
import { I18nComponent, I18nService } from '../auxiliary-i18n';

@Component({
  selector: 'yaku-item-button',
  template: `
    <button
      class="discolored"
      (click)="yakuClick()"
      [class.special]="yaku.id < 0"
      [class.pressed]="pressed"
      [disabled]="disabled"
      >{{yaku.name(i18n)}}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class YakuItemButtonComponent extends I18nComponent {
  @Input() yaku: Yaku;
  @Input() pressed: boolean;
  @Input() disabled: boolean;
  @Output() onClick = new EventEmitter<Yaku>();
  constructor(i18n: I18nService) { super(i18n); }
  yakuClick() {
    this.onClick.emit(this.yaku);
  }
}
