import React, { PropsWithChildren } from 'react';

export const Timer: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className='game-info__timer'>{children}</div>
);
