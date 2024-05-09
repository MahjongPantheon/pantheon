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
import { Switch } from './Switch';
import { useState } from 'react';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / Switch',
  component: Switch,
  decorators: [PageDecorator],
  render: (args) => {
    const [currentState, setCurrentState] = useState(false);
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <Switch {...args} value={currentState} onChange={setCurrentState} />
      </div>
    );
  },
} satisfies Meta<typeof Switch>;

export const Default = {
  args: {
    label: 'Some switch',
    description: 'Toggle this switch',
  },
};
