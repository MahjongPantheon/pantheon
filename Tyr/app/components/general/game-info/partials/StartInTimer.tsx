import React, { PropsWithChildren, useContext } from 'react';
import { i18n } from '#/components/i18n';

export const StartInTimer: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const loc = useContext(i18n);

  return (
    <>
      <div className='game-info__start-in-splitter' />
      <div>{loc._t('Start in')}</div>
      <div className='game-info__start-in-timer'>{children}</div>
    </>
  );
};
