import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { EventSelect } from './EventSelect';

export default {
  title: 'Pages / EventSelect',
  component: EventSelect,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <EventSelect {...args} />
      </div>
    );
  },
} satisfies Meta<typeof EventSelect>;

export const Default = {
  args: {
    player: {
      playerName: 'Player 1',
      id: 1,
      hasAvatar: false,
      lastUpdate: new Date().toString(),
    },
    events: [
      {
        id: 1,
        title: 'Event 1',
        description: 'Event 1 description',
        isOnline: false,
      },
      {
        id: 2,
        title: 'Event 2',
        description: 'Event 2 description',
        isOnline: false,
      },
      {
        id: 3,
        title: 'Event 3',
        description: 'Event 3 description',
        isOnline: false,
      },
      {
        id: 4,
        title: 'Event 4',
        description: 'Event 4 description',
        isOnline: false,
      },
      {
        id: 5,
        title: 'Event 5',
        description: 'Event 5 description',
        isOnline: false,
      },
    ],
    currentEvent: 2,
    onBackClick: () => {},
    onSettingClick: () => {},
    onSelectEvent: () => {},
  },
};
