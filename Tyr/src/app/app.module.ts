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
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { OverviewScreenComponent } from './components/screen-overview';
import { OutcomeSelectScreenComponent } from './components/screen-outcome-select';
import { PlayersSelectScreenComponent } from './components/screen-players-select';
import { YakuSelectScreenComponent } from './components/screen-yaku-select';
import { ConfirmationScreenComponent } from './components/screen-confirmation';
import { NewGameScreenComponent } from './components/screen-new-game';
import { LastResultsScreenComponent } from './components/screen-last-results';
import { LastRoundScreenComponent } from './components/screen-last-round';
import { LoginScreenComponent } from './components/screen-login';
import { OtherTablesListScreenComponent } from './components/screen-other-tables-list';
import { OtherTableScreenComponent } from './components/screen-other-table';
import { SettingsScreenComponent } from './components/screen-settings';

import { UserItemComponent } from './components/element-user-item';
import { YakuItemButtonComponent } from './components/element-yaku-item-button';
import { NavBarComponent } from './components/navbar';
import { RoundPreviewSchemeComponent } from './components/element-round-preview-scheme';
import { CustomIconComponent } from './components/element-custom-icon';

import { YakumanPipe } from './helpers/yakuman.pipe';
import { FormatRoundPipe } from './helpers/formatRound.pipe';
import { DefaultsToPipe } from './helpers/defaultsTo.pipe';
import { DescriptionPipe } from './helpers/makeHandDescription.pipe';

import { RiichiApiService } from './services/riichiApi';
import { MetrikaService } from './services/metrika';
import { I18nService } from './services/i18n';
import { IDB } from './services/idb';
import { ThemeModule } from './services/themes/module';
import { defaultTheme } from './themes/default';
import { seaWaveTheme } from './themes/seaWaveTheme';
import { pinkPantherTheme } from './themes/pinkPantherTheme';
import { darkBlueTheme } from './themes/darkBlue';
import { classicDarkTheme } from './themes/classicDark';
import { classicLightTheme } from './themes/classicLight';
import { QrService } from './services/qr';

@NgModule({
  declarations: [
    AppComponent,

    OverviewScreenComponent,
    OutcomeSelectScreenComponent,
    PlayersSelectScreenComponent,
    YakuSelectScreenComponent,
    ConfirmationScreenComponent,
    NewGameScreenComponent,
    LastResultsScreenComponent,
    LastRoundScreenComponent,
    OtherTablesListScreenComponent,
    LoginScreenComponent,
    OtherTableScreenComponent,
    SettingsScreenComponent,

    UserItemComponent,
    YakuItemButtonComponent,
    NavBarComponent,
    RoundPreviewSchemeComponent,
    CustomIconComponent,

    YakumanPipe,
    FormatRoundPipe,
    DefaultsToPipe,
    DescriptionPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ThemeModule.forRoot({
      themes: [defaultTheme, seaWaveTheme, pinkPantherTheme, darkBlueTheme, classicDarkTheme, classicLightTheme],
      active: 'defaultTheme'
    })
  ],
  providers: [
    RiichiApiService,
    I18nService,
    MetrikaService,
    QrService,
    IDB
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
