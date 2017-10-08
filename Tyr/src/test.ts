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

import './polyfills.ts';

import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare var __karma__: any;
declare var require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = function () { };

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
let context = require.context('./', true, /\.spec\.ts/);
// And load the modules.
context.keys().map(context);
// Finally, start Karma to run the tests.
__karma__.start();

// Custom matcher to test array items without ordering
export function toHaveSameItems(util, customEqualityTesters) {
  return {
    negativeCompare: function (actual: any[], expected: any[]) {
      let typeOk = (actual.length !== undefined && expected.length !== undefined);
      if (!typeOk) {
        return {
          pass: false,
          message: `Expected ${actual} and ${expected} to be valid array-like objects or arrays.`
        };
      }

      let matches = actual.length === expected.length
        && expected.length === expected.reduce((acc, item) => {
          if (actual.indexOf(item) !== -1) {
            return acc + 1;
          }
          return acc;
        }, 0);

      return {
        pass: !matches,
        message: `Expected ${actual} not to have same items as ${expected}`
      };
    },
    compare: function (actual: any[], expected: any[]) {
      let typeOk = (actual.length !== undefined && expected.length !== undefined);
      if (!typeOk) {
        return {
          pass: false,
          message: `Expected ${actual} and ${expected} to be valid array-like objects or arrays.`
        };
      }

      let ok = actual.length === expected.length
        && expected.length === expected.reduce((acc, item) => {
          if (actual.indexOf(item) !== -1) {
            return acc + 1;
          }
          return acc;
        }, 0);

      return {
        pass: ok,
        message: `Expected ${actual} to have same items as ${expected}`
      };
    }
  };
}
