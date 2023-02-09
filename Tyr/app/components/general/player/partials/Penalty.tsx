import React from 'react';
import { PlayerText, PlayerTextProps } from '#/components/general/player/partials/PlayerText';
import classNames from 'classnames';

type PenaltyProps = {
  rotated?: PlayerTextProps['rotated'];
  children: number;
};

export const Penalty: React.FC<PenaltyProps> = ({ rotated, children }) => (
  <PlayerText
    size='small'
    rotated={rotated}
    containerClassName={classNames('player__penalty', {
      [`player__penalty--vertical`]: rotated === 90 || rotated === 270,
    })}
  >
    {`${children / 1000}k`}
  </PlayerText>
);
