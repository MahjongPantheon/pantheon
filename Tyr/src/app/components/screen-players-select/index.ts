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

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MetrikaService } from '../../services/metrika';
import { Player } from '../../interfaces/common';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import {
  AppActionTypes,
  TOGGLE_DEADHAND,
  TOGGLE_LOSER, TOGGLE_NAGASHI, TOGGLE_PAO,
  TOGGLE_RIICHI,
  TOGGLE_WINNER
} from '../../services/store/actions/interfaces';
import { getSelf, getShimocha, getToimen, getKamicha } from '../../services/store/selectors/roundPreviewSchemeSelectors';

@Component({
  selector: 'screen-players-select',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class PlayersSelectScreenComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  constructor(private metrika: MetrikaService) { }

  get self(): Player { return getSelf(this.state, 'overview'); }
  get shimocha(): Player { return getShimocha(this.state, 'overview'); }
  get toimen(): Player { return getToimen(this.state, 'overview'); }
  get kamicha(): Player { return getKamicha(this.state, 'overview'); }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-players-select' });
  }

  handle([player, what]: [Player, 'win' | 'lose' | 'riichi' | 'dead' | 'pao' | 'nagashi']) {
    switch (what) {
      case 'win':
        this.dispatch({ type: TOGGLE_WINNER, payload: player.id });
        break;
      case 'lose':
        this.dispatch({ type: TOGGLE_LOSER, payload: player.id });
        break;
      case 'riichi':
        this.dispatch({ type: TOGGLE_RIICHI, payload: player.id });
        break;
      case 'dead':
        this.dispatch({ type: TOGGLE_DEADHAND, payload: player.id });
        break;
      case 'pao':
        this.dispatch({ type: TOGGLE_PAO, payload: { id: player.id, yakuWithPao: this.state.gameConfig.yakuWithPao } });
        break;
      case 'nagashi':
        this.dispatch({ type: TOGGLE_NAGASHI, payload: player.id });
        break;
    }
  }
}

