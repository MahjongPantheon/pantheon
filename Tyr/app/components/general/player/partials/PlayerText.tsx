import React, { PropsWithChildren } from 'react';
import { Flex } from '#/components/general/flex/Flex';
import classNames from 'classnames';

export type PlayerTextProps = PropsWithChildren<{
  rotated?: 0 | 90 | 180 | 270;
  size?: 'large' | 'medium';
  onClick?: () => void;
  className?: string;
}>;

const ROTATED_CONTAINER_CLASS_NAME = 'player__rotated-container';
const PLAYER_TEXT_CLASS_NAME = 'player__text';

export const PlayerText: React.FC<PlayerTextProps> = ({
  rotated = 0,
  size,
  className,
  onClick,
  children,
}) => {
  const innerElement = (
    <div
      className={classNames(
        PLAYER_TEXT_CLASS_NAME,
        {
          [`${PLAYER_TEXT_CLASS_NAME}--size-medium`]: size === 'medium',
          [`${PLAYER_TEXT_CLASS_NAME}--size-large`]: size === 'large',
          [`${PLAYER_TEXT_CLASS_NAME}--rotated-90`]: rotated === 90,
          [`${PLAYER_TEXT_CLASS_NAME}--rotated-180`]: rotated === 180,
          [`${PLAYER_TEXT_CLASS_NAME}--rotated-270`]: rotated === 270,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );

  switch (rotated) {
    case 90:
    case 270:
      return (
        <Flex direction='column' justify='center' maxHeight>
          <div
            className={classNames(ROTATED_CONTAINER_CLASS_NAME, {
              [`${ROTATED_CONTAINER_CLASS_NAME}--size-medium`]: size === 'medium',
              [`${ROTATED_CONTAINER_CLASS_NAME}--size-large`]: size === 'large',
            })}
          >
            {innerElement}
          </div>
        </Flex>
      );
    case 180:
    case 0:
    default:
      return <Flex justify='center'>{innerElement}</Flex>;
  }
};
