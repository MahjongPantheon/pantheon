import { Ruleset } from '../rulesets/ruleset.js';

export interface PaymentsInfo {
  direct: Record<string, number>;
  riichi: Record<string, number>;
  honba: Record<string, number>;
}

interface PointsResult {
  winner: number;
  dealer?: number;
  player?: number;
  loser?: number;
}

interface RiichiBetAssignment {
  from_table: number;
  from_players: number[];
  honba: number;
  closest_winner: number;
}

export class PointsCalc {
  private _lastPaymentsInfo: PaymentsInfo = {
    direct: {},
    riichi: {},
    honba: {},
  };

  public resetPaymentsInfo(): void {
    this._lastPaymentsInfo = {
      direct: {},
      riichi: {},
      honba: {},
    };
  }

  public lastPaymentsInfo(): PaymentsInfo {
    return this._lastPaymentsInfo;
  }

  /**
   * Calculate points for Ron (direct win)
   */
  public ron(
    rules: Ruleset,
    isDealer: boolean,
    currentScores: Record<number, number>,
    winnerId: number,
    loserId: number,
    han: number,
    fu: number | null,
    riichiIds: number[],
    honba: number,
    riichiBetsCount: number,
    paoPlayerId: number | null = null,
    closestWinner: number | null = null,
    totalRiichiInRound = 0
  ): Record<number, number> {
    this.resetPaymentsInfo();
    const honbaValue = rules.rules.honbaValue;
    const pointsDiff = this._calcPoints(rules, han, fu, false, isDealer);

    if (!winnerId || !loserId) {
      throw new Error('Ron must have winner and loser');
    }

    const scores = { ...currentScores };

    if (paoPlayerId && paoPlayerId !== loserId) {
      scores[winnerId] += pointsDiff.winner;
      if (pointsDiff.winner === 64000 || pointsDiff.winner === 96000) {
        // in case of double yakuman for dealer or non-dealer, only one yakuman can be counted as pao
        // TODO: this is a workaround, improve it someday to support pao from several players (e.g. daisangen+suukantsu)
        scores[loserId] += Math.floor((3 * (pointsDiff.loser ?? 0)) / 4);
        scores[paoPlayerId] += Math.floor((pointsDiff.loser ?? 0) / 4);
        this._lastPaymentsInfo.direct[`${winnerId}<-${loserId}`] = Math.floor(
          (3 * pointsDiff.winner) / 4
        );
        this._lastPaymentsInfo.direct[`${winnerId}<-${paoPlayerId}`] = Math.floor(
          pointsDiff.winner / 4
        );
      } else {
        scores[loserId] += Math.floor((pointsDiff.loser ?? 0) / 2);
        scores[paoPlayerId] += Math.floor((pointsDiff.loser ?? 0) / 2);
        this._lastPaymentsInfo.direct[`${winnerId}<-${loserId}`] = Math.floor(
          pointsDiff.winner / 2
        );
        this._lastPaymentsInfo.direct[`${winnerId}<-${paoPlayerId}`] = Math.floor(
          pointsDiff.winner / 2
        );
      }
    } else {
      scores[winnerId] += pointsDiff.winner;
      scores[loserId] += pointsDiff.loser ?? 0;
      this._lastPaymentsInfo.direct[`${winnerId}<-${loserId}`] = pointsDiff.winner;
    }

    const riichiIdsArray = riichiIds || [];

    for (const playerId of riichiIdsArray) {
      scores[playerId] -= 1000;
      this._lastPaymentsInfo.riichi[`${winnerId}<-${playerId}`] = 1000;
    }

    // this condition we are checking only for double ron
    if (rules.rules.doubleronRiichiAtamahane && closestWinner) {
      // on tenhou we had to give all riichi bets to closest winner only
      if (closestWinner === winnerId) {
        scores[winnerId] += 1000 * totalRiichiInRound;
        scores[winnerId] += 1000 * riichiBetsCount;
        this._lastPaymentsInfo.riichi[`${winnerId}<-`] = 1000 * riichiBetsCount;
      }
    } else {
      scores[winnerId] += 1000 * riichiIdsArray.length;
      scores[winnerId] += 1000 * riichiBetsCount;
      this._lastPaymentsInfo.riichi[`${winnerId}<-`] = 1000 * riichiBetsCount;
    }

    // this condition we are checking only for double ron
    if (rules.rules.doubleronHonbaAtamahane && closestWinner) {
      // on tenhou we had to give all honba sticks to closest winner only
      if (winnerId === closestWinner) {
        scores[winnerId] += honbaValue * honba;
        scores[loserId] -= honbaValue * honba;
        this._lastPaymentsInfo.honba[`${winnerId}<-${loserId}`] = honbaValue * honba;
      }
    } else {
      scores[winnerId] += honbaValue * honba;
      scores[loserId] -= honbaValue * honba;
      this._lastPaymentsInfo.honba[`${winnerId}<-${loserId}`] = honbaValue * honba;
    }

    return scores;
  }

