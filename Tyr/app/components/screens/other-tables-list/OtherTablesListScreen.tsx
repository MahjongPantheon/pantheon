import * as React from 'react';
import './other-tables-list.css';
import { IComponentProps } from '#/components/IComponentProps';
import { GET_OTHER_TABLE_INIT, GOTO_PREV_SCREEN } from '#/store/actions/interfaces';
import { OtherTablesListView } from '#/components/screens/other-tables-list/OtherTablesListView';

export class OtherTablesList extends React.Component<IComponentProps> {
  private onBackClick() {
    this.props.dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onTableClick(hash: string) {
    this.props.dispatch({ type: GET_OTHER_TABLE_INIT, payload: hash });
  }

  render() {
    const { state } = this.props;
    if (state.otherTablesListError) {
      // TODO: localized message
      return <div>{state.otherTablesListError.message}</div>;
    }

    return (
      <OtherTablesListView
        tables={state.otherTablesList}
        onTableClick={this.onTableClick.bind(this)}
        onBackClick={this.onBackClick.bind(this)}
      />
    );
  }
}
