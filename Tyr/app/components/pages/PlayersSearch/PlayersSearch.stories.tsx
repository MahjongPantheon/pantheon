import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { PlayersSearch } from './PlayersSearch';

export default {
  title: 'Pages / PlayerSearch',
  component: PlayersSearch,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <PlayersSearch {...args} />
      </div>
    );
  },
} satisfies Meta<typeof PlayersSearch>;

export const Default = {
  args: {
    users: Array.from({ length: 10 }).map((_, index) => ({
      id: index + 1,
      playerName: 'Player ' + (index + 1),
      tenhouId: '',
      ignoreSeating: false,
      hasAvatar: false,
      lastUpdate: new Date().toString(),
    })),
    onUserClick: () => {},
    onBackClick: () => {},
  },
};
