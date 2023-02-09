import React from 'react';
import { PlayerTextProps, PlayerText } from '#/components/general/player/partials/PlayerText';
import { Flex, FlexProps } from '#/components/general/flex/Flex';
import { Wind } from '#/components/general/player/partials/Wind';

type NameProps = Omit<PlayerTextProps, 'size' | 'verticalMaxHeight'> & {
  inlineWind?: string;
};

export const Name: React.FC<NameProps> = ({ inlineWind, rotated, children, ...restProps }) => {
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
      direction={direction}
      justify='center'
      maxHeight={rotated === 90 || rotated === 270}
      gap={8}
    >
      {inlineWind !== undefined && (
        <Wind rotated={rotated} size='medium'>
          {inlineWind}
        </Wind>
      )}
      <PlayerText {...restProps} rotated={rotated} size='medium'>
        {children}
      </PlayerText>
    </Flex>
  );
};
