import { Meta } from '@storybook/react-vite';

import { HandOfPlayer } from './HandOfPlayer';
import { sortByViewPriority, YakuId, yakuList } from '../../../helpers/yaku';
import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { useState } from 'react';

export default {
  title: 'Molecules / HandOfPlayer',
  component: HandOfPlayer,
  decorators: [PageDecorator],
  render: (args) => {
    const [fuCount, setFuCount] = useState(20);
    const [doraCount, setDoraCount] = useState(2);
    return (
      <div style={{ height: '400px' }}>
        <HandOfPlayer
          {...args}
          fuCount={fuCount}
          onFuSelected={setFuCount}
          doraCount={doraCount}
          onDoraSelected={setDoraCount}
        />
      </div>
    );
  },
} satisfies Meta<typeof HandOfPlayer>;

export const Default = {
  args: {
    yaku: sortByViewPriority(yakuList).map((y) => y.id),
    selectedYaku: [YakuId.TANYAO, YakuId.PINFU],
    disabledYaku: [YakuId.CHIITOITSU],
    onYakuClick: () => {},
    isYakuman: false,
    yakuHan: 2,
    doraCount: 1,
    doraValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    onDoraSelected: () => {},
    fuCount: 20,
    fuValues: [20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
    onFuSelected: () => {},
  },
};

export const WithPao = {
  args: {
    yaku: sortByViewPriority(yakuList).map((y) => y.id),
    selectedYaku: [YakuId.TANYAO, YakuId.PINFU],
    disabledYaku: [YakuId.CHIITOITSU],
    onYakuClick: () => {},
    isYakuman: false,
    yakuHan: 2,
    doraCount: 1,
    doraValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    onDoraSelected: () => {},
    fuCount: 20,
    fuValues: [20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
    onFuSelected: () => {},

    paoSelectRequired: true,
    paoPlayers: [
      {
        playerName: 'Test User 1',
        id: 1,
        hasAvatar: false,
        lastUpdate: new Date(),
      },
      {
        playerName: 'Test User 2',
        id: 2,
        hasAvatar: false,
        lastUpdate: new Date(),
      },
      {
        playerName: 'Test User 3',
        id: 3,
        hasAvatar: false,
        lastUpdate: new Date(),
      },
    ],
    pao: 1,
    onPaoSelected: () => {},
  },
};
