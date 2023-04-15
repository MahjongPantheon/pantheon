import * as React from 'react';
import { ActionIcon, Button, Group, MantineColor, Popover, Text } from '@mantine/core';
import { I18nService } from '#/services/i18n';
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
