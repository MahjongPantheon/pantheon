import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableBeforeStartView} from '#/components/screens/table/views/TableBeforeStartView';

export class TableBeforeStart extends React.Component<IComponentProps> {

    render() {
        const {state} = this.props;
        let player = {} as any;

        return (
           <TableBeforeStartView
               topPlayer={player}
               leftPlayer={player}
               rightPlayer={player}
               bottomPlayer={player}
               tableNumber={0}
           />
        );
    }
}
