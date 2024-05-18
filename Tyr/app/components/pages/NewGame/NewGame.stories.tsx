import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';
import { NewGame } from './NewGame';

export default {
  title: 'Pages / NewGame',
  component: NewGame,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <NewGame {...args} />
      </div>
    );
  },
} satisfies Meta<typeof NewGame>;

export const Default = {
  args: {
    east: 'Player 1',
    south: 'Player 2',
    west: 'Player 3',
    onBackClick: () => {},
    onShuffleClick: () => {},
    onSaveClick: () => {},
    onClearClick: () => {},
    onPlayerClick: () => {},
  },
};
