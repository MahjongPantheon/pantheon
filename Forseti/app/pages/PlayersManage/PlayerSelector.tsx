/*  Forseti: personal area & event control panel
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
import { Combobox, Group, Loader, Text, TextInput, useCombobox } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { useApi } from '../../hooks/api';
import { IconSearch } from '@tabler/icons-react';
import { Person, RegisteredPlayer } from 'tsclients/proto/atoms.pb';

export const PlayerSelector: React.FC<{
  eventId: number;
  onPlayerSelect: (player: RegisteredPlayer) => void;
  placeholder: string;
  excludePlayers: number[];
  testId: string;
}> = ({ eventId, onPlayerSelect, placeholder, excludePlayers, testId }) => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<Person[]>([]);
  const request = useRef(0);
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });
  const search = useMemo(
    () =>
      debounce(async (value: string, requestId: number) => {
        try {
          const result = await api.findByTitle(value);
          if (requestId === request.current) {
            setPlayers(result);
          }
        } catch {
          if (requestId === request.current) {
            setPlayers([]);
          }
        } finally {
          if (requestId === request.current) {
            setLoading(false);
          }
        }
      }, 300),
    [api]
  );

  useEffect(
    () => () => {
      search.cancel();
      request.current += 1;
    },
    [search, eventId]
  );

  const options = players
    .filter(
      (player) =>
        !excludePlayers.includes(player.id) &&
        player.title.toLowerCase().includes(query.toLowerCase().trim())
    )
    .slice(0, 5);

  return (
    <Combobox
      shadow='sm'
      transitionProps={{ duration: 0 }}
      store={combobox}
      onOptionSubmit={(value) => {
        const player = options.find((candidate) => candidate.id.toString() === value);
        if (!player) {
          return;
        }
        search.cancel();
        request.current += 1;
        setQuery('');
        setPlayers([]);
        setLoading(false);
        combobox.closeDropdown();
        onPlayerSelect({
          id: player.id,
          title: player.title,
          hasAvatar: player.hasAvatar ?? false,
          lastUpdate: player.lastUpdate,
          tenhouId: '',
          ignoreSeating: false,
        });
      }}
    >
      <Combobox.Target>
        <TextInput
          data-testid={testId}
          value={query}
          onChange={(event) => {
            const value = event.currentTarget.value;
            const requestId = ++request.current;
            setQuery(value);
            setPlayers([]);
            search.cancel();
            combobox.resetSelectedOption();
            combobox.openDropdown();
            setLoading(value.trim().length > 0);
            if (value.trim()) {
              search(value, requestId);
            }
          }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          rightSection={
            loading ? <Loader variant='dots' size='1rem' /> : <IconSearch color='#bbb' />
          }
          placeholder={placeholder}
        />
      </Combobox.Target>
      <Combobox.Dropdown hidden={options.length === 0}>
        <Combobox.Options>
          {options.map((player) => (
            <Combobox.Option value={player.id.toString()} key={player.id}>
              <Group wrap='nowrap'>
                <Text>
                  {player.title} [#{player.id}, {player.city}
                  {!!player.tenhouId && `, Tenhou nickname: ${player.tenhouId}`}]
                </Text>
              </Group>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
