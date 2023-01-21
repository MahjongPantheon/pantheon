import * as React from 'react';
import { Direction, Point, ArrowList } from '../base';
import { getPayment } from '../utils';
import { ArrowText } from '../base-components/ArrowText';
import { ArrowPath } from '../base-components/ArrowPath';
import { RiichiBetByCurve } from '../base-components/RiichiBet';
import { START_ARROWS_OFFSET } from '../vars';
import { ArrowEnd } from '../base-components/ArrowEnd';
import { PlayerSide } from '#/components/general/result-arrows/ResultArrowsProps';

type IProps = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  arrows: ArrowList;
};

export const BottomRightArrow = React.memo(function BottomRightArrow(props: IProps) {
  const { offsetX, offsetY, width, height, arrows } = props;
  const arrow = arrows.BottomRight || arrows.RightBottom;

  if (!arrow) {
    return null;
  }

  const fromBottomToRight = arrow.start === PlayerSide.BOTTOM;
  const payment = getPayment(arrow);
  const id = 'bottom-right';
  const direction = Direction.BOTTOM_RIGHT;

  const start = new Point(width / 2 + START_ARROWS_OFFSET, height);
  const center = new Point(
    width / 2 + START_ARROWS_OFFSET + offsetX,
    height / 2 + START_ARROWS_OFFSET + offsetY
  );
  const end = new Point(width, height / 2 + START_ARROWS_OFFSET);

  return (
    <g>
      <ArrowPath id={id} start={start} center={center} end={end} />
      <ArrowEnd
        start={start}
        center={center}
        end={end}
        inverted={!fromBottomToRight}
        direction={direction}
      />

      {arrow.withRiichi && (
        <RiichiBetByCurve
          start={start}
          center={center}
          end={end}
          inverted={!fromBottomToRight}
          direction={direction}
        />
      )}
      <ArrowText
        payment={payment}
        pathId={id}
        withPao={arrow.withPao}
        isTextAbove={false}
        direction={direction}
      />
    </g>
  );
});
