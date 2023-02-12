import React, { PropsWithChildren } from 'react';
import {
  Back,
  Button,
  Home,
  Log,
  Next,
  Plus,
  Refresh,
  Save,
} from '#/components/general/toolbar/partials/Button';
import { Text } from '#/components/general/toolbar/partials/Text';
import { Flex, FlexProps } from '#/components/general/flex/Flex';
import './toolbar.css';
import { Menu } from '#/components/general/toolbar/partials/Menu';
import { MenuItem } from '#/components/general/toolbar/partials/MenuItem';

export type ToolbarProps = PropsWithChildren<{}> & FlexProps;

export const Toolbar = (({ children, ...flexProps }: ToolbarProps) => (
  <div className='toolbar'>
    <Flex justify='space-between' alignItems='center' maxHeight {...flexProps}>
      {children}
    </Flex>
  </div>
)) as React.FC<ToolbarProps> & Partials;

interface Partials {
  Text: typeof Text;
  Button: typeof Button;

  Home: typeof Home;
  Refresh: typeof Refresh;
  Plus: typeof Plus;
  Log: typeof Log;
  Next: typeof Next;
  Back: typeof Back;
  Save: typeof Save;

  Menu: typeof Menu;
  MenuItem: typeof MenuItem;
}

Toolbar.Text = Text;
Toolbar.Button = Button;

Toolbar.Home = Home;
Toolbar.Refresh = Refresh;
Toolbar.Plus = Plus;
Toolbar.Log = Log;
Toolbar.Next = Next;
Toolbar.Back = Back;
Toolbar.Save = Save;

Toolbar.Menu = Menu;
Toolbar.MenuItem = MenuItem;
