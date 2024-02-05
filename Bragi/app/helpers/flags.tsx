/*  Bragi: Pantheon landing pages
 *  Copyright (C) 2023  o.klimenko aka ctizen
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

import * as React from 'react';

export const FlagRu = ({ width }: { width: number }) => (
  <svg
    // @ts-expect-error
    style={{ enableBackground: 'new 0 0 512 512', width: `${width}px` }}
    version='1.1'
    viewBox='0 0 512 512'
  >
    <rect height='298.7' width='512' y='106.7' fill='#FFF' />
    <rect height='199.1' width='512' y='206.2' fill='#594BB4' />
    <rect height='99.5' width='512' y='305.8' fill='#C42127' />
  </svg>
);

export const FlagEn = ({ width }: { width: number }) => (
  <svg
    // @ts-expect-error
    style={{ enableBackground: 'new 0 0 512 512', width: `${width}px` }}
    version='1.1'
    viewBox='0 0 512 512'
  >
    <rect height='298.7' width='512' y='106.7' fill='#FFF' />
    <polygon points='342.8,214.7 512,119.9 512,106.7 500.3,106.7 307.4,214.7' fill='#BD0034' />
    <polygon points='334.8,303.4 512,402.5 512,382.7 370.2,303.4' fill='#BD0034' />
    <polygon points='0,129.4 151.5,214.7 187,214.7 0,109.5' fill='#BD0034' />
    <polygon points='178.9,303.4 0,403.6 0,405.4 32.3,405.4 214.4,303.4' fill='#BD0034' />
    <polygon points='477,106.7 297.7,106.7 297.7,207.1' fill='#1A237B' />
    <polygon points='218.5,106.7 40,106.7 218.5,207.1' fill='#1A237B' />
    <polygon points='512,214.7 512,146.1 390.4,214.7' fill='#1A237B' />
    <polygon points='512,371.1 512,303.4 390.4,303.4' fill='#1A237B' />
    <polygon points='50.1,405.4 218.5,405.4 218.5,310.9' fill='#1A237B' />
    <polygon points='297.7,405.4 466.6,405.4 297.7,310.9' fill='#1A237B' />
    <polygon points='0,303.4 0,374.2 125.8,303.4' fill='#1A237B' />
    <polygon points='0,214.7 125.8,214.7 0,143.7' fill='#1A237B' />
    <polygon
      points='234.4,106.7 234.4,232.4 0,232.4 0,285.6 234.4,285.6 234.4,405.4 281.9,405.4 281.9,285.6 512,285.6 512,232.4 281.9,232.4 281.9,106.7'
      fill='#BD0034'
    />
  </svg>
);

export const FlagDe = ({ width }: { width: number }) => (
  <svg
    // @ts-expect-error
    style={{ enableBackground: 'new 0 0 512 512', width: `${width}px` }}
    version='1.1'
    viewBox='0 0 512 512'
  >
    <rect height='298.7' width='512' y='106.7' fill='#000' />
    <rect height='199.1' width='512' y='206.2' fill='#C42127' />
    <rect height='99.5' width='512' y='305.8' fill='#D4D44B' />
  </svg>
);

export const FlagJa = ({ width }: { width: number }) => (
  <svg
    // @ts-expect-error
    style={{ enableBackground: 'new 0 0 512 512', width: `${width}px` }}
    version='1.1'
    viewBox='0 0 512 512'
  >
    <rect height='298.7' width='512' y='106.7' fill='#FFF' />
    <path
      d='M256,166.4c49.5,0,89.6,40.1,89.6,89.6c0,49.5-40.1,89.6-89.6,89.6c-49.5,0-89.6-40.1-89.6-89.6 C166.4,206.5,206.5,166.4,256,166.4'
      fill='#AD1F23'
    />
  </svg>
);
