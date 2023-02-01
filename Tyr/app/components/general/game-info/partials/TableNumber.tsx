import React, { PropsWithChildren, useContext } from 'react';
import { i18n } from '#/components/i18n';

export const TableNumber: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const loc = useContext(i18n);

  return (
    <>
      <div className='game-info__table-number-caption'>{loc._t('Table')}</div>
      <div className='game-info__table-number'>{children}</div>
    </>
  );
};
