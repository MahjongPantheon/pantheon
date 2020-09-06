import * as React from 'react';
import {Point, ArrowList} from '../base';
import {getPayment} from '../utils';
import {RiichiBet} from '../base-components/RiichiBet';
import {
  RIICHI_HEIGHT,
  RIICHI_WIDTH,
  TEXT_PATH_OFFSET,
} from '../vars';
import {ArrowEndByAnge} from '../base-components/ArrowEnd';
import {PlayerSide} from '#/components/general/result-arrows/ResultArrowsProps';

type IProps = {
  width: number
  height: number
  arrows: ArrowList
}

export const TopBottomArrow = React.memo(function TopBottomArrow(props: IProps) {
  const {width, height, arrows} = props
  const arrow = arrows.BottomTop || arrows.TopBottom

  if (!arrow) {
    return null
  }

  const fromTopToBottom = arrow.start === PlayerSide.TOP;
  const getTextAnchor = (fromStart: boolean) => fromStart ? 'start' : 'end';
  const getStartOffset = (fromStart: boolean) => fromStart ? '5%' : '95%';
  const riichiOffsetX = width / 2 - RIICHI_HEIGHT / 2 - TEXT_PATH_OFFSET
  const riichiOffsetY = height * 0.05 + RIICHI_WIDTH / 2

  const payment = getPayment(arrow);
  const id = 'top-bottom';

  return (
    <g>
      <g>
        <path id={id} d={`M ${width/2} ${0} V ${height}`} stroke="currentColor" fill="none"/>
        {fromTopToBottom && (
          <ArrowEndByAnge offset={new Point(width / 2, height)} angle={-90} />
        )}
        {!fromTopToBottom && (
          <ArrowEndByAnge offset={new Point(width / 2, 0)} angle={90} />
        )}

        <text transform={`translate(${TEXT_PATH_OFFSET} ${0})`}>
          <textPath xlinkHref={'#'+id} startOffset={getStartOffset(!fromTopToBottom)} textAnchor={getTextAnchor(!fromTopToBottom)} fill="currentColor">
            {payment}
          </textPath>
        </text>
        {arrow.withRiichi && (
          <RiichiBet offsetX={riichiOffsetX} offsetY={riichiOffsetY} angle={90} />
        )}

        {arrow.withPao && (
          <text transform={`translate(${TEXT_PATH_OFFSET} ${0})`}>
            <textPath xlinkHref={'#'+id} startOffset={getStartOffset(fromTopToBottom)} textAnchor={getTextAnchor(fromTopToBottom)} fill="currentColor">
              pao
            </textPath>
          </text>
        )}
      </g>

    </g>
  );
})