  /**
   * Calculate points for Tsumo (self-draw win)
   */
  public tsumo(
    rules: Ruleset,
    currentDealer: number,
    currentScores: Record<number, number>,
    winnerId: number,
    han: number,
    fu: number | null,
    riichiIds: number[],
    honba: number,
    riichiBetsCount: number,
    paoPlayerId: number | null = null
  ): Record<number, number> {
    this.resetPaymentsInfo();
    const honbaValue = rules.rules.honbaValue;

    if (!winnerId) {
      throw new Error('Tsumo must have winner');
    }

    if (paoPlayerId) {
      // tsumo pao should be treated as ron
      return this.ron(
        rules,
        currentDealer === winnerId,
        currentScores,
        winnerId,
        paoPlayerId,
        han,
        fu,
        riichiIds,
        honba,
        riichiBetsCount,
        null
      );
    }

    const pointsDiff = this._calcPoints(rules, han, fu, true, currentDealer === winnerId);
    const scores = { ...currentScores };
    scores[winnerId] += pointsDiff.winner;

    if (currentDealer === winnerId) {
      // dealer tsumo
      for (const playerId of Object.keys(scores).map(Number)) {
        if (playerId === winnerId) {
          continue;
        }
        scores[playerId] += pointsDiff.dealer ?? 0;
        this._lastPaymentsInfo.direct[`${winnerId}<-${playerId}`] = -(pointsDiff.dealer ?? 0);
      }
    } else {
      for (const playerId of Object.keys(scores).map(Number)) {
        if (playerId === winnerId) {
          continue;
        }
        if (playerId === currentDealer) {
          scores[playerId] += pointsDiff.dealer ?? 0;
          this._lastPaymentsInfo.direct[`${winnerId}<-${playerId}`] = -(pointsDiff.dealer ?? 0);
        } else {
          scores[playerId] += pointsDiff.player ?? 0;
          this._lastPaymentsInfo.direct[`${winnerId}<-${playerId}`] = -(pointsDiff.player ?? 0);
        }
      }
    }

    const riichiIdsArray = riichiIds || [];

    for (const playerId of riichiIdsArray) {
      scores[playerId] -= 1000;
      this._lastPaymentsInfo.riichi[`${winnerId}<-${playerId}`] = 1000;
    }

    scores[winnerId] += 1000 * riichiIdsArray.length;
    scores[winnerId] += 1000 * riichiBetsCount;
    this._lastPaymentsInfo.riichi[`${winnerId}<-`] = 1000 * riichiBetsCount;
    scores[winnerId] += honbaValue * honba;

    for (const playerId of Object.keys(scores).map(Number)) {
      if (playerId === winnerId) {
        continue;
      }
      scores[playerId] -= Math.floor((honbaValue / 3) * honba);
      this._lastPaymentsInfo.honba[`${winnerId}<-${playerId}`] = Math.floor(
        (honbaValue / 3) * honba
      );
    }

    return scores;
  }

