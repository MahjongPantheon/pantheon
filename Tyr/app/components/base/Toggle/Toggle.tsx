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

import { CSSProperties, PropsWithChildren } from 'react';
import styles from './Toggle.module.css';
import clsx from 'classnames';

export const Toggle = ({
  size,
  style,
  onChange,
  children,
  selected,
  disabled,
  testId,
}: {
  style?: CSSProperties;
  size?: 'sm' | 'md' | 'lg' | 'fullwidth';
  onChange?: (newValue: boolean) => void;
  disabled?: boolean;
  selected?: boolean;
  testId?: string;
} & PropsWithChildren) => {
  size ??= 'md';

  const classes = [
    size === 'sm' ? styles.toggleSmall : null,
    size === 'md' ? styles.toggleMedium : null,
    size === 'lg' ? styles.toggleLarge : null,
    size === 'fullwidth' ? styles.toggleFullwidth : null,
    disabled ? styles.disabled : null,
  ];

  const handleChange = () => {
    onChange?.(!selected);
  };

  return (
    <button
      style={style}
      disabled={disabled}
      data-testid={testId}
      className={clsx(styles.toggleBase, ...classes, selected ? styles.checked : null)}
      onClick={handleChange}
    >
      {children}
    </button>
  );
};
