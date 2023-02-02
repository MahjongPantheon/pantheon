import React from 'react';
import { FlatButton, FlatButtonProps } from '#/components/general/flat-button/FlatButton';

import ThumbsUpIcon from '../../../../img/icons/thumbs-up.svg?svgr';
import ThumbsDownIcon from '../../../../img/icons/thumbs-down.svg?svgr';
import { Flex } from '#/components/general/flex/Flex';

// type ButtonProps = Omit<FlatButtonProps, 'variant'> & {
//   state: 'idle' | 'pressed' | 'disabled';
// }
//
// const Button: React.FC<ButtonProps> = (props) => (
//
// )

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
