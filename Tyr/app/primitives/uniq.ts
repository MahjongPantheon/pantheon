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

export function uniq(arr: any[], sorted: boolean | number, strings: boolean | number) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array for the first argument');
  }
  if (sorted != null && typeof sorted != 'boolean') {
    throw new Error('expected a number or boolean for the second argument');
  }
  if (strings != null && typeof strings != 'boolean') {
    throw new Error('expected a number or boolean for the third argument');
  }
  if (!sorted && strings && arr[0] !== Object(arr[0])) {
    return stringUnique(arr);
  }
  var result = [],
    duplicate,
    seenNaN,
    lastAdded;
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    var elem = arr[i];
    if (typeof elem == 'number' && isNaN(elem)) {
      duplicate = seenNaN;
      seenNaN = true;
    }
    duplicate = duplicate || (lastAdded && lastAdded === elem);
    if (!duplicate && !sorted) {
      duplicate = result.includes(elem);
    }
    if (!duplicate) {
      result.push(elem);
      lastAdded = elem;
    } else {
      duplicate = false;
    }
  }
  return result;
}

function stringUnique(arr: string[]) {
  var lookup: { [key: string]: boolean } = {};
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    lookup[arr[i]] = true;
  }
  return Object.keys(lookup);
}
