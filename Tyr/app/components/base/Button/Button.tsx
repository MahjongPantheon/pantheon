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

import { CSSProperties, PropsWithChildren, ReactElement } from 'react';
import styles from './Button.module.css';
import clsx from 'classnames';

export const Button = ({
  variant,
  size,
  icon,
  rightIcon,
  onClick,
  children,
  style,
  type,
  disabled,
  testId,
}: {
  variant?: 'primary' | 'outline' | 'contained' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'fullwidth';
  icon?: ReactElement;
  rightIcon?: ReactElement;
  onClick?: () => void;
  style?: CSSProperties;
  type?: 'submit';
  disabled?: boolean;
  testId?: string;
} & PropsWithChildren) => {
  variant ??= 'contained';
  size ??= 'md';
  disabled ??= false;

  const classes = [
    variant === 'primary' ? styles.buttonPrimary : null,
    variant === 'outline' ? styles.buttonOutline : null,
    variant === 'light' ? styles.buttonLight : null,
    variant === 'contained' ? styles.buttonContained : null,

    size === 'sm' ? styles.buttonSmall : null,
    size === 'md' ? styles.buttonMedium : null,
    size === 'lg' ? styles.buttonLarge : null,
    size === 'fullwidth' ? styles.buttonFullWidth : null,

    disabled ? styles.disabled : null,
  ];
  return (
    <div
      className={clsx(styles.wrapper, size === 'fullwidth' ? styles.wrapperFullWidth : null)}
      style={style}
    >
      <button
        type={type}
        disabled={disabled}
        className={clsx(styles.buttonBase, ...classes)}
        onClick={onClick}
        data-testid={testId}
      >
        {icon && <div className={styles.leftIcon}>{icon}</div>}
        {children}
        {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
      </button>
    </div>
  );
};
