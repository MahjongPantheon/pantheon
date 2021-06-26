import * as React from 'react';
import {IconType} from '#/components/general/icon/IconType';
import {Icon} from '#/components/general/icon/Icon';

export const TableTenbou = React.memo(function ({iconType, count}: {iconType: IconType, count: number}) {
  return (
    <div className="table-info__tenbou">
      <div className="svg-item">
        <Icon type={iconType} />
      </div>
      <div className="table-info__tenbou-count">
        {count}
      </div>
    </div>
  )
})
