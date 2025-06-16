import { Meta } from '@storybook/react-vite';

import { StaticSelector } from './StaticSelector';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / StaticSelector',
  component: StaticSelector,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <StaticSelector {...args} />
      </div>
    );
  },
} satisfies Meta<typeof StaticSelector>;

export const Default = {
  args: {
    placeholder: 'select player',
  },
};
