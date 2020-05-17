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
import { IAppState } from '../../services/store/interfaces';
import {
  getBottomLeftPayment, getBottomRightPayment,
  getChomboKamicha,
  getChomboSelf,
  getChomboShimocha,
  getChomboToimen, getIfAnyPaymentsOccured, getKamicha, getLeftRightPayment, getPaoKamicha, getPaoSelf,
  getPaoShimocha, getPaoToimen, getRiichiKamicha, getRiichiSelf, getRiichiShimocha, getRiichiToimen,
  getRound, getSeatKamicha, getSeatSelf, getSeatShimocha, getSeatToimen,
  getSelf, getShimocha, getToimen, getTopBottomPayment, getTopLeftPayment, getTopRightPayment, PaymentInfo
} from '../../services/store/selectors/roundPreviewSchemeSelectors';
import { RoundPreviewSchemePurpose } from '../../services/store/selectors/commonSelectors';

@Component({
  selector: 'round-preview-scheme',
  templateUrl: 'template.svg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class RoundPreviewSchemeComponent {
  @Input() state: IAppState;
  @Input() purpose: RoundPreviewSchemePurpose;

  get round(): number { return getRound(this.state, this.purpose); }

  get self(): Player { return getSelf(this.state, this.purpose); }
  get shimocha(): Player { return getShimocha(this.state, this.purpose); }
  get toimen(): Player { return getToimen(this.state, this.purpose); }
  get kamicha(): Player { return getKamicha(this.state, this.purpose); }

  get seatSelf(): string { return getSeatSelf(this.state, this.purpose); }
  get seatShimocha(): string { return getSeatShimocha(this.state, this.purpose); }
  get seatToimen(): string { return getSeatToimen(this.state, this.purpose); }
  get seatKamicha(): string { return getSeatKamicha(this.state, this.purpose); }

  get shimochaChombo(): boolean { return getChomboShimocha(this.state, this.purpose); }
  get toimenChombo(): boolean { return getChomboToimen(this.state, this.purpose); }
  get kamichaChombo(): boolean { return getChomboKamicha(this.state, this.purpose); }
  get selfChombo(): boolean { return getChomboSelf(this.state, this.purpose); }

  get shimochaPao(): boolean { return getPaoShimocha(this.state, this.purpose); }
  get toimenPao(): boolean { return getPaoToimen(this.state, this.purpose); }
  get kamichaPao(): boolean { return getPaoKamicha(this.state, this.purpose); }
  get selfPao(): boolean { return getPaoSelf(this.state, this.purpose); }

  get shimochaRiichi(): boolean { return getRiichiShimocha(this.state, this.purpose); }
  get toimenRiichi(): boolean { return getRiichiToimen(this.state, this.purpose); }
  get kamichaRiichi(): boolean { return getRiichiKamicha(this.state, this.purpose); }
  get selfRiichi(): boolean { return getRiichiSelf(this.state, this.purpose); }

  get topLeftPayment(): PaymentInfo { return getTopLeftPayment(this.state, this.purpose); }
  get topRightPayment(): PaymentInfo { return getTopRightPayment(this.state, this.purpose); }
  get topBottomPayment(): PaymentInfo { return getTopBottomPayment(this.state, this.purpose); }
  get bottomLeftPayment(): PaymentInfo { return getBottomLeftPayment(this.state, this.purpose); }
  get bottomRightPayment(): PaymentInfo { return getBottomRightPayment(this.state, this.purpose); }
  get leftRightPayment(): PaymentInfo { return getLeftRightPayment(this.state, this.purpose); }

  get noPayments(): boolean { return !getIfAnyPaymentsOccured(this.state, this.purpose); }
}
