/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { roundToString } from './roundToString';

describe('roundToString', () => {
  it('decodes 4-player rounds (default playersCount)', () => {
    expect(roundToString(1)).toBe('東1');
    expect(roundToString(4)).toBe('東4');
    expect(roundToString(5)).toBe('南1');
    expect(roundToString(8)).toBe('南4');
    expect(roundToString(9)).toBe('西1');
    expect(roundToString(13)).toBe('北1');
  });

  it('decodes sanma (3-player) rounds using a boundary of 3', () => {
    expect(roundToString(1, 3)).toBe('東1');
    expect(roundToString(3, 3)).toBe('東3');
    // Round index 4 is South 1 in sanma, not East 4
    expect(roundToString(4, 3)).toBe('南1');
    expect(roundToString(6, 3)).toBe('南3');
    expect(roundToString(7, 3)).toBe('西1');
  });

  it('returns "?" for non-positive indices', () => {
    expect(roundToString(0)).toBe('?');
    expect(roundToString(0, 3)).toBe('?');
  });

  it('accepts string input', () => {
    expect(roundToString('5')).toBe('南1');
    expect(roundToString('4', 3)).toBe('南1');
  });
});
