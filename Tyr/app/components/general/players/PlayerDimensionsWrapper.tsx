import * as React from 'react';
import { ReactElement } from 'react';
import { DimensionsWrapper } from '../utils/DimensionsWrapper';

type IProps = {
  children: ReactElement;
};

export class PlayerDimensionsWrapper extends React.Component<IProps> {
  render() {
    const { children } = this.props;

    return (
      <DimensionsWrapper propName='nameWidth' selector='.page-table__center'>
        {children}
      </DimensionsWrapper>
    );
  }
}
