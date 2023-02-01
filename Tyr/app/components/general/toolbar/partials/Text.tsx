import React, { PropsWithChildren } from 'react';

export const Text: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className='toolbar__text'>{children}</div>
);
