import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { RotatedFlex } from '#/components/general/player/partials/RotatedFlex';

type WindProps = PropsWithChildren<{
  rotated?: 0 | 90 | 180 | 270;
  size: 'large' | 'medium';
}>;

const CLASS_NAME = 'player__wind';

export const Wind: React.FC<WindProps> = ({ rotated, size, children }) => (
  <div
    className={classNames(CLASS_NAME, {
      [`${CLASS_NAME}--rotated-90`]: rotated === 90,
      [`${CLASS_NAME}--rotated-180`]: rotated === 180,
      [`${CLASS_NAME}--rotated-270`]: rotated === 270,
      [`${CLASS_NAME}--size-medium`]: size === 'medium',
      [`${CLASS_NAME}--size-large`]: size === 'large',
    })}
  >
    {children}
  </div>
);

export const StartWind: React.FC<Omit<WindProps, 'size'>> = ({ rotated, children }) => (
  <RotatedFlex orientation={rotated === 90 || rotated === 270 ? 'vertical' : 'horizontal'}>
    <Wind size='large' rotated={rotated}>
      {children}
    </Wind>
  </RotatedFlex>
);
