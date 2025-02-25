import { LineChart as LineGraph } from '@mantine/charts';
import React from 'react';

export interface XAxisTickProps {
  x: number;
  y: number;
  payload: { value: string };
}

export class CustomizedAxisTick extends React.PureComponent {
  render() {
    const { x, y, payload } = this.props as XAxisTickProps;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor='middle' fill='#666'>
          {payload.value}
        </text>
      </g>
    );
  }
}

export default LineGraph;
