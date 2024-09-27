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
import { GET_PENALTIES_INIT, GOTO_PREV_SCREEN } from '../../../store/actions/interfaces';
import { Penalties as PenaltiesPage } from '../../pages/Penalties/Penalties';
import { useEffect } from 'react';

export const Penalties = (props: IComponentProps) => {
  const onBackClick = () => {
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  useEffect(() => {
    props.dispatch({ type: GET_PENALTIES_INIT });
  }, []);

  return (
    <PenaltiesPage
      onBackClick={onBackClick}
      isLoading={props.state.loading.penalties}
      error={props.state.penaltiesError}
      penaltiesList={props.state.penalties}
    />
  );
};
