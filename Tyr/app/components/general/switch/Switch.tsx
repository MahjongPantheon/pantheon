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
import './switch.css';
import { useCallback } from 'react';

type SwitchProps = {
  onChange: (value: boolean) => void;
  value: boolean;
};

export const Switch = React.memo(function (props: SwitchProps) {
  const { onChange, value } = props;

  const onClick = useCallback(() => {
    onChange(!value);
  }, [value, onChange]);

  return (
    <div className='switch' onClick={onClick}>
      <div className={'switch__box' + (value ? ' switch__box--on' : '')} />
      <div className={'switch__button' + (value ? ' switch__button--on' : '')} />
    </div>
  );
});
