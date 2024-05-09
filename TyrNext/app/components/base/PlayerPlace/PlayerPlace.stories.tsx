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
import { PlayerPlace } from './PlayerPlace';
import { PlayerButtonMode, PlayerPointsMode } from '../../../helpers/enums';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / PlayerPlace',
  component: PlayerPlace,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <PlayerPlace {...args} />
      </div>
    );
  },
} satisfies Meta<typeof PlayerPlace>;

export const Default = {
  args: {
    id: 12,
    playerName: 'Player Testing',
    hasAvatar: false,
    lastUpdate: new Date().toString(),
    showYakitori: true,
    currentWind: 'e',
    gotRiichiFromTable: 1,
    showInlineRiichi: true,
    points: 34000,
    pointsMode: PlayerPointsMode.IDLE,
    penaltyPoints: 20000,
    onPlayerClick: () => {},
  },
};

export const OnlyName = {
  args: {
    id: 12,
    playerName: 'Player Testing',
    hasAvatar: false,
    lastUpdate: new Date().toString(),
    showYakitori: true,
    currentWind: 'e',
    onPlayerClick: () => {},
  },
};

export const WithButtons = {
  args: {
    id: 12,
    playerName: 'Player Testing',
    hasAvatar: false,
    lastUpdate: new Date().toString(),
    showYakitori: true,
    currentWind: 'e',
    showInlineRiichi: true,
    points: 34000,
    pointsMode: PlayerPointsMode.IDLE,
    penaltyPoints: 20000,
    onPlayerClick: () => {},
    buttons: {
      winButton: PlayerButtonMode.PRESSED,
      onWinButtonClick: () => {},
      loseButton: PlayerButtonMode.DISABLE,
      onLoseButtonClick: () => {},
      riichiButton: PlayerButtonMode.IDLE,
      onRiichiButtonClick: () => {},
      deadButton: PlayerButtonMode.IDLE,
      onDeadButtonClick: () => {},
      // rotateActionIcons?: 'cw' | 'ccw';
    },
  },
};
