import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { Penalties } from './Penalties';

export default {
  title: 'Pages / Penalties',
  component: Penalties,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <Penalties {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Penalties>;

export const Default = {
  args: {
    onBackClick: () => {},
    penaltiesList: [
      {
        id: 1,
        amount: 3000,
        reason: 'Bad behavior',
        isCancelled: false,
      },
      {
        id: 2,
        amount: 5000,
        reason: 'Too much noise',
        isCancelled: false,
      },
      {
        id: 3,
        amount: 10000,
        reason: 'Cheating',
        isCancelled: true,
      },
    ],
  },
};
