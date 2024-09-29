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
import { CSSProperties, useState } from 'react';
import { IconArrowRight, IconQuestionMark } from '@tabler/icons-react';
import { useI18n } from '../../hooks/i18n';

export function CommonReasons({
  title,
  color,
  onConfirm,
  buttonStyles,
}: {
  title: string;
  color: MantineColor;
  onConfirm: (reason: string) => void;
  buttonStyles?: CSSProperties;
}) {
  const i18n = useI18n();
  const [opened, setOpened] = useState(false);

  const commonReasons = [
    i18n._t('Being late for a session'),
    i18n._t('Too much noise during the game'),
    i18n._t('Another rules violation after notice'),
    i18n._t('Arguing with referee'),
    i18n._t('Texting or speaking by phone during the game'),
  ];

  return (
    <Popover position='bottom' withArrow shadow='md' opened={opened} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon
          style={{ flex: 0, ...buttonStyles }}
          variant='filled'
          title={title}
          color={color}
          onClick={() => setOpened((o) => !o)}
        >
          <IconQuestionMark />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Text size='sm' style={{ flex: 1, minWidth: '222px' }}>
            {i18n._t('Common reasons for the penalty')}
          </Text>
          {commonReasons.map((r, idx) => (
            <Button
              key={`btn_${idx}`}
              onClick={() => {
                setOpened(false);
                onConfirm(r);
              }}
            >
              {r}
            </Button>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
