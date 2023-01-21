import * as React from 'react';
import { Direction, Point } from '../base';
import { ARROW_BACKGROUND_WIDTH, ARROW_HEIGHT } from '../vars';
import { getArrowAngle } from '../utils';

type IProps = {
  start: Point;
  center: Point;
  end: Point;
  inverted: boolean;
  direction: Direction;
};

export const ArrowEnd = React.memo(function ArrowEnd(props: IProps) {
  const { start, center, end, inverted, direction } = props;

  if (inverted) {
    const l = [Direction.TOP_RIGHT, Direction.BOTTOM_LEFT].includes(direction) ? 1 : -1;
    const angle = getArrowAngle(start, center, end) * l;
    return <ArrowEndByAnge offset={start} angle={angle} />;
  } else {
    const l = [Direction.TOP_LEFT, Direction.BOTTOM_RIGHT].includes(direction) ? 1 : -1;
    const angle = getArrowAngle(end, center, start) * l;
    return <ArrowEndByAnge offset={end} angle={angle} />;
  }
});

type ArrowEndInnerProps = {
  offset: Point;
  angle: number;
};

export const ArrowEndByAnge = React.memo(function ArrowEnd(props: ArrowEndInnerProps) {
  const { offset, angle } = props;

  return (
    <g transform={`translate(${offset.x} ${offset.y})`}>
      <g transform={`rotate(${angle})`}>
        <rect
          x='-1'
          y={-ARROW_HEIGHT / 2}
          width={ARROW_BACKGROUND_WIDTH}
          height={ARROW_HEIGHT}
          style={{ fill: 'var(--bg-color)' }}
        />
        <path
          d='m 0,0 12.693819,-3.57903 c -1.499915,3.09366 -0.947277,5.02928 0,7.17478 l -12.693819,-3.59575'
          fill='currentColor'
        />
      </g>
    </g>
  );
});
