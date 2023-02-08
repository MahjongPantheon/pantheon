import { PlayerText, PlayerTextProps } from '#/components/general/player/partials/PlayerText';
import React from 'react';

export type StatusProps = Pick<PlayerTextProps, 'rotated' | 'onClick' | 'variant' | 'children'>;

export const Status: React.FC<StatusProps> = ({ variant = 'idle', ...restProps }) => (
  <PlayerText size='medium' variant={variant} {...restProps} />
);
