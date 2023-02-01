import React, { PropsWithChildren } from 'react';

export const Round: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className='game-info__round'>{children}</div>
);
