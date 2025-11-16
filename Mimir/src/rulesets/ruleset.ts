import { ComplexUma, EndingPolicy, RulesetConfig, Uma, UmaType } from 'tsclients/proto/atoms.pb.js';
import { Yaku, yakuListExcept } from './yaku.js';

export interface Ruleset {
  rules: RulesetConfig;
  id: 'ema' | 'wrc' | 'jpmlA' | 'tenhounet' | 'rrc' | 'custom';
  title: string;
}

export function equalizedUma(scores: number[], uma: number[]): number[] {
  const sortedScores = [...scores].sort((a, b) => b - a);

  if (sortedScores.every((val) => val === sortedScores[0])) {
    return [0, 0, 0, 0];
  }

  if (sortedScores[0] === sortedScores[1] && sortedScores[1] === sortedScores[2]) {
    // 1 == 2 == 3 places
    const eqUma = (uma[0] + uma[1] + uma[2]) / 3;
    return [eqUma, eqUma, eqUma, uma[3]];
  }

  if (sortedScores[1] === sortedScores[2] && sortedScores[2] === sortedScores[3]) {
    // 2 == 3 == 3 places
    const eqUma = (uma[1] + uma[2] + uma[3]) / 3;
    return [uma[0], eqUma, eqUma, eqUma];
  }

  if (sortedScores[0] === sortedScores[1]) {
    const eqUma = (uma[0] + uma[1]) / 2;
    if (sortedScores[2] === sortedScores[3]) {
      const eqUma2 = (uma[2] + uma[3]) / 2;
      return [eqUma, eqUma, eqUma2, eqUma2];
    }
    return [eqUma, eqUma, uma[2], uma[3]];
  }

  if (sortedScores[1] === sortedScores[2]) {
    const eqUma = (uma[1] + uma[2]) / 2;
    return [uma[0], eqUma, eqUma, uma[3]];
  }

  if (sortedScores[2] === sortedScores[3]) {
    const eqUma = (uma[2] + uma[3]) / 2;
    return [uma[0], uma[1], eqUma, eqUma];
  }

  return [...uma];
}

export function complexUma(
  scores: number[],
  uma: { 3: number[]; 1: number[]; default: number[] },
  startPoints: number
): number[] {
  const sortedScores = [...scores].sort((a, b) => b - a);
  const minusedPlayers = sortedScores.reduce(
    (acc, score) => acc + (score < startPoints ? 1 : 0),
    0
  );
  if (minusedPlayers === 1 || minusedPlayers === 3) {
    return uma[minusedPlayers];
  }
  return uma.default;
}

export function getUma(scores: number[], ruleset: Ruleset): number[] {
  let uma: number[];
  if (ruleset.rules.umaType === UmaType.UMA_TYPE_UMA_COMPLEX) {
    uma = complexUma(
      scores,
      {
        3: [
          ruleset.rules.complexUma.neg3.place1,
          ruleset.rules.complexUma.neg3.place2,
          ruleset.rules.complexUma.neg3.place3,
          ruleset.rules.complexUma.neg3.place4,
        ],
        1: [
          ruleset.rules.complexUma.neg1.place1,
          ruleset.rules.complexUma.neg1.place2,
          ruleset.rules.complexUma.neg1.place3,
          ruleset.rules.complexUma.neg1.place4,
        ],
        default: [
          ruleset.rules.complexUma.otherwise.place1,
          ruleset.rules.complexUma.otherwise.place2,
          ruleset.rules.complexUma.otherwise.place3,
          ruleset.rules.complexUma.otherwise.place4,
        ],
      },
      ruleset.rules.startPoints
    );
  } else {
    uma = [
      ruleset.rules.uma.place1,
      ruleset.rules.uma.place2,
      ruleset.rules.uma.place3,
      ruleset.rules.uma.place4,
    ];
  }

  if (ruleset.rules.equalizeUma) {
    return equalizedUma(scores, uma);
  }

  return uma;
}

export function getOka(place: number, ruleset: Ruleset) {
  if (place === 1) {
    return ruleset.rules.oka * 0.75;
  } else {
    return -ruleset.rules.oka / 4;
  }
}

