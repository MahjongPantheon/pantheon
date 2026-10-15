import type { MultironWin, Round } from 'tsclients/proto/atoms.pb.js';
import { hands } from '../seeders/hand.js';
import { SessionState } from '../helpers/SessionState.js';
import { Yaku } from '../helpers/yaku.js';

// Reuse TestSeeder's hands without its fixture player IDs. Fu beyond pinfu and
// seven pairs depends on the actual sets, pair and wait, not just the yaku list.
const samples = [
  { id: 7604, fuParts: [20, 10, 4, 2] }, // base + closed ron + closed simple triplet + tanki
  { id: 57028, fuParts: [20, 2] }, // base + open simple triplet, rounded to 30
  { id: 57029, fuParts: [20, 4, 4, 2, 2, 2] }, // four open triplets + value wind pair
  { id: 154623, fuParts: [] }, // seven pairs: fixed 25 fu
  { id: 174736, fuParts: [] }, // closed pinfu ron: fixed 30 fu
  { id: 59976, fuParts: [20, 2, 4, 2] }, // base + tsumo + closed simple triplet + tanki
  { id: 187226, fuParts: [] }, // seven pairs tsumo: fixed 25 fu
  { id: 187230, fuParts: [] }, // riichi, seven pairs, tsumo: fixed 25 fu
];

const hanValues = new Map<number, number>([
  [Yaku.TANYAO, 1],
  [Yaku.RIICHI, 1],
  [Yaku.IPPATSU, 1],
  [Yaku.PINFU, 1],
  [Yaku.MENZENTSUMO, 1],
  [Yaku.CHIITOITSU, 2],
  [Yaku.TOITOI, 2],
  [Yaku.YAKUHAI2, 2],
  [Yaku.IIPEIKOU, 1],
  [Yaku.RYANPEIKOU, 3],
  [Yaku.HONITSU, 3],
  [Yaku.CHINITSU, 6],
]);

export const sampleHands = samples.map(({ id, fuParts }) => {
  const hand = hands.find((sample) => sample.id === id);
  if (!hand) throw new Error(`Missing TestSeeder hand ${id}`);
  const dora = hand.dora ?? 0;
  const uradora = hand.uradora ?? 0;
  const kandora = hand.kandora ?? 0;
  const kanuradora = hand.kanuradora ?? 0;
  const han = hand.yaku.reduce(
    (total, yaku) => {
      const value = hanValues.get(yaku);
      if (value === undefined) throw new Error(`Unsupported sample yaku ${yaku}`);
      return total + value;
    },
    dora + uradora + kandora + kanuradora
  );
  const tsumo = hand.yaku.includes(Yaku.MENZENTSUMO);
  const fu = hand.yaku.includes(Yaku.CHIITOITSU)
    ? 25
    : hand.yaku.includes(Yaku.PINFU)
      ? tsumo
        ? 20
        : 30
      : Math.ceil(fuParts.reduce((total, value) => total + value, 0) / 10) * 10;
  if (han !== hand.han || fu !== hand.fu) throw new Error(`Inconsistent TestSeeder hand ${id}`);
  return {
    sourceId: id,
    tsumo,
    han,
    fu,
    yaku: [...hand.yaku],
    openHand: hand.openHand,
    dora,
    uradora,
    kandora,
    kanuradora,
  };
});

// Closed hands with compatible yaku. Pinfu uses sequence hands; seven pairs
// combines with honitsu, while ryanpeikou replaces (rather than adds) iipeikou.
const limitYaku = [
  [Yaku.RIICHI, Yaku.IPPATSU, Yaku.PINFU, Yaku.TANYAO, Yaku.IIPEIKOU],
  [Yaku.HONITSU, Yaku.CHIITOITSU, Yaku.RIICHI],
  [Yaku.CHINITSU, Yaku.PINFU, Yaku.IIPEIKOU],
  [Yaku.CHINITSU, Yaku.RYANPEIKOU, Yaku.PINFU, Yaku.RIICHI],
  [Yaku.CHINITSU, Yaku.RYANPEIKOU, Yaku.PINFU, Yaku.RIICHI, Yaku.IPPATSU, Yaku.MENZENTSUMO],
];

