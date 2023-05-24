import {
  createStyles,
  Header,
  Group,
  Container,
  rem,
  Anchor,
  Button,
  ActionIcon,
  Menu,
  Modal,
  useMantineTheme,
  TextInput,
  Space,
  LoadingOverlay,
} from '@mantine/core';
import {
  IconAlarm,
  IconChartBar,
  IconChartLine,
  IconChevronDown,
  IconDeviceMobileShare,
  IconList,
  IconNetwork,
  IconNotes,
  IconOlympics,
} from '@tabler/icons-react';
import { useI18n } from '../hooks/i18n';
import { useContext, useState } from 'react';
import { useLocation } from 'wouter';
import { globalsCtx } from '../hooks/globals';
import * as React from 'react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { EventType } from '../clients/proto/atoms.pb';
import { useApi } from '../hooks/api';

const HEADER_HEIGHT = rem(60);

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: 'filled',
      color: theme.primaryColor,
    }).background,
    borderBottom: 0,
    zIndex: 10000,
  },

  inner: {
    height: rem(56),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background!,
        0.1
      ),
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

export function AppHeader() {
  const { classes } = useStyles();
  const i18n = useI18n();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const globals = useContext(globalsCtx);

  // Online add replay related
  const [onlineModalOpened, { open: openOnlineModal, close: closeOnlineModal }] =
    useDisclosure(false);
  const [onlineLink, setOnlineLink] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const api = useApi();
  const tryAddOnline = () => {
    if (!onlineLink.match(/^https?:\/\/[^\/]+\/0\/\?log=\d+gm-\d+-\d+-[0-9a-f]+$/i)) {
      setOnlineError(i18n._t('Replay link is invalid. Please check if you copied it correctly'));
    } else {
      setOnlineError(null);
      setOnlineLoading(true);
      if (globals.data.eventId) {
        api
          .addOnlineGame(globals.data.eventId, onlineLink)
          .then(() => {
            setOnlineLoading(false);
            window.location.href = `/event/${globals.data.eventId}/games`;
          })
          .catch((e) => {
            setOnlineLoading(false);
            setOnlineError(e.message);
          });
      }
    }
  };

  return (
    <Header height={HEADER_HEIGHT} className={classes.header} mb={120}>
      <Container>
        <div className={classes.inner}>
          <Group>
            <Anchor
              href={`/`}
              onClick={(e) => {
                navigate(`/`);
                e.preventDefault();
              }}
            >
              {largeScreen ? (
                <Button
                  className={classes.link}
                  leftIcon={<IconList size={20} />}
                  title={i18n._t('To events list')}
                >
                  {i18n._t('Events list')}
                </Button>
              ) : (
                <ActionIcon
                  title={i18n._t('To events list')}
                  variant='filled'
                  color='green'
                  size='lg'
                >
                  <IconList size='1.5rem' />
                </ActionIcon>
              )}
            </Anchor>
            <Anchor href={import.meta.env.VITE_TYR_URL} target='_blank'>
              {largeScreen ? (
                <Button
                  className={classes.link}
                  leftIcon={<IconDeviceMobileShare size={20} />}
                  title={i18n._t('Open assitant')}
                >
                  {i18n._t('Open assistant')}
                </Button>
              ) : (
                <ActionIcon
                  title={i18n._t('Open assistant')}
                  variant='filled'
                  color='orange'
                  size='lg'
                >
                  <IconDeviceMobileShare size='1.5rem' />
                </ActionIcon>
              )}
            </Anchor>
          </Group>

          {globals.data.eventId && (
            <Group spacing={5}>
              <Menu shadow='md'>
                <Menu.Target>
                  <Button
                    className={classes.link}
                    leftIcon={<IconChevronDown size={20} />}
                    title={i18n._t('Event contents')}
                  >
                    {i18n._t('Event contents')}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={(e) => {
                      navigate(`/event/${globals.data.eventId}`);
                      e.preventDefault();
                    }}
                    icon={<IconNotes size={24} />}
                  >
                    {i18n._pt('Event menu', 'Description')}
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      navigate(`/event/${globals.data.eventId}/games`);
                      e.preventDefault();
                    }}
                    icon={<IconOlympics size={24} />}
                  >
                    {i18n._pt('Event menu', 'Recent games')}
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      navigate(`/event/${globals.data.eventId}/order/rating`);
                      e.preventDefault();
                    }}
                    icon={<IconChartBar size={24} />}
                  >
                    {i18n._pt('Event menu', 'Rating table')}
                  </Menu.Item>
                  {globals.data.hasSeries && (
                    <Menu.Item
                      onClick={(e) => {
                        navigate(`/event/${globals.data.eventId}/seriesRating`);
                        e.preventDefault();
                      }}
                      icon={<IconChartLine size={24} />}
                    >
                      {i18n._pt('Event menu', 'Series rating')}
                    </Menu.Item>
                  )}
                  {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT && (
                    <Menu.Item
                      onClick={(e) => {
                        navigate(`/event/${globals.data.eventId}/timer`);
                        e.preventDefault();
                      }}
                      icon={<IconAlarm size={24} />}
                    >
                      {i18n._pt('Event menu', 'Timer & seating')}
                    </Menu.Item>
                  )}
                  {globals.data.type === EventType.EVENT_TYPE_ONLINE && (
                    <Menu.Item
                      onClick={(e) => {
                        openOnlineModal();
                        e.preventDefault();
                      }}
                      icon={<IconNetwork size={24} />}
                    >
                      {i18n._pt('Event menu', 'Add online game')}
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
        </div>
        <Modal
          opened={onlineModalOpened}
          onClose={closeOnlineModal}
          overlayProps={{
            color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
            opacity: 0.55,
            blur: 3,
          }}
          title={i18n._t('Add online game')}
          centered
        >
          <LoadingOverlay visible={onlineLoading} />
          <TextInput
            placeholder='http://tenhou.net/0/?log=XXXXXXXXXXgm-XXXX-XXXXX-XXXXXXXX'
            label={'Enter replay URL'}
            error={onlineError}
            value={onlineLink}
            onChange={(event) => setOnlineLink(event.currentTarget.value)}
            withAsterisk
          />
          <Space h='md' />
          <Group position='right'>
            <Button onClick={tryAddOnline}>{i18n._t('Add replay')}</Button>
          </Group>
        </Modal>
      </Container>
    </Header>
  );
}
