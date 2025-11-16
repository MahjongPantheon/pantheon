import { PaymentsInfo, PointsCalc } from '../../helpers/PointsCalc';
import { Ruleset } from '../../rulesets/ruleset';
import { Round } from '../models/db/round';

interface SessionStateData {
  _scores: Record<number, number>;
  _chips: Record<number, number>;
  _chombo: Record<number, number>;
  _round: number;
  _honba: number;
  _riichiBets: number;
  _prematurelyFinished: boolean;
  _roundJustChanged: boolean;
  _lastHandStarted: boolean;
  _lastOutcome: string | null;
  _yakitori: Record<number, boolean>;
  _replacements: any[];
}

/**
 * Class SessionState
 *
 * Low-level model helper
 */
export class SessionState {
  protected _ruleset: Ruleset;

  /** { player_id => score } */
  protected _scores: Record<number, number> = {};

  /** { player_id => chip } */
  protected _chips: Record<number, number> = {};

  /** { player_id => chombo_amount } */
  protected _chombo: Record<number, number> = {};

  /** 1e-4s */
  protected _round = 1;

  protected _honba = 0;

  /** Count of riichi bets on table from previous rounds */
  protected _riichiBets = 0;

  /** True if game has been finished prematurely (e.g. by timeout) */
  protected _prematurelyFinished = false;

  /**
   * True if round has just changed useful to determine if current 4e or
   * 4s is first one, no matter what honba count is.
   * (Possible situation: draw in 3s or 3e, so first 4e or 4s has honba).
   */
  protected _roundJustChanged = true;

  /**
   * True if ending policy is "oneMoreHand" AND this last hand was started.
   */
  protected _lastHandStarted = false;

  /**
   * Outcome of previously recorded round. Useful to determine if certain rules
   * should be applied in current case, e.g., agariyame should not be applied on
   * chombo or abortive draw.
   */
  protected _lastOutcome: string | null = null;

  /** If player has yakitori indicator */
  protected _yakitori: Record<number, boolean> = {};

  /** Saved current replacements for proper recalculations */
  protected _replacements: any[] = [];

  protected _playerIds: number[];

  constructor(ruleset: Ruleset, playersIds: number[]) {
    this._ruleset = ruleset;

    if (playersIds.length !== 4) {
      throw new Error(`Players count is not 4: ${JSON.stringify(playersIds)}`);
    }

    const startPoints = ruleset.rules.startPoints;
    this._scores = {};
    playersIds.forEach((playerId) => {
      this._scores[playerId] = startPoints;
    });
    this._playerIds = playersIds;
  }

  public toJson(): string {
    return JSON.stringify(this.toArray());
  }

  public toArray(): SessionStateData {
    const arr: any = {};
    const withChips = this._ruleset.rules.chipsValue > 0;

    // Copy all properties except _rules
    Object.keys(this).forEach((key) => {
      if (key === '_rules') {
        return;
      }
      if (key === '_chips' && !withChips) {
        return;
      }

      const value = (this as any)[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle non-array objects
        if (typeof value.toArray === 'function' || typeof value.toJson === 'function') {
          throw new Error('No objects/functions allowed in session state');
        }
      }

      arr[key] = value;
    });

    return arr;
  }

  public static fromJson(rules: Ruleset, playersIds: number[], json: string): SessionState {
    let data: any = {};

    if (json.trim()) {
      try {
        data = JSON.parse(json);
      } catch (error) {
        throw new Error(`JSON parse error: ${error}`);
      }
    }

    const instance = new SessionState(rules, playersIds);

    Object.keys(data).forEach((key) => {
      (instance as any)[key] = data[key];
    });

    return instance;
  }

  protected _tobi(): boolean {
    const scores = Object.values(this.getScores());
    return scores.some((score) => score < 0);
  }

