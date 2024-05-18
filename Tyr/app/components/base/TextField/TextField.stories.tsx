import { Meta } from '@storybook/react';

import { TextField } from './TextField';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Atoms / TextField',
  component: TextField,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <TextField variant='contained' {...args} />
      </div>
    );
  },
} satisfies Meta<typeof TextField>;

export const Default = {};
