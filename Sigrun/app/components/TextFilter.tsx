import { Button, Group, TextInput, useMantineTheme } from '@mantine/core';
import { IconCircleX, IconSearch } from '@tabler/icons-react';
import * as React from 'react';
import { useState } from 'react';
import { useI18n } from '../hooks/i18n';

export const TextFilter = ({
  initialValue,
  onSubmit,
}: {
  initialValue?: string;
  onSubmit: (value: string) => void;
}) => {
  const i18n = useI18n();
  const [search, setSearch] = useState(
    (initialValue ?? '').replace(/[^\w\s0-9;!@#$%^&*()\p{L}]+/giu, '')
  );
  const theme = useMantineTheme();
  return (
    <Group>
      <TextInput
        style={{ flex: 1 }}
        placeholder={i18n._t('Filter events...')}
        leftSection={<IconSearch size='1.3rem' />}
        value={search}
        onChange={(e) =>
          setSearch(e.currentTarget.value.replace(/[^\w\s0-9;!@#$%^&*()\p{L}]+/giu, ''))
        }
        onKeyDown={(e) => e.key === 'Enter' && onSubmit(search)}
        rightSection={
          search !== '' && (
            <IconCircleX
              color={theme.colors.dark[2]}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSearch('');
                onSubmit('');
              }}
            />
          )
        }
      />
      <Button size='sm' style={{ flex: 'none' }} onClick={() => onSubmit(search)}>
        {i18n._t('Filter')}
      </Button>
    </Group>
  );
};
