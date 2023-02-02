import React from 'react';
import RiichiIcon from '../../../../img/icons/riichi-big.svg?svgr';
import classNames from 'classnames';
import { Flex } from '#/components/general/flex/Flex';

type RiichiButtonProps = {
  orientation?: 'horizontal' | 'vertical';
  pressed: boolean;
  onClick: () => void;
};

export const RiichiButton: React.FC<RiichiButtonProps> = ({ pressed, orientation, onClick }) => {
  const isVertical = orientation === 'vertical';

  return (
    <Flex justify='center' direction={isVertical ? 'column' : 'row'} maxHeight={isVertical}>
      <div
        className={classNames(
          'player__riichi-button',
          { 'player__riichi-button--rotated': isVertical },
          { 'player__riichi-button--empty': !pressed }
        )}
        onClick={onClick}
      >
        <RiichiIcon />
      </div>
    </Flex>
  );
};