export function createRuleset(id: Ruleset['id'], json?: string): Ruleset {
  switch (id) {
    case 'ema':
      return {
        id,
        title: 'European Mahjong Association rules',
        rules: {
          complexUma: {} as ComplexUma, // TODO: make optional
          endingPolicy: EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND,
          uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
          umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
          doubleronHonbaAtamahane: false,
          doubleronRiichiAtamahane: false,
          equalizeUma: true,
          extraChomboPayments: false,
          playAdditionalRounds: false,
          riichiGoesToWinner: true,
          tonpuusen: false,
          withAbortives: false,
          withAtamahane: false,
          withButtobi: false,
          withKazoe: false,
          withKiriageMangan: false,
          withKuitan: true,
          withLeadingDealerGameOver: false,
          withMultiYakumans: false,
          withNagashiMangan: false,
          withWinningDealerHonbaSkipped: false,
          chipsValue: 0,
          chomboAmount: 20000,
          gameExpirationTime: 0,
          goalPoints: 0,
          maxPenalty: 20000,
          minPenalty: 100,
          oka: 0,
          penaltyStep: 100,
          replacementPlayerFixedPoints: -15000,
          replacementPlayerOverrideUma: -15000,
          startPoints: 30000,
          startRating: 0,
          allowedYaku: yakuListExcept([
            Yaku.OPENRIICHI,
            Yaku.SUUANKOUTANKI,
            Yaku.CHUURENPOUTOPURE,
            Yaku.KOKUSHIMUSOU13,
          ]),
          yakuWithPao: [Yaku.DAISANGEN, Yaku.DAISUUSHII],
          withYakitori: false,
          yakitoriPenalty: 0,
          chomboEndsGame: false,
          honbaValue: 300,
          doubleYakuman: [],
        },
      };
    case 'jpmlA':
      return {
        id,
        title: 'Japanese Professional Mahjong League A rules',
        rules: {
          complexUma: {
            neg3: {
              place1: 12000,
              place2: -1000,
              place3: -3000,
              place4: -8000,
            },
            neg1: {
              place1: 8000,
              place2: 3000,
              place3: 1000,
              place4: -12000,
            },
            otherwise: {
              place1: 8000,
              place2: 4000,
              place3: -4000,
              place4: -8000,
            },
          },
          endingPolicy: EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND,
          uma: {} as Uma, // TODO make optional
          umaType: UmaType.UMA_TYPE_UMA_COMPLEX,
          doubleronHonbaAtamahane: false,
          doubleronRiichiAtamahane: false,
          equalizeUma: true,
          extraChomboPayments: false,
          playAdditionalRounds: false,
          riichiGoesToWinner: false,
          tonpuusen: false,
          withAbortives: true,
          withAtamahane: true,
          withButtobi: false,
          withKazoe: false,
          withKiriageMangan: false,
          withKuitan: true,
          withLeadingDealerGameOver: false,
          withMultiYakumans: false,
          withNagashiMangan: false,
          withWinningDealerHonbaSkipped: false,
          chipsValue: 0,
          chomboAmount: 20000,
          gameExpirationTime: 0,
          goalPoints: 0,
          maxPenalty: 20000,
          minPenalty: 100,
          oka: 0,
          penaltyStep: 100,
          replacementPlayerFixedPoints: -15000,
          replacementPlayerOverrideUma: -15000,
          startPoints: 30000,
          startRating: 0,
          allowedYaku: yakuListExcept([
            Yaku.IPPATSU,
            Yaku.OPENRIICHI,
            Yaku.SUUANKOUTANKI,
            Yaku.CHUURENPOUTOPURE,
            Yaku.KOKUSHIMUSOU13,
          ]),
          yakuWithPao: [Yaku.DAISANGEN, Yaku.DAISUUSHII, Yaku.SUUKANTSU],
          withYakitori: false,
          yakitoriPenalty: 0,
          chomboEndsGame: false,
          honbaValue: 300,
          doubleYakuman: [],
        },
      };
    case 'wrc':
      return {
        id,
        title: 'World Riichi Championship rules',
        rules: {
          complexUma: {} as ComplexUma, // TODO: make optional
          endingPolicy: EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND,
          uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
          umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
          doubleronHonbaAtamahane: false,
          doubleronRiichiAtamahane: false,
          equalizeUma: true,
          extraChomboPayments: false,
          playAdditionalRounds: false,
          riichiGoesToWinner: true,
          tonpuusen: false,
          withAbortives: false,
          withAtamahane: true,
          withButtobi: false,
          withKazoe: false,
          withKiriageMangan: true,
          withKuitan: true,
          withLeadingDealerGameOver: false,
          withMultiYakumans: false,
          withNagashiMangan: false,
          withWinningDealerHonbaSkipped: false,
          chipsValue: 0,
          chomboAmount: 20000,
          gameExpirationTime: 0,
          goalPoints: 0,
          maxPenalty: 20000,
          minPenalty: 100,
          oka: 0,
          penaltyStep: 100,
          replacementPlayerFixedPoints: -15000,
          replacementPlayerOverrideUma: -15000,
          startPoints: 30000,
          startRating: 0,
          allowedYaku: yakuListExcept([
            Yaku.OPENRIICHI,
            Yaku.SUUANKOUTANKI,
            Yaku.CHUURENPOUTOPURE,
            Yaku.KOKUSHIMUSOU13,
          ]),
          yakuWithPao: [Yaku.DAISANGEN, Yaku.DAISUUSHII],
          withYakitori: false,
          yakitoriPenalty: 0,
          chomboEndsGame: false,
          honbaValue: 300,
          doubleYakuman: [],
        },
      };
    case 'tenhounet':
      return {
        id,
        title: 'Tenhou.net compatible rules',
        rules: {
          complexUma: {} as ComplexUma, // TODO: make optional
          endingPolicy: EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED,
          uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
          umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
          doubleronHonbaAtamahane: true,
          doubleronRiichiAtamahane: true,
          equalizeUma: false,
          extraChomboPayments: true,
          playAdditionalRounds: true,
          riichiGoesToWinner: true,
          tonpuusen: false,
          withAbortives: true,
          withAtamahane: false,
          withButtobi: true,
          withKazoe: true,
          withKiriageMangan: false,
          withKuitan: true,
          withLeadingDealerGameOver: true,
          withMultiYakumans: true,
          withNagashiMangan: true,
          withWinningDealerHonbaSkipped: false,
          chipsValue: 0,
          chomboAmount: 0,
          gameExpirationTime: 87600, // hours, to cover JST difference
          goalPoints: 30000,
          maxPenalty: 20000,
          minPenalty: 100,
          oka: 20000,
          penaltyStep: 100,
          replacementPlayerFixedPoints: -15000,
          replacementPlayerOverrideUma: -15000,
          startPoints: 25000,
          startRating: 0,
          allowedYaku: yakuListExcept([
            Yaku.OPENRIICHI,
            Yaku.SUUANKOUTANKI,
            Yaku.CHUURENPOUTOPURE,
            Yaku.KOKUSHIMUSOU13,
          ]),
          yakuWithPao: [Yaku.DAISANGEN, Yaku.DAISUUSHII, Yaku.SUUKANTSU],
          withYakitori: false,
          yakitoriPenalty: 0,
          chomboEndsGame: false,
          honbaValue: 300,
          doubleYakuman: [],
        },
      };
    case 'rrc':
      return {
        id,
        title: 'Russian Riichi Community rules',
        rules: {
          complexUma: {} as ComplexUma, // TODO: make optional
          endingPolicy: EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND,
          uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
          umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
          doubleronHonbaAtamahane: false,
          doubleronRiichiAtamahane: false,
          equalizeUma: true,
          extraChomboPayments: false,
          playAdditionalRounds: false,
          riichiGoesToWinner: true,
          tonpuusen: false,
          withAbortives: true,
          withAtamahane: false,
          withButtobi: false,
          withKazoe: true,
          withKiriageMangan: false,
          withKuitan: true,
          withLeadingDealerGameOver: false,
          withMultiYakumans: true,
          withNagashiMangan: false,
          withWinningDealerHonbaSkipped: false,
          chipsValue: 0,
          chomboAmount: 20000,
          gameExpirationTime: 0,
          goalPoints: 0,
          maxPenalty: 64000,
          minPenalty: 1000,
          oka: 0,
          penaltyStep: 1000,
          replacementPlayerFixedPoints: -15000,
          replacementPlayerOverrideUma: -15000,
          startPoints: 30000,
          startRating: 0,
          allowedYaku: yakuListExcept([
            Yaku.OPENRIICHI,
            Yaku.SUUANKOUTANKI,
            Yaku.CHUURENPOUTOPURE,
            Yaku.KOKUSHIMUSOU13,
          ]),
          yakuWithPao: [Yaku.DAISANGEN, Yaku.DAISUUSHII],
          withYakitori: false,
          yakitoriPenalty: 0,
          chomboEndsGame: true,
          honbaValue: 300,
          doubleYakuman: [],
        },
      };
    case 'custom':
      if (!json) {
        throw new Error('Ruleset data not found');
      }
      return {
        id,
        title: 'Custom ruleset',
        rules: {
          endingPolicy: EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND,
          uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
          umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
          doubleronHonbaAtamahane: false,
          doubleronRiichiAtamahane: false,
          equalizeUma: true,
          extraChomboPayments: false,
          playAdditionalRounds: false,
          riichiGoesToWinner: true,
          tonpuusen: false,
          withAbortives: false,
          withAtamahane: false,
          withButtobi: false,
          withKazoe: true,
          withKiriageMangan: false,
          withKuitan: true,
          withLeadingDealerGameOver: false,
          withMultiYakumans: true,
          withNagashiMangan: false,
          withWinningDealerHonbaSkipped: false,
          chipsValue: 0,
          chomboAmount: 20000,
          gameExpirationTime: 0,
          goalPoints: 0,
          maxPenalty: 64000,
          minPenalty: 1000,
          oka: 0,
          penaltyStep: 1000,
          replacementPlayerFixedPoints: -15000,
          replacementPlayerOverrideUma: -15000,
          startPoints: 30000,
          startRating: 0,
          allowedYaku: yakuListExcept([
            Yaku.OPENRIICHI,
            Yaku.SUUANKOUTANKI,
            Yaku.CHUURENPOUTOPURE,
            Yaku.KOKUSHIMUSOU13,
          ]),
          yakuWithPao: [Yaku.DAISANGEN, Yaku.DAISUUSHII],
          withYakitori: false,
          yakitoriPenalty: 0,
          chomboEndsGame: true,
          honbaValue: 300,
          doubleYakuman: [],
          ...JSON.parse(json),
        },
      };
  }
}
