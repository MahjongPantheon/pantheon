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

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Player } from '../../interfaces/common';
import { IAppState } from "../../services/store/interfaces";
import {
  getBottomLeftPayment, getBottomRightPayment,
  getChomboKamicha,
  getChomboSelf,
  getChomboShimocha,
  getChomboToimen, getIfAnyPaymentsOccured, getKamicha, getLeftRightPayment, getPaoKamicha, getPaoSelf,
  getPaoShimocha, getPaoToimen, getRiichiKamicha, getRiichiSelf, getRiichiShimocha, getRiichiToimen,
  getRound, getSeatKamicha, getSeatSelf, getSeatShimocha, getSeatToimen,
  getSelf, getShimocha, getToimen, getTopBottomPayment, getTopLeftPayment, getTopRightPayment, PaymentInfo
} from "../../services/store/selectors/confirmationSchemeSelectors";
import { RRoundPaymentsInfo } from "../../interfaces/remote";

@Component({
  selector: 'confirmation-scheme',
  templateUrl: 'template.svg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class ConfirmationSchemeComponent {
  @Input() state: IAppState;

  // this is also contained in state, BUT! there are more than one
  // and we can choose what exactly overview do we want to render.
  @Input() overview: RRoundPaymentsInfo;

  get round(): number { return getRound(this.state); }

  get self(): Player { return getSelf(this.state, this.overview); }
  get shimocha(): Player { return getShimocha(this.state, this.overview); }
  get toimen(): Player { return getToimen(this.state, this.overview); }
  get kamicha(): Player { return getKamicha(this.state, this.overview); }

  get seatSelf(): string { return getSeatSelf(this.state, this.overview); }
  get seatShimocha(): string { return getSeatShimocha(this.state, this.overview); }
  get seatToimen(): string { return getSeatToimen(this.state, this.overview); }
  get seatKamicha(): string { return getSeatKamicha(this.state, this.overview); }

  get shimochaChombo(): boolean { return getChomboShimocha(this.state, this.overview); }
  get toimenChombo(): boolean { return getChomboToimen(this.state, this.overview); }
  get kamichaChombo(): boolean { return getChomboKamicha(this.state, this.overview); }
  get selfChombo(): boolean { return getChomboSelf(this.state, this.overview); }

  get shimochaPao(): boolean { return getPaoShimocha(this.state, this.overview); }
  get toimenPao(): boolean { return getPaoToimen(this.state, this.overview); }
  get kamichaPao(): boolean { return getPaoKamicha(this.state, this.overview); }
  get selfPao(): boolean { return getPaoSelf(this.state, this.overview); }

  get shimochaRiichi(): boolean { return getRiichiShimocha(this.state, this.overview); }
  get toimenRiichi(): boolean { return getRiichiToimen(this.state, this.overview); }
  get kamichaRiichi(): boolean { return getRiichiKamicha(this.state, this.overview); }
  get selfRiichi(): boolean { return getRiichiSelf(this.state, this.overview); }

  get topLeftPayment(): PaymentInfo { return getTopLeftPayment(this.state, this.overview); }
  get topRightPayment(): PaymentInfo { return getTopRightPayment(this.state, this.overview); }
  get topBottomPayment(): PaymentInfo { return getTopBottomPayment(this.state, this.overview); }
  get bottomLeftPayment(): PaymentInfo { return getBottomLeftPayment(this.state, this.overview); }
  get bottomRightPayment(): PaymentInfo { return getBottomRightPayment(this.state, this.overview); }
  get leftRightPayment(): PaymentInfo { return getLeftRightPayment(this.state, this.overview); }

  get noPayments(): boolean { return !getIfAnyPaymentsOccured(this.state, this.overview); }
}
