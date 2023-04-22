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
import { Autocomplete, Group, Loader, Text } from '@mantine/core';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useApi } from '#/hooks/api';
import { IconSearch } from '@tabler/icons-react';
import { RegisteredPlayer } from '#/clients/atoms.pb';
type ItemProps = {
  title: string;
  value: string; // playerID
  city: string;
  tenhouId: string;
};

export const PlayerSelector: React.FC<{
  eventId: number;
  onPlayerSelect: (player: RegisteredPlayer) => void;
  placeholder: string;
  excludePlayers: number[];
}> = ({ eventId, onPlayerSelect, placeholder, excludePlayers }) => {
  const api = useApi();
  const [userAddLoading, setUserAddLoading] = useState(false);
  const [userAddValue, setUserAddValue] = useState('');
  const [userAddData, setUserAddData] = useState<ItemProps[]>([]);

  const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ title, value, city, tenhouId, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
        <Group noWrap>
          <Text>
            {title} [#{value}, {city}
            {!!tenhouId && `, Tenhou ID: ${tenhouId}`}]
          </Text>
        </Group>
      </div>
    )
  );

  const fetchData = (query: string) => {
    api.findByTitle(query).then((persons) => {
      setUserAddData(
        persons
          .filter((p) => !excludePlayers.includes(p.id))
          .map((person) => ({
            title: person.title,
            value: person.id.toString(),
            city: person.city,
            tenhouId: person.tenhouId,
          }))
      );
      setUserAddLoading(false);
    });
  };

  const fetchDataD = useMemo(() => debounce(fetchData, 300), [api, excludePlayers]);

  useEffect(() => {
    return () => {
      fetchDataD.cancel();
    };
  }, []);

  const handleChange = useCallback(
    (query: string) => {
      setUserAddValue(query);
      setUserAddData([]);
      if (query.trim().length === 0) {
        setUserAddLoading(false);
      } else {
        setUserAddLoading(true);
        fetchDataD(query);
      }
    },
    [api, excludePlayers]
  );

  const handlePlayerAdd = useCallback(
    (item: ItemProps) => {
      setUserAddValue('');
      setUserAddData([]);
      onPlayerSelect({
        id: parseInt(item.value, 10),
        title: item.title,
        tenhouId: '', // TODO: not required here, maybe fix type
        ignoreSeating: false,
      });
    },
    [api, eventId, excludePlayers]
  );

  return (
    <Autocomplete
      value={userAddValue}
      data={userAddData}
      onChange={handleChange}
      onItemSubmit={handlePlayerAdd}
      itemComponent={AutoCompleteItem}
      filter={(value, item) => item.title.toLowerCase().includes(value.toLowerCase().trim())}
      rightSection={
        userAddLoading ? <Loader variant='dots' size='1rem' /> : <IconSearch color='#bbb' />
      }
      placeholder={placeholder}
    />
  );
};
