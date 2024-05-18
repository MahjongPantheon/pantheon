import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';
import { Login } from './Login';

export default {
  title: 'Pages / Login',
  component: Login,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <Login {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Login>;

export const Default = {
  args: {
    onSubmit: () => {},
    onSignupClick: () => {},
    onRecoveryClick: () => {},
  },
};
