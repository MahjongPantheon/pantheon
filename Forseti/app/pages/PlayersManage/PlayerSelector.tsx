import * as React from 'react';
import { Autocomplete, Group, Loader, Text } from '@mantine/core';
import { forwardRef, useCallback, useState } from 'react';
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
}> = ({ eventId, onPlayerSelect, placeholder }) => {
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
        persons.map((person) => ({
          title: person.title,
          value: person.id.toString(),
          city: person.city,
          tenhouId: person.tenhouId,
        }))
      );
      setUserAddLoading(false);
    });
  };

  const fetchDataD = useCallback(debounce(fetchData, 300), [api]);

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
    [api]
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
    [api, eventId]
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
