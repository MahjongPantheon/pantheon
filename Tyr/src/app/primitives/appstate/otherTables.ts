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

import { isDevMode } from '@angular/core';
import { Table } from '../../interfaces/common';
import { AppOutcome } from '../../interfaces/app';
import { RSessionOverview, RRoundPaymentsInfo } from '../../interfaces/remote';
import { RiichiApiService } from '../../services/riichiApi';
import { LoadingSet } from './';

export function updateOtherTablesList(
  api: RiichiApiService,
  loading: LoadingSet,
  callback: (tables: Table[]) => void
) {
  loading.otherTables = true;
  api.getTablesState()
    .then((tables) => {
      loading.otherTables = false;
      callback(tables);
    })
    .catch((e) => {
      if (isDevMode) {
        console.error(e);
      }
      loading.otherTables = false;
      callback([]);
    });
}

export function getOtherTable(
  hash: string,
  api: RiichiApiService,
  loading: LoadingSet,
  callback: (state: RSessionOverview) => void
) {
  loading.otherTable = true;
  api.getGameOverview(hash)
    .then((table) => {
      loading.otherTable = false;
      callback(table);
    })
    .catch((e) => {
      if (isDevMode) {
        console.error(e);
      }
      loading.otherTable = false;
      callback(null);
    });
}

export function getLastRound(
  api: RiichiApiService,
  hash: string,
  callback: (round: RRoundPaymentsInfo) => void
) {
  api.getLastRound(hash)
    .then(callback)
    .catch((e) => {
      if (isDevMode) {
        console.error(e);
      }
    });
}
