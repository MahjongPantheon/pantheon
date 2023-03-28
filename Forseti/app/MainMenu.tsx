import { Button, Drawer, NavLink } from '@mantine/core';
import * as React from 'react';
import { IconLogin, IconMenu2, IconUserPlus } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useI18n } from '#/hooks/i18n';
import { useDisclosure } from '@mantine/hooks';

export const MainMenu: React.FC = () => {
  const i18n = useI18n();
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Drawer
        position='right'
        opened={opened}
        onClose={close}
        title={i18n._t('Main menu')}
        size='15rem'
      >
        <Link to='profile/login'>
          <NavLink icon={<IconLogin size={18} />} label={i18n._t('Sign in')} />
        </Link>
        <Link to='profile/signup'>
          <NavLink icon={<IconUserPlus size={18} />} label={i18n._t('Sign up')} />
        </Link>
        {/*<Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>*/}
        {/*<Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>*/}
        {/*<Menu.Item icon={<IconPhoto size={14} />}>Gallery</Menu.Item>*/}
        {/*<Menu.Item*/}
        {/*  icon={<IconSearch size={14} />}*/}
        {/*  rightSection={<Text size="xs" color="dimmed">⌘K</Text>}*/}
        {/*>*/}
        {/*  Search*/}
        {/*</Menu.Item>*/}

        {/*<Menu.Divider />*/}

        {/*<Menu.Label>Danger zone</Menu.Label>*/}
        {/*<Menu.Item icon={<IconArrowsLeftRight size={14} />}>Transfer my data</Menu.Item>*/}
        {/*<Menu.Item color="red" icon={<IconTrash size={14} />}>Delete my account</Menu.Item>*/}
      </Drawer>
      <Button onClick={open} color='violet' radius='md' size='sm' style={{ padding: '0 10px' }}>
        <IconMenu2 size={24} />
      </Button>
    </>
  );
};
