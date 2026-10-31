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

import { IComponentProps } from '../../IComponentProps';
import {
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLES_LIST_INIT,
  GOTO_PREV_SCREEN,
} from '../../../store/actions/interfaces';
import { OtherTablesList as OtherTablesListPage } from '../../pages/OtherTablesList/OtherTablesList';
import { useContext } from 'react';
import { i18n } from '../../i18n';
import { Loader } from '../../base/Loader/Loader';
import { TwirpError } from 'twirpscript';

export const OtherTablesList = (props: IComponentProps) => {
  const loc = useContext(i18n);
  const onBackClick = () => {
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const onTableClick = (hash: string) => {
    props.dispatch({ type: GET_OTHER_TABLE_INIT, payload: hash });
  };

  if (props.state.loading.otherTables) {
    return <Loader />;
  }

  const error = props.state.otherTablesListError;
  const details: unknown = error?.details;
  const detailsMessage = details instanceof TwirpError ? details.msg : undefined;
  const message = error?.message?.trim() ? error.message : detailsMessage;
  const errorMessage = error
    ? message?.trim()
      ? message
      : loc._t('Unexpected server error')
    : undefined;

  return (
    <OtherTablesListPage
      tables={props.state.otherTablesList}
      onTableClick={onTableClick}
      onBackClick={onBackClick}
      error={errorMessage}
      onRetryClick={() => props.dispatch({ type: GET_OTHER_TABLES_LIST_INIT })}
    />
  );
};
