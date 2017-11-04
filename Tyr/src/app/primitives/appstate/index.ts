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

import { Outcome, AppOutcome } from '../../interfaces/app';
import { NgZone, isDevMode } from '@angular/core';
import { getHan, getFixedFu } from '../yaku-values';
import { Outcome as OutcomeType, Player, Table } from '../../interfaces/common';
import { YakuId } from '../yaku';
import { RiichiApiService } from '../../services/riichiApi';
import { RemoteError } from '../../services/remoteError';
import { LCurrentGame, LUser, LTimerState, LWinItem, LGameConfig } from '../../interfaces/local';
import { RSessionOverview, RRoundPaymentsInfo } from '../../interfaces/remote';

export type AppScreen = 'overview' | 'outcomeSelect' | 'playersSelect' | 'otherTable' | 'otherTablesList'
  | 'yakuSelect' | 'confirmation' | 'newGame' | 'lastResults' | 'lastRound' | 'login' | 'paoSelect';
export type LoadingSet = {
  games: boolean,
  overview: boolean,
  otherTables: boolean,
  otherTable: boolean
};

// functional modules
import { TimerData, initTimer, getTimeRemaining, getCurrentTimerZone, timerIsWaiting } from './timer';
import {
  toggleLoser, toggleWinner, togglePao,
  getWinningUsers, getLosingUsers, getPaoUsers,
  getDeadhandUsers, toggleDeadhand
} from './winLoseToggles';
import { toggleRiichi, getRiichiUsers } from './riichiToggle';
import { updateOtherTablesList, getOtherTable, getLastRound } from './otherTables';
import { setHan, getHanOf, setFu, getFuOf, getPossibleFu } from './hanFu';
import { setDora, getDoraOf } from './dora';
import { initBlankOutcome } from './initials';
import {
  initYaku, hasYaku, addYaku, removeYaku,
  getRequiredYaku, getSelectedYaku, getAllowedYaku, yakumanInYaku,
  winnerHasYakuWithPao
} from './yaku';

// implementation
export class AppState {
  private _currentScreen: AppScreen = 'overview';
  private _currentSessionHash: string = null;
  private _currentOutcome: AppOutcome = null;
  private _currentRound: number = 1;
  private _currentPlayerDisplayName: string = null;
  private _currentPlayerId: number = null;
  private _players: [Player, Player, Player, Player]; // e-s-w-n
  private _mapIdToPlayer: { [key: number]: Player };
  private _riichiOnTable: number = 0;
  private _honba: number = 0;
  private _multironCurrentWinner: number = null;
  private _isLoggedIn: boolean = false;
  private _gameConfig: LGameConfig;
  private _tableIndex: number = null;
  private _yellowZoneAlreadyPlayed: boolean = false;
  private _otherTablesList: Table[] = [];
  private _currentOtherTable: RSessionOverview = null;
  private _currentOtherTableHash: string = null;
  private _currentOtherTablePlayers: Player[] = [];
  private _currentOtherTableLastRound: RRoundPaymentsInfo = null;
  public isIos: boolean = false;

  public isUniversalWatcher = () => window.localStorage.getItem('authToken') === '0000000000';

  // preloaders flags
  private _loading: LoadingSet = {
    games: true,
    overview: false,
    otherTables: false,
    otherTable: false,
  };

  constructor(private zone: NgZone, private api: RiichiApiService) {
    this._players = null;
    this._mapIdToPlayer = {};
    this.isIos = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
    initTimer({
      started: false,
      finished: false,
      waitingForTimer: false,
      timeRemaining: 0
    });
  }

  isLoading(...what: string[]) {
    return what.reduce((acc, item) => acc || this._loading[item], false);
  }

  init() {
    this.reinit();
    // initial push to make some history to return to
    window.history.pushState({}, '');
    window.onpopstate = (e: PopStateEvent): any => {
      this.zone.run(() => {
        // Any history pop we do as BACK event!
        this.prevScreen();
        // Then make another dummy history item
        window.history.pushState({}, '');
      });
    };
  }

  reinit() {
    this.api.setCredentials(window.localStorage.getItem('authToken'));
    this._isLoggedIn = !!window.localStorage.getItem('authToken');
    if (!this._isLoggedIn) {
      this._currentScreen = 'login';
    } else {
      this._currentScreen = 'overview';
      this.updateCurrentGames();
    }
  }

  logout() {
    window.localStorage.removeItem('authToken');
    this.reinit();
  }

