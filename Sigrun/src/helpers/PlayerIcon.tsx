import { Avatar, MantineColor } from '@mantine/core';
import { PlayerInRating } from '../clients/proto/atoms.pb';
import { crc32 } from '@foxglove/crc';

export const PlayerIcon = ({ p }: { p: PlayerInRating }) => {
  return (
    <Avatar variant='outline' color={makeColor(p.title)} radius='xl' size='md' title={`#${p.id}`}>
      {makeInitials(p.title)}
    </Avatar>
  );
};

export function makeColor(input: string): MantineColor {
  const colors: MantineColor[] = [
    'gray',
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'green',
    'lime',
    'yellow',
    'orange',
    'teal',
  ];
  return colors[crc32(Uint8Array.from(input, (x) => x.charCodeAt(0))) % colors.length];
}

export function makeInitials(input: string): string {
  const [word1, word2] = input.trim().split(/\s+/).slice(0, 2);
  if (!word2) {
    return word1[0].toUpperCase();
  }
  return word1[0].toUpperCase() + word2[0].toUpperCase();
}
