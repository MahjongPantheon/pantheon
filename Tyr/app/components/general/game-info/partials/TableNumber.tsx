import React, { PropsWithChildren } from 'react';

export const TableNumber: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className='game-info__table-number'>{children}</div>
);
