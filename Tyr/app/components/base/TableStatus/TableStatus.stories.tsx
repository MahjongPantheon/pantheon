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
import { TableStatus } from './TableStatus';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / TableStatus',
  component: TableStatus,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <TableStatus {...args} />
      </div>
    );
  },
} satisfies Meta<typeof TableStatus>;

export const Default = {
  args: {
    tableIndex: 2,
    width: 300,
    height: 300,
    showCallReferee: true,
    onCallRefereeClick: () => {},

    tableStatus: {
      roundIndex: 5,
      riichiCount: 2,
      honbaCount: 3,
      lastHandStarted: false,
    },

    timerState: {
      useTimer: true,
      timerWaiting: false,
      secondsRemaining: 500,
    },
  },
};

export const NoTimer = {
  args: {
    tableIndex: 2,
    width: 300,
    height: 300,
    showCallReferee: true,
    onCallRefereeClick: () => {},

    tableStatus: {
      roundIndex: 5,
      riichiCount: 2,
      honbaCount: 3,
      lastHandStarted: false,
    },

    timerState: {
      useTimer: false,
    },
  },
};

export const LastHand = {
  args: {
    tableIndex: 2,
    width: 300,
    height: 300,
    showCallReferee: true,
    onCallRefereeClick: () => {},

    tableStatus: {
      roundIndex: 5,
      riichiCount: 2,
      honbaCount: 3,
      lastHandStarted: true,
    },

    timerState: {
      useTimer: true,
      timerWaiting: false,
      secondsRemaining: 0,
    },
  },
};

export const OtherTable = {
  args: {
    tableIndex: 2,
    width: 300,
    height: 300,
    showRotateButtons: true,
    onCwRotateClick: () => {},
    onCcwRotateClick: () => {},

    tableStatus: {
      roundIndex: 5,
      riichiCount: 2,
      honbaCount: 3,
      lastHandStarted: false,
    },

    timerState: {
      useTimer: true,
      timerWaiting: false,
      secondsRemaining: 500,
    },
  },
};
