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

import { I18nService } from '../../services/i18n';
export { I18nService } from '../../services/i18n';

export class I18nComponent {
  constructor(public i18n: I18nService) { }
  get _NO_RIICHI() {
    return this.i18n._t('no riichi');
  }
  get _FOR_YAKU() {
    return this.i18n._t('Yaku');
  }
  get _FOR_DORA() {
    return this.i18n._t('Dora');
  }
  get _FU() {
    return this.i18n._t('Fu');
  }
  get _SETTINGS() {
    return this.i18n._t('Settings');
  }
  get _LAST_RESULTS() {
    return this.i18n._t('Latest results');
  }
  get _PREVIOUS_HAND() {
    return this.i18n._t('Previous hand');
  }
  get _LOGIN() {
    return this.i18n._t('Login');
  }
  get _SELECT_PAO() {
    return this.i18n._t('Yakuman: select pao');
  }
  get _OTHER_TABLES() {
    return this.i18n._t('Other playing tables');
  }
  get _TABLE_VIEW() {
    return this.i18n._t('View table');
  }
  get _OK() {
    return this.i18n._t('OK');
  }
  get _ALL_CHECKED() {
    return this.i18n._t('Looks fine');
  }
  get _SAVE() {
    return this.i18n._t('Save');
  }
  get _NO_GAMES_PLAYED() {
    return this.i18n._t('There\'s no games you\'ve already played.');
  }
  get _LOGIN_FAILED_REASONS_ARE() {
    return this.i18n._t('Login attempt has failed. Possible reasons are:');
  }
  get _TOURN_GAMES_ALREADY_STARTED() {
    return this.i18n._t('Tournament games already started and you wasn\'t registered');
  }
  get _PIN_ALREADY_USED() {
    return this.i18n._t('Pin code was already used on another device');
  }
  get _UNEXPECTED_ERROR() {
    return this.i18n._t('Unexpected server error');
  }
  get _CONTACT_ADMINISTRATOR() {
    return this.i18n._t('Contact to the tournament administrator for further instructions.');
  }
  get _ENTER_PIN() {
    return this.i18n._t('Enter pin code');
  }
  get _TENPAI() {
    return this.i18n._t('Tenpai: ');
  }
  get _NOTEN() {
    return this.i18n._t('Noten: ');
  }
  get _NO_TABLES_PLAYING_NOW() {
    return this.i18n._t('There are no tables playing right now');
  }
  get _ABORTIVE() {
    return this.i18n._t('Abortive draw');
  }
  get _CHOMBO() {
    return this.i18n._t('Chombo');
  }
  get _EXHAUSTIVE() {
    return this.i18n._t('Exhaustive draw');
  }
  get _RON() {
    return this.i18n._t('Ron');
  }
  get _TSUMO() {
    return this.i18n._t('Tsumo');
  }
  get _DOUBLE_OR_TRIPLE_RON() {
    return this.i18n._t('Double/Triple ron');
  }
  get _NAGASHI_MANGAN() {
    return this.i18n._t('Nagashi mangan');
  }
  get _TIMER_NOT_STARTED() {
    return this.i18n._t('Timer was not started yet. Unable to add a hand.');
  }
  get _NO_YOUR_GAMES_NOW() {
    return this.i18n._t('There are no games you participate in right now.');
  }
  get _REFRESH_PAGE() {
    return this.i18n._t('Refresh');
  }
  get _UPDATE_MESSAGE() {
    return this.i18n._t('Pantheon v1 shutdown');
  }
  get _PREV_GAME_RESULTS() {
    return this.i18n._t('Previous game results');
  }
  get _NEW_GAME() {
    return this.i18n._t('New game');
  }
  get _STATISTICS() {
    return this.i18n._t('Statistics');
  }
  get _TABLE_NUM() {
    return this.i18n._t('Table #');
  }
  get _SELECT_LANGUAGE() {
    return this.i18n._t('Select preferred language');
  }
  get _SELECT_THEME() {
    return this.i18n._t('Select preferred color scheme');
  }
  get _LOGOUT() {
    return this.i18n._t('Log out from system');
  }
  get _USER_ACTIONS() {
    return this.i18n._t('User actions');
  }
  get _TOTAL() {
    return this.i18n._t('Total: ');
  }
  get _TOTAL_HAN() {
    return this.i18n._t(' han');
  }
  get _TOTAL_FU() {
    return this.i18n._t(' fu');
  }
  get _TOTAL_YAKUMAN() {
    return this.i18n._t('Yakuman!');
  }
  get _LOADING_VIDEO() {
    return this.i18n._t('Loading capturing tools...');
  }
  get _HELP() {
    return this.i18n._t('Help and news');
  }
  get _HELP_CREDITS() {
    return this.i18n._t('Useful links');
  }
  get _HELP_ANNOUNCES() {
    return this.i18n._t('News & announces');
  }
  get _HELP_CONTENTS_SITE() {
    return this.i18n._t('Description for whole Pantheon system is available at:');
  }
  get _HELP_CONTENTS_EMAIL() {
    return this.i18n._t('If in doubt, please email lead developer to get help:');
  }
  get _HELP_CONTENTS_TG() {
    return this.i18n._t('Russian-speaking support and announces also available at Telegram group:');
  }
}
