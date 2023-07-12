import { makeColor, makeInitials } from './playersList';
import { Avatar, MantineNumberSize } from '@mantine/core';
import * as React from 'react';

export const PlayerAvatar = (p: {
  id: number;
  title: string;
  hasAvatar: boolean;
  radius: MantineNumberSize;
  size: MantineNumberSize;
}) => {
  if (p.hasAvatar) {
    return (
      <Avatar
        radius={p.radius}
        size={p.size}
        title={`#${p.id}`}
        src={`${import.meta.env.GULLVEIG_URL}/files/avatars/user_${p.id}.jpg`}
      />
    );
  }
  return (
    <Avatar color={makeColor(p.title)} radius={p.radius} size={p.size} title={`#${p.id}`}>
      {makeInitials(p.title)}
    </Avatar>
  );
};