  updateCurrentGames() {
    if (this.isUniversalWatcher()) {
      this._loading.games = false;
      this._reset();
      this._currentPlayerDisplayName = 'Big Brother';
      this._currentPlayerId = 0;
      return;
    }

    this._loading.games = true;
    // TODO: automate promises creation from mixins
    const promises: [Promise<LCurrentGame[]>, Promise<LUser>, Promise<LGameConfig>, Promise<LTimerState>] = [
      this.api.getCurrentGames(),
      this.api.getUserInfo(),
      this.api.getGameConfig(),
      this.api.getTimerState()
    ];

    Promise.all(promises).then(([games, playerInfo, gameConfig, timerState]) => {
      this._currentPlayerDisplayName = playerInfo.displayName;
      this._currentPlayerId = playerInfo.id;
      this._gameConfig = gameConfig;
      initYaku(this._gameConfig.withMultiYakumans);

      if (games.length > 0) {
        // TODO: what if games > 1 ? Now it takes first one
        this._currentSessionHash = games[0].hashcode;
        this._players = games[0].players;
        for (let p of this._players) {
          this._mapIdToPlayer[p.id] = p;
        }

        if (gameConfig.useTimer) {
          initTimer(timerState);
        }

        // Player is now in game, so kick him to overview from watching
        if (this._currentScreen === 'otherTable' || this._currentScreen === 'otherTablesList') {
          this._currentScreen = 'overview';
        }

        this.updateOverview();
      } else {
        // no games! Or game ended just now
        this._reset();
      }

      this._loading.games = false;
    }).catch((e) => {
      if (e.code === 401) { // token has rotten
        window.localStorage.removeItem('authToken');
        this._reset();
        this.reinit();
      } else if (isDevMode()) {
        console.error('Caught error or exception: ', e);
      }
    });
  }

  updateOverview(onReady: (finished?: boolean) => void = (finished) => { }) {
    if (!this._currentSessionHash) {
      return;
    }
    this._loading.overview = true;
    this.api.getGameOverview(this._currentSessionHash)
      .then((overview) => {
        if (overview.state.finished) {
          this._reset();
          this._loading.overview = false;
          this._currentScreen = 'lastResults';
          onReady(true);
          return;
        }

        this._currentRound = overview.state.round;
        this._riichiOnTable = overview.state.riichi;
        this._honba = overview.state.honba;
        this._yellowZoneAlreadyPlayed = overview.state.yellowZoneAlreadyPlayed;
        this._players.forEach((player) => player.score = overview.state.scores[player.id]);
        this._players.forEach((player) => {
          player.penalties = overview.state.penalties[player.id]
            ? parseInt(overview.state.penalties[player.id].toString(), 10)
            : 0;
        });
        this._tableIndex = overview.table_index;
        // explicitly change reference to trigger rerender
        this._players = [this._players[0], this._players[1], this._players[2], this._players[3]];
        this._loading.overview = false;
        onReady();
      })
      .catch((error: RemoteError) => {
        this._loading.overview = false;
        if (error.code === 404) { // TODO on backend
          this._reset();
          onReady(true);
        } else {
          onReady();
        }
      });
  }

  _reset() {
    if (this._currentScreen !== 'otherTable' && this._currentScreen !== 'otherTablesList') {
      // Workaround: reset should not exit watching mode
      this._currentScreen = 'overview';
    }
    this._currentRound = 1;
    this._currentOutcome = null;
    this._players = null;
    this._mapIdToPlayer = {};
    this._riichiOnTable = 0;
    this._honba = 0;
    this._currentSessionHash = null;
    this._multironCurrentWinner = null;
  }

  newGame() {
    switch (this._currentScreen) {
      case 'overview':
        this._currentScreen = 'newGame';
        break;
      default: ;
    }
  }

  showLastResults() {
    switch (this._currentScreen) {
      case 'overview':
        this._currentScreen = 'lastResults';
        break;
      default: ;
    }
  }

  showLastRound() {
    switch (this._currentScreen) {
      case 'overview':
        this._currentScreen = 'lastRound';
        break;
      default: ;
    }
  }

  showOtherTablesList() {
    switch (this._currentScreen) {
      case 'overview':
        this._currentScreen = 'otherTablesList';
        this.updateCurrentGames(); // update games list to prevent players in game from watching games
        break;
      default: ;
    }
  }

  showOtherTable(hash) {
    switch (this._currentScreen) {
      case 'otherTablesList':
        this._currentScreen = 'otherTable';
        this.updateOtherTable(hash);
        break;
      default: ;
    }
  }

