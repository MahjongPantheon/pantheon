import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';
import { TableSelectPlayerStatus } from './TableSelectPlayerStatus';
import { PlayerButtonMode, PlayerPointsMode } from '../../../helpers/enums';

export default {
  title: 'Pages / TableSelectPlayerStatus',
  component: TableSelectPlayerStatus,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <TableSelectPlayerStatus {...args} />
      </div>
    );
  },
} satisfies Meta<typeof TableSelectPlayerStatus>;

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
      buttons: {
        winButton: PlayerButtonMode.DISABLE,
        onWinButtonClick: () => {},
        loseButton: PlayerButtonMode.PRESSED,
        onLoseButtonClick: () => {},
        riichiButton: PlayerButtonMode.IDLE,
        onRiichiButtonClick: () => {},
        deadButton: PlayerButtonMode.IDLE,
        onDeadButtonClick: () => {},
      },
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
      buttons: {
        winButton: PlayerButtonMode.PRESSED,
        onWinButtonClick: () => {},
        loseButton: PlayerButtonMode.DISABLE,
        onLoseButtonClick: () => {},
        riichiButton: PlayerButtonMode.PRESSED,
        onRiichiButtonClick: () => {},
      },
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
      buttons: {
        winButton: PlayerButtonMode.IDLE,
        onWinButtonClick: () => {},
        loseButton: PlayerButtonMode.DISABLE,
        onLoseButtonClick: () => {},
        riichiButton: PlayerButtonMode.IDLE,
        onRiichiButtonClick: () => {},
        deadButton: PlayerButtonMode.IDLE,
        onDeadButtonClick: () => {},
      },
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
      buttons: {
        winButton: PlayerButtonMode.IDLE,
        onWinButtonClick: () => {},
        loseButton: PlayerButtonMode.DISABLE,
        onLoseButtonClick: () => {},
        riichiButton: PlayerButtonMode.IDLE,
        onRiichiButtonClick: () => {},
        deadButton: PlayerButtonMode.IDLE,
        onDeadButtonClick: () => {},
      },
    },

    onGoBack: () => {},
    onGoForward: () => {},
    mayGoForward: true,

    bottomPanelText: 'Ron',

    topRowUpsideDown: false,
  },
};
