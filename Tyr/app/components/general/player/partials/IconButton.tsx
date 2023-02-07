import React from 'react';
import { FlatButton, FlatButtonProps } from '#/components/general/flat-button/FlatButton';

import ThumbsUpIcon from '../../../../img/icons/thumbs-up.svg?svgr';
import ThumbsDownIcon from '../../../../img/icons/thumbs-down.svg?svgr';

type ButtonProps = Omit<FlatButtonProps, 'children' | 'variant'> & {
  pressed: boolean;
};

export const WinButton: React.FC<ButtonProps> = ({ pressed, ...restProps }) => (
  <FlatButton variant={pressed ? 'success' : 'idle'} {...restProps}>
    <ThumbsUpIcon />
  </FlatButton>
);

export const LoseButton: React.FC<ButtonProps> = ({ pressed, ...restProps }) => (
  <FlatButton variant={pressed ? 'danger' : 'idle'} {...restProps}>
    <ThumbsDownIcon />
  </FlatButton>
);

export const DeadHandButton: React.FC<Omit<ButtonProps, 'pressed'>> = (props) => (
  <FlatButton variant='active' {...props}>
    dead hand
  </FlatButton>
);
