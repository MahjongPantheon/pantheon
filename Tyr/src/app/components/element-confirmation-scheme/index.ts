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

import { Component, Input } from '@angular/core';
import { Player } from '../../interfaces/common';
import { AppState } from '../../primitives/appstate';
import { RRoundPaymentsInfo } from '../../interfaces/remote';

export type PaymentInfo = {
  backward: boolean;
  title: string;
  riichi: boolean;
};

@Component({
  selector: 'confirmation-scheme',
  templateUrl: 'template.svg.html',
  styleUrls: ['style.css']
})
export class ConfirmationSchemeComponent {
  @Input() players: Player[];
  @Input() currentPlayerId: number;
  @Input() overview: RRoundPaymentsInfo;

  get round(): number {
    return this.overview.round;
  }

  self: Player;
  shimocha: Player;
  toimen: Player;
  kamicha: Player;
  seatSelf: string;
  seatShimocha: string;
  seatToimen: string;
  seatKamicha: string;

  shimochaChombo: boolean = false;
  toimenChombo: boolean = false;
  kamichaChombo: boolean = false;
  selfChombo: boolean = false;

  shimochaPao: boolean = false;
  toimenPao: boolean = false;
  kamichaPao: boolean = false;
  selfPao: boolean = false;

  shimochaRiichi: boolean = false;
  toimenRiichi: boolean = false;
  kamichaRiichi: boolean = false;
  selfRiichi: boolean = false;

  topLeftPayment?: PaymentInfo;
  topRightPayment?: PaymentInfo;
  topBottomPayment?: PaymentInfo;
  bottomLeftPayment?: PaymentInfo;
  bottomRightPayment?: PaymentInfo;
  leftRightPayment?: PaymentInfo;
  noPayments: boolean = true;

  ngOnInit() {
    let seating = ['東', '南', '西', '北'];
    for (let i = 1; i < this.overview.round; i++) {
      seating = [seating.pop()].concat(seating);
    }

    let players: Player[] = [].concat(this.players);
    const current = this.currentPlayerId;

    for (var roundOffset = 0; roundOffset < 4; roundOffset++) {
      if (players[0].id === current) {
        break;
      }

      players = players.slice(1).concat(players[0]);
      seating = seating.slice(1).concat(seating[0]);
    }

    this.self = players[0];
    this.shimocha = players[1];
    this.toimen = players[2];
    this.kamicha = players[3];

    this.seatSelf = seating[0];
    this.seatShimocha = seating[1];
    this.seatToimen = seating[2];
    this.seatKamicha = seating[3];

    this.updatePayments(roundOffset);

    // update riichi
    this.overview.riichiIds
      .map((id: string) => parseInt(id, 10)) // TODO: get it out to formatters
      .map((id: number) => {
        switch (id) {
          case this.self.id:
            this.selfRiichi = true;
            break;
          case this.toimen.id:
            this.toimenRiichi = true;
            break;
          case this.shimocha.id:
            this.shimochaRiichi = true;
            break;
          case this.kamicha.id:
            this.kamichaRiichi = true;
            break;
        }
      });

    // update chombo
    if (this.overview.outcome === 'chombo') {
      switch (this.overview.penaltyFor) {
        case this.self.id:
          this.selfChombo = true;
          break;
        case this.kamicha.id:
          this.kamichaChombo = true;
          break;
        case this.toimen.id:
          this.toimenChombo = true;
          break;
        case this.shimocha.id:
          this.shimochaChombo = true;
          break;
      }
    }

    // update pao
    if (['ron', 'tsumo', 'multiron'].indexOf(this.overview.outcome) !== -1) {
      switch (this.overview.paoPlayer) {
        case this.self.id:
          this.selfPao = true;
          break;
        case this.kamicha.id:
          this.kamichaPao = true;
          break;
        case this.toimen.id:
          this.toimenPao = true;
          break;
        case this.shimocha.id:
          this.shimochaPao = true;
          break;
      }
    }
  }

  _getPayment(player1: Player, player2: Player) {
    const p = this.overview.payments;
    const directPayment12 = p.direct && p.direct[player2.id + '<-' + player1.id] || 0;
    const directPayment21 = p.direct && p.direct[player1.id + '<-' + player2.id] || 0;
    const riichiPayment12 = p.riichi && p.riichi[player2.id + '<-' + player1.id] || 0;
    const riichiPayment21 = p.riichi && p.riichi[player1.id + '<-' + player2.id] || 0;
    const honbaPayment12 = p.honba && p.honba[player2.id + '<-' + player1.id] || 0;
    const honbaPayment21 = p.honba && p.honba[player1.id + '<-' + player2.id] || 0;

    let direction;
    
    //multiple nagashi
    if (directPayment12==directPayment21 && directPayment12!=0) {      
      return null;
    }

    if (directPayment12 + riichiPayment12 > 0) {
      return {
        backward: false,
        riichi: riichiPayment12 > 0,
        title: [directPayment12, honbaPayment12]
          .filter(e => !!e)
          .join(' + ')
      };
    } else if (directPayment21 + riichiPayment21 > 0) {
      return {
        backward: true,
        riichi: riichiPayment21 > 0,
        title: [directPayment21, honbaPayment21]
          .filter(e => !!e)
          .join(' + ')
      };
    } else {
      return null;
    }
  }

  updatePayments(offset) {
    this.topLeftPayment = this._getPayment(this.toimen, this.kamicha);
    this.topRightPayment = this._getPayment(this.toimen, this.shimocha);
    this.topBottomPayment = this._getPayment(this.toimen, this.self);
    this.bottomLeftPayment = this._getPayment(this.self, this.kamicha);
    this.bottomRightPayment = this._getPayment(this.self, this.shimocha);
    this.leftRightPayment = this._getPayment(this.kamicha, this.shimocha);
    this.noPayments
      = !this.topLeftPayment
      && !this.topRightPayment
      && !this.topBottomPayment
      && !this.bottomLeftPayment
      && !this.bottomLeftPayment
      && !this.leftRightPayment
      ;
  }
}
