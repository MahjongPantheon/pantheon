import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { PaymentsInfo, PointsCalc } from '../../helpers/PointsCalc.js';
import { RoundEntity } from '../db/Round.entity.js';
import { RulesetEntity } from '../db/Ruleset.entity.js';
import { SessionStateEntity } from '../db/SessionState.entity.js';

export class SessionState {
  protected _ruleset: RulesetEntity;
  protected _state: SessionStateEntity;

  constructor(ruleset: RulesetEntity, playersIds: number[]) {
    this._ruleset = ruleset;
    this._state = new SessionStateEntity();

    if (playersIds.length !== 4) {
      throw new Error(`Players count is not 4: ${JSON.stringify(playersIds)}`);
    }

    const startPoints = ruleset.rules.startPoints;
    this._state.scores = {};
    playersIds.forEach((playerId) => {
      this._state.scores[playerId] = startPoints;
    });
    this._state.playerIds = playersIds;
  }

  protected _tobi(): boolean {
    const scores = Object.values(this.getScores());
    return scores.some((score) => score < 0);
  }

  protected _dealerIsLeaderOnOorasu(): boolean {
    if (this._state.lastOutcome === 'chombo' || this._state.lastOutcome === 'abort') {
      return false; // chombo or abortive draw should not finish game
    }

    if (this._state.roundJustChanged) {
      return false; // should play last round at least once!
    }

    const maxRound = this._ruleset.rules.tonpuusen ? 4 : 8;
    if (this.getRound() !== maxRound) {
      return false; // not oorasu
    }

    const scores = Object.values(this.getScores());
    const dealerScores = scores[scores.length - 1];
    const maxScore = Math.max(...scores);
    return dealerScores === maxScore && dealerScores >= this._ruleset.rules.goalPoints;
  }

  protected _lastPossibleRoundWasPlayed(): boolean {
    const roundsCount = this._ruleset.rules.tonpuusen ? 4 : 8;

    if (this.getRound() <= roundsCount) {
      return false;
    }

    if (this._state.lastOutcome === 'chombo') {
      return false; // chombo should not finish game
    }

    const additionalRounds = this._ruleset.rules.playAdditionalRounds ? 4 : 0;
    const maxPossibleRound = roundsCount + additionalRounds;
    if (this.getRound() > maxPossibleRound) {
      return true;
    }

    const scores = Object.values(this.getScores());
    return Math.max(...scores) >= this._ruleset.rules.goalPoints;
  }

  /**
   * End game prematurely
   */
  public forceFinish(): SessionState {
    this._state.prematurelyFinished = true;
    return this;
  }

  public isFinished(): boolean {
    return (
      this._lastPossibleRoundWasPlayed() ||
      this._state.prematurelyFinished ||
      (this._ruleset.rules.withButtobi && this._tobi()) ||
      (this._ruleset.rules.withLeadingDealerGameOver && this._dealerIsLeaderOnOorasu())
    );
  }

  protected _addHonba(): SessionState {
    this._state.honba++;
    return this;
  }

  protected _resetHonba(): SessionState {
    this._state.honba = 0;
    return this;
  }

  public getHonba(): number {
    return this._state.honba;
  }

  protected _addRiichiBets(riichiBets: number): SessionState {
    this._state.riichiBets += riichiBets;
    return this;
  }

  protected _resetRiichiBets(): SessionState {
    this._state.riichiBets = 0;
    return this;
  }

  public getRiichiBets(): number {
    return this._state.riichiBets;
  }

  protected _nextRound(): SessionState {
    this._state.round++;
    return this;
  }

  public getRound(): number {
    return this._state.round;
  }

  public getScores(): Record<number, number> {
    return this._state.scores;
  }

  public setScores(scores: Record<number, number>): SessionState {
    this._state.scores = scores;
    return this;
  }

  public getReplacements(): Record<number, number> {
    return this._state.replacements;
  }

  public setReplacements(replacements: Record<number, number>): SessionState {
    this._state.replacements = replacements;
    return this;
  }

  public getYakitori(): Record<number, boolean> {
    return this._state.yakitori;
  }

  public setYakitori(yakitori: Record<number, boolean>): SessionState {
    this._state.yakitori = yakitori;
    return this;
  }

  public getChips(): Record<number, number> {
    return this._state.chips;
  }

  public setChips(chips: Record<number, number>): SessionState {
    this._state.chips = chips;
    return this;
  }

  public getChombo(): Record<number, number> {
    return this._state.chombo;
  }

