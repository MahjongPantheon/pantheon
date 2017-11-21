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

import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../services/i18n';
type Win = { winner: string, han: number, fu: number, dora: number, yakuList: string };

export function formatYakuman(value: string | number) {
  const v = parseInt(value.toString(), 10);
  if (v < 0) {
    return (v < -1 ? Math.abs(v) : '') + '☠';
  }
  return value;
}

@Pipe({ name: 'makeHandDescription' })
export class DescriptionPipe implements PipeTransform {
  constructor(protected i18n: I18nService) { }
  transform(value: Win): string {
    if (value.han < 0) {
      return this.i18n._t('%1 (%2)', [
        formatYakuman(value.han),
        value.yakuList
      ]);
    }

    if (value.han < 5 && value.dora) {
      return this.i18n._t('%1 han, %2 fu (%3, dora: %4)', [
        value.han,
        value.fu,
        value.yakuList,
        value.dora
      ]);
    }

    if (value.han < 5 && !value.dora) {
      return this.i18n._t('%1 han, %2 fu (%3)', [
        value.han,
        value.fu,
        value.yakuList
      ]);
    }

    if (value.dora) {
      return this.i18n._t('%1 han (%3, dora: %4)', [
        value.han,
        value.yakuList,
        value.dora
      ]);
    }

    if (!value.dora) {
      return this.i18n._t('%1 han (%3)', [
        value.han,
        value.yakuList
      ]);
    }

    return '';
  }
}
