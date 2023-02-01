import { PlayerNameProps, PlayerText } from '#/components/general/player/partials/PlayerText';
import React from 'react';

type StartWindProps = Omit<PlayerNameProps, 'size'>;

export const StartWind: React.FC<StartWindProps> = (props) => (
  <PlayerText {...props} size='large' />
);
