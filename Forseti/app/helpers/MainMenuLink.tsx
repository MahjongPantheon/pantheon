import { Anchor, MantineColor, NavLink } from '@mantine/core';
import * as React from 'react';
import { useLocation } from 'wouter';

export const MainMenuLink = ({
  href,
  icon,
  title,
  text,
  onClick,
  external,
  bgcolor,
}: {
  href: string;
  icon: React.ReactNode;
  title?: string;
  text: string;
  onClick?: () => void;
  external?: boolean;
  bgcolor?: MantineColor;
}) => {
  const [, navigate] = useLocation();
  return (
    <Anchor
      bg={bgcolor}
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
