import { Meta } from '@storybook/react';
import { GameResult } from './GameResult';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Pages / GameResult',
  component: GameResult,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <GameResult {...args} />
      </div>
    );
  },
} satisfies Meta<typeof GameResult>;

export const Default = {
  args: {
    showRepeatButton: true,
    results: [
      {
        sessionHash: '12345',
        eventId: 1,
        playerId: 1,
        score: 10000,
        ratingDelta: -10000,
        place: 4,
        title: 'Player 1',
        hasAvatar: false,
        lastUpdate: new Date().toString(),
      },
      {
        sessionHash: '12345',
        eventId: 1,
        playerId: 2,
        score: 25000,
        ratingDelta: 0,
        place: 3,
        title: 'Player 2',
        hasAvatar: false,
        lastUpdate: new Date().toString(),
      },
      {
        sessionHash: '12345',
        eventId: 1,
        playerId: 3,
        score: 30000,
        ratingDelta: 5000,
        place: 2,
        title: 'Player 3',
        hasAvatar: false,
        lastUpdate: new Date().toString(),
      },
      {
        sessionHash: '12345',
        eventId: 1,
        playerId: 4,
        score: 40000,
        ratingDelta: 10000,
        place: 1,
        title: 'Player 4',
        hasAvatar: false,
        lastUpdate: new Date().toString(),
      },
    ],
    onCheckClick: () => {},
    onRepeatClick: () => {},
  },
};

export const NoResults = {
  args: {
    results: [],
    showRepeatButton: false,
    onCheckClick: () => {},
    onRepeatClick: () => {},
  },
};
