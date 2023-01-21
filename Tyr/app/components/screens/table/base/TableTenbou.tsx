import * as React from 'react';
import { ReactNode } from 'react';

export const TableTenbou = React.memo(function ({
  icon,
  count,
}: {
  icon: ReactNode;
  count: number;
}) {
  return (
    <div className='table-info__tenbou'>
      <div className='svg-item'>{icon}</div>
      <div className='table-info__tenbou-count'>{count}</div>
    </div>
  );
});