  /**
   * Return id of current dealer
   */
  public getCurrentDealer(): number {
    const players = Object.keys(this._state.scores).map(Number);
    return players[(this._state.round - 1) % 4];
  }

  /**
   * Register new round in current session
   */
  public update(round: RoundEntity): PaymentsInfo {
    const lastRoundIndex = this.getRound();
    let payments: PaymentsInfo;

    switch (round.outcome) {
      case RoundOutcome.ROUND_OUTCOME_RON:
        payments = this._updateAfterRon(round);
        break;
      case RoundOutcome.ROUND_OUTCOME_MULTIRON:
        payments = this._updateAfterMultiRon(round, this._state.playerIds);
        break;
      case RoundOutcome.ROUND_OUTCOME_TSUMO:
        payments = this._updateAfterTsumo(round);
        break;
      case RoundOutcome.ROUND_OUTCOME_DRAW:
        payments = this._updateAfterDraw(round);
        break;
      case RoundOutcome.ROUND_OUTCOME_ABORT:
        payments = this._updateAfterAbort(round);
        break;
      case RoundOutcome.ROUND_OUTCOME_CHOMBO:
        payments = this._updateAfterChombo(round);
        break;
      case RoundOutcome.ROUND_OUTCOME_NAGASHI:
        payments = this._updateAfterNagashi(round);
        break;
      case RoundOutcome.ROUND_OUTCOME_UNSPECIFIED:
      default:
        throw new Error('wrong outcome passed');
    }

    this._updateYakitori(round);
    this._state.roundJustChanged = lastRoundIndex !== this.getRound();
    this._state.lastOutcome = round.outcome;
    return payments; // for dry run
  }

  /**
   * @param id - player id
   * @param betAmount - total points amount gathered as riichi bets. May be fractional (of 1000)!
   */
  public giveRiichiBetsToPlayer(id: number | null, betAmount: number): void {
    if (id !== null) {
      this._state.scores[id] += betAmount;
    }
  }

