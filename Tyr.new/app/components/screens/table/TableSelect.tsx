import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableSelectView} from '#/components/screens/table/views/TableSelectView';

export class TableSelect extends React.Component<IComponentProps> {

  render() {
    const {state} = this.props;
    let player = {} as any;
    let tableInfo = {} as any;

    return (
      <TableSelectView
        topPlayer={player}
        leftPlayer={player}
        rightPlayer={player}
        bottomPlayer={player}
        tableInfo={tableInfo}
      />
    );
  }
}
