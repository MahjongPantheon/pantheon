import React, { PropsWithChildren } from 'react';

import HomeIcon from '../../../../img/icons/home.svg?svgr';
import RefreshIcon from '../../../../img/icons/refresh.svg?svgr';
import PlusIcon from '../../../../img/icons/plus.svg?svgr';
import LogIcon from '../../../../img/icons/log.svg?svgr';
import NextIcon from '../../../../img/icons/arrow-right.svg?svgr';
import BackIcon from '../../../../img/icons/arrow-left.svg?svgr';
import SaveIcon from '../../../../img/icons/check.svg?svgr';

type ButtonProps = PropsWithChildren<{
  onClick: () => void;
  disabled?: boolean;
}>;

export const Button: React.FC<ButtonProps> = ({ disabled, onClick, children }) => (
  <button className='toolbar__button' onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

type IconButtonProps = Omit<ButtonProps, 'children'>;

export const Home: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <HomeIcon />
  </Button>
);

export const Refresh: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <RefreshIcon />
  </Button>
);

export const Plus: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <PlusIcon />
  </Button>
);

export const Log: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <LogIcon />
  </Button>
);

export const Next: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <NextIcon />
  </Button>
);

export const Back: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <BackIcon />
  </Button>
);

export const Save: React.FC<IconButtonProps> = (props) => (
  <Button {...props}>
    <SaveIcon />
  </Button>
);
