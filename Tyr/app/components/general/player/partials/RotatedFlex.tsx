import React, { PropsWithChildren } from 'react';
import { Flex } from '#/components/general/flex/Flex';

type RotatedFlexProps = PropsWithChildren<{
  orientation?: 'horizontal' | 'vertical';
}>;

export const RotatedFlex: React.FC<RotatedFlexProps> = ({ orientation, children }) => {
  const isVertical = orientation === 'vertical';

  return (
    <Flex justify='center' direction={isVertical ? 'column' : 'row'} maxHeight={isVertical}>
      {children}
    </Flex>
  );
};
