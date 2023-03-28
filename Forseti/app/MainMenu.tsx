import { ActionIcon, Drawer, NavLink } from '@mantine/core';
import * as React from 'react';
import { IconLogin, IconMenu2, IconUserCircle, IconUserPlus } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useI18n } from '#/hooks/i18n';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '#/hooks/auth';

export const MainMenu: React.FC = () => {
  const i18n = useI18n();
  const { isLoggedIn } = useAuth();
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
        {!isLoggedIn && (
          <>
            <Link to='profile/login' onClick={close}>
              <NavLink icon={<IconLogin size={18} />} label={i18n._t('Sign in')} />
            </Link>
            <Link to='profile/signup' onClick={close}>
              <NavLink icon={<IconUserPlus size={18} />} label={i18n._t('Sign up')} />
            </Link>
          </>
        )}
        {!!isLoggedIn && (
          <>
            <Link to='profile/manage' onClick={close}>
              <NavLink icon={<IconUserCircle size={18} />} label={i18n._t('My profile')} />
            </Link>
          </>
        )}
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
      <ActionIcon variant='filled' onClick={open} color='violet' radius='md' size='lg'>
        <IconMenu2 size={20} />
      </ActionIcon>
    </>
  );
};
