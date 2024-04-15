/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { crc32 } from '@foxglove/crc';
import styles from './Avatar.module.css';
import { CSSProperties, useEffect, useState } from 'react';
import { env } from '../../../helpers/env';
import { PlayerDescriptor } from '../../../helpers/interfaces';

type IProps = {
  size?: number;
} & PlayerDescriptor;

export const Avatar = ({ playerName, id, hasAvatar, lastUpdate, size }: IProps) => {
  size = size ?? 24;
  const [error, setError] = useState(!hasAvatar);
  useEffect(() => {
    setError(!hasAvatar);
  }, [hasAvatar]);

  return (
    <div
      className={styles.wrapper}
      style={{
        borderRadius: size,
        height: `${size}px`,
        width: `${size}px`,
      }}
      title={`#${id}`}
    >
      {error ? (
        <div
          className={styles.placeholder}
          style={{ ...makeColors(playerName!), fontSize: size / 2 - 4 }}
        >
          {makeInitials(playerName!)}
        </div>
      ) : (
        <img
          className={styles.placeholder}
          alt=''
          src={`${env.urls.gullveig}/files/avatars/user_${id}.jpg?${lastUpdate}`}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

export function makeColors(input: string): Pick<CSSProperties, 'color' | 'backgroundColor'> {
  if (!input) {
    return { color: 'var(--color-secondary-1)', backgroundColor: 'var(--color-secondary-3)' };
  }
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'lime',
    'teal',
    'cyan',
    'blue',
    'purple',
    'grape',
    'pink',
  ];
  const selected = colors[crc32(Uint8Array.from(input, (x) => x.charCodeAt(0))) % colors.length];
  return {
    color: 'var(--avatar-fg-' + selected + ')',
    backgroundColor: 'var(--avatar-bg-' + selected + ')',
  };
}

export function makeInitials(input: string): string {
  if (!input) {
    return '??';
  }
  const [word1, word2] = input.trim().split(/\s+/).slice(0, 2);
  if (!word2) {
    return word1[0].toUpperCase();
  }
  return word1[0].toUpperCase() + word2[0].toUpperCase();
}
