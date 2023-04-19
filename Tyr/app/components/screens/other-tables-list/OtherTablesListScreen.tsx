/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
