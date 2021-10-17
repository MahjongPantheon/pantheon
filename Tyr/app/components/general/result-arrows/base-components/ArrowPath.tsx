import * as React from 'react';
import {Point} from '../base';

type IProps = {
  id: string
  start: Point
  center: Point
  end: Point
}

export const ArrowPath = React.memo(function ArrowPath(props: IProps) {
  const {id, start, center, end} = props

  return (
    <g>
      <path id={id} d={`M ${start.x},${start.y} Q${center.x},${center.y} ${end.x},${end.y} `} stroke="currentColor" />
    </g>
  );
})
