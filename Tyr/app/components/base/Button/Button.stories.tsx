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

import { Meta } from '@storybook/react';
import { Button } from './Button';
import HomeIcon from '../../../img/icons/home.svg?react';
import LinkIcon from '../../../img/icons/link.svg?react';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Atoms / Button',
  component: Button,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div>
        <Button variant='primary' {...args}>
          Button
        </Button>
        <Button variant='contained' icon={<HomeIcon />} {...args}>
          Button
        </Button>
        <Button variant='outline' rightIcon={<LinkIcon />} {...args}>
          Button
        </Button>
        <Button variant='light' {...args}>
          Button
        </Button>
      </div>
    );
  },
} satisfies Meta<typeof Button>;

export const Default = {};