  /**
   * Calculate points for draw (no winner)
   */
  public draw(
    currentScores: Record<number, number>,
    tempaiIds: number[],
    riichiIds: number[]
  ): Record<number, number> {
    this.resetPaymentsInfo();
    const riichiIdsArray = riichiIds || [];
    const scores = { ...currentScores };

    for (const playerId of riichiIdsArray) {
      scores[playerId] -= 1000;
      this._lastPaymentsInfo.riichi[`<-${playerId}`] = 1000;
    }

    if (tempaiIds.length === 0 || tempaiIds.length === 4) {
      return scores;
    }

    if (tempaiIds.length === 1) {
      for (const playerId of Object.keys(scores).map(Number)) {
        if (playerId === tempaiIds[0]) {
          scores[playerId] += 3000;
        } else {
          scores[playerId] -= 1000;
          this._lastPaymentsInfo.direct[`${tempaiIds[0]}<-${playerId}`] = 1000;
        }
      }
      return scores;
    }

    if (tempaiIds.length === 2) {
      let i = 0;
      for (const playerId of Object.keys(scores).map(Number)) {
        if (tempaiIds.includes(playerId)) {
          scores[playerId] += 1500;
        } else {
          scores[playerId] -= 1500;
          this._lastPaymentsInfo.direct[`${tempaiIds[i++]}<-${playerId}`] = 1500;
        }
      }
      return scores;
    }

    if (tempaiIds.length === 3) {
      for (const playerId of Object.keys(scores).map(Number)) {
        if (tempaiIds.includes(playerId)) {
          scores[playerId] += 1000;
        } else {
          scores[playerId] -= 3000;
          this._lastPaymentsInfo.direct[`${tempaiIds[0]}<-${playerId}`] = 1000;
          this._lastPaymentsInfo.direct[`${tempaiIds[1]}<-${playerId}`] = 1000;
          this._lastPaymentsInfo.direct[`${tempaiIds[2]}<-${playerId}`] = 1000;
        }
      }
      return scores;
    }

    throw new Error('More than 4 players tempai? o_0');
  }

  /**
   * Calculate points for aborted round
   */
  public abort(currentScores: Record<number, number>, riichiIds: number[]): Record<number, number> {
    this.resetPaymentsInfo();
    const riichiIdsArray = riichiIds || [];
    const scores = { ...currentScores };

    for (const playerId of riichiIdsArray) {
      scores[playerId] -= 1000;
      this._lastPaymentsInfo.riichi[`<-${playerId}`] = 1000;
    }

    return scores;
  }

  /**
   * Calculate points for chombo (penalty)
   */
  public chombo(
    rules: Ruleset,
    currentDealer: number,
    loserId: number,
    currentScores: Record<number, number>
  ): Record<number, number> {
    this.resetPaymentsInfo();
    if (!loserId) {
      throw new Error('Chombo must have loser');
    }

    const scores = { ...currentScores };

    if (rules.rules.extraChomboPayments) {
      if (currentDealer === loserId) {
        for (const playerId of Object.keys(scores).map(Number)) {
          if (playerId === loserId) {
            scores[playerId] -= 12000;
          } else {
            scores[playerId] += 4000;
          }
        }
      } else {
        for (const playerId of Object.keys(scores).map(Number)) {
          if (playerId === loserId) {
            scores[playerId] -= 8000;
          } else if (playerId === currentDealer) {
            scores[playerId] += 4000;
          } else {
            scores[playerId] += 2000;
          }
        }
      }
    }

    return scores;
  }

  /**
   * Calculate points for nagashi mangan
   */
  public nagashi(
    currentScores: Record<number, number>,
    currentDealer: number | string,
    riichiIds: number[],
    nagashiIds: number[]
  ): Record<number, number> {
    this.resetPaymentsInfo();
    const riichiIdsArray = riichiIds || [];
    const scores = { ...currentScores };

    for (const playerId of riichiIdsArray) {
      scores[playerId] -= 1000;
      this._lastPaymentsInfo.riichi[`<-${playerId}`] = 1000;
    }

    if (nagashiIds.length > 3) {
      throw new Error('More than 3 players have nagashi');
    }

    for (const nagashiOwnerId of nagashiIds) {
      for (const playerId of Object.keys(scores).map(Number)) {
        if (playerId === nagashiOwnerId) {
          if (currentDealer == playerId) {
            scores[playerId] += 12000;
          } else {
            scores[playerId] += 8000;
          }
        } else {
          if (currentDealer == nagashiOwnerId || currentDealer == playerId) {
            scores[playerId] -= 4000;
            this._lastPaymentsInfo.direct[`${nagashiOwnerId}<-${playerId}`] = 4000;
          } else {
            scores[playerId] -= 2000;
            this._lastPaymentsInfo.direct[`${nagashiOwnerId}<-${playerId}`] = 2000;
          }
        }
      }
    }

    return scores;
  }