  protected _updateAfterRon(round: RoundEntity): PaymentsInfo {
    const winnerId = round.hands[0].winnerId;
    const loserId = round.hands[0].loserId;

    if (winnerId === undefined || loserId === undefined) {
      throw new Error('Winner and loser IDs required for ron');
    }

    const isDealer = this.getCurrentDealer() === winnerId;

    const calc = new PointsCalc();
    this._state.scores = calc.ron(
      this._ruleset,
      isDealer,
      this.getScores(),
      winnerId,
      loserId,
      round.hands[0].han ?? 0,
      round.hands[0].fu ?? 0,
      round.riichi ?? [],
      this.getHonba(),
      this.getRiichiBets(),
      round.hands[0].paoPlayerId
    );

    if (isDealer && !this._ruleset.rules.withWinningDealerHonbaSkipped) {
      this._addHonba();
    } else {
      this._resetHonba()._nextRound();
    }

    this._resetRiichiBets();
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterMultiRon(round: RoundEntity, playerIds: number[]): PaymentsInfo {
    const loserId = round.hands[0].loserId; // same for all rounds
    if (loserId === undefined) {
      throw new Error('Loser ID required for multiron');
    }

    const calc = new PointsCalc();
    const riichiWinners = calc.assignRiichiBets(
      round.hands.map((r) => r.winnerId!),
      round.riichi ?? [],
      loserId,
      this.getRiichiBets(),
      this.getHonba(),
      playerIds
    );

    let totalRiichiInRound = 0;
    Object.values(riichiWinners).forEach((x) => {
      totalRiichiInRound += x.from_players.length;
    });

    let dealerWon = false;
    calc.resetPaymentsInfo();
    let payments = calc.lastPaymentsInfo();

    round.hands.forEach((hand) => {
      const winnerId = hand.winnerId;
      if (winnerId === undefined) return;

      dealerWon = dealerWon || this.getCurrentDealer() === winnerId;
      const winnerInfo = riichiWinners[winnerId];

      this._state.scores = calc.ron(
        this._ruleset,
        this.getCurrentDealer() === winnerId,
        this.getScores(),
        winnerId,
        hand.loserId!,
        hand.han ?? 0,
        hand.fu ?? 0,
        winnerInfo.from_players,
        winnerInfo.honba,
        winnerInfo.from_table,
        hand.paoPlayerId,
        winnerInfo.closest_winner,
        totalRiichiInRound
      );

      // Merge payments recursively
      const newPayments = calc.lastPaymentsInfo();
      payments = this._mergePayments(payments, newPayments);
    });

    if (dealerWon && !this._ruleset.rules.withWinningDealerHonbaSkipped) {
      this._addHonba();
    } else {
      this._resetHonba()._nextRound();
    }

    this._resetRiichiBets();
    return payments;
  }

  private readonly _merge = (
    p1: Record<string, number>,
    p2: Record<string, number>
  ): Record<string, number> => {
    const merged: Record<string, number> = {};
    Object.keys(p1).forEach((key) => {
      merged[key] = (p1[key] ?? 0) + (p2[key] ?? 0);
    });
    return merged;
  };

  private _mergePayments(payments1: PaymentsInfo, payments2: PaymentsInfo): PaymentsInfo {
    return {
      direct: this._merge(payments1.direct, payments2.direct),
      riichi: this._merge(payments1.riichi, payments2.riichi),
      honba: this._merge(payments1.honba, payments2.honba),
    };
  }

  protected _updateAfterTsumo(round: RoundEntity): PaymentsInfo {
    const winnerId = round.hands[0].winnerId;
    if (winnerId === undefined) {
      throw new Error('Winner ID required for tsumo');
    }

    const calc = new PointsCalc();
    this._state.scores = calc.tsumo(
      this._ruleset,
      this.getCurrentDealer(),
      this.getScores(),
      winnerId,
      round.hands[0].han ?? 0,
      round.hands[0].fu ?? 0,
      round.riichi ?? [],
      this.getHonba(),
      this.getRiichiBets(),
      round.hands[0].paoPlayerId
    );

    if (
      this.getCurrentDealer() === winnerId &&
      !this._ruleset.rules.withWinningDealerHonbaSkipped
    ) {
      this._addHonba();
    } else {
      this._resetHonba()._nextRound();
    }

    this._resetRiichiBets();
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterDraw(round: RoundEntity): PaymentsInfo {
    const tempaiIds = round.hands[0].tempai ?? [];
    const calc = new PointsCalc();
    this._state.scores = calc.draw(this.getScores(), tempaiIds, round.riichi ?? []);

    this._addHonba()._addRiichiBets((round.riichi ?? []).length);

    if (
      !tempaiIds.includes(this.getCurrentDealer()) ||
      this._ruleset.rules.withWinningDealerHonbaSkipped
    ) {
      this._nextRound();
    }

    return calc.lastPaymentsInfo();
  }

  protected _updateAfterAbort(round: RoundEntity): PaymentsInfo {
    if (!this._ruleset.rules.withAbortives) {
      throw new Error('Current game rules do not allow abortive draws');
    }

    const calc = new PointsCalc();
    this._state.scores = calc.abort(this.getScores(), round.riichi ?? []);

    this._addHonba()._addRiichiBets((round.riichi ?? []).length);
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterChombo(round: RoundEntity): PaymentsInfo {
    const loserId = round.hands[0].loserId;
    if (loserId === undefined) {
      throw new Error('Loser ID required for chombo');
    }

    const calc = new PointsCalc();
    this._state.scores = calc.chombo(
      this._ruleset,
      this.getCurrentDealer(),
      loserId,
      this.getScores()
    );

    if (this._ruleset.rules.chomboAmount > 0) {
      if (!(loserId in this._state.chombo)) {
        this._state.chombo[loserId] = 0;
      }
      this._state.chombo[loserId] -= this._ruleset.rules.chomboAmount;
    }
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterNagashi(round: RoundEntity): PaymentsInfo {
    const calc = new PointsCalc();
    this._state.scores = calc.nagashi(
      this.getScores(),
      this.getCurrentDealer(),
      round.riichi ?? [],
      round.hands[0].nagashi ?? []
    );

    this._addHonba()._addRiichiBets((round.riichi ?? []).length);

    if (!(round.hands[0].tempai ?? []).includes(this.getCurrentDealer())) {
      this._nextRound();
    }
    return calc.lastPaymentsInfo();
  }

  protected _updateYakitori(round: RoundEntity): void {
    if (this._ruleset.rules.withYakitori) {
      round.hands.forEach((r) => {
        const winnerId = r.winnerId;
        if (winnerId !== undefined) {
          this._state.yakitori[winnerId] = false;
        }
      });
    }
  }

  public lastHandStarted(): boolean {
    return this._state.lastHandStarted;
  }

  public setLastHandStarted(state = true): SessionState {
    this._state.lastHandStarted = state;
    return this;
  }

  public getLastOutcome(): string | null {
    return this._state.lastOutcome;
  }
}
