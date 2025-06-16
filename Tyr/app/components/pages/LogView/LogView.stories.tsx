import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { LogView } from './LogView';

export default {
  title: 'Pages / LogView',
  component: LogView,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <LogView {...args} />
      </div>
    );
  },
} satisfies Meta<typeof LogView>;

export const Default = {
  args: {
    players: {
      '2': 'Player 1 ololo kekeke',
      '10': 'Player 2 ololo kekeke',
      '24': 'Player 3 ololo kekeke',
      '1516': 'Player 4 ololo kekeke',
    },
    results: [
      {
        round: '東1',
        scores: [
          {
            playerId: 2,
            score: 25000,
          },
          {
            playerId: 1516,
            score: 25000,
          },
          {
            playerId: 24,
            score: 25000,
          },
          {
            playerId: 10,
            score: 25000,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: 3900,
          },
          {
            playerId: 1516,
            score: -2900,
          },
          {
            playerId: 24,
            score: 0,
          },
          {
            playerId: 10,
            score: -1000,
          },
        ],
      },
      {
        round: '東1',
        scores: [
          {
            playerId: 2,
            score: 28900,
          },
          {
            playerId: 1516,
            score: 22100,
          },
          {
            playerId: 24,
            score: 25000,
          },
          {
            playerId: 10,
            score: 24000,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: -4100,
          },
          {
            playerId: 1516,
            score: 8300,
          },
          {
            playerId: 24,
            score: -2100,
          },
          {
            playerId: 10,
            score: -2100,
          },
        ],
      },
      {
        round: '東2',
        scores: [
          {
            playerId: 2,
            score: 24800,
          },
          {
            playerId: 1516,
            score: 30400,
          },
          {
            playerId: 24,
            score: 22900,
          },
          {
            playerId: 10,
            score: 21900,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: -1500,
          },
          {
            playerId: 1516,
            score: -1500,
          },
          {
            playerId: 24,
            score: 1500,
          },
          {
            playerId: 10,
            score: 1500,
          },
        ],
      },
      {
        round: '東3',
        scores: [
          {
            playerId: 2,
            score: 23300,
          },
          {
            playerId: 1516,
            score: 28900,
          },
          {
            playerId: 24,
            score: 24400,
          },
          {
            playerId: 10,
            score: 23400,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: -8000,
          },
          {
            playerId: 1516,
            score: 2000,
          },
          {
            playerId: 24,
            score: 4000,
          },
          {
            playerId: 10,
            score: 2000,
          },
        ],
      },
      {
        round: '東3',
        scores: [
          {
            playerId: 2,
            score: 15300,
          },
          {
            playerId: 1516,
            score: 30900,
          },
          {
            playerId: 24,
            score: 28400,
          },
          {
            playerId: 10,
            score: 25400,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: 0,
          },
          {
            playerId: 1516,
            score: 0,
          },
          {
            playerId: 24,
            score: 0,
          },
          {
            playerId: 10,
            score: -1000,
          },
        ],
      },
      {
        round: '東3',
        scores: [
          {
            playerId: 2,
            score: 15300,
          },
          {
            playerId: 1516,
            score: 30900,
          },
          {
            playerId: 24,
            score: 28400,
          },
          {
            playerId: 10,
            score: 24400,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: -4000,
          },
          {
            playerId: 1516,
            score: -4000,
          },
          {
            playerId: 24,
            score: 12000,
          },
          {
            playerId: 10,
            score: -4000,
          },
        ],
      },
      {
        round: '東4',
        scores: [
          {
            playerId: 2,
            score: 11300,
          },
          {
            playerId: 1516,
            score: 26900,
          },
          {
            playerId: 24,
            score: 40400,
          },
          {
            playerId: 10,
            score: 20400,
          },
        ],
        scoresDelta: [
          {
            playerId: 2,
            score: 0,
          },
          {
            playerId: 1516,
            score: -10600,
          },
          {
            playerId: 24,
            score: 3900,
          },
          {
            playerId: 10,
            score: 7700,
          },
        ],
      },
    ],
    rounds: [
      {
        riichiOnTable: 0,
        honbaOnTable: 0,
        riichiPlayers: ['Player 2'],
        outcome: 'ROUND_OUTCOME_RON',
        loser: 'Player 4',
        winner: 'Player 1',
        yakuList: ['Pinfu', 'Tanyao'],
        han: 2,
        fu: 30,
        dora: 0,
      },
      {
        riichiOnTable: 0,
        honbaOnTable: 1,
        riichiPlayers: [],
        outcome: 'ROUND_OUTCOME_TSUMO',
        winner: 'Player 4',
        yakuList: ['Yakuhai x1', 'Honitsu', 'Menzentsumo'],
        han: 5,
        fu: 0,
        dora: 0,
      },
      {
        riichiOnTable: 0,
        honbaOnTable: 0,
        riichiPlayers: [],
        outcome: 'ROUND_OUTCOME_DRAW',
        tempai: ['Player 2', 'Player 3'],
      },
      {
        riichiOnTable: 0,
        honbaOnTable: 1,
        riichiPlayers: [],
        outcome: 'ROUND_OUTCOME_CHOMBO',
        penaltyFor: 'Player 1',
      },
      {
        riichiOnTable: 0,
        honbaOnTable: 1,
        riichiPlayers: ['Player 2'],
        outcome: 'ROUND_OUTCOME_ABORT',
      },
      {
        riichiOnTable: 1,
        honbaOnTable: 2,
        riichiPlayers: [],
        outcome: 'ROUND_OUTCOME_NAGASHI',
        tempai: ['Player 2', 'Player 4'],
        nagashi: ['Player 3'],
      },
      {
        riichiOnTable: 1,
        honbaOnTable: 3,
        riichiPlayers: [],
        outcome: 'ROUND_OUTCOME_MULTIRON',
        loser: 'Player 4',
        winnerList: ['Player 2', 'Player 3'],
        paoPlayerList: [null, null],
        yakuList: [['Honitsu'], ['Pinfu', 'Tanyao']],
        hanList: [3, 2],
        fuList: [40, 30],
        doraList: [0, 0],
      },
    ],
    onBackClick: () => {},
    startScore: 25000,
  },
};
