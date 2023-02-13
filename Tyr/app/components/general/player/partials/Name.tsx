import React, { PropsWithChildren } from 'react';
import { RotatedContainer } from '#/components/general/player/partials/RotatedContainer';

type NameProps = PropsWithChildren<{
  rotated?: 0 | 90 | 180 | 270;
  inlineWind?: string;
}>;

export const Name: React.FC<NameProps> = ({ inlineWind, rotated, children, ...restProps }) => {
  return (
    <RotatedContainer rotated={rotated}>
      <div className='player__name'>
        {inlineWind !== undefined && <span className='player__inline-wind'>{inlineWind}</span>}
        {children}
      </div>
    </RotatedContainer>
  );
};
