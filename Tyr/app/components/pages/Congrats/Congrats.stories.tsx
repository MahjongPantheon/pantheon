import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';
import { Congrats } from './Congrats';

export default {
  title: 'Pages / Congrats',
  component: Congrats,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <Congrats {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Congrats>;

export const Default = {
  args: {
    onBackClick: () => {},
    onOpenPageClick: () => {},
  },
};
