import React, { PropsWithChildren } from 'react';
import { Flex } from '#/components/general/flex/Flex';
import RiichiIcon from '../../../../img/icons/riichi-small.svg?svgr';
import HonbaIcon from '../../../../img/icons/honba.svg?svgr';

type TenbouProps = {
  value: number;
};

const Tenbou: React.FC<PropsWithChildren<TenbouProps>> = ({ value, children }) => (
  <Flex gap={8} className='game-info__tenbou'>
    <div className='game-info__tenbou-svg'>{children}</div>
    <div>{value}</div>
  </Flex>
);

export const Riichi: React.FC<TenbouProps> = ({ value }) => (
  <Tenbou value={value}>
    <RiichiIcon />
  </Tenbou>
);

export const Honba: React.FC<TenbouProps> = ({ value }) => (
  <Tenbou value={value}>
    <HonbaIcon />
  </Tenbou>
);
