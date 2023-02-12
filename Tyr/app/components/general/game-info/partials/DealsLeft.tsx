import React, { PropsWithChildren, useContext } from 'react';
import { i18n } from '#/components/i18n';

type DealsLeftProps = {
  children: number;
};

export const DealsLeft: React.FC<DealsLeftProps> = ({ children }) => {
  const loc = useContext(i18n);

  return (
    <div className='game-info__deals-left'>
      {loc._nt(['%1 deal left', '%1 deals left'], children, [children])}
    </div>
  );
};
