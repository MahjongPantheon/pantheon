import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { PlayerAvatar, makeColor, makeInitials } from './PlayerAvatar';
import { env } from '../env';

it.each([
  ['', ''],
  ['[Deleted account #123]', ''],
  ['alice', 'A'],
  ['  alice   bob charlie  ', 'AB'],
])('uses initials appropriate for %s', (title, initials) => {
  expect(makeInitials(title)).toBe(initials);
});

it('uses a neutral color without a name and a stable color for a named player', () => {
  expect(makeColor('')).toBe('gray');
  expect(makeColor('Alice')).toBe(makeColor('Alice'));
  expect(makeColor('Alice')).not.toBe('gray');
});

it('renders an uploaded avatar with a cache version and supports explicit sizing', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <MantineProvider env='test'>
          <PlayerAvatar
            p={{ id: 7, title: 'Alice Bob', hasAvatar: true, lastUpdate: '123' }}
            size='lg'
            radius='sm'
          />
        </MantineProvider>
      )
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      `${env.urls.gullveig}/files/avatars/user_7.jpg?123`
    );
    expect(container.querySelector('[title="#7"]')).not.toBeNull();
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
