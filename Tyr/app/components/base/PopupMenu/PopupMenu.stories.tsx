import { Meta } from '@storybook/react-vite';

import { PopupMenu } from './PopupMenu';
import { PopupMenuItem } from './PopupMenuItem';
import HomeIcon from '../../../img/icons/home.svg?react';
import LinkIcon from '../../../img/icons/link.svg?react';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / PopupMenu',
  component: PopupMenu,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div
        style={{
          position: 'relative',
          width: '500px',
          height: '500px',
        }}
      >
        <PopupMenu {...args}>
          <PopupMenuItem onClick={() => {}} label='Item1' />
          <PopupMenuItem onClick={() => {}} label='Item2' />
          <PopupMenuItem onClick={() => {}} label='Item3' icon={<HomeIcon />} />
          <PopupMenuItem onClick={() => {}} variant='primary' label='Item4' />
          <PopupMenuItem onClick={() => {}} label='Item5' rightIcon={<LinkIcon />} />
        </PopupMenu>
      </div>
    );
  },
} satisfies Meta<typeof PopupMenu>;

export const Default = {};
