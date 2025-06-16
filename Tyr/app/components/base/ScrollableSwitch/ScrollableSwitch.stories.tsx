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

import { ScrollableSwitch } from './ScrollableSwitch';
import { useState } from 'react';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

const makeOptions = (selection: number, setSelection: (selection: number) => void) => [
  {
    label: 'option1',
    selected: selection === 0,
    onSelect: () => {
      setSelection(0);
    },
  },
  {
    label: 'option2',
    selected: selection === 1,
    onSelect: () => {
      setSelection(1);
    },
  },
  {
    label: 'option3',
    selected: selection === 2,
    onSelect: () => {
      setSelection(2);
    },
  },
  {
    label: 'option4',
    selected: selection === 3,
    onSelect: () => {
      setSelection(3);
    },
  },
  {
    label: 'option5',
    selected: selection === 4,
    onSelect: () => {
      setSelection(4);
    },
  },
  {
    label: 'option6',
    selected: selection === 5,
    onSelect: () => {
      setSelection(5);
    },
  },
  {
    label: 'option7',
    selected: selection === 6,
    onSelect: () => {
      setSelection(6);
    },
  },
  {
    label: 'option8',
    selected: selection === 7,
    onSelect: () => {
      setSelection(7);
    },
  },
  {
    label: 'option9',
    selected: selection === 8,
    onSelect: () => {
      setSelection(8);
    },
  },
];

export default {
  title: 'Molecules / ScrollableSwitch',
  component: ScrollableSwitch,
  decorators: [PageDecorator],
  render: () => {
    const [selection, setSelection] = useState(6);
    const options = makeOptions(selection, setSelection);
    return (
      <div style={{ display: 'flex', gap: '10px', width: '300px' }}>
        <ScrollableSwitch options={options} />
      </div>
    );
  },
} satisfies Meta<typeof ScrollableSwitch>;

export const Default = {};
