import { PlayerText, PlayerTextProps } from '#/components/general/player/partials/PlayerText';
import React from 'react';
import classNames from 'classnames';
import { Flex, FlexProps } from '#/components/general/flex/Flex';

export type StatusProps = Pick<PlayerTextProps, 'rotated' | 'children'> & {
  variant?: 'idle' | 'active' | 'success' | 'danger';
  onClick?: () => void;
  after?: JSX.Element;
};

const TEXT_CLASS_NAME = 'player__status-text';
const STATUS_CLASS_NAME = 'player__status-container';

export const Status: React.FC<StatusProps> = ({
  variant = 'idle',
  rotated,
  after,
  onClick,
  children,
}) => {
  const isVertical = rotated === 90 || rotated === 270;
  let direction: FlexProps['direction'] = 'row';
  switch (rotated) {
    case 90:
      direction = 'column';
      break;
    case 180:
      direction = 'row-reverse';
      break;
    case 270:
      direction = 'column-reverse';
      break;
  }

  return (
    <Flex
      className={STATUS_CLASS_NAME}
      direction={direction}
      justify='center'
      alignItems='center'
      maxHeight={isVertical}
      gap={8}
    >
      <div style={{ visibility: 'hidden' }}></div>
      <div
        className={classNames(TEXT_CLASS_NAME, {
          [`${TEXT_CLASS_NAME}--vertical`]: isVertical,
          [`${TEXT_CLASS_NAME}--variant-active`]: variant === 'active',
          [`${TEXT_CLASS_NAME}--variant-positive`]: variant === 'success',
          [`${TEXT_CLASS_NAME}--variant-negative`]: variant === 'danger',
        })}
        onClick={onClick}
      >
        <PlayerText rotated={rotated} size='medium'>
          {children}
        </PlayerText>
      </div>
      <Flex direction={direction} justify='start'>
        {after}
      </Flex>
    </Flex>
  );
};