  protected _dealerIsLeaderOnOorasu(): boolean {
    if (this._lastOutcome === 'chombo' || this._lastOutcome === 'abort') {
      return false; // chombo or abortive draw should not finish game
    }

    if (this._roundJustChanged) {
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

    if (this._lastOutcome === 'chombo') {
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
    this._prematurelyFinished = true;
    return this;
  }

  public isFinished(): boolean {
    return (
      this._lastPossibleRoundWasPlayed() ||
      this._prematurelyFinished ||
      (this._ruleset.rules.withButtobi && this._tobi()) ||
      (this._ruleset.rules.withLeadingDealerGameOver && this._dealerIsLeaderOnOorasu())
    );
  }

  protected _addHonba(): SessionState {
    this._honba++;
    return this;
  }

  protected _resetHonba(): SessionState {
    this._honba = 0;
    return this;
  }

  public getHonba(): number {
    return this._honba;
  }

  protected _addRiichiBets(riichiBets: number): SessionState {
    this._riichiBets += riichiBets;
    return this;
  }

  protected _resetRiichiBets(): SessionState {
    this._riichiBets = 0;
    return this;
  }

  public getRiichiBets(): number {
    return this._riichiBets;
  }

  protected _nextRound(): SessionState {
    this._round++;
    return this;
  }

  public getRound(): number {
    return this._round;
  }

  public getScores(): Record<number, number> {
    return this._scores;
  }

  public setScores(scores: Record<number, number>): SessionState {
    this._scores = scores;
    return this;
  }

  public getReplacements(): any[] {
    return this._replacements;
  }

  public setReplacements(replacements: any[]): SessionState {
    this._replacements = replacements;
    return this;
  }

  public getYakitori(): Record<number, boolean> {
    return this._yakitori;
  }

  public setYakitori(yakitori: Record<number, boolean>): SessionState {
    this._yakitori = yakitori;
    return this;
  }

  public getChips(): Record<number, number> {
    return this._chips;
  }

  public setChips(chips: Record<number, number>): SessionState {
    this._chips = chips;
    return this;
  }

  public getChombo(): Record<number, number> {
    return this._chombo;
  }

  /**
   * Return id of current dealer
   */
  public getCurrentDealer(): number {
    const players = Object.keys(this._scores).map(Number);
    return players[(this._round - 1) % 4];
  }

  /**
   * Register new round in current session
   */
  public update(round: Round): PaymentsInfo {
    const lastRoundIndex = this.getRound();
    let payments: PaymentsInfo;

    switch (round.outcome) {
      case 'ron':
        payments = this._updateAfterRon(round);
        break;
      case 'multiron':
        payments = this._updateAfterMultiRon(round, this._playerIds);
        break;
      case 'tsumo':
        payments = this._updateAfterTsumo(round);
        break;
      case 'draw':
        payments = this._updateAfterDraw(round);
        break;
      case 'abort':
        payments = this._updateAfterAbort(round);
        break;
      case 'chombo':
        payments = this._updateAfterChombo(round);
        break;
      case 'nagashi':
        payments = this._updateAfterNagashi(round);
        break;
      default:
        throw new Error('wrong outcome passed');
    }

    this._updateYakitori(round);
    this._roundJustChanged = lastRoundIndex !== this.getRound();
    this._lastOutcome = round.outcome;
    return payments; // for dry run
  }

  /**
   * @param id - player id
   * @param betAmount - total points amount gathered as riichi bets. May be fractional (of 1000)!
   */
  public giveRiichiBetsToPlayer(id: number | null, betAmount: number): void {
    if (id !== null) {
      this._scores[id] += betAmount;
    }
  }

  protected _updateAfterRon(round: Round): PaymentsInfo {
    const winnerId = round.rounds[0].winner_id;
    const loserId = round.rounds[0].loser_id;

    if (winnerId === null || loserId === null) {
      throw new Error('Winner and loser IDs required for ron');
    }

    const isDealer = this.getCurrentDealer() === winnerId;

    const calc = new PointsCalc();
    this._scores = calc.ron(
      this._ruleset,
      isDealer,
      this.getScores(),
      winnerId,
      loserId,
      round.rounds[0].han ?? 0,
      round.rounds[0].fu,
      round.riichi,
      this.getHonba(),
      this.getRiichiBets(),
      round.rounds[0].pao_player_id
    );

    if (isDealer && !this._ruleset.rules.withWinningDealerHonbaSkipped) {
      this._addHonba();
    } else {
      this._resetHonba()._nextRound();
    }

    this._resetRiichiBets();
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterMultiRon(round: Round, playerIds: number[]): PaymentsInfo {
    const loserId = round.rounds[0].loser_id; // same for all rounds
    if (loserId === null) {
      throw new Error('Loser ID required for multiron');
    }

    const calc = new PointsCalc();
    const riichiWinners = calc.assignRiichiBets(
      round.rounds.map((r) => r.winner_id!),
      round.riichi,
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

    round.rounds.forEach((roundItem) => {
      const winnerId = roundItem.winner_id;
      if (winnerId === null) return;

      dealerWon = dealerWon || this.getCurrentDealer() === winnerId;
      const winnerInfo = riichiWinners[winnerId];

      this._scores = calc.ron(
        this._ruleset,
        this.getCurrentDealer() === winnerId,
        this.getScores(),
        winnerId,
        roundItem.loser_id!,
        roundItem.han ?? 0,
        roundItem.fu,
        winnerInfo.from_players,
        winnerInfo.honba,
        winnerInfo.from_table,
        roundItem.pao_player_id,
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

  protected _updateAfterTsumo(round: Round): PaymentsInfo {
    const winnerId = round.rounds[0].winner_id;
    if (winnerId === null) {
      throw new Error('Winner ID required for tsumo');
    }

    const calc = new PointsCalc();
    this._scores = calc.tsumo(
      this._ruleset,
      this.getCurrentDealer(),
      this.getScores(),
      winnerId,
      round.rounds[0].han ?? 0,
      round.rounds[0].fu,
      round.riichi,
      this.getHonba(),
      this.getRiichiBets(),
      round.rounds[0].pao_player_id
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

  protected _updateAfterDraw(round: Round): PaymentsInfo {
    const tempaiIds =
      round.rounds[0].tempai
        ?.split(',')
        .filter((i) => !!i)
        .map((i) => parseInt(i, 10)) ?? [];
    const calc = new PointsCalc();
    this._scores = calc.draw(this.getScores(), tempaiIds, round.riichi);

    this._addHonba()._addRiichiBets(round.riichi.length);

    if (
      !tempaiIds.includes(this.getCurrentDealer()) ||
      this._ruleset.rules.withWinningDealerHonbaSkipped
    ) {
      this._nextRound();
    }

    return calc.lastPaymentsInfo();
  }

  protected _updateAfterAbort(round: Round): PaymentsInfo {
    if (!this._ruleset.rules.withAbortives) {
      throw new Error('Current game rules do not allow abortive draws');
    }

    const calc = new PointsCalc();
    this._scores = calc.abort(this.getScores(), round.riichi);

    this._addHonba()._addRiichiBets(round.riichi.length);
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterChombo(round: Round): PaymentsInfo {
    const loserId = round.rounds[0].loser_id;
    if (loserId === null) {
      throw new Error('Loser ID required for chombo');
    }

    const calc = new PointsCalc();
    this._scores = calc.chombo(this._ruleset, this.getCurrentDealer(), loserId, this.getScores());

    if (this._ruleset.rules.chomboAmount > 0) {
      if (!(loserId in this._chombo)) {
        this._chombo[loserId] = 0;
      }
      this._chombo[loserId] -= this._ruleset.rules.chomboAmount;
    }
    return calc.lastPaymentsInfo();
  }

  protected _updateAfterNagashi(round: Round): PaymentsInfo {
    const calc = new PointsCalc();
    this._scores = calc.nagashi(
      this.getScores(),
      this.getCurrentDealer(),
      round.riichi,
      round.rounds[0].nagashi?.split(',').map((i) => parseInt(i, 10)) ?? []
    );

    this._addHonba()._addRiichiBets(round.riichi.length);

    if (
      !(round.rounds[0].tempai?.split(',').map((i) => parseInt(i, 10)) ?? []).includes(
        this.getCurrentDealer()
      )
    ) {
      this._nextRound();
    }
    return calc.lastPaymentsInfo();
  }

  protected _updateYakitori(round: Round): void {
    if (this._ruleset.rules.withYakitori) {
      round.rounds.forEach((r) => {
        const winnerId = r.winner_id;
        if (winnerId !== null) {
          this._yakitori[winnerId] = false;
        }
      });
    }
  }

  public lastHandStarted(): boolean {
    return this._lastHandStarted;
  }

  public setLastHandStarted(state = true): SessionState {
    this._lastHandStarted = state;
    return this;
  }

  public getLastOutcome(): string | null {
    return this._lastOutcome;
  }
}
