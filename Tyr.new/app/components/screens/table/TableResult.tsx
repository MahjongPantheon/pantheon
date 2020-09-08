import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableResultView} from '#/components/screens/table/views/TableResultView';

export class TableResult extends React.Component<IComponentProps> {

  render() {
    const {state} = this.props;
    let player = {} as any;
    let tableInfo = {} as any;

    return (
      <TableResultView
        topPlayer={player}
        leftPlayer={player}
        rightPlayer={player}
        bottomPlayer={player}
        tableInfo={tableInfo}
      />
    );
  }
}
