import React from 'react';
import { Flex } from '#/components/general/flex/Flex';

import RotateCWIcon from '../../../../img/icons/rotate-cw.svg?svgr';
import RotateCCWIcon from '../../../../img/icons/rotate-ccw.svg?svgr';

type RotateControlsProps = {
  onCwClick: () => void;
  onCcwClick: () => void;
};

export const RotateControls: React.FC<RotateControlsProps> = ({ onCwClick, onCcwClick }) => (
  <Flex alignItems='center' gap={20} className='game-info__rotate-controls'>
    <button className='game-info__rotate-button' onClick={onCwClick}>
      <RotateCWIcon />
    </button>
    <button className='game-info__rotate-button' onClick={onCcwClick}>
      <RotateCCWIcon />
    </button>
  </Flex>
);