  nextScreen() {
    switch (this._currentScreen) {
      case 'overview':
        this._currentScreen = 'outcomeSelect';
        this.updateCurrentGames(); // update state before entering new data to prevent "Wrong round" errors.
        // This still prevents errors when simultaneous submission happens, because two or more players update
        // their data first, and only then add new data. This will lead to error if more than one player enter
        // data simultaneously.
        break;
      case 'outcomeSelect':
        this._currentScreen = 'playersSelect';
        break;
      case 'playersSelect':
        switch (this._currentOutcome.selectedOutcome) {
          case 'ron':
          case 'tsumo':
            this._currentScreen = 'yakuSelect';
            break;
          case 'multiron':
            this._currentScreen = 'yakuSelect';
            break;
          case 'draw':
          case 'abort':
          case 'chombo':
            this._currentScreen = 'confirmation';
            break;
          default: ;
        }
        break;
      case 'yakuSelect':
        switch (this._currentOutcome.selectedOutcome) {
          case 'ron':
          case 'tsumo':
          case 'multiron':
            if (this.winnerHasYakuWithPao()) {
              this._currentScreen = 'paoSelect';
            } else {
              this._currentScreen = 'confirmation';
            }
            break;
          default:
            this._currentScreen = 'confirmation';
        }
        break;
      case 'paoSelect':
        this._currentScreen = 'confirmation';
        break;
      case 'lastResults':
      case 'lastRound':
      case 'confirmation':
        this._currentScreen = 'overview';
        break;
      default: ;
    }
  }

  prevScreen() {
    switch (this._currentScreen) {
      case 'outcomeSelect':
      case 'lastRound':
      case 'otherTablesList':
      case 'newGame':
        this._currentScreen = 'overview';
        break;
      case 'playersSelect':
        this._currentScreen = 'outcomeSelect';
        break;
      case 'yakuSelect':
        this._currentScreen = 'playersSelect';
        break;
      case 'confirmation':
        switch (this._currentOutcome.selectedOutcome) {
          case 'ron':
          case 'tsumo':
          case 'multiron':
            if (this.winnerHasYakuWithPao()) {
              this._currentScreen = 'paoSelect';
            } else {
              this._currentScreen = 'yakuSelect';
            }
            break;
          case 'draw':
          case 'abort':
          case 'chombo':
            this._currentScreen = 'playersSelect';
            break;
          default: ;
        }
        break;
      case 'paoSelect':
        this._currentScreen = 'yakuSelect';
        break;
      case 'otherTable':
        this._currentScreen = 'otherTablesList';
        break;
      default: ;
    }
  }

  getWins(): LWinItem[] {
    switch (this._currentOutcome.selectedOutcome) {
      case 'multiron':
        let wins: LWinItem[] = [];
        for (let i in this._currentOutcome.wins) {
          let v = this._currentOutcome.wins[i];
          wins.push({
            winner: v.winner,
            han: v.han,
            fu: v.fu,
            dora: v.dora,
            paoPlayerId: v.paoPlayerId,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            yaku: v.yaku,
            openHand: v.openHand
          });
        }
        return wins;
      default:
        return [];
    }
  }

  getMultiRonCount() {
    switch (this._currentOutcome.selectedOutcome) {
      case 'multiron':
        return this._currentOutcome.multiRon;
      default:
        return 0;
    }
  }

