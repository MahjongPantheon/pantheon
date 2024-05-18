import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react';
import { TableRoundPreview } from './TableRoundPreview';
import { PlayerSide } from '../../base/ResultArrows/ResultArrowsProps';
import { PlayerPointsMode } from '../../../helpers/enums';

export default {
  title: 'Pages / TableRoundPreview',
  component: TableRoundPreview,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <TableRoundPreview {...args} />
      </div>
    );
  },
} satisfies Meta<typeof TableRoundPreview>;

export const Default = {
  args: {
    toimen: {
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
    kamicha: {
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
    shimocha: {
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
    self: {
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
    results: {
      arrows: [
        {
          points: 1000,
          honbaPoints: 300,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.LEFT,
          end: PlayerSide.BOTTOM,
        },
        {
          points: 1000,
          honbaPoints: 300,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.TOP,
        },
        {
          points: 1000,
          honbaPoints: 300,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.LEFT,
          end: PlayerSide.RIGHT,
        },
        {
          points: 1000,
          honbaPoints: 300,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.BOTTOM,
        },
        {
          points: 1000,
          honbaPoints: 300,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.LEFT,
          end: PlayerSide.TOP,
        },
        {
          points: 1000,
          honbaPoints: 300,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.BOTTOM,
        },
      ],
    },
  },
};
