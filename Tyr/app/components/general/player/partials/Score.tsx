import { PlayerText, PlayerTextProps } from '#/components/general/player/partials/PlayerText';
import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';

export type ScoreProps = PropsWithChildren<{
  variant?: 'idle' | 'active' | 'positive' | 'negative';
  onClick?: () => void;
}> &
  Pick<PlayerTextProps, 'rotated'>;

const MAIN_CLASS_NAME = 'player__score';

export const Score: React.FC<ScoreProps> = ({ variant = 'idle', ...restProps }) => (
  <PlayerText
    className={classNames(MAIN_CLASS_NAME, {
      [`${MAIN_CLASS_NAME}--variant-active`]: variant === 'active',
      [`${MAIN_CLASS_NAME}--variant-positive`]: variant === 'positive',
      [`${MAIN_CLASS_NAME}--variant-negative`]: variant === 'negative',
    })}
    size='medium'
    {...restProps}
  />
);
