import { UseFormReturnType } from '@mantine/form';

export type EventCustom = {
  type: 'local' | 'tournament' | 'online';
  title: string;
  description: string;
  timezone: string;
  duration: number;
  isTeam: boolean;
  isPrescripted: boolean;
  gameSeriesCount: number;
  minGamesCount: number;
  baseRuleset: string;
  tenhouLobbyId: string;
};

export type RulesetCustom = {
  tonpuusen: boolean;
  riichiGoesToWinner: boolean;
  extraChomboPayments: boolean;
  doubleronHonbaAtamahane: boolean;
  doubleronRiichiAtamahane: boolean;
  withAtamahane: boolean;
  withAbortives: boolean;
  withButtobi: boolean;
  withKazoe: boolean;
  withKiriageMangan: boolean;
  withKuitan: boolean;
  withLeadingDealerGameOver: boolean;
  withMultiYakumans: boolean;
  withNagashiMangan: boolean;
  playAdditionalRounds: boolean;
  equalizeUma: boolean;
  chomboPenalty: number;
  goalPoints: number;
  maxPenalty: number;
  minPenalty: number;
  penaltyStep: number;
  replacementPlayerOverrideUma: number;
  oka: number;
  uma: number[];
  complexUma: number[][];
  umaType: 'simple' | 'complex';
  allowedYaku: Record<string, boolean>; // TODO: reformat to number[]
  yakuWithPao: Record<string, boolean>; // TODO: reformat to number[]
  withWinningDealerHonbaSkipped: boolean;
  endingPolicy: 'oneMoreHand' | 'endAfterHand' | 'none';
  startRating: number;
  startPoints: number;
  replacementPlayerFixedPoints: number;
  gameExpirationTime: number;
  chipsValue: number;
};

export type FormFields = { event: EventCustom; ruleset: RulesetCustom };
export type FormHandle = UseFormReturnType<{ event: EventCustom; ruleset: RulesetCustom }>;

export type RulesetRemote = {
  tonpuusen: boolean;
  riichiGoesToWinner: boolean;
  extraChomboPayments: boolean;
  doubleronHonbaAtamahane: boolean;
  doubleronRiichiAtamahane: boolean;
  withAtamahane: boolean;
  withAbortives: boolean;
  withButtobi: boolean;
  withKazoe: boolean;
  withKiriageMangan: boolean;
  withKuitan: boolean;
  withLeadingDealerGameOver: boolean;
  withMultiYakumans: boolean;
  withNagashiMangan: boolean;
  playAdditionalRounds: boolean;
  equalizeUma: boolean;
  chomboPenalty: number;
  goalPoints: number;
  maxPenalty: number;
  minPenalty: number;
  penaltyStep: number;
  replacementPlayerOverrideUma: number;
  oka: number;
  uma: number[];
  complexUma: number[][];
  umaType: 'simple' | 'complex';
  allowedYaku: number[];
  yakuWithPao: number[];
  withWinningDealerHonbaSkipped: boolean;
  endingPolicy: 'oneMoreHand' | 'endAfterHand' | 'none';
  startRating: number;
  startPoints: number;
  replacementPlayerFixedPoints: number;
  gameExpirationTime: number;
  chipsValue: number;
};
