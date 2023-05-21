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
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconChartBar,
  IconChevronDown,
  IconDeviceMobileShare,
  IconList,
  IconOlympics,
} from '@tabler/icons-react';
import { useI18n } from './hooks/i18n';
import { useContext } from 'react';
import { useLocation } from 'wouter';
import { globalsCtx } from './hooks/globals';
import * as React from 'react';

const HEADER_HEIGHT = rem(60);

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: 'filled',
      color: theme.primaryColor,
    }).background,
    borderBottom: 0,
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
  const globals = useContext(globalsCtx);

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

          {globals.eventId && (
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
                      navigate(`/event/${globals.eventId}/games`);
                      e.preventDefault();
                    }}
                    icon={<IconOlympics size={24} />}
                  >
                    {i18n._t('Recent games')}
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      navigate(`/event/${globals.eventId}/order/rating`);
                      e.preventDefault();
                    }}
                    icon={<IconChartBar size={24} />}
                  >
                    {i18n._t('Rating table')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
        </div>
      </Container>
    </Header>
  );
}
