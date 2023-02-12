import React, { PropsWithChildren } from 'react';

type MenuItemProps = PropsWithChildren<{
  onClick: () => void;
}>;

export const MenuItem: React.FC<MenuItemProps> = ({ onClick, children }) => (
  <div className='toolbar__menu-item' onClick={onClick}>
    {children}
  </div>
);
