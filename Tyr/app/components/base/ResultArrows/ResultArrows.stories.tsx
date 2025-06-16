import { ResultArrows } from './ResultArrows';
import { Meta } from '@storybook/react-vite';
import { PlayerSide } from './ResultArrowsProps';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

const arrows = [
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
];

export default {
  title: 'Molecules / ResultArrows',
  component: ResultArrows,
  decorators: [PageDecorator],
  render: () => {
    return (
      <div
        style={{
          width: '300px',
          height: '300px',
        }}
      >
        <ResultArrows arrows={arrows} width={300} height={300} />
      </div>
    );
  },
} satisfies Meta<typeof ResultArrows>;

export const Default = {};
