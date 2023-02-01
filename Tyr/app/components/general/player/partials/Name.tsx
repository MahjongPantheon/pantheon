import React from 'react';
import { PlayerNameProps, PlayerText } from '#/components/general/player/partials/PlayerText';

type NameProps = Omit<PlayerNameProps, 'size'> & {
  inlineWind?: string;
};

/** @internal */
export const Name: React.FC<NameProps> = ({ inlineWind, children, ...restProps }) => (
  <PlayerText {...restProps} size='medium'>
    {inlineWind !== undefined && <span className='player__inline-wind'>{inlineWind}</span>}
    {children}
  </PlayerText>
);
