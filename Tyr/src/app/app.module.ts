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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { OverviewScreen } from './components/screen-overview';
import { OutcomeSelectScreen } from './components/screen-outcome-select';
import { PlayersSelectScreen } from './components/screen-players-select';
import { YakuSelectScreen } from './components/screen-yaku-select';
import { ConfirmationScreen } from './components/screen-confirmation';
import { NewGameScreen } from './components/screen-new-game';
import { LastResultsScreen } from './components/screen-last-results';
import { LastRoundScreen } from './components/screen-last-round';
import { LoginScreen } from './components/screen-login';
import { OtherTablesListScreen } from './components/screen-other-tables-list';
import { OtherTableScreen } from './components/screen-other-table';

import { UserItemComponent } from './components/element-user-item';
import { YakuItemButtonComponent } from './components/element-yaku-item-button';
import { NavBarComponent } from './components/navbar';
import { ConfirmationSchemeComponent } from './components/element-confirmation-scheme';
import { CustomIconComponent } from './components/element-custom-icon';

import { YakumanPipe } from './helpers/yakuman.pipe';
import { FormatRoundPipe } from './helpers/formatRound.pipe';
import { DefaultsToPipe } from './helpers/defaultsTo.pipe';
import { DescriptionPipe } from './helpers/makeHandDescription.pipe';

import { RiichiApiService } from './services/riichiApi';
import { I18nService } from './services/i18n';

@NgModule({
  declarations: [
    AppComponent,

    OverviewScreen,
    OutcomeSelectScreen,
    PlayersSelectScreen,
    YakuSelectScreen,
    ConfirmationScreen,
    NewGameScreen,
    LastResultsScreen,
    LastRoundScreen,
    OtherTablesListScreen,
    LoginScreen,
    OtherTableScreen,

    UserItemComponent,
    YakuItemButtonComponent,
    NavBarComponent,
    ConfirmationSchemeComponent,
    CustomIconComponent,

    YakumanPipe,
    FormatRoundPipe,
    DefaultsToPipe,
    DescriptionPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    RiichiApiService,
    I18nService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
