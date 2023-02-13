import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { RotatedFlex } from '#/components/general/player/partials/RotatedFlex';

type WindProps = PropsWithChildren<{
  rotated?: 0 | 90 | 180 | 270;
}>;

const CLASS_NAME = 'player__wind';

export const StartWind: React.FC<Omit<WindProps, 'size'>> = ({ rotated, children }) => (
  <RotatedFlex orientation={rotated === 90 || rotated === 270 ? 'vertical' : 'horizontal'}>
    <div
      className={classNames(CLASS_NAME, {
        [`${CLASS_NAME}--rotated-90`]: rotated === 90,
        [`${CLASS_NAME}--rotated-180`]: rotated === 180,
        [`${CLASS_NAME}--rotated-270`]: rotated === 270,
      })}
    >
      {children}
    </div>
  </RotatedFlex>
);
