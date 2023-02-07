import { PlayerTextProps, PlayerText } from '#/components/general/player/partials/PlayerText';
import React from 'react';

type StartWindProps = Omit<PlayerTextProps, 'size' | 'verticalMaxHeight'>;

export const StartWind: React.FC<StartWindProps> = (props) => (
  <PlayerText {...props} size='large' />
);
