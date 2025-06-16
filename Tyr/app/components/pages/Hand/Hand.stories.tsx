import { Meta } from '@storybook/react-vite';

import { Hand } from './Hand';
import { sortByViewPriority, YakuId, yakuList } from '../../../helpers/yaku';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Pages / Hand',
  component: Hand,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '400px' }}>
        <Hand {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Hand>;

export const Default = {
  args: {
    bottomPanelText: 'Double ron',
    onBackClick: () => {},
    canGoNext: false,
    onNextClick: () => {},

    hands: [
      {
        id: 1,
        playerName: 'Player 1',
        hasAvatar: false,
        lastUpdate: new Date().toString(),
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
      {
        id: 2,
        playerName: 'Player 2',
        hasAvatar: false,
        lastUpdate: new Date().toString(),
        yaku: sortByViewPriority(yakuList).map((y) => y.id),
        selectedYaku: [YakuId.YAKUHAI1, YakuId.HONITSU],
        disabledYaku: [YakuId.CHIITOITSU],
        onYakuClick: () => {},
        isYakuman: false,
        yakuHan: 3,
        doraCount: 1,
        doraValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        onDoraSelected: () => {},
        fuCount: 20,
        fuValues: [20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
        onFuSelected: () => {},
      },
    ],
  },
};
