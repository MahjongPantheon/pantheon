import { Box, LoadingOverlay, NavLink, Space, Text } from '@mantine/core';
import * as React from 'react';
import {
  IconAlertOctagon,
  IconFriends,
  IconLogin,
  IconLogout,
  IconOlympics,
  IconScript,
  IconTimelineEventText,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { Link, useRoute } from 'wouter';
import { useI18n } from '#/hooks/i18n';
import { authCtx } from '#/hooks/auth';
import { useContext, useEffect, useState } from 'react';
import { Event } from './clients/atoms.pb';
import { useApi } from '#/hooks/api';

function NavigationLink(props: {
  to: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const [isActive] = useRoute(props.to);
  if (props.disabled) {
    return null;
  }
  if (isActive) {
    return <NavLink icon={props.icon} label={props.label} active={true} />;
  }
  return (
    <Link to={props.to} onClick={props.onClick}>
      <NavLink icon={props.icon} label={props.label} />
    </Link>
  );
}

export const Navigation: React.FC<{ onClick: () => void; loading: boolean }> = ({
  onClick,
  loading,
}) => {
  const i18n = useI18n();
  const api = useApi();
  const [match, params] = useRoute('/event/:id/:subpath');
  const id = params?.id;
  const [isLoading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<Event | null>(null);

  useEffect(() => {
    if (!match) {
      return;
    }
    setLoading(true);
    api
      .getEventsById([parseInt(id ?? '0', 10)])
      .then((e) => {
        setEventData(e[0]);
      })
      .finally(() => setLoading(false));
  }, [match, id]);

  const { isLoggedIn } = useContext(authCtx);
  return (
    <Box pos='relative' sx={{ height: '100%' }}>
      <LoadingOverlay visible={loading} overlayOpacity={1} />
      {match && (
        <>
          <Text weight='bold'>{eventData?.title}</Text>
          <Space h='lg' />
          <NavigationLink
            to={`event/${params.id}/players`}
            onClick={onClick}
            icon={<IconFriends size={18} />}
            label={i18n._t('Manage players')}
          />
          <NavigationLink
            to={`event/${params.id}/penalties`}
            onClick={onClick}
            icon={<IconAlertOctagon size={18} />}
            label={i18n._t('Penalties')}
          />
          <NavigationLink
            to={`event/${params.id}/games`}
            onClick={onClick}
            icon={<IconOlympics size={18} />}
            label={i18n._t('Games control panel')}
          />
          <NavigationLink
            disabled={isLoading || !eventData?.isPrescripted}
            to={`event/${params.id}/prescript`}
            onClick={onClick}
            icon={<IconScript size={18} />}
            label={i18n._t('Predefined seating')}
          />
          <hr />
        </>
      )}
      <NavigationLink
        disabled={isLoggedIn}
        to='profile/login'
        onClick={onClick}
        icon={<IconLogin size={18} />}
        label={i18n._t('Sign in')}
      />
      <NavigationLink
        disabled={isLoggedIn}
        to='profile/signup'
        onClick={onClick}
        icon={<IconUserPlus size={18} />}
        label={i18n._t('Sign up')}
      />
      <NavigationLink
        disabled={!isLoggedIn}
        to='profile/manage'
        onClick={onClick}
        icon={<IconUserCircle size={18} />}
        label={i18n._t('My profile')}
      />
      <NavigationLink
        disabled={!isLoggedIn}
        to='ownedEvents'
        onClick={onClick}
        icon={<IconTimelineEventText size={18} />}
        label={i18n._t('Manage events')}
      />
      <NavigationLink
        disabled={!isLoggedIn}
        to='profile/logout'
        onClick={onClick}
        icon={<IconLogout size={18} />}
        label={i18n._t('Sign out')}
      />

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
    </Box>
  );
};
