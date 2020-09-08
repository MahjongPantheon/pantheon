import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableChomboView} from '#/components/screens/table/views/TableChomboView';

export class TableChombo extends React.Component<IComponentProps> {

    render() {
        const {state} = this.props;
        let player = {} as any;
        let tableInfo = {} as any;

        return (
           <TableChomboView
               topPlayer={player}
               leftPlayer={player}
               rightPlayer={player}
               bottomPlayer={player}
               tableInfo={tableInfo}
           />
        );
    }
}
