import React, { PropsWithChildren } from 'react';

type MenuProps = PropsWithChildren<{
  onClose: () => void;
}>;

export const Menu: React.FC<MenuProps> = ({ onClose, children }) => {
  return (
    <div className='toolbar__menu'>
      <div className='toolbar__menu-backdrop' onClick={onClose} />
      <div className='toolbar__menu-content'>
        <div className='toolbar__menu-pointer' />
        {children}
      </div>
    </div>
  );
};
