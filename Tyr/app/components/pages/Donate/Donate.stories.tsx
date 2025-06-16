import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { Donate } from './Donate';

export default {
  title: 'Pages / Donate',
  component: Donate,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <Donate {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Donate>;

export const Default = {
  args: {
    onBackClick: () => {},
    onDonateClick: () => {},
  },
};
