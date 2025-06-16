import { Meta } from '@storybook/react-vite';
import { Home } from './Home';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Pages / Home',
  component: Home,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <Home {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Home>;

export const Default = {
  args: {
    eventName: 'My Test Event',
    canStartGame: true,
    hasStartedGame: false,
    hasPrevGame: true,
    canSeeOtherTables: true,
    hasStat: true,
    showDonate: true,
  },
};

export const InGame = {
  args: {
    eventName: 'My Test Event',
    canStartGame: false,
    hasStartedGame: true,
    hasPrevGame: true,
    canSeeOtherTables: true,
    hasStat: true,
    showDonate: true,
  },
};
