import { Anchor, NavLink, useMantineColorScheme } from '@mantine/core';
import * as React from 'react';
import { useLocation } from 'wouter';

export enum ExternalTarget {
  NONE,
  SIGRUN,
  TYR,
}

export const MainMenuLink = ({
  href,
  icon,
  title,
  text,
  onClick,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  title?: string;
  text: string;
  onClick?: () => void;
  external?: ExternalTarget;
}) => {
  const [, navigate] = useLocation();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const color = isDark
    ? external === ExternalTarget.SIGRUN
      ? '#7e95c4'
      : external === ExternalTarget.TYR
      ? '#4f724c'
      : '#784421'
    : external === ExternalTarget.SIGRUN
    ? '#7e95c4'
    : external === ExternalTarget.TYR
    ? '#b1ffa8'
    : '#DCA57F';
  return (
    <Anchor
      style={{ borderLeft: '10px solid ' + color, marginBottom: '2px', textDecoration: 'none' }}
      href={href}
      onClick={
        external
          ? undefined
          : (e) => {
              navigate(href);
              onClick?.();
              e.preventDefault();
            }
      }
      target={external ? '_blank' : undefined}
      title={title ?? text}
    >
      <NavLink styles={{ label: { fontSize: '18px' } }} icon={icon} label={text} />
    </Anchor>
  );
};
