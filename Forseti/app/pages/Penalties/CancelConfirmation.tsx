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
import { ActionIcon, Button, MantineColor, Popover, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useI18n } from '../../hooks/i18n';

export function CancelConfirmation({
  icon,
  title,
  color,
  onConfirm,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  color: MantineColor;
  onConfirm: (reason: string) => void;
  disabled?: boolean;
}) {
  const i18n = useI18n();
  const [opened, setOpened] = useState(false);
  const [reason, setReason] = useState('');

  const cancellationReasons = [
    i18n._t('Penalty applied by mistake'),
    i18n._t('Penalty not approved by lead referee'),
  ];

  return (
    <Popover position='bottom' withArrow shadow='md' opened={opened} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon
          style={{ flex: 0 }}
          variant='filled'
          disabled={!!disabled}
          title={title}
          color={color}
          onClick={() => setOpened((o) => !o)}
        >
          {icon}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Text size='sm' style={{ flex: 1, minWidth: '222px' }}>
            {i18n._t('Enter a reason for cancellation and confirm it.')}
          </Text>
          <TextInput value={reason} onChange={(e) => setReason(e.target.value)} />
          {cancellationReasons.map((r, idx) => (
            <Button key={`btn_${idx}`} onClick={() => setReason(r)}>
              {r}
            </Button>
          ))}
          <Button
            rightIcon={<IconArrowRight />}
            variant='filled'
            color='red'
            onClick={() => {
              setOpened(false);
              onConfirm(reason);
            }}
            title={i18n._t('Confirm cancellation')}
          >
            {i18n._t('Confirm')}
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
