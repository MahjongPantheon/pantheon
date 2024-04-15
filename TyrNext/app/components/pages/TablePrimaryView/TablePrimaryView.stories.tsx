import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';
import { TablePrimaryView } from './TablePrimaryView';
import { PlayerPointsMode } from '../../../helpers/enums';

export default {
  title: 'Pages / TablePrimaryView',
  component: TablePrimaryView,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <TablePrimaryView {...args} />
      </div>
    );
  },
} satisfies Meta<typeof TablePrimaryView>;

export const Default = {
  args: {
    toimen: {
      id: 12,
      playerName: 'Player Testing',
      hasAvatar: false,
      lastUpdate: new Date().toString(),
      showYakitori: true,
      currentWind: 'e',
      showInlineRiichi: false,
      points: 34000,
      pointsMode: PlayerPointsMode.IDLE,
      penaltyPoints: 20000,
      onPlayerClick: () => {},
    },
    kamicha: {
      id: 12,
      playerName: 'Player Testing',
      hasAvatar: false,
      lastUpdate: new Date().toString(),
      showYakitori: true,
      currentWind: 's',
      showInlineRiichi: false,
      points: 34000,
      pointsMode: PlayerPointsMode.IDLE,
      penaltyPoints: 20000,
      onPlayerClick: () => {},
    },
    shimocha: {
      id: 12,
      playerName: 'Player Testing',
      hasAvatar: false,
      lastUpdate: new Date().toString(),
      showYakitori: true,
      currentWind: 'n',
      showInlineRiichi: false,
      points: 34000,
      pointsMode: PlayerPointsMode.IDLE,
      penaltyPoints: 20000,
      onPlayerClick: () => {},
    },
    self: {
      id: 12,
      playerName: 'Player Testing',
      hasAvatar: false,
      lastUpdate: new Date().toString(),
      showYakitori: true,
      currentWind: 'w',
      showInlineRiichi: false,
      points: 34000,
      pointsMode: PlayerPointsMode.IDLE,
      penaltyPoints: 20000,
      onPlayerClick: () => {},
    },
    tableStatus: {
      tableIndex: 2,
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

    onGoHome: () => {},
    onRefresh: () => {},
    onAddNewGame: () => {},
    onGotoGameLog: () => {},
    topRowUpsideDown: false,

    rulesetConfig: {
      withNagashiMangan: true,
      withAbortives: true,
    },
  },
};
