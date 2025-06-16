/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Meta } from '@storybook/react-vite';

import { Avatar } from './Avatar';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Atoms / Avatar',
  component: Avatar,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <Avatar {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Avatar>;

export const Default = {
  args: {
    playerName: 'Test User',
    id: 123,
    hasAvatar: false,
    lastUpdate: new Date(),
    size: 24,
  },
};
