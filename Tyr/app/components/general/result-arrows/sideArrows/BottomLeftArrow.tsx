import * as React from 'react';
import {Direction, Point, ArrowList} from '../base';
import {getPayment} from '../utils';
import {ArrowText} from '../base-components/ArrowText';
import {ArrowPath} from '../base-components/ArrowPath';
import {RiichiBetByCurve} from '../base-components/RiichiBet';
import {START_ARROWS_OFFSET} from '../vars';
import {ArrowEnd} from '../base-components/ArrowEnd';
import {PlayerSide} from '#/components/general/result-arrows/ResultArrowsProps';

type IProps = {
  offsetX: number
  offsetY: number
  width: number
  height: number
  arrows: ArrowList
}

export const BottomLeftArrow = React.memo(function BottomLeftArrow(props: IProps) {
  const {offsetX, offsetY, width, height, arrows} = props
  const arrow = arrows.BottomLeft || arrows.LeftBottom

  if (!arrow) {
    return null
  }

  const fromLeftToBottom = arrow.start === PlayerSide.LEFT;
  const showRiichi = arrow.withRiichi;
  const payment = getPayment(arrow);
  const id = 'left-bottom';
  const direction = Direction.BOTTOM_LEFT;

  let start = new Point(0, height/2 + START_ARROWS_OFFSET);
  let center = new Point(width/2 - START_ARROWS_OFFSET - offsetX, height/2 + START_ARROWS_OFFSET + offsetY);
  let end = new Point(width/2 - START_ARROWS_OFFSET, height);

  return (
    <g>
      <ArrowPath id={id} start={start} center={center} end={end} />
      <ArrowEnd start={start} center={center} end={end} inverted={!fromLeftToBottom} direction={direction} />

      {showRiichi && (
        <RiichiBetByCurve start={start} center={center} end={end} inverted={!fromLeftToBottom} direction={direction} />
      )}
      <ArrowText payment={payment} pathId={id} withPao={arrow.withPao} isTextAbove={false} direction={direction} />
    </g>
  )
})
