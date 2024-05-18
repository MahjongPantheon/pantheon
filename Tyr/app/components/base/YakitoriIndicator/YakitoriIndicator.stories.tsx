import { Meta } from '@storybook/react';

import { YakitoriIndicator } from './YakitoriIndicator';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Atoms / YakitoriIndicator',
  component: YakitoriIndicator,
  decorators: [PageDecorator],
  render: (args) => {
    return <YakitoriIndicator {...args} />;
  },
} satisfies Meta<typeof YakitoriIndicator>;

export const Default = {
  args: {
    size: 'md',
  },
};
