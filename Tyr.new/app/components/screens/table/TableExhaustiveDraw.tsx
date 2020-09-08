import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableExhaustiveDrawView} from '#/components/screens/table/views/TableExhaustiveDrawView';

export class TableExhaustiveDraw extends React.Component<IComponentProps> {

  render() {
    const {state} = this.props;
    let player = {} as any;
    let tableInfo = {} as any;

    return (
      <TableExhaustiveDrawView
        topPlayer={player}
        leftPlayer={player}
        rightPlayer={player}
        bottomPlayer={player}
        tableInfo={tableInfo}
      />
    );
  }
}
