import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableRonView} from '#/components/screens/table/views/TableRonView';

export class TableRon extends React.Component<IComponentProps> {

  render() {
    const {state} = this.props;
    let player = {} as any;
    let tableInfo = {} as any;

    return (
      <TableRonView
        topPlayer={player}
        leftPlayer={player}
        rightPlayer={player}
        bottomPlayer={player}
        tableInfo={tableInfo}
      />
    );
  }
}
