import { Embeddable, Property } from '@mikro-orm/postgresql';

// TODO: convert to embeddable, make a model (?)
// Add Ruleset as embeddable for customized rulesets

@Embeddable()
export class SessionStateEntity {
  @Property()
  ruleset!: Ruleset;

  /** { player_id => score } */
  @Property()
  scores!: Record<number, number>;

  /** { player_id => chip } */
  @Property()
  chips!: Record<number, number>;

  /** { player_id => chombo_amount } */
  @Property()
  chombo!: Record<number, number>;

  /** 1e-4s */
  @Property()
  round!: number;

  @Property()
  honba!: number;

  /** Count of riichi bets on table from previous rounds */
  @Property()
  riichiBets!: number;

  /** True if game has been finished prematurely (e.g. by timeout) */
  @Property()
  prematurelyFinished!: boolean;

  /** True if round has just changed useful to determine if current 4e or
   * 4s is first one, no matter what honba count is.
   * (Possible situation: draw in 3s or 3e, so first 4e or 4s has honba).
   */
  @Property()
  roundJustChanged!: boolean;

  /**
   * True if ending policy is "oneMoreHand" AND this last hand was started.
   */
  @Property()
  lastHandStarted!: boolean;

  /**
   * Outcome of previously recorded round. Useful to determine if certain rules
   * should be applied in current case, e.g., agariyame should not be applied on
   * chombo or abortive draw.
   */
  @Property()
  lastOutcome!: string;

  /** If player has yakitori indicator */
  @Property()
  yakitori!: Record<number, boolean>;

  /** Saved current replacements for proper recalculations */
  @Property()
  replacements!: Record<number, number>;

  /** Player IDs */
  @Property()
  playerIds!: number[];
}
