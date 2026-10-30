import { Round } from 'tsclients/proto/atoms.pb.js';
import { Yaku } from '../helpers/yaku.js';

const win = {
  roundIndex: 2,
  honba: 1,
  riichiBets: [2],
  winnerId: 2,
  loserId: 3,
  paoPlayerId: 0,
  openHand: false,
  han: 1,
  fu: 30,
  yaku: [Yaku.TANYAO],
  dora: 0,
  uradora: 0,
  kandora: 0,
  kanuradora: 0,
};

export const roundFixtures: Array<[string, Round]> = [
  ['ron', { ron: { ...win } }],
  [
    'tsumo',
    {
      tsumo: {
        roundIndex: 2,
        honba: 1,
        riichiBets: [2],
        winnerId: 2,
        paoPlayerId: 0,
        openHand: false,
        han: 1,
        fu: 30,
        yaku: [Yaku.TANYAO],
        dora: 0,
        uradora: 0,
        kandora: 0,
        kanuradora: 0,
      },
    },
  ],
  ['draw', { draw: { roundIndex: 2, honba: 1, riichiBets: [2], tempai: [1, 2] } }],
  ['abort', { abort: { roundIndex: 2, honba: 1, riichiBets: [2] } }],
  ['chombo', { chombo: { loserIds: [3], roundIndex: 2, honba: 1 } }],
  ['nagashi', { nagashi: { roundIndex: 2, honba: 1, riichiBets: [2], tempai: [2], nagashi: [2] } }],
  [
    'multiron',
    {
      multiron: {
        roundIndex: 2,
        honba: 1,
        riichiBets: [2],
        loserId: 3,
        multiRon: 2,
        wins: [{ ...win }, { ...win, winnerId: 4 }],
      },
    },
  ],
];
