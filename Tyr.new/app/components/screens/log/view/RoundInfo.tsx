import React from 'react';
import {getRoundDescription} from '#/components/screens/log/view/RoundSelectors';
import {IRoundOverviewInfo} from '#/components/screens/log/view/RoundTypes';

export const RoundInfo: React.FC<IRoundOverviewInfo> = (props: IRoundOverviewInfo) => {

  const description = getRoundDescription(props)
  const length = description.length

  return (
    <div className="page-log__info">
      {description.map((line, i)=> (
        <React.Fragment key={i}>
          {line}
          {i !== length - 1 && (<br />)}
        </React.Fragment>
      ))}
    </div>
  )
}
