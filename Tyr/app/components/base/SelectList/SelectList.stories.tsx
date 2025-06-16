import { SelectList } from './SelectList';
import { Meta } from '@storybook/react-vite';
import { Player } from '../Player/Player';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

const items = [
  { id: 1, label: 'Item 1' },
  { id: 2, label: 'Item 2' },
  { id: 3, label: 'Item 3' },
  {
    id: 4,
    label: (
      <Player
        playerName='Player 1'
        id={12}
        size='lg'
        lastUpdate={new Date().toString()}
        hasAvatar={false}
      />
    ),
  },
  { id: 5, label: 'Item 5' },
  { id: 6, label: 'Item 6' },
  { id: 7, label: 'Item 7' },
];

export default {
  title: 'Molecules / SelectList',
  component: SelectList,
  decorators: [PageDecorator],
  render: () => {
    return (
      <div
        style={{
          position: 'relative',
          width: '500px',
          height: '500px',
        }}
      >
        <SelectList currentSelection={3} items={items} onSelect={() => {}} />
      </div>
    );
  },
} satisfies Meta<typeof SelectList>;

export const Default = {};
