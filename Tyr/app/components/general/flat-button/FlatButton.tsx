import classNames from 'classnames';
import { PlayerButtonMode } from '#/components/types/PlayerEnums';
import * as React from 'react';
import { PropsWithChildren } from 'react';
import './flat-button.css';

type FlatButtonProps = PropsWithChildren<{
  size: 'small' | 'large' | 'v-large';
  mode: PlayerButtonMode;
  onClick?: () => void;
}>;

export const FlatButton: React.FC<FlatButtonProps> = ({ size, mode, onClick, children }) => {
  return (
    <div
      onClick={onClick}
      className={classNames(
        'flat-btn',
        { 'flat-btn--small': size === 'small' },
        { 'flat-btn--large': size === 'large' },
        { 'flat-btn--v-large': size === 'v-large' },
        { 'flat-btn--disabled': mode === PlayerButtonMode.DISABLE },
        { 'flat-btn--success': mode === PlayerButtonMode.PRESSED }
      )}
    >
      {children}
    </div>
  );
};
