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

import { TabbedView } from './TabbedView';
import { Meta } from '@storybook/react-vite';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

const tabs = [
  { title: 'Tab 1 content', content: <div>Tab 1 testing content</div> },
  { title: 'Tab 2 content', content: <div>Tab 2 testing content</div> },
  { title: 'Tab 3 content', content: <div>Tab 3 testing content</div> },
  { title: 'Tab 4 content', content: <div>Tab 4 testing content</div> },
  { title: 'Tab 5 content', content: <div>Tab 5 testing content</div> },
];

export default {
  title: 'Molecules / TabbedView',
  component: TabbedView,
  decorators: [PageDecorator],
  render: () => {
    return (
      <div style={{ display: 'flex', gap: '10px', width: '500px' }}>
        <TabbedView tabs={tabs} />
      </div>
    );
  },
} satisfies Meta<typeof TabbedView>;

export const Default = {};
