import { Meta } from '@storybook/react-vite';

import { Loader } from './Loader';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / Loader',
  component: Loader,
  decorators: [PageDecorator],
  render: () => {
    return <Loader />;
  },
} satisfies Meta<typeof Loader>;

export const Default = {};
