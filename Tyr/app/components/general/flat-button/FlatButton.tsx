import classNames from 'classnames';
import * as React from 'react';
import { PropsWithChildren } from 'react';
import './flat-button.css';

export type FlatButtonState = 'idle' | 'active' | 'success' | 'danger';

export type FlatButtonProps = PropsWithChildren<{
  size: 'small' | 'large' | 'v-large';
  variant: FlatButtonState;
  disabled?: boolean;
  onClick: () => void;
}>;

export const FlatButton: React.FC<FlatButtonProps> = ({
  size,
  variant,
  disabled,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'flat-btn',
        { 'flat-btn--small': size === 'small' },
        { 'flat-btn--large': size === 'large' },
        { 'flat-btn--v-large': size === 'v-large' },
        { 'flat-btn--pressed': variant === 'active' },
        { 'flat-btn--success': variant === 'success' },
        { 'flat-btn--danger': variant === 'danger' }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
