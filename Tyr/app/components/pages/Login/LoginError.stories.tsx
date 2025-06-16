import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { LoginError } from './LoginError';

export default {
  title: 'Pages / Login Error',
  component: LoginError,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <LoginError {...args} />
      </div>
    );
  },
} satisfies Meta<typeof LoginError>;

export const Default = {
  args: {
    onOkClick: () => {},
    recoveryLink: '#',
  },
};