export const limitHands = limitYaku.map((yaku) => {
  const han = yaku.reduce((total, value) => total + hanValues.get(value)!, 0);
  if (han < 5 || han > 13) throw new Error('Development limit hands must be 5–13 han');
  return {
    sourceId: 0,
    tsumo: yaku.includes(Yaku.MENZENTSUMO),
    han,
    fu: 0,
    yaku,
    openHand: false,
    dora: 0,
    uradora: 0,
    kandora: 0,
    kanuradora: 0,
  };
});

// The API encodes natural yakuman as negative han. Keep only the yakuman yaku,
// without ordinary yaku or dora, and never combine into multiple yakuman.
export const yakumanHands = [
  { ...limitHands[0], yaku: [Yaku.KOKUSHIMUSOU], han: -1, tsumo: false },
  { ...limitHands[0], yaku: [Yaku.SUUANKOU], han: -1, tsumo: true },
];

export function sampleRound(state: SessionState, index: number, variation: number): Round {
  const players = state.state.playerIds;
  const dealerIndex = players.indexOf(state.getCurrentDealer());
  const opponents = [1, 2, 3].map((offset) => players[(dealerIndex + offset) % 4]);
  const winnerId = opponents[variation % 3];
  const loserId = state.getCurrentDealer();
  const common = {
    roundIndex: state.getRound(),
    honba: state.getHonba(),
    riichiBets: [] as number[],
  };
  const ronSamples = sampleHands.filter((hand) => !hand.tsumo);
  const tsumoSamples = sampleHands.filter((hand) => hand.tsumo);
  const win = (sample: (typeof sampleHands)[number], winner: number): MultironWin => ({
    ...sample,
    winnerId: winner,
    paoPlayerId: 0,
  });
  const riichi = (wins: MultironWin[]) =>
    wins.filter((hand) => hand.yaku.includes(Yaku.RIICHI)).map((hand) => hand.winnerId);
  switch (index) {
    case 1: {
      const hand = win(tsumoSamples[variation % tsumoSamples.length], winnerId);
      return { tsumo: { ...common, ...hand, riichiBets: riichi([hand]) } };
    }
    case 2:
      return {
        draw: {
          ...common,
          tempai: opponents.slice(0, 1 + (variation % 3)),
          riichiBets: [opponents[0]],
        },
      };
    case 3:
      return { abort: common };
    case 4:
      return {
        chombo: {
          roundIndex: common.roundIndex,
          honba: common.honba,
          loserId: variation % 2 ? opponents[0] : loserId,
        },
      };
    case 5:
      return { nagashi: { ...common, tempai: [winnerId], nagashi: [winnerId] } };
    case 6: {
      const wins = [0, 1].map((offset) =>
        win(
          offset === 1 && variation % 3 === 1
            ? limitHands[variation % 4]
            : ronSamples[(variation + offset) % ronSamples.length],
          opponents[offset]
        )
      );
      return {
        multiron: { ...common, loserId, multiRon: wins.length, wins, riichiBets: riichi(wins) },
      };
    }
    case 7:
    case 8: {
      const sample =
        index === 7
          ? limitHands[variation % limitHands.length]
          : yakumanHands[variation % yakumanHands.length];
      const hand = win(sample, winnerId);
      return sample.tsumo
        ? { tsumo: { ...common, ...hand, riichiBets: riichi([hand]) } }
        : { ron: { ...common, ...hand, loserId, riichiBets: riichi([hand]) } };
    }
    default: {
      const hand = win(ronSamples[(variation + index) % ronSamples.length], winnerId);
      return { ron: { ...common, ...hand, loserId, riichiBets: riichi([hand]) } };
    }
  }
}
