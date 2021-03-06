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

export const TopLeftArrow = React.memo(function TopLeftArrow(props: IProps) {
  const {offsetX, offsetY, width, height, arrows} = props
  const arrow = arrows.TopLeft || arrows.LeftTop

  if (!arrow) {
    return null
  }

  const fromLeftToTop = arrow.start === PlayerSide.LEFT;
  const showRiichi = arrow.withRiichi;
  const payment = getPayment(arrow);
  const id = 'top-left';
  const direction = Direction.TOP_LEFT;

  const start =  new Point(0, height/2 - START_ARROWS_OFFSET);
  const center = new Point(width/2 - START_ARROWS_OFFSET - offsetX, height/2 - START_ARROWS_OFFSET - offsetY);
  const end = new Point(width/2 - START_ARROWS_OFFSET, 0);

  return (
    <g>
      <ArrowPath id={id} start={start} center={center} end={end} />
      <ArrowEnd start={start} center={center} end={end} inverted={!fromLeftToTop} direction={direction} />

      {showRiichi && (
        <RiichiBetByCurve start={start} center={center} end={end} inverted={!fromLeftToTop} direction={direction} />
      )}
      <ArrowText payment={payment} pathId={id} withPao={arrow.withPao} isTextAbove={true} direction={direction} />
    </g>
  )
})
