import { Meta } from '@storybook/react-vite';

import { NumberSelect } from './NumberSelect';
import { useState } from 'react';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

const options = [
  { value: 1, label: 'Item 1' },
  { value: 2, label: 'Item 2' },
  { value: 3, label: 'Item 3' },
  { value: 4, label: 'Item 4' },
  { value: 5, label: 'Item 5' },
  { value: 6, label: 'Item 6' },
  { value: 7, label: 'Item 7' },
  { value: 8, label: 'Item 8' },
  { value: 9, label: 'Item 9' },
  { value: 10, label: 'Item 10' },
  { value: 11, label: 'Item 11' },
  { value: 12, label: 'Item 12' },
];

export default {
  title: 'Molecules / NumberSelect',
  component: NumberSelect,
  decorators: [PageDecorator],
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    return (
      <div
        style={{
          width: '200px',
          height: '200px',
        }}
      >
        <NumberSelect options={options} selectedIndex={selectedIndex} onChange={setSelectedIndex} />
      </div>
    );
  },
} satisfies Meta<typeof NumberSelect>;

export const Default = {};
