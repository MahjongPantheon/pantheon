import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { Flex } from '#/components/general/flex/Flex';
import { RotatedContainer } from '#/components/general/player/partials/RotatedContainer';

export type StatusProps = PropsWithChildren<{
  rotated?: 0 | 90 | 180 | 270;
  variant?: 'idle' | 'active' | 'success' | 'danger';
  onClick?: () => void;
  after?: JSX.Element;
}>;

const TEXT_CLASS_NAME = 'player__status-text';
const STATUS_CLASS_NAME = 'player__status-container';

export const Status: React.FC<StatusProps> = ({
  variant = 'idle',
  rotated,
  after,
  onClick,
  children,
}) => {
  return (
    <RotatedContainer rotated={rotated}>
      <Flex maxWidth className={STATUS_CLASS_NAME} justify='center' alignItems='center' gap={8}>
        <div style={{ visibility: 'hidden' }}></div>

        <div
          className={classNames(TEXT_CLASS_NAME, {
            [`${TEXT_CLASS_NAME}--variant-active`]: variant === 'active',
            [`${TEXT_CLASS_NAME}--variant-positive`]: variant === 'success',
            [`${TEXT_CLASS_NAME}--variant-negative`]: variant === 'danger',
          })}
          onClick={onClick}
        >
          {children}
        </div>
        <Flex justify='start'>{after}</Flex>
      </Flex>
    </RotatedContainer>
  );
};