  selectMultiRonUser(playerId: number) {
    if (this._currentOutcome.selectedOutcome !== 'multiron') {
      return;
    }
    this._multironCurrentWinner = playerId;
  }
  getCurrentMultiRonUser = () => this._multironCurrentWinner;
  getEventTitle = () => {
    if (this.isUniversalWatcher()) {
      return 'Games spectating';
    } else {
      return this._gameConfig && this._gameConfig.eventTitle || 'Loading...';
    }
  };
  getGameConfig = (key) => this._gameConfig && this._gameConfig[key];
  winnerHasYakuWithPao = () => winnerHasYakuWithPao(this._currentOutcome, this._gameConfig);
  getTableIndex = () => this._tableIndex;
  playerName = () => this._currentPlayerDisplayName;
  currentScreen = () => this._currentScreen;
  getOutcome = () => this._currentOutcome && this._currentOutcome.selectedOutcome;
  getHashcode = () => this._currentSessionHash;
  toggleWinner = (p: Player) => toggleWinner(p, this._currentOutcome);
  toggleLoser = (p: Player) => toggleLoser(p, this._currentOutcome);
  togglePao = (p: Player) => togglePao(p, this._currentOutcome, this._gameConfig.yakuWithPao);
  toggleRiichi = (p: Player) => toggleRiichi(p, this._currentOutcome, (y: YakuId) => this.removeYaku(y));
  toggleDeadhand = (p: Player) => toggleDeadhand(p, this._currentOutcome);
  getWinningUsers = () => getWinningUsers(this._currentOutcome, this._mapIdToPlayer);
  getLosingUsers = () => getLosingUsers(this._currentOutcome, this._mapIdToPlayer);
  getPaoUsers = () => getPaoUsers(this._currentOutcome, this._mapIdToPlayer);
  getRiichiUsers = () => getRiichiUsers(this._currentOutcome, this._mapIdToPlayer);
  getDeadhandUsers = () => getDeadhandUsers(this._currentOutcome, this._mapIdToPlayer);
  setHan = (han: number) => setHan(han, this._currentOutcome, this._multironCurrentWinner);
  setFu = (fu: number) => setFu(fu, this._currentOutcome, this._multironCurrentWinner);
  getHan = () => getHanOf(this._multironCurrentWinner, this._currentOutcome);
  getHanOf = (user: number) => getHanOf(user, this._currentOutcome);
  getFu = () => getFuOf(this._multironCurrentWinner, this._currentOutcome);
  getFuOf = (user: number) => getFuOf(user, this._currentOutcome);
  getPossibleFu = () => getPossibleFu(this._currentOutcome, this._multironCurrentWinner);
  setDora = (dora: number) => setDora(dora, this._currentOutcome, this._multironCurrentWinner);
  getDora = () => getDoraOf(this._multironCurrentWinner, this._currentOutcome);
  getDoraOf = (user: number) => getDoraOf(user, this._currentOutcome);
  getUradora = () => 0; // TODO
  getKandora = () => 0; // TODO
  getKanuradora = () => 0; // TODO
  getPlayers = (): Player[] => this._players;
  getRiichi = () => this._riichiOnTable;
  getHonba = () => this._honba;
  getCurrentRound = () => this._currentRound;
  getCurrentPlayerId = () => this._currentPlayerId;
  initBlankOutcome = (outcome: OutcomeType) => this._currentOutcome = initBlankOutcome(this._currentRound, outcome);
  hasYaku = (id: YakuId) => hasYaku(this._currentOutcome, id, this._multironCurrentWinner);
  getRequiredYaku = () => getRequiredYaku(this._currentOutcome, this._multironCurrentWinner);
  getSelectedYaku = () => getSelectedYaku(this._currentOutcome, this._multironCurrentWinner);
  yakumanInYaku = () => yakumanInYaku(this._currentOutcome, this._multironCurrentWinner);
  addYaku = (id: YakuId, bypassChecks: boolean = false): void => addYaku(this._currentOutcome, id, this._multironCurrentWinner, bypassChecks);
  removeYaku = (id: YakuId): void => removeYaku(this._currentOutcome, id, this._multironCurrentWinner);
  getAllowedYaku = (): YakuId[] => getAllowedYaku(this._currentOutcome, this._multironCurrentWinner);
  getTimeRemaining = () => getTimeRemaining();
  getCurrentTimerZone = () => getCurrentTimerZone(this, this._yellowZoneAlreadyPlayed);
  isTimerWaiting = () => timerIsWaiting();

  updateOtherTablesList = () => updateOtherTablesList(this.api, this._loading, (tables) => this._otherTablesList = tables);
  updateOtherTable = (hash: string) => {
    this._currentOtherTableHash = hash;
    getOtherTable(hash, this.api, this._loading, (table) => {
      if (this._currentOtherTable && (
        this._currentOtherTable.state.round !== table.state.round ||
        this._currentOtherTable.state.honba !== table.state.honba ||
        JSON.stringify(this._currentOtherTable.state.penalties) !== JSON.stringify(table.state.penalties)
      )) {
        this.updateOtherTableLastRound(hash);
      }

      this._currentOtherTable = table;
      this._currentOtherTableLastRound = null;
      this._currentOtherTablePlayers = table.players.map<Player>((p) => ({
        id: p.id,
        ident: p.ident,
        alias: p.ident,
        score: table.state.scores[p.id],
        penalties: table.state.penalties[p.id]
          ? parseInt(table.state.penalties[p.id].toString(), 10)
          : 0,
        displayName: p.display_name
      }));
    });
  };
  updateOtherTableLastRound = (hash: string, onReady?: () => void) => getLastRound(this.api, hash, (round) => {
    this._currentOtherTableLastRound = round;
    if (onReady) {
      onReady();
    }
  });
  getOtherTables = () => this._otherTablesList;
  getCurrentOtherTable = () => this._currentOtherTable;
  getCurrentOtherTableHash = () => this._currentOtherTableHash;
  getCurrentOtherTablePlayers = () => this._currentOtherTablePlayers;
  getCurrentOtherTableLastRound = () => this._currentOtherTableLastRound;
}
