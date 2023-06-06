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
import { ActionIcon, Button, Group, MantineColor, Popover, Text } from '@mantine/core';
import { I18nService } from '../../services/i18n';
import { useState } from 'react';
import { IconArrowRight } from '@tabler/icons-react';

export function Confirmation({
  icon,
  text,
  title,
  warning,
  color,
  onConfirm,
  i18n,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  warning: React.ReactNode;
  color: MantineColor;
  onConfirm: () => void;
  i18n: I18nService;
  disabled?: boolean;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      width={300}
      position='bottom'
      withArrow
      shadow='md'
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Button
          disabled={!!disabled}
          leftIcon={icon}
          title={title}
          color={color}
          onClick={() => setOpened((o) => !o)}
        >
          {text}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Group grow align='flex-end'>
          <Text size='sm' style={{ flex: 1, minWidth: '222px' }}>
            {warning}
          </Text>
          <ActionIcon
            style={{ flex: 0 }}
            variant='filled'
            color='red'
            onClick={() => {
              setOpened(false);
              onConfirm();
            }}
            title={i18n._t('Confirm')}
          >
            <IconArrowRight />
          </ActionIcon>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
