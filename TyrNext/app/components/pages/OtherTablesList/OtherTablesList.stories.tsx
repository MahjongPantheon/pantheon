import { OtherTablesList } from './OtherTablesList';
import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';

export default {
  title: 'Pages / OtherTablesList',
  component: OtherTablesList,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <OtherTablesList {...args} />
      </div>
    );
  },
} satisfies Meta<typeof OtherTablesList>;

export const Default = {
  args: {
    tables: Array.from({ length: 10 }).map((_, idx) => ({
      sessionHash: '123456',
      currentRoundIndex: idx + 1,
      players: [
        {
          id: 1,
          playerName: 'Player 1',
          hasAvatar: false,
          lastUpdate: new Date().toString(),
        },
        {
          id: 2,
          playerName: 'Player 2',
          hasAvatar: false,
          lastUpdate: new Date().toString(),
        },
        {
          id: 3,
          playerName: 'Player 3',
          hasAvatar: false,
          lastUpdate: new Date().toString(),
        },
        {
          id: 4,
          playerName: 'Player 4',
          hasAvatar: false,
          lastUpdate: new Date().toString(),
        },
      ],
      scores: [{ score: 10000 }, { score: 20000 }, { score: 30000 }, { score: 40000 }],
    })),
    onTableClick: () => {},
    onBackClick: () => {},
  },
};
