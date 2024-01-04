import { Menu } from '@mantine/core';
import * as React from 'react';
import { useLocation } from 'wouter';

export const MenuItemLink = ({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title?: string;
  text: string;
}) => {
  const [, navigate] = useLocation();
  return (
    <Menu.Item
      component='a'
      href={href}
      onClick={(e) => {
        navigate(href);
        e.preventDefault();
      }}
      icon={icon}
      title={title ?? text}
    >
      {text}
    </Menu.Item>
  );
};
