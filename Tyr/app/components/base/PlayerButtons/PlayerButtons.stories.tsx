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

import { PlayerButtons } from './PlayerButtons';
import { PlayerButtonMode } from '../../../helpers/enums';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / PlayerButtons',
  component: PlayerButtons,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <PlayerButtons {...args} />
      </div>
    );
  },
} satisfies Meta<typeof PlayerButtons>;

export const Default = {
  args: {
    winButton: PlayerButtonMode.PRESSED,
    onWinButtonClick: () => {},
    loseButton: PlayerButtonMode.IDLE,
    onLoseButtonClick: () => {},
    riichiButton: PlayerButtonMode.PRESSED,
    onRiichiButtonClick: () => {},
  },
};

export const Full = {
  args: {
    winButton: PlayerButtonMode.IDLE,
    onWinButtonClick: () => {},
    loseButton: PlayerButtonMode.PRESSED,
    onLoseButtonClick: () => {},
    riichiButton: PlayerButtonMode.IDLE,
    onRiichiButtonClick: () => {},
    deadButton: PlayerButtonMode.PRESSED,
    onDeadButtonClick: () => {},
  },
};
