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
import { useCombobox, Combobox, TextInput, Loader } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { RegisteredPlayer } from '../../clients/proto/atoms.pb';
import { useApi } from '../../hooks/api';

type ItemProps = {
  label: string;
  value: string; // playerID
  city: string;
  tenhouId: string;
  hasAvatar?: boolean;
  lastUpdate: string;
};

type Props = {
  eventId: number;
  onPlayerSelect: (player: RegisteredPlayer) => void;
  placeholder: string;
  excludePlayers: number[];
};

export function PlayerSelector({ eventId, onPlayerSelect, placeholder, excludePlayers }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemProps[]>([]);
  const [value, setValue] = useState('');
  const [empty, setEmpty] = useState(false);
  const abortController = useRef<AbortController>();
  const api = useApi();

  const handlePlayerAdd = useCallback(
    (itemLabel: string) => {
      const item = data.find((v) => v.label === itemLabel);
      setValue('');
      setData([]);
      if (item) {
        onPlayerSelect({
          id: parseInt(item.value, 10),
          title: item.label,
          hasAvatar: item.hasAvatar ?? false,
          lastUpdate: item.lastUpdate,
          tenhouId: '', // TODO: not required here, maybe fix type
          ignoreSeating: false,
        });
      }
    },
    [api, eventId, excludePlayers]
  );

  const fetchData = (query: string) => {
    api.findByTitle(query).then((persons) => {
      setEmpty(persons.length === 0);
      setData(
        persons
          .filter((p) => !excludePlayers.includes(p.id))
          .map((person) => ({
            label: person.title,
            value: person.id.toString(),
            city: person.city,
            tenhouId: person.tenhouId,
            hasAvatar: person.hasAvatar,
            lastUpdate: person.lastUpdate,
          }))
      );
      setLoading(false);
    });
  };

  const fetchDataD = useMemo(() => debounce(fetchData, 300), [api, excludePlayers]);

  useEffect(() => {
    return () => {
      fetchDataD.cancel();
    };
  }, []);

  const fetchOptions = (query: string) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);
    fetchDataD(query);
  };

  const splittedSearch = value.toLowerCase().trim().split(' ');
  const options = (data ?? [])
    .filter((v) => {
      const words = v.label.toLowerCase().trim().split(' ');
      return splittedSearch.every((searchWord) =>
        words.some((word: string) => word.includes(searchWord))
      );
    })
    .map((item) => (
      <Combobox.Option value={item.value} key={item.label}>
        {item.label} [#{item.value}, {item.city}
        {!!item.tenhouId && `, Tenhou ID: ${item.tenhouId}`}]
      </Combobox.Option>
    ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        handlePlayerAdd(optionValue);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            fetchOptions(event.currentTarget.value);
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown();
            if (data === null) {
              fetchOptions(value);
            }
          }}
          onBlur={() => combobox.closeDropdown()}
          rightSection={loading && <Loader size={18} />}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={data === null}>
        <Combobox.Options>
          {options}
          {empty && <Combobox.Empty>No results found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