  /**
   * Calculate basic points based on han and fu
   */
  protected _calcPoints(
    rules: Ruleset,
    han: number,
    fu: number | null,
    tsumo: boolean,
    dealer: boolean
  ): PointsResult {
    let rounded: number;
    let doubleRounded: number;
    let timesFourRounded: number;
    let timesSixRounded: number;

    if (han > 0 && han < 5) {
      const basePoints = (fu ?? 0) * Math.pow(2, 2 + han);
      rounded = Math.ceil(basePoints / 100) * 100;
      doubleRounded = Math.ceil((2 * basePoints) / 100) * 100;
      timesFourRounded = Math.ceil((4 * basePoints) / 100) * 100;
      timesSixRounded = Math.ceil((6 * basePoints) / 100) * 100;

      const isKiriage =
        rules.rules.withKiriageMangan && ((han === 4 && fu === 30) || (han === 3 && fu === 60));

      // mangan
      if (basePoints >= 2000 || isKiriage) {
        rounded = 2000;
        doubleRounded = rounded * 2;
        timesFourRounded = doubleRounded * 2;
        timesSixRounded = doubleRounded * 3;
      }
    } else {
      // limits
      if (han < 0) {
        // natural yakuman
        rounded = Math.abs(han * 8000);
      } else if (rules.rules.withKazoe && han >= 13) {
        // kazoe yakuman
        rounded = 8000;
      } else if (han >= 11) {
        // sanbaiman
        rounded = 6000;
      } else if (han >= 8) {
        // baiman
        rounded = 4000;
      } else if (han >= 6) {
        // haneman
        rounded = 3000;
      } else {
        rounded = 2000;
      }
      doubleRounded = rounded * 2;
      timesFourRounded = doubleRounded * 2;
      timesSixRounded = doubleRounded * 3;
    }

    if (tsumo) {
      return {
        winner: dealer ? Math.floor(3 * doubleRounded) : Math.floor(doubleRounded + 2 * rounded),
        dealer: -doubleRounded,
        player: -rounded,
      };
    } else {
      return {
        winner: dealer ? timesSixRounded : timesFourRounded,
        loser: dealer ? -timesSixRounded : -timesFourRounded,
      };
    }
  }

  /**
   * Assign riichi bets to winners
   */
  public assignRiichiBets(
    winnerIds: number[],
    riichiIds: number[],
    loserId: number,
    riichiBets: number, // count on the table
    honba: number,
    playerIds: number[] // ordered by e-s-w-n
  ): Record<number, RiichiBetAssignment> {
    const winners: Record<number, number[]> = {};

    // initialize the list
    for (const playerId of playerIds) {
      if (winnerIds.includes(playerId)) {
        winners[playerId] = [];
      }
    }

    // fill with own bets
    for (const winnerId of winnerIds) {
      if (riichiIds.includes(winnerId)) {
        winners[winnerId].push(winnerId); // winner always gets back his bet
        riichiIds.splice(riichiIds.indexOf(winnerId), 1);
      }
    }

    // Find player who gets non-winning riichi bets
    // First we double the array to form a ring to simplify traversal
    // Then we find winner closest to current loser - he'll get all riichi (like with atamahane rule).
    const playersRing = [...playerIds, ...playerIds];
    let closestWinner: number | null = null;

    for (let i = 0; i < playersRing.length; i++) {
      if (loserId === playersRing[i]) {
        for (let j = i + 1; j < playersRing.length; j++) {
          if (winners[playersRing[j]] !== undefined) {
            closestWinner = playersRing[j];
            break;
          }
        }
        break;
      }
    }

    if (!closestWinner) {
      throw new Error('No closest winner was found when calculation riichi bets assignment');
    }

    winners[closestWinner] = [...(winners[closestWinner] || []), ...riichiIds];

    // assign riichi counts, add riichi on table for first (closest) winner
    const result: Record<number, RiichiBetAssignment> = {};
    for (const [id, playerBets] of Object.entries(winners)) {
      const playerId = Number(id);
      result[playerId] = {
        from_table: playerId === closestWinner ? riichiBets : 0,
        from_players: playerBets,
        honba: honba,
        closest_winner: closestWinner,
      };
    }

    return result;
  }
}
