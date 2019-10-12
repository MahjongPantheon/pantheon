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

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { icons } from './icons';

@Component({
  selector: 'custom-icon',
  template: `<i class="custom-tyr-icon-wrap" style='display: inline-block'
        [innerHTML]="content"
        [style.transform]="transforms"
        [style.width]="resize + 'px'" 
        [style.height]="resize + 'px'"
      ></i>`,
  styleUrls: ['style.css'],
  encapsulation: ViewEncapsulation.None
})
export class CustomIconComponent {
  @Input() type: string;
  @Input() resize: number = 28;
  @Input() mirror: boolean = false;
  content: SafeHtml = '';

  get transforms() {
    let t = [];
    if (this.mirror) {
      t.push('scaleX(-1)');
    }

    // TODO: more transforms?

    return t.join(' ');
  }

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.content = this.sanitizer.bypassSecurityTrustHtml(icons[this.type]);
  }
}

