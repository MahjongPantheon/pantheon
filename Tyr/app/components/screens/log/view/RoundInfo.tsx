import React, { useContext } from 'react';
import { getRoundDescription } from '#/components/screens/log/view/RoundSelectors';
import { IRoundOverviewInfo } from '#/components/screens/log/view/RoundTypes';
import { i18n } from '#/components/i18n';

export const RoundInfo: React.FC<IRoundOverviewInfo> = (props: IRoundOverviewInfo) => {
  const loc = useContext(i18n);
  const description = getRoundDescription(props, loc);
  const length = description.length;

  return (
    <div className='page-log__info'>
      {description.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};
